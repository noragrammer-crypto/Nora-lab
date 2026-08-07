'use strict';

/**
 * E2E Acceptance Tests: Story #1546 / Task #1547
 * CodeCompass: ホットスポット検出→Issue自動起票スキル（しきい値ベース、処方箋はxp_Architectに委譲）
 *
 * 受け入れ条件:
 * 1. 対象ブランチの最新マージ済みPRのCodeCompassホットスポットコメントを取得できる
 * 2. コメント中のトップ1件の hotspotScore がしきい値（既定値1）を超えるか判定できる
 * 3. 超えている場合、ファイル名・スコア・根拠（changesの外れ値比較等）を含むIssueを起票できる（処方箋は書かない）
 * 4. 同じファイルに対する重複Issueがある場合は起票しない
 * 5. しきい値を超えていない場合は何も起票しない
 *
 * スクリプトの想定インターフェース（実装タスク #1548 が満たすべき契約）:
 *   node CodeCompass/scripts/hotspot-alert.js
 *     [--branch=main] [--threshold=1] [--repo=owner/repo] [--dry-run]
 *
 *   データソースは gh CLI 経由の PR コメントのみ（ローカルでの git log/AST解析はしない。
 *   ClaudeCode Web のシャロークローン環境でも正しく動作させるための前提 = #1541 を踏まえた設計）。
 *
 * 外部依存のモック方針:
 *   実際の `gh` コマンドは呼ばない。fixtures/bin/gh （Node製スタブ）を PATH 先頭に追加して
 *   子プロセスとして起動する scripts/hotspot-alert.js から呼ばれる `gh` をすべて差し替える。
 *   FAKE_GH_SCENARIO 環境変数でシナリオ（しきい値超え/未満・重複あり/なし・PRなし）を切り替え、
 *   FAKE_GH_LOG に記録された呼び出しログを検証する。
 *
 * 実装が存在しない現時点では RED が正しい状態。
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const SCRIPT_PATH = path.join(ROOT, 'scripts', 'hotspot-alert.js');
const LIB_PATH = path.join(ROOT, 'lib', 'hotspot-alert.js');
const FAKE_GH_BIN_DIR = path.join(__dirname, 'fixtures', 'bin');

const scriptExists = fs.existsSync(SCRIPT_PATH);
const libExists = fs.existsSync(LIB_PATH);

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

describe('Story #1546: CodeCompassホットスポット検出→Issue自動起票スキル', () => {
  it('scripts/hotspot-alert.js が存在する', () => {
    expect(scriptExists).toBe(true);
  });

  it('lib/hotspot-alert.js が存在する', () => {
    expect(libExists).toBe(true);
  });

  if (!libExists) {
    return;
  }

  describe('lib/hotspot-alert.js の単体インターフェース検証', () => {
    let lib;

    beforeAll(() => {
      lib = require(LIB_PATH);
    });

    describe('受け入れ条件1・2: parseHotspotTable / evaluateTopHotspot', () => {
      it('parseHotspotTable 関数がエクスポートされている', () => {
        expect(typeof lib.parseHotspotTable).toBe('function');
      });

      it('PRコメント本文からホットスポットテーブルをパースできる', () => {
        const rows = lib.parseHotspotTable(SAMPLE_COMMENT_BODY);
        expect(Array.isArray(rows)).toBe(true);
        expect(rows.length).toBe(2);
        expect(rows[0].file).toBe('modal/app.py');
        expect(rows[0].hotspotScore).toBeCloseTo(2.1234, 4);
        expect(rows[0].changes).toBe(41);
      });

      it('テーブルが見つからない場合は空配列を返す', () => {
        expect(lib.parseHotspotTable('no table here')).toEqual([]);
        expect(lib.parseHotspotTable('')).toEqual([]);
      });

      it('evaluateTopHotspot 関数がエクスポートされている', () => {
        expect(typeof lib.evaluateTopHotspot).toBe('function');
      });

      it('トップ1件がしきい値を超える場合 shouldAlert=true で根拠文字列を返す', () => {
        const rows = lib.parseHotspotTable(SAMPLE_COMMENT_BODY);
        const result = lib.evaluateTopHotspot(rows, 1);
        expect(result.shouldAlert).toBe(true);
        expect(result.top.file).toBe('modal/app.py');
        expect(typeof result.evidence).toBe('string');
        expect(result.evidence.length).toBeGreaterThan(0);
      });

      it('トップ1件がしきい値以下の場合 shouldAlert=false を返す', () => {
        const rows = lib.parseHotspotTable(BELOW_THRESHOLD_COMMENT_BODY);
        const result = lib.evaluateTopHotspot(rows, 1);
        expect(result.shouldAlert).toBe(false);
      });

      it('rows が空の場合 shouldAlert=false・top=null を返す', () => {
        const result = lib.evaluateTopHotspot([], 1);
        expect(result.shouldAlert).toBe(false);
        expect(result.top).toBeNull();
      });
    });

    describe('受け入れ条件3: buildAlertIssueTitle / buildAlertIssueBody（処方箋を書かない）', () => {
      it('buildAlertIssueTitle がファイル名とスコアを含むタイトルを返す', () => {
        const title = lib.buildAlertIssueTitle('modal/app.py', 2.1234);
        expect(title).toMatch(/modal\/app\.py/);
        expect(title).toMatch(/2\.1234/);
      });

      it('buildAlertIssueBody が重複チェック用マーカーを含む', () => {
        const body = lib.buildAlertIssueBody({
          file: 'modal/app.py',
          hotspotScore: 2.1234,
          evidence: 'changes=41 は2位以下の最大10の4.1倍',
          prNumber: 42,
        });
        expect(body).toMatch(/<!-- codecompass-hotspot-alert:file=modal\/app\.py -->/);
      });

      it('buildAlertIssueBody が処方箋（具体的な修正方法）を書かない', () => {
        const body = lib.buildAlertIssueBody({
          file: 'modal/app.py',
          hotspotScore: 2.1234,
          evidence: 'changes=41 は2位以下の最大10の4.1倍',
          prNumber: 42,
        });
        expect(body).not.toMatch(/分割せよ|extract|リファクタリング手順/);
      });
    });
  });

  if (!scriptExists) {
    return;
  }

  describe('CLI スクリプトの end-to-end 実行（gh はスタブで差し替え）', () => {
    let logPath;

    function runScript(scenario, extraArgs = '') {
      logPath = fs.mkdtempSync(path.join(os.tmpdir(), 'fake-gh-log-')) + '/log.txt';
      fs.writeFileSync(logPath, '');

      const stdout = execSync(
        `node "${SCRIPT_PATH}" --branch=main --threshold=1 --repo=owner/repo ${extraArgs}`,
        {
          cwd: ROOT,
          encoding: 'utf8',
          env: {
            ...process.env,
            PATH: `${FAKE_GH_BIN_DIR}:${process.env.PATH}`,
            FAKE_GH_SCENARIO: scenario,
            FAKE_GH_LOG: logPath,
          },
        }
      );

      const log = fs.readFileSync(logPath, 'utf8');
      return { stdout, log };
    }

    it('受け入れ条件3: しきい値超え・重複なしの場合 Issue を起票する', () => {
      const { stdout, log } = runScript('above-threshold-no-duplicate');
      expect(stdout).toMatch(/created/);
      expect(log).toMatch(/gh issue create/);
    });

    it('受け入れ条件5: しきい値以下の場合は何も起票しない', () => {
      const { stdout, log } = runScript('below-threshold');
      expect(stdout).toMatch(/skipped-below-threshold/);
      expect(log).not.toMatch(/gh issue create/);
    });

    it('受け入れ条件4: 同じファイルに重複Issueがある場合は起票しない', () => {
      const { stdout, log } = runScript('duplicate-exists');
      expect(stdout).toMatch(/skipped-duplicate/);
      expect(log).not.toMatch(/gh issue create/);
    });

    it('対象ブランチに該当PRがない場合は何も起票しない', () => {
      const { stdout, log } = runScript('no-pr-found');
      expect(stdout).toMatch(/skipped-no-data/);
      expect(log).not.toMatch(/gh issue create/);
    });

    it('--dry-run 指定時はしきい値を超えていても Issue を起票しない', () => {
      const { log } = runScript('above-threshold-no-duplicate', '--dry-run');
      expect(log).not.toMatch(/gh issue create/);
    });
  });
});
