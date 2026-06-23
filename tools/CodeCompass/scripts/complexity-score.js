#!/usr/bin/env node
'use strict';

/**
 * CodeCompass: 複雑度スコアリングエンジン CLI（Story #1177 / Task #1185）
 *
 * 使い方:
 *   node CodeCompass/scripts/complexity-score.js <repoPath> [--out=<path>]
 *
 * 指定したリポジトリパス配下の .js / .py ファイルを再帰的に走査し、AST解析による
 * 制御フロー文（if/for/while/switch等）の出現数を複雑度スコアとして算出する。
 * ファイルごとの { file, complexity, loc } を JSON 配列として
 * 標準出力（または --out 指定先）に書き出す。
 */

const fs = require('fs');
const path = require('path');
const { analyzeComplexity } = require('../lib/complexity-score');

const USAGE = 'Usage: node complexity-score.js <repoPath> [--out=<path>]';

function parseArgs(argv) {
  const args = { repoPath: null, out: null };

  for (const arg of argv) {
    if (arg.startsWith('--out=')) {
      args.out = arg.slice('--out='.length);
    } else if (!arg.startsWith('--')) {
      args.repoPath = arg;
    }
  }

  return args;
}

function main(argv) {
  const { repoPath, out } = parseArgs(argv);

  if (!repoPath) {
    process.stderr.write(`${USAGE}\n`);
    process.exitCode = 1;
    return;
  }

  const result = analyzeComplexity({ repoPath: path.resolve(repoPath) });
  const json = JSON.stringify(result, null, 2);

  if (out) {
    fs.writeFileSync(out, json);
  } else {
    process.stdout.write(`${json}\n`);
  }
}

main(process.argv.slice(2));
