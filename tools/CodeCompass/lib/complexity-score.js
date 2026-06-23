'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const acorn = require('acorn');
const { isExcluded } = require('./exclude-patterns');

const TARGET_EXTENSIONS = new Set(['.js', '.py']);
const SKIP_DIRECTORIES = new Set(['.git', 'node_modules']);

const JS_COMPLEXITY_TYPES = new Set([
  'IfStatement',
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'DoWhileStatement',
  'SwitchStatement',
]);

// 標準 `ast` モジュールで Python の制御フロー（if/for/while/switch相当=match）を数える。
// ファイルごとに python3 を起動するコストを避けるため、対象ファイル一覧をまとめて渡し
// 1プロセスで処理する。
const PYTHON_COMPLEXITY_COUNTER = `
import ast, json, sys

COMPLEXITY_NODES = {'If', 'For', 'AsyncFor', 'While', 'Match'}

def count(tree):
    return sum(1 for node in ast.walk(tree) if type(node).__name__ in COMPLEXITY_NODES)

paths = json.loads(sys.stdin.read())
result = {}
for p in paths:
    with open(p, encoding='utf-8') as f:
        source = f.read()
    result[p] = count(ast.parse(source, filename=p))
sys.stdout.write(json.dumps(result))
`;

/**
 * 行数（LOC）を数える。末尾改行は1行として数えない。
 */
function countLines(source) {
  if (source.length === 0) return 0;

  const lines = source.split('\n');
  if (lines[lines.length - 1] === '') lines.pop();

  return lines.length;
}

/**
 * ESTree 形式の AST を再帰的に走査し、ノードごとに visit を呼び出す。
 */
function walkAst(node, visit) {
  if (!node || typeof node !== 'object' || typeof node.type !== 'string') return;

  visit(node);

  for (const key of Object.keys(node)) {
    if (key === 'type') continue;

    const value = node[key];
    if (Array.isArray(value)) {
      for (const item of value) walkAst(item, visit);
    } else {
      walkAst(value, visit);
    }
  }
}

/**
 * JS ソースを Acorn で AST 解析し、制御フロー文（if/for/while/switch等）の出現数を数える。
 * else節・case/default節は専用ノードを持たない（IfStatement.alternate / SwitchCase）ため
 * 二重カウントされない。
 */
function countJsComplexity(source) {
  const ast = acorn.parse(source, { ecmaVersion: 'latest', sourceType: 'module' });
  let count = 0;

  walkAst(ast, (node) => {
    if (JS_COMPLEXITY_TYPES.has(node.type)) count += 1;
  });

  return count;
}

/**
 * 複数の Python ファイルの複雑度を一括算出する。
 * @param {string[]} absolutePaths
 * @returns {Map<string, number>} 絶対パス → 複雑度のマップ
 */
function countPythonComplexities(absolutePaths) {
  if (absolutePaths.length === 0) return new Map();

  const raw = execFileSync('python3', ['-c', PYTHON_COMPLEXITY_COUNTER], {
    input: JSON.stringify(absolutePaths),
    encoding: 'utf8',
  });

  return new Map(Object.entries(JSON.parse(raw)));
}

/**
 * repoPath 配下の対象拡張子（.js / .py）ファイルを再帰的に列挙する（絶対パス）。
 * `.git` / `node_modules` は常に走査対象から除外する。
 * 加えて excludePatterns に一致するファイル・ディレクトリも除外する。
 */
function collectTargetFiles(repoPath, excludePatterns = []) {
  const files = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const absolutePath = path.join(dir, entry.name);
      const relativePath = toRelativePosixPath(repoPath, absolutePath);
      if (isExcluded(relativePath, excludePatterns)) continue;

      if (entry.isDirectory()) {
        if (!SKIP_DIRECTORIES.has(entry.name)) walk(absolutePath);
      } else if (entry.isFile() && TARGET_EXTENSIONS.has(path.extname(entry.name))) {
        files.push(absolutePath);
      }
    }
  }

  walk(repoPath);
  return files;
}

function toRelativePosixPath(repoPath, absolutePath) {
  return path.relative(repoPath, absolutePath).split(path.sep).join('/');
}

/**
 * 指定リポジトリ配下の JS/Python ファイルの複雑度スコアと LOC を算出する。
 * @param {{ repoPath: string, excludePatterns?: string[] }} options
 * @returns {{ file: string, complexity: number, loc: number }[]}
 */
function analyzeComplexity({ repoPath, excludePatterns = [] }) {
  const absolutePaths = collectTargetFiles(repoPath, excludePatterns);
  const pythonPaths = absolutePaths.filter((absolutePath) => path.extname(absolutePath) === '.py');
  const pythonComplexities = countPythonComplexities(pythonPaths);

  return absolutePaths.map((absolutePath) => {
    const source = fs.readFileSync(absolutePath, 'utf8');
    const isPython = path.extname(absolutePath) === '.py';

    return {
      file: toRelativePosixPath(repoPath, absolutePath),
      complexity: isPython ? pythonComplexities.get(absolutePath) : countJsComplexity(source),
      loc: countLines(source),
    };
  });
}

module.exports = {
  countLines,
  walkAst,
  countJsComplexity,
  countPythonComplexities,
  analyzeComplexity,
};
