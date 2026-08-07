'use strict';

/**
 * Functional Tests: CodeCompass 複雑度スコアリングエンジン CLI（#1185）
 *
 * scripts/complexity-score.js の CLI インターフェース（引数解釈・出力先切り替え・
 * エラーハンドリング）を検証する。スコア算出そのものの受け入れ条件検証は
 * E2E テスト（#1184 / __tests__/e2e/complexity-score.e2e.test.js）が担当する。
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const SCRIPT_PATH = path.join(ROOT, 'scripts', 'complexity-score.js');

function buildSmallFixtureRepo() {
  const repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codecompass-complexity-cli-'));
  fs.writeFileSync(
    path.join(repoDir, 'only.js'),
    ['function f(x) {', '  if (x) { return 1; }', '  return 0;', '}'].join('\n') + '\n'
  );
  return repoDir;
}

function runCli(args) {
  return execFileSync('node', [SCRIPT_PATH, ...args], { cwd: ROOT, stdio: 'pipe' });
}

const scriptExists = fs.existsSync(SCRIPT_PATH);

describe('CodeCompass complexity-score CLI (#1185)', () => {
  it('scripts/complexity-score.js が存在する', () => {
    expect(scriptExists).toBe(true);
  });

  if (!scriptExists) {
    // 実装タスク (#1185) 完了前は以降のテストをスキップする（RED状態が正しい）
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

  it('--out を指定しない場合は標準出力に { file, complexity, loc } の JSON 配列を書き出す', () => {
    const stdout = runCli([repoDir]).toString();
    const result = JSON.parse(stdout);

    expect(Array.isArray(result)).toBe(true);
    expect(result.find((e) => e.file === 'only.js')).toEqual(
      expect.objectContaining({ file: 'only.js', complexity: 1, loc: 4 })
    );
  });

  it('--out を指定するとファイルに JSON 配列を書き出す', () => {
    const outPath = path.join(repoDir, 'out.json');
    runCli([repoDir, `--out=${outPath}`]);

    const result = JSON.parse(fs.readFileSync(outPath, 'utf8'));
    expect(Array.isArray(result)).toBe(true);
    expect(result.find((e) => e.file === 'only.js')).toBeDefined();
  });
});
