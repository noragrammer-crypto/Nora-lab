'use strict';

/**
 * E2E Acceptance Tests: Story #1176
 * CodeCompass: 変更頻度分析エンジン（git log集計）
 *
 * 受け入れ条件:
 * 1. 任意のリポジトリパスに対して `git log --numstat` ベースの変更頻度集計を実行できる
 * 2. ファイルごとの「変更回数」「変更行数（追加+削除）」を取得できる
 * 3. 変更頻度降順でランキングされた構造化データ（JSON）を出力できる
 * 4. 集計期間（デフォルト90日）をオプションで指定できる
 *
 * スクリプトの想定インターフェース（実装タスク #1182 が満たすべき契約）:
 *   node CodeCompass/scripts/change-frequency.js <repoPath> [--days=<N>] [--out=<path>]
 *
 *   - 標準出力 または --out 指定先に、以下の形式の JSON 配列を出力する:
 *     [
 *       { "file": "a.js", "changes": 3, "linesChanged": 15 },
 *       ...
 *     ]
 *   - changes: 指定期間内のコミットでそのファイルが変更された回数
 *   - linesChanged: 指定期間内の追加行数 + 削除行数の合計
 *   - 配列は changes 降順でソートされていること
 *   - --days 省略時は直近90日を対象とする
 *
 * 実装が存在しない現時点では RED が正しい状態。
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const SCRIPT_PATH = path.join(ROOT, 'scripts', 'change-frequency.js');

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

function writeFile(repoDir, relPath, lines) {
  fs.writeFileSync(path.join(repoDir, relPath), lines.join('\n') + '\n');
}

/**
 * 決定論的なコミット履歴を持つ一時 git リポジトリを構築する。
 *
 * 直近90日以内:
 *   - a.js: 3回変更（追加合計 10 + 3 + 2 = 15行）
 *   - c.js: 2回変更（追加合計 8 + 4 = 12行）
 *   - b.js: 1回変更（追加合計 5行）
 *   → 期待される変更頻度ランキング: a.js(3) > c.js(2) > b.js(1)
 *
 * 200日前（デフォルトの90日ウィンドウ外）:
 *   - b.js を50行追加で改修するコミットを追加する
 *   → --days=90（デフォルト）では b.js の changes は 1 のまま
 *   → --days=365 を指定すると b.js の changes は 2 になる
 */
function buildFixtureRepo() {
  const repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codecompass-changefreq-'));

  git(repoDir, 'init -q -b main');
  git(repoDir, 'config user.email "test@example.com"');
  git(repoDir, 'config user.name "CodeCompass E2E"');

  // 古いコミット（90日ウィンドウの外）を先に積む
  writeFile(repoDir, 'b.js', Array(50).fill("console.log('legacy');"));
  git(repoDir, 'add b.js');
  git(repoDir, 'commit -q -m "legacy: large rewrite of b.js"', isoDateDaysAgo(200));

  // 直近90日以内のコミット群
  writeFile(repoDir, 'a.js', Array(10).fill("const a = 1;"));
  writeFile(repoDir, 'c.js', Array(8).fill("const c = 1;"));
  git(repoDir, 'add a.js c.js');
  git(repoDir, 'commit -q -m "feat: add a.js and c.js"', isoDateDaysAgo(40));

  fs.appendFileSync(path.join(repoDir, 'a.js'), Array(3).fill("const a2 = 2;").join('\n') + '\n');
  git(repoDir, 'add a.js');
  git(repoDir, 'commit -q -m "feat: extend a.js (1)"', isoDateDaysAgo(20));

  fs.appendFileSync(path.join(repoDir, 'a.js'), Array(2).fill("const a3 = 3;").join('\n') + '\n');
  fs.appendFileSync(path.join(repoDir, 'c.js'), Array(4).fill("const c2 = 2;").join('\n') + '\n');
  git(repoDir, 'add a.js c.js');
  git(repoDir, 'commit -q -m "feat: extend a.js (2) and c.js"', isoDateDaysAgo(5));

  fs.appendFileSync(path.join(repoDir, 'b.js'), Array(5).fill("const b2 = 2;").join('\n') + '\n');
  git(repoDir, 'add b.js');
  git(repoDir, 'commit -q -m "feat: small tweak to b.js"', isoDateDaysAgo(2));

  return repoDir;
}

function runScript(args) {
  return execSync(`node "${SCRIPT_PATH}" ${args}`, { cwd: ROOT, stdio: 'pipe' }).toString();
}

