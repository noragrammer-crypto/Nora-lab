# Unit Test: issue-2180 worklog-partial-token-aggregation

対象ファイル: `SoloXP/tests/unit/issue-2180-worklog-partial-token-aggregation.unit.test.js`
検証対象: `dotfiles/.claude/skills/xp_worklog/SKILL.md`, `SoloXP/skills/xp_worklog/SKILL.md`

## 背景

`xp_worklog` のトークン消費集計ルールは以下の2条が並記されていた：

1. 複数セッションにまたがるイシューはトークン消費を**合算**する
2. `tokens:` 行が存在しないセッション・イシューは「記録なし」として表示する

イシューが複数セッションにまたがり、一部のセッションのみ `tokens:` 記録がある「混在イシュー」の場合、
条2をセッション単位で適用すると「記録のないセッションがある＝記録なし」と誤読でき、条1の合算ルールと
矛盾する。この曖昧さにより、記録済みの他セッションのトークン消費データまで丸ごと「記録なし」として
捨てられてしまう可能性があった（Codex自動レビュー指摘 #2180）。

正しい仕様は「記録なし」をイシュー全体で1件も `tokens:` 記録が無い場合のみに限定し、
一部セッションのみ記録がある混在イシューは記録済みセッション分を合算し、未記録セッションが
あることを付記する、というもの。

## テストケース

`dotfiles/` と `SoloXP/` の両コピーそれぞれについて（`describe.each`）:

1. 「記録なし」はイシュー内の全セッションで記録が無い場合のみと明記されている
2. 一部セッションのみ記録がある混在イシューは記録済み分を合算する旨が明記されている
3. 未記録セッションがあることを理由に記録済み分まで捨てない旨が明記されている（回帰防止）
4. 旧来の曖昧な並記（セッション・イシューを同列に「記録なし」とする文言）が残っていない（回帰防止）

## 実行結果（修正後）

`cd SoloXP && npx jest tests/unit/issue-2180-worklog-partial-token-aggregation.unit.test.js --no-coverage`
— 8 tests PASS
