---
model: claude-opus-4-6
---

# XP Architect Skill

> **Old command**: Successor of `xp_issue`. Called by xp_Director.

## Command

### `xp_Architect <issue_number>`

As a strategist and architect, classify the issue, create every required sub-issue, and return an execution plan to xp_Director.

---

## Responsibilities

- Issue type classification (Story / Task / Bug)
- Load content of story issue
- Conflict check with existing implementations, specs, and tests
- Drafting an implementation plan
- Publish all sub-issues at once (with depends_on)
- Update the story card’s `issue_number` / `status`
- Return execution plan to xp_Director

---

## Processing flow

### 0. Disassembled check (required/top priority)

Get all comments for an issue and markers left by Architect / xp_Director in the past
Check for either locale of the protocol markers: `[Parent branch created]` or `[親ブランチ作成済み]`, and an `## Execution plan` or `## 実行計画` comment.

**Judgment criteria is marker only. Not judged based on the presence or absence of sub-issues**
(As related tasks are manually linked to sub-issues, ``sub-issue exists = disassembled'' is a false positive.)

**If there is a marker (disassembled):**

- Do not publish new sub-issues (prohibit double publication. A double publication accident occurred in #1337)
- Reconfigure the execution plan from the list of existing subissues (`mcp__github__issue_read` method: `get_sub_issues`), return it to xp_Director in the format of step 7, and finish.
- Only when there is an explicit instruction to "add a task" from the user, check the differences with existing sub-issues and issue only the missing tasks (do not issue duplicate tasks with the same content as existing ones)

**If there is no marker:** Proceed to step 1.

### 1. Issue type classification

Read the body, title, and label of the GitHub Issue and classify it as one of the following:

**First criterion (highest priority): Does it involve observable changes in behavior?**

The first criterion for determining the type is whether it involves a change in behavior that is observable from the user/external side (= whether acceptance conditions can be written).
The number and scale of tasks (whether they "span multiple tasks" or not) are secondary criteria and are used as reference information when a decision cannot be made based on the primary criteria alone.

| Type | Judgment criteria |
|---|---|
| **Story** | Addition of ability to write acceptance conditions (accompanied by changes in observable behavior), `[Story]` tag, and functionality that spans multiple tasks |
| **Task** | `[Task]` tag, single implementation task (if observable behavior change is involved, 1-1 necessity determination is mandatory) |
| **Bug** | `[Bug]` tags, error reporting, and bugs in existing features |

Return the classification results to xp_Director (also used for subsequent planning).

### 1-1. Determine whether E2E/spec is required for Task issue (required)

Even for issues determined to be `[Task]`, Architect always explicitly determines the following:
Record the reason for the judgment as a comment in the issue (prohibiting implicit skipping of "unnecessary because it is a task"):

- Does this task involve changes in observable behavior?
- If involved: Similar to Story, issue "① E2E test suite creation task" and "② Functional specification update task" (see step 5).
- If not: Please state the reason for the decision (e.g. internal refactor only, configuration change only, documentation only, etc.) in a comment.

Example of judgment comment:

```
## E2E/spec necessity determination (Task)

Target: #<task number>
Observable behavior changes: Yes/No
Reason: <Reason for judgment>
Additional tasks: E2E test suite creation #<number> / Functional specification update #<number> (if "None", do not write)
```

### 2. Read the full story issue content

- Get the entire GitHub Issue text/comment history
- Understand the story's purpose, acceptance conditions, and estimate.breakdown

### 3. Check for conflicts with existing implementations

`code-architect` subagent (Agent tool, `subagent_type: code-architect` — provided by feature-dev plugin.
Complete with only read-only tools: Glob/Grep/LS/Read/NotebookRead/WebFetch/TodoWrite/WebSearch/KillShell/BashOutput.
Waiting for a human response does not occur) and checks for conflicts with existing implementations.

> **Investigation result (#2098)**: There are no "architect" / "explore" subcommands in the `/feature-dev` command body.
> However, the feature-dev plugin is `code-explorer` in Phase 2, `code-architect` in Phase 4, and `code-reviewer` in Phase 6.
> Each agent is provided as an individual subagent and can be called directly from the Agent tool.
> `/feature-dev` The command body is Phase 3 (Clarifying Questions), Phase 5 (Implementation approval),
> Since the design requires waiting for a human response in Phase 6 (review judgment), it cannot be incorporated into the automatic flow.
>On the other hand, the `code-architect` subagent is a read-only tool and can be called without waiting for a human response.

**How ​to call:**

Call the Agent tool passing the following:
- `subagent_type`: `code-architect`
- `prompt`: Including the purpose of the story/task, acceptance conditions, influence scope candidates (subordinates of `api/<EpicName>/`, etc.),
Specify that ``I would like you to design it as an extension of the existing pattern without introducing a new one.''
- `isolation`: Not specified (worktree is not required as it is read-only)

**Mapping output to xp execution plan:**

code-architect output format (Patterns & Conventions Found / Architecture Decision / Component Design /
Implementation Map / Data Flow / Build Sequence / Critical Details) using the following rules.
Convert to xp execution plan (steps 4 and 5):

| code-architect output | mapping to xp execution plan |
|---|---|
| Each phase of Build Sequence | Corresponds to the unit of sub-issue (each task of `estimate.breakdown`) |
| Order dependent in Build Sequence | Convert to `depends_on` (assigned to tasks that can only be started after the completion of the preceding phase) |
| Change each file in the Implementation Map | Specify the file to be changed in the "Summary" of the corresponding sub-issue |
| Critical Details (Test/Performance/Security perspective) | Use as reference information for the "overview" of the relevant task or step 1-1 (determining whether E2E/spec is required for the task) |
| Patterns & Conventions Found | Post it as is in the issue comment (format below) in step 3 and leave it as evidence for compliance with the existing pattern |

**Comment the issue with conflict check results:**

```
## Conflict check with existing implementation (code-architect)

Target: #<issue_number>
Patterns & Conventions Found: <Summary>
Architecture Decision: <Summary>
Conflict presence/absence: Yes/No
```

**Fallback when `code-architect` cannot be called (tool not supported/error):**

**Activation conditions (activated if any one of them applies):**
- The call to the Agent tool itself fails with an error timeout.
- `subagent_type: code-architect` is not found/unavailable error returned
- The call was successful, but the output does not contain any content equivalent to `Patterns & Conventions Found` (empty response/format collapse)

**Confirmation steps:**
1. Record any error messages or insufficient output as they occur.
2. Switch to manual code tracing:
- Read `api/<EpicName>/docs/spec/` (or `docs/spec/` of the relevant project)
- Search the affected range candidate directory using Grep/Glob and read the related code
- Read existing tests (directories that match project conventions, such as `__tests__/` and `tests/`) and understand the current behavior and coverage range.
- Identify the presence or absence of competition and scope of influence from the above
3. Add the following to the "Comment the conflict check result to the issue" format in step 3 and record it:
   ```
Fallback activation: Yes
Reason for activation: <Error details recorded in 1 above>
   ```
4. Write the results of manual tracing (equivalent to Patterns & Conventions Found) in the same comment and use it for subsequent execution planning (step 4).

**If you can't see any competition:**
- Report to xp_Director specifying any points that cannot be determined.
- xp_Director determines escalation

### 4. Drafting an execution plan

- Organize tasks based on story card `estimate.breakdown`
- Check and organize `depends_on` of each task

**If `estimate.breakdown` does not exist:**
- Report to xp_Director to run `xp_plan` first and exit

### 5. Publish all sub-issues

Create an issue for each task in `estimate.breakdown`:

```
Title: [Task] <task name>

## overview
<Task purpose/implementation details>

## estimate
<pt>pt — <note>

## Dependencies
<If depends_on is set>
Start this task after #<issue number> is completed.
(Start after the [Auditor GREEN] comment is recorded in the dependent sub-issue)

depends_on: #<List dependent issue numbers separated by commas>

<If there is no depends_on>
None (can start immediately)

## Parent story
#<story issue number>

## Parent branch
feature/issue-{parent number}
```

If `depends_on` is set, be sure to specify not only the natural text description but also the `depends_on:` field (the xp_Director dependency resolution check reads both formats, so omitting the field is not allowed).

Label: Assign `task` , `epic/<epic-name>`.
If the label does not exist, create it with `gh label create` and then assign it.

After creating an issue, be sure to link it to the parent issue as GitHub Sub-Issues:

```bash
# Get the database ID and then create the sub-issue link
ISSUE_DB_ID=$(gh api repos/{owner}/{repo}/issues/<created issue number> --jq '.id')
gh api repos/{owner}/{repo}/issues/{parent_number}/sub_issues \
  --method POST \
  --field sub_issue_id=$ISSUE_DB_ID
```

This allows ProcessIssue `gh issue view <parent-number> --json subIssues` to correctly return subissues.

**Priority label propagation (parent to child):**
If the parent issue is labeled `Emergency` or `PriorityHigh`,
Propagate the same label to all subissues you create.
- `Emergency` propagation: If parent has `Emergency`, give `Emergency` to all subissues
- `PriorityHigh` propagation: If parent has `PriorityHigh`, give `PriorityHigh` to all subissues

#### For Story issues and for Task issues with observable behavior changes: Required additional tasks

When processing a Story issue, or when a `[Task]` issue is determined to have "changed observable behavior" in step 1-1,
In addition to the functional task, be sure to create the following two tasks:

**① E2E test suite creation task (preceding task)**

```
Title: [Task] E2E test suite creation

## overview
Create an E2E test suite based on the acceptance conditions of story #<story issue number>.
Define acceptance tests with tests first before implementation begins.

## estimate
1pt — E2E test design and creation

## Dependencies
None (can be started immediately/implemented before implementation tasks)

## Parent story
#<story issue number>

## Parent branch
feature/issue-{parent number}

## remarks
task_type: e2e_test_creation
xp_Director should handle this task with xp_E2Etest <parent story number>.
```

**② Functional specification update task (successful task)**

```
Title: [Task] Functional specification update

## overview
Reflect implementation details of story #<story issue number> in spec/.
Perform after all implementation tasks are completed.

## estimate
1pt — Update and maintenance of functional specifications

## Dependencies
This task should be started after all implementation tasks (#<task number 1>, #<task number 2>, ...) are completed.
(Start after [Auditor GREEN] comments are recorded for all implementation tasks)

depends_on: #<List issue numbers of all implementation tasks separated by commas>

## Parent story
#<story issue number>

## Parent branch
feature/issue-{parent number}

## remarks
task_type: spec_update
xp_Director should handle this task with xp_doc_spec <epic> <parent story number>.
```

#### For Bug issues: Required predecessor tasks

When processing a bug issue, **always** create the following tasks before the fix task:

**Bug reproduction test additional task (highest priority/preceding task)**

```
Title: [Task] Bug reproduction test added

## overview
Add a test case that reproduces the reported bug #<bug issue number>.
Test first to prove the existence of bugs and set acceptance criteria for fix tasks.

## estimate
1pt — Design and create reproduction tests

## Dependencies
None (can be started immediately / must be performed before the correction task)

## Parent story
#<Bug issue number>

## Parent branch
feature/issue-{parent number}

## remarks
task_type: bug_reproduction_test
xp_Director should handle this task with xp_UnitTest + xp_FunctionalTest.
```

### 6. Update story card

Update the frontmatter of the story card ( `api/<EpicName>/stories/in_progress/` ):

```yaml
issue_number: <story issue number>
status: in_progress
```

### 7. Return execution plan to xp_Director

```
## Execution plan
<!-- Legacy protocol marker for Japanese-edition interoperability: ## 実行計画 -->

Issue type: Story / Task / Bug
Story issue: #<number>
Sub-issues (total <n>):
- #<Number> [Task] <Task Name> (<pt>pt) depends_on: None
- #<Number> [Task] <Task Name> (<pt>pt) depends_on: #<Depends on>
  ...

Ready to start (no depends_on):
- #<number>, #<number>, ...

Blocking (waiting for depends_on):
- #<number> ← Waiting for [Auditor GREEN] for #<dependent number>
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
# Example of visualizing dependencies (mermaid)
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

- Automatically detect GitHub repositories with `gh repo view`
- Proceed with issue creation one by one and report any errors to xp_Director immediately
