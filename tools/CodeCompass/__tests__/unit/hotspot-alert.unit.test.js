'use strict';

const {
  parseHotspotTable,
  evaluateTopHotspot,
  buildAlertIssueTitle,
  buildAlertIssueBody,
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

const SINGLE_ROW_COMMENT_BODY = [
  '## CodeCompass Hotspots (Top 10)',
  '',
  '| file | hotspotScore | complexity | changes | loc | linesChanged |',
  '|------|-------------|-----------|---------|-----|-------------|',
  '| modal/app.py | 2.1234 | 50 | 41 | 800 | 900 |',
  '',
].join('\n');

describe('hotspot-alert lib (unit)', () => {
  describe('parseHotspotTable', () => {
    it('Markdown テーブルから行をパースして返す', () => {
      const rows = parseHotspotTable(SAMPLE_COMMENT_BODY);
      expect(rows).toHaveLength(2);
      expect(rows[0]).toEqual({
        file: 'modal/app.py',
        hotspotScore: 2.1234,
        complexity: 50,
        changes: 41,
        loc: 800,
        linesChanged: 900,
      });
    });

    it('テーブルが見つからない場合は空配列を返す', () => {
      expect(parseHotspotTable('no table here')).toEqual([]);
      expect(parseHotspotTable('')).toEqual([]);
    });
  });

  describe('evaluateTopHotspot', () => {
    it('rows が空の場合 shouldAlert=false・top=null を返す', () => {
      const result = evaluateTopHotspot([], 1);
      expect(result).toEqual({ shouldAlert: false, top: null, evidence: '' });
    });

    it('トップ1件がしきい値以下の場合 shouldAlert=false を返す', () => {
      const rows = parseHotspotTable(BELOW_THRESHOLD_COMMENT_BODY);
      const result = evaluateTopHotspot(rows, 1);
      expect(result.shouldAlert).toBe(false);
      expect(result.top).toEqual(rows[0]);
      expect(result.evidence).toBe('');
    });

    it('トップ1件がしきい値を超える場合 shouldAlert=true で根拠文字列を返す', () => {
      const rows = parseHotspotTable(SAMPLE_COMMENT_BODY);
      const result = evaluateTopHotspot(rows, 1);
      expect(result.shouldAlert).toBe(true);
      expect(result.top.file).toBe('modal/app.py');
      expect(result.evidence).toBe('changes=41 は2位以下の最大10の4.1倍');
    });

    it('2位が存在しない場合は「他に比較対象なし」とする', () => {
      const rows = parseHotspotTable(SINGLE_ROW_COMMENT_BODY);
      const result = evaluateTopHotspot(rows, 1);
      expect(result.shouldAlert).toBe(true);
      expect(result.evidence).toBe('他に比較対象なし');
    });
  });

  describe('buildAlertIssueTitle', () => {
    it('ファイル名とスコアを含むタイトルを返す', () => {
      const title = buildAlertIssueTitle('modal/app.py', 2.1234);
      expect(title).toBe('[CodeCompass Alert] modal/app.py の構造的リファクタリング検討（hotspotScore: 2.1234）');
    });
  });

  describe('buildAlertIssueBody', () => {
    const body = buildAlertIssueBody({
      file: 'modal/app.py',
      hotspotScore: 2.1234,
      evidence: 'changes=41 は2位以下の最大10の4.1倍',
      prNumber: 42,
    });

    it('重複チェック用マーカーを含む', () => {
      expect(body).toMatch(/<!-- codecompass-hotspot-alert:file=modal\/app\.py -->/);
    });

    it('処方箋（具体的な修正方法）を書かない', () => {
      expect(body).not.toMatch(/分割せよ|extract|リファクタリング手順/);
    });

    it('設計判断を xp_Architect に委譲する旨を明記する', () => {
      expect(body).toMatch(/xp_Architect/);
    });

    it('根拠データと PR番号を含む', () => {
      expect(body).toMatch(/changes=41 は2位以下の最大10の4\.1倍/);
      expect(body).toMatch(/42/);
    });
  });
});
