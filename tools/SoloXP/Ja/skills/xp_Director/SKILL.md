---
model: claude-sonnet-4-6
---

# XP Director Skill

## コマンド

### `xp_Director <issue_number> [implementer=codex]`

責任者・司令塔として、全スキルの実行順序・タイミングを制御する。
**コードは触らない。判断と進行管理に徹する。**

`implementer=codex` を付けた場合、通常実装タスクの**テスト作成（Tester相当）・実装（Implementer相当）・
ドキュメント更新（Documenter相当のうちローカル完結分）**をCodex CLI委任に切り替える
（`xp_Tester`→省略、`xp_Implementer`→`xp_ImplementerCodex`、`xp_Documenter`→`xp_DocumenterCodex`）。
省略時は従来通りすべてClaudeが行う（デフォルト動作は無変更）。

**Claudeが握る境界（`implementer=codex`指定時も不変）**:
- `xp_Architect`（設計・分解）
- `xp_E2Etest`（E2Eテスト作成＝受け入れ条件の定義）
- Story-levelの受け入れ判定（`xp_Auditor test` のStory-levelフェーズ、E2E結果でのGREEN/RED判定）
- タスクレベルの `xp_Auditor test` / `xp_Auditor doc`（独立検証・軽量だがCodexへの唯一の第三者チェックとして必須）
- `xp_Reviewer`・main向けPR発行判断

`e2e_test_creation`（テスト著者性）と `spec_update`（GitHub API依存）タスクはこのフラグの影響を受けない。
`bug_reproduction_test`（バグ再現テスト作成）も明示的にClaude側に残す（Tester委譲の対象外）。
詳細は「3. 実行フロー」を参照。

### `xp_Director`（引数なし）／ `xp_Director implementer=codex`

直ちに `/ProcessIssue` に処理を委譲する。`implementer=codex` が指定されていた場合はそのフラグを
`/ProcessIssue` にもそのまま引き渡す（ProcessIssueがSolo XPへ振り分ける際に `xp_Director <issue番号> implementer=codex` の形で再委譲する）。

---

## 責務

- 全スキルの実行順序・タイミング制御
- depends_on解消チェック（次回実行時のブロック確認）
- サブイシューへのステージコメント書き込み
- RED時の差し戻し判断・イテレーション上限管理（3回）
- 1タスク完了・PR発行後の停止

---

## 処理フロー

### 引数なしの場合

直ちに `/ProcessIssue` に処理を委譲して停止する。
イシュー選択・振り分けロジックは ProcessIssue が担当する。

---

### 1. Issue内容を読む

GitHub Issue の内容を取得する（Claude Code Web: `gh` コマンド、その他: MCP経由）。

### 2. Architect への委譲判断

#### 2-0. 分解済みゲート（必須・最優先）

Architect への委譲判断に入る前に、イシューのコメント全件を取得し `[親ブランチ作成済み]` マーカーの有無を確認する。
タイトルの種別（`[Story]` / `[Task]` / `[Bug]` / タグなし）に関わらず必ず実施する
（`[Task]` イシューでも観測可能変更ゲート経由で Architect 分解される場合があるため。#1337 の二重発行事故の再発防止）。

**判定基準はこのマーカーのみとする。サブイシューの有無は判定に使わない**
（関連タスクを手動でサブイシューに紐付ける運用があるため、「サブイシューが存在する＝分解済み」は誤判定になる）。

**マーカーが ある 場合（Architect分解済み）:**

1. `xp_Architect` を呼ばない（再分解の禁止。再分解・タスク追加はユーザーの明示指示がある場合のみ Architect に委譲する）
2. サブイシュー一覧を取得し（`mcp__github__issue_read` method: `get_sub_issues`）、各サブイシューのコメントの `[Auditor GREEN]` 有無で進捗を把握する
3. 未完了のサブイシューが残っている場合: 親イシューに進捗と次アクションをコメントして停止する:
   ```
   [分解済み] 本イシューは Architect 分解済みのため再分解しません。
   完了: #<番号>, ... / 残り: #<番号>, ...
   次: /xp_Director <次に着手可能なサブタスク番号> を実行してください。
   ```
4. 全サブイシューが完了済みの場合: 手順3-e の AllGREEN フローへ進む

**マーカーが ない 場合:** 従来通り以下の委譲判断へ進む。

#### 2-1. [Task] イシューの観測可能変更チェック

タイトルに `[Task]` と記載されている場合は、Architect を完全バイパスする前に **観測可能変更チェック**（軽量ゲート）を通す：

