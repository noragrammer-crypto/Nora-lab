# Unit Test: issue-2060 review-workflow-deviation-issue-identification

対象ファイル: `SoloXP/tests/unit/issue-2060-review-workflow-deviation-issue-identification.unit.test.js`
検証対象: `dotfiles/.claude/skills/xp_review_workflow/SKILL.md`, `SoloXP/skills/xp_review_workflow/SKILL.md`

## 背景

`SoloXP/tests/e2e/issue-254-workflow-update.test.js`（#254）は、xp_review_workflow SKILL.md に
「逸脱したイシューを特定するロジック」が含まれることを `/逸脱.*Issue|逸脱.*イシュー|逸脱.*特定|deviation.*issue/i`
というパターンで期待している。しかし現行の SKILL.md には「逸脱」の語自体は「逸脱ログ」（ワークフロー期待達成条件節）
としてのみ存在し、「イシュー/特定」と組み合わさった表現がないため、このパターンにマッチせずテストが失敗している
（#254 リグレッション、#2060）。

## テストケース

`dotfiles/` と `SoloXP/` の両コピーそれぞれについて（`describe.each`）:

1. 「逸脱したイシューを特定する」ロジックに相当する文言（`/逸脱.*Issue|逸脱.*イシュー|逸脱.*特定|deviation.*issue/i`）が含まれる

E2Eテスト（`issue-254-workflow-update.test.js`）の該当アサーションと同一の正規表現を用いており、
E2Eテストとの整合を保っている。

## 実行結果（バグ再現時点、#2797）

FAIL 2件 / PASS 0件（想定通りRED＝バグ再現）

## 実行結果（修正後、#2798）

修正タスク #2798 で `dotfiles/`・`SoloXP/` 両コピーの SKILL.md に
「この工程は、あるべきワークフローから逸脱したイシューを特定するステップでもある。」を追記した結果、
PASS 2件 / FAIL 0件（GREEN）。既存149件（`SoloXP/`単体テスト）も回帰なし。
