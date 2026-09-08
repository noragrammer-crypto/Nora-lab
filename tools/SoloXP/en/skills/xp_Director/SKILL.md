---
model: claude-sonnet-4-6
---

# XP Director Skill

## Command

### `xp_Director <issue_number> [implementer=codex]`

As the person in charge and control tower, control the execution order and timing of all skills.
**Do not touch the cord. Focus on judgment and progress management. **

When `implementer=codex` is added, normal implementation tasks such as **Test creation (equivalent to Tester), implementation (equivalent to Implementer),
Switch document updates (local completion equivalent to Documenter)** to Codex CLI delegation
(`xp_Tester` → omitted, `xp_Implementer` → `xp_ImplementerCodex`, `xp_Documenter` → `xp_DocumenterCodex`).
If omitted, Claude will do everything as before (default behavior remains unchanged).

**Boundary held by Claude (unchanged even when `implementer=codex` is specified)**:
- `xp_Architect` (design/disassembly)
- `xp_E2Etest` (E2E test creation = definition of acceptance conditions)
- Story-level acceptance judgment (Story-level phase of `xp_Auditor test`, GREEN/RED judgment in E2E results)
- Task-level `xp_Auditor test` / `xp_Auditor doc` (independent verification/lightweight but required as the only third-party check to the Codex)
- Decision to issue PR for `xp_Reviewer`・`xp_SecurityReviewer`・main

`e2e_test_creation` (test authorship) and `spec_update` (GitHub API dependent) tasks are not affected by this flag.
`bug_reproduction_test` (bug reproduction test creation) is also explicitly left on Claude's side (not subject to Tester delegation).
For details, see "3. Execution Flow".

### `xp_Director` (no argument) / `xp_Director implementer=codex`

Immediately delegate processing to `/ProcessIssue`. If `implementer=codex` is specified, that flag is
It is also handed over as is to `/ProcessIssue` (when ProcessIssue distributes it to Solo XP, it is re-delegated in the form of `xp_Director <issue番号> implementer=codex`).

---

## Responsibilities

- Execution order and timing control of all skills
- depends_on resolution check (block confirmation at next execution)
- Write stage comments to sub-issues
- Remand judgment and iteration upper limit management during RED (3 times)
- Stop after completing 1 task and issuing PR

---

## Processing flow

### Without arguments

Immediately delegate the process to `/ProcessIssue` and stop.
ProcessIssue is in charge of issue selection and distribution logic.

---

### 1. Read the issue content

Get the contents of a GitHub issue (Claude Code Web: via MCP (`gh` CLI cannot be used), other (local, etc.): `gh` command priority, MCP fallback in case of failure. For details, see the "GitHub access method" section below).

### 2. Decision to delegate to Architect

#### 2-0. Disassembled gate (required/top priority)