1. イシュー本文・タイトルを読み、「ユーザー/外部から観測可能な振る舞いの変更を伴うか」を判定する
   - 例: SKILL.md・ドキュメント記述のみの変更、設定値変更のみ、内部リファクタのみ → **なし**
   - 例: API/エンドポイントの追加・変更、UIの追加・変更、出力内容の変化を伴う実装 → **あり**
2. 判定結果をイシューにコメントとして記録する：
   ```
   ## 観測可能変更チェック（[Task]スキップ判定）

   対象: #<issue_number>
   観測可能な振る舞いの変更: あり / なし
   理由: <判断理由>
   ```
3. 判定が **なし** の場合: Architect をスキップしてそのまま実行フロー（3.）へ進む。
4. 判定が **あり** の場合: Architect をスキップせず `xp_Architect <issue_number>` を呼ぶ。
   → Architect が 1-1（Task イシューの E2E/spec 要否判定）を実施し、必要な E2E/spec サブタスクを発行する。

`[Task]` 以外（`[Story]`、`[Bug]`、タグなし）は上記ゲートを行わず必ず `xp_Architect <issue_number>` を呼ぶ。  
→ Architect がイシューを **Story / Task / Bug** に分類し、実行計画（サブイシュー一覧）を返してくる。

**Architect 完了後（Story/Bug の場合）:**

1. `feature/issue-{番号}` ブランチがリモートに存在するか確認する:
   ```bash
   git fetch origin feature/issue-{番号} 2>/dev/null && echo "exists" || echo "not found"
   ```
2. 存在しない場合は作成・push する:
   ```bash
   git checkout -b feature/issue-{番号}
   git push -u origin feature/issue-{番号}
   ```
   既に存在する場合はスキップする（ClaudeCode Web では main から自動生成されたブランチを即リネームする）。
3. 親 Bug/Story イシューへ作業開始を記録する:
   ```
   作業開始 YYYY-MM-DD HH:MM JST
   セッションURL: https://claude.ai/code/session_XXXXXXXX
   [ProjectStatus: InProgress]
   ```
4. イシューにコメントを記録する:
   ```
   [親ブランチ作成済み] feature/issue-{番号}
   次回のセッションで /xp_Director <最初のサブタスク番号> を実行してください。
   ```
5. **Architect 完了後、親ブランチを作成して停止する（サブイシューは次セッションで処理する）。**

### 3. 実行フロー（タスクイシューの場合）

**【1タスク1PRルール】**
Architect が複数のサブイシューを発行した場合も、**1回のランでは最初の1タスクのみ実行する。**
1タスク完了・PR発行後は必ず停止し、次のタスクは次回の `/xp_Director` 呼び出しで着手する。

**タスク種別の識別:**
各サブイシューのタイトルと本文中の `task_type:` 記載を確認し、以下のいずれかに分類する：

| タスク種別 | 識別条件 | 処理方法 |
|---|---|---|
| `e2e_test_creation` | タイトルに「E2Eテストスイート作成」 または task_type: e2e_test_creation | `xp_E2Etest <親ストーリー番号>` を呼ぶ（タスク番号ではなく親ストーリー番号を渡す、常にClaude）。続くドキュメント化（`xp_doc_E2ETests`）は `implementer=codex` 指定時 `xp_DocumenterCodex` に差し替え |
| `spec_update` | タイトルに「機能仕様書更新」 または task_type: spec_update | `xp_doc_spec <epic> <親ストーリー番号>` を呼ぶ。実装・テストは行わない（GitHub API依存のため常にClaude、`implementer=codex`の影響を受けない） |
| `bug_reproduction_test` | タイトルに「バグ再現テスト追加」 または task_type: bug_reproduction_test | `xp_Tester <task_issue>` を呼ぶ（常にClaude、`implementer=codex`の影響を受けない）。続くドキュメント化は `implementer=codex` 指定時 `xp_DocumenterCodex` に差し替え |
| 通常実装タスク | 上記以外 | `implementer=codex` 指定時: `xp_Tester` を省略し `xp_ImplementerCodex`（テスト作成＋実装）→ `xp_Auditor test` → `xp_DocumenterCodex` → `xp_Auditor doc`。省略時: 従来フロー（xp_Tester + xp_Implementer + xp_Auditor + xp_Documenter + xp_Auditor doc、すべてClaude） |

**サブTask 前処理（xp_Tester 開始前）:**

