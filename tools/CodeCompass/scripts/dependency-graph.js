#!/usr/bin/env node
'use strict';

/**
 * CodeCompass: 依存グラフ生成エンジン CLI（Story #1179 / Task #1206）
 *
 * 使い方:
 *   node CodeCompass/scripts/dependency-graph.js <repoPath>
 *     [--hotspots=<path>] [--topN=<n>] [--out=<path>] [--maxDepth=<n>]
 *
 * hotspots.json を読み込んでスコア上位 topN のファイルを抽出し、
 * caller/callee 依存関係を Mermaid graph LR 形式で出力する。
 * --hotspots: hotspots.json のパス（省略時は <repoPath>/hotspots.json）
 * --topN: 分析対象とする上位ファイル数（省略時は非ゼロファイルの20%）
 * --out: Mermaid 出力先ファイルパス（省略時は標準出力）
 * --maxDepth: 依存追跡の深さ（現バージョンでは1固定）
 */

const fs = require('fs');
const path = require('path');
const { selectTopFiles, analyzeDependencyGraph } = require('../lib/dependency-graph');

const USAGE =
  'Usage: node dependency-graph.js <repoPath> [--hotspots=<path>] [--topN=<n>] [--out=<path>] [--maxDepth=<n>]';

function parseArgs(argv) {
  const args = { repoPath: null, hotspots: null, topN: null, out: null, maxDepth: 1 };

  for (const arg of argv) {
    if (arg.startsWith('--hotspots=')) {
      args.hotspots = arg.slice('--hotspots='.length);
    } else if (arg.startsWith('--topN=')) {
      args.topN = parseInt(arg.slice('--topN='.length), 10);
    } else if (arg.startsWith('--out=')) {
      args.out = arg.slice('--out='.length);
    } else if (arg.startsWith('--maxDepth=')) {
      args.maxDepth = parseInt(arg.slice('--maxDepth='.length), 10);
    } else if (!arg.startsWith('--')) {
      args.repoPath = arg;
    }
  }

  return args;
}

function main(argv) {
  const { repoPath, hotspots: hotspotsArg, topN: topNArg, out, maxDepth } = parseArgs(argv);

  if (!repoPath) {
    process.stderr.write(`${USAGE}\n`);
    process.exitCode = 1;
    return;
  }

  const resolvedRepo = path.resolve(repoPath);
  const hotspotsPath = hotspotsArg || path.join(resolvedRepo, 'hotspots.json');

  let hotspots = [];
  if (fs.existsSync(hotspotsPath)) {
    hotspots = JSON.parse(fs.readFileSync(hotspotsPath, 'utf8'));
  }

  const nonZeroCount = hotspots.filter((h) => h.hotspotScore > 0).length;
  const topN = topNArg !== null ? topNArg : Math.max(1, Math.ceil(nonZeroCount * 0.2));

  const topFiles = selectTopFiles(hotspots, topN);
  const mmd = analyzeDependencyGraph({ repoPath: resolvedRepo, topFiles, maxDepth });

  if (out) {
    const outDir = path.dirname(out);
    if (outDir) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(out, mmd, 'utf8');
  } else {
    process.stdout.write(mmd);
  }
}

main(process.argv.slice(2));
