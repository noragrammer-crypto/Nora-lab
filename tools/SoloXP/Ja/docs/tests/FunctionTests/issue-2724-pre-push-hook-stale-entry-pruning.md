# issue-2724-pre-push-hook-stale-entry-pruning 機能テスト

## テスト対象

`.claude/hooks/pre-push.sh`（実行時の実際の同期挙動）

一時gitリポジトリ上に、正本にのみ存在する新規スキル（`brand-new-skill`）・
`dotfiles/.claude/skills/` 側にのみ存在する削除済みスキルの残骸（`stale_skill`）・
`.claude/skills/`（symlinkモード）側にのみ存在する削除済みスキルへの壊れたsymlink
（`xp_Removed`）・`.claude/skills/` に実体ディレクトリとして同居する正本を持たない
プロジェクト固有スキル（`project-only-skill`、`wiki_ingest` 等相当）・
`.claude/skills/` に正本外を指すsymlink形態で同居するプロジェクト固有スキル
（`project-only-symlink`）を含むフィクスチャを作り、実際にフックを実行して

1. 新規スキルがコピーされた上でコミットされること（バグ1の回帰確認）
2. 削除済みスキルの残骸が削除・コミットされること（バグ2の修正確認、実体コピー側）
3. 削除済みスキルへの壊れたsymlinkが削除・コミットされること（バグ2の修正確認、symlink側）
4. 既存の正本スキルは影響を受けないこと
5. **正本を持たないプロジェクト固有スキル（実体ディレクトリ）は削除もsymlink化もされず
   一切変更されないこと**（Codexレビュー指摘の回帰確認）
6. **正本外を指すプロジェクト固有symlinkも削除・書き換えされず、symlinkのまま参照先の
   内容にアクセスできること**（Codexフォローアップレビュー指摘の回帰確認）
7. 冪等性（差分がなければ再実行しても何もコミットしない）
8. Termux実体コピーモードでは `.claude/skills/` のプルーニングを行わない一方、
   `dotfiles/.claude/skills/` 側の削除ドリフト検知は変わらず機能すること（既知の制約の確認）

を検証する（Issue #2724）。

## テストファイル

`SoloXP/tests/functional/issue-2724-pre-push-hook-stale-entry-pruning.functional.test.js`

## テストケース一覧

### symlinkモード（通常環境、`describe('issue-2724: pre-push.sh が新規スキルをコミットし、削除済みスキルの残骸をプルーニングする')`）

| テストケース | 種別 | 内容 |
|---|---|---|
| バグ1回帰確認: brand-new-skill が dotfiles/.claude/skills/ にコピーされる | 正常系 | 正本にのみ存在した新規スキルのコピー確認 |
| バグ1回帰確認: brand-new-skill のコピーが untracked のまま放置されずコミットされる | 正常系（回帰防止） | working treeがクリーンかつコミットにファイルが含まれること |
| バグ2修正確認: stale_skill が dotfiles/.claude/skills/ から削除される | 正常系 | 正本に対応しないディレクトリの削除確認 |
| バグ2修正確認: stale_skill の削除がコミットされる | 正常系 | working treeがクリーンかつコミットに削除が含まれること |
| バグ2修正確認: xp_Removed への symlink が .claude/skills/ から削除される | 正常系 | 正本に対応しない壊れたsymlinkの削除確認（`fs.lstatSync` で残骸なしを確認） |
| 既存の正本スキル（xp_Sample・sample-non-xp）は影響を受けず残る | 正常系 | プルーニングが正本に対応するエントリを誤って削除しないこと |
| Codexレビュー指摘の回帰確認: project-only-skill は削除されない | 正常系（回帰防止） | 実体ディレクトリのまま・内容も変化しないことを確認 |
| Codexフォローアップレビュー指摘の回帰確認: 正本外を指すプロジェクト固有symlinkは保持される | 正常系（回帰防止） | symlinkのまま・参照先パス不変・内容にアクセス可能なことを確認 |
| 冪等性: 再実行しても差分がなければ何もコミットしない | 正常系 | 差分がない状態での再実行でHEADが変化しないこと |

### Termux実体コピーモード（`describe('issue-2724: Termux実体コピーモードでは .claude/skills/ のプルーニングを行わない（既知の制約）')`）

| テストケース | 種別 | 内容 |
|---|---|---|
| dotfiles/.claude/skills/ 側の削除ドリフト検知は Termux でも変わらず機能する | 正常系 | `PRE_PUSH_FORCE_TERMUX=1` でも dotfiles 側の stale_skill が削除されること |
| project-only-skill は実体コピーモードでも削除されない | 正常系（既知の制約の確認） | `.claude/skills/` 側のプルーニングを行わない設計により温存されること |

## セットアップ

`beforeAll` で一時ディレクトリに `git init` した上で、正本側
（`SoloXP/skills/xp_Sample`, `workflow/skills/sample-non-xp`, `workflow/skills/brand-new-skill`）と
バイナリ側（`dotfiles/.claude/skills/xp_Sample`, `dotfiles/.claude/skills/sample-non-xp`,
`dotfiles/.claude/skills/stale_skill`（正本には存在しない残骸）、`.claude/skills/xp_Sample`,
`.claude/skills/sample-non-xp`, `.claude/skills/xp_Removed`（正本には存在しないsymlink残骸）,
`.claude/skills/project-only-skill`（正本を持たない実体ディレクトリ、wiki_ingest等相当）、
`.claude/skills/project-only-symlink`（正本外の `vendor/external-skill-source` を指すsymlink形態の
プロジェクト固有スキル）を作成し、`.claude/hooks/pre-push.sh` の実体をコピーして1回実行する。
`afterAll` でサンドボックスを削除する。Termuxモードのテストは同じフィクスチャ生成関数を使い、
`PRE_PUSH_FORCE_TERMUX=1` を付けてフックを実行する独立した `describe` ブロックとして構成する。

## カバレッジサマリー

- pre-push.sh 実行時の新規スキル同期・削除ドリフト検知・対象外スキル保護の挙動検証: 11件
- 合計: 11件
