'use strict';

const { parseActionsMd, buildIssueTitle } = require('../../lib/codecompass-to-issues');

const SAMPLE_ACTIONS_MD = `# CodeCompass リファクタリング提案

## ホットスポット一覧

| file | hotspot_score | complexity | changes_90d | callers | callees |
|------|--------------|-----------|------------|---------|---------|
| DiscordAIbot/lib/persona.js | 2.0676 | 17 | 18 | 0 | 0 |
| DiscordAIbot/lib/discord.js | 2.0455 | 10 | 18 | 0 | 0 |

## リファクタリング提案

### \`DiscordAIbot/lib/persona.js\`

- hotspot_score: **2.0676**
- complexity: 17
- callers: 0 / callees: 0

複雑度が高い。IPO分離またはメソッド抽出でモジュールを分割することを推奨。

### \`DiscordAIbot/lib/discord.js\`

- hotspot_score: **2.0455**
- complexity: 10
- callers: 0 / callees: 0

変更頻度が高い。テストカバレッジを上げてリファクタリングリスクを下げることを推奨。
`;

const NO_PROPOSALS_MD = `# CodeCompass リファクタリング提案

## ホットスポット一覧

| file | hotspot_score | complexity | changes_90d | callers | callees |
|------|--------------|-----------|------------|---------|---------|
| some/file.js | 0.5 | 5 | 3 | 0 | 0 |
`;

describe('codecompass-to-issues lib (unit)', () => {
  describe('parseActionsMd', () => {
    it('### `path/to/file.js` 形式の見出しからファイルパスを抽出できる', () => {
      const result = parseActionsMd(SAMPLE_ACTIONS_MD);
      expect(result[0].file).toBe('DiscordAIbot/lib/persona.js');
      expect(result[1].file).toBe('DiscordAIbot/lib/discord.js');
    });

    it('- hotspot_score: **2.0676** 形式から数値を抽出できる', () => {
      const result = parseActionsMd(SAMPLE_ACTIONS_MD);
      expect(result[0].hotspot_score).toBe(2.0676);
      expect(result[1].hotspot_score).toBe(2.0455);
    });

    it('複数セクションを正しくパースして配列を返す', () => {
      const result = parseActionsMd(SAMPLE_ACTIONS_MD);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(expect.objectContaining({
        file: expect.any(String),
        hotspot_score: expect.any(Number),
      }));
    });

    it('セクションが存在しない場合は空配列を返す', () => {
      const result = parseActionsMd('');
      expect(result).toEqual([]);
    });

    it('提案セクションがない（テーブルのみ）場合は空配列を返す', () => {
      const result = parseActionsMd(NO_PROPOSALS_MD);
      expect(result).toEqual([]);
    });
  });

  describe('buildIssueTitle', () => {
    it('[Refactoring] <file> のリファクタリング（hotspot_score: <score>）形式のタイトルを生成する', () => {
      const title = buildIssueTitle('DiscordAIbot/lib/persona.js', 2.0676);
      expect(title).toBe(
        '[Refactoring] DiscordAIbot/lib/persona.js のリファクタリング（hotspot_score: 2.0676）'
      );
    });

    it('スコアが整数の場合も正しくフォーマットする', () => {
      const title = buildIssueTitle('some/file.js', 2);
      expect(title).toBe('[Refactoring] some/file.js のリファクタリング（hotspot_score: 2）');
    });
  });
});
