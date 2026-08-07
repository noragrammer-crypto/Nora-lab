'use strict';

/**
 * Functional Tests: CodeCompass 変更頻度分析エンジン CLI（#1182）
 *
 * scripts/change-frequency.js の CLI インターフェース（引数解釈・出力先切り替え・
 * エラーハンドリング）を検証する。集計結果そのものの受け入れ条件検証は
 * E2E テスト（#1181 / __tests__/e2e/change-frequency-analysis.e2e.test.js）が担当する。
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const SCRIPT_PATH = path.join(ROOT, 'scripts', 'change-frequency.js');

function git(repoDir, args) {
  return execFileSync('git', args, { cwd: repoDir, stdio: 'pipe' }).toString();
}

function buildSmallFixtureRepo() {
  const repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codecompass-changefreq-cli-'));

  git(repoDir, ['init', '-q', '-b', 'main']);
  git(repoDir, ['config', 'user.email', 'test@example.com']);
  git(repoDir, ['config', 'user.name', 'CodeCompass Functional']);

  fs.writeFileSync(path.join(repoDir, 'only.js'), "const only = 1;\n");
  git(repoDir, ['add', 'only.js']);
  git(repoDir, ['commit', '-q', '-m', 'feat: add only.js']);

  return repoDir;
}

function runCli(args) {
  return execFileSync('node', [SCRIPT_PATH, ...args], { cwd: ROOT, stdio: 'pipe' });
}

const scriptExists = fs.existsSync(SCRIPT_PATH);

describe('CodeCompass change-frequency CLI (#1182)', () => {
  it('scripts/change-frequency.js が存在する', () => {
    expect(scriptExists).toBe(true);
  });

  if (!scriptExists) {
    // 実装タスク (#1182) 完了前は以降のテストをスキップする（RED状態が正しい）
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
    expect(result[0]).toEqual(expect.objectContaining({ file: 'only.js', changes: 1 }));
  });

  it('--out を指定するとファイルに JSON 配列を書き出す', () => {
    const outPath = path.join(repoDir, 'out.json');
    runCli([repoDir, `--out=${outPath}`]);

    const result = JSON.parse(fs.readFileSync(outPath, 'utf8'));
    expect(Array.isArray(result)).toBe(true);
    expect(result.find((e) => e.file === 'only.js')).toBeDefined();
  });

  it('--days オプションを指定してもエラーなく実行できる', () => {
    const stdout = runCli([repoDir, '--days=365']).toString();
    const result = JSON.parse(stdout);

    expect(Array.isArray(result)).toBe(true);
    expect(result.find((e) => e.file === 'only.js')).toBeDefined();
  });
});
