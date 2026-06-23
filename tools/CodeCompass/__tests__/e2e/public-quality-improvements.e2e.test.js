'use strict';

/**
 * E2E Acceptance Tests: Story #1232
 * CodeCompass: public公開向け品質向上（フィルタ改善 + CI サンプル）
 *
 * 受け入れ条件:
 * 1. デフォルト分析で dist/.obsidian 等がランキングに出ない
 * 2. `.codecompassignore` または `--ignore` オプションで除外を追加できる
 * 3. GitHub Actions サンプルが README に掲載されている
 * 4. サンプルワークフローが HolyAutomater リポジトリ自体に配置されている
 *
 * 関連タスク:
 *   #1405 除外フィルタの改善（dist/.obsidian/min.js等 + --ignore オプション）
 *   #1406 GitHub Actions CI サンプル作成（PR時ホットスポット生成）
 *
 * 実装が存在しない現時点では RED が正しい状態。
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const REPO_ROOT = path.resolve(ROOT, '..');
const SCRIPT_PATH = path.join(ROOT, 'scripts', 'hotspot.js');
const WORKFLOW_PATH = path.join(REPO_ROOT, '.github', 'workflows', 'codecompass.yml');
const README_CANDIDATES = [
  path.join(ROOT, 'README.md'),
  path.join(REPO_ROOT, 'README.md'),
];

function git(repoDir, args) {
  return execSync(`git ${args}`, { cwd: repoDir, stdio: 'pipe' }).toString();
}

function writeFile(repoDir, relPath, content) {
  const fullPath = path.join(repoDir, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}

const CONTROL_FLOW_SOURCE = [
  'function run(x) {',
  '  if (x > 0) {',
  '    return x * 2;',
  '  }',
  '  return 0;',
  '}',
  'module.exports = { run };',
].join('\n') + '\n';

/**
 * dist/ ・ .obsidian/ ・ *.min.js ・ vendor/（カスタム除外対象）を含む
 * ノイズ除外検証用の一時 git リポジトリを構築する。
 */
function buildNoiseFixtureRepo() {
  const repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codecompass-noise-'));

  git(repoDir, 'init -q -b main');
  git(repoDir, 'config user.email "test@example.com"');
  git(repoDir, 'config user.name "CodeCompass E2E"');

  writeFile(repoDir, 'src/app.js', CONTROL_FLOW_SOURCE);
  writeFile(repoDir, 'dist/bundle.js', CONTROL_FLOW_SOURCE);
  writeFile(repoDir, 'dist/app.min.js', CONTROL_FLOW_SOURCE);
  writeFile(repoDir, '.obsidian/plugin.js', CONTROL_FLOW_SOURCE);
  writeFile(repoDir, 'vendor/lib.js', CONTROL_FLOW_SOURCE);

  git(repoDir, 'add -A');
  git(repoDir, 'commit -q -m "init: add fixture files"');

  return repoDir;
}

function runHotspot(repoDir, extraArgs = []) {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codecompass-noise-out-'));
  const args = [`"${SCRIPT_PATH}"`, `"${repoDir}"`, `--outDir="${outDir}"`, ...extraArgs].join(' ');
  execSync(`node ${args}`, { cwd: ROOT, stdio: 'pipe' });
  return JSON.parse(fs.readFileSync(path.join(outDir, 'hotspots.json'), 'utf8'));
}

const scriptExists = fs.existsSync(SCRIPT_PATH);

