'use strict';

/**
 * ホットスポットスコア + 依存グラフ情報を統合した構造化JSONを生成し、
 * リファクタリング提案 Markdown を出力する。
 *
 * CodeCompass レイヤー3: AIアーキテクト連携
 */

/**
 * Mermaid graph 文字列からエッジ（from → to）を抽出する。
 * 引用符あり・なし、|calls| アノテーションありなし の両形式に対応する。
 *   "a.js" -->|calls| "b.js"
 *   a.js --> b.js
 * @param {string} mmdContent
 * @returns {Array<{from: string, to: string}>}
 */
function parseMmdEdges(mmdContent) {
  if (!mmdContent) return [];
  const edges = [];
  // matches: optional-quote, non-whitespace file, optional-quote, -->, optional |label|, optional-quote, file, optional-quote
  const pattern = /"?([^"'\s\n]+)"?\s+-->(?:\|[^|]*\|)?\s+"?([^"'\s\n]+)"?/g;
  let match;
  while ((match = pattern.exec(mmdContent)) !== null) {
    const from = match[1];
    const to = match[2];
    // skip graph header tokens like "LR", "TD", etc.
    if (from === 'graph' || to === 'graph') continue;
    edges.push({ from, to });
  }
  return edges;
}

/**
 * ホットスポット配列と Mermaid 依存グラフを統合し、構造化JSONを生成する。
 * コードそのものは含めない（判断ブレ防止）。
 *
 * @param {Array<{file: string, hotspotScore: number, complexity: number, changes: number, loc: number, linesChanged: number}>} hotspots
 * @param {string} mmdContent - Mermaid graph 文字列
 * @returns {Array<{file: string, hotspot_score: number, complexity: number, changes_90d: number, callers: number, callees: number}>}
 */
function buildStructuredJson(hotspots, mmdContent) {
  if (!hotspots || hotspots.length === 0) return [];

  const edges = parseMmdEdges(mmdContent);

  // callers[file] = 他ファイルから呼ばれる回数（to 側に登場する回数）
  // callees[file] = 自ファイルが呼ぶファイル数（from 側に登場する回数）
  const callersMap = new Map();
  const calleesMap = new Map();

  for (const { from, to } of edges) {
    calleesMap.set(from, (calleesMap.get(from) || 0) + 1);
    callersMap.set(to, (callersMap.get(to) || 0) + 1);
  }

  return hotspots.map(({ file, hotspotScore, complexity, changes }) => ({
    file,
    hotspot_score: hotspotScore,
    complexity,
    changes_90d: changes,
    callers: callersMap.get(file) || 0,
    callees: calleesMap.get(file) || 0,
  }));
}

/**
 * 構造化JSON配列からリファクタリング提案 Markdown を生成する。
 * xp_Architect プロンプト形式に沿った設計提案を返す。
 *
 * @param {Array<{file: string, hotspot_score: number, complexity: number, changes_90d: number, callers: number, callees: number}>} structuredJson
 * @returns {string}
 */
function generateActionsMarkdown(structuredJson) {
  const lines = ['# CodeCompass リファクタリング提案', ''];

  if (!structuredJson || structuredJson.length === 0) {
    lines.push('ホットスポットが検出されませんでした。');
    return lines.join('\n') + '\n';
  }

  lines.push('## ホットスポット一覧');
  lines.push('');
  lines.push('| file | hotspot_score | complexity | changes_90d | callers | callees |');
  lines.push('|------|--------------|-----------|------------|---------|---------|');

  for (const { file, hotspot_score, complexity, changes_90d, callers, callees } of structuredJson) {
    lines.push(
      `| ${file} | ${hotspot_score.toFixed(4)} | ${complexity} | ${changes_90d} | ${callers} | ${callees} |`
    );
  }

  lines.push('');
  lines.push('## リファクタリング提案');
  lines.push('');

  for (const { file, hotspot_score, complexity, callers, callees } of structuredJson) {
    if (hotspot_score === 0) continue;

    lines.push(`### \`${file}\``);
    lines.push('');
    lines.push(`- hotspot_score: **${hotspot_score.toFixed(4)}**`);
    lines.push(`- complexity: ${complexity}`);
    lines.push(`- callers: ${callers} / callees: ${callees}`);
    lines.push('');

    const suggestions = [];

    if (complexity >= 20) {
      suggestions.push('複雑度が高い。IPO分離またはメソッド抽出でモジュールを分割することを推奨。');
    }
    if (callers >= 5) {
      suggestions.push(`${callers} 箇所から呼ばれている。変更時の影響範囲が広い。インターフェースを安定させること。`);
    }
    if (callees >= 5) {
      suggestions.push(`${callees} モジュールに依存している。依存関係逆転原則（DI）の適用を検討。`);
    }
    if (suggestions.length === 0) {
      suggestions.push('変更頻度と複雑度の組み合わせによりリファクタリング候補として検出。定期的なレビューを推奨。');
    }

    for (const s of suggestions) {
      lines.push(`- ${s}`);
    }
    lines.push('');
  }

  return lines.join('\n') + '\n';
}

module.exports = { buildStructuredJson, generateActionsMarkdown };
