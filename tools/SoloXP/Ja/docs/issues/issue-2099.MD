---
issue: 2099
title: "[Task] フォールバック手順の定義と E2E テスト更新"
state: open
labels: [task, epic/SoloXP]
author: noragrammer-crypto
created_at: 2026-07-15T12:11:51Z
epic: SoloXP
---

# #2099 [Task] フォールバック手順の定義と E2E テスト更新

## 本文

## 概要
xp_Architect step 3 で feature-dev（または同等手段）が呼べない場合の
フォールバック手順を SKILL.md に定義する。
あわせて既存 E2E テストが壊れていないことを確認し、
受け入れ条件に合わせて E2E テストを更新する。

### 実装内容
1. フォールバック手順の定義（SKILL.md への追記）:
   - feature-dev コマンドが未対応・エラーの場合: 手動コードトレース（現行フロー）に切り替える
   - フォールバック発動条件・確認方法を明記する
2. 既存 E2E テストスイートの確認と更新:
   - `SoloXP/tests/e2e/` 配下の既存テストが通ることを確認する
   - 受け入れ条件 4「既存の xp フロー（subissue 発行・GitHub 連携部分）が壊れていない」を検証するテストを更新・追加する

## 見積もり
1pt — フォールバック定義・E2E 更新

## 依存関係
このタスクは #2098 の完了後に着手すること。
（#2098 に [Auditor GREEN] コメントが記録されてから着手する）

depends_on: #2098

## 親ストーリー
#1381

## 親ブランチ
feature/issue-1381

## コメント

### noragrammer-crypto — 2026-07-16T20:26:53Z

## 観測可能変更チェック（[Task]スキップ判定）

対象: #2099
観測可能な振る舞いの変更: なし
理由: xp_Architect の SKILL.md（内部オーケストレーション定義）へのフォールバック手順追記と、既存 E2E テストスイート（`SoloXP/tests/e2e/issue-1381-xp-architect-feature-dev.test.js`）へのテストケース追加のみ。ユーザー/外部から観測可能なAPI・UI・出力内容の変化を伴わない。Architect分解は不要と判断し、実行フローへ進む。

---

### noragrammer-crypto — 2026-07-16T20:26:58Z

作業開始 2026-07-17 05:25 JST
セッションURL: https://claude.ai/code/session_014TCTUEnNExTeGFrdHShUQr
[ProjectStatus: InProgress]

depends_on #2098: [Auditor GREEN] 済み・対応PR #2119 が feature/issue-1381 にマージ済みであることを確認。着手します。

---

### noragrammer-crypto — 2026-07-16T20:27:05Z

[Tester実行中]

## テスト方針

既存 E2E テストスイート（`SoloXP/tests/e2e/issue-1381-xp-architect-feature-dev.test.js`、#2097 で作成、11件）に対し、受け入れ条件3（フォールバック手順）の検証を強化する3件を追加する：

- AC3: フォールバック「発動条件」（タイムアウト・利用不可・空応答等）の具体的な明記を検証
- AC3: フォールバック「確認手順」（手動トレースのステップ・コメント記録フォーマット）の明記を検証
- AC4: フォールバック追記後も既存の処理フロー節（0・1・2・4〜7）が欠落していないことを検証（回帰確認）

実装前に上記3件が RED であることを確認した。

---

### noragrammer-crypto — 2026-07-16T20:27:18Z

[Implementer実行中]
[Implementer完了]

## 実装完了

変更ファイル:
- `dotfiles/.claude/skills/xp_Architect/SKILL.md`: step 3 の「`code-architect` が呼べない場合のフォールバック」節に、**発動条件**（Agent tool呼び出し自体のエラー・タイムアウト／`code-architect` が見つからない・利用不可／出力が空応答でフォーマット崩壊）と、**確認手順**（1. エラー内容の記録 → 2. 手動コードトレースへの切替（spec/コード/既存テストのRead） → 3. `フォールバック発動: あり` を既存の競合チェックコメントフォーマットに追記 → 4. 手動トレース結果をPatterns & Conventions Found相当として記載）を明記した。
- `.claude/skills/xp_Architect/SKILL.md`: 上記と同一内容を反映（CLAUDE.md のスキル3コピー同期ルールに従い手動同期。`SoloXP/skills/` はpre-pushフックで自動追従）。
- `SoloXP/tests/e2e/issue-1381-xp-architect-feature-dev.test.js`: AC3の発動条件・確認手順を検証する2件、AC4の回帰確認（既存処理フロー節の維持）を検証する1件、計3件のテストケースを追加（11件→14件）。

テスト結果:
- `cd SoloXP && npx jest tests/e2e/issue-1381-xp-architect-feature-dev.test.js`: **PASS 14/14**（追加3件はRED→GREEN、既存11件も引き続きPASS）
- `cd SoloXP && npx jest tests/e2e/`: 18 suites中 16 PASS / 2 FAIL。FAIL 2件（`issue-1410-worklog-markers.test.js`、`issue-254-workflow-update.test.js`）は本タスクの変更と無関係（`git stash` で本タスクの差分を除いた `origin/feature/issue-1381` 上でも同一条件で再現することを確認済み。xp_Architect ではなく xp_Director / xp_review_workflow 関連の既存不具合）。

---

### noragrammer-crypto — 2026-07-16T20:27:38Z

[Auditor テスト実行中]

## 独立検証

`git diff --stat` で変更範囲を確認:
```
 .claude/skills/xp_Architect/SKILL.md                | 21 +++++++++++++++++++--
 SoloXP/docs/tests/E2ETests/issue-1381-xp-architect-feature-dev.md | 16 ++++++++++------
 SoloXP/tests/e2e/issue-1381-xp-architect-feature-dev.test.js | 20 ++++++++++++++++++++
 dotfiles/.claude/skills/xp_Architect/SKILL.md       | 21 +++++++++++++++++++--
```

- `.claude/skills/xp_Architect/SKILL.md` と `dotfiles/.claude/skills/xp_Architect/SKILL.md` の内容が完全一致（`diff` で無出力を確認）→ CLAUDE.md の3コピー同期ルール（手動同期対象2ファイル）を満たしている。
- `cd SoloXP && npx jest tests/e2e/issue-1381-xp-architect-feature-dev.test.js` を再実行し独立に **PASS 14/14** を確認。
- 受け入れ条件3（発動条件・確認手順）: SKILL.md に発動条件3点（Agent toolエラー/タイムアウト・code-architect見つからない/利用不可・空応答）と確認手順4ステップ（記録→手動トレース切替→コメント記録フォーマット→結果記載）が明記されていることを確認。
- 受け入れ条件4（既存フロー無破壊）: `git diff` で手順0・1・1-1・2・4-7・設計思想・注意事項に変更がないことを確認（新規テストで機械的にも検証）。
- 依存タスク #2098 のスコープ外だった「詳細な発動条件・確認手順」を本タスクが充足していることを確認。

## テスト対象コード

ドキュメント（SKILL.md）＋テストファイル自体の変更のため、xp_RunTestSuites（unit/functional）は非該当。E2Eスイート全体（18 suites）を実行し、既存不具合2件（#1410, #254関連、無関係）以外はすべてPASSであることを確認済み（Implementerコメント参照）。

[Auditor GREEN]
対象: #2099 — フォールバック発動条件・確認手順の定義およびE2Eテスト更新を独立検証。

---

### noragrammer-crypto — 2026-07-16T20:27:41Z

作業完了 2026-07-17 05:32 JST / 所要時間: 7分

---
