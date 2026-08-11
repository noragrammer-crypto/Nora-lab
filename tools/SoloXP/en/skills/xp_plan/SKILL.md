# XP Planner Skill

## overview
A skill that reads XP story cards (Markdown), decomposes tasks and estimates costs, and writes the results back as frontmatter YAML.

## Command

### `/xp_plan <storycard_path>`
Read story cards and perform task decomposition and estimation.

### `/xp_plan <storycard_path> --reestimate`
Re-evaluate existing estimates and add to estimate_history.

---

## Operating procedure

### 1. Load story card
- Read Markdown file at specified path
- If there is frontmatter YAML, understand it as existing information
- Understand what should be implemented from the story text

### 2. Task decomposition
Decompose the task in terms of:
- Design and specifications confirmed
- Implementation (subdivided by function)
- test
- Documentation updated

Approximate task granularity: 1 task = 1-4pt (1pt ≈ half-day to one-day work)

Specify dependencies (blocks) for each task:
- If the task cannot be started unless other tasks are completed, write it in `depends_on`
- Always set dependencies for tasks with undefined interface stubs
- Can be omitted if there is no dependency

For each task, specify the story acceptance conditions that this task verifies:
- Write the ID of the acceptance criteria of the story or the wording of the relevant part in `verifies`
- Tasks that are not tied to any acceptance conditions (internal refactors, preparation work, etc.) should be clearly indicated as `verifies: none (reason)`
- `verifies` is a required item for all tasks. Cannot be omitted

### 3. Cost estimation
Assign story points (pt) to each task. The basis for the estimate should also be briefly recorded.

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
- Overwrite `estimate` with new estimate
- Add to `estimate_history` (do not overwrite)

```yaml
estimate_history:
  - date: <old date>
    total: <old pt>
    reason: <old reason>
  - date: <new date>
    total: <new pt>
    reason: <reason for re-estimate>
```

---

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

---

## Directory conventions

```
api/<EpicName>/stories/
backlog/ # not started
in_progress/ # Under implementation (GitHub Issue already)
done/ # done
```

- Snake case file name recommended: `persona_setting.md`
- Move folder = change status

---

## Linkage command

- `/xp_Architect <story_issue_number>` : Publish sub-issue from story issue
- `/xp_move <storycard_path> <status>` : Move story card between folders

---

## Notes

- Ask user if epic name is unknown
- Estimates are estimates only. Assumed to change during implementation
- `--reestimate` is only used for intentional re-evaluation (does not run automatically)
