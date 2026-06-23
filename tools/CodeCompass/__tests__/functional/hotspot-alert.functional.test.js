'use strict';

const {
  findLatestMergedPR,
  getHotspotComment,
  issueExistsForFile,
  createAlertIssue,
  runHotspotAlert,
} = require('../../lib/hotspot-alert');

const SAMPLE_COMMENT_BODY = [
  '## CodeCompass Hotspots (Top 10)',
  '',
  '| file | hotspotScore | complexity | changes | loc | linesChanged |',
  '|------|-------------|-----------|---------|-----|-------------|',
  '| modal/app.py | 2.1234 | 50 | 41 | 800 | 900 |',
  '| other/file.js | 0.6300 | 20 | 10 | 300 | 150 |',
  '',
].join('\n');

const BELOW_THRESHOLD_COMMENT_BODY = SAMPLE_COMMENT_BODY.replace('2.1234', '0.8000');

describe('hotspot-alert lib (functional)', () => {
  let calls;

  beforeEach(() => {
    calls = [];
    jest.spyOn(require('child_process'), 'execSync').mockImplementation((cmd) => {
      calls.push(cmd);
      if (cmd.includes('gh pr list')) {
        return calls.__noPr ? '[]' : '[{"number":42}]';
      }
      if (cmd.includes('gh pr view')) {
        return JSON.stringify({ comments: [{ body: calls.__belowThreshold ? BELOW_THRESHOLD_COMMENT_BODY : SAMPLE_COMMENT_BODY }] });
      }
      if (cmd.includes('gh issue list')) {
        return calls.__duplicate ? '[{"number":999}]' : '[]';
      }
      if (cmd.includes('gh issue create')) {
        return 'https://github.com/owner/repo/issues/1000\n';
      }
      return '';
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findLatestMergedPR', () => {
    it('gh pr list を実行してマージ済みPR番号を返す', () => {
      const result = findLatestMergedPR({ branch: 'main', repo: 'owner/repo' });
      expect(result).toBe(42);
      expect(calls[0]).toMatch(/gh pr list --repo owner\/repo --base main --state merged --limit 1/);
    });

    it('PRが見つからない場合は null を返す', () => {
      calls.__noPr = true;
      const result = findLatestMergedPR({ branch: 'main', repo: 'owner/repo' });
      expect(result).toBeNull();
    });
  });

  describe('getHotspotComment', () => {
    it('gh pr view を実行してホットスポットコメント本文を返す', () => {
      const result = getHotspotComment({ prNumber: 42, repo: 'owner/repo' });
      expect(result).toBe(SAMPLE_COMMENT_BODY);
      expect(calls[0]).toMatch(/gh pr view 42 --repo owner\/repo/);
    });

    it('ホットスポットコメントが存在しない場合は null を返す', () => {
      jest.spyOn(require('child_process'), 'execSync').mockImplementation((cmd) => {
        calls.push(cmd);
        return JSON.stringify({ comments: [{ body: '関係ないコメント' }] });
      });
      const result = getHotspotComment({ prNumber: 42, repo: 'owner/repo' });
      expect(result).toBeNull();
    });
  });

  describe('issueExistsForFile', () => {
    it('重複Issueがある場合 true を返す', () => {
      calls.__duplicate = true;
      const result = issueExistsForFile({ file: 'modal/app.py', repo: 'owner/repo' });
      expect(result).toBe(true);
      expect(calls[0]).toMatch(/gh issue list --repo owner\/repo --state open --search/);
    });

    it('重複Issueがない場合 false を返す', () => {
      const result = issueExistsForFile({ file: 'modal/app.py', repo: 'owner/repo' });
      expect(result).toBe(false);
    });
  });

  describe('createAlertIssue', () => {
    it('gh issue create を実行する（ラベル enhancement,codecompass-detected）', () => {
      createAlertIssue({
        file: 'modal/app.py',
        hotspotScore: 2.1234,
        evidence: 'changes=41 は2位以下の最大10の4.1倍',
        repo: 'owner/repo',
        prNumber: 42,
      });

      const issueCalls = calls.filter((c) => c.includes('gh issue create'));
      expect(issueCalls).toHaveLength(1);
      expect(issueCalls[0]).toMatch(/enhancement,codecompass-detected/);
      expect(issueCalls[0]).toMatch(/modal\/app\.py/);
    });
  });

  describe('runHotspotAlert（オーケストレーション）', () => {
    it('しきい値超え・重複なしの場合 Issue を起票して action=created を返す', () => {
      const result = runHotspotAlert({ branch: 'main', threshold: 1, repo: 'owner/repo' });
      expect(result.action).toBe('created');
      expect(result.file).toBe('modal/app.py');
      expect(calls.filter((c) => c.includes('gh issue create'))).toHaveLength(1);
    });

    it('しきい値以下の場合は何も起票せず action=skipped-below-threshold を返す', () => {
      calls.__belowThreshold = true;
      const result = runHotspotAlert({ branch: 'main', threshold: 1, repo: 'owner/repo' });
      expect(result.action).toBe('skipped-below-threshold');
      expect(calls.filter((c) => c.includes('gh issue create'))).toHaveLength(0);
    });

    it('重複Issueがある場合は起票せず action=skipped-duplicate を返す', () => {
      calls.__duplicate = true;
      const result = runHotspotAlert({ branch: 'main', threshold: 1, repo: 'owner/repo' });
      expect(result.action).toBe('skipped-duplicate');
      expect(calls.filter((c) => c.includes('gh issue create'))).toHaveLength(0);
    });

    it('対象PRがない場合は action=skipped-no-data を返す', () => {
      calls.__noPr = true;
      const result = runHotspotAlert({ branch: 'main', threshold: 1, repo: 'owner/repo' });
      expect(result.action).toBe('skipped-no-data');
      expect(calls.filter((c) => c.includes('gh issue create'))).toHaveLength(0);
    });

    it('dryRun=true の場合は判定結果のみ返し Issue を起票しない', () => {
      const result = runHotspotAlert({ branch: 'main', threshold: 1, repo: 'owner/repo', dryRun: true });
      expect(result.action).toBe('created');
      expect(calls.filter((c) => c.includes('gh issue create'))).toHaveLength(0);
    });
  });
});
