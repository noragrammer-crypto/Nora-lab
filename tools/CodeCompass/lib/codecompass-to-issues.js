'use strict';

const cp = require('child_process');

/**
 * actions.md の ## リファクタリング提案 セクション以下にある
 * ### `<filepath>` エントリをすべてパースして返す。
 *
 * @param {string} content - actions.md の全文
 * @returns {Array<{file: string, hotspot_score: number}>}
 */
function parseActionsMd(content) {
  if (!content) return [];

  const sectionMatch = content.match(/^## リファクタリング提案\s*\n([\s\S]*)$/m);
  if (!sectionMatch) return [];

  const proposalSection = sectionMatch[1];
  const proposals = [];

  // Split on ### ` to get individual file sections
  const parts = proposalSection.split(/^### `/m);

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const backtickIdx = part.indexOf('`');
    if (backtickIdx === -1) continue;

    const file = part.slice(0, backtickIdx);
    const body = part.slice(backtickIdx + 1);

    const scoreMatch = body.match(/hotspot_score:\s*\*\*([0-9.]+)\*\*/);
    if (scoreMatch) {
      proposals.push({
        file,
        hotspot_score: parseFloat(scoreMatch[1]),
      });
    }
  }

  return proposals;
}

/**
 * リファクタリングイシューのタイトルを生成する。
 *
 * @param {string} file
 * @param {number} hotspot_score
 * @returns {string}
 */
function buildIssueTitle(file, hotspot_score) {
  return `[Refactoring] ${file} のリファクタリング（hotspot_score: ${hotspot_score}）`;
}

/**
 * proposals を GitHub Issue として発行する。
 * dryRun=true の場合は発行せず対象 proposals 配列を返すのみ。
 *
 * @param {Array<{file: string, hotspot_score: number}>} proposals
 * @param {{limit: number, dryRun: boolean, repo: string}} options
 * @returns {Promise<Array<{file: string, hotspot_score: number}>>}
 */
async function createIssues(proposals, { limit, dryRun, repo }) {
  const targets = proposals.slice(0, limit);

  if (dryRun) {
    return targets;
  }

  for (const { file, hotspot_score } of targets) {
    const title = buildIssueTitle(file, hotspot_score);
    const labels = 'refactoring,codecompass-detected';
    const body = `CodeCompass ホットスポット分析による自動発行\n\n- file: \`${file}\`\n- hotspot_score: ${hotspot_score}`;
    const cmd = `gh issue create --repo ${repo} --title "${title}" --label "${labels}" --body "${body.replace(/"/g, '\\"')}"`;
    cp.execSync(cmd);
  }

  return targets;
}

module.exports = { parseActionsMd, buildIssueTitle, createIssues };
