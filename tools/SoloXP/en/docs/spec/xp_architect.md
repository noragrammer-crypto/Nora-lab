# xp_Architect skill specification

## overview

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

The first criterion for determining the type is whether it involves a change in behavior that is observable from the user/external side (= whether acceptance conditions can be written). The number and scale of tasks (whether they "span multiple tasks" or not) are secondary criteria and are used as reference information when a decision cannot be made based on the primary criteria alone.

| Type | Judgment criteria |
|---|---|
| **Story** | Added ability to write acceptance conditions (with changes in observable behavior), `[Story]` tag, and functionality that spans multiple tasks |
| **Task** | `[Task]` tag, single implementation work (if observable behavior change is involved, 1-1 necessity determination is mandatory) |
| **Bug** | `[Bug]` Tags, error reporting, and bugs in existing features |

Return the classification results to xp_Director (also used for subsequent planning).

### 1-1. Determine whether E2E/spec is required for Task issue (required)

Even for issues that are determined to be `[Task]`, Architect always explicitly determines the following and records the reason for the determination as a comment in the issue (prohibits implicit skipping of "unnecessary because it is a task"):

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

Calls the `code-architect` subagent (Agent tool, `subagent_type: code-architect` — provided by feature-dev plugin) to check for conflicts with existing implementations.

> **Background (#1381)**: There are no "architect" / "explore" subcommands in the `/feature-dev` command body,
> Phase 3 (Clarifying Questions), Phase 5 (Implementation approval), and Phase 6 (Review judgment)
> Cannot be incorporated into an automatic flow because it requires waiting for a human response. whereas the feature-dev plugin provides
> `code-architect` subagent itself is a read-only tool (Glob/Grep/LS/Read/NotebookRead/
> WebFetch/TodoWrite/WebSearch/KillShell/BashOutput) and can be called without waiting for a human response.

**How ​to call:**

Call the Agent tool passing the following:
- `subagent_type`: `code-architect`
- `prompt`: Including the purpose of the story/task, acceptance conditions, influence scope candidates (under `api/<EpicName>/`, etc.),
  Specify that ``I would like you to design it as an extension of the existing pattern without introducing a new one.''
- `isolation`: Not specified (no worktree required as it is read-only)

**Mapping output to xp execution plan:**

Convert the code-architect output format (Patterns & Conventions Found / Architecture Decision / Component Design / Implementation Map / Data Flow / Build Sequence / Critical Details) to xp execution plan (steps 4 and 5) using the following rules:

| code-architect output | mapping to xp execution plan |
|---|---|
| Each phase of Build Sequence | corresponds to the unit of sub-issue (each task of `estimate.breakdown`) |
| Order dependence in Build Sequence | Convert to `depends_on` (assigned to tasks that can only be started after the completion of the preceding phase) |
| Change each file in the Implementation Map | Specify the file to be changed in the "Summary" of the corresponding sub-issue |
| Critical Details (Test/Performance/Security perspective) | Use as reference information for the "overview" of the relevant task or step 1-1 (determining whether E2E/spec is required for the task) |
| Patterns & Conventions Found | Post as is in the comment format below and leave it as a basis for compliance with existing patterns |

**Comment the issue with conflict check results:**

```
## Conflict check with existing implementation (code-architect)

Target: #<issue_number>
Patterns & Conventions Found: <Summary>
Architecture Decision: <Summary>
Conflict presence/absence: Yes/No
```

**Fallback if `code-architect` cannot be called:**

**Activation conditions (activated if any one of them applies):**
- The call to the Agent tool itself fails with an error timeout.
- `subagent_type: code-architect` is not found/unavailable error is returned
- The call was successful, but the output does not contain any content equivalent to `Patterns & Conventions Found` (empty response/format corruption)

**Confirmation steps:**
1. Record any error messages or insufficient output as they occur
2. Switch to manual code tracing (Read of `api/<EpicName>/docs/spec/`, Grep/Glob of impact range, Read of existing tests)
3. Add and record the following in the comment format above:
   ```
   Fallback activation: Yes
   Reason for activation: <Error details recorded in 1 above>
   ```
4. Write the manual trace result (equivalent to Patterns & Conventions Found) in the same comment and use it for planning step 4.

**If you can't see any competition:**
- Report to xp_Director specifying any points that cannot be determined.
- xp_Director determines escalation

### 4. Drafting an execution plan

- Organize tasks based on `estimate.breakdown` of story cards
- Check and organize `depends_on` for each task
- If `estimate.breakdown` does not exist, report to run `xp_plan` first and exit.

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

If `depends_on` is set, be sure to specify the `depends_on:` field as well as the natural text description (the xp_Director dependency resolution check reads both formats, so omitting the field is not allowed).

**Labeling rules:**
- Add basic labels: `task`, `epic/<epic name>`
- If the label does not exist, create it with `gh label create` and then assign it.

After creating an issue, be sure to link it to the parent issue as GitHub Sub-Issues:

```bash
ISSUE_DB_ID=$(gh api repos/{owner}/{repo}/issues/<created issue number> --jq '.id')
gh api repos/{owner}/{repo}/issues/{parent_number}/sub_issues \
  --method POST \
  --field sub_issue_id=$ISSUE_DB_ID
```

As a result, `mcp__github__issue_read` (method: `get_sub_issues`) will correctly return subissues (`gh issue view --json subIssues` is not supported and will not be used).

**Priority label propagation (parent to child):**
If the parent issue has an `Emergency` or `PriorityHigh` label, propagate the same label to all sub-issues you create.

| Propagation conditions | Processing |
|---|---|
| Parent has `Emergency` | Give `Emergency` to all sub-issues |
| Parent has `PriorityHigh` | Give `PriorityHigh` to all sub-issues |

#### For Story issues and for Task issues with observable behavior changes: Required additional tasks

When processing a Story issue, or when the `[Task]` issue is determined to have "observable behavior changes" in step 1-1, the following two tasks must be created in addition to the functional task:

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

Update the frontmatter of the story card (`api/<EpicName>/stories/in_progress/`):

```yaml
issue_number: <story issue number>
status: in_progress
```

### 7. Return execution plan to xp_Director

```
## Execution plan

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

The architect's greatest responsibility is not to ``create something new,'' but to ``not destroy the existing design.'' The proposed design must be an **extension** of patterns that are already out there.

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

- GitHub repositories are automatically discovered with `gh repo view`
- Proceed with issue creation one by one and report any errors to xp_Director immediately

## Test

- E2E: `workflow/__tests__/e2e/issue-705-priority-label-selection.test.js` (acceptance condition 4: 12 items)

## Changelog

| Date | Version | Changes | Issue |
|---|---|---|---|
| 2026-04-24 | 1.0.0 | Priority label propagation rule added (Emergency/PriorityHigh) | #717 |
| 2026-06-21 | 1.1.0 | Redefine the first criterion for type determination as "Is there an observable change in behavior?" (scale is demoted to a secondary criterion). The E2E/spec necessity determination (step 1-1) for Task issues has been made mandatory, and the comment recording of the reason for the determination has been made mandatory. Expanding the scope of required additional tasks (E2E/spec) from Stories to "Tasks that involve Story or observable behavior changes" | #1557, #1565 |
| 2026-07-17 | 1.2.0 | Revised step 3 to call `code-architect` subagent (Agent tool, subagent_type: code-architect). Added mapping table from output (Build Sequence / Implementation Map etc.) to xp execution plan (depends_on / task_type). Specify fallback activation conditions (error, timeout, empty response) and confirmation procedure (manual code tracing procedure, comment format) | #1381 |
