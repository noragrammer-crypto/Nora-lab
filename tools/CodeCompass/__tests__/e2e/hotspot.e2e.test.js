'use strict';

/**
 * E2E Acceptance Tests: Story #1178 / Task #1197
 * CodeCompass: ホットスポット判定とランキング出力
 *
 * 受け入れ条件:
 * 1. hotspot スクリプトを実行したとき codecompass/hotspots.md が生成される
 * 2. hotspot スクリプトを実行したとき codecompass/hotspots.json が生成される
 * 3. hotspots.json の各エントリに file, hotspotScore, complexity, changes, loc フィールドが含まれる
 * 4. ホットスポットランキングが密度スコア降順で並んでいる
 *
 * スクリプトの想定インターフェース（実装タスク #1198 が満たすべき契約）:
 *   node CodeCompass/scripts/hotspot.js <repoPath> [--outDir=<dir>]
 *
 *   - 指定したリポジトリパス配下の .js / .py ファイルを AST 解析して複雑度を算出する
 *   - git log --numstat でファイルごとの変更頻度を集計する
 *   - (changes × complexity) / loc で密度スコアを算出し降順でソートする
 *   - --outDir 省略時は カレントディレクトリ配下の codecompass/ に出力する
 *   - 以下の2ファイルを出力する:
 *     <outDir>/hotspots.md  — 人間が読むランキング表
 *     <outDir>/hotspots.json — 機械可読データ（xp_Architect 連携用）
 *   - hotspots.json の各エントリ:
 *     {
 *       "file": "path/to/file.js",
 *       "hotspotScore": <number>,  // (changes × complexity) / loc
 *       "complexity": <number>,
 *       "changes": <number>,
 *       "loc": <number>,
 *       "linesChanged": <number>
 *     }
 *
 * フィクスチャ設計:
 *   a.js: complexity=3 (if/for/while), 3回変更, loc=10 → hotspotScore = (3×3)/10 = 0.9
 *   b.js: complexity=2 (if/if),        2回変更, loc=10 → hotspotScore = (2×2)/10 = 0.4
 *   c.js: complexity=0 (制御フローなし), 4回変更, loc=5  → hotspotScore = (4×0)/5 = 0
 *   期待ランキング順: a.js > b.js ≥ c.js
 *
 * 実装が存在しない現時点では RED が正しい状態。
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const SCRIPT_PATH = path.join(ROOT, 'scripts', 'hotspot.js');

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
 * 複雑度・変更頻度が既知の固定コミット履歴を持つ一時 git リポジトリを構築する。
 *
 * a.js: if/for/while の3制御フロー、直近90日以内に3回変更, 10行
 * b.js: if が2個の2制御フロー、直近90日以内に2回変更, 10行
 * c.js: 制御フローなし, 直近90日以内に4回変更, 5行
 */
function buildFixtureRepo() {
  const repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codecompass-hotspot-'));

  git(repoDir, 'init -q -b main');
  git(repoDir, 'config user.email "test@example.com"');
  git(repoDir, 'config user.name "CodeCompass E2E"');

  // 初期コミット: a.js, b.js, c.js を追加
  writeFile(repoDir, 'a.js', [
    'function processA(items) {',
    '  for (let i = 0; i < items.length; i++) {',
    '    if (items[i] > 0) {',
    '      console.log(items[i]);',
    '    }',
    '  }',
    '  let count = 0;',
    '  while (count < 10) { count++; }',
    '  return count;',
    '}',
  ].join('\n') + '\n');

  writeFile(repoDir, 'b.js', [
    'function processB(x) {',
    '  if (x > 0) {',
    '    return x * 2;',
    '  }',
    '  if (x < 0) {',
    '    return x * -1;',
    '  }',
    '  return 0;',
    '}',
    'module.exports = { processB };',
  ].join('\n') + '\n');

  writeFile(repoDir, 'c.js', [
    'const C = 42;',
    'function getC() { return C; }',
    'function setC(v) { return v; }',
    'module.exports = { C, getC, setC };',
    '',
  ].join('\n'));

  git(repoDir, 'add a.js b.js c.js');
  git(repoDir, 'commit -q -m "init: add a.js b.js c.js"', isoDateDaysAgo(50));

  // a.js: 2回目の変更
  fs.appendFileSync(path.join(repoDir, 'a.js'), '// update 2\n');
  git(repoDir, 'add a.js');
  git(repoDir, 'commit -q -m "fix: update a.js (2)"', isoDateDaysAgo(30));

  // a.js: 3回目, b.js: 2回目, c.js: 2回目
  fs.appendFileSync(path.join(repoDir, 'a.js'), '// update 3\n');
  fs.appendFileSync(path.join(repoDir, 'b.js'), '// update 2\n');
  fs.appendFileSync(path.join(repoDir, 'c.js'), '// update 2\n');
  git(repoDir, 'add a.js b.js c.js');
  git(repoDir, 'commit -q -m "feat: update a.js(3) b.js(2) c.js(2)"', isoDateDaysAgo(15));

  // c.js: 3回目, 4回目
  fs.appendFileSync(path.join(repoDir, 'c.js'), '// update 3\n');
  git(repoDir, 'add c.js');
  git(repoDir, 'commit -q -m "chore: update c.js (3)"', isoDateDaysAgo(8));

  fs.appendFileSync(path.join(repoDir, 'c.js'), '// update 4\n');
  git(repoDir, 'add c.js');
  git(repoDir, 'commit -q -m "chore: update c.js (4)"', isoDateDaysAgo(3));

  return repoDir;
}

