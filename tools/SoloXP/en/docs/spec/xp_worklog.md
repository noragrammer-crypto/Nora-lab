# xp_worklog functional specification

## overview

A prompt-driven skill that aggregates work time and token consumption from GitHub issue comments, outputs a report, and saves it to `worklog/`.

## Command

| Command | Description |
|---|---|
| `/xp_worklog <issue number or story card path>` | Aggregate work logs including sub-issues of the specified story and output a report |
| `/xp_worklog` (no argument) | Totalizes all recently closed issues and outputs an iteration report |

## Input format

Recognize the following as work log comments:

```
Start of work YYYY-MM-DD HH:MM JST
Work completed YYYY-MM-DD HH:MM JST / Required time: XX minutes
tokens: prompt=XXXk completion=XXXk total=XXXk
model: <model-id>
Work interrupted YYYY-MM-DD HH:MM JST
Work resumed YYYY-MM-DD HH:MM JST
```

### Timestamp processing

- JST clearly stated → Interpreted as JST
- JST Not specified (old format) → Interpret as UTC and convert to JST
- With interruption and restart → Calculate the required time excluding interruption time
- `Required time: XX minutes` Specified → That value will be given priority

### Token consumption format (added in #2141 and #2143)

- Add `tokens: prompt=XXXk completion=XXXk total=XXXk` immediately after the `Work completed` line (optional)
- Add `model: <model-id>` on the next line after the `tokens:` line (optional)
- `k` suffix = kilotokens (e.g. `350k` ​​→ 350,000 tokens)
- Interpret as an integer without `k`
- Corrupted format → Ask user (do not auto-complete)

### Token consumption aggregation rules

- Issues that span multiple sessions will **sum up** the tokens.
- Session issues without the `tokens:` line are displayed as "no record"

## Output format

### With arguments (story report)

```
## Work log report

Story: #<number> <title>
Duration: <first log date> to <last log date>

### Summary
Total time: <n>h <m> minutes
Estimate: <total>pt

### Breakdown by issue

| Issue | Title | Time | Token consumption |
|---|---|---|---|
| #<number> | <title> | <n>h <m> minutes | prompt=Xk completion=Xk total=Xk |
...
(Issues without the tokens: line are displayed as "No record")
```

### Without arguments (iteration report)

```
## Iteration report

### Summary by issue

| # | Title | Estimate | Actual | Token consumption | Difference |
|---|---|---|---|---|---|
| #<number> | <title> | <pt>pt | <n>h | prompt=Xk completion=Xk total=Xk | <±> |
...
(Issues without the tokens: line are displayed as "No record")
```

## Save format (`worklog/YYYY/MM/<epic>.md`)

```markdown
# <Epic name> — MM month, YYYY Work record

## Summary
- Total working time: Xh Ym
- Number of completed issues: N (with tokens recorded: M)
- Total token consumption: Xk (average per issue: Yk/issue)

## Records by issue

| Issue | Title | Start time | End time | Working time | Token consumption | Notes |
|-------|---------|---------|---------|---------|------------|------|
| #123 | Task name | YYYY-MM-DD HH:MM | YYYY-MM-DD HH:MM | XXm | prompt=Xk completion=Xk total=Xk | |
| #124 | Task name | YYYY-MM-DD HH:MM | YYYY-MM-DD HH:MM | XXm | No record | (*estimate) |
```

- If a file for the same epic in the same month already exists, update the merge while keeping the existing line.
- Issues that span multiple months are recorded in each monthly file.

## Epic unit token consumption summary (ROI) (added in #2144)

Add Epic-level ROI summary to reports with and without arguments.

### Aggregation method

1. Scan the `worklog/YYYY/MM/<epic name>.md` file and collect all month data of the target Epic
2. For Epic that spans multiple months, add up the token consumption of each month's file (if the same issue number is duplicated, the latest month entry takes priority)
3. `tokens:` Issues with no record are excluded from average calculation and displayed as "no record"

### Calculated value

| Item | Definition |
|---|---|
| **Number of completed issues** | Total number of issue lines recorded in the worklog file (including both with and without tokens recorded) |
| **Total token consumption** | `tokens:` Sum of `total=Xk` values ​​of issues with records |
| **Average token consumption per issue** | Total token consumption ÷ `tokens:` Number of recorded issues |

### Output format

```
### Epic unit token consumption ROI summary

| Epic | Number of completed issues | Total token consumption | Average token consumption per issue |
|------|------------|--------------|-------------------------|
| SoloXP | 12 items | 2,400k | 200k/issue |
| DiscordAIbot | 5 items | 800k | 160k/issue |
```

(The number of completed issues includes both those with and without tokens recorded. The average is calculated only for issues with tokens recorded.)

## Other processing

### Epic name determination
Determined from the label `epic/<EpicName>`. Japanese suffixes removed. `misc` for no label.

### If timestamp is not recorded
Use GitHub comment's `createdAt` (UTC) as an estimate. Specified as `(※estimated)`.

### Rerun issue2md
Rerun from the last processing number of `worklog/worklog_timestamp.md` and update `worklog_timestamp.md`.

## Related issues

| Issue | Title | Status |
|---|---|---|
| #1461 | [Story] AI development cost visualization — Token consumption tracking by issue | open |
| #2141 | [Task] Definition of token consumption record format and maintenance of work log rules | closed |
| #2143 | [Task] Addition of token consumption parsing and issue unit aggregation to xp_worklog | closed |
| #2144 | [Task] Addition of Epic unit token consumption aggregation and ROI display to xp_worklog | closed |
| #2145 | [Task] Add weekly token summary section to ops-meeting (see worklog data) | closed |
