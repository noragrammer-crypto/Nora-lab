# issue-2738-pre-push-hook-symlink-fallback 機能テスト

## テスト対象

`.claude/hooks/pre-push.sh`（実行時の実際の同期挙動）

一時gitリポジトリ上に正本スキル（`SoloXP/skills/xp_Sample`, `workflow/skills/sample-non-xp`）の
フィクスチャを作り、実際にフックを実行して

1. **非Termuxだが実際にsymlinkを作成できない環境**（PATHに常に失敗する fake `ln` を注入）でも、
   `.claude/skills/` 配下のスキルが消失せず、実体コピーとしてフォールバックすること（指摘1の修正確認）
2. **同期対象外に既にstaged変更（無関係なWIP変更）がある場合**、pre-pushフックが自動コミットを
   スキップし、同期内容・無関係な変更の両方がstagedのまま残ること（指摘2の修正確認）

を検証する（Issue #2738、実装タスク #2936）。

## テストファイル

`SoloXP/tests/functional/issue-2738-pre-push-hook-symlink-fallback.functional.test.js`

## テストケース一覧

### symlink不可環境（`describe('issue-2738: 非Termuxだがsymlink不可な環境では実体コピーへフォールバックする')`）

| テストケース | 種別 | 内容 |
|---|---|---|
| 回帰確認: ln -s が失敗する環境でも .claude/skills/xp_Sample が消失しない | 正常系（指摘1の修正確認） | fake `ln`（常に失敗）注入下でもスキルディレクトリが存在すること |
| 回帰確認: .claude/skills/xp_Sample は実体ディレクトリ（symlinkではない）として残る | 正常系 | `fs.lstatSync().isSymbolicLink()` が `false`、内容も正本と一致すること |
| 回帰確認: dotfiles/.claude/skills/ 側も正しく実体コピーされる | 正常系（既存仕様の非破壊確認） | dotfiles側は元々常に実体コピーであり、この修正で影響を受けないこと |
| 同期内容がコミットされ working tree がクリーンになる | 正常系 | symlink不可環境でも同期コミット自体は成立すること |

### staged変更保護（`describe('issue-2738: 同期対象外に既にstaged変更がある場合は自動コミットをスキップする')`）

| テストケース | 種別 | 内容 |
|---|---|---|
| 無関係なstaged変更がある場合、自動コミットが発生しない | 正常系（指摘2の修正確認） | フック実行前後でHEADが変化しないこと |
| 無関係な変更（unrelated-wip.txt）はstagedのまま残る | 正常系 | `git status --porcelain` で `A unrelated-wip.txt` を確認 |
| 同期内容（xp_Sample）もgit add済みのまま残る | 正常系（データ非喪失の確認） | 同期対象の変更が失われず引き続きstagedであること |
| 保護が発動した旨のメッセージが出力される | 正常系（ユーザーへの説明責任） | 標準出力に警告メッセージが含まれること |

## セットアップ

`makeSandbox()` で一時ディレクトリに `git init` した上で、正本（`SoloXP/skills/xp_Sample`,
`workflow/skills/sample-non-xp`）を作成し、`dotfiles/.claude/skills/`・`.claude/skills/` は空の
状態で `.claude/hooks/pre-push.sh` の実体をコピーして初期コミットする（新規同期が必ず発生する
フィクスチャ）。

symlink不可環境のテストでは `makeFakeLnThatAlwaysFails()` が生成する `ln`（常に `exit 1`）を含む
ディレクトリを `PATH` の先頭に注入した状態でフックを実行する。

staged変更保護のテストでは、フック実行前に `unrelated-wip.txt` を作成して `git add` し、
同期対象外のstaged変更がある状態を再現してからフックを実行する。

## カバレッジサマリー

- pre-push.sh symlink不可環境フォールバックの挙動検証: 4件
- pre-push.sh staged変更保護の挙動検証: 4件
- 合計: 8件
