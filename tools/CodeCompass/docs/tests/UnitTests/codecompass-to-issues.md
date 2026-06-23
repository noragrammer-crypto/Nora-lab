# codecompass-to-issues Unit Tests

テストファイル: `CodeCompass/__tests__/unit/codecompass-to-issues.unit.test.js`

対象モジュール: `CodeCompass/lib/codecompass-to-issues.js`

---

## parseActionsMd

| # | テストケース | 分類 |
|---|------------|------|
| 1 | `### \`path/to/file.js\`` 形式の見出しからファイルパスを抽出できる | 正常系 |
| 2 | `- hotspot_score: **2.0676**` 形式から数値を抽出できる | 正常系 |
| 3 | 複数セクションを正しくパースして配列を返す | 正常系 |
| 4 | セクションが存在しない場合は空配列を返す | 異常系 |
| 5 | 提案セクションがない（テーブルのみ）場合は空配列を返す | 異常系 |

## buildIssueTitle

| # | テストケース | 分類 |
|---|------------|------|
| 6 | `[Refactoring] <file> のリファクタリング（hotspot_score: <score>）` 形式のタイトルを生成する | 正常系 |
| 7 | スコアが整数の場合も正しくフォーマットする | 境界値 |

---

## カバレッジサマリー

- テスト数: 7件（全 PASS）
- 対象関数: `parseActionsMd`, `buildIssueTitle`
- `createIssues` は Functional テストで検証
