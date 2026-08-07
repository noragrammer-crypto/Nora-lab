# issue-638-pr-autoclose-keywords E2E Tests

## ユーザーシナリオ概要

PRマージ時にイシューが自動クローズされるよう、xp_Auditor SKILL.md の `gh pr create` 本文テンプレートに `Closes #<issue番号>` キーワードが含まれていることを検証する。

関連イシュー: #638 / #640

## 前提条件

- `dotfiles/.claude/skills/xp_Auditor/SKILL.md` が存在すること
- `SoloXP/skills/xp_Auditor/SKILL.md` が存在すること

## Given/When/Then ステップ

### 受け入れ条件 2-dotfiles: /root/.claude/skills/xp_Auditor/SKILL.md

| # | Given | When | Then |
|---|---|---|---|
| 1 | dotfiles 版 xp_Auditor SKILL.md が存在する | gh pr create コマンドを検索する | `gh pr create` コマンドが見つかる |
| 2 | dotfiles 版 xp_Auditor SKILL.md が存在する | PR 本文にクローズキーワードを検索する | `Closes #`/`Fixes #`/`Resolves #` のいずれかが含まれる |
| 3 | dotfiles 版 xp_Auditor SKILL.md が存在する | テンプレート変数形式を検索する | `Closes #<issue番号>` 形式のテンプレートが含まれる |

### 受け入れ条件 2-SoloXP: SoloXP/skills/xp_Auditor/SKILL.md

| # | Given | When | Then |
|---|---|---|---|
| 4 | SoloXP 版 xp_Auditor SKILL.md が存在する | gh pr create コマンドを検索する | `gh pr create` コマンドが見つかる |
| 5 | SoloXP 版 xp_Auditor SKILL.md が存在する | PR 本文にクローズキーワードを検索する | `Closes #`/`Fixes #`/`Resolves #` のいずれかが含まれる |
| 6 | SoloXP 版 xp_Auditor SKILL.md が存在する | テンプレート変数形式を検索する | `Closes #<issue番号>` 形式のテンプレートが含まれる |

## カバレッジサマリー

- テストファイル: `SoloXP/tests/e2e/issue-638-pr-autoclose-keywords.test.js`
- テスト数: 6件
