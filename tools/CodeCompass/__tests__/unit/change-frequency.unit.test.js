'use strict';

/**
 * Unit Tests: CodeCompass 変更頻度分析エンジン（#1182）
 *
 * `git log --numstat` の生出力を解釈する純粋関数（parseNumstatOutput）と、
 * ファイル単位への集計・ランキング化（aggregateChanges）を対象とする。
 * git リポジトリへの依存はなく、文字列・配列の入出力のみで検証する。
 */

const { parseNumstatOutput, aggregateChanges, analyzeChangeFrequency } = require('../../lib/change-frequency');

describe('change-frequency lib (unit)', () => {
  describe('parseNumstatOutput', () => {
    it('numstat形式の行から file・追加行数・削除行数を抽出する', () => {
      const raw = [
        'commit abc123',
        '',
        '10\t0\ta.js',
        '5\t2\tb.js',
        '',
        'commit def456',
        '',
        '3\t1\ta.js',
      ].join('\n');

      expect(parseNumstatOutput(raw)).toEqual([
        { file: 'a.js', additions: 10, deletions: 0 },
        { file: 'b.js', additions: 5, deletions: 2 },
        { file: 'a.js', additions: 3, deletions: 1 },
      ]);
    });

    it('バイナリファイルの "-" を 0 として扱う', () => {
      const raw = '-\t-\timage.png';

      expect(parseNumstatOutput(raw)).toEqual([
        { file: 'image.png', additions: 0, deletions: 0 },
      ]);
    });

    it('numstat形式に一致しない行（コミットハッシュ・著者行・空行）を無視する', () => {
      const raw = ['commit abc123', '', 'Author: test <test@example.com>', '', '1\t1\ta.js'].join('\n');

      expect(parseNumstatOutput(raw)).toEqual([{ file: 'a.js', additions: 1, deletions: 1 }]);
    });

    it('空文字列に対しては空配列を返す', () => {
      expect(parseNumstatOutput('')).toEqual([]);
    });
  });

  describe('aggregateChanges', () => {
    it('ファイルごとに変更回数（出現数）と変更行数（追加+削除の合計）を集計する', () => {
      const entries = [
        { file: 'a.js', additions: 10, deletions: 0 },
        { file: 'b.js', additions: 5, deletions: 2 },
        { file: 'a.js', additions: 3, deletions: 1 },
      ];

      expect(aggregateChanges(entries)).toEqual([
        { file: 'a.js', changes: 2, linesChanged: 14 },
        { file: 'b.js', changes: 1, linesChanged: 7 },
      ]);
    });

    it('変更回数（changes）の降順でソートする', () => {
      const entries = [
        { file: 'rare.js', additions: 100, deletions: 0 },
        { file: 'frequent.js', additions: 1, deletions: 0 },
        { file: 'frequent.js', additions: 1, deletions: 0 },
        { file: 'frequent.js', additions: 1, deletions: 0 },
      ];

      expect(aggregateChanges(entries).map((e) => e.file)).toEqual(['frequent.js', 'rare.js']);
    });

    it('空配列に対しては空配列を返す', () => {
      expect(aggregateChanges([])).toEqual([]);
    });
  });

  describe('analyzeChangeFrequency (regression: #1226 ENOBUFS)', () => {
    it('execFileSync を maxBuffer: 50MB で呼び出す', () => {
      const mockExecFileSync = jest.fn().mockReturnValue('');
      jest.resetModules();
      jest.doMock('child_process', () => ({ execFileSync: mockExecFileSync }));

      const { analyzeChangeFrequency: analyze } = require('../../lib/change-frequency');
      analyze({ repoPath: '/fake/repo', days: 90 });

      expect(mockExecFileSync).toHaveBeenCalledWith(
        'git',
        expect.any(Array),
        expect.objectContaining({ maxBuffer: 50 * 1024 * 1024 })
      );

      jest.resetModules();
    });
  });
});
