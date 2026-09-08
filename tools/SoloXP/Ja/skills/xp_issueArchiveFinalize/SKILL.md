---
model: claude-sonnet-4-6
---

# XP Issue Archive Finalize Skill

## コマンド

### `/xp_issueArchiveFinalize <EpicName>`

`<EpicName>/docs/issues/issue-*.MD` に保存済みのIssue Markdownスナップショットのうち、
front matter が `state: open` のままGitHub上ではclosed済みになっているものを、
最新版（本文・コメント・front matter含む）へ差し替える。

> **呼び出し元**: `xp_Director`（AllGREENフロー付近）、`daily-tasks`（Epic横断の定期実行）から呼ばれる。

---

## 背景（Issue #2971）

`docs/issues/issue-*.MD` は取得時点のGitHub Issue状態をスナップショットするだけで、
後からGitHub上でIssueがcloseされてもMarkdown側は自動更新されない。特にタスクイシューの
Markdownは `xp_Documenter`（`xp_issue2md` を内包）の実行タイミングが `xp_Director` による
`gh issue close` より**前**であるため、ほぼ常に生成直後から `state: open` のまま古くなる。

本スキルは「open中は多少stale許容・close後は完成資料として最終化する」という2段階運用を
実現するための、Epic完了付近での同期処理を担う（常時同期・全Issue再取得は行わない）。

---

## 責務

- 対象Epic配下の `state: open` なIssue Markdownを候補として洗い出す
- 候補ごとにGitHub上の実際の状態を再確認する
- closed済みなら既存の `xp_issue2md` を再利用して丸ごと再生成する（新しい生成ロジックは作らない）
- まだopenの候補は一切書き換えない
- 走査・finalize・スキップの件数をサマリとして呼び出し元に報告する

**本スキル自身はコードを書かない（Documenter系の責務としてドキュメント生成のみを行う）。**

---

## 処理フロー

### 1. 候補を洗い出す

決定的なファイルシステム走査は `SoloXP/scripts/find-stale-issue-archives.sh` に委ねる：

```bash
SoloXP/scripts/find-stale-issue-archives.sh <EpicName>
```

`<EpicName>/docs/issues/` 配下で front matter が `state: open` のファイルの issue 番号を
1行1件で標準出力する。`docs/issues` が存在しない場合や候補が0件の場合は空を返す
（エラーにしない）。

出力が空の場合は「候補なし」として手順4のサマリを報告して終了する。

### 2. 候補ごとにGitHub上の状態を再確認する

各候補issue番号について、軽量な状態確認のみを行う（本文・コメントの再取得はまだ行わない）：

```bash
gh issue view <issue_number> --json state -q .state
```

`gh` が使えない場合（ClaudeCodeWeb等、`HTTP 403`等で失敗する場合）は GitHub MCP ツールに
フォールバックする（`xp_issue2md` で確立済みのパターンと同一）：

```
mcp__github__issue_read（method: get, issue_number: <issue_number>）
  → state フィールドを確認する
```

### 3. closed判定なら再生成、openのままなら何もしない

- GitHub上で `closed`: `xp_issue2md <issue_number> <EpicName>` を呼び出す（本コマンドの
  `<EpicName>` 引数、すなわち候補ファイルを発見した際のエピックディレクトリをそのまま渡す）。
  本文・コメント全件・front matter（`state: closed` を含む）を丸ごと再生成する。
  保存先パス・front matter形式は `xp_issue2md` の既存仕様に完全に従う（本スキルは
  再生成ロジックを独自に持たない）。

  **`<EpicName>` を省略してはならない**: `xp_issue2md` は省略時、issueのラベル
  （`epic/<EpicName>`）からラベルベースで保存先エピックを再判定する。候補ファイルが
  実際に置かれているディレクトリと、issueのラベルが指すエピック名が食い違っている
  ケース（例: `Cowork/docs/issues/issue-596.MD` が `epic/kakuyomu-post` ラベルを持つが
  リポジトリ直下に `kakuyomu-post/` ディレクトリが存在しない）では、ラベルベース判定が
  候補ファイルとは無関係のディレクトリを解決するか判定不能でユーザー確認を要求し、
  無人実行（`daily-tasks`からの呼び出し等）が停止・迷子書き込みする（Codexレビュー
  指摘・PR #3508）。`<EpicName>` を明示すればこのラベル再判定はスキップされ、
  候補ファイルそのものが確実に上書きされる。
- GitHub上でまだ `open`: **何もしない**。ファイルを一切書き換えない
  （openなIssueへの不要な書き換えを避けるため。#2971の受け入れ条件）。

全候補について上記を繰り返す。

### 4. サマリを報告する

呼び出し元（`xp_Director` または `daily-tasks`）に以下の形式で報告する：

```
## Issue Archive Finalize 完了

対象Epic: <EpicName>
走査件数: <候補として抽出したファイル数>
finalize件数: <closed判定で再生成した件数>
スキップ件数: <まだopenで書き換えなかった件数>
```

---

## 注意事項

- 本スキルは `state: open` の候補だけをGitHub APIに問い合わせる。全Issueを毎回列挙し直す
  常時同期は行わない（#2971の非目的）
- Issue Markdownの `state` はSoloXPの `depends_on` 解消判定・`[Auditor GREEN]` 判定のSSOTには
  ならない。ワークフロー判定は引き続きGitHub上の実際の状態や `[Auditor GREEN]` コメント等、
  既存ルールに従う
- `docs/issues` ディレクトリが存在しないEpicに対して呼ばれた場合はエラーにせず「候補なし」
  として終了する
