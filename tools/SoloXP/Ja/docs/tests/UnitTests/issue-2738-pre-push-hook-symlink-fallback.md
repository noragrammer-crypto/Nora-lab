# issue-2738-pre-push-hook-symlink-fallback ユニットテスト

## テスト対象

`.claude/hooks/pre-push.sh`（内容の静的検証）

非Termuxでもsymlink作成が失敗しうる環境でスキルディレクトリが消失する問題（指摘1）、
および `.claude/skills/` のドリフト修正コミット時に同期対象外のstaged変更を巻き込んでしまう
問題（指摘2）の修正実装を静的に検証する（Issue #2738、実装タスク #2936）。

## テストファイル

`SoloXP/tests/unit/issue-2738-pre-push-hook-symlink-fallback.unit.test.js`

## テストケース一覧

| テストケース | 種別 | 内容 |
|---|---|---|
| 命題1: `.claude/hooks/pre-push.sh` が存在する | 正常系 | フックファイル自体の存在確認 |
| 命題2: symlink作成可否を実プローブする関数（`can_create_symlinks`）が定義されている | 正常系 | 関数定義・`ln -s` によるプローブ本体の存在確認 |
| 命題3: モード判定が `is_termux()` だけでなく `can_create_symlinks()` の失敗も考慮している | 正常系（指摘1の回帰防止） | `is_termux \|\| ! can_create_symlinks` 相当の判定条件の存在確認 |
| 命題4: 個々の `ln -s` にも失敗時 `cp -r` へのフォールバックがある | 正常系（保険的フォールバック） | `ln -s` 直後の文脈に `cp -r` フォールバックが存在することの確認 |
| 命題5: `git add` 前に staged 内容を退避している | 正常系（指摘2の回帰防止） | `git diff --cached --name-only` の存在確認 |
| 命題6: 退避した staged 内容が非空の場合、自動コミットをスキップする分岐がある | 正常系（指摘2の回帰防止） | `pre_existing_staged` 変数と、非空判定後の `exit 0` の存在確認 |
| 命題7: staged変更保護メッセージが記載されている | 正常系（ユーザーへの説明責任） | 警告メッセージ文言の存在確認 |

## カバレッジサマリー

- pre-push.sh symlinkフォールバック・staged変更保護の静的検証: 7件
- 合計: 7件
