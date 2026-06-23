# Unit Test: lib/refactoring-proposal.js

テストファイル: `CodeCompass/__tests__/unit/refactoring-proposal.unit.test.js`

## テスト対象

`lib/refactoring-proposal.js` — hotspots 配列と Mermaid 依存グラフを統合して構造化 JSON を生成し、
リファクタリング提案 Markdown を出力する純粋関数群

## テストケース一覧

### buildStructuredJson

| # | テストケース | 種別 |
|---|------------|------|
| 1 | hotspots 配列と Mermaid コンテンツを統合して構造化JSONを返す | 正常系 |
| 2 | フィールド名を変換する: hotspotScore→hotspot_score, changes→changes_90d | 正常系 |
| 3 | 出力フィールドに loc, linesChanged は含まれない（コード量情報を除外） | 正常系 |
| 4 | callees は自ファイルが from 側に登場するエッジ数を返す | 正常系 |
| 5 | callers は自ファイルが to 側に登場するエッジ数を返す（他ファイルから呼ばれる回数） | 正常系 |
| 6 | Mermaid コンテンツが空文字の場合は callers=0, callees=0 を返す | 異常系 |
| 7 | hotspots が空配列の場合は空配列を返す | 異常系 |
| 8 | MMD に登場しないファイルも callers=0, callees=0 で出力される | 正常系 |

### generateActionsMarkdown

| # | テストケース | 種別 |
|---|------------|------|
| 9 | 構造化JSON配列から Markdown 文字列を返す | 正常系 |
| 10 | 各エントリのファイルパスが Markdown に含まれる | 正常系 |
| 11 | hotspot_score, complexity, callers, callees が Markdown に含まれる | 正常系 |
| 12 | 空配列を渡しても有効な文字列を返す（エラーにならない） | 異常系 |

## カバレッジサマリー

| 関数 | テスト数 | 状態 |
|------|---------|------|
| `buildStructuredJson` | 8 | ✅ |
| `generateActionsMarkdown` | 4 | ✅ |
| `parseMmdEdges`（内部） | — | (buildStructuredJson のテストで間接検証) |

合計: 12件 — 全 GREEN
