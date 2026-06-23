'use strict';

/**
 * Unit Tests: CodeCompass リファクタリング提案エンジン（#1216）
 *
 * buildStructuredJson と generateActionsMarkdown の純粋関数を対象とする。
 * 外部 I/O への依存はなく、配列・文字列の入出力のみで検証する。
 */

const { buildStructuredJson, generateActionsMarkdown } = require('../../lib/refactoring-proposal');

// テスト用の Mermaid グラフ文字列
const SAMPLE_MMD = `graph LR
  "a.js" -->|calls| "b.js"
  "a.js" -->|calls| "c.js"
  "b.js" -->|calls| "c.js"
`;

// テスト用のホットスポット配列
const SAMPLE_HOTSPOTS = [
  { file: 'a.js', hotspotScore: 1.5, complexity: 30, changes: 50, loc: 200, linesChanged: 400 },
  { file: 'b.js', hotspotScore: 0.8, complexity: 20, changes: 20, loc: 100, linesChanged: 200 },
  { file: 'c.js', hotspotScore: 0.2, complexity: 5, changes: 10, loc: 150, linesChanged: 100 },
];

describe('refactoring-proposal lib (unit)', () => {
  describe('buildStructuredJson', () => {
    it('hotspots 配列と Mermaid コンテンツを統合して構造化JSONを返す', () => {
      const result = buildStructuredJson(SAMPLE_HOTSPOTS, SAMPLE_MMD);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(expect.objectContaining({
        file: expect.any(String),
        hotspot_score: expect.any(Number),
        complexity: expect.any(Number),
        changes_90d: expect.any(Number),
        callers: expect.any(Number),
        callees: expect.any(Number),
      }));
    });

    it('フィールド名を変換する: hotspotScore→hotspot_score, changes→changes_90d', () => {
      const result = buildStructuredJson(SAMPLE_HOTSPOTS, SAMPLE_MMD);
      const entry = result.find((r) => r.file === 'a.js');

      expect(entry.hotspot_score).toBe(1.5);
      expect(entry.changes_90d).toBe(50);
      expect(entry).not.toHaveProperty('hotspotScore');
      expect(entry).not.toHaveProperty('changes');
    });

    it('出力フィールドに loc, linesChanged は含まれない（コード量情報を除外）', () => {
      const result = buildStructuredJson(SAMPLE_HOTSPOTS, SAMPLE_MMD);

      for (const entry of result) {
        expect(entry).not.toHaveProperty('loc');
        expect(entry).not.toHaveProperty('linesChanged');
      }
    });

    it('callees は自ファイルが from 側に登場するエッジ数を返す', () => {
      const result = buildStructuredJson(SAMPLE_HOTSPOTS, SAMPLE_MMD);

      // a.js → b.js, a.js → c.js: callees=2
      expect(result.find((r) => r.file === 'a.js').callees).toBe(2);
      // b.js → c.js: callees=1
      expect(result.find((r) => r.file === 'b.js').callees).toBe(1);
      // c.js は誰も呼ばない: callees=0
      expect(result.find((r) => r.file === 'c.js').callees).toBe(0);
    });

    it('callers は自ファイルが to 側に登場するエッジ数を返す（他ファイルから呼ばれる回数）', () => {
      const result = buildStructuredJson(SAMPLE_HOTSPOTS, SAMPLE_MMD);

      // a.js は誰にも呼ばれない: callers=0
      expect(result.find((r) => r.file === 'a.js').callers).toBe(0);
      // b.js は a.js から呼ばれる: callers=1
      expect(result.find((r) => r.file === 'b.js').callers).toBe(1);
      // c.js は a.js, b.js から呼ばれる: callers=2
      expect(result.find((r) => r.file === 'c.js').callers).toBe(2);
    });

    it('Mermaid コンテンツが空文字の場合は callers=0, callees=0 を返す', () => {
      const result = buildStructuredJson(SAMPLE_HOTSPOTS, '');

      for (const entry of result) {
        expect(entry.callers).toBe(0);
        expect(entry.callees).toBe(0);
      }
    });

    it('hotspots が空配列の場合は空配列を返す', () => {
      expect(buildStructuredJson([], SAMPLE_MMD)).toEqual([]);
      expect(buildStructuredJson([], '')).toEqual([]);
    });

    it('MMD に登場しないファイルも callers=0, callees=0 で出力される', () => {
      const hotspots = [
        { file: 'unknown.js', hotspotScore: 0.5, complexity: 10, changes: 5, loc: 100, linesChanged: 50 },
      ];
      const result = buildStructuredJson(hotspots, SAMPLE_MMD);

      expect(result[0].callers).toBe(0);
      expect(result[0].callees).toBe(0);
    });
  });

  describe('generateActionsMarkdown', () => {
    let structuredJson;

    beforeAll(() => {
      structuredJson = buildStructuredJson(SAMPLE_HOTSPOTS, SAMPLE_MMD);
    });

    it('構造化JSON配列から Markdown 文字列を返す', () => {
      const result = generateActionsMarkdown(structuredJson);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('各エントリのファイルパスが Markdown に含まれる', () => {
      const result = generateActionsMarkdown(structuredJson);

      expect(result).toContain('a.js');
      expect(result).toContain('b.js');
      expect(result).toContain('c.js');
    });

    it('hotspot_score, complexity, callers, callees が Markdown に含まれる', () => {
      const result = generateActionsMarkdown(structuredJson);

      expect(result).toMatch(/hotspot.?score|score/i);
      expect(result).toMatch(/complexity|複雑度/i);
      expect(result).toMatch(/callers?|呼び出し元/i);
      expect(result).toMatch(/callees?|呼び出し先/i);
    });

    it('空配列を渡しても有効な文字列を返す（エラーにならない）', () => {
      const result = generateActionsMarkdown([]);

      expect(typeof result).toBe('string');
    });
  });
});
