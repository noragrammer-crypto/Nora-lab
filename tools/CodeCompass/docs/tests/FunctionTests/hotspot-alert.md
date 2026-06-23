# hotspot-alert Functional Tests

テストファイル: `CodeCompass/__tests__/functional/hotspot-alert.functional.test.js`

対象機能: `findLatestMergedPR` / `getHotspotComment` / `issueExistsForFile` / `createAlertIssue` /
`runHotspotAlert`（`gh` 呼び出しを伴うオーケストレーションロジック）

---

## テストシナリオ

| # | シナリオ | 検証ポイント |
|---|---------|------------|
| 1 | `findLatestMergedPR` が `gh pr list` を実行してマージ済みPR番号を返す | `execSync` に渡されるコマンド文字列・返り値 |
| 2 | `findLatestMergedPR` はPRが見つからない場合 null を返す | 空配列レスポンス時の挙動 |
| 3 | `getHotspotComment` が `gh pr view` を実行してホットスポットコメント本文を返す | `## CodeCompass Hotspots` にマッチするコメントの抽出 |
| 4 | `getHotspotComment` はホットスポットコメントが存在しない場合 null を返す | 非マッチコメントの除外 |
| 5 | `issueExistsForFile` は重複Issueがある場合 true を返す | `gh issue list --search` 呼び出し |
| 6 | `issueExistsForFile` は重複Issueがない場合 false を返す | 空配列レスポンス時の挙動 |
| 7 | `createAlertIssue` が `gh issue create` をラベル `enhancement,codecompass-detected` で実行する | コマンド文字列に file・ラベルが含まれること |
| 8 | `runHotspotAlert`: しきい値超え・重複なしの場合 Issue を起票し action=created を返す | `gh issue create` が1回呼ばれること |
| 9 | `runHotspotAlert`: しきい値以下の場合は action=skipped-below-threshold を返す | `gh issue create` が呼ばれないこと |
| 10 | `runHotspotAlert`: 重複Issueがある場合は action=skipped-duplicate を返す | `gh issue create` が呼ばれないこと |
| 11 | `runHotspotAlert`: 対象PRがない場合は action=skipped-no-data を返す | `gh issue create` が呼ばれないこと |
| 12 | `runHotspotAlert`: dryRun=true の場合は判定結果のみ返し Issue を起票しない | action=created だが `gh issue create` が呼ばれないこと |

---

## テストデータ

`SAMPLE_COMMENT_BODY`: `modal/app.py`（hotspotScore=2.1234）と `other/file.js`（0.6300）の2行テーブル
`BELOW_THRESHOLD_COMMENT_BODY`: トップのスコアを 0.8000 に置き換えたバリエーション

`child_process.execSync` を `jest.spyOn` でモック化し、コマンド文字列に応じて
`gh pr list` / `gh pr view` / `gh issue list` / `gh issue create` のレスポンスを切り替える。

---

## 依存関係

- `child_process.execSync` — `gh` コマンド呼び出しを検証するためモック化
