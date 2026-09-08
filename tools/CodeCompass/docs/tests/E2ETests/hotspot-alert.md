# E2E Tests: CodeCompassホットスポット検出→Issue自動起票スキル（Story #1546 / Task #1547・#1548）

テストファイル: `CodeCompass/__tests__/e2e/hotspot-alert.e2e.test.js`

テストフレームワーク: Jest（`execSync` で CLI を実行する受け入れテスト）

テスト対象: `CodeCompass/scripts/hotspot-alert.js [--branch=main] [--threshold=1] [--repo=owner/repo] [--dry-run]`

外部依存のモック方針: 実際の `gh` コマンドは呼ばない。`fixtures/bin/gh`（Node製スタブ）を PATH 先頭に追加して
子プロセスとして起動するスクリプトから呼ばれる `gh` をすべて差し替える。`FAKE_GH_SCENARIO` 環境変数で
シナリオ（しきい値超え/未満・重複あり/なし・PRなし）を切り替え、`FAKE_GH_LOG` に記録された呼び出しログを検証する。

---

## 受け入れ条件

1. 対象ブランチの最新マージ済みPRのCodeCompassホットスポットコメントを取得できる
2. コメント中のトップ1件の hotspotScore がしきい値（既定値1）を超えるか判定できる
3. 超えている場合、ファイル名・スコア・根拠（changesの外れ値比較等）を含むIssueを起票できる（処方箋は書かない）
4. 同じファイルに対する重複Issueがある場合は起票しない
5. しきい値を超えていない場合は何も起票しない

---

## テスト一覧

### 1. scripts/hotspot-alert.js / lib/hotspot-alert.js が存在する

**シナリオ概要**: 実装タスク #1548 完了前は RED、完了後は GREEN になる存在確認

| ステップ | 種別 | 内容 |
|---|---|---|
| Then | 検証 | `fs.existsSync(SCRIPT_PATH)` / `fs.existsSync(LIB_PATH)` が `true` |

---

### 2. lib/hotspot-alert.js の単体インターフェース検証

**シナリオ概要**: `parseHotspotTable` / `evaluateTopHotspot` / `buildAlertIssueTitle` / `buildAlertIssueBody` が
仕様どおりにエクスポート・動作することを確認する（unit テストと重複する契約検証）

| ステップ | 種別 | 内容 |
|---|---|---|
| Then | 検証 | 受け入れ条件1・2: PRコメントのテーブルパースとしきい値判定が正しく動く |
| Then | 検証 | 受け入れ条件3: タイトル・本文生成が処方箋を含まず重複チェック用マーカーを含む |

---

### 3. CLIスクリプトの end-to-end 実行（gh はスタブで差し替え）

**シナリオ概要**: `FAKE_GH_SCENARIO` でシナリオを切り替え、CLI 全体の挙動を検証する

| ステップ | 種別 | 内容 |
|---|---|---|
| Given | 前提 | `fixtures/bin/gh` を PATH 先頭に追加し、実 `gh` を呼ばないようにする |
| When | 操作 | `node scripts/hotspot-alert.js --branch=main --threshold=1 --repo=owner/repo` を実行する |
| Then | 検証 | 受け入れ条件3: `above-threshold-no-duplicate` シナリオで stdout に `created`、ログに `gh issue create` が記録される |
| Then | 検証 | 受け入れ条件5: `below-threshold` シナリオで stdout に `skipped-below-threshold`、`gh issue create` が呼ばれない |
| Then | 検証 | 受け入れ条件4: `duplicate-exists` シナリオで stdout に `skipped-duplicate`、`gh issue create` が呼ばれない |
| Then | 検証 | `no-pr-found` シナリオで stdout に `skipped-no-data`、`gh issue create` が呼ばれない |
| Then | 検証 | `--dry-run` 指定時はしきい値超えでも `gh issue create` が呼ばれない |

---

### 4. gh 失敗時のフォールバック（#3220 / #3265）

**シナリオ概要**: `FAKE_GH_FAIL` 環境変数（`fixtures/bin/gh` 拡張、#3220）で `gh` サブコマンド単位の
疑似失敗（`HTTP 403`相当）を注入し、クラッシュせず適切な終端アクションを返すことを検証する

| ステップ | 種別 | 内容 |
|---|---|---|
| Given | 前提 | `FAKE_GH_FAIL` に失敗させたいサブコマンド名（`pr-list`/`pr-view`/`issue-list`/`issue-create`）を指定する |
| Then | 検証 | `findLatestMergedPR`（`gh pr list`）失敗時: 例外で落ちず `skipped-gh-unavailable` を返す |
| Then | 検証 | `getHotspotComment`（`gh pr view`）失敗時: 例外で落ちず `skipped-gh-unavailable` を返す |
| Then | 検証 | `issueExistsForFile`（`gh issue list`）失敗時: 重複不明のまま fail-open で `gh issue create` を試行し `created` を返す |
| Then | 検証 | `createAlertIssue`（`gh issue create`）失敗時: 例外で落ちず `gh-failed` を返す |
| Then | 検証 | `--repo` 省略時、`detectRepo`（`gh repo view`）失敗時: 例外で落ちず `skipped-gh-unavailable` を返す（Codexレビュー指摘 #3271） |

実装タスク #3265（`report-post-failure.js` と同じ「gh優先→失敗時フォールバック→構造化戻り値」
パターンの適用）により GREEN 化済み。`Nora-lab/tools/CodeCompass/` の同型コピーにも同一実装・
同一テストを適用済み（旧 `execSync`＋文字列組み立て実装だった乖離もこの機会に解消した）。
PR #3271 の Codex レビューで `detectRepo()`（`--repo` 省略時のリポジトリ自動検出）が
同じ gh フォールバックパターンから漏れていた指摘を受け、追加修正・追加テストを適用済み。

---

## カバレッジサマリー

| 受け入れ条件 | テスト数 | 状態 |
|---|---|---|
| AC1・AC2: パース・しきい値判定 | 6 | ✅ |
| AC3: Issue文面生成（処方箋なし・重複マーカーあり） | 3 | ✅ |
| AC3: CLI実行時のIssue起票 | 1 | ✅ |
| AC4: 重複時は起票しない | 1 | ✅ |
| AC5: しきい値以下は起票しない | 1 | ✅ |
| PRなし時は起票しない | 1 | ✅ |
| dry-run時は起票しない | 1 | ✅ |
| 存在確認 | 2 | ✅ |
| gh失敗時のフォールバック（#3220） | 5 | ✅ |

合計: 22件 — 全22件 GREEN（実装タスク #1548・#3265 完了分、Codexレビュー指摘対応分含む）
