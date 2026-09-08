# xp_issueArchiveFinalize 機能仕様書

## 概要

`<EpicName>/docs/issues/issue-*.MD`（`xp_issue2md` が生成するIssue Markdownスナップショット）は
取得時点のGitHub Issue状態を保存するだけで、後からGitHub上でIssueがcloseされてもMarkdown側の
front matter `state` は自動更新されない。

`xp_issueArchiveFinalize` は、対象Epic配下の `state: open` なIssue Markdownだけを対象に
GitHub上の実際の状態を再確認し、closed済みなら最新版へ差し替える（Issue #2971 / #3484）。

- **open中**: 作業用キャッシュ。多少のstaleは許容する
- **closed後**: 完成資料。Epic完了付近でGitHubから再取得してfinalizeする

常時同期・全Issue再列挙は行わない。`state: open` のローカル候補だけがGitHub APIの問い合わせ対象になる。

## コマンド

```
/xp_issueArchiveFinalize <EpicName>
```

呼び出し元: `xp_Director`（AllGREENフロー手順8。#3485で組み込み済み）、`daily-tasks`（5.5節、Epic横断の定期実行。#3486で組み込み済み）。

## 処理フロー

1. **候補抽出**（決定的・ファイルシステムのみ）
   `SoloXP/scripts/find-stale-issue-archives.sh <EpicName>` が `<EpicName>/docs/issues/issue-*.MD`
   を走査し、front matter `state: open` のファイルのissue番号を1行1件で標準出力する。
   `docs/issues` が存在しない・候補が0件の場合は空を返す（エラーにしない）。
2. **状態再確認**（GitHub API・LLM駆動）
   候補ごとに `gh issue view <n> --json state -q .state` で軽量に状態を確認する。
   `gh` が使えない場合は `mcp__github__issue_read`（method: `get`）にフォールバックする
   （`xp_issue2md` で確立済みのパターンと同一）。
3. **finalize or no-op**
   - `closed` と判明した候補: 既存の `xp_issue2md <n>` をそのまま呼び出し、本文・コメント・
     front matter（`state: closed`含む）を丸ごと再生成する。新しい生成ロジックは持たない。
   - まだ `open` の候補: 何もしない（不要な書き換えをしない）。
4. **サマリ報告**
   走査件数・finalize件数・スキップ件数を呼び出し元に報告する。

## 実行可能スクリプト

| ファイル | 責務 |
|---|---|
| `SoloXP/scripts/find-stale-issue-archives.sh` | `<EpicDir>/docs/issues/issue-*.MD` から `state: open` 候補のissue番号を抽出する決定的処理のみを担う。GitHub APIへの問い合わせは行わない |

## スキル本体

| ファイル | 責務 |
|---|---|
| `SoloXP/skills/xp_issueArchiveFinalize/SKILL.md` | 候補抽出スクリプトの呼び出し・GitHub状態再確認（gh/MCPフォールバック）・`xp_issue2md`再利用によるfinalize・サマリ報告 |

## 非目的（Issue #2971）

- Issueコメント追加のたびにMarkdownを同期する常時同期機構は作らない
- 全GitHub Issueを毎回APIで列挙し直さない
- Issue Markdownの `state` をSoloXPの `depends_on` 解消・`[Auditor GREEN]` 判定のSSOTにはしない
  （ワークフロー判定は引き続きGitHub上の実際の状態・既存の完了マーカーに従う）

## 関連イシュー

| Issue | 状態 | 内容 |
|---|---|---|
| [#2971](https://github.com/noragrammer-crypto/HolyAutomater/issues/2971) | open | 親Story: Epic完了時にIssue Markdownをfinalizeしclosed状態へ同期する（全サブタスク完了、mainへのPRマージで自動close予定） |
| [#3484](https://github.com/noragrammer-crypto/HolyAutomater/issues/3484) | closed | 本スキル・スクリプトの新規作成（このドキュメントが対応するタスク。PR #3489） |
| [#3485](https://github.com/noragrammer-crypto/HolyAutomater/issues/3485) | closed | xp_Director AllGREENフローへの組み込み（PR #3491） |
| [#3486](https://github.com/noragrammer-crypto/HolyAutomater/issues/3486) | closed | daily-tasksへのEpic横断組み込み（PR #3492） |
| [#3487](https://github.com/noragrammer-crypto/HolyAutomater/issues/3487) | closed | Story-level E2Eテストスイート作成（PR #3490） |
| [#3488](https://github.com/noragrammer-crypto/HolyAutomater/issues/3488) | open | 機能仕様書更新（このタスク自身） |
