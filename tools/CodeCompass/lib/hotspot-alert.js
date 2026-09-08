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
 * gh 実行の失敗を「gh自体が使えない」ことを示すエラーとしてラップし直す
 * （呼び出し元がバリデーションエラー等と区別して fail-open / 終端アクションに倒せるようにする）。
 *
 * @param {Error} cause
 * @returns {Error}
 */
function wrapGhUnavailable(cause) {
  const err = new Error(`gh command failed: ${cause.message}`);
  err.ghUnavailable = true;
  err.cause = cause;
  return err;
}

/**
 * バッチ文脈の必須読み取り。代替値がないため gh 失敗時は `ghUnavailable: true`
 * タグ付きエラーを再送出し、呼び出し元（runHotspotAlert）で終端アクションに倒す。
 *
 * @param {{branch: string, repo: string}} params
 * @returns {number|null}
 */
function findLatestMergedPR({ branch, repo }) {
  let out;
  try {
    out = cp.execFileSync('gh', [
      'pr', 'list', '--repo', repo, '--base', branch, '--state', 'merged', '--limit', '1', '--json', 'number',
    ], { encoding: 'utf8' });
  } catch (err) {
    throw wrapGhUnavailable(err);
  }
  const list = JSON.parse(out);
  return list.length > 0 ? list[0].number : null;
}

/**
 * バッチ文脈の必須読み取り。代替値がないため gh 失敗時は `ghUnavailable: true`
 * タグ付きエラーを再送出し、呼び出し元（runHotspotAlert）で終端アクションに倒す。
 *
 * @param {{prNumber: number, repo: string}} params
 * @returns {string|null}
 */
function getHotspotComment({ prNumber, repo }) {
  let out;
  try {
    out = cp.execFileSync('gh', [
      'pr', 'view', String(prNumber), '--repo', repo, '--json', 'comments',
    ], { encoding: 'utf8' });
  } catch (err) {
    throw wrapGhUnavailable(err);
  }
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
 * 重複チェック（読み取り）。gh失敗時は「重複不明→作成続行」で fail-open する
 * （抑制の方が実害が大きいため、例外は投げず false を返す）。
 *
 * @param {{file: string, repo: string}} params
 * @returns {boolean}
 */
function issueExistsForFile({ file, repo }) {
  let out;
  try {
    out = cp.execFileSync('gh', [
      'issue', 'list', '--repo', repo, '--state', 'open',
      '--search', `codecompass-hotspot-alert:file=${file} in:body`, '--json', 'number',
    ], { encoding: 'utf8' });
  } catch (err) {
    return false;
  }
  const list = JSON.parse(out);
  return Array.isArray(list) && list.length > 0;
}

/**
 * 引数を配列で渡し、ファイル名等に含まれるシェルメタ文字を展開させない。
 * 書き込み操作のため、gh失敗時は例外を投げず構造化データを返して呼び出し元に委ねる
 * （`SocialMediaAgent/lib/report-post-failure.js` と同じ `gh-failed` パターン）。
 *
 * @param {{file: string, hotspotScore: number, evidence: string, repo: string, prNumber: number}} params
 * @returns {undefined|{action: 'gh-failed', file: string, hotspotScore: number, evidence: string, prNumber: number}}
 */
function createAlertIssue({ file, hotspotScore, evidence, repo, prNumber }) {
  const title = buildAlertIssueTitle(file, hotspotScore);
  const body = buildAlertIssueBody({ file, hotspotScore, evidence, prNumber });
  try {
    cp.execFileSync('gh', [
      'issue', 'create', '--repo', repo, '--title', title,
      '--label', 'enhancement,codecompass-detected', '--body', body,
    ]);
  } catch (err) {
    return { action: 'gh-failed', file, hotspotScore, evidence, prNumber };
  }
  return undefined;
}

/**
 * @param {{branch?: string, threshold?: number, repo: string, dryRun?: boolean}} params
 * @returns {{action: string, file: string|null, hotspotScore: number|null}} action は
 *   'created' | 'skipped-no-data' | 'skipped-below-threshold' | 'skipped-duplicate' |
 *   'skipped-gh-unavailable'（#3220: 必須読み取りでgh失敗） | 'gh-failed'（#3220: 起票失敗） のいずれか
 */
function runHotspotAlert({ branch = 'main', threshold = 1, repo, dryRun = false }) {
  let prNumber;
  try {
    prNumber = findLatestMergedPR({ branch, repo });
  } catch (err) {
    if (err.ghUnavailable) {
      return { action: 'skipped-gh-unavailable', file: null, hotspotScore: null };
    }
    throw err;
  }
  if (prNumber === null) {
    return { action: 'skipped-no-data', file: null, hotspotScore: null };
  }

  let commentBody;
  try {
    commentBody = getHotspotComment({ prNumber, repo });
  } catch (err) {
    if (err.ghUnavailable) {
      return { action: 'skipped-gh-unavailable', file: null, hotspotScore: null };
    }
    throw err;
  }
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
    const createResult = createAlertIssue({ file: top.file, hotspotScore: top.hotspotScore, evidence, repo, prNumber });
    if (createResult && createResult.action === 'gh-failed') {
      return createResult;
    }
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