const scriptExists = fs.existsSync(SCRIPT_PATH);

describe('Story #1176: 変更頻度分析エンジン（git log --numstat 集計）', () => {
  it('scripts/change-frequency.js が存在する', () => {
    expect(scriptExists).toBe(true);
  });

  if (!scriptExists) {
    // 実装タスク (#1182) 完了前は以降のテストをスキップする（RED状態が正しい）
    return;
  }

  let repoDir;
  let outPath;
  let defaultResult;

  beforeAll(() => {
    repoDir = buildFixtureRepo();
    outPath = path.join(repoDir, 'change-frequency.json');

    runScript(`"${repoDir}" --out="${outPath}"`);
    defaultResult = JSON.parse(fs.readFileSync(outPath, 'utf8'));
  });

  afterAll(() => {
    if (repoDir) fs.rmSync(repoDir, { recursive: true, force: true });
  });

  describe('受け入れ条件1: 任意のリポジトリパスに対して変更頻度集計を実行できる', () => {
    it('指定したリポジトリパスに対して正常終了し、出力ファイルを生成する', () => {
      expect(fs.existsSync(outPath)).toBe(true);
    });

    it('出力は JSON として解釈できる配列である', () => {
      expect(Array.isArray(defaultResult)).toBe(true);
      expect(defaultResult.length).toBeGreaterThan(0);
    });
  });

  describe('受け入れ条件2: ファイルごとの「変更回数」「変更行数（追加+削除）」を取得できる', () => {
    it('各エントリが file・変更回数・変更行数のフィールドを持つ', () => {
      for (const entry of defaultResult) {
        expect(typeof entry.file).toBe('string');
        expect(typeof entry.changes).toBe('number');
        expect(typeof entry.linesChanged).toBe('number');
      }
    });

    it('a.js は直近90日で3回変更され、追加行数の合計が一致する', () => {
      const a = defaultResult.find((e) => e.file === 'a.js');
      expect(a).toBeDefined();
      expect(a.changes).toBe(3);
      expect(a.linesChanged).toBe(15); // 10 + 3 + 2
    });

    it('c.js は直近90日で2回変更され、追加行数の合計が一致する', () => {
      const c = defaultResult.find((e) => e.file === 'c.js');
      expect(c).toBeDefined();
      expect(c.changes).toBe(2);
      expect(c.linesChanged).toBe(12); // 8 + 4
    });

    it('b.js はデフォルト期間（90日）では直近の1回のみカウントされる', () => {
      const b = defaultResult.find((e) => e.file === 'b.js');
      expect(b).toBeDefined();
      expect(b.changes).toBe(1);
      expect(b.linesChanged).toBe(5);
    });
  });

  describe('受け入れ条件3: 変更頻度降順でランキングされた構造化データ（JSON）を出力できる', () => {
    it('changes の降順でソートされている', () => {
      for (let i = 1; i < defaultResult.length; i++) {
        expect(defaultResult[i - 1].changes).toBeGreaterThanOrEqual(defaultResult[i].changes);
      }
    });

    it('a.js > c.js > b.js の順でランキングされる', () => {
      const order = defaultResult.map((e) => e.file);
      expect(order.indexOf('a.js')).toBeLessThan(order.indexOf('c.js'));
      expect(order.indexOf('c.js')).toBeLessThan(order.indexOf('b.js'));
    });
  });

  describe('受け入れ条件4: 集計期間（デフォルト90日）をオプションで指定できる', () => {
    it('--days を指定しない場合、90日より前のコミットは集計対象に含まれない', () => {
      const b = defaultResult.find((e) => e.file === 'b.js');
      // 200日前の legacy リライト（+50行）が含まれていれば changes=2, linesChanged=55 になってしまう
      expect(b.changes).toBe(1);
      expect(b.linesChanged).toBe(5);
    });

    it('--days=365 を指定すると200日前のコミットも集計対象に含まれる', () => {
      const widePath = path.join(repoDir, 'change-frequency-365.json');
      runScript(`"${repoDir}" --days=365 --out="${widePath}"`);
      const wideResult = JSON.parse(fs.readFileSync(widePath, 'utf8'));

      const b = wideResult.find((e) => e.file === 'b.js');
      expect(b).toBeDefined();
      expect(b.changes).toBe(2);
      expect(b.linesChanged).toBe(55); // 50 (legacy) + 5 (recent)
    });
  });
});
