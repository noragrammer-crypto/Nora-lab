# Issue #2797: [Task] バグ再現テスト追加

- URL: https://github.com/noragrammer-crypto/HolyAutomater/issues/2797
- 親ストーリー: #2060
- 親ブランチ: feature/issue-2060

## 本文

## 概要
報告されたバグ #2060 を再現するテストケースを追加する。
テストファーストでバグの存在を証明し、修正タスクの受け入れ基準を定める。

対象ファイル: `SoloXP/skills/xp_review_workflow/SKILL.md`（および同期コピー `dotfiles/.claude/skills/xp_review_workflow/SKILL.md`）

現行の SKILL.md には「乖離したログ」（3節見出し）という表現はあるが、「逸脱」の語自体は
「ワークフロー期待達成条件」節の「逸脱ログ」としてのみ存在し、`SoloXP/tests/e2e/issue-254-workflow-update.test.js`
が期待する `/逸脱.*Issue|逸脱.*イシュー|逸脱.*特定|deviation.*issue/i` パターンに
**マッチしない**ことをJestユニットテストで検証する（`SoloXP/tests/unit/issue-2059-allgreen-heading-worklog-marker.unit.test.js`
と同様、`dotfiles/` と `SoloXP/` の両コピーを `describe.each` で検証する形式に倣う）。

新規ファイル: `SoloXP/tests/unit/issue-2060-review-workflow-deviation-issue-identification.unit.test.js`

想定するテスト内容（例）:
- `dotfiles/.claude/skills/xp_review_workflow/SKILL.md` と `SoloXP/skills/xp_review_workflow/SKILL.md` の両方について、
  ファイル内容が `/逸脱.*(Issue|イシュー|特定)|deviation.*issue/i` にマッチすることを検証する（修正前は含まれないため RED になる）

## 見積もり
1pt — 再現テストの設計・作成

## 依存関係
なし（即着手可能・修正タスクより先に実施すること）

## 親ストーリー
#2060

## 親ブランチ
feature/issue-2060

## 備考
task_type: bug_reproduction_test
xp_Director はこのタスクを xp_UnitTest + xp_FunctionalTest で処理すること。

## コメント履歴

### コメント1（2026-08-09 11:11 JST）観測可能変更チェック（[Task]スキップ判定）

## 観測可能変更チェック（[Task]スキップ判定）

対象: #2797
観測可能な振る舞いの変更: なし
理由: 本タスクはバグ再現用のJestユニットテストファイル（`SoloXP/tests/unit/issue-2060-review-workflow-deviation-issue-identification.unit.test.js`）を新規追加するのみで、API・UI・出力内容などユーザー/外部から観測可能な振る舞いの変更を伴わない。Architect をバイパスして実行フローへ進む。

---

### コメント2（2026-08-09 11:11 JST）作業開始

作業開始 2026-08-09 11:10 JST
セッションURL: https://claude.ai/code/session_011ictpFLYs5Necr7xK3G7Er
[ProjectStatus: InProgress]

---

### コメント3（2026-08-09 11:12 JST）テスト命題・実行結果（Tester）

## テスト命題（Unit）

- [x] `dotfiles/.claude/skills/xp_review_workflow/SKILL.md` に「逸脱したイシューを特定する」ロジックに相当する文言（`/逸脱.*Issue|逸脱.*イシュー|逸脱.*特定|deviation.*issue/i`）が含まれる（否定→現状は含まれずFAIL、バグ再現）
- [x] `SoloXP/skills/xp_review_workflow/SKILL.md` に同上の文言が含まれる（否定→現状は含まれずFAIL、バグ再現）

### Unit Test
テストファイル: `SoloXP/tests/unit/issue-2060-review-workflow-deviation-issue-identification.unit.test.js`
結果: PASS 149件 / FAIL 2件（新規追加テストのみ、両ファイルコピー分。バグの存在証明として想定通りRED）

既存17スイート・149件は全てPASS（回帰なし）。

### Functional Test
結果: PASS 50件 / FAIL 0件（本タスクの対象コードなし。既存スイート実行のみ）

### E2E Test
スキップ: `bug_reproduction_test` タスクのため対象外（`tests/e2e/issue-254-workflow-update.test.js` が本バグの受け入れテストとして既存）

バグ再現テスト完了: テストがREDであることを確認。修正タスク（#2798）の受け入れ基準を定義済み。Implementerへの引き継ぎは不要。

---

### コメント4（2026-08-09 11:13 JST）Auditor テスト結果

[Auditor テスト実行中]

## /xp_RunTestSuites 結果（独立検証）

実行日時: 2026-08-09 02:12 UTC（2026-08-09 11:12 JST）
ブランチ: claude/issue-processing-l9bn1d（`feature/issue-2060` と同一tip）

### 単体テスト
- 結果: FAIL 2件 / PASS 149件
- 新規追加テスト `issue-2060-review-workflow-deviation-issue-identification.unit.test.js`（dotfiles/soloxp 各1件）がFAIL
- 本タスク（`bug_reproduction_test`）の受け入れ基準は「テストがREDであること＝バグの存在証明」であり、この2件のFAILは想定通り・意図した結果
- 既存17スイート・149件は全PASS（回帰なし）

### 機能テスト
- 結果: PASS 50件 / FAIL 0件（回帰なし）

### 総合判定
バグ再現テストとして正しく機能している（RED=バグ再現成功）。実装差し戻し不要（本タスクはテスト作成のみ、Implementer不要）。

[Auditor GREEN]
PASS: 既存149件（回帰なし） / 新規再現テスト2件は意図通りFAIL（RED＝バグ再現証明） / テストコマンド: `npm run test:unit`, `npm run test:functional`（`SoloXP/` ディレクトリ）

---

### コメント5（2026-08-09 11:15 JST）[Documenter実行中]〜[Documenter完了]

[Documenter実行中]

## ドキュメント生成完了

生成・更新したファイル:
- `SoloXP/docs/issues/issue-2797.MD`: issue2md スナップショット（新規）
- `SoloXP/docs/tests/UnitTests/issue-2060-review-workflow-deviation-issue-identification.md`: 新規再現テストのドキュメント（新規）

対象外（変更なし）:
- `xp_doc_spec`: 本タスクは `SoloXP/skills/xp_review_workflow/SKILL.md` の実際の文言修正を伴わず、バグ再現テストの追加のみ。仕様変更は修正タスク #2798 で発生するため、本タスクでの spec 更新は対象外
- `xp_doc_reference`: `SoloXP/scripts/` 配下のコード変更なし、対象外
- `xp_doc_FunctionTests` / `xp_doc_E2ETests`: 本タスクは機能テスト・E2Eテストの新規作成・変更を伴わない

[Documenter完了]
