# hotspot-alert 仕様

## 概要

PR の CodeCompass ホットスポットコメント（`.github/workflows/codecompass.yml` が投稿する
`## CodeCompass Hotspots (Top 10)` ブロック）を読み取り、トップ1件の `hotspotScore` がしきい値を
超えた場合に構造的リファクタリング検討の Issue を自動起票する。

**`codecompass-to-issues.md` との違い**: `codecompass-to-issues.js` は `actions.md`（`refactoring-proposal.js`
の出力）由来で複数件を常時起票するのに対し、本機能は PR コメント由来でトップ1件のみをしきい値判定して起票する。
両者は責務分離された別実装であり、混同しないこと。

処方箋（具体的な修正方法）は書かず、構造的リファクタリング検討の指摘と根拠データのみを記載する。
設計判断は xp_Architect に委譲する。

関連イシュー: [#1546](../issues/)（Story）、[#1547](../issues/)（E2Eテスト）、[#1548](../issues/)（実装）、[#1555](../issues/)（CI自動トリガー化）

---

## CI 自動トリガー（.github/workflows/hotspot-alert.yml）

main への push（PRマージ後）をトリガーに `scripts/hotspot-alert.js --branch=main` を自動実行する。

- **トリガー条件**: `on: push: branches: [main]`
- **実行タイミング**: PR が main にマージされる度（マージコミットの push イベント）
- **権限**: `contents: read` / `pull-requests: read`（`gh pr list/view` 用） / `issues: write`（`gh issue create` 用）
- **認証**: `GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}`（デフォルトの `GITHUB_TOKEN` で `gh` CLI が動作する）
- **既知の制約**:
  - `.github/workflows/codecompass.yml`（PRトリガー）が投稿したホットスポットコメントに依存するため、
    そのコメントが付いた PR がマージされていない場合は `skipped-no-data` で終了する
  - main 固定。複数ブランチ対応はスコープ外（#1555 時点）
  - しきい値・実行頻度のチューニングはスコープ外。まずは既定値（`threshold=1`）で運用する

---

## lib/hotspot-alert.js

### parseHotspotTable(commentBody)

PR コメント本文中の `| file | hotspotScore | complexity | changes | loc | linesChanged |`
形式の Markdown テーブルをパースする。

**引数**

| 引数 | 型 | 説明 |
|------|----|------|
| `commentBody` | `string` | PR コメント本文（null・空文字も可） |

**返り値**

```json
[
  { "file": "modal/app.py", "hotspotScore": 2.1234, "complexity": 50, "changes": 41, "loc": 800, "linesChanged": 900 }
]
```

テーブルが見つからない場合は空配列を返す。

---

### evaluateTopHotspot(rows, threshold)

トップ1件（`rows[0]`）の `hotspotScore` がしきい値を超えるか判定する。

**引数**

| 引数 | 型 | 説明 |
|------|----|------|
| `rows` | `Array<object>` | `parseHotspotTable` の返り値 |
| `threshold` | `number` | しきい値 |

**返り値**

| ケース | 返り値 |
|--------|--------|
| `rows` が空 | `{ shouldAlert: false, top: null, evidence: '' }` |
| `rows[0].hotspotScore <= threshold` | `{ shouldAlert: false, top: rows[0], evidence: '' }` |
| しきい値を超える | `{ shouldAlert: true, top: rows[0], evidence: <string> }` |

`evidence` は2位以下の `changes` 最大値との比較を文字列化したもの
（例: `changes=41 は2位以下の最大10の4.1倍`）。2位が存在しない場合は `他に比較対象なし`。

---

### buildAlertIssueTitle(file, hotspotScore)

```
[CodeCompass Alert] <file> の構造的リファクタリング検討（hotspotScore: <score>）
```

---

### buildAlertIssueBody({ file, hotspotScore, evidence, prNumber })

重複チェック用マーカー `<!-- codecompass-hotspot-alert:file=<file> -->` を本文先頭に含む。
指摘・根拠データのみを記載し、処方箋は書かない。設計判断は xp_Architect に委譲する旨を明記する。

---

### findLatestMergedPR({ branch, repo })

`gh pr list --repo <repo> --base <branch> --state merged --limit 1 --json number` を実行し、
見つかった PR 番号を返す。なければ `null`。

バッチ文脈の必須読み取りで代替値がないため、`gh` 失敗時は `ghUnavailable: true` タグ付きエラーを
再送出する（#3220）。呼び出し元 `runHotspotAlert` はこれを検出して `action: 'skipped-gh-unavailable'`
で処理を打ち切る。

---

### getHotspotComment({ prNumber, repo })

`gh pr view <prNumber> --repo <repo> --json comments` を実行し、
本文が `/^## CodeCompass Hotspots/m` にマッチする最新コメントの body を返す。なければ `null`。

`findLatestMergedPR` と同様、`gh` 失敗時は `ghUnavailable: true` タグ付きエラーを再送出する（#3220）。

---

### issueExistsForFile({ file, repo })

`gh issue list --repo <repo> --state open --search "codecompass-hotspot-alert:file=<file> in:body"`
を実行し、1件以上見つかれば `true`（重複起票防止）。

重複チェック（読み取り）のため、`gh` 失敗時は例外を投げず「重複不明→作成続行」で fail-open する
（`false` を返す。重複を見逃すより誤って抑制する方が実害が大きいため。#3220）。

---

### createAlertIssue({ file, hotspotScore, evidence, repo, prNumber })

`gh issue create` を `child_process.execFileSync('gh', args)` 経由で実行する。
すべての `gh` 呼び出しは引数配列を使用し、file・repo 等に含まれるシェルメタ文字を展開しない。
ラベル: `enhancement,codecompass-detected`

書き込み操作のため、`gh` 失敗時は例外を投げず `{ action: 'gh-failed', file, hotspotScore, evidence, prNumber }`
を返し、判断を呼び出し元に委ねる（`SocialMediaAgent/lib/report-post-failure.js` と同じパターン。#3220）。

---

### runHotspotAlert({ branch = 'main', threshold = 1, repo, dryRun = false })

上記を結合したオーケストレーション関数。

**返り値**

```json
{ "action": "created" | "skipped-below-threshold" | "skipped-duplicate" | "skipped-no-data" | "skipped-gh-unavailable" | "gh-failed", "file": "...", "hotspotScore": 0 }
```

- `skipped-gh-unavailable`（#3220）: 必須読み取り（`findLatestMergedPR` / `getHotspotComment`）が
  `gh` 失敗で終端した場合
- `gh-failed`（#3220）: `createAlertIssue` の起票失敗をそのまま伝播した場合

`dryRun: true` の場合は `createAlertIssue` を呼ばず判定結果のみ返す。

### gh 失敗時のフォールバック設計（#3220）

`.github/workflows/hotspot-alert.yml`（`GH_TOKEN` あり）以外の経路で本モジュールが呼ばれる場合
（手動実行等）に備えた防御的改善。役割ごとに方針を分ける：

| 関数 | 役割 | gh失敗時の挙動 |
|---|---|---|
| `findLatestMergedPR` / `getHotspotComment` | バッチ文脈の必須読み取り（代替値なし） | `ghUnavailable` エラーを再送出 → `skipped-gh-unavailable` |
| `issueExistsForFile` | 重複チェック（読み取り） | fail-open（`false` を返す。重複不明→作成続行） |
| `createAlertIssue` | 書き込み | `{action: 'gh-failed', ...}` を返す（例外を投げない） |

---

## scripts/hotspot-alert.js

### 使い方

```bash
node CodeCompass/scripts/hotspot-alert.js \
  [--branch=main] [--threshold=1] [--repo=owner/repo] [--dry-run]
```

- `--repo` 省略時は `gh repo view --json nameWithOwner` で自動検出する。`gh` 失敗時は例外を
  投げず `skipped-gh-unavailable` を出力して終了する（#3220/#3271）
- データソースは `gh` CLI 経由の PR コメントのみ（ローカルの `git log`/AST解析はしない。
  ClaudeCode Web のシャロークローン環境でも正しく動作させるための設計。#1541 を踏まえる）
- 実行結果（`action file=... hotspotScore=...`）を stdout に出力する

### 動作フロー

```
--repo 省略時: detectRepo()（gh repo view）
  → gh失敗: skipped-gh-unavailable（#3220/#3271。ここで例外を投げず main() 全体のクラッシュを防ぐ）
findLatestMergedPR(branch)
  → gh失敗: skipped-gh-unavailable（#3220） / 見つからない: skipped-no-data
getHotspotComment(prNumber)
  → gh失敗: skipped-gh-unavailable（#3220） / コメントなし: skipped-no-data
parseHotspotTable(commentBody) → evaluateTopHotspot(rows, threshold)
  → shouldAlert=false: skipped-below-threshold
issueExistsForFile(top.file)
  → gh失敗: fail-open で続行（#3220） / 重複あり: skipped-duplicate
dryRun でなければ createAlertIssue()
  → gh失敗: gh-failed（#3220） / 成功: created
```
