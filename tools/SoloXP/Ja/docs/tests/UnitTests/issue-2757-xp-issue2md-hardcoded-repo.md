# Unit Test: issue-2757 xp-issue2md-hardcoded-repo

対象ファイル: `SoloXP/tests/unit/issue-2757-xp-issue2md-hardcoded-repo.unit.test.js`
検証対象: `SoloXP/skills/xp_issue2md/SKILL.md`

## 背景

`xp_issue2md/SKILL.md` の `gh issue view` コマンドが `--repo noragrammer-crypto/HolyAutomater` を
固定でハードコードしていた。`xp_Documenter` が全タスクで本スキルを呼ぶため、HolyAutomater 以外の
リポジトリに SoloXP を導入すると毎回誤ったリポジトリのイシューを参照してしまう（Nora-lab PR #21 の
Codex 自動レビュー指摘、#2757）。

## テストケース

1. `--repo noragrammer-crypto/HolyAutomater` のような固定リポジトリのハードコードが存在しない
2. `gh issue view` コマンド行が `--repo` 引数を持たず、`gh` のカレントディレクトリからの自動解決に委ねている
3. 他リポジトリでの動作を一般化する方針（自動解決・自動検出・カレント）がファイル内に明記されている

## 実行結果

- 修正前（バグ再現時点）: FAIL 3件 / PASS 0件（想定通りRED）
- 修正後（`--repo noragrammer-crypto/HolyAutomater` を除去し、`gh issue view <issue_number> --json ...` に変更）: PASS 3件 / FAIL 0件（GREEN）
- 関連回帰確認: `issue-2640-claude-skills-sync-strategy.unit.test.js`、`issue-1557-xp-skill-acceptance-criteria-docs.unit.test.js` とも PASS

## 補足

`dotfiles/.claude/skills/xp_issue2md/SKILL.md` は `SoloXP/skills/xp_*` を正本として pre-push hook
（`.claude/hooks/pre-push.sh`）が自動同期するため、本修正では `SoloXP/skills/xp_issue2md/SKILL.md`
のみを編集した。
