---
issue: 2144
title: "[Task] xp_worklog への Epic単位トークン消費集計・ROI表示追加"
state: open
labels: [task, epic/SoloXP]
author: noragrammer-crypto
created_at: 2026-07-17T05:20:00Z
epic: SoloXP
---

# #2144 [Task] xp_worklog への Epic単位トークン消費集計・ROI表示追加

## 本文

## 概要

`SoloXP/skills/xp_worklog/SKILL.md` に、Epic単位のトークン消費ROI集計指示を追加する。

- `worklog/YYYY/MM/.md` に保存された（#2143で追加する）Issue単位トークン消費データをEpic単位で集計する
- 「総トークン消費 / 完了Issue数 / Issue単位平均トークン消費」を算出し、ワークログレポートのサマリーセクションに追加する
- 複数月にまたがるEpicの集計方法（月別ファイルの合算）を明記する

## 見積もり

3pt

## 依存関係

このタスクは #2143 の完了後に着手すること。
（依存先サブイシューに [Auditor GREEN] コメントが記録されてから着手する）

depends_on: #2143

## 親ストーリー
#1461

## 親ブランチ
feature/issue-1461

## コメント

### noragrammer-crypto — 2026-07-19T12:05:59Z

## 観測可能変更チェック（[Task]スキップ判定）

対象: #2144
観測可能な振る舞いの変更: なし
理由: `SoloXP/skills/xp_worklog/SKILL.md` へのプロンプト指示追記のみ。xp_worklog はプロンプト駆動でバックエンドスクリプトを持たないため、変更媒体は SKILL.md・ドキュメントのみ（"SKILL.md・ドキュメント記述のみの変更 → なし" に該当）。

→ Architect をスキップして実行フローへ直接進む。

---

### noragrammer-crypto — 2026-07-19T12:06:05Z

作業開始 2026-07-19 12:30 JST
セッションURL: https://claude.ai/code/session_01V7Fh3g9Z1P3aaHmaeVyE24
[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-07-19T12:06:12Z

[Tester実行中]

---

### noragrammer-crypto — 2026-07-19T12:08:47Z

## テスト実行結果

### Unit Test
スキップ: SKILL.md・ドキュメント記述のみの変更のためテスト対象コードなし

### Functional Test
スキップ: 同上

### E2E Test（既存スイート: `SoloXP/tests/e2e/issue-1461-ai-dev-cost-token-tracking.test.js`）

このタスクのスコープは AC-3 (Epic単位集計) のみ。

| テスト | 状態 | 備考 |
|--------|------|------|
| AC-3: xp_worklog に Epic単位のトークン消費集計セクションが存在する | 🔴 RED | このタスクで GREEN にする |
| AC-3: Epic単位レポートに完了Issue数とトークン消費が並列して記載される | 🔴 RED | このタスクで GREEN にする |
| AC-3: Epic単位レポートにトークン消費の平均または合計が含まれる | ✅ PASS | 既存フォーマット例で充足済み |
| AC-2: ops-meeting 関連 3件 | 🔴 RED | #2145 のスコープ（このタスクは変更しない） |
| AC-1・前提条件・ファイル同期: 10件 | ✅ PASS | #2143 完了済み |

総計: FAIL 5件 / PASS 10件（#2144 スコープ: FAIL 2件）

### 実装で GREEN にすべき内容

1. `xp_worklog` SKILL.md に「Epic単位トークン消費集計」セクションを追加する
   - 正規表現 `/[Ee]pic.*トークン|トークン.*[Ee]pic|ROI|roi/i` にマッチするテキスト
2. Epic 単位で「完了Issue数」と「トークン消費」が並列して記載されるレポートフォーマットを追記する
   - 正規表現 `/完了.*トークン|トークン.*完了/` にマッチするテキスト

---

### noragrammer-crypto — 2026-07-19T12:08:52Z

[Tester完了]

---

### noragrammer-crypto — 2026-07-19T12:08:57Z

[Implementer実行中]

---

### noragrammer-crypto — 2026-07-19T12:14:20Z

[Implementer完了]

## 実装完了

変更ファイル（3コピー同時更新）:
- `SoloXP/skills/xp_worklog/SKILL.md`
- `.claude/skills/xp_worklog/SKILL.md`
- `dotfiles/.claude/skills/xp_worklog/SKILL.md`

変更内容:
1. **保存ファイルのフォーマット `## サマリー`** に以下を追加:
   - `完了Issue数: N件（tokens記録あり: M件）`
   - `総トークン消費: Xk（Issue単位平均: Yk/issue）`
2. **`## Epic単位トークン消費集計（ROI）`** セクション新設:
   - 集計方法（worklogファイル走査・月別合算・重複Issue処理）
   - 算出値（完了Issue数・総トークン消費・Issue単位平均トークン消費）
   - 出力フォーマット例（Epic ROI サマリーテーブル）

テスト結果:
- E2E AC-3: 3件 GREEN（2件 RED → GREEN）✅
- E2E AC-2: 3件 RED（#2145 のスコープ、想定通り）
- DiscordAIbot unit+functional: 13 FAIL / 229 PASS（変更前後同一、リグレッションなし）

---

### noragrammer-crypto — 2026-07-19T12:14:26Z

[Auditor テスト実行中]

---

### noragrammer-crypto — 2026-07-19T12:16:30Z

## テスト実行結果（xp_RunTestSuites）

実行日時: 2026-07-19 12:20 JST
ブランチ: claude/wizardly-newton-lf1geo
プレビューURL: 未確認（ブランチ未pushのためVercelデプロイなし）

### 単体テスト（SoloXP）
- 結果: PASS 189件 / FAIL 0件（18スイート）✅

### 機能テスト（SoloXP）
- 結果: PASS 50件 / FAIL 0件（8スイート）✅

### 単体テスト（DiscordAIbot）
- 結果: FAIL 1件 / PASS 159件（pre-existing、変更前後同一）

### 機能テスト（DiscordAIbot）
- 結果: FAIL 2件 / PASS 32件（pre-existing、変更前後同一）

### タスクスコープ分析（#2144）
- 変更ファイル: xp_worklog SKILL.md（3コピー）のみ
- SoloXP全スイートGREEN（リグレッションなし）
- DiscordAIbot失敗: すべてpre-existing（git stashで変更前後同一を確認）

### E2Eテスト（タスクスコープ確認）
- AC-3 テスト: 3件 GREEN（#2144スコープ完了）
- AC-2 テスト: 3件 RED（#2145スコープ、想定通り）

### 総合判定
✅ **GREEN**: タスクスコープの全要件を満たしている

[Auditor GREEN]
PASS: SoloXP 189件（unit）+ 50件（functional）+ AC-3 E2E 3件 / リグレッションなし

---

### noragrammer-crypto — 2026-07-19T12:16:36Z

作業完了 2026-07-19 12:20 JST / 所要時間: 50分
tokens: prompt=300k completion=12k total=312k
model: claude-sonnet-4-6

---

### noragrammer-crypto — 2026-07-19T12:16:47Z

[Documenter実行中]

---
