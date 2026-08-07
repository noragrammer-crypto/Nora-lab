'use strict';

/**
 * Unit Tests: CodeCompass 除外パターン解決エンジン（#1405）
 *
 * デフォルト除外パターンとのマッチ判定（matchesPattern / isExcluded）、
 * `.codecompassignore` の読み込み（loadIgnoreFile）、
 * 最終的なパターン統合（resolveExcludePatterns）を対象とする。
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  DEFAULT_EXCLUDE_PATTERNS,
  matchesPattern,
  isExcluded,
  loadIgnoreFile,
  resolveExcludePatterns,
} = require('../../lib/exclude-patterns');

describe('exclude-patterns lib (unit)', () => {
  describe('matchesPattern', () => {
    it('末尾が / のパターンはパスのいずれかのセグメントに一致すれば除外する', () => {
      expect(matchesPattern('dist/bundle.js', 'dist/')).toBe(true);
      expect(matchesPattern('sub/dist/bundle.js', 'dist/')).toBe(true);
      expect(matchesPattern('dist', 'dist/')).toBe(true);
    });

    it('末尾が / のパターンは部分一致するセグメントには一致しない', () => {
      expect(matchesPattern('distfiles/bundle.js', 'dist/')).toBe(false);
      expect(matchesPattern('src/app.js', 'dist/')).toBe(false);
    });

    it('* を含むパターンはファイル名（basename）に対する glob マッチとして扱う', () => {
      expect(matchesPattern('build/output.min.js', '*.min.js')).toBe(true);
      expect(matchesPattern('foo-lock.json', '*-lock.json')).toBe(true);
      expect(matchesPattern('foo.js', '*.min.js')).toBe(false);
    });

    it('* を含まないパターンは相対パス全体またはファイル名との完全一致で判定する', () => {
      expect(matchesPattern('package-lock.json', 'package-lock.json')).toBe(true);
      expect(matchesPattern('nested/package-lock.json', 'package-lock.json')).toBe(true);
      expect(matchesPattern('package-lock.json.bak', 'package-lock.json')).toBe(false);
    });
  });

  describe('isExcluded', () => {
    it('いずれかのパターンに一致すれば true を返す', () => {
      expect(isExcluded('dist/bundle.js', ['node_modules/', 'dist/'])).toBe(true);
    });

    it('どのパターンにも一致しなければ false を返す', () => {
      expect(isExcluded('src/app.js', ['node_modules/', 'dist/'])).toBe(false);
    });

    it('パターン配列が空の場合は常に false を返す', () => {
      expect(isExcluded('dist/bundle.js', [])).toBe(false);
    });
  });

  describe('DEFAULT_EXCLUDE_PATTERNS', () => {
    it('dist/ build/ node_modules/ .obsidian/ *.min.js *-lock.json package-lock.json yarn.lock を含む', () => {
      expect(DEFAULT_EXCLUDE_PATTERNS).toEqual(
        expect.arrayContaining([
          'dist/',
          'build/',
          'node_modules/',
          '.obsidian/',
          '*.min.js',
          '*-lock.json',
          'package-lock.json',
          'yarn.lock',
        ])
      );
    });
  });

  describe('loadIgnoreFile', () => {
    let repoDir;

    beforeEach(() => {
      repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codecompass-ignorefile-'));
    });

    afterEach(() => {
      fs.rmSync(repoDir, { recursive: true, force: true });
    });

    it('.codecompassignore が存在しない場合は空配列を返す', () => {
      expect(loadIgnoreFile(repoDir)).toEqual([]);
    });

    it('.codecompassignore の各行をパターンとして読み込む', () => {
      fs.writeFileSync(path.join(repoDir, '.codecompassignore'), 'coverage/\n*.snap\n');

      expect(loadIgnoreFile(repoDir)).toEqual(['coverage/', '*.snap']);
    });

    it('空行・# コメント行は無視する', () => {
      fs.writeFileSync(
        path.join(repoDir, '.codecompassignore'),
        ['# comment', '', 'coverage/', '  ', '# another comment'].join('\n')
      );

      expect(loadIgnoreFile(repoDir)).toEqual(['coverage/']);
    });
  });

  describe('resolveExcludePatterns', () => {
    let repoDir;

    beforeEach(() => {
      repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codecompass-resolve-'));
    });

    afterEach(() => {
      fs.rmSync(repoDir, { recursive: true, force: true });
    });

    it('デフォルトパターンのみの場合はデフォルト配列をそのまま返す', () => {
      expect(resolveExcludePatterns({ repoPath: repoDir })).toEqual(DEFAULT_EXCLUDE_PATTERNS);
    });

    it('.codecompassignore と CLI 指定パターンをデフォルトに追加する', () => {
      fs.writeFileSync(path.join(repoDir, '.codecompassignore'), 'coverage/\n');

      const result = resolveExcludePatterns({ repoPath: repoDir, cliPatterns: ['*.tmp'] });

      expect(result).toEqual([...DEFAULT_EXCLUDE_PATTERNS, 'coverage/', '*.tmp']);
    });
  });
});