1. イシュー本文の `## 依存関係` セクションから依存先イシュー番号をすべて抽出し、`[Auditor GREEN]` コメントがあるか確認する（GitHubのclose状態は見ない）
   - 抽出対象は `depends_on: #123` のような明示的フィールドと、「このタスクは #123 の完了後に着手すること」のような自然文中の `#<番号>` 参照の両方。`depends_on:` フィールドが無い旧形式のイシューでも、セクション内の `#<数字>` をすべて依存先として扱う
   - 「なし（即着手可能）」の場合は依存なしとする
   - `[Auditor GREEN]` があるだけでは解消と見なさない。サブタスクPRはユーザーがマージするため（自動マージしない）、依存先イシューに紐づく `--base feature/issue-{親番号}` のPRが実際に `merged` 状態であることも確認する：
     ```bash
     gh pr list --search "#<依存先番号>" --base feature/issue-{親番号} --state merged --json number,mergedAt
     ```
     1件もヒットしない場合（PRがまだユーザーにマージされていない）は未解消として扱う
2. イシュー本文の「## 親ブランチ」セクションから `feature/issue-{親番号}` を取得する
3. リモートに親ブランチが存在するか確認する:
   ```bash
   git fetch origin feature/issue-{親番号} 2>/dev/null && echo "exists" || echo "not found"
   ```
4. 存在する場合: 現ブランチを親ブランチにリベースする:
   ```bash
   git rebase origin/feature/issue-{親番号}
   ```
5. PR 発行時に `--base feature/issue-{親番号}` を指定する

**depends_on が未解消の場合（いずれかの依存先に `[Auditor GREEN]` がない、または対応PRが未マージの場合）:**
- 着手せず、イシューにコメントして停止する:
  ```
  ⚠️ depends_on 先 #<依存先番号> が未解消のため着手しません。
  [Auditor GREEN] がない場合: 先に #<依存先番号> を /xp_Director <依存先番号> で処理してください。
  [Auditor GREEN] 済みだが対応PRが未マージの場合: オーナーによるPRマージ待ちです。マージ後に再実行してください。
  ```

**親ブランチが存在しない場合:**
- イシューにコメントして停止する:
  ```
  ⚠️ 親ブランチ feature/issue-{親番号} が見つかりません。
  先に親Story (#親番号) を /xp_Director {親番号} で処理してください。
  ```

```
a. depends_on ブロックなしのサブイシューを特定
b. 最初の1件のみを今回の実行対象として選択する（並列実行は行わない）
c. 選択したサブイシューのタスク種別を識別する

   【e2e_test_creation タスクの場合】（E2E作成は常にClaude、ドキュメント化のみimplementer=codexで切替）
   i.   イシューの本文から親ストーリー番号を取得する
   ii.  xp_E2Etest <親ストーリーイシュー番号>  ← タスク番号ではなく親番号を渡す（常にClaude、受け入れ条件の著者性のため）
   iii. xp_Auditor test <epic> <task_issue>
        - GREEN → [Auditor GREEN] コメント
   iv.  xp_doc_E2ETests <epic>（`implementer=codex` 指定時は `xp_DocumenterCodex <epic> <task_issue>` に差し替え）
   v.   xp_Auditor doc <epic> <task_issue>
        - OK → PR発行（E2Eテストファイル + E2Eテストドキュメントのコミット）
   → 停止

   【spec_update タスクの場合】（GitHub API依存のため implementer=codex の影響を受けない）
   i.   イシューの本文から親ストーリー番号を取得する
   ii.  xp_doc_spec <epic> <親ストーリーイシュー番号>
   iii. xp_Auditor doc <epic> <task_issue>
        - OK → PR発行
   → 停止

   【bug_reproduction_test タスクの場合】（バグ再現テスト作成は常にClaude、ドキュメント化のみ切替）
   i.   xp_Tester <task_issue>（常にClaude。Testerが「Implementer不要」と判断できる特殊処理を行う）
   ii.  xp_Auditor test <epic> <task_issue>
        - GREEN → [Auditor GREEN] コメントが書き込まれる
   iii. xp_Documenter <epic> <task_issue>（`implementer=codex` 指定時は `xp_DocumenterCodex <epic> <task_issue>` に差し替え）
   iv.  xp_Auditor doc <epic> <task_issue>
        - OK → xp_Director が PR発行（base設定・Closes記載は下記【通常実装タスク】と同様）

   【通常実装タスクの場合】
   `implementer=codex` 未指定（デフォルト）:
   i.   xp_Tester <task_issue>
   ii.  xp_Implementer <task_issue>
   iii. xp_Auditor test <epic> <task_issue>
        - RED（同一タスクスコープ） → xp_Implementer に差し戻し（最大3回）
        - RED（別タスクスコープのバグ）→ Auditor が新規バグイシューを発行済み → 通常の優先度付きキューで次ループへ
        - 3回超えたらエスカレーション停止・イシューにコメントして終了
        - GREEN → [Auditor GREEN] コメントが書き込まれる
   iv.  xp_Documenter <epic> <task_issue>
   v.   xp_Auditor doc <epic> <task_issue>

   `implementer=codex` 指定時（xp_Testerは呼ばない。xp_ImplementerCodexがテスト作成も内包する）:
   i.   xp_ImplementerCodex <task_issue>
        （既存テストがあれば実装のみ、なければテスト作成＋実装。詳細はxp_ImplementerCodex SKILL.md参照）
   ii.  xp_Auditor test <epic> <task_issue>
        - RED（同一タスクスコープ） → xp_ImplementerCodex に差し戻し（最大3回）
        - RED（別タスクスコープのバグ）→ Auditor が新規バグイシューを発行済み → 通常の優先度付きキューで次ループへ
        - 3回超えたらエスカレーション停止・イシューにコメントして終了
        - GREEN → [Auditor GREEN] コメントが書き込まれる
   iii. xp_DocumenterCodex <epic> <task_issue>
   iv.  xp_Auditor doc <epic> <task_issue>

   いずれの場合も、xp_Auditor doc が OK → xp_Director が PR発行:
        PR 発行時にブランチ base を適切に設定する：
        - 親Story の feature ブランチがある場合: `--base feature/issue-{親番号}`
        - ない場合（ルートタスク）: `--base main`
        PR 本文に `Closes #<issue番号>` を含めること

