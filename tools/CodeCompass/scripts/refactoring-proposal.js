#!/usr/bin/env node
'use strict';

/**
 * CodeCompass: リファクタリング提案エンジン CLI（Story #1180 / Task #1216）
 *
 * 使い方:
 *   node CodeCompass/scripts/refactoring-proposal.js \
 *     [--hotspots=<path>]  (省略時: codecompass/hotspots.json)
 *     [--graph=<path>]     (省略時: codecompass/dependency-graph.mmd)
 *     [--out=<path>]       (省略時: codecompass/actions.md)
 *
 * hotspots.json と dependency-graph.mmd を統合し、
 * リファクタリング提案 Markdown（actions.md）を出力する。
 */

const fs = require('fs');
const path = require('path');
const { buildStructuredJson, generateActionsMarkdown } = require('../lib/refactoring-proposal');

const USAGE = 'Usage: node refactoring-proposal.js [--hotspots=<path>] [--graph=<path>] [--out=<path>]';

const DEFAULT_HOTSPOTS = path.join(process.cwd(), 'codecompass', 'hotspots.json');
const DEFAULT_GRAPH = path.join(process.cwd(), 'codecompass', 'dependency-graph.mmd');
const DEFAULT_OUT = path.join(process.cwd(), 'codecompass', 'actions.md');

function parseArgs(argv) {
  const args = {
    hotspots: null,
    graph: null,
    out: null,
  };

  for (const arg of argv) {
    if (arg.startsWith('--hotspots=')) {
      args.hotspots = arg.slice('--hotspots='.length);
    } else if (arg.startsWith('--graph=')) {
      args.graph = arg.slice('--graph='.length);
    } else if (arg.startsWith('--out=')) {
      args.out = arg.slice('--out='.length);
    }
  }

  return args;
}

function main(argv) {
  const { hotspots: hotspotsArg, graph: graphArg, out: outArg } = parseArgs(argv);

  const hotspotsPath = hotspotsArg || DEFAULT_HOTSPOTS;
  const graphPath = graphArg || DEFAULT_GRAPH;
  const outPath = outArg || DEFAULT_OUT;

  // --hotspots が指定されていない場合でもデフォルトを試みる
  // ただしデフォルトパスが存在しない場合は Usage を表示して終了
  if (!hotspotsArg && !fs.existsSync(hotspotsPath)) {
    process.stderr.write(`${USAGE}\n`);
    process.stderr.write(`Error: hotspots file not found: ${hotspotsPath}\n`);
    process.exitCode = 1;
    return;
  }

  if (!fs.existsSync(hotspotsPath)) {
    process.stderr.write(`Error: hotspots file not found: ${hotspotsPath}\n`);
    process.stderr.write(`${USAGE}\n`);
    process.exitCode = 1;
    return;
  }

  let hotspots;
  try {
    hotspots = JSON.parse(fs.readFileSync(hotspotsPath, 'utf8'));
  } catch (err) {
    process.stderr.write(`Error: failed to parse hotspots JSON: ${err.message}\n`);
    process.exitCode = 1;
    return;
  }

  let mmdContent = '';
  if (fs.existsSync(graphPath)) {
    mmdContent = fs.readFileSync(graphPath, 'utf8');
  }

  const structuredJson = buildStructuredJson(hotspots, mmdContent);
  const markdown = generateActionsMarkdown(structuredJson);

  if (outArg) {
    const outDir = path.dirname(outPath);
    if (outDir !== '.') fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outPath, markdown);
  } else if (!hotspotsArg && !graphArg) {
    // すべてデフォルト → codecompass/actions.md に書き出す
    const outDir = path.dirname(outPath);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outPath, markdown);
    process.stdout.write(markdown);
  } else {
    // --hotspots や --graph は指定されたが --out は省略 → 標準出力
    process.stdout.write(markdown);
  }
}

main(process.argv.slice(2));
