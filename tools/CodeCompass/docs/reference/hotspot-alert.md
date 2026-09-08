# hotspot-alert

`CodeCompass/lib/hotspot-alert.js` / `CodeCompass/scripts/hotspot-alert.js`

PRのCodeCompassホットスポットコメントを読み取り、トップ1件のhotspotScoreがしきい値を超えた場合に
構造的リファクタリング検討Issueを自動起票するモジュール（処方箋は書かない）。
`lib/codecompass-to-issues.js`（actions.md由来・複数件・常時起票）とは責務が異なる。

---

## parseHotspotTable(commentBody)

PRコメント本文中の `## CodeCompass Hotspots (Top 10)` ブロック（`scripts/hotspot.js` の
`toMarkdown()` 出力形式）のMarkdownテーブルをパースする。

**パラメータ**

| 名前 | 型 | 説明 |
|------|----|------|
| `commentBody` | `string` | PRコメント本文 |

**返り値**

`Array<{ file: string, hotspotScore: number, complexity: number, changes: number, loc: number, linesChanged: number }>`
（テーブルが見つからない場合は空配列）

---

## evaluateTopHotspot(rows, threshold)

トップ1件の `hotspotScore` がしきい値を超えるか判定する。

**パラメータ**

| 名前 | 型 | 説明 |
|------|----|------|
| `rows` | `Array<object>` | `parseHotspotTable` の出力 |
| `threshold` | `number` | しきい値 |

**返り値**

`{ shouldAlert: boolean, top: object|null, evidence: string }`

- `rows` が空 → `{ shouldAlert: false, top: null, evidence: '' }`
- トップが しきい値以下 → `{ shouldAlert: false, top, evidence: '' }`
- 超えている場合 → `evidence` に2位以下の `changes` 最大値との比較を文字列化する
  （例: `changes=41 は2位以下の最大10の4.1倍`。2位が存在しない場合は `他に比較対象なし`）

---

## buildAlertIssueTitle(file, hotspotScore)

**返り値**: `[CodeCompass Alert] <file> の構造的リファクタリング検討（hotspotScore: <score>）`

## buildAlertIssueBody({ file, hotspotScore, evidence, prNumber })

重複チェック用マーカー `<!-- codecompass-hotspot-alert:file=（file） -->` を本文先頭に含める。
「構造的リファクタリングの検討が必要」という指摘と根拠データのみを記載し、処方箋は書かない。
設計判断は xp_Architect に委譲する旨を明記する。

---

## findLatestMergedPR({ branch, repo })

`gh pr list --repo <repo> --base <branch> --state merged --limit 1 --json number` を実行する。
バッチ文脈の必須読み取りで代替値がないため、`gh` 失敗時は例外を投げず落ちる代わりに握りつぶすことはせず、
`ghUnavailable: true` タグ付きエラーを再送出する（#3220）。呼び出し元（`runHotspotAlert`）がこれを
`action: 'skipped-gh-unavailable'` に変換する。

**返り値**: `number | null`（マージ済みPRが見つからない場合は `null`）

## getHotspotComment({ prNumber, repo })

`gh pr view <prNumber> --repo <repo> --json comments` を実行し、
`/^## CodeCompass Hotspots/m` にマッチする最新コメントの本文を返す。
`findLatestMergedPR` と同様、`gh` 失敗時は `ghUnavailable: true` タグ付きエラーを再送出する（#3220）。

**返り値**: `string | null`

## issueExistsForFile({ file, repo })

`gh issue list --repo <repo> --state open --search "codecompass-hotspot-alert:file=<file> in:body"`
を実行し、重複Issueの有無を判定する（重複起票防止）。
重複チェック（読み取り）のため、`gh` 失敗時は例外を投げず「重複不明→作成続行」で fail-open する
（`false` を返す。抑制の方が実害が大きいため。#3220）。

**返り値**: `boolean`

## createAlertIssue({ file, hotspotScore, evidence, repo, prNumber })

`gh issue create` を `child_process.execFileSync('gh', args)` 経由で実行する。
すべての `gh` 呼び出しは引数配列を使用し、file・repo 等に含まれるシェルメタ文字を展開しない。
ラベル: `enhancement,codecompass-detected`

書き込み操作のため、`gh` 失敗時は例外を投げず `{ action: 'gh-failed', file, hotspotScore, evidence, prNumber }`
を返し、判断を呼び出し元に委ねる（`SocialMediaAgent/lib/report-post-failure.js` と同じパターン。#3220）。
成功時は何も返さない（`undefined`）。

## runHotspotAlert({ branch = 'main', threshold = 1, repo, dryRun = false })

上記を結合したオーケストレーション関数。

**返り値**: `{ action: 'created'|'skipped-below-threshold'|'skipped-duplicate'|'skipped-no-data'|'skipped-gh-unavailable'|'gh-failed', file, hotspotScore }`

- `skipped-gh-unavailable`（#3220）: `findLatestMergedPR` / `getHotspotComment` が `gh` 失敗で
  `ghUnavailable` エラーを投げた場合の終端アクション
- `gh-failed`（#3220）: `createAlertIssue` が `gh issue create` 失敗時に返す構造化結果をそのまま伝播

`dryRun: true` の場合は `createAlertIssue` を呼ばず、判定結果のみ返す。

**使用例**

```js
const { runHotspotAlert } = require('./lib/hotspot-alert');

const result = runHotspotAlert({ branch: 'main', threshold: 1, repo: 'owner/repo' });
// → { action: 'created', file: 'modal/app.py', hotspotScore: 2.1234 }
```

---

## scripts/hotspot-alert.js（CLI）

```bash
node CodeCompass/scripts/hotspot-alert.js [--branch=main] [--threshold=1] [--repo=owner/repo] [--dry-run]
```

- `--repo` 省略時は `gh repo view --json nameWithOwner` で自動検出する。この自動検出も
  `gh` 失敗時は例外を投げず `skipped-gh-unavailable` を出力して終了する（#3220/#3271。
  Codexレビュー指摘: ここで例外を投げると `runHotspotAlert` 内の他の gh フォールバックに
  到達する前にプロセス全体がクラッシュしていた）
- 実行結果（action・file・hotspotScore）を stdout に出力する
- データソースは `gh` CLI 経由の PR コメントのみ（ローカルの git log/AST解析はしない）

---

## .github/workflows/hotspot-alert.yml（CI自動トリガー）

main への push（PRマージ後）で本CLIを自動実行するワークフロー。

```yaml
on:
  push:
    branches:
      - main

jobs:
  hotspot-alert:
    permissions:
      contents: read
      pull-requests: read
      issues: write
    env:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    steps:
      - run: node scripts/hotspot-alert.js --branch=main
        working-directory: CodeCompass
```

- `pull-requests: read` … `gh pr list/view` でマージ済みPR・ホットスポットコメントを取得するために必要
- `issues: write` … `gh issue create` でアラートIssueを起票するために必要
- `GH_TOKEN` にデフォルトの `secrets.GITHUB_TOKEN` を渡すことで `gh` CLI がそのまま動作する
