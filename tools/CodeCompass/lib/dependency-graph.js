'use strict';

const fs = require('fs');
const path = require('path');

/**
 * hotspots 配列からスコア上位 topN 件のファイルパスを返す。
 * hotspotScore=0 のファイルは除外する。入力は hotspotScore 降順を前提とする。
 * @param {Array<{file: string, hotspotScore: number}>} hotspots
 * @param {number} topN
 * @returns {string[]}
 */
function selectTopFiles(hotspots, topN) {
  if (!topN || topN <= 0) return [];
  return hotspots
    .filter((h) => h.hotspotScore > 0)
    .slice(0, topN)
    .map((h) => h.file);
}

/**
 * エッジリストから Mermaid graph LR 形式の文字列を生成する。
 * @param {Array<{from: string, to: string}>} edges
 * @returns {string}
 */
function buildMermaidGraph(edges) {
  const lines = ['graph LR'];
  for (const { from, to } of edges) {
    lines.push(`  "${from}" -->|calls| "${to}"`);
  }
  return lines.join('\n') + '\n';
}

/**
 * ファイル内容から相対 require/import の依存エッジを抽出する。
 * 外部モジュール（相対パスなし）は除外する。
 * @param {string} content - ファイルの内容
 * @param {string} filePath - リポジトリルートからの相対パス
 * @param {string} _repoDir - リポジトリルートパス（将来の拡張用、現在未使用）
 * @returns {Array<{from: string, to: string}>}
 */
function extractEdges(content, filePath, _repoDir) {
  const edges = [];
  const dir = path.dirname(filePath);
  const requirePattern = /require\(['"`](\.\.?\/[^'"`]+)['"`]\)/g;
  let match;

  while ((match = requirePattern.exec(content)) !== null) {
    let imported = match[1];
    if (!path.extname(imported)) {
      imported += '.js';
    }
    const resolved = path.normalize(path.join(dir, imported)).replace(/\\/g, '/');
    edges.push({ from: filePath, to: resolved });
  }

  return edges;
}

/**
 * 指定されたファイル群の依存グラフを解析して Mermaid 文字列を返す。
 * topFiles にあるファイルの require を追いかけてエッジを構築する。
 * @param {{ repoPath: string, topFiles: string[], maxDepth?: number }} options
 * @returns {string}
 */
function analyzeDependencyGraph({ repoPath, topFiles, maxDepth = 1 }) {
  if (!topFiles || topFiles.length === 0) {
    return buildMermaidGraph([]);
  }

  const allEdges = [];
  const edgeSet = new Set();

  for (const filePath of topFiles) {
    const fullPath = path.join(repoPath, filePath);
    if (!fs.existsSync(fullPath)) continue;

    const content = fs.readFileSync(fullPath, 'utf8');
    const edges = extractEdges(content, filePath, repoPath);

    for (const edge of edges) {
      const key = `${edge.from}→${edge.to}`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        allEdges.push(edge);
      }
    }
  }

  return buildMermaidGraph(allEdges);
}

module.exports = { selectTopFiles, buildMermaidGraph, extractEdges, analyzeDependencyGraph };
