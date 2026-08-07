#!/usr/bin/env node
'use strict';

/**
 * CodeCompass: ホットスポット判定エンジン CLI（Story #1178 / Task #1198）
 *
 * 使い方:
 *   node CodeCompass/scripts/hotspot.js <repoPath> [--days=<N>] [--out=<path>] [--md=<path>] [--ignore=<pattern,...>]
 *
 * 変更頻度（git log）と複雑度スコア（AST解析）を統合し、密度スコア
 * (changes × complexity) / loc でホットスポットをランキングした JSON 配列を出力する。
 * --out: JSON 出力先ファイル（省略時は標準出力）
 * --md: Markdown テーブル出力先ファイル（省略時は出力しない）
 * --days: 集計期間（デフォルト 90 日）
 * --ignore: 追加の除外パターン（カンマ区切り、複数可）。
 *           dist/ build/ node_modules/ .obsidian/ *.min.js 等のデフォルト除外パターンと
 *           対象リポジトリの `.codecompassignore` は常に適用される。
 */

const fs = require('fs');
const path = require('path');
const { analyzeHotspots } = require('../lib/hotspot');
const { resolveExcludePatterns } = require('../lib/exclude-patterns');

const USAGE =
  'Usage: node hotspot.js <repoPath> [--days=<N>] [--outDir=<dir>] [--out=<path>] [--md=<path>] [--ignore=<pattern,...>]';

function parseArgs(argv) {
  const args = { repoPath: null, days: 90, outDir: null, out: null, md: null, ignore: [] };

  for (const arg of argv) {
    if (arg.startsWith('--days=')) {
      args.days = Number(arg.slice('--days='.length));
    } else if (arg.startsWith('--outDir=')) {
      args.outDir = arg.slice('--outDir='.length);
    } else if (arg.startsWith('--out=')) {
      args.out = arg.slice('--out='.length);
    } else if (arg.startsWith('--md=')) {
      args.md = arg.slice('--md='.length);
    } else if (arg.startsWith('--ignore=')) {
      args.ignore = arg
        .slice('--ignore='.length)
        .split(',')
        .map((pattern) => pattern.trim())
        .filter((pattern) => pattern.length > 0);
    } else if (!arg.startsWith('--')) {
      args.repoPath = arg;
    }
  }

  return args;
}

function toMarkdown(hotspots) {
  const header = '| file | hotspotScore | complexity | changes | loc | linesChanged |';
  const separator = '|------|-------------|-----------|---------|-----|-------------|';
  const rows = hotspots.map(({ file, hotspotScore, complexity, changes, loc, linesChanged }) =>
    `| ${file} | ${hotspotScore.toFixed(4)} | ${complexity} | ${changes} | ${loc} | ${linesChanged} |`
  );
  return [header, separator, ...rows].join('\n') + '\n';
}

function main(argv) {
  const { repoPath, days, outDir, out, md, ignore } = parseArgs(argv);

  if (!repoPath) {
    process.stderr.write(`${USAGE}\n`);
    process.exitCode = 1;
    return;
  }

  const resolvedRepoPath = path.resolve(repoPath);
  const excludePatterns = resolveExcludePatterns({ repoPath: resolvedRepoPath, cliPatterns: ignore });
  const result = analyzeHotspots({ repoPath: resolvedRepoPath, days, excludePatterns });
  const json = JSON.stringify(result, null, 2);

  if (outDir) {
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'hotspots.json'), json);
    fs.writeFileSync(path.join(outDir, 'hotspots.md'), toMarkdown(result));
  } else if (out) {
    fs.writeFileSync(out, json);
    if (md) fs.writeFileSync(md, toMarkdown(result));
  } else {
    process.stdout.write(`${json}\n`);
    if (md) fs.writeFileSync(md, toMarkdown(result));
  }
}

main(process.argv.slice(2));
