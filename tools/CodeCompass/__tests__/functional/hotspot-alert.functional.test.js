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
    jest.spyOn(require('child_process'), 'execFileSync').mockImplementation((file, args) => {
      calls.push({ file, args });
      if (args.includes('pr') && args.includes('list')) {
        return calls.__noPr ? '[]' : '[{"number":42}]';
      }
      if (args.includes('pr') && args.includes('view')) {
        return JSON.stringify({ comments: [{ body: calls.__belowThreshold ? BELOW_THRESHOLD_COMMENT_BODY : SAMPLE_COMMENT_BODY }] });
      }
      if (args.includes('issue') && args.includes('list')) {
        return calls.__duplicate ? '[{"number":999}]' : '[]';
      }
      if (args.includes('issue') && args.includes('create')) {
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
      expect(calls[0]).toEqual({
        file: 'gh',
        args: ['pr', 'list', '--repo', 'owner/repo', '--base', 'main', '--state', 'merged', '--limit', '1', '--json', 'number'],
      });
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
      expect(calls[0]).toEqual({ file: 'gh', args: ['pr', 'view', '42', '--repo', 'owner/repo', '--json', 'comments'] });
    });

    it('ホットスポットコメントが存在しない場合は null を返す', () => {
      jest.spyOn(require('child_process'), 'execFileSync').mockImplementation((file, args) => {
        calls.push({ file, args });
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
      expect(calls[0]).toEqual({
        file: 'gh',
        args: ['issue', 'list', '--repo', 'owner/repo', '--state', 'open', '--search', 'codecompass-hotspot-alert:file=modal/app.py in:body', '--json', 'number'],
      });
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

      const issueCalls = calls.filter((c) => c.file === 'gh' && c.args.includes('issue') && c.args.includes('create'));
      expect(issueCalls).toHaveLength(1);
      expect(issueCalls[0].args).toContain('enhancement,codecompass-detected');
      expect(issueCalls[0].args).toContain('[CodeCompass Alert] modal/app.py の構造的リファクタリング検討（hotspotScore: 2.1234）');
    });

    it('シェルメタ文字を含む値も単一の gh 引数として渡す', () => {
      const file = 'src/$(touch injected); "quoted".js';
      const repo = 'owner/repo; echo injected';
      const branch = 'main; echo injected';

      findLatestMergedPR({ branch, repo });
      issueExistsForFile({ file, repo });
      createAlertIssue({ file, hotspotScore: 2, evidence: '$(echo injected)', repo, prNumber: 42 });

      expect(calls[0]).toEqual(expect.objectContaining({
        file: 'gh',
        args: expect.arrayContaining(['--repo', repo, '--base', branch]),
      }));
      expect(calls[1]).toEqual(expect.objectContaining({
        file: 'gh',
        args: expect.arrayContaining(['--repo', repo, '--search', `codecompass-hotspot-alert:file=${file} in:body`]),
      }));
      expect(calls[2]).toEqual(expect.objectContaining({
        file: 'gh',
        args: expect.arrayContaining([
          '--repo',
          repo,
          '--title',
          `[CodeCompass Alert] ${file} の構造的リファクタリング検討（hotspotScore: 2）`,
          '--body',
          expect.stringContaining('$(echo injected)'),
        ]),
      }));
    });
  });

  describe('runHotspotAlert（オーケストレーション）', () => {
    it('しきい値超え・重複なしの場合 Issue を起票して action=created を返す', () => {
      const result = runHotspotAlert({ branch: 'main', threshold: 1, repo: 'owner/repo' });
      expect(result.action).toBe('created');
      expect(result.file).toBe('modal/app.py');
      expect(calls.filter((c) => c.file === 'gh' && c.args.includes('issue') && c.args.includes('create'))).toHaveLength(1);
    });

    it('しきい値以下の場合は何も起票せず action=skipped-below-threshold を返す', () => {
      calls.__belowThreshold = true;
      const result = runHotspotAlert({ branch: 'main', threshold: 1, repo: 'owner/repo' });
      expect(result.action).toBe('skipped-below-threshold');
      expect(calls.filter((c) => c.file === 'gh' && c.args.includes('issue') && c.args.includes('create'))).toHaveLength(0);
    });

    it('重複Issueがある場合は起票せず action=skipped-duplicate を返す', () => {
      calls.__duplicate = true;
      const result = runHotspotAlert({ branch: 'main', threshold: 1, repo: 'owner/repo' });
      expect(result.action).toBe('skipped-duplicate');
      expect(calls.filter((c) => c.file === 'gh' && c.args.includes('issue') && c.args.includes('create'))).toHaveLength(0);
    });

    it('対象PRがない場合は action=skipped-no-data を返す', () => {
      calls.__noPr = true;
      const result = runHotspotAlert({ branch: 'main', threshold: 1, repo: 'owner/repo' });
      expect(result.action).toBe('skipped-no-data');
      expect(calls.filter((c) => c.file === 'gh' && c.args.includes('issue') && c.args.includes('create'))).toHaveLength(0);
    });

    it('dryRun=true の場合は判定結果のみ返し Issue を起票しない', () => {
      const result = runHotspotAlert({ branch: 'main', threshold: 1, repo: 'owner/repo', dryRun: true });
      expect(result.action).toBe('created');
      expect(calls.filter((c) => c.file === 'gh' && c.args.includes('issue') && c.args.includes('create'))).toHaveLength(0);
    });
  });

  describe('gh失敗時のフォールバック（#3220）', () => {
    function mockGhFailing(failing) {
      jest.spyOn(require('child_process'), 'execFileSync').mockImplementation((file, args) => {
        calls.push({ file, args });
        if (args.includes('pr') && args.includes('list')) {
          if (failing === 'pr-list') throw new Error('HTTP 403 (simulated)');
          return calls.__noPr ? '[]' : '[{"number":42}]';
        }
        if (args.includes('pr') && args.includes('view')) {
          if (failing === 'pr-view') throw new Error('HTTP 403 (simulated)');
          return JSON.stringify({ comments: [{ body: calls.__belowThreshold ? BELOW_THRESHOLD_COMMENT_BODY : SAMPLE_COMMENT_BODY }] });
        }
        if (args.includes('issue') && args.includes('list')) {
          if (failing === 'issue-list') throw new Error('HTTP 403 (simulated)');
          return calls.__duplicate ? '[{"number":999}]' : '[]';
        }
        if (args.includes('issue') && args.includes('create')) {
          if (failing === 'issue-create') throw new Error('HTTP 403 (simulated)');
          return 'https://github.com/owner/repo/issues/1000\n';
        }
        return '';
      });
    }

    it('findLatestMergedPR: gh pr list 失敗時、例外を投げず ghUnavailable タグ付きエラーを再送出する', () => {
      mockGhFailing('pr-list');
      expect(() => findLatestMergedPR({ branch: 'main', repo: 'owner/repo' })).toThrow();
      try {
        findLatestMergedPR({ branch: 'main', repo: 'owner/repo' });
      } catch (err) {
        expect(err.ghUnavailable).toBe(true);
      }
    });

    it('getHotspotComment: gh pr view 失敗時、ghUnavailable タグ付きエラーを再送出する', () => {
      mockGhFailing('pr-view');
      try {
        getHotspotComment({ prNumber: 42, repo: 'owner/repo' });
        throw new Error('should have thrown');
      } catch (err) {
        expect(err.ghUnavailable).toBe(true);
      }
    });

    it('issueExistsForFile: gh issue list 失敗時、例外を投げず false を返す（fail-open）', () => {
      mockGhFailing('issue-list');
      const result = issueExistsForFile({ file: 'modal/app.py', repo: 'owner/repo' });
      expect(result).toBe(false);
    });

    it('createAlertIssue: gh issue create 失敗時、例外を投げず {action: "gh-failed", ...} を返す', () => {
      mockGhFailing('issue-create');
      const result = createAlertIssue({
        file: 'modal/app.py',
        hotspotScore: 2.1234,
        evidence: 'changes=41 は2位以下の最大10の4.1倍',
        repo: 'owner/repo',
        prNumber: 42,
      });
      expect(result).toEqual({
        action: 'gh-failed',
        file: 'modal/app.py',
        hotspotScore: 2.1234,
        evidence: 'changes=41 は2位以下の最大10の4.1倍',
        prNumber: 42,
      });
    });

    it('runHotspotAlert: findLatestMergedPR 失敗時 action=skipped-gh-unavailable を返す', () => {
      mockGhFailing('pr-list');
      const result = runHotspotAlert({ branch: 'main', threshold: 1, repo: 'owner/repo' });
      expect(result.action).toBe('skipped-gh-unavailable');
    });

    it('runHotspotAlert: getHotspotComment 失敗時 action=skipped-gh-unavailable を返す', () => {
      mockGhFailing('pr-view');
      const result = runHotspotAlert({ branch: 'main', threshold: 1, repo: 'owner/repo' });
      expect(result.action).toBe('skipped-gh-unavailable');
    });

    it('runHotspotAlert: issueExistsForFile 失敗時も fail-open で作成を試行し action=created を返す', () => {
      mockGhFailing('issue-list');
      const result = runHotspotAlert({ branch: 'main', threshold: 1, repo: 'owner/repo' });
      expect(result.action).toBe('created');
      expect(calls.filter((c) => c.file === 'gh' && c.args.includes('issue') && c.args.includes('create'))).toHaveLength(1);
    });

    it('runHotspotAlert: createAlertIssue 失敗時 action=gh-failed を返す', () => {
      mockGhFailing('issue-create');
      const result = runHotspotAlert({ branch: 'main', threshold: 1, repo: 'owner/repo' });
      expect(result.action).toBe('gh-failed');
    });
  });
});
