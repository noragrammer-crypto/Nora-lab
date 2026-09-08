---
model: claude-opus-4-6
---

# XP Architect Skill

> **Old command**: Successor of `xp_issue`. Called by xp_Director.

## Command

### `xp_Architect <issue_number>`

As a staff officer/architect, classify issues, break them down into tasks, and return execution plans to xp_Director.
If the total number of tasks falls within one issue, do not issue a sub-issue and return the parent issue as the root task (see step 4-A).

---

## Responsibilities

- Issue type classification (Story / Task / Bug)
- Load content of story issue
- Check for conflicts with existing implementations, specs, and tests
- Formulation of an execution plan (If `estimate.breakdown` is not available, disassemble it yourself. See step 4)
- Check the total number of tasks (if there is only one task, do not make it a sub-issue. See step 4-A)
- Publish all sub-issues at once (with depends_on, only when there are 2 or more issues in total)
- Update `issue_number` / `status` if story card exists
- Return execution plan to xp_Director

---

## Processing flow

### 0. Disassembled check (required/top priority)

Get all comments for an issue and markers left by Architect / xp_Director in the past
(`[親ブランチ作成済み]` or `## 実行計画` comment).

**Judgment criteria are markers only. Not judged based on the presence or absence of sub-issues**
(As related tasks are manually linked to sub-issues, ``sub-issue exists = disassembled'' is a false positive.)

**If there is a marker (disassembled):**

