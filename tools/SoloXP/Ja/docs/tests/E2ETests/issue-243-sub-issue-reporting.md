# E2E テストドキュメント: サブイシュー完了報告と親イシュー受け入れ確認

## テストファイル

`SoloXP/tests/e2e/issue-243-sub-issue-reporting.test.js`

## シナリオ概要

Issue #243「サブイシュー完了報告と親イシュー受け入れ確認を分離する」の受け入れ条件を検証する。
xp_Auditor と xp_Director の SKILL.md に必要な指示が記載されていることを確認する。

---

## 受け入れ条件 1: サブイシュー完了時の親イシュー完了報告

### テスト対象

`xp_Auditor` SKILL.md（`.claude/skills/xp_Auditor/SKILL.md`）

### テストケース

| # | テスト名 | 確認パターン |
|---|---|---|
| 1 | 親イシューへの完了報告コメント指示が含まれる | `/親イシュー.*完了報告\|完了報告.*親イシュー/` |
| 2 | 「サブイシュー #xx 完了。残り: #yy」形式のコメント例が含まれる | `/サブイシュー.+完了.+残り/` |
| 3 | 親ストーリーイシュー番号取得手順が含まれる | `/親ストーリー\|parent.*stor\|親イシュー.*番号\|番号.*親/i` |
| 4 | 残りサブイシュー特定ロジックが含まれる | `/残り.*サブイシュー\|オープン.*タスク\|open.*task\|残り.*タスク/i` |

**対応実装**: PR #257（issue #250）

---

## 受け入れ条件 2: 全サブイシュー完了時の受け入れテスト実行とPR発行

### テスト対象

`xp_Director` SKILL.md（`.claude/skills/xp_Director/SKILL.md`）

### テストケース

| # | テスト名 | 確認パターン |
|---|---|---|
| 1 | 全サブイシュー完了チェックの指示が含まれる | `/全.*サブイシュー.*完了\|全.*GREEN\|AllGREEN\|all.*green/i` |
| 2 | 全サブイシュー完了時の受け入れテスト実行指示が含まれる | `/受け入れテスト\|acceptance.*test\|xp_RunE2ETests/i` |
| 3 | 受け入れテスト通過→PR発行のフローが含まれる | `/通過.*PR\|✅.*PR\|GREEN.*PR\|pass.*PR/i` |
| 4 | 受け入れテスト失敗→新サブイシュー起票のフローが含まれる | `/失敗.*サブイシュー\|❌.*サブイシュー\|fail.*issue\|新.*サブイシュー.*起票/i` |

**対応実装**: issue #251（このタスク）

---

## 前提条件

- `.claude/skills/xp_Auditor/SKILL.md` が存在すること
- `.claude/skills/xp_Director/SKILL.md` が存在すること

## 実行方法

```bash
node SoloXP/tests/e2e/issue-243-sub-issue-reporting.test.js
```
