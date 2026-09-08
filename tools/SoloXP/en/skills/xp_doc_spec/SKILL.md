---
model: claude-sonnet-4-6
---

# XP Doc Spec Skill

## Command

### `xp_doc_spec <epic_name> <issue_number>`

Generate and update functional specifications.
**Story card = difference (delta), spec = integral (integral)**

---

## Processing flow

### 1. Decide the target directory

Determine the spec directory in the following order of priority:

| Priority | spec directory |
|-------|------|
| 1 (preferred) | if `api/<EpicName>/docs/spec/` exists |
| 2 (Fallback) | `<EpicName>/docs/spec/` (HolyAutomater has a monorepo configuration where `api/` is dedicated to Vercel Function entry points, so most epics are here) |

The "spec directory" in the following steps refers to the directory determined here.

### 2. Understand the current functional area map

Read `README.md` in the spec directory.

### 3. Read all issue text + comments

- Get the entire history of GitHub issue contents and comments (`gh` or MCP)
- Specification changes are often buried in comments, so check all of them.

### 4. Identify differences with existing specs

- Read all MDs under spec directory
- Identify specifications that will be added or changed in this issue

### 5. Integrate the difference

- If it is an existing area, update the corresponding MD
- If it is a new area, create a new file
- If one file is likely to exceed 200 to 500 lines, divide it appropriately.

### 6. Update index

Update the index of `README.md` in the spec directory.

### 7. Synchronize the status of related issues table

Get the actual issue status (open/closed) for each issue number listed in the "Related Issues" table of `README.md` and update the status column of the table.

- Get the current status with `gh issue view <番号> --json state`. If `gh` cannot be used (ClaudeCodeWeb etc.)
  Fallback to `mcp__github__issue_read` (method: `get`) (established in `xp_issue2md`〈#3204〉)
  pattern. #3217)
- Correct rows where the table status column is out of sync with the actual status (such as `open` even though it has been closed)
- Essential steps to prevent READMEs from being left stale

---

## Output

- `README.md` (updated) in spec directory
- `<領域>.md` (new or updated) in spec directory

---

## Notes

- Do not do the reverse direction of spec → stories (generating stories from spec, etc.)
- spec records the "current implementation". I will not write about future plans.
