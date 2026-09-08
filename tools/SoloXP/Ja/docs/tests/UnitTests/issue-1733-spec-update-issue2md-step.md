# issue-1733-spec-update-issue2md-step ユニットテスト

## テスト対象

`SoloXP/skills/xp_Director/SKILL.md`（および複製の `dotfiles/.claude/skills/xp_Director/SKILL.md`）

xp_Director の spec_update タスクフローに `xp_issue2md <task_issue>` の呼び出しステップが
存在し、正しい引数・順序で呼ばれることを検証する（Issue #1733）。

修正前は `xp_doc_spec` → `xp_Auditor doc` のみで、spec_update タスク実行後に
`<EpicName>/docs/issues/issue-<task_issue番号>.MD` が生成されず、`xp_Auditor doc` の
issue2mdログチェックで「欠落（NG）」として検出される欠落があった。

## テストファイル

`SoloXP/tests/unit/issue-1733-spec-update-issue2md-step.unit.test.js`

## テストケース一覧

### `xp_Director SKILL.md（dotfiles / soloxp）の spec_update フロー`

`describe.each` で SoloXP・dotfiles 両方の複製に対して同一のアサーションを実行する。

| テストケース | 種別 | 内容 |
|---|---|---|
| `xp_doc_spec` による仕様書更新ステップが存在する | 回帰確認 | spec_update ブロックに `xp_doc_spec` の呼び出しが残っていること |
| issue2mdログ生成（`xp_issue2md`）の呼び出しステップが存在する | バグ再現・回帰防止 | spec_update ブロックに `xp_issue2md` の呼び出しが存在すること |
| `xp_issue2md` は task_issue を引数に取る（親ストーリー番号ではない） | バグ再現・回帰防止 | `xp_issue2md <task_issue>` の引数が `task_issue` であること（`xp_Auditor doc` のissue2mdログチェックが task_issue 起点でパスを導出するため、親ストーリー番号を渡すと再びNGになる） |
| issue2md 生成ステップは `xp_doc_spec` より先に呼ばれる | バグ再現・回帰防止 | `xp_issue2md` の出現位置が `xp_doc_spec` より前であること（`xp_Documenter` の正準順序 issue2md→doc_spec に倣う） |
| `xp_doc_spec` の後に `xp_Auditor doc` によるドキュメントチェックが存在する | 回帰確認 | `xp_Auditor doc` の出現位置が `xp_doc_spec` より後であること |

## 実装メモ

- 本Issue（#1733）の修正で `SoloXP/skills/xp_Director/SKILL.md` の
  `【spec_update タスクの場合】` ブロックに `ii. xp_issue2md <task_issue>` を新規追加し、
  以降のステップ番号（`xp_doc_spec` → iii、`xp_Auditor doc` → iv）を繰り下げた
- タスク種別テーブルの `spec_update` 行の説明文も `xp_issue2md <task_issue> → xp_doc_spec <epic> <親ストーリー番号>` に更新した
- `dotfiles/.claude/skills/xp_Director/SKILL.md` にも同一の変更を適用し、SoloXPとの複製一致を維持した（`issue-1705-e2e-test-creation-doc-step.unit.test.js` の複製一致テストで継続的に検証される）
- `e2e_test_creation` タスクフローにも同種の `xp_issue2md` 欠落が構造的に存在するが、本Issueのスコープ外として別途フラグした（1タスク1PRルールに従い分離）

## カバレッジサマリー

- SoloXP側 spec_update ブロック検証: 5件
- dotfiles側 spec_update ブロック検証: 5件
- 合計: 10件
