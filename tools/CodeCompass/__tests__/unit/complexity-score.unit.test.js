'use strict';

/**
 * Unit Tests: CodeCompass 複雑度スコアリングエンジン（#1185）
 *
 * AST解析・LOC算出を担う純粋関数（countJsComplexity, countLines）を対象とする。
 * ファイルI/O・サブプロセス起動を伴わない範囲を検証する。
 */

const { countLines, countJsComplexity } = require('../../lib/complexity-score');

describe('complexity-score lib (unit)', () => {
  describe('countLines', () => {
    it('末尾改行ありの文字列は改行区切りの行数として数える', () => {
      expect(countLines('a\nb\nc\n')).toBe(3);
    });

    it('末尾改行なしの文字列も最終行を含めて数える', () => {
      expect(countLines('a\nb\nc')).toBe(3);
    });

    it('空文字列は 0 行として扱う', () => {
      expect(countLines('')).toBe(0);
    });
  });

  describe('countJsComplexity', () => {
    it('制御フロー文を含まないコードは複雑度 0 になる', () => {
      expect(countJsComplexity('const x = 1;\nfunction f() { return x; }\n')).toBe(0);
    });

    it('if/for/while/switch をそれぞれ1個としてカウントする', () => {
      const source = [
        'function f(x) {',
        '  if (x > 0) {',
        '    for (let i = 0; i < x; i++) {',
        '      while (i < 1) { i++; }',
        '    }',
        '  }',
        '  switch (x) {',
        '    case 1:',
        '      return 1;',
        '    default:',
        '      return 0;',
        '  }',
        '}',
      ].join('\n');

      expect(countJsComplexity(source)).toBe(4);
    });

    it('else 節・case/default 節は派生節のため二重カウントしない（else-if は別の if として数える）', () => {
      const source = [
        'function f(x) {',
        '  if (x > 0) {',
        '    return 1;',
        '  } else if (x < 0) {',
        '    return -1;',
        '  } else {',
        '    return 0;',
        '  }',
        '}',
      ].join('\n');

      expect(countJsComplexity(source)).toBe(2);
    });

    it('for-in / for-of / do-while も制御フローとしてカウントする', () => {
      const source = [
        'function f(obj, items) {',
        '  for (const k in obj) { console.log(k); }',
        '  for (const item of items) { console.log(item); }',
        '  let i = 0;',
        '  do { i++; } while (i < 3);',
        '}',
      ].join('\n');

      expect(countJsComplexity(source)).toBe(3);
    });
  });
});
