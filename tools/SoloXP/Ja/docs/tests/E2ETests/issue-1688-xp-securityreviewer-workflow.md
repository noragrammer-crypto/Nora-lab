# issue-1688-xp-securityreviewer-workflow E2E Tests

## ユーザーシナリオ概要

セキュリティレビュー専用スキル `xp_SecurityReviewer` が SoloXP に新規導入され、`xp_Director` の
AllGREENフローから `main` へのPR発行前に呼び出される構成になっていることを検証する。
`xp_Reviewer` 導入時の受け入れテスト（issue-746）と同型のアプローチ（SKILL.md・spec文書の構造・契約検証）を踏襲する。

関連イシュー: #1688 / #3026 / #3027 / #3028

## 前提条件

- `.claude/skills/xp_SecurityReviewer/SKILL.md` が存在すること（`SoloXP/skills/xp_SecurityReviewer/SKILL.md` へのsymlink）
- `.claude/skills/xp_Director/SKILL.md` が存在すること
- `SoloXP/WORKFLOW.md`・`SoloXP/docs/spec/xp_securityreviewer.md`・`SoloXP/docs/spec/README.md` が存在すること
- `dotfiles/.claude/skills/xp_SecurityReviewer/SKILL.md`・`dotfiles/.claude/skills/xp_Director/SKILL.md` が存在すること

## Given/When/Then ステップ

### 受け入れ条件1: xp_SecurityReviewer SKILL.md の存在と定義

| # | Given | When | Then |
|---|---|---|---|
| 1 | xp_SecurityReviewer/SKILL.md を読み込む | frontmatterを検査する | `model:` フィールドが定義されている |
| 2 | xp_SecurityReviewer/SKILL.md を読み込む | `security-review` の呼び出し記述を検索する | 記述が見つかる |
| 3 | xp_SecurityReviewer/SKILL.md を読み込む | イシューコメント記録の指示を検索する | 記述が見つかる |
| 4 | xp_SecurityReviewer/SKILL.md を読み込む | 高リスク指摘・改善勧告イシュー起票の記述を検索する | 両方の記述が見つかる |
| 5 | xp_SecurityReviewer/SKILL.md を読み込む | 中程度以下のリスク方針を検索する | 記述が見つかる |
| 6 | xp_SecurityReviewer/SKILL.md を読み込む | `[SecurityReviewer実行中]`/`[SecurityReviewer完了]` マーカーを検索する | 両方の記述が見つかる |
| 7 | xp_SecurityReviewer/SKILL.md を読み込む | フォールバック手順を検索する | 記述が見つかる |

### 受け入れ条件2: xp_Director SKILL.md の xp_SecurityReviewer 統合

| # | Given | When | Then |
|---|---|---|---|
| 8 | xp_Director/SKILL.md を読み込む | `xp_SecurityReviewer` の呼び出し記述を検索する | 記述が見つかる |
| 9 | xp_Director/SKILL.md を読み込む | `xp_Reviewer` からの近接距離を検査する | `xp_Reviewer` の直後（400文字以内）に `xp_SecurityReviewer` が現れる |
| 10 | xp_Director/SKILL.md を読み込む | main PR発行条件を検索する | `xp_SecurityReviewer` 完了が条件に含まれる |
| 11 | xp_Director/SKILL.md を読み込む | 「Claudeが握る境界」リストを検査する | `xp_SecurityReviewer` が含まれる |

### 受け入れ条件3: WORKFLOW.md のAllGREENゲート記載

| # | Given | When | Then |
|---|---|---|---|
| 12 | WORKFLOW.md を読み込む | AllGREENゲート一覧を検索する | `xp_SecurityReviewer` が含まれる |

### 受け入れ条件4: 機能仕様書の存在・索引整合性

| # | Given | When | Then |
|---|---|---|---|
| 13 | docs/spec/xp_securityreviewer.md の存在を確認する | ファイル読み込みを試行する | ファイルが存在する |
| 14 | docs/spec/README.md を読み込む | 索引を検索する | `xp_securityreviewer.md` への参照が見つかる |

### 受け入れ条件5: 正本 → dotfiles/.claude/skills/ 同期整合性

| # | Given | When | Then |
|---|---|---|---|
| 15 | 正本 `SoloXP/skills/xp_SecurityReviewer/SKILL.md` と dotfiles版を読み込む | 内容を比較する | 完全一致する |
| 16 | 正本 `SoloXP/skills/xp_Director/SKILL.md` と dotfiles版を読み込む | 内容を比較する | 完全一致する |

## カバレッジサマリー

- テストファイル: `SoloXP/tests/e2e/issue-1688-xp-securityreviewer-workflow.test.js`
- テスト数: 19件
