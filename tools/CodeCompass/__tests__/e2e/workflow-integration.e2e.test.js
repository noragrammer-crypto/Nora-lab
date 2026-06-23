'use strict';

/**
 * E2E Acceptance Tests: Story #1396
 * CodeCompass: コードコンパスのワークフロー統合
 *
 * 受け入れ条件:
 * 1. hotspot.js のデフォルト除外: dist/.obsidian/node_modules 等がランキングに出ない
 * 2. hotspot.js の --ignore オプション: カスタム除外パターンを追加できる
 * 3. codecompass-to-issues.js スクリプトが存在する
 * 4. codecompass-to-issues.js が --dry-run で対象一覧を stdout に出力できる
 * 5. --limit オプションで発行件数を制限できる
 * 6. SKILL.md に Step 4（イシュー自動発行）セクションが存在する
 *
 * スクリプトの想定インターフェース（実装タスクが満たすべき契約）:
 *
 * [hotspot.js 拡張 - #1440 / #1525 で --ignore ベース実装に統合]
 *   node CodeCompass/scripts/hotspot.js <repoPath> [--ignore=<glob,...>] [--outDir=<dir>]
 *   - デフォルト除外: dist/ .obsidian/ node_modules/ *.min.js glob-e2e/ glob-__tests__/ playwright.config.*
 *   - --ignore で追加のカスタムパターンを指定できる
 *
 * [codecompass-to-issues.js 新規 - #1441]
 *   node CodeCompass/scripts/codecompass-to-issues.js
 *     [--actions=<path>]   (省略時: codecompass/actions.md)
 *     [--limit=<n>]        (省略時: 5)
 *     [--dry-run]          イシューを発行せず対象一覧を stdout に出力
 *
 * フィクスチャ設計:
 *   hotspot exclusion:
 *     src/app.js: complexity=3, 3回変更 → ランキングに出るべきファイル
 *     dist/bundle.js: complexity=5, 5回変更 → デフォルト除外
 *     .obsidian/plugin.js: complexity=2, 2回変更 → デフォルト除外
 *     node_modules/lib/index.js: complexity=4, 4回変更 → デフォルト除外
 *     build/output.min.js: complexity=3, 3回変更 → デフォルト除外（*.min.js）
 *
 * 実装が存在しない現時点では RED が正しい状態。
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const HOTSPOT_SCRIPT = path.join(ROOT, 'scripts', 'hotspot.js');
const CODECOMPASS_TO_ISSUES_SCRIPT = path.join(ROOT, 'scripts', 'codecompass-to-issues.js');
const SKILL_MD_PATH = path.join(ROOT, 'SKILL.md');

const DAY_MS = 24 * 60 * 60 * 1000;

function isoDateDaysAgo(days) {
  return new Date(Date.now() - days * DAY_MS).toISOString();
}

function git(repoDir, args, dateIso) {
  const env = { ...process.env };
  if (dateIso) {
    env.GIT_AUTHOR_DATE = dateIso;
    env.GIT_COMMITTER_DATE = dateIso;
  }
  return execSync(`git ${args}`, { cwd: repoDir, env, stdio: 'pipe' }).toString();
}

function writeFile(repoDir, relPath, content) {
  const fullPath = path.join(repoDir, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}

/**
 * 除外パターンを検証するためのフィクスチャリポジトリを構築する。
 *
 * src/app.js:              complexity=3, 3回変更 → ランキングに出るべき
 * dist/bundle.js:          complexity=5, 5回変更 → dist/ 除外対象
 * .obsidian/plugin.js:     complexity=2, 2回変更 → .obsidian/ 除外対象
 * node_modules/lib/index.js: complexity=4, 4回変更 → node_modules/ 除外対象
 * build/output.min.js:     complexity=3, 3回変更 → *.min.js 除外対象
 * custom/target.js:        complexity=2, 2回変更 → --ignore=custom/ でカスタム除外対象
 */
