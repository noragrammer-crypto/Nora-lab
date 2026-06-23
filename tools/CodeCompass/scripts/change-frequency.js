#!/usr/bin/env node
'use strict';

/**
 * CodeCompass: 変更頻度分析エンジン CLI（Story #1176 / Task #1182）
 *
 * 使い方:
 *   node CodeCompass/scripts/change-frequency.js <repoPath> [--days=<N>] [--out=<path>]
 *
 * `git log --numstat` を集計し、ファイルごとの変更回数・変更行数（追加+削除）を
 * 変更頻度（changes）降順でランキングした JSON 配列を標準出力（または --out 指定先）に書き出す。
 * --days 省略時は直近90日を対象とする。
 */

const fs = require('fs');
const path = require('path');
const { analyzeChangeFrequency } = require('../lib/change-frequency');

const USAGE = 'Usage: node change-frequency.js <repoPath> [--days=<N>] [--out=<path>]';

function parseArgs(argv) {
  const args = { repoPath: null, days: 90, out: null };

  for (const arg of argv) {
    if (arg.startsWith('--days=')) {
      args.days = Number(arg.slice('--days='.length));
    } else if (arg.startsWith('--out=')) {
      args.out = arg.slice('--out='.length);
    } else if (!arg.startsWith('--')) {
      args.repoPath = arg;
    }
  }

  return args;
}

function main(argv) {
  const { repoPath, days, out } = parseArgs(argv);

  if (!repoPath) {
    process.stderr.write(`${USAGE}\n`);
    process.exitCode = 1;
    return;
  }

  const result = analyzeChangeFrequency({ repoPath: path.resolve(repoPath), days });
  const json = JSON.stringify(result, null, 2);

  if (out) {
    fs.writeFileSync(out, json);
  } else {
    process.stdout.write(`${json}\n`);
  }
}

main(process.argv.slice(2));
