# XP Planner Skill

> **Current status (as of 2026-08)**: In the current operation flow (originating from GitHub Issue, see `SoloXP/WORKFLOW.md`)
> Automatic calls from `xp_Architect` are not made. Originally iterated on Markdown story cards
> This is a remnant of the old system of managing plans, and currently issues are placed on GitHub and triaged by labels.
> The operation has been switched to executing the iteration plan (Details: #2965). Manual tasks based on StoryCard
> Leave it only as a means of execution when you want to disassemble and estimate.

## Overview
Load XP story cards (Markdown), decompose tasks and estimate costs,
Skill that writes the results back as frontmatter YAML.

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
- Write the story acceptance criteria ID or relevant text in `verifies`
- Tasks that are not linked to any acceptance conditions (internal refactoring, preparation work, etc.) should be clearly marked as `verifies: none（理由）`
- `verifies` is a required field for all tasks. Cannot be omitted

### 3. Cost estimation
Assign story points (pt) to each task.
The basis for the estimate should also be briefly recorded.

### 4. Write back to frontmatter

#### First run
```yaml
---
title: <タイトル>
epic: <エピック名（推定またはユーザー指定）>
status: backlog
estimate:
  total: <合計pt>
  breakdown:
    - task: <タスク名>
      pt: <pt>
      note: <根拠・懸念点>
      depends_on: <このタスクの前に完了が必要なタスク名またはイシュー番号（なければ省略）>
      verifies: <このタスクが満たす受け入れ条件のID/文。紐づかない場合は none（理由）>
estimate_history:
  - date: <YYYY-MM-DD>
    total: <合計pt>
    reason: 初期見積もり
---
```

#### `--reestimate` hours
- Overwrite `estimate` with new estimate
- Add to `estimate_history` (do not overwrite)

```yaml
estimate_history:
  - date: <旧日付>
    total: <旧pt>
    reason: <旧理由>
  - date: <新日付>
    total: <新pt>
    reason: <再見積もり理由>
```

---

## Output format

After execution, print the following to the console:

```
## タスク分解結果

| タスク | pt | 備考 | 依存 | verifies |
|--------|-----|------|------|------|
| 設計   | 2  | API仕様確認が必要 | なし | none（設計確認のみ） |
| 実装   | 5  | ... | 設計完了後 | AC-1 |
| テスト | 2  | ... | 実装完了後 | AC-1, AC-2 |

合計: 9pt

ストーリーカードを更新しました: StoryCards/backlog/xxx.md
```

---

## Directory conventions

```
api/<EpicName>/stories/
  backlog/      # 未着手
  in_progress/  # 実装中（GitHub Issue化済み）
  done/         # 完了
```

- Snake case file name recommended: `persona_setting.md`
- Move folder = change status

---

## Linkage command

- `/xp_Architect <story_issue_number>` : Publish sub-issue from story issue
- `/xp_move <storycard_path> <status>` : Move story cards between folders

---

## Notes

- Ask user if epic name is unknown
- Estimates are estimates only. Assumed to change during implementation
- `--reestimate` is used only for intentional re-evaluation (does not execute automatically)
