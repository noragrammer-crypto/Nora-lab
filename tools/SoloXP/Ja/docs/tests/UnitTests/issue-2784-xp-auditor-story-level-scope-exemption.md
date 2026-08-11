# issue-2784-xp-auditor-story-level-scope-exemption ユニットテスト

## テスト対象

`SoloXP/skills/xp_Auditor/SKILL.md`（内容の静的検証）

Story-level Auditor フェーズ（`### 3.`）とTask-level専用の別タスクスコープバグ免除ロジック節
（`### 6.`）の適用範囲が明示されていないため、Task-level専用の「現タスクのテスト結果には
影響しない」という判断基準がStory-levelにも誤って援用でき、REDの見逃しが恒久化する構造的欠陥
（Issue #2784）を、修正前の状態で再現するバグ再現テスト。SKILL.md本文の該当節にスコープ限定
文言（`Task-level専用`）が存在しないことをregexで検証する。

## テストファイル

`SoloXP/tests/unit/issue-2784-xp-auditor-story-level-scope-exemption.unit.test.js`

## テストケース一覧

| テストケース | 種別 | 内容 |
|---|---|---|
| Story-level Auditor フェーズ節（`### 3.`）に、Task-level専用の別スコープ免除ロジックが適用されない旨が明記されている | 正常系（回帰防止） | #2787 でスコープ限定文言（`Task-level専用` + `適用されない/援用できない/例外なく`）を追加しGREEN化済み |
| 別タスクスコープのバグ発見時節（`### 6.`）が、Task-level専用である旨を明示している | 正常系（回帰防止） | #2787 で節冒頭にTask-level専用であるスコープ限定注記を追加しGREEN化済み |

## カバレッジサマリー

- Story-level／Task-levelスコープ限定文言の静的検証: 2件
- 合計: 2件（#2786 でRED＝バグ再現として作成、#2787 の `SoloXP/skills/xp_Auditor/SKILL.md` 修正によりGREEN化。以降は回帰防止テストとして機能する）
