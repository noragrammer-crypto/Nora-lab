# Unit Test: lib/change-frequency.js

テストファイル: `CodeCompass/__tests__/unit/change-frequency.unit.test.js`

## テスト対象

`lib/change-frequency.js` — `git log --numstat` 出力の解析・集計を行う純粋関数群

## テストケース一覧

### parseNumstatOutput

| # | テストケース | 種別 |
|---|------------|------|
| 1 | numstat形式の行から file・追加行数・削除行数を抽出する | 正常系 |
| 2 | バイナリファイルの "-" を 0 として扱う | 正常系 |
| 3 | numstat形式に一致しない行（コミットハッシュ・著者行・空行）を無視する | 正常系 |
| 4 | 空文字列に対しては空配列を返す | 異常系 |

### aggregateChanges

| # | テストケース | 種別 |
|---|------------|------|
| 5 | ファイルごとに変更回数（出現数）と変更行数（追加+削除の合計）を集計する | 正常系 |
| 6 | 変更回数（changes）の降順でソートする | 正常系 |
| 7 | 空配列に対しては空配列を返す | 異常系 |

## カバレッジサマリー

| 関数 | テスト数 | 状態 |
|------|---------|------|
| `parseNumstatOutput` | 4 | ✅ |
| `aggregateChanges` | 3 | ✅ |
| `fetchNumstatLog` | — | (git 依存のため E2E で検証) |
| `analyzeChangeFrequency` | — | (git 依存のため E2E で検証) |

合計: 7件 — 全 GREEN

## 設計メモ

`fetchNumstatLog` / `analyzeChangeFrequency` は `execFileSync` を介して git リポジトリに依存するため、
ユニットテストでは対象外とし、文字列・配列の入出力のみで完結する純粋関数
（`parseNumstatOutput` / `aggregateChanges`）を検証する。
git 連携を含む統合的な検証は機能テスト（CLI）と E2E テスト（#1181）が担当する。
