# E2E Tests: issue-615 親イシューブランチへのPR積み上げフロー

テストファイル: `SoloXP/tests/e2e/issue-615-parent-branch-pr-stacking.test.js`
テスト対象: `dotfiles/.claude/skills/xp_Director/SKILL.md`, `dotfiles/.claude/skills/xp_Auditor/SKILL.md`, `dotfiles/.claude/skills/xp_Architect/SKILL.md`, `CLAUDE.md`

---

## ユーザーシナリオ概要

Solo XP ワークフローで親 Story/Bug を処理する際に、サブタスクの PR が親ブランチ（`feature/issue-{番号}`）に積み上がり、AllGREEN 後に親ブランチから main への PR が発行されるフロー。

---

## 受け入れ条件とテストケース一覧

### 受け入れ条件 1: 親Story処理時にfeatureブランチが作成・pushされて停止する — 4件

| # | テストケース | 確認パターン | 結果 |
|---|---|---|---|
| 1 | xp_Director SKILL.md に feature/issue-{番号} ブランチ作成の指示が含まれる | `/feature\/issue-\{?番号\}?/` | ✅ PASS |
| 2 | xp_Director SKILL.md に Story 処理後のブランチ push 指示が含まれる | `/git push.*feature\|push.*origin.*feature/` | ✅ PASS |
| 3 | xp_Director SKILL.md に Architect 完了後の停止指示が含まれる | `/Architect.*完了後.*停止\|親.*ブランチ.*作成.*停止\|feature.*push.*停止/` | ✅ PASS |
| 4 | xp_Director SKILL.md に [親ブランチ作成済み] コメントの記録が含まれる | `/親ブランチ作成済み/` | ✅ PASS |

### 受け入れ条件 2: サブTask処理時の親ブランチ検出・リベース・PR base変更 — 4件

| # | テストケース | 確認パターン | 結果 |
|---|---|---|---|
| 5 | xp_Director SKILL.md に親ブランチ検出の指示が含まれる | `/親ブランチ.*検出\|feature\/issue.*検出\|fetch.*feature/` | ✅ PASS |
| 6 | xp_Director SKILL.md に git rebase の指示が含まれる | `/git rebase/` | ✅ PASS |
| 7 | xp_Director SKILL.md に PR の --base オプション指定が含まれる | `/--base.*feature\|base.*親ブランチ/` | ✅ PASS |
| 8 | xp_Director SKILL.md に親ブランチが見つからない場合の停止処理が含まれる | `/親ブランチ.*見つかりません\|feature.*見つから/` | ✅ PASS |

### 受け入れ条件 3: AllGREEN後に親ブランチ→mainのPRが発行される — 2件

| # | テストケース | 確認パターン | 結果 |
|---|---|---|---|
| 9 | xp_Director SKILL.md に AllGREEN 後の feature→main PR 発行指示が含まれる | `/AllGREEN.*feature.*main\|feature.*main.*PR\|親ブランチ.*main.*PR/` | ✅ PASS |
| 10 | xp_Director SKILL.md に AllGREEN 後の親ブランチ PR コメント記録が含まれる | `/親ブランチ PR 発行済み\|親.*PR.*発行/` | ✅ PASS |

### 受け入れ条件 4: CLAUDE.md のブランチ運用ルールが更新されている — 3件

| # | テストケース | 確認パターン | 結果 |
|---|---|---|---|
| 11 | CLAUDE.md に feature/issue-{番号} の親ブランチ運用フローが含まれる | `/feature\/issue-\{?番号\}?.*自動作成\|xp_Director.*feature\|親.*Story.*feature/` | ✅ PASS |
| 12 | CLAUDE.md にサブTask処理時のリベースフローが含まれる | `/サブTask.*リベース\|rebase.*親ブランチ\|SubTask.*親ブランチ/` | ✅ PASS |
| 13 | CLAUDE.md に AllGREEN 後の親ブランチ→main PR フローが含まれる | `/AllGREEN.*feature.*main\|feature.*main.*PR.*発行/` | ✅ PASS |

### 受け入れ条件 5: PR作成責務が xp_Director に移管されている — 2件

| # | テストケース | 確認パターン | 結果 |
|---|---|---|---|
| 14 | xp_Director SKILL.md に PR 発行を Director が行う記述が含まれる | `/Director.*PR.*発行\|xp_Director.*gh pr create\|PR.*Director.*責務/` | ✅ PASS |
| 15 | xp_Auditor SKILL.md の doc モードで PR を発行しない旨が記載されている | `/PR.*Director\|Director.*PR\|PR.*発行.*しない\|PR発行.*xp_Director/` | ✅ PASS |

### 受け入れ条件 6: xp_Architect がサブイシュー本文に親ブランチ名を明記する — 2件

| # | テストケース | 確認パターン | 結果 |
|---|---|---|---|
| 16 | xp_Architect SKILL.md のサブイシューテンプレートに親ブランチセクションが含まれる | `/親ブランチ/` | ✅ PASS |
| 17 | xp_Architect SKILL.md に feature/issue-{親番号} の記載がある | `/feature\/issue-\{?親番号\}?/` | ✅ PASS |

---

## 概要

SKILL.md（自然言語インストラクション）を対象とした仕様検証テスト群。
`fs.readFileSync` でファイルを読み込み、正規表現パターンマッチで仕様文言を確認する。

受け入れ条件 9・10 は issue #998/#1100 で SKILL.md の文言が明確化されたことで GREEN になった。

---

## 関連

- #615: 親ストーリー（親イシューブランチへのPR積み上げフロー実装）
- #689–#692: 各サブタスク（feature ブランチ作成・リベース・PR責務移管・AllGREEN PR）
- #998: Bug（issue-615 E2E テストの FAIL 発見）
- #1100: 修正タスク（SKILL.md AllGREEN セクション文言明確化）
- `workflow/docs/spec/xp-director-allgreen-pr.md`: 仕様書
