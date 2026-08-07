# issue-2640-claude-skills-sync-behavior 機能テスト

## テスト対象

`.claude/hooks/pre-push.sh`（`.claude/skills/` 向け同期処理の実行時挙動）

一時gitリポジトリ上に「正本（`SoloXP/skills/xp_Sample` 相当・`workflow/skills/sample-non-xp`
相当）」「`dotfiles/.claude/skills/`（既存の#2639同期対象、ドリフトを模擬）」
「`.claude/skills/`（移行前の実体コピーを模擬）」のフィクスチャを作り、実際にフックを実行して

- symlink安定環境（デフォルト）: `.claude/skills/<name>` が正本への相対symlinkになること
- Termux等symlink不安定環境（`PRE_PUSH_FORCE_TERMUX=1`）: `.claude/skills/<name>` が実体コピーとして同期されること
- いずれの場合も `dotfiles/.claude/skills/` への既存の同期（#2639）が壊れていないこと
- 変更のコミット・再実行時の冪等性

を検証する（Issue #2640）。

## テストファイル

`SoloXP/tests/functional/issue-2640-claude-skills-sync-behavior.functional.test.js`

## テストケース一覧

### symlink安定環境（デフォルト）

| テストケース | 種別 | 内容 |
|---|---|---|
| `.claude/skills/xp_Sample` が `SoloXP/skills/xp_Sample` への相対symlinkになる | 正常系 | symlinkの生成先パスが期待通りであること |
| `.claude/skills/sample-non-xp` が `workflow/skills/sample-non-xp` への相対symlinkになる | 正常系 | 非xp_系（workflow由来）も同様にsymlink化されること |
| symlink経由で読んだ内容が正本と一致する | 正常系 | 移行前の実体コピー内容が残っていないこと |
| `dotfiles/.claude/skills/xp_Sample` は既存通り実体コピーとして同期される | 正常系（回帰防止） | #2639の同期がregressionしていないこと |
| 変更がgitにコミットされ、再実行しても冪等である | 正常系 | working treeがクリーンになり、差分なしの再実行でHEADが変化しないこと |

### Termux等symlink不安定環境（`PRE_PUSH_FORCE_TERMUX=1`）

| テストケース | 種別 | 内容 |
|---|---|---|
| `.claude/skills/xp_Sample` はsymlinkではなく実体コピーとして同期される | 正常系 | Termuxではsymlink化にフォールバックしないこと |
| `.claude/skills/sample-non-xp` もsymlinkではなく実体コピーとして同期される | 正常系 | 同上（workflow由来） |
| `dotfiles/.claude/skills/` 側の同期は変わらず実体コピーのまま機能する | 正常系（回帰防止） | Termux分岐でも#2639の同期が機能すること |
| 変更がgitにコミットされ、再実行しても冪等である | 正常系 | Termux分岐でも冪等性が成立すること |

## セットアップ

`beforeAll` で一時ディレクトリに `git init` した上で、正本側（`SoloXP/skills/xp_Sample`,
`workflow/skills/sample-non-xp`）、`dotfiles/.claude/skills/`（ドリフトを模擬）、
`.claude/skills/`（移行前の実体コピーを模擬）を作成し、`.claude/hooks/pre-push.sh` の実体を
コピーして1回実行する。Termux分岐は環境変数 `PRE_PUSH_FORCE_TERMUX=1` を渡すことで、
実機のTermux判定（`/data/data/com.termux` の存在確認）に依存せずテストする。`afterAll` で
サンドボックスを削除する。

## カバレッジサマリー

- symlink安定環境での同期挙動: 5件
- Termux等symlink不安定環境での同期挙動: 4件
- 合計: 9件
