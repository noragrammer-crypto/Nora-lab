'use strict';

/**
 * Functional Tests: CodeCompass ホットスポット判定エンジン CLI（#1198）
 *
 * scripts/hotspot.js の CLI インターフェース（引数解釈・出力先切り替え・
 * エラーハンドリング）を検証する。
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const SCRIPT_PATH = path.join(ROOT, 'scripts', 'hotspot.js');

function git(repoDir, args) {
  return execFileSync('git', args, { cwd: repoDir, stdio: 'pipe' }).toString();
}

function buildSmallFixtureRepo() {
  const repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codecompass-hotspot-cli-'));

  git(repoDir, ['init', '-q', '-b', 'main']);
  git(repoDir, ['config', 'user.email', 'test@example.com']);
  git(repoDir, ['config', 'user.name', 'CodeCompass Hotspot']);

  const content = 'function foo(x) {\n  if (x > 0) {\n    return x * 2;\n  }\n  return 0;\n}\n';
  fs.writeFileSync(path.join(repoDir, 'main.js'), content);
  git(repoDir, ['add', 'main.js']);
  git(repoDir, ['commit', '-q', '-m', 'feat: add main.js']);

  fs.writeFileSync(path.join(repoDir, 'main.js'), content + '\n// updated\n');
  git(repoDir, ['add', 'main.js']);
  git(repoDir, ['commit', '-q', '-m', 'fix: update main.js']);

  return repoDir;
}

function runCli(args) {
  return execFileSync('node', [SCRIPT_PATH, ...args], { cwd: ROOT, stdio: 'pipe' });
}

const scriptExists = fs.existsSync(SCRIPT_PATH);

describe('CodeCompass hotspot CLI (#1198)', () => {
  it('scripts/hotspot.js が存在する', () => {
    expect(scriptExists).toBe(true);
  });

  if (!scriptExists) {
    return;
  }

  let repoDir;

  beforeAll(() => {
    repoDir = buildSmallFixtureRepo();
  });

  afterAll(() => {
    if (repoDir) fs.rmSync(repoDir, { recursive: true, force: true });
  });

  it('リポジトリパスを指定しない場合は使い方を表示して異常終了する', () => {
    let error;
    try {
      runCli([]);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.status).not.toBe(0);
    expect(error.stderr.toString()).toMatch(/Usage/i);
  });

  it('--out を指定しない場合は標準出力に JSON 配列を書き出す', () => {
    const stdout = runCli([repoDir]).toString();
    const result = JSON.parse(stdout);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toEqual(expect.objectContaining({
      file: expect.any(String),
      hotspotScore: expect.any(Number),
      complexity: expect.any(Number),
      changes: expect.any(Number),
      loc: expect.any(Number),
      linesChanged: expect.any(Number),
    }));
  });

  it('--out を指定するとファイルに JSON 配列を書き出す', () => {
    const outJson = path.join(repoDir, 'hotspots.json');
    runCli([repoDir, `--out=${outJson}`]);

    const result = JSON.parse(fs.readFileSync(outJson, 'utf8'));
    expect(Array.isArray(result)).toBe(true);
    expect(result.find((e) => e.file === 'main.js')).toBeDefined();
  });

  it('--days オプションを指定してもエラーなく実行できる', () => {
    const stdout = runCli([repoDir, '--days=365']).toString();
    const result = JSON.parse(stdout);

    expect(Array.isArray(result)).toBe(true);
  });

  it('--md を指定すると Markdown テーブルをファイルに書き出す', () => {
    const outMd = path.join(repoDir, 'hotspots.md');
    runCli([repoDir, `--md=${outMd}`]);

    const content = fs.readFileSync(outMd, 'utf8');
    expect(content).toMatch(/hotspotScore/i);
    expect(content).toMatch(/main\.js/);
  });

  it('変更頻度の高いファイルが配列の先頭に来る（スコア降順）', () => {
    const stdout = runCli([repoDir]).toString();
    const result = JSON.parse(stdout);

    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].hotspotScore).toBeGreaterThanOrEqual(result[i + 1].hotspotScore);
    }
  });
});
