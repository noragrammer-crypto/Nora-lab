'use strict';

const { execFileSync } = require('child_process');
const { isExcluded } = require('./exclude-patterns');

const NUMSTAT_LINE = /^(\d+|-)\t(\d+|-)\t(.+)$/;

/**
 * `git log --numstat` の生出力を { file, additions, deletions } の配列に変換する。
 * コミットハッシュ行・著者行・空行など numstat 形式に一致しない行は無視する。
 * バイナリファイルの "-" は 0 として扱う。
 */
function parseNumstatOutput(raw) {
  const entries = [];

  for (const line of raw.split('\n')) {
    const match = NUMSTAT_LINE.exec(line);
    if (!match) continue;

    const [, addedRaw, deletedRaw, file] = match;
    entries.push({
      file,
      additions: addedRaw === '-' ? 0 : Number(addedRaw),
      deletions: deletedRaw === '-' ? 0 : Number(deletedRaw),
    });
  }

  return entries;
}

/**
 * numstat エントリ群をファイル単位に集計し、変更回数（出現数）の降順でランキング化する。
 * - changes: そのファイルが変更されたコミット数（エントリ出現数）
 * - linesChanged: 追加行数 + 削除行数の合計
 */
function aggregateChanges(entries) {
  const byFile = new Map();

  for (const { file, additions, deletions } of entries) {
    const current = byFile.get(file) || { file, changes: 0, linesChanged: 0 };
    current.changes += 1;
    current.linesChanged += additions + deletions;
    byFile.set(file, current);
  }

  return [...byFile.values()].sort((a, b) => b.changes - a.changes);
}

function fetchNumstatLog(repoPath, days) {
  return execFileSync(
    'git',
    ['log', '--numstat', `--since=${days}.days`, '--pretty=format:commit %H'],
    { cwd: repoPath, encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 }
  );
}

/**
 * 指定リポジトリの変更頻度を集計する。
 * @param {{ repoPath: string, days?: number, excludePatterns?: string[] }} options
 * @returns {{ file: string, changes: number, linesChanged: number }[]} changes 降順の配列
 */
function analyzeChangeFrequency({ repoPath, days = 90, excludePatterns = [] }) {
  const raw = fetchNumstatLog(repoPath, days);
  const entries = parseNumstatOutput(raw).filter((entry) => !isExcluded(entry.file, excludePatterns));
  return aggregateChanges(entries);
}

module.exports = { parseNumstatOutput, aggregateChanges, analyzeChangeFrequency };
