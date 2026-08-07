# xp_Director 機能仕様書

## 概要

xp_Director は Solo XP ワークフローの司令塔スキル。
全スキルの実行順序・タイミングを制御し、コードには触れない。

---

## コマンド

| コマンド | 説明 |
|---|---|
| `xp_Director <issue_number>` | 指定イシューのワークフローを制御する |
| `xp_Director`（引数なし） | 直ちに `/ProcessIssue` に委譲する |

---

## 処理フロー

### 引数なし時：ProcessIssue に委譲

直ちに `/ProcessIssue` に処理を委譲して停止する。
イシュー選択・振り分けロジックは ProcessIssue が担当する。

### Architect への委譲判断（観測可能変更チェック）

タイトルに `[Task]` と記載されている場合は、Architect を完全バイパスする前に**観測可能変更チェック**（軽量ゲート）を通す：

1. イシュー本文・タイトルから「ユーザー/外部から観測可能な振る舞いの変更を伴うか」を判定する
   - 例: SKILL.md・ドキュメント記述のみの変更、設定値変更のみ、内部リファクタのみ → **なし**
   - 例: API/エンドポイントの追加・変更、UIの追加・変更、出力内容の変化を伴う実装 → **あり**
2. 判定結果をイシューにコメントとして記録する：
   ```
   ## 観測可能変更チェック（[Task]スキップ判定）

   対象: #<issue_number>
   観測可能な振る舞いの変更: あり / なし
   理由: <判断理由>
   ```
3. **なし** → Architect をスキップしてそのまま実行フローへ進む
4. **あり** → Architect をスキップせず `xp_Architect <issue_number>` を呼ぶ（Architect が 1-1 の E2E/spec 要否判定を実施する）

`[Task]` 以外（`[Story]`、`[Bug]`、タグなし）は上記ゲートを行わず必ず `xp_Architect <issue_number>` を呼ぶ。

### タスクイシュー処理

**【1タスク1PRルール】** — 複数サブイシューがあっても1回で1タスクのみ実行。

#### タスク種別の識別

| 種別 | 識別条件 | 処理 |
|---|---|---|
| `e2e_test_creation` | 「E2Eテストスイート作成」または task_type: e2e_test_creation | xp_E2Etest <親ストーリー番号> |
| `spec_update` | 「機能仕様書更新」または task_type: spec_update | xp_doc_spec <epic> <親ストーリー番号> |
| `bug_reproduction_test` | 「バグ再現テスト追加」または task_type: bug_reproduction_test | xp_Tester <task_issue> |
| 通常実装タスク | 上記以外 | xp_Tester + xp_Implementer + xp_Auditor + xp_Documenter |

#### 通常実装タスクの実行ステップ

```
a. depends_on ブロックなしのサブイシューを特定
b. 最初の1件のみ選択（並列実行しない）
c. タスク種別を識別して対応フローを実行
d. PR発行完了 → 必ず停止（AllGREEN判定の有無に関わらず、本ランではこれ以上の処理を行わない）
```

### AllGREEN → xp_Auditor Story-level 委譲フロー（別ランとして実行される）

AllGREEN チェックは**今回の `/xp_Director` ランでは実行しない**。
次回の `/ProcessIssue` 実行時、親 Story/Bug イシューを評価する段階
（ProcessIssue 2-2-C「Architect済みStoryチェック」）で検知される：

