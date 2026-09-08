# E2E テストドキュメント: Issue #3621
## xp_CompleteTasksスキルを新規作成する（サブTaskをxp_Directorで順次処理しAllGREENまで進めるループ）

テストファイル: `SoloXP/tests/e2e/issue-3621-xp-complete-tasks-skill.test.js`

---

## ユーザーシナリオ概要

親Story/Bugイシューが `xp_Architect` によってサブイシューに分解された後、各サブTaskを
`/xp_Director` で一つずつ実装していく作業を自動化する新規スキル `xp_CompleteTasks` を検証する。
`SoloXP/skills/xp_CompleteTasks/SKILL.md`（#3623）に、サブTaskの完了判定・PRマージ待ちポーリング・
AllGREENフロー起動・停止条件が明記されていること、および機能仕様書（#3624）が作成され
`SoloXP/docs/spec/README.md` の索引に追加されていることを検証する。

SKILL.md の文言・見出し番号をそのまま `toContain` / 正規表現でアサートせず、構造・契約
（必須セクションの存在、frontmatterスキーマ、参照ファイルの実在等）のみを検証する
（`SoloXP/docs/spec/tdd_principles.md` 原則7）。

---

## 前提条件

- `SoloXP/skills/xp_CompleteTasks/SKILL.md` が存在すること（#3623 完了後）
- `SoloXP/docs/spec/xp_complete_tasks.md` が存在すること（#3624 完了後）
- `SoloXP/docs/spec/README.md` が存在すること

---

## テストケース一覧（18件）

### 受け入れ条件 1: SKILL.md の存在と基本契約（#3623・16件）

| # | Given | When | Then |
|---|---|---|---|
| 1 | リポジトリが存在する | `SoloXP/skills/xp_CompleteTasks/SKILL.md` を確認する | ファイルが存在する |
| 2 | SKILL.md が存在する | frontmatter を抽出する | `model:` フィールドが指定されている |
| 3 | SKILL.md が存在する | 本文を確認する | `/xp_CompleteTasks` コマンドが定義されている |
| 4 | SKILL.md が存在する | 見出しを確認する | 「コマンド」セクションが存在する |
| 5 | SKILL.md が存在する | 見出しを確認する | 「責務」セクションが存在する |
| 6 | SKILL.md が存在する | 見出しを確認する | 「処理フロー」相当のセクションが存在する |
| 7 | SKILL.md が存在する | 見出しを確認する | 「注意事項」セクションが存在する |
| 8 | SKILL.md が存在する | 親イシュー未分解時の記述を確認する | 「未分解」または「分解済み」判定＋「停止」の記述が近接している |
| 9 | SKILL.md が存在する | サブイシュー完了判定の記述を確認する | `[Auditor GREEN]` と `[Auditor doc OK]` の両方が含まれる |
| 10 | SKILL.md が存在する | サブイシュー完了判定の記述を確認する | 対応PRの `merged`（マージ済み）確認への言及がある |
| 11 | SKILL.md が存在する | PRマージ待ちの記述を確認する | 「ポーリング」または「待機」と「マージ」が近接している |
| 12 | SKILL.md が存在する | AllGREENフロー起動の記述を確認する | `AllGREEN` と `xp_Director` の両方への言及がある |
| 13 | SKILL.md が存在する | main向けPR発行確認の記述を確認する | `feature/issue-{親番号}` → `main` の記述がある |
| 14 | SKILL.md が存在する | main マージ待機の記述を確認する | 「main」「マージ」「待たない/オーナー/ユーザー」が近接している |
| 15 | SKILL.md が存在する | xp_Director への言及を確認する | 「1タスク1PR」ルールへの言及がある |
| 16 | SKILL.md が存在する | 自動マージ有無の記述を確認する | 「自動マージ」と「行わない/しない」が近接している |

### 受け入れ条件 2: 機能仕様書（#3624・2件）

| # | Given | When | Then |
|---|---|---|---|
| 17 | リポジトリが存在する | `SoloXP/docs/spec/xp_complete_tasks.md` を確認する | ファイルが存在する |
| 18 | `SoloXP/docs/spec/README.md` が存在する | 索引を確認する | `xp_complete_tasks.md` へのリンクが含まれる |

---

## 実行結果

| 実行日 | PASS | FAIL | 状態 |
|---|---|---|---|
| 2026-09-07 | 0 | 3 | 実装前（RED 確認。SKILL.md 未作成のため #1・#17・#18 のみ実行され失敗、残りは `if (skill)` ガードにより未登録） |
