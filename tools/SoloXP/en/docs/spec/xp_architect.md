# xp_Architect skill specification

## Overview

As a staff officer/architect, skills to classify issues, issue all sub-issues, and return execution plans to xp_Director.

## Command

```
/xp_Architect <issue_number>
```

## Location

```
.claude/skills/xp_Architect/SKILL.md
```

## Processing flow

### 1. Issue type classification

**First criterion (highest priority): Does it involve observable changes in behavior?**

The first criterion for determining the type is whether it involves a change in behavior that is observable from the user/external side (= whether acceptance conditions can be written).
The number and size of tasks (whether they "span multiple tasks" or not) are secondary criteria and are used as reference information when a decision cannot be made based on the primary criterion alone.

| Type | Judgment criteria |
|---|---|
| **Story** | Added ability to write acceptance conditions (with changes in observable behavior), `[Story]` tag, and functionality that spans multiple tasks |
| **Task** | `[Task]` tag, single implementation task (if observable behavior change is involved, 1-1 necessity determination is mandatory) |
| **Bug** | `[Bug]` Tag, error reporting, bugs in existing features |

Return the classification results to xp_Director (also used for subsequent planning).

### 1-1. Determine whether E2E/spec is required for Task issue (required)

Even for issues determined as `[Task]`, Architect always explicitly determines the following:
Record the reason for the judgment as a comment in the issue (prohibiting implicit skipping of "unnecessary because it is a task"):

- Does this task involve changes in observable behavior?
- If involved: Similar to Story, issue "① E2E test suite creation task" and "② Functional specification update task" (see step 5).
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

Calls the `code-architect` subagent (Agent tool, `subagent_type: code-architect` — provided by feature-dev plugin) to check for conflicts with existing implementations.

