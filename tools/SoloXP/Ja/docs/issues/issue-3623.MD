---
issue: 3623
title: "[Task] xp_CompleteTasksスキルの実装（SKILL.md新規作成）"
state: closed
labels: [task, epic/SoloXP]
author: noragrammer-crypto
created_at: 2026-09-07T08:04:05Z
epic: SoloXP
---

# #3623 [Task] xp_CompleteTasksスキルの実装（SKILL.md新規作成）

## 本文

## 概要
`SoloXP/skills/xp_CompleteTasks/SKILL.md` を新規作成する。

コマンド仕様:

- `/xp_CompleteTasks <親issue番号>`
  1. 親イシューが `xp_Architect` によりサブイシュー分解済み（`[親ブランチ作成済み]` マーカー・
     `feature/issue-{親番号}` ブランチが存在）であることを確認する。未分解の場合は
     「先に /xp_Director <親issue番号> を実行してください」と表示して停止する
  2. `get_sub_issues` で親イシューのサブイシュー一覧を取得し、以下で分類する：
     - 完了済み: 通常タスクは `[Auditor GREEN]`、spec_updateタスクは `[Auditor doc OK]` を含む
       **かつ** 対応PR（`--base feature/issue-{親番号}`）が `merged` であること
       （`xp_Director` の「depends_on 解消判断」節と同じ確認手法・gh優先/MCPフォールバックを踏襲する）
     - PR発行済み・マージ待ち: 対応する `open` なPRが存在する
     - 未着手: 上記いずれでもない
  3. 全サブイシューが「完了済み」なら手順6（AllGREENフロー起動）へ進む
  4. 「PR発行済み・マージ待ち」のサブイシューが1件でもある場合: そのPRがマージ（またはclose）
     されるまでポーリングして待機する。マージされたら手順2に戻る。closeされてマージされずに
     終わった場合はユーザーに報告し、再実行かスキップかを確認する
  5. 未着手のサブイシューがある場合: depends_on解消済みで着手可能なサブイシューを1件選び、
     `/xp_Director <サブイシュー番号>` を実行する。実行後、手順2に戻る
     （本タスクは `/xp_Director` の内部フロー・1タスク1PRルールには介入せず、呼び出しと
     完了〔PR発行 or 停止理由の報告〕を待つだけに徹する）
  6. 未完了サブイシューがなくなったら、親issue番号で `/xp_Director <親issue番号>` を再実行し、
     `xp_Director` のAllGREENフロー（`feature/issue-{親番号}` → `main` のPR発行）を起動する
  7. `feature/issue-{親番号}` → `main` のPRが発行されたことを確認したら完了として停止する
     （mainへのマージはオーナー責務のため待たない）。AllGREEN不成立で `xp_Director` が停止した
     場合は、その理由をそのままユーザーに報告して停止する

- `/xp_CompleteTasks`（引数なし）: 現在のgitブランチ名が `feature/issue-{番号}` 形式であれば
  その番号を親issue番号として使用する。パースできない場合はユーザーに確認する

注意事項として以下をSKILL.md本文に明記する:

- 本スキルは `xp_Director` の1タスク1PRルール・停止条件を変更しない（呼び出しのみに徹する）
- サブTask PRの自動マージは行わない
- ループ中に `xp_Director` がユーザー判断を仰ぐ状態（RED差し戻し上限超過等）になった場合は
  本スキルもそこで停止しユーザーに報告する

## 見積もり
2pt — 新規SKILL.md作成のみ

## 依存関係
なし（即着手可能）

## 親ストーリー
#3621

## 親ブランチ
feature/issue-3621

## コメント

### noragrammer-crypto — 2026-09-07T08:30:45Z

