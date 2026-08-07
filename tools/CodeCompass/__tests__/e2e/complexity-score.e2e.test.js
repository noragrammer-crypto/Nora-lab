'use strict';

/**
 * E2E Acceptance Tests: Story #1177
 * CodeCompass: 複雑度スコアリングエンジン（AST解析）
 *
 * 受け入れ条件:
 * 1. JS ファイルの制御フロー（if/for/while/switch等）をAST解析でカウントし複雑度スコアを算出できる
 * 2. Python ファイルも同様に複雑度スコアを算出できる
 * 3. ファイルごとの LOC（行数）も合わせて取得できる
 * 4. 複雑度スコア + LOC を構造化データ（JSON）として出力できる
 *
 * スクリプトの想定インターフェース（実装タスク #1185 が満たすべき契約）:
 *   node CodeCompass/scripts/complexity-score.js <repoPath> [--out=<path>]
 *
 *   - 指定したリポジトリパス配下の .js / .py ファイルを再帰的に走査する
 *   - 標準出力 または --out 指定先に、以下の形式の JSON 配列を出力する:
 *     [
 *       { "file": "src/foo.js", "complexity": 4, "loc": 18 },
 *       ...
 *     ]
 *   - file: リポジトリルートからの相対パス（'/' 区切り）
 *   - complexity: 制御フロー文（if / for / while / switch）の出現数の合計
 *     （else / case / default 等の派生節は二重カウントしない）
 *   - loc: ファイルの行数
 *
 * 実装が存在しない現時点では RED が正しい状態。
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const SCRIPT_PATH = path.join(ROOT, 'scripts', 'complexity-score.js');

function writeFile(repoDir, relPath, lines) {
  const fullPath = path.join(repoDir, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, lines.join('\n') + '\n');
}

/**
 * 複雑度・LOC が既知の固定ファイル群を持つ一時リポジトリを構築する。
 *
 * - low-complexity.js   : 制御フロー0個 / 5行
 * - low_complexity.py   : 制御フロー0個 / 2行
 * - src/high-complexity.js : if/for/while/if の4個 / 18行
 * - src/high_complexity.py : if/for/while/if の4個 / 13行
 * - README.md           : 対象外拡張子（カウントされないことを確認する）
 *
 * else-if チェーンや switch/case は数え方の解釈揺れを避けるため固定ファイルには含めない。
 */
function buildFixtureRepo() {
  const repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codecompass-complexity-'));

  writeFile(repoDir, 'low-complexity.js', [
    'function greet(name) {',
    '  return `Hello, ${name}!`;',
    '}',
    '',
    'module.exports = { greet };',
  ]);

  writeFile(repoDir, 'low_complexity.py', [
    'def greet(name):',
    '    return f"Hello, {name}!"',
  ]);

  writeFile(repoDir, 'src/high-complexity.js', [
    'function process(items) {',
    '  for (let i = 0; i < items.length; i++) {',
    '    if (items[i] > 0) {',
    '      console.log(items[i]);',
    '    }',
    '  }',
    '',
    '  let total = 0;',
    '  while (total < 100) {',
    '    total += 10;',
    '  }',
    '',
    '  if (items.length === 0) {',
    '    return null;',
    '  }',
    '',
    '  return total;',
    '}',
  ]);

  writeFile(repoDir, 'src/high_complexity.py', [
    'def process(items):',
    '    for item in items:',
    '        if item > 0:',
    '            print(item)',
    '',
    '    total = 0',
    '    while total < 100:',
    '        total += 10',
    '',
    '    if not items:',
    '        return None',
    '',
    '    return total',
  ]);

  writeFile(repoDir, 'README.md', [
    '# Fixture repo',
    '',
    'if this looked like code it would be wrong to count it.',
  ]);

  return repoDir;
}

function runScript(args) {
  return execSync(`node "${SCRIPT_PATH}" ${args}`, { cwd: ROOT, stdio: 'pipe' }).toString();
}

const scriptExists = fs.existsSync(SCRIPT_PATH);

describe('Story #1177: 複雑度スコアリングエンジン（AST解析）', () => {
  it('scripts/complexity-score.js が存在する', () => {
    expect(scriptExists).toBe(true);
  });

  if (!scriptExists) {
    // 実装タスク (#1185) 完了前は以降のテストをスキップする（RED状態が正しい）
    return;
  }

  let repoDir;
  let outPath;
  let result;
  let byFile;

  beforeAll(() => {
    repoDir = buildFixtureRepo();
    outPath = path.join(repoDir, 'complexity-score.json');

    runScript(`"${repoDir}" --out="${outPath}"`);
    result = JSON.parse(fs.readFileSync(outPath, 'utf8'));
    byFile = Object.fromEntries(result.map((entry) => [entry.file, entry]));
  });

  afterAll(() => {
    if (repoDir) fs.rmSync(repoDir, { recursive: true, force: true });
  });

  describe('受け入れ条件1: JS ファイルの制御フローを AST 解析でカウントし複雑度スコアを算出できる', () => {
    it('制御フローを含まない JS ファイルの複雑度は 0 になる', () => {
      const entry = byFile['low-complexity.js'];
      expect(entry).toBeDefined();
      expect(entry.complexity).toBe(0);
    });

    it('if/for/while を含む JS ファイルの複雑度は出現数の合計と一致する', () => {
      const entry = byFile['src/high-complexity.js'];
      expect(entry).toBeDefined();
      expect(entry.complexity).toBe(4); // for(1) + if(1) + while(1) + if(1)
    });
  });

  describe('受け入れ条件2: Python ファイルも同様に複雑度スコアを算出できる', () => {
    it('制御フローを含まない Python ファイルの複雑度は 0 になる', () => {
      const entry = byFile['low_complexity.py'];
      expect(entry).toBeDefined();
      expect(entry.complexity).toBe(0);
    });

    it('for/if/while を含む Python ファイルの複雑度は出現数の合計と一致する', () => {
      const entry = byFile['src/high_complexity.py'];
      expect(entry).toBeDefined();
      expect(entry.complexity).toBe(4); // for(1) + if(1) + while(1) + if(1)
    });
  });

  describe('受け入れ条件3: ファイルごとの LOC（行数）も合わせて取得できる', () => {
    it('各エントリが file・complexity・loc のフィールドを持つ', () => {
      for (const entry of result) {
        expect(typeof entry.file).toBe('string');
        expect(typeof entry.complexity).toBe('number');
        expect(typeof entry.loc).toBe('number');
      }
    });

    it('LOC はファイルの実際の行数と一致する', () => {
      expect(byFile['low-complexity.js'].loc).toBe(5);
      expect(byFile['low_complexity.py'].loc).toBe(2);
      expect(byFile['src/high-complexity.js'].loc).toBe(18);
      expect(byFile['src/high_complexity.py'].loc).toBe(13);
    });
  });

  describe('受け入れ条件4: 複雑度スコア + LOC を構造化データ（JSON）として出力できる', () => {
    it('指定したリポジトリパスに対して正常終了し、出力ファイルを生成する', () => {
      expect(fs.existsSync(outPath)).toBe(true);
    });

    it('出力は JSON として解釈できる配列であり、対象拡張子(.js/.py)のファイルのみ含む', () => {
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(4);
      expect(byFile['README.md']).toBeUndefined();
    });

    it('サブディレクトリ配下のファイルもリポジトリルートからの相対パスで含まれる', () => {
      expect(byFile['src/high-complexity.js']).toBeDefined();
      expect(byFile['src/high_complexity.py']).toBeDefined();
    });
  });
});
