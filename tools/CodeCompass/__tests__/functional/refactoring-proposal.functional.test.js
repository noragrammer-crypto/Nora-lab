'use strict';

/**
 * Functional Tests: CodeCompass リファクタリング提案エンジン CLI（#1216）
 *
 * scripts/refactoring-proposal.js の CLI インターフェース（引数解釈・出力先切り替え・
 * エラーハンドリング）を検証する。
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const SCRIPT_PATH = path.join(ROOT, 'scripts', 'refactoring-proposal.js');

const SAMPLE_HOTSPOTS = [
  { file: 'a.js', hotspotScore: 1.5, complexity: 30, changes: 50, loc: 200, linesChanged: 400 },
  { file: 'b.js', hotspotScore: 0.8, complexity: 20, changes: 20, loc: 100, linesChanged: 200 },
];

const SAMPLE_MMD = `graph LR
  "a.js" -->|calls| "b.js"
`;

function runCli(args) {
  return execFileSync('node', [SCRIPT_PATH, ...args], { cwd: ROOT, stdio: 'pipe' });
}

const scriptExists = fs.existsSync(SCRIPT_PATH);

describe('CodeCompass refactoring-proposal CLI (#1216)', () => {
  it('scripts/refactoring-proposal.js が存在する', () => {
    expect(scriptExists).toBe(true);
  });

  if (!scriptExists) return;

  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codecompass-refprop-'));
  });

  afterEach(() => {
    if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('--hotspots と --graph を指定して実行できる', () => {
    const hotspotsPath = path.join(tmpDir, 'hotspots.json');
    const graphPath = path.join(tmpDir, 'dependency-graph.mmd');

    fs.writeFileSync(hotspotsPath, JSON.stringify(SAMPLE_HOTSPOTS));
    fs.writeFileSync(graphPath, SAMPLE_MMD);

    expect(() => {
      runCli([`--hotspots=${hotspotsPath}`, `--graph=${graphPath}`]);
    }).not.toThrow();
  });

  it('--out を指定するとファイルに Markdown を書き出す', () => {
    const hotspotsPath = path.join(tmpDir, 'hotspots.json');
    const graphPath = path.join(tmpDir, 'dependency-graph.mmd');
    const outPath = path.join(tmpDir, 'actions.md');

    fs.writeFileSync(hotspotsPath, JSON.stringify(SAMPLE_HOTSPOTS));
    fs.writeFileSync(graphPath, SAMPLE_MMD);

    runCli([`--hotspots=${hotspotsPath}`, `--graph=${graphPath}`, `--out=${outPath}`]);

    expect(fs.existsSync(outPath)).toBe(true);
    const content = fs.readFileSync(outPath, 'utf8');
    expect(content.length).toBeGreaterThan(0);
    expect(content).toContain('a.js');
  });

  it('--out を指定しない場合は標準出力に Markdown を書き出す', () => {
    const hotspotsPath = path.join(tmpDir, 'hotspots.json');
    const graphPath = path.join(tmpDir, 'dependency-graph.mmd');

    fs.writeFileSync(hotspotsPath, JSON.stringify(SAMPLE_HOTSPOTS));
    fs.writeFileSync(graphPath, SAMPLE_MMD);

    const stdout = runCli([`--hotspots=${hotspotsPath}`, `--graph=${graphPath}`]).toString();
    expect(stdout.length).toBeGreaterThan(0);
    expect(stdout).toContain('a.js');
  });

  it('hotspots ファイルが存在しない場合はエラーで終了する', () => {
    const graphPath = path.join(tmpDir, 'dependency-graph.mmd');
    fs.writeFileSync(graphPath, SAMPLE_MMD);

    let error;
    try {
      runCli([`--hotspots=${path.join(tmpDir, 'nonexistent.json')}`, `--graph=${graphPath}`]);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.status).not.toBe(0);
  });

  it('--hotspots を指定しない場合は Usage を表示して異常終了する', () => {
    let error;
    try {
      runCli([]);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.status).not.toBe(0);
    const output = (error.stderr || error.stdout || Buffer.alloc(0)).toString();
    expect(output).toMatch(/usage|hotspots/i);
  });

  it('出力 Markdown にファイルパスとメトリクスが含まれる', () => {
    const hotspotsPath = path.join(tmpDir, 'hotspots.json');
    const graphPath = path.join(tmpDir, 'dependency-graph.mmd');

    fs.writeFileSync(hotspotsPath, JSON.stringify(SAMPLE_HOTSPOTS));
    fs.writeFileSync(graphPath, SAMPLE_MMD);

    const stdout = runCli([`--hotspots=${hotspotsPath}`, `--graph=${graphPath}`]).toString();

    expect(stdout).toContain('a.js');
    expect(stdout).toContain('b.js');
    expect(stdout).toMatch(/1\.5|1.50/);
  });
});
