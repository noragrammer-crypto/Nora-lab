# Unit Test: lib/hotspot-alert.js

テストファイル: `CodeCompass/__tests__/unit/hotspot-alert.unit.test.js`

## テスト対象

`lib/hotspot-alert.js` — PRホットスポットコメントのパース・しきい値判定・Issue文面生成を担う純粋関数群
（`gh` 呼び出しを伴う関数は対象外。機能テストで検証する）

## テストケース一覧

### parseHotspotTable

| # | テストケース | 種別 |
|---|------------|------|
| 1 | Markdown テーブルから行をパースして返す | 正常系 |
| 2 | テーブルが見つからない場合は空配列を返す | 異常系 |

### evaluateTopHotspot

| # | テストケース | 種別 |
|---|------------|------|
| 3 | rows が空の場合 shouldAlert=false・top=null を返す | 異常系 |
| 4 | トップ1件がしきい値以下の場合 shouldAlert=false を返す | 正常系 |
| 5 | トップ1件がしきい値を超える場合 shouldAlert=true で根拠文字列を返す | 正常系 |
| 6 | 2位が存在しない場合は「他に比較対象なし」とする | 異常系 |

### buildAlertIssueTitle

| # | テストケース | 種別 |
|---|------------|------|
| 7 | ファイル名とスコアを含むタイトルを返す | 正常系 |

### buildAlertIssueBody

| # | テストケース | 種別 |
|---|------------|------|
| 8 | 重複チェック用マーカー `<!-- codecompass-hotspot-alert:file=... -->` を含む | 正常系 |
| 9 | 処方箋（具体的な修正方法）を書かない | 正常系 |
| 10 | 設計判断を xp_Architect に委譲する旨を明記する | 正常系 |
| 11 | 根拠データと PR番号を含む | 正常系 |

## カバレッジサマリー

| 関数 | テスト数 | 状態 |
|------|---------|------|
| `parseHotspotTable` | 2 | ✅ |
| `evaluateTopHotspot` | 4 | ✅ |
| `buildAlertIssueTitle` | 1 | ✅ |
| `buildAlertIssueBody` | 4 | ✅ |
| `findLatestMergedPR` / `getHotspotComment` / `issueExistsForFile` / `createAlertIssue` / `runHotspotAlert` | — | (gh 呼び出し依存のため機能テストで検証) |

合計: 11件 — 全 GREEN

## 設計メモ

`gh` を `child_process.execSync` 経由で呼び出す関数（`findLatestMergedPR` 等）は
副作用を持つためユニットテストの対象から外し、入出力のみで完結する純粋関数
（テーブルパース・しきい値判定・Issue文面生成）のみを検証する。
`execSync` 呼び出しの検証は機能テスト（`hotspot-alert.functional.test.js`）が担当する。
