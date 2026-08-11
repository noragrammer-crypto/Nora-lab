---
model: claude-haiku-4-5-20251001
---

# XP Worklog Skill

## Command

### `/xp_worklog <storycard_path or #issue number>`

Aggregates and reports the working time comments for the specified story issue (and sub-issues) and saves it to `worklog/`.

### `/xp_worklog` (no arguments)

Displays an iteration report that aggregates all recently closed issues and saves it to `worklog/`.

---

## Format of working time comments

Recognize comments in the following format as work logs:

Accept both the English markers below and the existing Japanese protocol markers: `作業開始`, `作業完了`, `作業中断`, and `作業再開`.

```
Start of work YYYY-MM-DD HH:MM JST
Work completed YYYY-MM-DD HH:MM JST / Required time: XX minutes
tokens: prompt=XXXk completion=XXXk total=XXXk
model: <model-id>
Work interrupted YYYY-MM-DD HH:MM JST
Work resumed YYYY-MM-DD HH:MM JST
```

- Calculate the time required for one session by `Start work` → `Complete work`
- Also calculate a session from `作業開始` → `作業完了`; treat `作業中断` / `作業再開` exactly like `Work interrupted` / `Work resumed`.
- Timestamps with `JST` at the end are treated as JST.
- Past timestamps without `JST` are interpreted as UTC, and the required time is calculated after aligning the time zones.
- If there is a `work interruption` / `work restart`, the interruption time is excluded from the calculation.
- If `Required time: XX minutes` is specified, that value will be given priority.
- `tokens: prompt=XXXk completion=XXXk total=XXXk` is added immediately after the `work completed` line (optional)
- `model: <model-id>` is added to the next line after the `tokens:` line (optional)
- Prompt user if `tokens:` line is malformed (do not autocomplete)

### Token consumption aggregation rules

- Parse the values ​​of `prompt=XXXk`, `completion=XXXk`, and `total=XXXk` from the `tokens:` line.
- `k` suffix is ​​in kilotokens (e.g. `350k` ​​→ 350,000 tokens)
- If there is no `k` suffix, treat it as an integer.
- Issues that span multiple sessions will **sum up** token consumption.
- Session issues without the `tokens:` line are displayed as "no record"
(Same treatment as "Issue with no working time comment")

### If timestamp is not recorded

If the start and end times are not recorded for the initial issue:
- Generate estimates based on GitHub comment timestamp (`createdAt`, UTC)
- Use `createdAt` of first comment as start time
- Use `createdAt` of the last comment as the end time
- Estimated values ​​are specified as `(*estimated)` in the recording file.
- Check with the user for comments that are out of format (do not auto-complete)

---

## Operating procedure

### With arguments

#### 1. Identify the issue

- Get the story card's `github_issue` or specified issue number
- Get a list of comments for a story issue
- Also obtain sub-issues (task issues) and collect comments

#### 2. Aggregation/report output

```
## Work log report

Story: #<number> <title>
Duration: <first log date> to <last log date>

### Summary
Total time: <n>h <m> minutes
Estimate: <total>pt (1pt ≈ half day ~ 1 day)

### Breakdown by issue

| Issue | Title | Time | Token consumption |
|---|---|---|---|
| #<number> | <title> | <n>h <m> minutes | prompt=Xk completion=Xk total=Xk |
...
(Issues without the `tokens:` line are displayed as "No record")

### Work log details

#### #<number> <title>
| Date and time | Required time | Notes |
|---|---|---|
| YYYY-MM-DD | <n> minutes | <Interruptions, etc.> |
...
```

#### 3. Save to worklog directory

Save the tally results to `worklog/YYYY/MM/<epic name>.md`.

**Epic name determination:**
- Look for `epic/<EpicName>` pattern in issue labels
- Remove Japanese suffixes (extension, improvement, correction, etc.) included in the label.
- Match the repository root directory name by prefix match
- Use `misc` if there is no epic label

**Save file format:**

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

- If a file for the same epic/same month already exists, add/update a new issue while preserving the existing issue line (merge update)
- Issues that span multiple months are recorded in separate files for each month.

#### 4. Rerun issue2md

- Read the last processed issue number from `worklog/worklog_timestamp.md`
- Run `xp_issue2md` for issues from the last last number to the latest
- Update the case where the content is not final due to issue2md startup time issue by re-running
- After completing the process, add the execution record to `worklog_timestamp.md`:

```markdown
| YYYY-MM-DD HH:MM | #<Final issue number> | Number of items processed: N |
```

#### 5. Update worklog_timestamp.md

Add execution record to `worklog/worklog_timestamp.md` when execution is completed.

---

### Without arguments (iteration report)

#### 1. Collect recently closed issues, count open issues

```bash
gh issue list --state closed --limit 20
gh issue list --state open --json number | python3 -c "import sys,json; print(len(json.load(sys.stdin)))"
```

Target closed issues equivalent to the most recent Sprint/iteration. Ask users if they are unsure of the period boundaries.

#### 2. Output iteration report

```
## Iteration report

Period: <start date> ~ <end date>
Number of closed issues: <n>
Number of remaining open issues: <n>

### Total working time
<n>h <m> minutes

### Summary by issue

| # | Title | Estimate | Actual | Token consumption | Difference |
|---|---|---|---|---|---|
| #<number> | <title> | <pt>pt | <n>h | prompt=Xk completion=Xk total=Xk | <±> |
...
(Issues without the `tokens:` line are displayed as "No record")

### Issue where working time is not recorded
- #<number> <title>
...
```

#### 3. Save to worklog directory

Save all issues included in the iteration report by epic and month in `worklog/YYYY/MM/<epic name>.md`. (Save format is the same as when there is an argument)

#### 4. Rerun issue2md/update worklog_timestamp.md

Executes the same processing as when an argument is provided.

---

## Epic unit token consumption aggregation (ROI)

Add token consumption ROI aggregation per Epic to reports with arguments and iteration reports.

### Aggregation method

1. Scan the `worklog/YYYY/MM/<epic name>.md` file and collect all month data of the target Epic
2. For Epics that span multiple months, add up the token consumption of each month's files (if the same issue number is duplicated, the entry from the latest month takes priority)
3. `tokens:` Issues without records are excluded from average calculation and displayed as "no records".

### Calculated values ​​and output formats

- **Number of completed issues**: Total number of issue lines recorded in the worklog file (including both with and without tokens recorded)
- **Total token consumption**: `tokens:` Sum of `total=Xk` values ​​of issues with records
- **Average token consumption per issue**: Total token consumption ÷ `tokens:` Number of issues with records

```
### Epic unit token consumption ROI summary

| Epic | Number of completed issues | Total token consumption | Average token consumption per issue |
|------|------------|--------------|-------------------------|
| SoloXP | 12 items | 2,400k | 200k/issue |
| DiscordAIbot | 5 items | 800k | 160k/issue |
```

(The number of completed issues includes both those with and without token records. The average is calculated only for issues with token records.)

---

## Notes

- Issues with no working time comments will be displayed as such.
- Check with the user for malformatted comments instead of auto-completion
- Comparisons with estimates are displayed as reference values ​​(not used for the purpose of blaming)
- Automatically create the `worklog/` directory if it does not exist
- Automatically create year and month directories as needed
