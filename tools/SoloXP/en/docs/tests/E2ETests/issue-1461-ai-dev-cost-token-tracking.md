# E2E Test Document: Issue #1461
## AI development cost visualization — Token consumption tracking per issue

Test file: `SoloXP/tests/e2e/issue-1461-ai-dev-cost-token-tracking.test.js`

---

## User scenario overview

Enable to record and aggregate token consumption for AI development (Claude Code / Codex, etc.) by Issue/Epic. Define a manual recording format that adds `tokens:` / `model:` lines to work completion comments, and verify that `xp_worklog` parses it, aggregates it by issue and epic, and reflects it in the weekly report of `ops-meeting`.

---

## Prerequisites

- `CLAUDE.md` must exist
- `dotfiles/.claude/skills/xp_worklog/SKILL.md` must exist
- `SoloXP/skills/xp_worklog/SKILL.md` must exist
- `dotfiles/.claude/skills/ops-meeting/SKILL.md` must exist
- `SoloXP/skills/ops-meeting/SKILL.md` must exist

---

## List of test cases (15)

### Prerequisite: Token consumption record format is defined in CLAUDE.md (4 items)

| # | Given | When | Then |
|---|---|---|---|
| 1 | CLAUDE.md exists | Check the working time recording rules section | `tokens:` format example exists |
| 2 | CLAUDE.md tokens format example exists | Check field contents | `prompt=` / `completion=` / `total=` are included |
| 3 | CLAUDE.md exists | Check the model field | `model:` is written in the working time recording rule section |
| 4 | CLAUDE.md exists | Check the response policy in case of format corruption | There is a user confirmation instruction that mentions `tokens` / `model` |

### AC-1: Token consumption per issue can be aggregated with xp_worklog (3 items)

| # | Given | When | Then |
|---|---|---|---|
| 5 | xp_worklog SKILL.md exists | Check the format section of the work time comment | There is a description that recognizes `tokens:` |
| 6 | xp_worklog SKILL.md exists | Check report format by issue | There is a token consumption column (`tokens` or `tokens`) |
| 7 | xp_worklog SKILL.md exists | Check worklog file save format | Contains token consumption column |

### AC-3: Can be judged by the number of token consumption and completed issues in Epic units (3 issues)

| # | Given | When | Then |
|---|---|---|---|
| 8 | xp_worklog SKILL.md exists | Check the section on Epic unit aggregation | There is an Epic aggregation section that mentions token consumption |
| 9 | Epic summary section exists | Check the number of completed issues and token consumption description | Both are included in the same section |
| 10 | Epic aggregation section exists | Check the type of numbers to be aggregated | There is a description of total or average token consumption |

### AC-2: ops-meeting report includes weekly token summary (3 cases)

| # | Given | When | Then |
|---|---|---|---|
| 11 | ops-meeting SKILL.md exists | Check the description about the weekly token summary | There is a reference to the weekly token summary |
| 12 | ops-meeting SKILL.md exists | Check instructions for retrieving data from worklog | There are read instructions that mention worklog and tokens |
| 13 | ops-meeting SKILL.md exists | Check report output template | Contains token consumption section |

### File synchronization: dotfiles and SoloXP's SKILL.md have the same content (2 items)

| # | Given | When | Then |
|---|---|---|---|
| 14 | dotfiles and SoloXP's xp_worklog SKILL.md exist | Compare both files | The contents match exactly |
| 15 | dotfiles and SoloXP's ops-meeting SKILL.md exist | Compare both files | The contents match exactly |

---

## Implementation status

| Subissue | Contents | Status |
|---|---|---|
| #2141 | Definition of token consumption record format and maintenance of work log rules | Completed |
| #2143 | Addition of token consumption parsing and issue unit aggregation to xp_worklog | Completed |
| #2144 | Addition of Epic unit token consumption tally and ROI display to xp_worklog | Completed |
| #2145 | Added weekly token summary section to ops-meeting | Done |

---

## Execution result

| Execution date | PASS | FAIL | Status |
|---|---|---|---|
| 2026-07-18 | 6 | 9 | Before implementation (RED confirmation — only #2141 is complete) |
| 2026-07-19 | 10 | 5 | #2143 After implementation (AC-1 GREEN, AC-2/AC-3 RED — Scheduled to be implemented in #2144/#2145) |
| 2026-07-19 | 13 | 2 | #2144 After implementation (AC-1/AC-3 GREEN, AC-2 RED — Scheduled to be implemented in #2145) |
| 2026-07-20 | 15 | 0 | #2145 After implementation (all AC GREEN) |