describe('Story #1232: CodeCompass public公開向け品質向上', () => {
  it('scripts/hotspot.js が存在する', () => {
    expect(scriptExists).toBe(true);
  });

  if (!scriptExists) {
    // 実装が存在しない場合は以降のテストをスキップする（RED状態が正しい）
    return;
  }

  describe('受け入れ条件1: デフォルト分析で dist/.obsidian 等がランキングに出ない', () => {
    let repoDir;
    let result;

    beforeAll(() => {
      repoDir = buildNoiseFixtureRepo();
      result = runHotspot(repoDir);
    });

    afterAll(() => {
      if (repoDir) fs.rmSync(repoDir, { recursive: true, force: true });
    });

    it('src/app.js はランキングに含まれる', () => {
      expect(result.some((e) => e.file === 'src/app.js')).toBe(true);
    });

    it('dist/ 配下のファイルはランキングに含まれない', () => {
      expect(result.some((e) => e.file.startsWith('dist/'))).toBe(false);
    });

    it('.obsidian/ 配下のファイルはランキングに含まれない', () => {
      expect(result.some((e) => e.file.startsWith('.obsidian/'))).toBe(false);
    });

    it('*.min.js ファイルはランキングに含まれない', () => {
      expect(result.some((e) => e.file.endsWith('.min.js'))).toBe(false);
    });
  });

  describe('受け入れ条件2: --ignore オプションでユーザー定義の除外パターンを追加できる', () => {
    let repoDir;

    afterEach(() => {
      if (repoDir) fs.rmSync(repoDir, { recursive: true, force: true });
      repoDir = undefined;
    });

    it('--ignore=vendor/ を指定すると vendor/ 配下が除外される', () => {
      repoDir = buildNoiseFixtureRepo();
      const result = runHotspot(repoDir, ['--ignore=vendor/']);
      expect(result.some((e) => e.file.startsWith('vendor/'))).toBe(false);
      expect(result.some((e) => e.file === 'src/app.js')).toBe(true);
    });

    it('--ignore を指定しない場合、vendor/ はデフォルトでは除外されない（カスタム指定の効果のみを確認するための対照）', () => {
      repoDir = buildNoiseFixtureRepo();
      const result = runHotspot(repoDir);
      expect(result.some((e) => e.file.startsWith('vendor/'))).toBe(true);
    });
  });

  describe('受け入れ条件2: .codecompassignore ファイルで除外パターンを定義できる', () => {
    let repoDir;

    afterEach(() => {
      if (repoDir) fs.rmSync(repoDir, { recursive: true, force: true });
      repoDir = undefined;
    });

    it('.codecompassignore に記載したパターンが自動で除外される', () => {
      repoDir = buildNoiseFixtureRepo();
      writeFile(repoDir, '.codecompassignore', 'vendor/\n');
      const result = runHotspot(repoDir);
      expect(result.some((e) => e.file.startsWith('vendor/'))).toBe(false);
      expect(result.some((e) => e.file === 'src/app.js')).toBe(true);
    });
  });

  describe('受け入れ条件3: GitHub Actions サンプルが README に掲載されている', () => {
    it('README（CodeCompass配下またはリポジトリルート）が存在する', () => {
      const existing = README_CANDIDATES.filter((p) => fs.existsSync(p));
      expect(existing.length).toBeGreaterThan(0);
    });

    it('README に GitHub Actions ワークフローの利用方法が記載されている', () => {
      const existing = README_CANDIDATES.filter((p) => fs.existsSync(p));
      const mentionsWorkflow = existing.some((p) => {
        const content = fs.readFileSync(p, 'utf8');
        return content.includes('codecompass.yml') || content.includes('GitHub Actions');
      });
      expect(mentionsWorkflow).toBe(true);
    });
  });

  describe('受け入れ条件4: サンプルワークフローが HolyAutomater リポジトリ自体に配置されている', () => {
    it('.github/workflows/codecompass.yml が存在する', () => {
      expect(fs.existsSync(WORKFLOW_PATH)).toBe(true);
    });

    it('ワークフローが pull_request トリガーで hotspot.js を実行する', () => {
      const content = fs.readFileSync(WORKFLOW_PATH, 'utf8');
      expect(content).toMatch(/pull_request/);
      expect(content).toMatch(/hotspot\.js/);
    });
  });
});
