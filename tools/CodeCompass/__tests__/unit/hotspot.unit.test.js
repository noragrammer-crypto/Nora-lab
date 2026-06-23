'use strict';

/**
 * Unit Tests: CodeCompass ホットスポット判定エンジン（#1198）
 *
 * 変更頻度データと複雑度データを統合して密度スコアを算出する純粋関数を対象とする。
 * 外部 I/O（git / ファイルシステム）への依存はなく、配列の入出力のみで検証する。
 */

const { mergeData, computeHotspotScores } = require('../../lib/hotspot');

describe('hotspot lib (unit)', () => {
  describe('mergeData', () => {
    it('ファイル名で変更頻度データと複雑度データを結合する', () => {
      const changeFrequency = [
        { file: 'a.js', changes: 10, linesChanged: 100 },
        { file: 'b.js', changes: 5, linesChanged: 50 },
      ];
      const complexity = [
        { file: 'a.js', complexity: 20, loc: 200 },
        { file: 'b.js', complexity: 5, loc: 100 },
        { file: 'c.js', complexity: 3, loc: 50 },
      ];

      const result = mergeData(changeFrequency, complexity);

      expect(result).toEqual(expect.arrayContaining([
        { file: 'a.js', changes: 10, linesChanged: 100, complexity: 20, loc: 200 },
        { file: 'b.js', changes: 5, linesChanged: 50, complexity: 5, loc: 100 },
        { file: 'c.js', changes: 0, linesChanged: 0, complexity: 3, loc: 50 },
      ]));
      expect(result).toHaveLength(3);
    });

    it('変更頻度データに存在しないファイルは changes=0, linesChanged=0 として扱う', () => {
      const changeFrequency = [];
      const complexity = [{ file: 'unused.js', complexity: 10, loc: 100 }];

      const result = mergeData(changeFrequency, complexity);

      expect(result).toEqual([
        { file: 'unused.js', changes: 0, linesChanged: 0, complexity: 10, loc: 100 },
      ]);
    });

    it('複雑度データが空の場合は空配列を返す', () => {
      const changeFrequency = [{ file: 'a.js', changes: 5, linesChanged: 50 }];
      const complexity = [];

      expect(mergeData(changeFrequency, complexity)).toEqual([]);
    });

    it('両方が空の場合は空配列を返す', () => {
      expect(mergeData([], [])).toEqual([]);
    });
  });

  describe('computeHotspotScores', () => {
    it('(changes × complexity) / loc で hotspotScore を算出しスコア降順でソートする', () => {
      const merged = [
        { file: 'low.js', changes: 1, linesChanged: 10, complexity: 2, loc: 100 },
        { file: 'high.js', changes: 10, linesChanged: 200, complexity: 20, loc: 100 },
        { file: 'mid.js', changes: 5, linesChanged: 50, complexity: 10, loc: 200 },
      ];

      const result = computeHotspotScores(merged);

      expect(result[0].file).toBe('high.js');
      expect(result[0].hotspotScore).toBeCloseTo(2.0);
      expect(result[1].file).toBe('mid.js');
      expect(result[1].hotspotScore).toBeCloseTo(0.25);
      expect(result[2].file).toBe('low.js');
      expect(result[2].hotspotScore).toBeCloseTo(0.02);
    });

    it('LOC が 0 のファイルは hotspotScore = 0 とする（ゼロ除算回避）', () => {
      const merged = [
        { file: 'empty.js', changes: 10, linesChanged: 100, complexity: 5, loc: 0 },
      ];

      const result = computeHotspotScores(merged);

      expect(result[0].hotspotScore).toBe(0);
    });

    it('complexity が 0 のファイルは hotspotScore = 0 とする', () => {
      const merged = [
        { file: 'simple.js', changes: 10, linesChanged: 100, complexity: 0, loc: 200 },
      ];

      const result = computeHotspotScores(merged);

      expect(result[0].hotspotScore).toBe(0);
    });

    it('changes が 0 のファイルは hotspotScore = 0 とする', () => {
      const merged = [
        { file: 'static.js', changes: 0, linesChanged: 0, complexity: 20, loc: 200 },
      ];

      const result = computeHotspotScores(merged);

      expect(result[0].hotspotScore).toBe(0);
    });

    it('出力に file, hotspotScore, complexity, changes, loc, linesChanged フィールドが含まれる', () => {
      const merged = [
        { file: 'a.js', changes: 5, linesChanged: 50, complexity: 10, loc: 100 },
      ];

      const result = computeHotspotScores(merged);

      expect(result[0]).toEqual(expect.objectContaining({
        file: 'a.js',
        hotspotScore: expect.any(Number),
        complexity: 10,
        changes: 5,
        loc: 100,
        linesChanged: 50,
      }));
    });

    it('空配列に対しては空配列を返す', () => {
      expect(computeHotspotScores([])).toEqual([]);
    });
  });
});
