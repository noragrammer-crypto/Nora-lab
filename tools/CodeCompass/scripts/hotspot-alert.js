#!/usr/bin/env node
'use strict';

/**
 * CodeCompass: PRホットスポットコメント検出 → しきい値判定 → 重複チェック付きIssue自動起票 CLI
 * （Story #1546 / Task #1548）
 *
 * 使い方:
 *   node CodeCompass/scripts/hotspot-alert.js \
 *     [--branch=main] [--threshold=1] [--repo=owner/repo] [--dry-run]
 *
 * --repo 省略時は `gh repo view --json nameWithOwner` で自動検出する。
 * データソースは gh CLI 経由の PR コメントのみ（ローカルの git log/AST解析はしない）。
 */

const { execSync } = require('child_process');
const { runHotspotAlert } = require('../lib/hotspot-alert');

function parseArgs(argv) {
  const args = { branch: 'main', threshold: 1, repo: null, dryRun: false };
  for (const arg of argv) {
    if (arg.startsWith('--branch=')) {
      args.branch = arg.slice('--branch='.length);
    } else if (arg.startsWith('--threshold=')) {
      args.threshold = parseFloat(arg.slice('--threshold='.length));
    } else if (arg.startsWith('--repo=')) {
      args.repo = arg.slice('--repo='.length);
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    }
  }
  return args;
}

/**
 * `--repo` 省略時のリポジトリ自動検出。gh失敗時は例外を投げず null を返す
 * （lib/hotspot-alert.js の各関数と同じ「gh優先→失敗時フォールバック」パターン。#3220/#3265
 * レビュー指摘: ここで例外を投げると main() 全体がクラッシュし、以降の gh 失敗フォールバックに
 * 到達できない）。
 *
 * @returns {string|null}
 */
function detectRepo() {
  try {
    const out = execSync('gh repo view --json nameWithOwner', { encoding: 'utf8' });
    return JSON.parse(out).nameWithOwner;
  } catch (err) {
    return null;
  }
}

function main(argv) {
  const { branch, threshold, repo: repoArg, dryRun } = parseArgs(argv);
  const repo = repoArg || detectRepo();

  if (!repo) {
    process.stdout.write('skipped-gh-unavailable file=null hotspotScore=null\n');
    return;
  }

  const result = runHotspotAlert({ branch, threshold, repo, dryRun });

  process.stdout.write(`${result.action} file=${result.file} hotspotScore=${result.hotspotScore}\n`);
}

main(process.argv.slice(2));
