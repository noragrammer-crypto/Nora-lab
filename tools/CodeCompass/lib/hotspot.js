'use strict';

const { analyzeChangeFrequency } = require('./change-frequency');
const { analyzeComplexity } = require('./complexity-score');

/**
 * 変更頻度データと複雑度データをファイル名で結合する。
 * 複雑度データに存在するファイルが基準。変更頻度データに存在しないファイルは changes=0 とする。
 * @param {{ file: string, changes: number, linesChanged: number }[]} changeFrequency
 * @param {{ file: string, complexity: number, loc: number }[]} complexity
 * @returns {{ file: string, changes: number, linesChanged: number, complexity: number, loc: number }[]}
 */
function mergeData(changeFrequency, complexity) {
  const changeMap = new Map();
  for (const entry of changeFrequency) {
    changeMap.set(entry.file, entry);
  }

  return complexity.map(({ file, complexity: cx, loc }) => {
    const change = changeMap.get(file) || { changes: 0, linesChanged: 0 };
    return { file, changes: change.changes, linesChanged: change.linesChanged, complexity: cx, loc };
  });
}

/**
 * マージ済みデータから密度スコア (changes × complexity) / loc を算出し、スコア降順でソートする。
 * LOC または complexity が 0 の場合は hotspotScore = 0。
 * @param {{ file: string, changes: number, linesChanged: number, complexity: number, loc: number }[]} merged
 * @returns {{ file: string, hotspotScore: number, complexity: number, changes: number, loc: number, linesChanged: number }[]}
 */
function computeHotspotScores(merged) {
  return merged
    .map(({ file, changes, linesChanged, complexity, loc }) => ({
      file,
      hotspotScore: loc === 0 || complexity === 0 ? 0 : (changes * complexity) / loc,
      complexity,
      changes,
      loc,
      linesChanged,
    }))
    .sort((a, b) => b.hotspotScore - a.hotspotScore);
}

/**
 * 指定リポジトリのホットスポットランキングを算出する。
 * @param {{ repoPath: string, days?: number, excludePatterns?: string[] }} options
 * @returns {{ file: string, hotspotScore: number, complexity: number, changes: number, loc: number, linesChanged: number }[]}
 */
function analyzeHotspots({ repoPath, days = 90, excludePatterns = [] }) {
  const changeFrequency = analyzeChangeFrequency({ repoPath, days, excludePatterns });
  const complexity = analyzeComplexity({ repoPath, excludePatterns });
  return computeHotspotScores(mergeData(changeFrequency, complexity));
}

module.exports = { mergeData, computeHotspotScores, analyzeHotspots };
