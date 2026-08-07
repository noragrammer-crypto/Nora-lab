'use strict';

const cp = require('child_process');

/**
 * `.github/workflows/codecompass.yml` が投稿する `## CodeCompass Hotspots (Top 10)`
 * コメント本文（`scripts/hotspot.js` の `toMarkdown()` 出力）をパースする。
 *
 * @param {string} commentBody
 * @returns {Array<{file: string, hotspotScore: number, complexity: number, changes: number, loc: number, linesChanged: number}>}
 */
function parseHotspotTable(commentBody) {
  if (!commentBody) return [];

  const lines = commentBody.split('\n');
  const headerIdx = lines.findIndex((line) => /^\|\s*file\s*\|\s*hotspotScore\s*\|/.test(line));
  if (headerIdx === -1) return [];

  const rows = [];
  for (let i = headerIdx + 2; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith('|')) break;

    const cells = line.split('|').map((c) => c.trim()).filter((c) => c.length > 0);
    if (cells.length < 6) continue;

    const [file, hotspotScore, complexity, changes, loc, linesChanged] = cells;
    rows.push({
      file,
      hotspotScore: parseFloat(hotspotScore),
      complexity: parseInt(complexity, 10),
      changes: parseInt(changes, 10),
      loc: parseInt(loc, 10),
      linesChanged: parseInt(linesChanged, 10),
    });
  }

  return rows;
}

/**
 * トップ1件の hotspotScore がしきい値を超えるか判定する。
 * 超えている場合は2位以下の changes 最大値との比較を根拠文字列にする。
 *
 * @param {Array<object>} rows
 * @param {number} threshold
 * @returns {{shouldAlert: boolean, top: object|null, evidence: string}}
 */
function evaluateTopHotspot(rows, threshold) {
  if (!rows || rows.length === 0) {
    return { shouldAlert: false, top: null, evidence: '' };
  }

  const top = rows[0];
  if (top.hotspotScore <= threshold) {
    return { shouldAlert: false, top, evidence: '' };
  }

  const rest = rows.slice(1);
  let evidence;
  if (rest.length === 0) {
    evidence = '他に比較対象なし';
  } else {
    const maxChanges = Math.max(...rest.map((r) => r.changes));
    const ratio = maxChanges === 0 ? top.changes : top.changes / maxChanges;
    evidence = `changes=${top.changes} は2位以下の最大${maxChanges}の${ratio.toFixed(1)}倍`;
  }

  return { shouldAlert: true, top, evidence };
}

function buildAlertIssueTitle(file, hotspotScore) {
  return `[CodeCompass Alert] ${file} の構造的リファクタリング検討（hotspotScore: ${hotspotScore}）`;
}

/**
 * 処方箋（具体的な修正方法）は書かず、構造的リファクタリング検討の指摘と根拠データのみを記載する。
 * 設計判断は xp_Architect に委譲する旨を明記する。
 *
 * @param {{file: string, hotspotScore: number, evidence: string, prNumber: number}} params
 * @returns {string}
 */
function buildAlertIssueBody({ file, hotspotScore, evidence, prNumber }) {
  return [
    `<!-- codecompass-hotspot-alert:file=${file} -->`,
    '',
    '## 構造的リファクタリングの検討が必要',
    '',
    'CodeCompass のホットスポット分析により、以下のファイルが構造的リファクタリング検討の対象として検出されました。',
    '',
    `- file: ${file}`,
    `- hotspotScore: ${hotspotScore}`,
    `- 根拠: ${evidence}`,
    `- 検出元PR: #${prNumber}`,
    '',
    '設計判断（具体的な修正方法・分割方針等）は本Issueには記載せず、xp_Architect に委譲します。',
  ].join('\n');
}

/**
 * @param {{branch: string, repo: string}} params
 * @returns {number|null}
 */
function findLatestMergedPR({ branch, repo }) {
  const cmd = `gh pr list --repo ${repo} --base ${branch} --state merged --limit 1 --json number`;
  const out = cp.execSync(cmd, { encoding: 'utf8' });
  const list = JSON.parse(out);
  return list.length > 0 ? list[0].number : null;
}

/**
 * @param {{prNumber: number, repo: string}} params
 * @returns {string|null}
 */
function getHotspotComment({ prNumber, repo }) {
  const cmd = `gh pr view ${prNumber} --repo ${repo} --json comments`;
  const out = cp.execSync(cmd, { encoding: 'utf8' });
  const { comments } = JSON.parse(out);
  if (!comments) return null;

  for (let i = comments.length - 1; i >= 0; i--) {
    if (/^## CodeCompass Hotspots/m.test(comments[i].body)) {
      return comments[i].body;
    }
  }

  return null;
}

/**
 * @param {{file: string, repo: string}} params
 * @returns {boolean}
 */
function issueExistsForFile({ file, repo }) {
  const cmd = `gh issue list --repo ${repo} --state open --search "codecompass-hotspot-alert:file=${file} in:body" --json number`;
  const out = cp.execSync(cmd, { encoding: 'utf8' });
  const list = JSON.parse(out);
  return Array.isArray(list) && list.length > 0;
}

/**
 * `lib/codecompass-to-issues.js` の `createIssues` と同じ execSync パターンに従う。
 *
 * @param {{file: string, hotspotScore: number, evidence: string, repo: string, prNumber: number}} params
 */
function createAlertIssue({ file, hotspotScore, evidence, repo, prNumber }) {
  const title = buildAlertIssueTitle(file, hotspotScore);
  const body = buildAlertIssueBody({ file, hotspotScore, evidence, prNumber });
  const cmd = `gh issue create --repo ${repo} --title "${title}" --label "enhancement,codecompass-detected" --body "${body.replace(/"/g, '\\"')}"`;
  cp.execSync(cmd);
}

/**
 * @param {{branch?: string, threshold?: number, repo: string, dryRun?: boolean}} params
 * @returns {{action: string, file: string|null, hotspotScore: number|null}}
 */
function runHotspotAlert({ branch = 'main', threshold = 1, repo, dryRun = false }) {
  const prNumber = findLatestMergedPR({ branch, repo });
  if (prNumber === null) {
    return { action: 'skipped-no-data', file: null, hotspotScore: null };
  }

  const commentBody = getHotspotComment({ prNumber, repo });
  if (!commentBody) {
    return { action: 'skipped-no-data', file: null, hotspotScore: null };
  }

  const rows = parseHotspotTable(commentBody);
  const { shouldAlert, top, evidence } = evaluateTopHotspot(rows, threshold);

  if (!shouldAlert) {
    return {
      action: 'skipped-below-threshold',
      file: top ? top.file : null,
      hotspotScore: top ? top.hotspotScore : null,
    };
  }

  if (issueExistsForFile({ file: top.file, repo })) {
    return { action: 'skipped-duplicate', file: top.file, hotspotScore: top.hotspotScore };
  }

  if (!dryRun) {
    createAlertIssue({ file: top.file, hotspotScore: top.hotspotScore, evidence, repo, prNumber });
  }

  return { action: 'created', file: top.file, hotspotScore: top.hotspotScore };
}

module.exports = {
  parseHotspotTable,
  evaluateTopHotspot,
  buildAlertIssueTitle,
  buildAlertIssueBody,
  findLatestMergedPR,
  getHotspotComment,
  issueExistsForFile,
  createAlertIssue,
  runHotspotAlert,
};