d. PR発行完了後、以下を順番に実行してから必ず停止する：

   1. タスクイシューを明示的にクローズする（PR が親ブランチに向くため GitHub 自動クローズが効かない）：
   ```bash
   gh issue close <task_issue>
   ```

   2. ステージコメントを記録する：
   ```
   [ProjectStatus: Done]
   ```

   3. **ここで必ず停止する。** 残サブイシューの有無・AllGREEN判定の有無に関わらず、
      本ラン（今回の `/xp_Director` 呼び出し）ではこれ以上の処理を行わない。
      下記 e. を続けて実行してはならない。

e.【参考・このランでは実行しない】AllGREENフローについて

   下記は「次回いつ・誰が AllGREEN を検知して親ブランチ PR を出すか」の説明であり、
   **今回のラン（step d で停止した直後）には適用されない。**

   AllGREEN は次回の `/ProcessIssue` 実行時、親 Story/Bug イシューを評価する段階
   （ProcessIssue 2-2-C「Architect済みイシューチェック」）で検知される。
   そこから `xp_Director <親イシュー番号>` が**別ランとして**呼び出されたときに、
   以下のフローを実行する：
   1. `xp_Auditor test <epic> <親ストーリー番号>` を呼ぶ（Story-level 受け入れテスト）
      - GREEN → `[Auditor GREEN]` コメントが書き込まれる（xp_Auditor の責務はここまで）
   2. **Story-level Auditor GREEN を確認したら、xp_Director が `xp_Reviewer <epic> <親ストーリー番号>` を呼ぶ**（コードレビュー。高リスク指摘があれば改善勧告イシューを自動起票する）
   3. `xp_Auditor doc <epic> <親ストーリー番号>` を呼ぶ（ドキュメントチェック）
   4. `xp_RunE2ETests` で E2E テストスイートを確認する
   5. **spec_update タスクの完了確認（AllGREEN前提条件）：**
      - サブイシュー一覧から `task_type: spec_update` または「機能仕様書更新」タイトルのタスクを特定する
      - spec_update タスクは `xp_doc_spec` → `xp_Auditor doc` のみを通過し、完了マーカーは `[Auditor doc OK]`（`[Auditor GREEN]` は出力されない）
      - 該当タスクが存在し、コメントに `[Auditor doc OK]` がない場合：AllGREEN 不成立とみなし PR を発行せず停止する。親イシューに以下を記録する：
        ```
        ⚠️ spec_update タスク (#<spec_update_issue番号>) が未完了のため AllGREEN 判定を見送ります。
        /xp_Director <spec_update_issue番号> で先に処理してください。
        ```
      - 該当タスクが存在しない、または `[Auditor doc OK]` 済みの場合のみ次へ進む
   6. **全サブタスクPRのマージ確認（AllGREEN前提条件）：** サブタスクPR（`--base feature/issue-{親番号}`）はユーザーがマージするため（自動マージしない）、
      `[Auditor GREEN]` / `[Auditor doc OK]` が揃っていてもPRが実際にマージ済みとは限らない。マージされていないサブタスクPRが
      親ブランチにマージされないまま先へ進むと、次で作る main 向けPRに一部のサブタスクの変更が含まれない事故になるため必ず確認する。
      `--state open` の有無だけでは「マージせずcloseされたPR」を見逃す（open が 0 件でも merged とは限らない）ため、
      完了済みサブイシューそれぞれについて、対応する `merged` PR の存在を個別に確認する：
      ```bash
      gh pr list --search "#<サブイシュー番号>" --base feature/issue-{親番号} --state merged --json number,mergedAt
      ```
      - 完了済みサブイシューのうち1件でも対応する `merged` PR が見つからない場合（未マージのままopen、または
        マージされずcloseされた場合の両方を含む）は AllGREEN 不成立とみなし PR を発行せず停止する。親イシューに以下を記録する：
        ```
        ⚠️ サブタスク #<サブイシュー番号> に対応する merged PR が見つからないため AllGREEN 判定を見送ります。
        オーナーによるPRマージ（closeされている場合は再オープン＋マージ）後、再度 /xp_Director <親イシュー番号> を実行してください。
        ```
      - 全完了済みサブイシューに対応する merged PR が確認できた場合のみ次へ進む
   7. 受け入れテスト GREEN・xp_Reviewer 完了・spec_update 完了済み・全サブタスクPRマージ済みの場合：親ブランチ → main の PR を発行する：
      ```bash
      gh pr create --base main --head feature/issue-{親番号} --title "..." --body "Closes #<親番号>"
      ```
      発行後に以下を親イシューに記録し、ストーリーイシューをクローズする:
      - `[親ブランチ PR 発行済み]`
      - `作業完了 YYYY-MM-DD HH:MM JST / 所要時間: XX分`（最初のサブタスク着手から現在まで）
   → 受け入れテスト（E2E）失敗時：xp_Auditor が失敗内容で新サブイシューを起票し、ストーリーは継続する
   → xp_Director はここで停止する（Auditor が以降の制御を担当する）
