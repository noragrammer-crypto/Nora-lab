#!/usr/bin/env node
'use strict';

/**
 * CodeCompass: リファクタリング提案 → GitHub Issue 自動発行 CLI（Story #1396 / Task #1441）
 *
 * 使い方:
 *   node CodeCompass/scripts/codecompass-to-issues.js \
 *     [--actions=<path>]  (省略時: codecompass/actions.md)
 *     [--limit=<n>]       (省略時: 5)
 *     [--dry-run]         イシューを発行せず対象一覧を stdout に出力
 *
 * 前提条件:
 *   - codecompass/actions.md が最新状態であること（事前に refactoring-proposal.js を実行済み）
 */

const fs = require('fs');
const path = require('path');
const { parseActionsMd, createIssues } = require('../lib/codecompass-to-issues');

const DEFAULT_ACTIONS = path.join(process.cwd(), 'codecompass', 'actions.md');
const DEFAULT_LIMIT = 5;

function parseArgs(argv) {
  const args = { actions: null, limit: null, dryRun: false };
  for (const arg of argv) {
    if (arg.startsWith('--actions=')) {
      args.actions = arg.slice('--actions='.length);
    } else if (arg.startsWith('--limit=')) {
      args.limit = parseInt(arg.slice('--limit='.length), 10);
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    }
  }
  return args;
}

async function main(argv) {
  const { actions: actionsArg, limit: limitArg, dryRun } = parseArgs(argv);
  const actionsPath = actionsArg || DEFAULT_ACTIONS;
  const limit = limitArg || DEFAULT_LIMIT;

  if (!fs.existsSync(actionsPath)) {
    process.stderr.write(`Error: actions file not found: ${actionsPath}\n`);
    process.stderr.write('Run refactoring-proposal.js first to generate actions.md\n');
    process.exitCode = 1;
    return;
  }

  const content = fs.readFileSync(actionsPath, 'utf8');
  const proposals = parseActionsMd(content);

  if (proposals.length === 0) {
    process.stdout.write('No refactoring proposals found in actions.md\n');
    return;
  }

  // Detect repo from git remote
  let repo = 'noragrammer-crypto/HolyAutomater';
  try {
    const { execSync } = require('child_process');
    const remote = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    const m = remote.match(/github\.com[:/]([^/]+\/[^/.]+)/);
    if (m) repo = m[1];
  } catch (_) {
    // use default
  }

  if (dryRun) {
    const targets = proposals.slice(0, limit);
    process.stdout.write(`dry-run: ${targets.length} issues would be created\n`);
    for (const { file, hotspot_score } of targets) {
      process.stdout.write(`  [Refactoring] ${file} のリファクタリング（hotspot_score: ${hotspot_score}）\n`);
    }
    return;
  }

  const created = await createIssues(proposals, { limit, dryRun: false, repo });
  process.stdout.write(`Created ${created.length} issues\n`);
  for (const { file } of created) {
    process.stdout.write(`  - ${file}\n`);
  }
}

main(process.argv.slice(2)).catch((err) => {
  process.stderr.write(`${err.message}\n`);
  process.exitCode = 1;
});
