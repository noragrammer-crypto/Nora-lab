# Solo XP 運用ワークフロー

> SoloXP自体の概要・特徴・ドキュメント一覧は [README.md](./README.md) を参照。
> ブランチ命名・ベースブランチ・マージコンフリクトが起きやすい理由等の背景説明は
> [ブランチ・PRマージ戦略についてのメモ](./docs/manual/branch-strategy.md) を参照。

> **前提**: 以下のワークフローは、リポジトリルートの `CLAUDE.md` にブランチ運用・PR発行事前承認・
> TDD原則・作業時間記録ルール等が定義されていることを前提にしています。まだ用意していない場合は
> [`CLAUDE.md.template`](./CLAUDE.md.template) を自分の `CLAUDE.md` にコピーして編集してください。

## 基本フロー

```
Issue 作成（ユーザー）
    ↓
/xp_Director <issue_number> 起動
    ↓
xp_Architect: サブイシュー発行
    ↓
xp_Director: タスク1件ずつ順番に処理
  └─ xp_Tester → xp_Implementer → xp_Auditor test → xp_Documenter → xp_Auditor doc
    ↓
[Auditor GREEN] → 親イシューへ完了報告
    ↓
全サブイシュー AllGREEN → xp_RunE2ETests（受け入れテスト）
    ↓
✅ 通過 → 親ストーリーPR発行・Close
❌ 失敗 → 失敗内容で新サブイシュー起票・継続
```

---

## 詳細ワークフロー

### 1. Issue作成（ユーザー）

```bash
# Web版Claude Code、Termux、GitHub アプリなど任意の方法で
gh issue create \
  --title "[Story] 機能名" \
  --body "## 背景\n...\n\n## 受け入れ条件\n- [ ] ..."
```

### 2. xp_Director 起動

```
/xp_Director <issue_number>
```

または引数なしで未処理イシューを自動選択：

```
/xp_Director
```

### 3. xp_Architect によるタスク分解

`[Story]`、`[Bug]`、タグなし → xp_Architect がサブイシューを発行する。
`[Task]` タグ付き → Architect をスキップしてそのまま実行フローへ。

Architect は：
- イシュー種別を Story / Task / Bug に分類する
- タスクを依存関係付きでサブイシューとして発行する（必須付随タスク込みの合計タスク数が1件のみの場合はサブイシュー・親ブランチを作らず、親イシューをそのままルートタスクとして扱う。詳細は `xp_Architect/SKILL.md` 手順4-A）
- 実行計画を Architect 分析結果コメントとして記録する

### 4. タスク処理（1タスク1PRルール）

**1回の xp_Director 実行では1タスクのみ処理する。**

#### タスク種別と処理方法

| タスク種別 | 識別方法 | 処理スキル |
|---|---|---|
| `e2e_test_creation` | 「E2Eテストスイート作成」または task_type: e2e_test_creation | xp_E2Etest <親ストーリー番号> |
| `spec_update` | 「機能仕様書更新」または task_type: spec_update | xp_issue2md <task_issue> → xp_doc_spec <epic> <親ストーリー番号> |
| `bug_reproduction_test` | 「バグ再現テスト追加」または task_type: bug_reproduction_test | xp_Tester <task_issue> |
| 通常実装タスク | 上記以外 | xp_Tester → xp_Implementer → xp_Auditor → xp_Documenter |

#### 通常実装タスクのステップ

```
[Tester実行中]    → テストスイート作成・実行
[Tester完了]
[Implementer実行中] → テストをグリーンにする実装
[Implementer完了]
[Auditor テスト実行中] → テスト実行・結果分析
[Auditor GREEN] または [Auditor RED]
[Documenter実行中]   → 全種ドキュメント生成
[Documenter完了]
[Auditor ドキュメントチェック中] → spec/reference 確認
[PR発行済み #xx]
```

### 5. サブイシュー完了報告

タスクイシューが `[Auditor GREEN]` になったとき、xp_Auditor が親ストーリーイシューへ報告する：

```
サブイシュー #42 完了。残り: #43, #45
```

全サブイシュー完了時：

```
サブイシュー #42 完了。残り: なし（全タスク完了）
```

### 6. AllGREEN チェック → 受け入れテスト

**重要（実行タイミング）**: 4節の通常実装タスクのステップにあるとおり、`xp_Director` は
タスクPR発行後は**必ず一旦停止**する（1タスク1PRルール、詳細は `xp_Director/SKILL.md` 手順3参照）。
AllGREENチェックはそのラン内では**実行しない**。次回 `/ProcessIssue` 実行時に親Story/Bugイシューが
評価される段階で全サブイシューの完了を検知し、そこから `xp_Director <親イシュー番号>` が**別ランとして**
呼び出されたときに、以下のAllGREENチェックを実行する。

`xp_Director` が全サブイシューの完了マーカーを確認する（通常タスクは `[Auditor GREEN]`、
`spec_update` タスク〈`task_type: spec_update` または「機能仕様書更新」〉は `[Auditor doc OK]`
——`spec_update` は構造上 `[Auditor GREEN]` を出力しないため、この2種の完了マーカーで判定する）：