```

### 4. ステージコメントの書き込み

各ステージの開始・完了時にサブイシューへコメントを記録する：

```
[Tester実行中]
[Tester完了]
[Implementer実行中]
[Implementer完了]
[Auditor テスト実行中]
[Auditor GREEN]
[Documenter実行中]
[Documenter完了]
[Auditor ドキュメントチェック中]
[PR発行済み #xx]
[ProjectStatus: InProgress]  ← 着手時
[ProjectStatus: Done]        ← 完了時
```

**ワークログコメント（必須）：**

タスク着手時（xp_Tester 開始前）に記録する：
```
作業開始 YYYY-MM-DD HH:MM JST
セッションURL: https://claude.ai/code/session_XXXXXXXX
[ProjectStatus: InProgress]
```

[Auditor GREEN] 確認後に記録する：
```
作業完了 YYYY-MM-DD HH:MM JST / 所要時間: XX分
```

所要時間は `作業開始` から `[Auditor GREEN]` までの実時間（分）を記録する。
JST明記のない過去の作業時間コメントはUTCとして解釈する。新規コメントでは必ず `JST` を付ける。

### 5. depends_on 解消判断

- GitHub の close 状態は見ない
- **依存先サブイシューのコメントに `[Auditor GREEN]` があればブロック解除**
- ブロック解除されたサブイシューは次回の `/xp_Director` 呼び出し時に実行対象となる
- 1回のランでは1タスクのみ実行するため、ブロック解除されても即時実行しない

---

## GitHub アクセス方法

| 環境 | アクセス方法 |
|---|---|
| Claude Code Web | `gh` コマンド |
| claude.ai / その他 | MCP経由 |

環境を検出して自動切り替えする。

**⚠️ gh CLI の制約:** `gh issue view --json subIssues` は未対応。
サブイシュー取得は環境問わず `mcp__github__issue_read`（method: `get_sub_issues`）を使用すること。

---

## 注意事項

- コードファイルへの書き込みは行わない
- 判断できない競合・エラーはイシューにコメントして停止する
- 差し戻しは最大3回。超えた場合はユーザーにエスカレーション
