'use strict';

/**
 * Functional Tests: CodeCompass 依存グラフ生成エンジン CLI（#1206）
 *
 * scripts/dependency-graph.js の CLI インターフェース（引数解釈・ファイル出力・
 * topN フィルタリング）を実際のファイルシステムと組み合わせて検証する。
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const SCRIPT_PATH = path.join(ROOT, 'scripts', 'dependency-graph.js');

function buildFixtureRepo() {
  const repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codecompass-depgraph-func-'));

  fs.writeFileSync(path.join(repoDir, 'caller.js'), [
    "const { greet } = require('./callee');",
    'function main() { return greet("World"); }',
    'module.exports = { main };',
  ].join('\n') + '\n');

  fs.writeFileSync(path.join(repoDir, 'callee.js'), [
    'function greet(name) { return `Hello, ${name}!`; }',
    'module.exports = { greet };',
  ].join('\n') + '\n');

  fs.writeFileSync(path.join(repoDir, 'unrelated.js'),
    'const X = 42;\nmodule.exports = { X };\n');

  for (let i = 1; i <= 3; i++) {
    fs.writeFileSync(path.join(repoDir, `low${i}.js`),
      `const val${i} = ${i};\nmodule.exports = { val${i} };\n`);
  }

  return repoDir;
}

function buildHotspotsJson(repoDir) {
  const entries = [
    { file: 'caller.js',    hotspotScore: 1.0, complexity: 2, changes: 10, loc: 3, linesChanged: 30 },
    { file: 'callee.js',    hotspotScore: 0.5, complexity: 1, changes: 5,  loc: 2, linesChanged: 10 },
    { file: 'unrelated.js', hotspotScore: 0.1, complexity: 0, changes: 2,  loc: 2, linesChanged: 4  },
    { file: 'low1.js',      hotspotScore: 0.0, complexity: 0, changes: 1,  loc: 2, linesChanged: 1  },
    { file: 'low2.js',      hotspotScore: 0.0, complexity: 0, changes: 1,  loc: 2, linesChanged: 1  },
    { file: 'low3.js',      hotspotScore: 0.0, complexity: 0, changes: 1,  loc: 2, linesChanged: 1  },
  ];
  const hotspotPath = path.join(repoDir, 'hotspots.json');
  fs.writeFileSync(hotspotPath, JSON.stringify(entries, null, 2));
  return hotspotPath;
}

function runScript(args) {
  return execSync(`node "${SCRIPT_PATH}" ${args}`, { cwd: ROOT, stdio: 'pipe' }).toString();
}

const scriptExists = fs.existsSync(SCRIPT_PATH);

describe('CodeCompass dependency-graph CLI (#1206)', () => {
  it('scripts/dependency-graph.js が存在する', () => {
    expect(scriptExists).toBe(true);
  });

  if (!scriptExists) {
    return;
  }

  let repoDir;
  let hotspotPath;

  beforeAll(() => {
    repoDir = buildFixtureRepo();
    hotspotPath = buildHotspotsJson(repoDir);
  });

  afterAll(() => {
    if (repoDir) fs.rmSync(repoDir, { recursive: true, force: true });
  });

  it('リポジトリパスを指定しない場合は使い方を表示して異常終了する', () => {
    let error;
    try {
      execSync(`node "${SCRIPT_PATH}"`, { cwd: ROOT, stdio: 'pipe' });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.status).not.toBe(0);
    expect(error.stderr.toString()).toMatch(/Usage/i);
  });

  it('--out を指定するとファイルに Mermaid グラフを書き出す', () => {
    const outPath = path.join(repoDir, 'out.mmd');
    runScript(`"${repoDir}" --hotspots="${hotspotPath}" --out="${outPath}"`);

    expect(fs.existsSync(outPath)).toBe(true);
    const content = fs.readFileSync(outPath, 'utf8');
    expect(content.trimStart()).toMatch(/^graph LR/);
  });

  it('caller.js はデフォルト topN（20%）で分析対象に含まれる', () => {
    const outPath = path.join(repoDir, 'out-default.mmd');
    runScript(`"${repoDir}" --hotspots="${hotspotPath}" --out="${outPath}"`);

    const content = fs.readFileSync(outPath, 'utf8');
    expect(content).toContain('caller');
  });

  it('caller.js が callee.js を require している場合、依存エッジが出力される', () => {
    const outPath = path.join(repoDir, 'out-edges.mmd');
    runScript(`"${repoDir}" --hotspots="${hotspotPath}" --topN=2 --out="${outPath}"`);

    const content = fs.readFileSync(outPath, 'utf8');
    expect(content).toContain('caller');
    expect(content).toContain('callee');
    expect(content).toContain('-->');
  });

  it('--topN=1 指定時はゼロスコアファイルがグラフに含まれない', () => {
    const outPath = path.join(repoDir, 'out-topN1.mmd');
    runScript(`"${repoDir}" --hotspots="${hotspotPath}" --topN=1 --out="${outPath}"`);

    const content = fs.readFileSync(outPath, 'utf8');
    expect(content).not.toContain('low1');
    expect(content).not.toContain('low2');
    expect(content).not.toContain('low3');
  });

  it('--out 省略時は標準出力に Mermaid グラフを出力する', () => {
    const stdout = runScript(`"${repoDir}" --hotspots="${hotspotPath}"`);

    expect(stdout.trimStart()).toMatch(/^graph LR/);
  });
});
