# hotspot-alert Functional Tests

テストファイル: `CodeCompass/__tests__/functional/hotspot-alert.functional.test.js`

対象機能: `findLatestMergedPR` / `getHotspotComment` / `issueExistsForFile` / `createAlertIssue` /
`runHotspotAlert`（`gh` 呼び出しを伴うオーケストレーションロジック）

---

## テストシナリオ

| # | シナリオ | 検証ポイント |
|---|---------|------------|
| 1 | `findLatestMergedPR` が `gh pr list` を実行してマージ済みPR番号を返す | `execFileSync` に渡される引数配列・返り値 |
| 2 | `findLatestMergedPR` はPRが見つからない場合 null を返す | 空配列レスポンス時の挙動 |
| 3 | `getHotspotComment` が `gh pr view` を実行してホットスポットコメント本文を返す | `## CodeCompass Hotspots` にマッチするコメントの抽出 |
| 4 | `getHotspotComment` はホットスポットコメントが存在しない場合 null を返す | 非マッチコメントの除外 |
| 5 | `issueExistsForFile` は重複Issueがある場合 true を返す | `gh issue list --search` 呼び出し |
| 6 | `issueExistsForFile` は重複Issueがない場合 false を返す | 空配列レスポンス時の挙動 |
| 7 | `createAlertIssue` が `gh issue create` をラベル `enhancement,codecompass-detected` で実行する | 引数配列に file・ラベルが含まれること |
| 8 | シェルメタ文字を含む file / repo / branch も単一引数として渡す | `$()`・`;`・引用符がシェル展開されないこと |
| 9 | `runHotspotAlert`: しきい値超え・重複なしの場合 Issue を起票し action=created を返す | `gh issue create` が1回呼ばれること |
| 10 | `runHotspotAlert`: しきい値以下の場合は action=skipped-below-threshold を返す | `gh issue create` が呼ばれないこと |
| 11 | `runHotspotAlert`: 重複Issueがある場合は action=skipped-duplicate を返す | `gh issue create` が呼ばれないこと |
| 12 | `runHotspotAlert`: 対象PRがない場合は action=skipped-no-data を返す | `gh issue create` が呼ばれないこと |
| 13 | `runHotspotAlert`: dryRun=true の場合は判定結果のみ返し Issue を起票しない | action=created だが `gh issue create` が呼ばれないこと |

### gh失敗時のフォールバック（#3220）

| # | シナリオ | 検証ポイント |
|---|---------|------------|
| 14 | `findLatestMergedPR`: `gh pr list` 失敗時、例外を投げず `ghUnavailable: true` タグ付きエラーを再送出する | `err.ghUnavailable === true` |
| 15 | `getHotspotComment`: `gh pr view` 失敗時、`ghUnavailable: true` タグ付きエラーを再送出する | `err.ghUnavailable === true` |
| 16 | `issueExistsForFile`: `gh issue list` 失敗時、例外を投げず `false` を返す（fail-open） | 例外にならず `false` |
| 17 | `createAlertIssue`: `gh issue create` 失敗時、例外を投げず `{action: 'gh-failed', ...}` を返す | 返り値の構造 |
| 18 | `runHotspotAlert`: `findLatestMergedPR` 失敗時 action=skipped-gh-unavailable を返す | 終端アクション |
| 19 | `runHotspotAlert`: `getHotspotComment` 失敗時 action=skipped-gh-unavailable を返す | 終端アクション |
| 20 | `runHotspotAlert`: `issueExistsForFile` 失敗時も fail-open で作成を試行し action=created を返す | `gh issue create` が呼ばれること |
| 21 | `runHotspotAlert`: `createAlertIssue` 失敗時 action=gh-failed を返す | 終端アクション |

---

## テストデータ

`SAMPLE_COMMENT_BODY`: `modal/app.py`（hotspotScore=2.1234）と `other/file.js`（0.6300）の2行テーブル
`BELOW_THRESHOLD_COMMENT_BODY`: トップのスコアを 0.8000 に置き換えたバリエーション

`child_process.execFileSync` を `jest.spyOn` でモック化し、引数配列に応じて
`gh pr list` / `gh pr view` / `gh issue list` / `gh issue create` のレスポンスを切り替える。

---

## 依存関係

- `child_process.execFileSync` — `gh` のコマンド名と引数配列を検証するためモック化
