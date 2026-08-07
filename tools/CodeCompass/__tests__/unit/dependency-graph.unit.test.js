'use strict';

/**
 * Unit Tests: CodeCompass 依存グラフ生成エンジン（#1206）
 *
 * 純粋関数（selectTopFiles, buildMermaidGraph, extractEdges）を対象とする。
 * 外部 I/O への依存はなく、配列・文字列の入出力のみで検証する。
 */

const { selectTopFiles, buildMermaidGraph, extractEdges } = require('../../lib/dependency-graph');

describe('dependency-graph lib (unit)', () => {
  describe('selectTopFiles', () => {
    it('hotspotScore 降順リストから上位 topN 件のファイルパスを返す', () => {
      const hotspots = [
        { file: 'a.js', hotspotScore: 1.0 },
        { file: 'b.js', hotspotScore: 0.5 },
        { file: 'c.js', hotspotScore: 0.2 },
        { file: 'd.js', hotspotScore: 0.1 },
      ];

      const result = selectTopFiles(hotspots, 2);

      expect(result).toEqual(['a.js', 'b.js']);
    });

    it('hotspotScore=0 のファイルは選択対象外', () => {
      const hotspots = [
        { file: 'a.js', hotspotScore: 1.0 },
        { file: 'b.js', hotspotScore: 0.5 },
        { file: 'c.js', hotspotScore: 0.0 },
        { file: 'd.js', hotspotScore: 0.0 },
      ];

      const result = selectTopFiles(hotspots, 10);

      expect(result).not.toContain('c.js');
      expect(result).not.toContain('d.js');
      expect(result).toEqual(['a.js', 'b.js']);
    });

    it('topN が非ゼロファイル数を超える場合は非ゼロ全件を返す', () => {
      const hotspots = [
        { file: 'a.js', hotspotScore: 1.0 },
        { file: 'b.js', hotspotScore: 0.5 },
        { file: 'c.js', hotspotScore: 0.0 },
      ];

      const result = selectTopFiles(hotspots, 100);

      expect(result).toEqual(['a.js', 'b.js']);
    });

    it('全ファイルが score=0 の場合は空配列を返す', () => {
      const hotspots = [
        { file: 'a.js', hotspotScore: 0.0 },
        { file: 'b.js', hotspotScore: 0.0 },
      ];

      expect(selectTopFiles(hotspots, 2)).toEqual([]);
    });

    it('空配列に対しては空配列を返す', () => {
      expect(selectTopFiles([], 5)).toEqual([]);
    });

    it('topN=0 の場合は空配列を返す', () => {
      const hotspots = [{ file: 'a.js', hotspotScore: 1.0 }];

      expect(selectTopFiles(hotspots, 0)).toEqual([]);
    });
  });

  describe('buildMermaidGraph', () => {
    it('空のエッジリストから graph LR ヘッダのみを返す', () => {
      const result = buildMermaidGraph([]);

      expect(result.trimStart()).toMatch(/^graph LR/);
      const lines = result.split('\n').filter((l) => l.trim());
      expect(lines).toHaveLength(1);
    });

    it('出力は graph LR で始まる', () => {
      const result = buildMermaidGraph([{ from: 'a.js', to: 'b.js' }]);

      expect(result.trimStart()).toMatch(/^graph LR/);
    });

    it('エッジは -->|calls| 形式で表現される', () => {
      const result = buildMermaidGraph([{ from: 'a.js', to: 'b.js' }]);

      expect(result).toContain('-->|calls|');
    });

    it('ファイルパスはダブルクォートで囲まれる', () => {
      const result = buildMermaidGraph([{ from: 'a.js', to: 'b.js' }]);

      expect(result).toContain('"a.js"');
      expect(result).toContain('"b.js"');
    });

    it('複数エッジが改行で区切られて出力される', () => {
      const edges = [
        { from: 'a.js', to: 'b.js' },
        { from: 'a.js', to: 'c.js' },
      ];

      const result = buildMermaidGraph(edges);
      const edgeLines = result.split('\n').filter((l) => l.includes('-->'));

      expect(edgeLines).toHaveLength(2);
    });
  });

  describe('extractEdges', () => {
    it('require("./callee") から callee.js へのエッジを返す', () => {
      const content = "const { greet } = require('./callee');";
      const result = extractEdges(content, 'caller.js', '/repo');

      expect(result).toEqual([{ from: 'caller.js', to: 'callee.js' }]);
    });

    it('require("./callee.js") から callee.js へのエッジを返す', () => {
      const content = "const x = require('./callee.js');";
      const result = extractEdges(content, 'caller.js', '/repo');

      expect(result).toEqual([{ from: 'caller.js', to: 'callee.js' }]);
    });

    it('外部モジュール（相対パスなし）は除外する', () => {
      const content = "const fs = require('fs');\nconst path = require('path');";
      const result = extractEdges(content, 'caller.js', '/repo');

      expect(result).toEqual([]);
    });

    it('.js 拡張子なしの require も補完して返す', () => {
      const content = "const util = require('./util');";
      const result = extractEdges(content, 'dir/main.js', '/repo');

      expect(result).toEqual([{ from: 'dir/main.js', to: 'dir/util.js' }]);
    });

    it('require がない場合は空配列を返す', () => {
      const content = 'const x = 42;\nmodule.exports = { x };';
      const result = extractEdges(content, 'simple.js', '/repo');

      expect(result).toEqual([]);
    });

    it('複数の require から複数のエッジを返す', () => {
      const content = [
        "const a = require('./a');",
        "const b = require('./b');",
        "const fs = require('fs');",
      ].join('\n');

      const result = extractEdges(content, 'main.js', '/repo');

      expect(result).toHaveLength(2);
      expect(result).toContainEqual({ from: 'main.js', to: 'a.js' });
      expect(result).toContainEqual({ from: 'main.js', to: 'b.js' });
    });
  });
});
