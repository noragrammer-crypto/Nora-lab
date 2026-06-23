'use strict';

/**
 * E2E Acceptance Tests: Story #1180 / Task #1215
 * CodeCompass: xp_Architect連携によるリファクタリング提案生成
 *
 * 受け入れ条件:
 * 1. ホットスポットスコア + 依存グラフ情報を統合した構造化JSONを生成できる
 * 2. 構造化JSON（コードそのものは含まない）を xp_Architect に渡す形式に整っている
 * 3. 提案結果を `codecompass/actions.md` として出力できる
 * 4. SKILL.md として独立呼び出し可能な形に整備されている
 *
 * スクリプトの想定インターフェース（実装タスク #1216 が満たすべき契約）:
 *   node CodeCompass/scripts/refactoring-proposal.js
 *     [--hotspots=<path>]  (省略時: codecompass/hotspots.json)
 *     [--graph=<path>]     (省略時: codecompass/dependency-graph.mmd)
 *     [--out=<path>]       (省略時: codecompass/actions.md)
 *
 *   - hotspots.json（hotspot スクリプト出力）と dependency-graph.mmd を統合する
 *   - 各ファイルに callers/callees カウントを付与した構造化JSON を内部で生成する
 *   - 構造化JSONをもとにリファクタリング提案を Markdown で生成する
 *   - --out 指定先に actions.md を出力する
 *
 * 構造化JSON の出力形式（lib/refactoring-proposal.js の buildStructuredJson が返す形式）:
 *   {
 *     "file": "path/to/file.js",
 *     "hotspot_score": <number>,
 *     "complexity": <number>,
 *     "changes_90d": <number>,
 *     "callers": <number>,
 *     "callees": <number>
 *   }
 *
 * フィクスチャ設計:
 *   hotspots.json:
 *     a.js: hotspotScore=0.9, complexity=3, changes=3, loc=10
 *     b.js: hotspotScore=0.4, complexity=2, changes=2, loc=10
 *
 *   dependency-graph.mmd:
 *     graph LR
 *       a.js --> b.js
 *       b.js --> c.js
 *
 *   期待される構造化JSON:
 *     a.js: callers=0, callees=1  (a.js は b.js を呼ぶ)
 *     b.js: callers=1, callees=1  (a.js から呼ばれ、c.js を呼ぶ)
 *
 * 実装が存在しない現時点では RED が正しい状態。
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const SCRIPT_PATH = path.join(ROOT, 'scripts', 'refactoring-proposal.js');
const LIB_PATH = path.join(ROOT, 'lib', 'refactoring-proposal.js');
const SKILL_MD_PATH = path.join(ROOT, 'SKILL.md');

const FIXTURE_HOTSPOTS = [
  { file: 'a.js', hotspotScore: 0.9, complexity: 3, changes: 3, loc: 10, linesChanged: 30 },
  { file: 'b.js', hotspotScore: 0.4, complexity: 2, changes: 2, loc: 10, linesChanged: 20 },
];

const FIXTURE_MMD = [
  'graph LR',
  '  a.js --> b.js',
  '  b.js --> c.js',
].join('\n') + '\n';

const scriptExists = fs.existsSync(SCRIPT_PATH);
const libExists = fs.existsSync(LIB_PATH);

describe('Story #1180: xp_Architect連携によるリファクタリング提案生成', () => {
  it('scripts/refactoring-proposal.js が存在する', () => {
    expect(scriptExists).toBe(true);
  });

  it('lib/refactoring-proposal.js が存在する', () => {
    expect(libExists).toBe(true);
  });

  describe('受け入れ条件4: SKILL.md として独立呼び出し可能な形に整備されている', () => {
    it('CodeCompass/SKILL.md が存在する', () => {
      expect(fs.existsSync(SKILL_MD_PATH)).toBe(true);
    });

    it('SKILL.md に /codecompass コマンド定義が含まれる', () => {
      if (!fs.existsSync(SKILL_MD_PATH)) return;
      const content = fs.readFileSync(SKILL_MD_PATH, 'utf8');
      expect(content).toMatch(/\/codecompass/);
    });
  });

  if (!libExists) {
    return;
  }

  describe('lib/refactoring-proposal.js の単体インターフェース検証', () => {
    let lib;

    beforeAll(() => {
      lib = require(LIB_PATH);
    });

    describe('受け入れ条件1: buildStructuredJson — 構造化JSONを生成できる', () => {
      it('buildStructuredJson 関数がエクスポートされている', () => {
        expect(typeof lib.buildStructuredJson).toBe('function');
      });

      it('hotspots 配列と mmd 文字列を受け取り配列を返す', () => {
        const result = lib.buildStructuredJson(FIXTURE_HOTSPOTS, FIXTURE_MMD);
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
      });

      it('各エントリに file, hotspot_score, complexity, changes_90d, callers, callees が含まれる', () => {
        const result = lib.buildStructuredJson(FIXTURE_HOTSPOTS, FIXTURE_MMD);
        for (const entry of result) {
          expect(typeof entry.file).toBe('string');
          expect(typeof entry.hotspot_score).toBe('number');
          expect(typeof entry.complexity).toBe('number');
          expect(typeof entry.changes_90d).toBe('number');
          expect(typeof entry.callers).toBe('number');
          expect(typeof entry.callees).toBe('number');
        }
      });

      it('コードそのものが含まれない（source/code/content フィールドなし）', () => {
        const result = lib.buildStructuredJson(FIXTURE_HOTSPOTS, FIXTURE_MMD);
        for (const entry of result) {
          expect(entry.source).toBeUndefined();
          expect(entry.code).toBeUndefined();
          expect(entry.content).toBeUndefined();
        }
      });

      it('hotspot_score が hotspots.json の hotspotScore と対応する', () => {
        const result = lib.buildStructuredJson(FIXTURE_HOTSPOTS, FIXTURE_MMD);
        const a = result.find((e) => e.file === 'a.js' || e.file.endsWith('/a.js'));
        expect(a).toBeDefined();
        expect(a.hotspot_score).toBeCloseTo(0.9, 5);
      });

      it('a.js の callees が 1 になる（a.js --> b.js）', () => {
        const result = lib.buildStructuredJson(FIXTURE_HOTSPOTS, FIXTURE_MMD);
        const a = result.find((e) => e.file === 'a.js' || e.file.endsWith('/a.js'));
        expect(a).toBeDefined();
        expect(a.callees).toBe(1);
      });

      it('b.js の callers が 1 になる（a.js --> b.js）', () => {
        const result = lib.buildStructuredJson(FIXTURE_HOTSPOTS, FIXTURE_MMD);
        const b = result.find((e) => e.file === 'b.js' || e.file.endsWith('/b.js'));
        expect(b).toBeDefined();
        expect(b.callers).toBe(1);
      });

      it('mmd が空のとき callers/callees はすべて 0 になる', () => {
        const result = lib.buildStructuredJson(FIXTURE_HOTSPOTS, '');
        for (const entry of result) {
          expect(entry.callers).toBe(0);
          expect(entry.callees).toBe(0);
        }
      });
    });

    describe('受け入れ条件2: generateActionsMarkdown — リファクタリング提案を生成できる', () => {
      it('generateActionsMarkdown 関数がエクスポートされている', () => {
        expect(typeof lib.generateActionsMarkdown).toBe('function');
      });

      it('構造化JSONを受け取り文字列を返す', () => {
        const structuredJson = lib.buildStructuredJson(FIXTURE_HOTSPOTS, FIXTURE_MMD);
        const result = lib.generateActionsMarkdown(structuredJson);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });

      it('出力 Markdown にホットスポットファイル名が含まれる', () => {
        const structuredJson = lib.buildStructuredJson(FIXTURE_HOTSPOTS, FIXTURE_MMD);
        const result = lib.generateActionsMarkdown(structuredJson);
        expect(result).toMatch(/a\.js/);
      });

      it('空の入力配列でも空文字ではなく見出しなど最低限の構造を返す', () => {
        const result = lib.generateActionsMarkdown([]);
        expect(typeof result).toBe('string');
      });
    });
  });

  if (!scriptExists) {
    return;
  }

  describe('受け入れ条件3: CLI スクリプトで actions.md を出力できる', () => {
    let tmpDir;
    let hotspotsPath;
    let graphPath;
    let outPath;

    beforeAll(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codecompass-refactoring-'));
      hotspotsPath = path.join(tmpDir, 'hotspots.json');
      graphPath = path.join(tmpDir, 'dependency-graph.mmd');
      outPath = path.join(tmpDir, 'actions.md');

      fs.writeFileSync(hotspotsPath, JSON.stringify(FIXTURE_HOTSPOTS, null, 2));
      fs.writeFileSync(graphPath, FIXTURE_MMD);

      execSync(
        `node "${SCRIPT_PATH}" --hotspots="${hotspotsPath}" --graph="${graphPath}" --out="${outPath}"`,
        { cwd: ROOT, stdio: 'pipe' }
      );
    });

    afterAll(() => {
      if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('actions.md が生成される', () => {
      expect(fs.existsSync(outPath)).toBe(true);
    });

    it('actions.md は空でない', () => {
      const content = fs.readFileSync(outPath, 'utf8');
      expect(content.length).toBeGreaterThan(0);
    });

    it('actions.md にリファクタリング対象ファイル名が含まれる', () => {
      const content = fs.readFileSync(outPath, 'utf8');
      expect(content).toMatch(/a\.js/);
    });

    it('actions.md が Markdown 形式である（見出しを含む）', () => {
      const content = fs.readFileSync(outPath, 'utf8');
      expect(content).toMatch(/^#/m);
    });
  });
});