- Do not publish new sub-issues (prohibit double publication. A double publication accident occurred in #1337)
- Reconfigure the execution plan from the list of existing subissues (`mcp__github__issue_read` method: `get_sub_issues`), return it to xp_Director in the format of step 7, and finish.
- Only when there is an explicit instruction to "add a task" from the user, check the differences with existing sub-issues and publish only the missing tasks (do not issue duplicate tasks with the same content as existing ones)

**If there is no marker:** Proceed to step 1.

### 1. Issue type classification

Read the body, title, and label of the GitHub Issue and classify it as one of the following:

**First criterion (highest priority): Does it involve observable changes in behavior?**

The first criterion for determining the type is whether it involves a change in behavior that is observable from the user/external side (= whether acceptance conditions can be written).
The number and size of tasks (whether they "span multiple tasks" or not) are secondary criteria and are used as reference information when a decision cannot be made based on the primary criterion alone.

| Type | Judgment criteria |
|---|---|
| **Story** | Added ability to write acceptance conditions (with changes in observable behavior), `[Story]` tag, and functionality that spans multiple tasks |
| **Task** | `[Task]` tag, single implementation task (if observable behavior change is involved, 1-1 necessity determination is mandatory) |
| **Bug** | `[Bug]` tag, error reporting, bugs in existing features |

Return the classification results to xp_Director (also used for subsequent planning).

### 1-1. Determine whether E2E/spec is required for Task issue (required)

Even for issues determined as `[Task]`, Architect always explicitly determines the following:
Record the reason for the judgment as a comment in the issue (prohibiting implicit skipping of "unnecessary because it is a task"):

- Does this task involve changes in observable behavior?- If involved: Similar to Story, issue "① E2E test suite creation task" and "② Functional specification update task" (see step 5).
- If not: Please state the reason for the decision (e.g. internal refactor only, configuration change only, documentation only, etc.) in a comment.

Example of judgment comment:

```
## E2E/spec 要否判定（Task）

対象: #<task番号>
観測可能な振る舞いの変更: あり / なし
理由: <判断理由>
追加タスク: E2Eテストスイート作成 #<番号> / 機能仕様書更新 #<番号>（「なし」の場合は記載しない）
```

### 2. Read the full story issue content

- Get the entire GitHub issue text and comment history
- Understand the story's purpose, acceptance conditions, and estimate.breakdown

### 3. Check for conflicts with existing implementations

`code-architect` Subagent (Agent tool, `subagent_type: code-architect` — provided by feature-dev plugin.
Complete with only read-only tools: Glob/Grep/LS/Read/NotebookRead/WebFetch/TodoWrite/WebSearch/KillShell/BashOutput.
Waiting for a human response does not occur) and checks for conflicts with existing implementations.

> **Findings (#2098)**: `/feature-dev` There are no "architect" / "explore" subcommands in the command body.
> However, the feature-dev plugin is `code-explorer` in Phase 2, `code-architect` in Phase 4, and `code-reviewer` in Phase 6.
> Each agent is provided as an individual subagent and can be called directly from the Agent tool.
> `/feature-dev` The command body is Phase 3 (Clarifying Questions), Phase 5 (Implementation approval),
> Since the design requires waiting for a human response in Phase 6 (review judgment), it cannot be incorporated into the automatic flow.
> On the other hand, the `code-architect` subagent itself is a read-only tool and can be called without waiting for a human response.

**How to call:**

Call the Agent tool passing the following:
- `subagent_type`: `code-architect`
- `prompt`: Including the purpose of the story/task, acceptance conditions, influence range candidates (subordinates of `api/<EpicName>/`, etc.),
  Specify that ``I would like you to design it as an extension of the existing pattern without introducing a new one.''
- `isolation`: Not specified (worktree is not required as it is read-only)

**Mapping output to xp execution plan:**

code-architect output format (Patterns & Conventions Found / Architecture Decision / Component Design /
Implementation Map / Data Flow / Build Sequence / Critical Details) using the following rules.
Convert to xp execution plan (steps 4 and 5):

| code-architect output | mapping to xp execution plan |
|---|---|
| Each phase of Build Sequence | corresponds to the unit of sub-issue (each task of `estimate.breakdown`) |
| Order dependent in Build Sequence | Convert to `depends_on` (assigned to tasks that can only be started after the completion of the preceding phase) |
| Change each file in the Implementation Map | Specify the file to be changed in the "Summary" of the corresponding sub-issue || Critical Details (Test/Performance/Security perspective) | Use as reference information for the "overview" of the relevant task or step 1-1 (determining whether E2E/spec is required for the task) |
| Patterns & Conventions Found | Post it as is in the issue comment (format below) in step 3 and leave it as evidence for compliance with the existing pattern |
(`task_type` is not subject to conversion in this table) | `task_type` is not derived directly from the output of code-architect. Each phase of the Build Sequence is always published in the normal subissue publishing format (without the `task_type` field) in step 5, and is treated as a "normal implementation task" by xp_Director. `task_type: e2e_test_creation` / `spec_update` is issued in a fixed format separately as a "required additional task" in Step 5, regardless of the output content of code-architect, if it is a Story issue or a Task issue with observable behavior changes (#2139. Of the depends_on/task_type specification required in #2100, the omission on the task_type side has been resolved) |

**Comment the issue with conflict check results:**

```
## 既存実装との競合チェック（code-architect）

対象: #<issue_number>
Patterns & Conventions Found: <要約>
Architecture Decision: <要約>
競合の有無: あり / なし
```

**Fallback when SOLOXP_INLINE_44__ cannot be called (tool not supported/error):**

**Activation conditions (activated if any one of them applies):**
- The call to the Agent tool itself fails with an error timeout.
- `subagent_type: code-architect` is not found/unavailable error is returned
- The call was successful, but the output does not contain any content equivalent to `Patterns & Conventions Found` (empty response/format corruption)

**Confirmation steps:**
1. Record any error messages or insufficient output as they occur.
2. Switch to manual code tracing:
   - Read `api/<EpicName>/docs/spec/` (or `docs/spec/` of the corresponding project)
   - Search the affected range candidate directory using Grep/Glob and read the related code
   - Read existing tests (directories that match the project's customs, such as `__tests__/` and `tests/`) to understand the current behavior and coverage range.
   - Identify the presence or absence of competition and scope of influence from the above
3. Add the following to the "Comment the conflict check result to the issue" format in step 3 and record it:
   ```
   フォールバック発動: あり
   発動理由: <上記1で記録したエラー内容>
   ```
4. Write the manual trace result (equivalent to Patterns & Conventions Found) in the same comment and use it for subsequent execution planning (step 4).

**If you can't see any competition:**
- Report to xp_Director specifying any points that cannot be determined.
- xp_Director determines escalation

### 4. Drafting an execution plan

If **`estimate.breakdown` exists (old flow originating from StoryCard, etc.):**
- Use it as reference information to organize your tasks
- Check and organize `depends_on` of each task

If **`estimate.breakdown` does not exist (usually this in the current flow originating from the issue):**
- Decompose the `code-architect` output obtained in step 3 (or fallback manual trace results) into tasks by Architect itself according to the mapping table in step 3 (each phase of Build Sequence → sub-issue, order dependence → depends_on, etc.)- No delegation to `xp_plan`. `xp_plan` is a skill for the old flow that receives Markdown story cards by file path, and it does not work because the corresponding input (story card file) does not exist in the current issue origin flow (Details: #2965)

### 4-A. Check total number of tasks (required)

Count the total number of tasks, including the functional tasks identified in step 4 and all required accompanying tasks (E2E test suite creation, functional specification update, bug reproduction test addition) described below (each section in step 5).

- **For Bug issues**: In accordance with the TDD principle of CLAUDE.md (bug fixes include adding reproduction tests and implementing corrections in a single task and single PR. Reproduction tests are not separated into independent tasks), reproduction tests and modifications are not separated from the beginning and are counted as one task (for details, see the "For Bug issues" section)
- **In the case of story issues and task issues with observable behavior changes**: E2E test suite creation tasks and functional specification update tasks will continue to be counted in the total as required accompanying tasks (normally these two alone will total 2 or more, so single task judgments will almost never occur)

**If there is only one item in total (single task judgment):**
- Do not issue sub-issues (GitHub Sub-Issue)
- Do not create parent branch (`feature/issue-{番号}`)
- Step 6 (story card update) is only performed if the corresponding StoryCard file exists, otherwise it is skipped.
- In step 7, report to xp_Director as "single task determination" (see step 7 for format). xp_Director treats the parent issue as a "root task" and completes it in 1 session and 1 PR using the `--base main` direct PR route.

**If the total is 2 or more:**
- Proceed to step 5 (publish all sub-issues) as usual

**Exception if caller is `FableDirectorCodex`:**
Single-task determination is not performed, and the sub-issue issuance flow in step 5 is always followed even if there is only one issue in total.
`FableDirectorCodex` is designed to asynchronously hand over independent sub-issues to `ProcessTaskIssue` (no code implementation)
Therefore, it is not compatible with a single task route that targets the parent issue itself (a parent issue has sub-issues).
(This is because there is no mechanism to pick it up and it is left unexecutable.) See `FableDirectorCodex/SKILL.md` for details.

### 5. Publish all sub-issues (only when the total number of tasks is 2 or more)

Create an issue for each task in `estimate.breakdown`:

```
タイトル: [Task] <task名>

## 概要
<タスクの目的・実装内容>

## 見積もり
<pt>pt — <note>

## 依存関係
<depends_on が設定されている場合>
このタスクは #<イシュー番号> の完了後に着手すること。
（依存先サブイシューに [Auditor GREEN] コメントが記録されてから着手する）

depends_on: #<依存先イシュー番号をカンマ区切りで列挙>

<depends_on がない場合>
なし（即着手可能）

## 親ストーリー
#<ストーリーイシュー番号>

## 親ブランチ
feature/issue-{親番号}
```

If `depends_on` is set, be sure to specify the `depends_on:` field as well as the natural text description (the xp_Director dependency resolution check reads both formats, so omitting the field is not allowed).

Labels: `task`, `epic/<epic名>` are assigned.
If the label does not exist, create it with `gh label create` and then assign it.
(For environments where `gh` cannot be used (such as ClaudeCodeWeb): There is no MCP tool that directly corresponds to **`gh label create`.
Known gaps**. Frequently used labels such as `task` / `epic/<EpicName>` should be created in the repository in advance.
If the label does not exist when creating an issue, `mcp__github__issue_write` will be ignored or an error will occur due to label name mismatch.
If the existence cannot be confirmed, give up on assigning the corresponding label and create an issue. However, even if you create a label later,`task` / `epic/*` / Propagated priority labels (`Emergency` / `PriorityHigh`) are not retroactively assigned to existing issues.
is permanently missing from the sub-issue, and label-based routing (epic judgment, priority triage, etc.)
Can be overlooked (Codex review pointed out #3254). Therefore, comments after creating an issue are simply requests for manual creation.
Do not end, but specify the following as required:
"Label `<label名>` could not be assigned because it does not exist. After manual creation, the label `<label名>` could not be assigned to this issue (#<number>).
Please manually add `<label名>` (it will not be applied retroactively if you just create a new one).
We do not provide an alternative to creating new labels (automatic creation via MCP).

After creating an issue, be sure to link it to the parent issue as GitHub Sub-Issues:

```bash
# gh CLI が使える場合: データベースIDを取得してからサブイシューリンクを作成する
ISSUE_DB_ID=$(gh api repos/{owner}/{repo}/issues/<作成したissue番号> --jq '.id')
gh api repos/{owner}/{repo}/issues/{parent_number}/sub_issues \
  --method POST \
  --field sub_issue_id=$ISSUE_DB_ID
```

If `gh` cannot be used (such as ClaudeCodeWeb), use `mcp__github__sub_issue_write` (method: `add`, issue_number: parent issue number,
sub_issue_id: **Database ID** of the created issue [not the issue number]. `mcp__github__issue_read` (method: `get`)
`id` included in the response]).

This will change ProcessIssue's `gh issue view <親番号> --json subIssues` (or `gh` if you can't use it)
`mcp__github__issue_read` (`get_sub_issues`) now returns subissues correctly.

**Priority label propagation (parent to child):**
If the parent issue is labeled `Emergency` or `PriorityHigh`,
Propagate the same label to all subissues you create.
- `Emergency` propagation: if parent has `Emergency`, give `Emergency` to all subissues
- `PriorityHigh` propagation: if parent has `PriorityHigh`, give `PriorityHigh` to all subissues

#### For Story issues and for Task issues with observable behavior changes: Required additional tasks

When processing a Story issue, or when the `[Task]` issue is determined to have "observable behavior change" in step 1-1,
In addition to the functional task, be sure to create the following two tasks:

**① E2E test suite creation task (preceding task)**

```
タイトル: [Task] E2Eテストスイート作成

## 概要
ストーリー #<ストーリーイシュー番号> の受け入れ条件に基づくE2Eテストスイートを作成する。
実装開始前にテストファーストで受け入れ試験を定義する。

## 見積もり
1pt — E2Eテスト設計・作成

## 依存関係
なし（即着手可能・実装タスクより先に実施すること）

## 親ストーリー
#<ストーリーイシュー番号>

## 親ブランチ
feature/issue-{親番号}

## 備考
task_type: e2e_test_creation
xp_Director はこのタスクを xp_E2Etest <親ストーリー番号> で処理すること。
```

**② Functional specification update task (successful task)**

```
タイトル: [Task] 機能仕様書更新

## 概要
ストーリー #<ストーリーイシュー番号> の実装内容を spec/ に反映する。
全実装タスク完了後に実施する。

## 見積もり
1pt — 機能仕様書の更新・整備

## 依存関係
このタスクは全実装タスク（#<タスク番号1>, #<タスク番号2>, ...）の完了後に着手すること。
（全実装タスクに [Auditor GREEN] コメントが記録されてから着手する）

depends_on: #<全実装タスクのイシュー番号をカンマ区切りで列挙>

## 親ストーリー
#<ストーリーイシュー番号>

## 親ブランチ
feature/issue-{親番号}

## 備考
task_type: spec_update
xp_Director はこのタスクを xp_issue2md <このタスクのイシュー番号> → xp_doc_spec <epic> <親ストーリー番号> の順で処理すること。
```

#### For Bug issues: Reproduction test + fix is a single task (separation prohibited)

**Following CLAUDE.md's TDD principle** (Bug fixes should be completed in one task. Adding a reproduction test and implementing the correction should be treated as a single task/single PR. Do not separate reproduction tests into independent tasks).
Addition of reproduction tests and fix implementations should not be separated into separate sub-issues. In the past, this was separated and was pointed out at the management meeting as a violation of the principles of CLAUDE.md (#2943).

- **If the fix is large enough to be completed in a single task (most bug issues are here):**
  It is counted as one task when checking the total number of tasks in step 4-A. If there is only one issue in total, follow the single task determination and execute the parent issue as is without issuing a sub-issue.The person in charge will proceed with the test first (first pass the reproduction test with `xp_UnitTest` + `xp_FunctionalTest` and then implement the modifications) within the same task.
- **If the modification is large enough to have to be divided into multiple tasks, such as spanning multiple components:**
  The unit of task is ``reproduction test of the relevant range + correction of that range'' as one task. Do not isolate the reproduction test as an independent preceding task.
  Following the normal sub-issue publication format (step 5), specify in `## 概要` that you will proceed with testing first (`task_type: bug_reproduction_test` is not added. Reproduction tests are included in each modification task, so they are not treated as an independent task type).

### 6. Update story card (only if corresponding StoryCard file exists)

Update frontmatter only if the corresponding story card (`api/<EpicName>/stories/in_progress/`) exists:

```yaml
issue_number: <ストーリーイシュー番号>
status: in_progress
```

In many cases, there is no corresponding StoryCard in the issue originating flow, in which case this step itself can be skipped.

### 7. Return execution plan to xp_Director

**If the total number of tasks is 2 or more (normal sub-issue decomposition):**

```
## 実行計画

イシュー種別: Story / Task / Bug
ストーリーイシュー: #<番号>
サブイシュー（全<n>件）:
  - #<番号> [Task] <タスク名> (<pt>pt) depends_on: なし
  - #<番号> [Task] <タスク名> (<pt>pt) depends_on: #<依存先>
  ...

即着手可能（depends_onなし）:
  - #<番号>, #<番号>, ...

ブロック中（depends_on待ち）:
  - #<番号> ← #<依存先番号> の [Auditor GREEN] 待ち
```

**If the total number of tasks is only 1 (single task determination, see step 4-A):**

```
## 実行計画

イシュー種別: Story / Task / Bug
判定: 単一タスク（サブイシュー発行なし・親ブランチなし）
対象イシュー: #<番号>（このイシュー自体をタスクとして扱う）
実行方法: xp_Director は --base main のルートタスク経路で1セッション・1PRで処理する
```

---

## Design philosophy (Learn from feature-dev code-explorer/architect)

### Principle: Do not destroy the existing

The architect's greatest responsibility is not to ``create something new,'' but to ``not destroy the existing design.''
The proposed design must be an **extension** of patterns that are already out there.

### Complete tracing before implementation

Before submitting your design proposal, be sure to read the following (all read-only):

1. **From entry point to exit point** — trace related API routes, function calls, and storage operations with a single stroke
2. **Extracting existing patterns** — enumerate how similar features are implemented
3. **Visualize dependencies** — Export caller/callee as text or mermaid and then break down tasks

```
# 依存関係の可視化例（mermaid）
graph LR
  A[API endpoint] --> B[usecase layer]
  B --> C[repository]
  C --> D[DB]
```

### Does not introduce new abstractions

- **Do not arbitrarily introduce patterns/layers/naming conventions that do not exist in the existing code**
- If it is determined that a new abstraction is necessary, submit it as a "proposal" to the xp_Director, obtain approval, and then turn it into a task.

### Design conflict detection

"Conflict check (step 3)" is not a formal check, but explicitly states the following:

- Is there any existing code with the same responsibilities?
- Are the naming and layer structure consistent with the existing one?
- Does the mock bounds of the test remain the same (regression risk)?

---

## Notes

- GitHub repositories are automatically detected with `gh repo view`
- Proceed with issue creation one by one and report any errors to xp_Director immediately