Before deciding to delegate to Architect, get all the comments on the issue and use the `[親ブランチ作成済み]` marker.
Or check whether there is a `## 実行計画` comment that includes "Judgment: Single Task" (for single task judgment,`[親ブランチ作成済み]` is not written because the design does not create a parent branch. If you overlook this second condition,
When the execution of a single task is restarted after being stopped before issuing a PR, it passes through the gate and causes `xp_Architect`.
I'll call you again).
Must be performed regardless of title type (`[Story]` / `[Task]` / `[Bug]` / No tag)
(Because `[Task]` issues may also be disassembled into Architect via the observable change gate. Preventing the double publication accident of #1337 from happening again).

**These two markers are the only criteria for judgment. The presence or absence of sub-issues is not used for judgment**
(As related tasks are manually linked to sub-issues, ``sub-issue exists = disassembled'' is a false positive.)

**If there is a marker (Architect exploded):**

0. If `## 実行計画` in the comment is "Determination: Single task": Do not call `xp_Architect`. Subissues are not checked using `get_sub_issues` (subissues do not exist). Make this issue itself a task issue and restart from step 2 of "After Architect completion (for Story/Bug)" branch A in "2. Delegation decision to Architect".
1. Do not call `xp_Architect` (re-disassembly is prohibited. Re-disassembly and task addition are delegated to Architect only when explicitly instructed by the user)
2. Obtain a list of sub-issues (`mcp__github__issue_read` method: `get_sub_issues`), determine the completion of each sub-issue, and understand the progress.
   Normal tasks are `[Auditor GREEN]`, `spec_update` tasks (with "Functional specification update" in the title or `task_type: spec_update` in the body)
   Determine based on the presence or absence of `[Auditor doc OK]` (`spec_update` task only checks `xp_issue2md` → `xp_doc_spec` → `xp_Auditor doc`
   Because `[Auditor GREEN]` is not outputted structurally. #1831: If this is determined only by `[Auditor GREEN]`, the implementation task will be
   All GREEN stories with spec_update `[Auditor doc OK]` are incorrectly judged as "remaining sub-issues" and proceed to AllGREEN flow in step 3-e.
   Cannot proceed and `/xp_Director` keeps stopping)
3. If there are any unfinished sub-issues left: Comment your progress and next actions on the parent issue and stop:
   ```
   [分解済み] 本イシューは Architect 分解済みのため再分解しません。
   完了: #<番号>, ... / 残り: #<番号>, ...
   次: /xp_Director <次に着手可能なサブタスク番号> を実行してください。
   ```
4. If all sub-issues have been completed: Proceed to step 3-e, AllGREEN flow

**If there is no marker:** Proceed to the following delegation decision as before.

#### 2-1. [Task] Check observable changes in issue

If the title says `[Task]`, pass the **observable change check** (lightweight gate) before bypassing Architect completely:

1. Read the issue text/title and determine whether it involves changes in behavior that are observable from the user/external side.
   - Example: Change only SKILL.md/document description, change only setting values, only internal refactor → **None**
   - Example: Implementation involving addition/change of API/endpoint, addition/change of UI, change of output content → **Yes**
2. Record the judgment result as a comment on the issue:
   ```
   ## 観測可能変更チェック（[Task]スキップ判定）

   対象: #<issue_number>
   観測可能な振る舞いの変更: あり / なし
   理由: <判断理由>
   ```
3. If the judgment is **None**: Skip Architect and proceed directly to the execution flow (3.).
4. If the judgment is **Yes**: Call `xp_Architect <issue_number>` without skipping Architect.
   → Architect executes 1-1 (determining whether E2E/spec is necessary for a task issue) and issues the necessary E2E/spec subtask.

Other than `[Task]` (`[Story]`, `[Bug]`, no tag), the above gate is not performed and `xp_Architect <issue_number>` is always called.
→ Architect categorizes issues into **Story / Task / Bug** and returns an execution plan (list of sub-issues).

**After Architect completion (for Story/Bug):**

Check Architect's execution plan report (`## 実行計画`) and branch depending on the presence or absence of "Judgment: Single task".

**A. In case of single task judgment (no sub-issue/no parent branch):**

1. Record the start of work to the parent issue (timestamp is obtained mechanically with `workflow/scripts/get-jst-timestamp.js`, see section 4):
   ```
   作業開始 <YYYY-MM-DDTHH:mm:ss+09:00>
   セッションURL: https://claude.ai/code/session_XXXXXXXX
   [ProjectStatus: InProgress]
   ```
2. Do not create a parent branch. Proceed to "3. Execution Flow" with the current session branch and continue processing within the same run using the parent issue number itself as the task issue (the 1 task 1 PR rule targets only one issue, so you can continue without stopping here).
3. The depends_on resolution check and parent branch check (SubTask preprocessing 1 to 5) in "3. Execution flow" are not performed (not applicable). When issuing a PR, specify `--base main` and include `Closes #<親イシュー番号>` in the PR body.
4. If it stops before issuing a PR for some reason (such as exceeding the RED revert limit), the next time `/xp_Director <同じ番号>` is called, it will detect the `## 実行計画` comment of "Judgment: Single task" in step 2-0, and restart from this branch (A) without checking the subissue with `get_sub_issues`.

**B. For normal sub-issue decomposition (total of 2 or more issues):**

1. Check if the `feature/issue-{番号}` branch exists remotely:
   ```bash
   git fetch origin feature/issue-{番号} 2>/dev/null && echo "exists" || echo "not found"
   ```
2. Create and push if it doesn't exist:
   ```bash
   git checkout -b feature/issue-{番号}
   git push -u origin feature/issue-{番号}
   ```
   If it already exists, skip it (ClaudeCode Web immediately renames the automatically generated branch from main).

   **⚠️ Important (Handling of session auto-generated branch used as parent branch, #3626)**:
   When I renamed ClaudeCode Web's session automatic generation branch to `feature/issue-{番号}` and pushed it,
   The branch name will be "For parent branch only." After that, you can directly implement tasks on that branch (`xp_Tester`
   / `xp_Implementer` etc.) (This will be a direct commit to the parent branch, and it will be a direct commit to the parent branch.
   The operation of reviewing and merging breaks down. Accident that actually occurred in #3621). Originally, it was here in step 5.
   It will stop and the subtask will be processed in the next session (new auto-generated branch). Same for some reason
   Even if you proceed to subtask processing within a session, be sure to cut a new branch that is separate from the parent branch.
   (See also **⚠️ IMPORTANT** in the Sub-Task Preprocessing section).
   If the session automatically generated branch name before renaming remains on the remote, you can delete it on GitHub.
   (CLAUDE.md "Branch deletion rules" — don't leave branches without merges).3. Record the start of work on the parent Bug/Story issue (timestamp is obtained mechanically with `workflow/scripts/get-jst-timestamp.js`, see section 4):
   ```
   作業開始 <YYYY-MM-DDTHH:mm:ss+09:00>
   セッションURL: https://claude.ai/code/session_XXXXXXXX
   [ProjectStatus: InProgress]
   ```
4. Log a comment on the issue:
   ```
   [親ブランチ作成済み] feature/issue-{番号}
   次回のセッションで /xp_Director <最初のサブタスク番号> を実行してください。
   ```
5. After **Architect completes, create the parent branch and stop it (sub-issues will be processed in the next session). **

### 3. Execution flow (for task issue)

**[1 task 1 PR rule]**
Even if Architect publishes multiple sub-issues, only the first task will be executed in one run. **
After completing one task and issuing a PR, it will always stop, and the next task will start at the next call to `/xp_Director`.

**Identification of task type:**
Check the title of each sub-issue and the `task_type:` description in the main text, and classify it into one of the following:

| Task type | Identification conditions | Processing method |
|---|---|---|
| `e2e_test_creation` | Title: "E2E test suite creation" or task_type: e2e_test_creation | Call `xp_E2Etest <親ストーリー番号>` (pass parent story number, not task number, always Claude). The following documentation (`xp_doc_E2ETests`) is replaced with `xp_DocumenterCodex` when `implementer=codex` is specified |
| `spec_update` | Title: "Functional specification update" or task_type: spec_update | Call in the order of `xp_issue2md <task_issue>` → `xp_doc_spec <epic> <親ストーリー番号>`. Not implemented or tested (always unaffected by Claude, `implementer=codex` as it depends on GitHub API) |
| `bug_reproduction_test` | Title: "Add bug reproduction test" or task_type: bug_reproduction_test | Call `xp_Tester <task_issue>` (always unaffected by Claude, `implementer=codex`). In the subsequent documentation, when `implementer=codex` is specified, replace it with `xp_DocumenterCodex` |
| Normal implementation task | Other than the above | When `implementer=codex` is specified: `xp_Tester` is omitted and `xp_ImplementerCodex` (test creation + implementation) → `xp_Auditor test` → `xp_DocumenterCodex` → `xp_Auditor doc`. If omitted: Traditional flow (xp_Tester + xp_Implementer + xp_Auditor + xp_Documenter + xp_Auditor doc, all Claude) |

**Sub-Task preprocessing (before starting xp_Tester):**

1. Extract all dependent issue numbers from the `## 依存関係` section of the issue body and check if there is a `[Auditor GREEN]` comment (do not check the closed status on GitHub)
   - Extracts both explicit fields such as `depends_on: #123` and references to `#<番号>` in natural sentences such as ``Start this task after #123 is completed.'' Even in old-style issues without the `depends_on:` field, all `#<数字>` in the section are treated as dependencies.
   - If "None (ready to start)", there is no dependence- Just having `[Auditor GREEN]` is not considered resolved. Since subtask PRs are merged by the user (they are not automatically merged), also check that the `--base feature/issue-{親番号}` PR associated with the dependent issue is actually in the `merged` state:
     ```bash
     gh pr list --search "#<依存先番号>" --base feature/issue-{親番号} --state merged --json number,mergedAt
     ```
     If `gh` cannot be used (such as ClaudeCodeWeb), use `mcp__github__search_pull_requests`
     Fallback to (query: `repo:<owner>/<repo> base:feature/issue-{親番号} #<依存先番号> is:merged`).
     If there is no hit (PR has not yet been merged with the user), treat it as unresolved.
2. Get `feature/issue-{親番号}` from the “## Parent Branch” section of the issue body
3. Check if the parent branch exists on the remote:
   ```bash
   git fetch origin feature/issue-{親番号} 2>/dev/null && echo "exists" || echo "not found"
   ```
   **⚠️ Important (Preventing confusion between parent branch and working branch, #3626) **: At this point, the current
   Be sure to check that the session branch itself is not set to `feature/issue-{親番号}`
   (Compare with the value of `git branch --show-current`). If they match (in the previous run)
   To create a parent branch after completing Architect, rename the session automatically generated branch and leave it as is.
   (e.g. when proceeding to subtask processing within the same session), implementation work can be performed directly on the parent branch itself.
   Do not proceed. Always disconnect new working branches from the parent branch before continuing:
   ```bash
   git checkout -b task/issue-<サブタスク番号>-<内容>
   git push -u origin task/issue-<サブタスク番号>-<内容>
   ```
   **Do not omit SOLOXP_INLINE_131__** (ClaudeCode Web, etc. `gh pr create` cannot be used)
   In environments that fall back to `mcp__github__create_pull_request`, remote to `head`
   If you specify a branch that does not exist, an error will occur when issuing a PR. Codex review pointed out/PR #3627).
   If you want to process the subtask in a new session (new auto-generated branch), its auto-generated
   You can use the branch as is as a working branch (do not rename it to the parent branch name).
4. If it exists: Select the working branch (which must be separate from the parent branch, confirmed above).
   Rebase to parent branch:
   ```bash
   git rebase origin/feature/issue-{親番号}
   ```
5. Specify `--base feature/issue-{親番号}` when issuing PR

**If depends_on is unresolved (one of the dependencies does not have `[Auditor GREEN]` or the corresponding PR has not been merged):**
- Stop by commenting on the issue without starting:
  ```
  ⚠️ depends_on 先 #<依存先番号> が未解消のため着手しません。
  [Auditor GREEN] がない場合: 先に #<依存先番号> を /xp_Director <依存先番号> で処理してください。
  [Auditor GREEN] 済みだが対応PRが未マージの場合: オーナーによるPRマージ待ちです。マージ後に再実行してください。
  ```

**If parent branch does not exist:**
- Comment and stop an issue:
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
   ii.  xp_issue2md <task_issue>
   iii. xp_doc_spec <epic> <親ストーリーイシュー番号>
   iv.  xp_Auditor doc <epic> <task_issue>
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
        （`gh pr create` が使えない場合（ClaudeCodeWeb等）は `mcp__github__create_pull_request`
        （owner, repo, base, head, title, body）にフォールバックする）

d. PR発行完了後、以下を順番に実行してから必ず停止する：

   1. タスクイシューを明示的にクローズする（PR が親ブランチに向くため GitHub 自動クローズが効かない）：
   ```bash
   gh issue close <task_issue>
   ```
   `gh` が使えない場合（ClaudeCodeWeb等）は `mcp__github__issue_write`
   （method: `update`, issue_number: `<task_issue>`, state: `closed`）にフォールバックする。

   2. ステージコメントを記録する：
   ```
   [ProjectStatus: Done]
   ```

   3. **ここで必ず停止する。** 残サブイシューの有無・AllGREEN判定の有無に関わらず、
      本ラン（今回の `/xp_Director` 呼び出し）ではこれ以上の処理を行わない。
      下記 e. を続けて実行してはならない。

e.【参考・このランでは実行しない】AllGREEN チェック・AllGREENフローについて

   下記は「次回いつ・誰が AllGREEN を検知して親ブランチ PR を出すか」の説明であり、
   **今回のラン（step d で停止した直後）には適用されない。**

   AllGREEN は次回の `/ProcessIssue` 実行時、親 Story/Bug イシューを評価する段階
   （ProcessIssue 2-2-C「Architect済みイシューチェック」）で検知される。
   そこから `xp_Director <親イシュー番号>` が**別ランとして**呼び出されたときに、
   以下のフローを実行する：
   1. `xp_Auditor test <epic> <親ストーリー番号>` を呼ぶ（Story-level 受け入れテスト）
      - GREEN → `[Auditor GREEN]` コメントが書き込まれる（xp_Auditor の責務はここまで）
   2. **Story-level Auditor GREEN を確認したら、xp_Director が `xp_Reviewer <epic> <親ストーリー番号>` を呼ぶ**（コードレビュー。高リスク指摘があれば改善勧告イシューを自動起票する）
   3. **xp_Reviewer 完了後、xp_Director が `xp_SecurityReviewer <epic> <親ストーリー番号>` を呼ぶ**（セキュリティレビュー。組み込みスキル `security-review` を呼び出し、インジェクション・認証認可・シークレット漏洩等の観点でレビューする。高リスク指摘があれば改善勧告イシューを自動起票する。開始時に `[SecurityReviewer実行中]`、完了時に `[SecurityReviewer完了]` をイシューに記録する。詳細は `xp_SecurityReviewer` SKILL.md 参照）
   4. `xp_Auditor doc <epic> <親ストーリー番号>` を呼ぶ（ドキュメントチェック）
   5. `xp_RunE2ETests` で E2E テストスイートを確認する（**参考情報として実行する**。`xp_RunE2ETests` 自体は所有権判定を持たないため、他ストーリー所有の既存REDが残っている場合でも raw な `FAIL` を返し得る（#2817）。受け入れ判定の正は手順1（`xp_Auditor test` の所有権判定済み結果）とする。**本手順のFAILが手順1で既に所有権判定済み（他ストーリー所有と確認済み）のREDと一致する場合に限り**、その raw FAIL のみを理由に AllGREEN を否定しない・PR発行を見送らない。**手順1のRED一覧と一致しない新規・未分類のFAILが検出された場合は非ブロックとみなさず、`xp_Auditor test <epic> <親ストーリー番号>` を再実行して所有権判定を経てから判断する**（新規リグレッションを見逃さないため。Codexレビュー指摘・PR #3399）
   6. **spec_update タスクの完了確認（AllGREEN前提条件）：**
      - サブイシュー一覧から `task_type: spec_update` または「機能仕様書更新」タイトルのタスクを特定する
      - spec_update タスクは `xp_issue2md` → `xp_doc_spec` → `xp_Auditor doc` のみを通過し、完了マーカーは `[Auditor doc OK]`（`[Auditor GREEN]` は出力されない）
      - 該当タスクが存在し、コメントに `[Auditor doc OK]` がない場合：AllGREEN 不成立とみなし PR を発行せず停止する。親イシューに以下を記録する：
        ```
        ⚠️ Spec_update task (#<spec_update_issue number>) has not been completed, so AllGREEN judgment will be postponed.
        Please process with /xp_Director <spec_update_issue number> first.
        ```
      - 該当タスクが存在しない、または `[Auditor doc OK]` 済みの場合のみ次へ進む
   7. **全サブタスクPRのマージ確認（AllGREEN前提条件）：** サブタスクPR（`--base feature/issue-{親番号}`）はユーザーがマージするため（自動マージしない）、
      `[Auditor GREEN]` / `[Auditor doc OK]` が揃っていてもPRが実際にマージ済みとは限らない。マージされていないサブタスクPRが
      親ブランチにマージされないまま先へ進むと、次で作る main 向けPRに一部のサブタスクの変更が含まれない事故になるため必ず確認する。
      `--state open` の有無だけでは「マージせずcloseされたPR」を見逃す（open が 0 件でも merged とは限らない）ため、
      完了済みサブイシューそれぞれについて、対応する `merged` PR の存在を個別に確認する：
      ```bash
      gh pr list --search "#<subissue number>" --base feature/issue-{parent number} --state merged --json number,mergedAt
      ```
      `gh` が使えない場合（ClaudeCodeWeb等）は `mcp__github__search_pull_requests`
      （query: `repo:<owner>/<repo> base:feature/issue-{親番号} #<サブイシュー番号> is:merged`）にフォールバックする。
      - 完了済みサブイシューのうち1件でも対応する `merged` PR が見つからない場合（未マージのままopen、または
        マージされずcloseされた場合の両方を含む）は AllGREEN 不成立とみなし PR を発行せず停止する。親イシューに以下を記録する：
        ```
        ⚠️ AllGREEN judgment will be postponed because no merged PR corresponding to subtask #<subissue number> was found.
        After merging the PR by the owner (reopening and merging if it has been closed), please run /xp_Director <parent issue number> again.
        ```
      - 全完了済みサブイシューに対応する merged PR が確認できた場合のみ次へ進む
   8. **Issue Markdown finalize（AllGREEN成立可否には影響しない付随的な同期処理・#2971）：**
      `xp_issueArchiveFinalize <EpicName>` を呼ぶ。対象Epic配下の `docs/issues/issue-*.MD` のうち
      front matter が `state: open` のままGitHub上ではclosed済みになっているものを最新版へ差し替える。
      xp_Director自身はファイルを書き換えず、呼び出しのみ行う（判断と進行管理に徹する原則を維持）。
      本ステップの結果（走査件数・finalize件数）はAllGREENの成立・不成立の判定には使用しない
      （`depends_on`解消・`[Auditor GREEN]`判定のSSOTにもしない。#2971の非目的）。呼び出しに失敗した
      場合も本ステップを理由にPR発行を止めない（次回の`daily-tasks`実行時のEpic横断finalizeで
      巻き取られるため）。
      **finalizeで1件以上ファイルが更新された場合、次の手順9でmain向けPRを発行する前に、
      親ブランチ（`feature/issue-{親番号}`）がチェックアウト・最新化された状態でその変更を
      コミット・pushすること**（`xp_issueArchiveFinalize` は `xp_issue2md` を介してファイルを
      書き換えるのみでコミット・pushまでは行わないため、これを怠ると手順9のPRが
      `--head feature/issue-{親番号}` を指定していてもfinalizeした変更が反映されない。
      Codexレビュー指摘・PR #3491）。更新0件の場合はコミット不要。
   9. 受け入れテスト GREEN（手順1の所有権判定済み結果を正とする。手順5の `xp_RunE2ETests` は所有権判定を経ない参考情報であり、手順1で既に所有権判定済みのREDと一致する raw FAIL のみを理由に本条件を不成立と判断しない。**手順1のRED一覧と一致しない新規のFAILが検出された場合は本条件を不成立とし、手順1の `xp_Auditor test` からやり直す**）・xp_Reviewer 完了・xp_SecurityReviewer 完了・spec_update 完了済み・全サブタスクPRマージ済みの場合：親ブランチ → main の PR を発行する。
      PR本文には `Closes #<親番号>` に加えて、上記1〜7の各ゲート結果（手順8のIssue Markdown finalizeは
      ゲートではなく付随的な同期処理のため参考情報として記載する）を要約する `## AllGREEN チェック結果`
      セクションを**必須**で含める
      （このガードを経由せず `gh pr create --base main` を直接実行した場合に、PR本文だけでゲート通過を検知できるようにするため。#1690）：
      ```bash
      gh pr create --base main --head feature/issue-{parent number} --title "..." --body "$(cat <<'PRBODY'
      Closes #<parent number>

      ## AllGREEN check results

      - Story-level acceptance test (xp_Auditor test): GREEN
      - xp_Reviewer: Completed (High risk findings: None / #<Request number>)
      - xp_SecurityReviewer: Completed (High risk findings: None / #<Request number>)
      -xp_Auditor doc: OK
      - xp_RunE2ETests: Confirmed (E2E suite confirmation gate that is different from the Story-level acceptance test. This is reference information that does not go through ownership determination, and only a raw FAIL that matches the RED confirmed in step 1 will not make this gate fail. In the case of a new FAIL that does not match, it will fail)
      - spec_update task: Completed (No matching tasks / #<number> [Auditor doc OK])
      - Confirm all subtask PR merge: Completed (#<number>, #<number>, ...)
      - Issue Markdown finalize: Completed (scan <n> items, finalize <m> items / reference information, not used for AllGREEN judgment)
      PRBODY
      )"
      ```
      `gh pr create` が使えない場合（ClaudeCodeWeb等）は `mcp__github__create_pull_request`
      （owner, repo, base: `main`, head: `feature/issue-{親番号}`, title, body に上記と同内容の
      `## AllGREEN チェック結果` セクションを含める）にフォールバックする。
      いずれかのゲート結果が要約できない（未確認・未完了）場合はこの手順に到達しておらず、PRを発行してはならない。
      発行後に以下を親イシューに記録し、ストーリーイシューをクローズする:
      - `[親ブランチ PR 発行済み]`
      - `作業完了 <YYYY-MM-DDTHH:mm:ss+09:00> / 所要時間: XX分`（最初のサブタスク着手から現在まで。timestampは`workflow/scripts/get-jst-timestamp.js`で機械取得する）
   → 受け入れテスト（E2E）失敗時：xp_Auditor が失敗内容で新サブイシューを起票し、ストーリーは継続する
   → xp_Director はここで停止する（Auditor が以降の制御を担当する）
```

### 4. Writing stage comments

Record comments to subissues at the start/completion of each stage:

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

**Work log comment (required):**

The current time is `node workflow/scripts/get-jst-timestamp.js` (`workflow/lib/get-jst-timestamp.js`
ISO 8601 with offset machine retrieved from runtime with `getCurrentJstTimestamp()`) and converted to Asia/Tokyo
Use (`YYYY-MM-DDTHH:mm:ss+09:00`). LLM itself must not infer the current time or UTC to JST conversion (#3279/#3281).

Record when task starts (before xp_Tester starts):
```
作業開始 <YYYY-MM-DDTHH:mm:ss+09:00>
セッションURL: https://claude.ai/code/session_XXXXXXXX
[ProjectStatus: InProgress]
```

[Auditor GREEN] Record after confirmation:
```
作業完了 <YYYY-MM-DDTHH:mm:ss+09:00> / 所要時間: XX分
```

For the required time, record the actual time (minutes) from `作業開始` to `[Auditor GREEN]`.
The existing `YYYY-MM-DD HH:mm JST` format (`JST` UTC interpretation unless specified) will continue to be recognized as legacy compatible, but
Always use ISO 8601 format with machine-obtained offsets for new comments.

### 5. depends_on resolution decision

- Don't check GitHub's closed state
- **Unblocked if `[Auditor GREEN]` is found in the dependent sub-issue comment**
- Unblocked subissues will be executed on the next call to `/xp_Director`
- Since only one task is executed in one run, it will not be executed immediately even if it is unblocked.

---

## GitHub access method

| Environment | Access |
|---|---|
| Claude Code Web | Via MCP (`gh` CLI cannot be used due to outbound proxy constraints. GraphQL/REST both fail with "Not enabled for this session" error) |
| claude.ai / Others (local, Codespaces, etc.) | `gh` Command priority. In case of failure (not installed, authentication error, `HTTP 403`, etc.), fallback to MCP |

**⚠️ The description before 2026-08-28 was the opposite (fixed in #3214). ** Detect the environment and automatically switch (ClaudeCode Web's judgment is
Do it from the session environment. (Do not make the mistake of assuming that `gh` can be used because it is Claude Code Web).

`gh` Priority → MCP fallback on failure → field normalization pattern has been established in `xp_issue2md` (#3204).
The main responses within this skill are as follows:

| `gh` Command | Purpose | MCP Fallback |
|---|---|---|
| `gh pr list --search "#<番号>" --base <branch> --state merged` | depends_on resolution check/all subtask PR merge confirmation | `mcp__github__search_pull_requests` (query: `repo:<owner>/<repo> base:<branch> <番号> is:merged`) or `mcp__github__list_pull_requests` (state: closed→`merged`) |
| `gh issue close <task_issue>` | Explicitly close a task issue | `mcp__github__issue_write` (method: `update`, issue_number, state: `closed`) |
| `gh pr create --base main` / `--base feature/issue-{番号}` | PR issue (task PR/PR for main after AllGREEN) | `mcp__github__create_pull_request` (owner, repo, base, head, title, body) |

**⚠️ gh CLI limitations:** `gh issue view --json subIssues` is not supported.
To obtain subissues, use `mcp__github__issue_read` (method: `get_sub_issues`) regardless of the environment.

---

## Notes

- Do not write to code file
- If there is a conflict or error that cannot be determined, comment on the issue and stop it.
- Can be sent back up to 3 times. If exceeded, escalate to user
