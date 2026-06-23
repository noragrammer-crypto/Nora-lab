'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { createIssues } = require('../../lib/codecompass-to-issues');

const SAMPLE_PROPOSALS = [
  { file: 'DiscordAIbot/lib/persona.js', hotspot_score: 2.0676 },
  { file: 'DiscordAIbot/lib/discord.js', hotspot_score: 2.0455 },
  { file: 'DiscordAIbot/lib/claude.js', hotspot_score: 1.6981 },
  { file: 'dashboard/app.js', hotspot_score: 2.1176 },
  { file: 'api/note-proxy.js', hotspot_score: 1.5000 },
  { file: 'extra/file.js', hotspot_score: 1.2000 },
];

describe('codecompass-to-issues lib (functional)', () => {
  let ghCalls;
  let originalExecSync;

  beforeEach(() => {
    ghCalls = [];
    // gh コマンド呼び出しをモック
    const { execSync } = require('child_process');
    jest.spyOn(require('child_process'), 'execSync').mockImplementation((cmd) => {
      ghCalls.push(cmd);
      return '';
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('dry-run モードで proposals 一覧を返し、Issue を発行しない', async () => {
    const result = await createIssues(SAMPLE_PROPOSALS, {
      limit: 5,
      dryRun: true,
      repo: 'owner/repo',
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(5);
    expect(ghCalls.filter((c) => c.includes('gh issue create'))).toHaveLength(0);
  });

  it('--limit=3 で上位3件のみ対象にする', async () => {
    const result = await createIssues(SAMPLE_PROPOSALS, {
      limit: 3,
      dryRun: true,
      repo: 'owner/repo',
    });

    expect(result).toHaveLength(3);
  });

  it('gh issue create 呼び出し時にラベル refactoring,codecompass-detected を渡す', async () => {
    await createIssues(SAMPLE_PROPOSALS.slice(0, 2), {
      limit: 5,
      dryRun: false,
      repo: 'owner/repo',
    });

    const issueCalls = ghCalls.filter((c) => c.includes('gh issue create'));
    expect(issueCalls.length).toBeGreaterThan(0);
    issueCalls.forEach((cmd) => {
      expect(cmd).toMatch(/refactoring.*codecompass-detected|codecompass-detected.*refactoring/);
    });
  });

  it('actions.md が存在しない場合に空配列を返す', async () => {
    const { parseActionsMd } = require('../../lib/codecompass-to-issues');
    const result = parseActionsMd('');
    expect(result).toEqual([]);
  });
});
