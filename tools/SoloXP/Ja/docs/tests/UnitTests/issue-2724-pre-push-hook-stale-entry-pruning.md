# issue-2724-pre-push-hook-stale-entry-pruning ユニットテスト

## テスト対象

`.claude/hooks/pre-push.sh`（内容の静的検証）

正本から削除・リネームされたスキルが `dotfiles/.claude/skills/`・`.claude/skills/` 側に
残留し続ける問題（バグ2）の修正実装、新規スキルディレクトリが未コミットのまま残る問題
（バグ1、#2640で解消済み）の回帰防止、および `.claude/skills/` に同居するプロジェクト固有
スキル（正本を持たない実体ディレクトリ）を誤って削除しないためのsymlink限定プルーニング
（Codexレビュー指摘の修正）を静的に検証する（Issue #2724）。

## テストファイル

`SoloXP/tests/unit/issue-2724-pre-push-hook-stale-entry-pruning.unit.test.js`

## テストケース一覧

| テストケース | 種別 | 内容 |
|---|---|---|
| 命題1: `.claude/hooks/pre-push.sh` が存在する | 正常系 | フックファイル自体の存在確認 |
| 命題2: dotfiles用の名前ベースプルーニング関数（`prune_stale_copies`）が定義されている | 正常系 | 関数定義の存在確認 |
| 命題3: `dotfiles/.claude/skills/` に対して `prune_stale_copies` が呼ばれている | 正常系 | 呼び出しの存在確認 |
| 命題4: `.claude/skills/` 用のsymlink限定プルーニング関数（`prune_stale_canonical_symlinks`）が定義されている | 正常系 | 関数定義の存在確認 |
| 命題5: `.claude/skills/` に対して `prune_stale_canonical_symlinks` が呼ばれている | 正常系 | 呼び出しの存在確認 |
| 命題6: コミット要否判定が `git diff --cached` ベースになっている（untrackedも検知） | 正常系・異常系（回帰防止） | `--cached` 判定の存在、旧実装（working tree比較）が残っていないこと |
| 命題7: コミット対象への add が `-A` 付き（削除も検知）になっている | 正常系 | `git add -A "${add_targets[@]}"` の存在確認 |
| 命題8: `.claude/skills/` のプルーニングはsymlinkかどうかで判定し、プロジェクト固有スキル（実体ディレクトリ）を誤って削除しない | 正常系（Codexレビュー指摘の回帰防止） | `[ -L "$link" ] \|\| continue` 相当のsymlink判定の存在確認 |

## カバレッジサマリー

- pre-push.sh 削除ドリフト検知・未コミット残留防止・対象外スキル保護の静的検証: 8件
- 合計: 8件
