'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULT_EXCLUDE_PATTERNS = [
  'dist/',
  'build/',
  'node_modules/',
  '.obsidian/',
  '*.min.js',
  '*-lock.json',
  'package-lock.json',
  'yarn.lock',
];

const IGNORE_FILE_NAME = '.codecompassignore';

/**
 * `*` のみ対応する glob パターンを正規表現に変換する。
 */
function globToRegExp(pattern) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`);
}

/**
 * 単一の除外パターンが相対パスにマッチするか判定する。
 * 末尾が `/` のパターンはディレクトリ指定として、パスの各セグメントとの一致を見る。
 * それ以外は glob パターンとして相対パス全体・ファイル名（basename）の両方を確認する。
 */
function matchesPattern(relativePath, pattern) {
  if (pattern.endsWith('/')) {
    const dir = pattern.slice(0, -1);
    return relativePath.split('/').includes(dir);
  }

  const regex = globToRegExp(pattern);
  return regex.test(relativePath) || regex.test(path.basename(relativePath));
}

/**
 * 相対パスがいずれかの除外パターンにマッチするか判定する。
 * @param {string} relativePath
 * @param {string[]} patterns
 */
function isExcluded(relativePath, patterns) {
  return patterns.some((pattern) => matchesPattern(relativePath, pattern));
}

/**
 * `.codecompassignore` が存在する場合、空行・`#` コメントを除いた行をパターンとして読み込む。
 * @param {string} repoPath
 * @returns {string[]}
 */
function loadIgnoreFile(repoPath) {
  const ignorePath = path.join(repoPath, IGNORE_FILE_NAME);
  if (!fs.existsSync(ignorePath)) return [];

  return fs
    .readFileSync(ignorePath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));
}

/**
 * デフォルト除外パターン + `.codecompassignore` + CLI 指定パターンをこの順で統合する。
 * @param {{ repoPath: string, cliPatterns?: string[] }} options
 * @returns {string[]}
 */
function resolveExcludePatterns({ repoPath, cliPatterns = [] }) {
  return [...DEFAULT_EXCLUDE_PATTERNS, ...loadIgnoreFile(repoPath), ...cliPatterns];
}

module.exports = {
  DEFAULT_EXCLUDE_PATTERNS,
  matchesPattern,
  isExcluded,
  loadIgnoreFile,
  resolveExcludePatterns,
};