作業開始 2026-09-07T17:30:41+09:00
セッションURL: https://claude.ai/code/session_01BoYYCF3g9cfo6FQH2Y5Q4F
[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-09-07T08:31:03Z

[Tester実行中]

## テスト実行結果

対象は `SoloXP/skills/xp_CompleteTasks/SKILL.md`（Claude Code が読むプロンプト定義であり、実行可能なコードファイルではない）の新規作成タスク。Unit/Functionalテストの対象となるコードは存在しない。

### Unit Test
スキップ — テスト対象コードなし（SKILL.mdはプロンプト文書であり、関数・クラス単位のユニットテスト対象が存在しない）

### Functional Test
スキップ — テスト対象コードなし（同上）

### E2E Test
スキップ — 本タスクはタスクイシュー単体（親ストーリー #3621 は既に #3622 でE2Eテスト作成済み。`SoloXP/tests/e2e/issue-3621-xp-complete-tasks-skill.test.js` がこの実装の受け入れ条件を検証する）

---
[Tester完了]
実装（xp_Implementer）へ引き継ぎます。受け入れ判定は既存のE2Eテスト（#3622で作成済み）に委ねます。

---

### noragrammer-crypto — 2026-09-07T08:32:38Z

[Implementer実行中]

---

### noragrammer-crypto — 2026-09-07T08:33:21Z

## 実装完了

変更ファイル:
- `SoloXP/skills/xp_CompleteTasks/SKILL.md`（新規作成）: `/xp_CompleteTasks <親issue番号>` コマンドを定義。サブTaskループ（依存解消確認・`/xp_Director`逐次呼び出し・PRマージ待ちポーリング）とAllGREENフロー起動・完了条件を記述

テスト結果（`SoloXP/tests/e2e/issue-3621-xp-complete-tasks-skill.test.js`）:
- Suite 1（SKILL.md本文の契約・AC1〜AC9）: PASS 16件 / FAIL 0件
- Suite 2（機能仕様書・AC10）: FAIL 2件 — #3624（機能仕様書更新タスク）が未着手のため想定通り

[Implementer完了]

---

### noragrammer-crypto — 2026-09-07T08:33:43Z

[Auditor GREEN]
PASS: 399件（Unit 330件 + Functional 69件）/ テストコマンド: `npm run test:unit && npm run test:functional`（`SoloXP/`配下）
E2E: タスクイシュー単体のためスキップ（親ストーリー #3621 のE2E受け入れテストは Suite 1（AC1〜AC9）16件PASS。Suite 2（AC10・#3624対象）は未着手のため想定通りFAIL）

---

### noragrammer-crypto — 2026-09-07T08:34:55Z

[xp_doc_spec] `SoloXP/docs/spec/` を確認。機能仕様書（`xp_complete_tasks.md` 新規作成・README索引追加）は専用の spec_update タスク #3624 に割り当て済みのため、本タスク（#3623）では実施しない（重複作業回避）。`README.md` に「関連イシュー」状態同期表は存在しないため該当作業なし。

---

### noragrammer-crypto — 2026-09-07T08:35:02Z

[xp_doc_reference] 対象外 — 本タスクの変更は `SoloXP/skills/xp_CompleteTasks/SKILL.md`（プロンプト文書）のみで、クラス・関数を持つコードファイルの変更はないため、リファレンスドキュメントの生成対象なし。

---

### noragrammer-crypto — 2026-09-07T08:35:14Z

[xp_doc_UnitTests] [xp_doc_FunctionTests] [xp_doc_E2ETests] いずれも対象外 — 本タスクでは新規Unit/Functionalテストファイルを作成していない（`xp_Tester` 判定によりテスト対象コードなしのためスキップ済み）。E2Eテストは親ストーリー #3621 の受け入れテストとして #3622 で作成済みであり、本タスクでは追加のテスト・ドキュメント生成を行わない。

---

### noragrammer-crypto — 2026-09-07T08:35:19Z

## ドキュメント生成完了

生成・更新したファイル:
- `SoloXP/docs/issues/issue-3623.MD`（新規作成）: xp_issue2md によるイシュースナップショット

対象外（理由は各コメント参照）:
- `xp_doc_spec`: spec_updateタスク #3624 に割り当て済みのため実施しない
- `xp_doc_reference` / `xp_doc_UnitTests` / `xp_doc_FunctionTests` / `xp_doc_E2ETests`: 対象コード・テストなし

[Documenter完了]

---

### noragrammer-crypto — 2026-09-07T08:36:00Z

[Auditor ドキュメントチェック中]

### ドキュメントチェック結果
- spec/README.md: OK（本タスクでの変更なし、spec_updateタスク#3624に割り当て済み）
- issue2mdログ: 陳腐化検知（GitHub上9件 / ログ上5件）→ 再実行して最新化済み。OK
- diffスコープ整合性: OK（`git diff --stat origin/feature/issue-3621` で新規untracked 2件のみ確認: `SoloXP/skills/xp_CompleteTasks/`, `SoloXP/docs/issues/issue-3623.MD`。想定範囲どおり）

[Auditor doc OK]
xp_Director がPRを発行します。

---

### noragrammer-crypto — 2026-09-07T08:36:54Z

[PR発行済み #3628]
[ProjectStatus: Done]

---
