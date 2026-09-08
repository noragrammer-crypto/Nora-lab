# Unit Test: issue-1831 substory-progress-spec-update-marker

対象ファイル: `SoloXP/tests/unit/issue-1831-substory-progress-spec-update-marker.unit.test.js`
検証対象: `dotfiles/.claude/skills/xp_Director/SKILL.md`, `SoloXP/skills/xp_Director/SKILL.md`

## 背景

xp_Director の「2-0. 分解済みゲート」手順2（サブイシューの進捗把握ステップ）は、各サブイシューの完了を
`[Auditor GREEN]` の有無のみで判定していた。一方 `spec_update` タスク（タイトルに「機能仕様書更新」または
本文に `task_type: spec_update`）は `xp_issue2md` → `xp_doc_spec` → `xp_Auditor doc` のみを通過し、完了マーカーとして
`[Auditor doc OK]` を出力する（`[Auditor GREEN]` は構造的に出力されない）。

そのため、実装タスクが全て `[Auditor GREEN]` でありspec_updateタスクも `[Auditor doc OK]` 済みのStoryであっても、
この進捗把握ステップは spec_update タスクを「未完了」と誤判定し、「残り: #<spec_update番号>」として
`/xp_Director` が停止し続け、手順3-eのAllGREENフロー（親PR発行）へ進めなくなる不具合があった（Codex自動レビュー
指摘 #1831）。

同種の不整合はAllGREEN前提条件チェック側（手順3-e、#1642で修正済み）には存在しなかったが、その手前にある
進捗把握ステップ（手順2）では見落とされていた。

## テストケース

`dotfiles/` と `SoloXP/` の両コピーそれぞれについて（`describe.each`）:

1. 進捗把握ステップが spec_update タスクを `[Auditor doc OK]` の有無で判定する旨を明記している
2. 進捗把握ステップの当該行が `[Auditor GREEN]` のみで判定する旧文言に戻っていない（回帰防止）

## 実行結果（修正後）

`cd SoloXP && npx jest tests/unit/issue-1831-substory-progress-spec-update-marker.unit.test.js --no-coverage`
— 4 tests PASS