1. 全サブイシューのコメントに `[Auditor GREEN]` があれば **AllGREEN**
2. AllGREEN の場合、ProcessIssue が `xp_Director <親イシュー番号>` を**別ランとして**呼び出し、以下を実行する：
   - `xp_Auditor test <epic> <親ストーリー番号>` に委譲する（Story-level 品質ゲート）
   - xp_Auditor が受け入れテスト（E2E テスト）・xp_Reviewer 呼び出しを実行する
   - **spec_update タスクの完了確認（AllGREEN前提条件）：**
     - サブイシュー一覧から `task_type: spec_update` または「機能仕様書更新」タイトルのタスクを特定する
     - 該当タスクが存在し `[Auditor GREEN]` がない場合：AllGREEN 不成立とみなし PR を発行せず停止する。親イシューに以下を記録する：
       ```
       ⚠️ spec_update タスク (#<spec_update_issue番号>) が未完了のため AllGREEN 判定を見送ります。
       /xp_Director <spec_update_issue番号> で先に処理してください。
       ```
     - 該当タスクが存在しない、または `[Auditor GREEN]` 済みの場合のみ次へ進む
   - 受け入れテスト GREEN かつ spec_update 完了済みの場合：親ブランチ（feature/issue-{番号}）→ main の PR を発行し、ストーリーイシューをクローズする。発行後に `[親ブランチ PR 発行済み]` コメントを記録する
   - 受け入れテスト失敗時：失敗内容で新サブイシューを起票しストーリーは継続する
3. 未完了サブイシューがある場合 → そのまま停止

---

## depends_on 解消判断

- 依存先イシュー番号は `## 依存関係` セクションから抽出する。`depends_on: #123` のような明示的フィールドと、「このタスクは #123 の完了後に着手すること」のような自然文中の `#<番号>` 参照の両方を対象とする（`depends_on:` フィールドが無い旧形式のイシューでも、セクション内の `#<数字>` をすべて依存先として扱う）
- GitHub の close 状態は見ない
- 依存先サブイシューのコメントに `[Auditor GREEN]` があればブロック解除
- ブロック解除されても1回のランでは即時実行しない（次回呼び出しで着手）

---

## ステージコメント

各ステージの開始・完了時にサブイシューへ記録する：

```
[Tester実行中] / [Tester完了]
[Implementer実行中] / [Implementer完了]
[Auditor テスト実行中] / [Auditor GREEN]
[Documenter実行中] / [Documenter完了]
[Auditor ドキュメントチェック中]
[PR発行済み #xx]
[親ブランチ PR 発行済み] #xx  ← AllGREEN 後の feature→main PR 発行時
```

**ワークログ（必須）：**

**親 Bug/Story イシューへの記録（Architect 完了後）:**
Architect 完了・親ブランチ作成後、親 Bug/Story イシューへ記録する:
```
作業開始 YYYY-MM-DD HH:MM JST
セッションURL: https://claude.ai/code/session_XXXXXXXX
[ProjectStatus: InProgress]
```

**サブタスクイシューへの記録（タスク着手時）:**
各サブタスク着手時（xp_Tester 開始前）に以下を1コメントに統合して記録する:
```
作業開始 YYYY-MM-DD HH:MM JST
セッションURL: https://claude.ai/code/session_XXXXXXXX
[ProjectStatus: InProgress]
```

**AllGREEN 完了後に親イシューへ記録する:**
```
作業完了 YYYY-MM-DD HH:MM JST / 所要時間: XX分
```


## 作業時間タイムゾーン

新規の作業時間コメントは、日本時間の日時に `JST` サフィックスを必ず付ける。
JST明記のない過去コメントは後方互換のため UTCとして解釈する。
`xp_worklog` は `JST` 付き時刻をJST、`JST` なし時刻をUTCに正規化してから所要時間を計算する。

---

## 注意事項

- コードファイルへの書き込みは行わない
- 差し戻しは最大3回。超えた場合はエスカレーション停止

---

## 変更履歴

| 日付 | バージョン | 変更内容 | Issue |
|---|---|---|---|
| 2026-06-21 | 1.1.0 | `[Task]` スキップ前の観測可能変更チェック（軽量ゲート）を追加。AllGREEN前提条件に spec_update タスクの完了確認ゲートを追加 | #1557, #1566, #1567 |
| 2026-07-15 | 1.2.0 | 作業時間コメントをJST明示に統一し、JST明記のない過去コメントをUTCとして扱う後方互換ルールを追加 | #2080 |
