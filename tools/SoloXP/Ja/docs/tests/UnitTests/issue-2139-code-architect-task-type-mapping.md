# Unit Test: issue-2139 code-architect-task-type-mapping

対象ファイル: `SoloXP/tests/unit/issue-2139-code-architect-task-type-mapping.unit.test.js`
検証対象: `dotfiles/.claude/skills/xp_Architect/SKILL.md`, `SoloXP/skills/xp_Architect/SKILL.md`

## 背景

`#2100`（機能仕様書更新タスク）は `SoloXP/docs/spec/xp_architect.md` の更新にあたり
「出力変換ルール（depends_on / task_type マッピング）を明記する」ことを明示的に要求していたが、
実際に追加された `code-architect 出力 → xp 実行計画へのマッピング` 表は `depends_on` への
変換ルールのみを定義し、`task_type` については一切触れていなかった。

`xp_Director` はサブイシューの `task_type:` フィールドの有無・値によって処理を振り分けるため
（`e2e_test_creation` / `spec_update` / `bug_reproduction_test` / 通常実装タスク）、この欠落は
「code-architect が生成したサブイシューにどう `task_type` を付与すべきか」が仕様上ドキュメント化
されていない、という曖昧さを残していた（Codex自動レビュー指摘 #2139）。

実際の設計を確認したところ、code-architect の Build Sequence から生成されるサブイシューは
常に `task_type` フィールドなしの「通常実装タスク」として発行され（手順5の通常フォーマット）、
`task_type: e2e_test_creation` / `spec_update` は Story イシュー・観測可能な振る舞い変更を伴う
Task イシューであれば code-architect の出力内容に関わらず、手順5「必須追加タスク」として
別途固定フォーマットで発行される設計になっていた。この設計自体は正しく機能していたが、
マッピング表からは読み取れず明記が必要だった。

## テストケース

`dotfiles/` と `SoloXP/` の両コピーそれぞれについて（`describe.each`）:

1. マッピング表に `task_type` の扱いについての説明行がある
2. code-architect出力から直接task_typeを導出しない旨が明記されている
3. e2e_test_creation/spec_update はcode-architectの出力に関わらず別途固定発行される旨が明記されている

## 実行結果（修正後）

`cd SoloXP && npx jest tests/unit/issue-2139-code-architect-task-type-mapping.unit.test.js --no-coverage`
— 6 tests PASS
