# issue-2639-pre-push-hook-sync-behavior 機能テスト

## テスト対象

`.claude/hooks/pre-push.sh`（実行時の実際の同期挙動）

一時gitリポジトリ上に「正本（`SoloXP/skills/xp_*` 相当・`workflow/skills/*` 相当）」と
「バイナリ（`dotfiles/.claude/skills/*` 相当、ドリフトさせた状態）」のフィクスチャを作り、
実際にフックを実行して正本→バイナリの向きで同期・ドリフト修正・コミット・冪等性が
成立することを検証する（Issue #2639）。

`SoloXP` は本タスクが初のfunctional層テストのため、`tests/functional/` ディレクトリを
新設した（`jest` の `testMatch` は既に `**/tests/functional/**/*.test.js` を含んでいたため
設定変更は不要）。

## テストファイル

`SoloXP/tests/functional/issue-2639-pre-push-hook-sync-behavior.functional.test.js`

## テストケース一覧

| テストケース | 種別 | 内容 |
|---|---|---|
| dotfiles/.claude/skills/xp_Sample が SoloXP/skills/xp_Sample（正本）の内容で上書きされる | 正常系 | 手動編集で生じたドリフトが正本の内容に修正される |
| dotfiles/.claude/skills/sample-non-xp が workflow/skills/sample-non-xp（正本）の内容で上書きされる | 正常系 | 非xp_系（workflow由来）も同様に同期対象になる |
| 正本側（SoloXP/workflow）は変更されない | 正常系 | コピー方向が正本→バイナリの一方向であること |
| 同期による差分がコミットされる（ドリフト修正がgit履歴に残る） | 正常系 | フック実行後にコミットが積まれ、working treeがクリーンになること |
| 再実行しても差分がなければ何もコミットしない（冪等性） | 正常系 | 差分がない状態での再実行でHEADが変化しないこと |

## セットアップ

`beforeAll` で一時ディレクトリに `git init` した上で、正本側（`SoloXP/skills/xp_Sample`,
`workflow/skills/sample-non-xp`）とバイナリ側（`dotfiles/.claude/skills/xp_Sample`,
`dotfiles/.claude/skills/sample-non-xp`、内容をあえて不一致にしてドリフトを模擬）を作成し、
`.claude/hooks/pre-push.sh` の実体をコピーして1回実行する。`afterAll` でサンドボックスを削除する。

## カバレッジサマリー

- pre-push.sh 実行時の同期挙動: 5件
- 合計: 5件
