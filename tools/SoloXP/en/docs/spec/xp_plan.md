# xp_plan functional specification

## overview

Skills as a planner to read story cards (Markdown), decompose tasks, estimate costs, and write the results back as YAML in frontmatter.

## Command

| Command | Description |
|---|---|
| `/xp_plan <storycard_path>` | Read story cards and perform task decomposition and estimation |
| `/xp_plan <storycard_path> --reestimate` | Reevaluate existing estimates and append to estimate_history |

## Processing flow

### 1. Load story card

Read the Markdown of the specified path and understand the existing frontmatter and story body (content to be implemented).

### 2. Task decomposition

Break down tasks from the following perspectives: design/specification finalization/implementation (subdivided by function)/testing/document update. Approximate task granularity: 1 task = 1-4pt (1pt ≈ half-day to one-day work).

For each task specify:

- **`depends_on` (dependency)**: Described in tasks that require completion of other tasks. Interface stub uncommitted tasks are required. Can be omitted if there are no dependencies.
- **`verifies` (corresponding to acceptance criteria)**: Enter the ID or corresponding wording of the acceptance criteria of the story that this task satisfies. **Required for all tasks, cannot be omitted**. Tasks that are not associated with any acceptance conditions (internal refactoring, preparation work, etc.) are clearly indicated as `verifies: none (reason)`.

### 3. Cost estimation

Assign story points (pt) to each task and briefly record the basis for the estimate.

### 4. Write back to frontmatter

#### First run

```yaml
---
title: <title>
epic: <epic name (estimated or user specified)>
status: backlog
estimate:
  total: <total pt>
  breakdown:
    - task: <task name>
      pt: <pt>
      note: <Reason/concerns>
      depends_on: <task name or issue number that must be completed before this task (if not, omit)>
      verifies: <ID/statement of the acceptance condition that this task satisfies. If there is no link, none (reason)>
estimate_history:
  - date: <YYYY-MM-DD>
    total: <total pt>
    reason: initial estimate
---
```

#### `--reestimate` time

Overwrite `estimate` with the new estimate and append to `estimate_history` (do not overwrite):

```yaml
estimate_history:
  - date: <old date>
    total: <old pt>
    reason: <old reason>
  - date: <new date>
    total: <new pt>
    reason: <reason for re-estimate>
```

## Output format

After execution, print the following to the console:

```
## Task decomposition result

| Task | pt | Notes | Depends | verifies |
|--------|-----|------|------|------|
| Design | 2 | API specification confirmation required | None | none (design confirmation only) |
| Implementation | 5 | ... | After design completion | AC-1 |
| Test | 2 | ... | After implementation | AC-1, AC-2 |

Total: 9pt

Updated story cards: StoryCards/backlog/xxx.md
```

## Directory conventions

```
api/<EpicName>/stories/
  backlog/ # not started
  in_progress/ # Under implementation (GitHub Issue already)
  done/ # done
```

- Snake case file name recommended: `persona_setting.md`
- Move folder = change status

## Linkage command

- `/xp_Architect <story_issue_number>`: Publish sub-issue from story issue (inherit `verifies` of `estimate.breakdown`)
- `/xp_move <storycard_path> <status>`: Move story card between folders

## Notes

- Ask user if epic name is unknown
- Estimates are estimates only. Assumed to change during implementation
- `--reestimate` is only used for intentional re-evaluation (does not run automatically)

## Changelog

| Date | Version | Changes | Issue |
|---|---|---|---|
| 2026-06-21 | 1.0.0 | New creation. Added the `verifies` (acceptance condition compatible) field as a required item in the task decomposition perspective | #1557, #1564 |