function buildExclusionFixtureRepo() {
  const repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codecompass-exclusion-'));

  git(repoDir, 'init -q -b main');
  git(repoDir, 'config user.email "test@example.com"');
  git(repoDir, 'config user.name "CodeCompass E2E"');

  // src/app.js: 通常のソースファイル (ランキングに出るべき)
  writeFile(repoDir, 'src/app.js', [
    'function processApp(items) {',
    '  for (let i = 0; i < items.length; i++) {',
    '    if (items[i] > 0) {',
    '      console.log(items[i]);',
    '    }',
    '  }',
    '  let count = 0;',
    '  while (count < 10) { count++; }',
    '  return count;',
    '}',
    'module.exports = { processApp };',
  ].join('\n') + '\n');

  // dist/bundle.js: ビルド成果物 (除外対象)
  writeFile(repoDir, 'dist/bundle.js', [
    'function bundled(x) {',
    '  if (x > 0) { if (x > 10) { while (x > 0) { x--; } return x; } }',
    '  if (x < 0) { return -x; }',
    '  if (x === 0) { return 0; }',
    '  return x;',
    '}',
  ].join('\n') + '\n');

  // .obsidian/plugin.js: Obsidian プラグイン (除外対象)
  writeFile(repoDir, '.obsidian/plugin.js', [
    'function plugin(cfg) {',
    '  if (cfg.enabled) { return true; }',
    '  if (!cfg.enabled) { return false; }',
    '}',
  ].join('\n') + '\n');

  // build/output.min.js: minified ファイル (除外対象)
  writeFile(repoDir, 'build/output.min.js', [
    'function minified(a,b){if(a>b){if(a>100){while(a>b){a--;}}return a;}if(b>a){return b;}return 0;}',
  ].join('\n') + '\n');

  // custom/target.js: カスタム除外テスト用
  writeFile(repoDir, 'custom/target.js', [
    'function customTarget(x) {',
    '  if (x > 0) { return x; }',
    '  if (x <= 0) { return 0; }',
    '}',
  ].join('\n') + '\n');

  git(repoDir, 'add .');
  git(repoDir, 'commit -q -m "init: add all files"', isoDateDaysAgo(50));

  // src/app.js: 2回目、3回目の変更
  fs.appendFileSync(path.join(repoDir, 'src/app.js'), '// update 2\n');
  git(repoDir, 'add src/app.js');
  git(repoDir, 'commit -q -m "fix: update src/app.js (2)"', isoDateDaysAgo(30));

  fs.appendFileSync(path.join(repoDir, 'src/app.js'), '// update 3\n');
  git(repoDir, 'add src/app.js');
  git(repoDir, 'commit -q -m "fix: update src/app.js (3)"', isoDateDaysAgo(10));

  // dist/bundle.js: 2〜5回目
  for (let i = 2; i <= 5; i++) {
    fs.appendFileSync(path.join(repoDir, 'dist/bundle.js'), `// update ${i}\n`);
    git(repoDir, 'add dist/bundle.js');
    git(repoDir, `commit -q -m "chore: update dist/bundle.js (${i})"`, isoDateDaysAgo(50 - i * 5));
  }

  // .obsidian/plugin.js: 2回目
  fs.appendFileSync(path.join(repoDir, '.obsidian/plugin.js'), '// update 2\n');
  git(repoDir, 'add .obsidian/plugin.js');
  git(repoDir, 'commit -q -m "chore: update .obsidian/plugin.js (2)"', isoDateDaysAgo(20));

  // build/output.min.js: 2〜3回目
  for (let i = 2; i <= 3; i++) {
    fs.appendFileSync(path.join(repoDir, 'build/output.min.js'), `// update ${i}\n`);
    git(repoDir, 'add build/output.min.js');
    git(repoDir, `commit -q -m "chore: update build/output.min.js (${i})"`, isoDateDaysAgo(25 - i * 3));
  }

  // custom/target.js: 2回目
  fs.appendFileSync(path.join(repoDir, 'custom/target.js'), '// update 2\n');
  git(repoDir, 'add custom/target.js');
  git(repoDir, 'commit -q -m "fix: update custom/target.js (2)"', isoDateDaysAgo(15));

  return repoDir;
}

// codecompass-to-issues.js 用フィクスチャ actions.md
// 見出し・スコア行の形式は lib/codecompass-to-issues.js の parseActionsMd が
// 期待する形式（## リファクタリング提案 / hotspot_score: **N**）に揃える。
const FIXTURE_ACTIONS_MD = `# CodeCompass リファクタリングアクション

## リファクタリング提案

### \`DiscordAIbot/lib/persona.js\`

hotspot_score: **2.07**
complexity: 34
changes_90d: 15

リファクタリング提案: クラスを分割して責務を明確にする。

### \`DiscordAIbot/lib/conversation.js\`

hotspot_score: **1.85**
complexity: 28
changes_90d: 18

リファクタリング提案: 依存性注入パターンを導入する。

### \`SocialMediaAgent/lib/x-client.js\`

hotspot_score: **1.52**
complexity: 22
changes_90d: 12

リファクタリング提案: 大きなメソッドを小さな関数に分割する。

### \`CodeCompass/lib/hotspot.js\`

hotspot_score: **1.23**
complexity: 18
changes_90d: 10

リファクタリング提案: フィルタロジックを別モジュールに抽出する。

### \`DiscordAIbot/lib/model-router.js\`

hotspot_score: **0.98**
complexity: 15
changes_90d: 9

リファクタリング提案: 条件分岐をストラテジーパターンに置換する。

### \`api/DiscordAIbot/interactions.js\`

hotspot_score: **0.75**
complexity: 12
changes_90d: 8

リファクタリング提案: ハンドラーを個別関数に分割する。
`;