- **AllGREEN の場合** → 親ブランチ → main の PR を発行する前に、以下の必須ゲートを**すべて**通過させる（詳細は `xp_Director/SKILL.md` 手順3-eを参照）：
  1. `xp_Auditor test <epic> <story>` で Story-level 受け入れテスト（E2E）を実行する
     - ✅ GREEN → 次のゲートへ進む
     - ❌ RED → 失敗内容で新サブイシューを起票し、親イシューは継続（PRは発行しない）
  2. Story-level GREEN 確認後、`xp_Reviewer <epic> <story>` によるコードレビューを実施する（高リスク指摘があれば改善勧告イシューを自動起票）
  3. xp_Reviewer 完了後、`xp_SecurityReviewer <epic> <story>` によるセキュリティレビューを実施する（組み込みスキル `security-review` を呼び出し、高リスク指摘があれば改善勧告イシューを自動起票）
  4. `xp_Auditor doc <epic> <story>` でドキュメントチェックを実施する
  5. `xp_RunE2ETests` で E2E テストスイートを確認する（手順1の Story-level 受け入れテストとは別に、xp_Director 自身が実行する参考情報のE2Eスイート確認ゲート。`xp_RunE2ETests` 自体は所有権判定を持たないため、手順1で既に所有権判定済み〈他ストーリー所有〉のREDと一致する raw FAIL のみでは本ゲートを不成立としない。手順1のRED一覧と一致しない新規FAILが検出された場合は不成立とし、手順1の `xp_Auditor test` からやり直す。#2817）
  6. `spec_update` タスク完了ゲート: サブイシューに `task_type: spec_update`（または「機能仕様書更新」）タスクが存在する場合、`[Auditor doc OK]` が記録されているか確認する。未完了ならPRを発行せず停止する
  7. 全サブタスクPRのマージ確認ゲート: 完了済みサブイシューそれぞれに対応する `merged` 状態のPRが実在するか個別に確認する（`[Auditor GREEN]`/`[Auditor doc OK]` があってもPRが未マージなら AllGREEN 不成立）
  8. Issue Markdown finalize（ゲートではなく付随的な同期処理）: `xp_issueArchiveFinalize <EpicName>` を呼び、対象Epic配下で `state: open` のままclosed済みのIssue Markdownを最新版へ差し替える。結果はAllGREEN成立可否には使用しない（#2971の非目的）。1件以上更新があれば親ブランチ上でコミット・pushしてから次へ進む
  - 上記1〜7のゲートすべて通過（手順8は参考情報のため通過条件に含めない）→ 親ストーリーイシューの PR を発行してClose（PR本文に `## AllGREEN チェック結果` セクションで各ゲート＋Issue Markdown finalizeの結果を要約する。テンプレートは `xp_Director/SKILL.md` 手順3-e-9参照。#1690, #3485）
- **未完了サブイシューがある場合** → そのまま停止（次タスクは次回 `/xp_Director` 呼び出しで着手）

### 7. 人間が確認・マージ（ユーザー）

```bash
# PR 確認
gh pr view <番号>
gh pr diff <番号>

# マージ
gh pr merge <番号> --squash
```

---

## depends_on（依存関係）の解消

- GitHub の close 状態は見ない
- **依存先サブイシューのコメントに `[Auditor GREEN]` があればブロック解除**
- ブロック解除されたサブイシューは次回の `/xp_Director` 呼び出しで実行対象となる

---

## ワークログ記録ルール

Issue コメントで作業時間を記録する（デバイス非依存、GitHubタイムラインに残る）。

**着手時：**
```
作業開始 YYYY-MM-DD HH:MM
```

**完了時：**
```
作業完了 YYYY-MM-DD HH:MM / 所要時間: XX分
```

集計は `/xp_worklog` で行う。

---

## RED 時のリトライ制御

同一タスクスコープの RED は xp_Director が xp_Implementer に差し戻す（最大3回）。
3回超えた場合はエスカレーション停止・イシューにコメントしてユーザーへ連絡する。

---

## スキル一覧

| スキル | 役割 |
|---|---|
| xp_Director | 司令塔。全スキルの実行順序・タイミングを制御する |
| xp_Architect | イシューをStory/Task/Bugに分類しサブイシューを発行する |
| xp_Tester | テストスイートを作成・実行する |
| xp_Implementer | テストをグリーンにする実装を行う |
| xp_Auditor | テスト実行・品質監査・サブイシュー完了報告 |
| xp_Documenter | 全種ドキュメント（spec/reference/tests）を生成する |
| xp_E2Etest | E2Eテストスイートを作成する |
| xp_RunTestSuites | Unit + Functional テストを実行する |
| xp_RunE2ETests | E2E テストを実行する |
| xp_RunAllUnitTests | 全単体テストを実行してレポートする |
| xp_worklog | 作業時間を集計してレポートする |
| xp_review_workflow | ワークフローを振り返り改善点を示す |

---

**更新日**: 2026-03-18
