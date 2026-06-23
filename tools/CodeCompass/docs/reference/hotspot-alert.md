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

**返り値**: `number | null`（マージ済みPRが見つからない場合は `null`）

## getHotspotComment({ prNumber, repo })

`gh pr view <prNumber> --repo <repo> --json comments` を実行し、
`/^## CodeCompass Hotspots/m` にマッチする最新コメントの本文を返す。

**返り値**: `string | null`

## issueExistsForFile({ file, repo })

`gh issue list --repo <repo> --state open --search "codecompass-hotspot-alert:file=<file> in:body"`
を実行し、重複Issueの有無を判定する（重複起票防止）。

**返り値**: `boolean`

## createAlertIssue({ file, hotspotScore, evidence, repo, prNumber })

`gh issue create` を `child_process.execSync` 経由で実行する
（`codecompass-to-issues.js` の `createIssues` と同じ execSync パターン）。
ラベル: `enhancement,codecompass-detected`

## runHotspotAlert({ branch = 'main', threshold = 1, repo, dryRun = false })

上記を結合したオーケストレーション関数。

**返り値**: `{ action: 'created'|'skipped-below-threshold'|'skipped-duplicate'|'skipped-no-data', file, hotspotScore }`

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

- `--repo` 省略時は `gh repo view --json nameWithOwner` で自動検出する
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