const scriptExists = fs.existsSync(SCRIPT_PATH);

describe('Story #1178: ホットスポット判定とランキング出力', () => {
  it('scripts/hotspot.js が存在する', () => {
    expect(scriptExists).toBe(true);
  });

  if (!scriptExists) {
    // 実装タスク (#1198) 完了前は以降のテストをスキップする（RED状態が正しい）
    return;
  }

  let repoDir;
  let outDir;
  let mdPath;
  let jsonPath;
  let result;

  beforeAll(() => {
    repoDir = buildFixtureRepo();
    outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codecompass-hotspot-out-'));
    mdPath = path.join(outDir, 'hotspots.md');
    jsonPath = path.join(outDir, 'hotspots.json');

    execSync(
      `node "${SCRIPT_PATH}" "${repoDir}" --outDir="${outDir}"`,
      { cwd: ROOT, stdio: 'pipe' }
    );
    result = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  });

  afterAll(() => {
    if (repoDir) fs.rmSync(repoDir, { recursive: true, force: true });
    if (outDir) fs.rmSync(outDir, { recursive: true, force: true });
  });

  describe('受け入れ条件1: hotspot スクリプトを実行したとき hotspots.md が生成される', () => {
    it('hotspots.md が作成される', () => {
      expect(fs.existsSync(mdPath)).toBe(true);
    });

    it('hotspots.md は空でない', () => {
      const content = fs.readFileSync(mdPath, 'utf8');
      expect(content.length).toBeGreaterThan(0);
    });
  });

  describe('受け入れ条件2: hotspot スクリプトを実行したとき hotspots.json が生成される', () => {
    it('hotspots.json が作成される', () => {
      expect(fs.existsSync(jsonPath)).toBe(true);
    });

    it('hotspots.json は有効な JSON 配列である', () => {
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('受け入れ条件3: hotspots.json の各エントリに必須フィールドが含まれる', () => {
    it('各エントリが file, hotspotScore, complexity, changes, loc フィールドを持つ', () => {
      for (const entry of result) {
        expect(typeof entry.file).toBe('string');
        expect(typeof entry.hotspotScore).toBe('number');
        expect(typeof entry.complexity).toBe('number');
        expect(typeof entry.changes).toBe('number');
        expect(typeof entry.loc).toBe('number');
      }
    });

    it('a.js のエントリで complexity=3, changes=3 が記録されている', () => {
      const entry = result.find((e) => e.file === 'a.js' || e.file.endsWith('/a.js'));
      expect(entry).toBeDefined();
      expect(entry.complexity).toBe(3);
      expect(entry.changes).toBe(3);
    });

    it('b.js のエントリで complexity=2, changes=2 が記録されている', () => {
      const entry = result.find((e) => e.file === 'b.js' || e.file.endsWith('/b.js'));
      expect(entry).toBeDefined();
      expect(entry.complexity).toBe(2);
      expect(entry.changes).toBe(2);
    });

    it('c.js のエントリで complexity=0 が記録されている（制御フローなし）', () => {
      const entry = result.find((e) => e.file === 'c.js' || e.file.endsWith('/c.js'));
      expect(entry).toBeDefined();
      expect(entry.complexity).toBe(0);
    });

    it('hotspotScore は (changes × complexity) / loc の計算式に従う', () => {
      const a = result.find((e) => e.file === 'a.js' || e.file.endsWith('/a.js'));
      expect(a).toBeDefined();
      const expected = (a.changes * a.complexity) / a.loc;
      expect(a.hotspotScore).toBeCloseTo(expected, 5);
    });

    it('LOC が 0 または complexity が 0 のファイルの hotspotScore は 0 になる', () => {
      const c = result.find((e) => e.file === 'c.js' || e.file.endsWith('/c.js'));
      expect(c).toBeDefined();
      expect(c.hotspotScore).toBe(0);
    });
  });

  describe('受け入れ条件4: ホットスポットランキングが密度スコア降順で並んでいる', () => {
    it('hotspots.json は hotspotScore の降順でソートされている', () => {
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].hotspotScore).toBeGreaterThanOrEqual(result[i + 1].hotspotScore);
      }
    });

    it('a.js が b.js より上位にランクされる（hotspotScore が高い）', () => {
      const idxA = result.findIndex((e) => e.file === 'a.js' || e.file.endsWith('/a.js'));
      const idxB = result.findIndex((e) => e.file === 'b.js' || e.file.endsWith('/b.js'));
      expect(idxA).toBeGreaterThanOrEqual(0);
      expect(idxB).toBeGreaterThanOrEqual(0);
      expect(idxA).toBeLessThan(idxB);
    });
  });
});
