# issue-2640-claude-skills-sync-strategy ユニットテスト

## テスト対象

`.claude/hooks/pre-push.sh`（`.claude/skills/` 向け同期処理の静的検証）

`.claude/skills/`（プロジェクトローカル、Codex参照用）を正本（`SoloXP/skills/xp_*` +
`workflow/skills/*`）への相対symlinkとして同期する処理が追加されていること、
Termux等symlink不安定環境向けのコピー同期フォールバックとテスト用オーバーライドが
存在すること、既存の `dotfiles/.claude/skills/` 同期（#2639）が残っていることを
検証する（Issue #2640）。

## テストファイル

`SoloXP/tests/unit/issue-2640-claude-skills-sync-strategy.unit.test.js`

## テストケース一覧

| テストケース | 種別 | 内容 |
|---|---|---|
| 命題1: `.claude/skills/` 向けの同期処理が追加されている | 正常系 | `CLAUDE_SKILLS` 変数が定義・参照されていること |
| 命題2: Termux等symlink不安定環境を検出する仕組みがある | 正常系 | `termux` を含む検出処理が存在すること |
| 命題3: symlink安定環境向けに `ln -s` によるsymlink作成処理がある | 正常系 | `ln -s` コマンドが存在すること |
| 命題4: Termux向け分岐ではコピーで `.claude/skills/` に同期する | 正常系 | `CLAUDE_SKILLS` に対する `cp -r` が存在すること（symlink一本化していないこと） |
| 命題5: テストから環境判定を上書きできるオーバーライドがある | 正常系 | `PRE_PUSH_FORCE_TERMUX` が参照されていること |
| 命題6: `dotfiles/.claude/skills/` への同期（#2639）が残っている | 正常系（回帰防止） | `DOTFILES_SKILLS`・`SoloXP/skills`・`workflow/skills` の記載が残っていること |

## カバレッジサマリー

- pre-push.sh の `.claude/skills/` 同期方式の静的検証: 6件
- 合計: 6件