> **Background (#1381)**: `/feature-dev` There are no "architect" / "explore" subcommands in the command body,
> Phase 3 (Clarifying Questions), Phase 5 (Implementation approval), and Phase 6 (Review judgment)
> Cannot be incorporated into an automatic flow because it requires waiting for a human response. whereas the feature-dev plugin provides
> `code-architect` The subagent itself is a read-only tool (Glob/Grep/LS/Read/NotebookRead/
> WebFetch/TodoWrite/WebSearch/KillShell/BashOutput) and can be called without waiting for a human response.

**How to call:**

Call the Agent tool passing the following:
- `subagent_type`: `code-architect`
- `prompt`: Including the purpose of the story/task, acceptance conditions, influence scope candidates (subordinates of `api/<EpicName>/`, etc.),
  Specify that ``I would like you to design it as an extension of the existing pattern without introducing a new one.''
- `isolation`: Not specified (worktree is not required as it is read-only)**Mapping output to xp execution plan:**

code-architect output format (Patterns & Conventions Found / Architecture Decision / Component Design /
Implementation Map / Data Flow / Build Sequence / Critical Details) using the following rules.
Convert to xp execution plan (steps 4 and 5):

| code-architect output | mapping to xp execution plan |
|---|---|
| Each phase of Build Sequence | corresponds to the unit of sub-issue (each task of `estimate.breakdown`) |
| Order dependent in Build Sequence | Convert to `depends_on` (assigned to tasks that can only be started after the completion of the preceding phase) |
| Change each file in the Implementation Map | Specify the file to be changed in the "Summary" of the corresponding sub-issue |
| Critical Details (Test/Performance/Security perspective) | Use as reference information for the "overview" of the relevant task or step 1-1 (determining whether E2E/spec is required for the task) |
| Patterns & Conventions Found | Post as is in the comment format below and leave it as a basis for compliance with existing patterns |

**Comment the issue with conflict check results:**

```
## 既存実装との競合チェック（code-architect）

対象: #<issue_number>
Patterns & Conventions Found: <要約>
Architecture Decision: <要約>
競合の有無: あり / なし
```

**Fallback if SOLOXP_INLINE_28__ cannot be called:**

**Activation conditions (activated if any one of them applies):**
- The call to the Agent tool itself fails with an error timeout.
- `subagent_type: code-architect` is not found/unavailable error is returned
- The call was successful, but the output does not contain any content equivalent to `Patterns & Conventions Found` (empty response/format corruption)

**Confirmation steps:**
1. Record any error messages or insufficient output as they occur
2. Switch to manual code tracing (Read of `api/<EpicName>/docs/spec/`, Grep/Glob of affected area, Read of existing tests)
3. Add and record the following in the comment format above:
   ```
   フォールバック発動: あり
   発動理由: <上記1で記録したエラー内容>
   ```
4. Write the manual trace result (equivalent to Patterns & Conventions Found) in the same comment and use it for planning step 4.

**If you can't see any competition:**
- Report to xp_Director specifying any points that cannot be determined.
- xp_Director determines escalation

### 4. Drafting an execution plan

- Organize tasks based on story card `estimate.breakdown`
- Check and organize `depends_on` of each task
- If `estimate.breakdown` does not exist, report that `xp_plan` should be executed first and exit.

### 5. Publish all sub-issues

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

**Labeling rules:**
- Add basic labels: `task`, `epic/<epic名>`
- If the label does not exist, create it with `gh label create` and then assign it.(For environments where `gh` cannot be used (such as ClaudeCodeWeb): There is no MCP tool that directly corresponds to `gh label create`
  Known gap. Frequently appearing labels such as `task` / `epic/<EpicName>` will be created in advance, and labels that do not exist will be deleted.
  Give up on the grant and create an issue. However, even if a label is created later, it will not be applied retroactively to an existing issue.
  In the comment requesting manual creation, it should be clearly stated that ``After creation, please manually add it to this issue'' (Codex review pointed out, #3254). #3214)

After creating an issue, be sure to link it to the parent issue as GitHub Sub-Issues:

```bash
ISSUE_DB_ID=$(gh api repos/{owner}/{repo}/issues/<作成したissue番号> --jq '.id')
gh api repos/{owner}/{repo}/issues/{parent_number}/sub_issues \
  --method POST \
  --field sub_issue_id=$ISSUE_DB_ID
```

If `gh` cannot be used (such as ClaudeCodeWeb), `mcp__github__sub_issue_write` (method: `add`, sub_issue_id is
Fallback to the database ID of the created issue [`mcp__github__issue_read` method: `id` of `get`]) (#3214).

This will cause `mcp__github__issue_read` (method: `get_sub_issues`) to correctly return subissues.
(Do not use `gh issue view --json subIssues` as it is not supported).

**Priority label propagation (parent to child):**
If the parent issue is labeled `Emergency` or `PriorityHigh`,
Propagate the same label to all subissues you create.

| Propagation conditions | Processing |
|---|---|
| Parent has `Emergency` | All subissues have `Emergency` |
| Parent has `PriorityHigh` | All subissues have `PriorityHigh` |

#### For Story issues and for Task issues with observable behavior changes: Required additional tasks

When processing a Story issue, or `[Task]` if the issue is determined to have "observable behavior change" in step 1-1,
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

#### For Bug issues: Required predecessor tasks

When processing a bug issue, **always** create the following tasks before the fix task:

**Bug reproduction test additional task (highest priority/preceding task)**

```
タイトル: [Task] バグ再現テスト追加

## 概要
報告されたバグ #<バグイシュー番号> を再現するテストケースを追加する。
テストファーストでバグの存在を証明し、修正タスクの受け入れ基準を定める。

## 見積もり
1pt — 再現テストの設計・作成

## 依存関係
なし（即着手可能・修正タスクより先に実施すること）

## 親ストーリー
#<バグイシュー番号>

## 親ブランチ
feature/issue-{親番号}

## 備考
task_type: bug_reproduction_test
xp_Director はこのタスクを xp_UnitTest + xp_FunctionalTest で処理すること。
```

### 6. Update story card

Update the frontmatter of the story card (`api/<EpicName>/stories/in_progress/`):

```yaml
issue_number: <ストーリーイシュー番号>
status: in_progress
```

### 7. Return execution plan to xp_Director

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

---

## Design philosophy (Learn from feature-dev code-explorer/architect)

### Principle: Do not destroy the existing

The architect's greatest responsibility is not to ``create something new,'' but to ``not destroy the existing design.''
The proposed design must be an **extension** of patterns that are already out there.

### Complete tracing before implementation

Before submitting your design proposal, be sure to read the following (all read-only):

1. **From entry point to exit point** — trace related API routes, function calls, and storage operations with a single stroke2. **Extracting existing patterns** — enumerate how similar features are implemented
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

## Test

- E2E: `workflow/__tests__/e2e/issue-705-priority-label-selection.test.js` (acceptance condition 4: 12 items)

## Changelog

| Date | Version | Changes | Issue |
|---|---|---|---|
| 2026-04-24 | 1.0.0 | Priority label propagation rule added (Emergency/PriorityHigh) | #717 |
| 2026-06-21 | 1.1.0 | Redefine the first criterion for type determination as "Is there an observable change in behavior?" (scale is demoted to a secondary criterion). The E2E/spec necessity determination (step 1-1) for Task issues has been made mandatory, and the comment recording of the reason for the determination has been made mandatory. Expanding the scope of required additional tasks (E2E/spec) from Stories to "Tasks that involve Story or observable behavior changes" | #1557, #1565 |
| 2026-07-17 | 1.2.0 | Revised step 3 to call `code-architect` subagent (Agent tool, subagent_type: code-architect). Added mapping table from output (Build Sequence / Implementation Map etc.) to xp execution plan (depends_on / task_type). Specify fallback activation conditions (error, timeout, empty response) and confirmation procedure (manual code tracing procedure, comment format) | #1381 |
| 2026-08-29 | 1.3.0 | Added `mcp__github__sub_issue_write` fallback to `gh api .../sub_issues` (POST). `gh label create` Clarify the gap on the MCP side (no corresponding tool) and alternative methods (pre-creation of frequent labels + manual creation request) | #3205, #3214 |
| 2026-08-29 | 1.3.1 | Added requirement for retroactive granting to existing issues after manual creation to label missing fallback (Codex review pointed out: Creation alone does not reflect on existing issues and is omitted from label-based routing) | #3254 |
