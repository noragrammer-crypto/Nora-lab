# E2E テストドキュメント: Issue #1461
## AI開発コスト可視化 — Issue単位のトークン消費トラッキング

テストファイル: `SoloXP/tests/e2e/issue-1461-ai-dev-cost-token-tracking.test.js`

---

## ユーザーシナリオ概要

AI 開発（Claude Code / Codex 等）のトークン消費を Issue/Epic 単位で記録・集計できるようにする。
作業完了コメントに `tokens:` / `model:` 行を追記する手動記録フォーマットを定義し、
`xp_worklog` がそれをパースして Issue 単位・Epic 単位で集計し、
`ops-meeting` の週次レポートに反映されることを検証する。

---

## 前提条件

- `CLAUDE.md` が存在すること
- `dotfiles/.claude/skills/xp_worklog/SKILL.md` が存在すること
- `SoloXP/skills/xp_worklog/SKILL.md` が存在すること
- `dotfiles/.claude/skills/ops-meeting/SKILL.md` が存在すること
- `SoloXP/skills/ops-meeting/SKILL.md` が存在すること

---

## テストケース一覧（15件）

### 前提条件: CLAUDE.md にトークン消費記録フォーマットが定義されている（4件）

| # | Given | When | Then |
|---|---|---|---|
| 1 | CLAUDE.md が存在する | 作業時間記録ルールセクションを確認する | `tokens:` フォーマット例が存在する |
| 2 | CLAUDE.md の tokens フォーマット例が存在する | フィールド内容を確認する | `prompt=` / `completion=` / `total=` が含まれる |
| 3 | CLAUDE.md が存在する | model フィールドを確認する | 作業時間記録ルールセクション内に `model:` の記述がある |
| 4 | CLAUDE.md が存在する | フォーマット崩れ時の対応方針を確認する | `tokens` / `model` に言及したユーザー確認指示がある |

### AC-1: Issue単位のトークン消費が xp_worklog で集計できる（3件）

| # | Given | When | Then |
|---|---|---|---|
| 5 | xp_worklog SKILL.md が存在する | 作業時間コメントのフォーマットセクションを確認する | `tokens:` を認識する記述がある |
| 6 | xp_worklog SKILL.md が存在する | Issue別レポートフォーマットを確認する | トークン消費列（`トークン` または `tokens`）がある |
| 7 | xp_worklog SKILL.md が存在する | worklog ファイル保存フォーマットを確認する | トークン消費列が含まれる |

### AC-3: Epic単位でトークン消費・完了Issue数の数字で判断できる（3件）

| # | Given | When | Then |
|---|---|---|---|
| 8 | xp_worklog SKILL.md が存在する | Epic単位集計に関するセクションを確認する | トークン消費に言及した Epic 集計セクションがある |
| 9 | Epic集計セクションが存在する | 完了Issue数とトークン消費の記述を確認する | 両方が同一セクションに含まれる |
| 10 | Epic集計セクションが存在する | 集計する数値の種類を確認する | 合計または平均トークン消費の記述がある |

### AC-2: ops-meeting レポートに週次トークンサマリーが含まれる（3件）

| # | Given | When | Then |
|---|---|---|---|
| 11 | ops-meeting SKILL.md が存在する | 週次トークンサマリーに関する記述を確認する | 週次トークンサマリーへの言及がある |
| 12 | ops-meeting SKILL.md が存在する | worklog からのデータ取得指示を確認する | worklog とトークンに言及した読み込み指示がある |
| 13 | ops-meeting SKILL.md が存在する | レポート出力テンプレートを確認する | トークン消費セクションが含まれる |

### ファイル同期: dotfiles と SoloXP の SKILL.md が同一内容（2件）

| # | Given | When | Then |
|---|---|---|---|
| 14 | dotfiles と SoloXP の xp_worklog SKILL.md が存在する | 両ファイルを比較する | 内容が完全一致する |
| 15 | dotfiles と SoloXP の ops-meeting SKILL.md が存在する | 両ファイルを比較する | 内容が完全一致する |

---

## 実装状況

| サブイシュー | 内容 | 状態 |
|---|---|---|
| #2141 | トークン消費記録フォーマットの定義とワークログルール整備 | 完了 |
| #2143 | xp_worklog へのトークン消費パース・Issue単位集計追加 | 完了 |
| #2144 | xp_worklog への Epic単位トークン消費集計・ROI表示追加 | 完了 |
| #2145 | ops-meeting への週次トークンサマリーセクション追加 | 完了 |

---

## 実行結果

| 実行日 | PASS | FAIL | 状態 |
|---|---|---|---|
| 2026-07-18 | 6 | 9 | 実装前（RED 確認 — #2141 のみ完了の状態） |
| 2026-07-19 | 10 | 5 | #2143 実装後（AC-1 GREEN、AC-2/AC-3 RED — #2144/#2145 で実装予定） |
| 2026-07-19 | 13 | 2 | #2144 実装後（AC-1/AC-3 GREEN、AC-2 RED — #2145 で実装予定） |
| 2026-07-20 | 15 | 0 | #2145 実装後（全AC GREEN） |