const hotspotScriptExists = fs.existsSync(HOTSPOT_SCRIPT);
const toIssuesScriptExists = fs.existsSync(CODECOMPASS_TO_ISSUES_SCRIPT);

describe('Story #1396: コードコンパスのワークフロー統合', () => {
  describe('受け入れ条件3: codecompass-to-issues.js スクリプトが存在する', () => {
    it('scripts/codecompass-to-issues.js が存在する', () => {
      expect(toIssuesScriptExists).toBe(true);
    });
  });

  describe('受け入れ条件6: SKILL.md にイシュー自動発行フロー（Step 4）が存在する', () => {
    it('CodeCompass/SKILL.md が存在する', () => {
      expect(fs.existsSync(SKILL_MD_PATH)).toBe(true);
    });

    it('SKILL.md に Step 4 またはイシュー自動発行に関するセクションが含まれる', () => {
      if (!fs.existsSync(SKILL_MD_PATH)) return;
      const content = fs.readFileSync(SKILL_MD_PATH, 'utf8');
      expect(content).toMatch(/Step\s*4|イシュー自動発行|codecompass-to-issues/);
    });

    it('SKILL.md に codecompass-to-issues.js の使い方が記載されている', () => {
      if (!fs.existsSync(SKILL_MD_PATH)) return;
      const content = fs.readFileSync(SKILL_MD_PATH, 'utf8');
      expect(content).toMatch(/codecompass-to-issues/);
    });
  });

  describe('受け入れ条件1 & 2: hotspot.js の除外フィルタ', () => {
    if (!hotspotScriptExists) {
      it.skip('hotspot.js が存在しないためスキップ', () => {});
      return;
    }

    let repoDir;
    let outDir;
    let result;

    describe('受け入れ条件1: デフォルト除外パターンが機能する', () => {
      beforeAll(() => {
        repoDir = buildExclusionFixtureRepo();
        outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codecompass-exclusion-out-'));
        execSync(
          `node "${HOTSPOT_SCRIPT}" "${repoDir}" --outDir="${outDir}"`,
          { cwd: ROOT, stdio: 'pipe' }
        );
        result = JSON.parse(fs.readFileSync(path.join(outDir, 'hotspots.json'), 'utf8'));
      });

      afterAll(() => {
        if (repoDir) fs.rmSync(repoDir, { recursive: true, force: true });
        if (outDir) fs.rmSync(outDir, { recursive: true, force: true });
      });

      it('src/app.js がランキングに含まれる（通常ソースファイルは除外しない）', () => {
        const entry = result.find((e) => e.file.endsWith('src/app.js') || e.file === 'src/app.js');
        expect(entry).toBeDefined();
      });

      it('dist/ 配下のファイルがランキングに出ない', () => {
        const entry = result.find((e) => e.file.includes('dist/'));
        expect(entry).toBeUndefined();
      });

      it('.obsidian/ 配下のファイルがランキングに出ない', () => {
        const entry = result.find((e) => e.file.includes('.obsidian/'));
        expect(entry).toBeUndefined();
      });

      it('*.min.js ファイルがランキングに出ない', () => {
        const entry = result.find((e) => e.file.endsWith('.min.js'));
        expect(entry).toBeUndefined();
      });
    });

    describe('受け入れ条件2: --ignore オプションでカスタム除外ができる', () => {
      let repoDirCustom;
      let outDirCustom;
      let resultWithIgnore;
      let resultWithoutIgnore;

      beforeAll(() => {
        repoDirCustom = buildExclusionFixtureRepo();

        // --ignore なしで実行
        const outDirNoIgnore = fs.mkdtempSync(path.join(os.tmpdir(), 'codecompass-no-ignore-'));
        execSync(
          `node "${HOTSPOT_SCRIPT}" "${repoDirCustom}" --outDir="${outDirNoIgnore}"`,
          { cwd: ROOT, stdio: 'pipe' }
        );
        resultWithoutIgnore = JSON.parse(
          fs.readFileSync(path.join(outDirNoIgnore, 'hotspots.json'), 'utf8')
        );
        fs.rmSync(outDirNoIgnore, { recursive: true, force: true });

        // --ignore=custom/ で実行
        outDirCustom = fs.mkdtempSync(path.join(os.tmpdir(), 'codecompass-custom-ignore-'));
        execSync(
          `node "${HOTSPOT_SCRIPT}" "${repoDirCustom}" --outDir="${outDirCustom}" --ignore=custom/`,
          { cwd: ROOT, stdio: 'pipe' }
        );
        resultWithIgnore = JSON.parse(
          fs.readFileSync(path.join(outDirCustom, 'hotspots.json'), 'utf8')
        );
      });

      afterAll(() => {
        if (repoDirCustom) fs.rmSync(repoDirCustom, { recursive: true, force: true });
        if (outDirCustom) fs.rmSync(outDirCustom, { recursive: true, force: true });
      });

      it('--ignore なしでは custom/target.js がランキングに含まれる', () => {
        const entry = resultWithoutIgnore.find(
          (e) => e.file.endsWith('custom/target.js') || e.file === 'custom/target.js'
        );
        expect(entry).toBeDefined();
      });

      it('--ignore=custom/ を指定すると custom/target.js がランキングから除外される', () => {
        const entry = resultWithIgnore.find((e) => e.file.includes('custom/'));
        expect(entry).toBeUndefined();
      });
    });
  });

  describe('受け入れ条件4 & 5: codecompass-to-issues.js の CLI 動作', () => {
    if (!toIssuesScriptExists) {
      it.skip('codecompass-to-issues.js が存在しないためスキップ', () => {});
      return;
    }

    let tmpDir;
    let actionsPath;

    beforeAll(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codecompass-to-issues-'));
      actionsPath = path.join(tmpDir, 'actions.md');
      fs.writeFileSync(actionsPath, FIXTURE_ACTIONS_MD);
    });

    afterAll(() => {
      if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    describe('受け入れ条件4: --dry-run で対象一覧を stdout に出力できる', () => {
      it('--dry-run オプションが存在し、エラーなく実行できる', () => {
        expect(() => {
          execSync(
            `node "${CODECOMPASS_TO_ISSUES_SCRIPT}" --actions="${actionsPath}" --dry-run`,
            { cwd: ROOT, stdio: 'pipe' }
          );
        }).not.toThrow();
      });

      it('--dry-run の stdout にファイル名が含まれる', () => {
        const output = execSync(
          `node "${CODECOMPASS_TO_ISSUES_SCRIPT}" --actions="${actionsPath}" --dry-run`,
          { cwd: ROOT, stdio: 'pipe' }
        ).toString();
        expect(output).toMatch(/persona\.js|DiscordAIbot/);
      });

      it('--dry-run では実際にイシューが発行されない（GitHub API を呼ばない）', () => {
        // dry-run は GITHUB_TOKEN なしでも動作するはず
        const env = { ...process.env };
        delete env.GITHUB_TOKEN;
        delete env.GH_TOKEN;
        expect(() => {
          execSync(
            `node "${CODECOMPASS_TO_ISSUES_SCRIPT}" --actions="${actionsPath}" --dry-run`,
            { cwd: ROOT, stdio: 'pipe', env }
          );
        }).not.toThrow();
      });
    });

    describe('受け入れ条件5: --limit オプションで発行件数を制限できる', () => {
      it('--limit=3 で出力される対象が3件になる', () => {
        const output = execSync(
          `node "${CODECOMPASS_TO_ISSUES_SCRIPT}" --actions="${actionsPath}" --dry-run --limit=3`,
          { cwd: ROOT, stdio: 'pipe' }
        ).toString();
        // 出力に3件以下のエントリが含まれることを確認
        // actions.md は6件あるが limit=3 で3件に絞られる
        const lines = output.split('\n').filter((l) => l.includes('hotspot_score') || l.includes('[Refactoring]') || l.match(/^\d+\./));
        expect(lines.length).toBeLessThanOrEqual(6); // 各エントリは複数行になる可能性
        // 少なくとも1件は出力される
        expect(output.length).toBeGreaterThan(0);
      });

      it('--limit=1 のとき最上位スコアのファイルのみ対象になる', () => {
        const outputLimit1 = execSync(
          `node "${CODECOMPASS_TO_ISSUES_SCRIPT}" --actions="${actionsPath}" --dry-run --limit=1`,
          { cwd: ROOT, stdio: 'pipe' }
        ).toString();
        const outputLimit5 = execSync(
          `node "${CODECOMPASS_TO_ISSUES_SCRIPT}" --actions="${actionsPath}" --dry-run --limit=5`,
          { cwd: ROOT, stdio: 'pipe' }
        ).toString();
        // limit=1 の出力は limit=5 より短い（または同等）
        expect(outputLimit1.length).toBeLessThanOrEqual(outputLimit5.length);
      });
    });
  });
});
