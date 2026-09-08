---
model: claude-haiku-4-5-20251001
---

# XP Worklog Skill

## Command

### `/xp_worklog <storycard_path または #issue番号>`

of the specified story issue (and sub-issues)
Aggregate and report work time comments and save to `worklog/`.

### `/xp_worklog` (no argument)

Aggregating all recently closed issues
View the iteration report and save it to `worklog/`.

---

## Format of working time comments

Recognize comments in the following format as work logs:

```
作業開始 <timestamp>
作業完了 <timestamp> / 所要時間: XX分
tokens: prompt=XXXk completion=XXXk total=XXXk
model: <model-id>
作業中断 <timestamp>
作業再開 <timestamp>
```

`<timestamp>` recognizes one of the following two formats (new format is correct, old format is legacy compatible):

- **New format (correct)**: ISO 8601 `YYYY-MM-DDTHH:mm:ss+09:00` with offset. `workflow/lib/get-jst-timestamp.js`
  with `getCurrentJstTimestamp()` (or CLI wrapper `workflow/scripts/get-jst-timestamp.js`)
  Value obtained mechanically from runtime and converted to Asia/Tokyo. LLM itself must not infer the current time or UTC to JST conversion.
  (#3279/#3281)
- **Legacy**: `YYYY-MM-DD HH:MM JST`. `JST` Interpret unspecified past timestamps as UTC
  (Backwards compatible. Not used for new records)

- Calculate the time required for one session with `作業開始` → `作業完了` (even if the new format and old format are mixed, calculate the difference after aligning the time zones)
- If `作業中断` / `作業再開` exists, calculate excluding interruption time.
- If `所要時間: XX分` is specified, that value takes precedence
- `tokens: prompt=XXXk completion=XXXk total=XXXk` is added immediately after the `作業完了` line (optional)
- `model: <model-id>` is added to the next line after the `tokens:` line (optional)
- `tokens:` Prompt user if line is malformed (do not autocomplete)

### Token consumption aggregation rules

- Parse the values of `prompt=XXXk`, `completion=XXXk`, `total=XXXk` from the `tokens:` line.
  - `k` suffix is in kilotokens (e.g. `350k` → 350,000 tokens)
  - `k` If there is no suffix, treat it as an integer.
- Issues that span multiple sessions will **sum up** token consumption.
  - If only some sessions have `tokens:` rows (mixed issue): `tokens:` values are only included in sessions with records.
    Display the total and add a note indicating that there are sessions with no records (for example:
    `prompt=120k completion=30k total=150k（一部セッション未記録）`). There are unrecorded sessions.
    For this reason, the recorded tokens of other sessions are treated as "unrecorded" and are not discarded until they are consumed (#2180)
- Show an issue as "no record" only if the `tokens:` line is not present in all sessions in the issue
  (Same treatment as "Issue with no working time comment")

### If timestamp is not recorded

If the start and end times are not recorded for the initial issue:- Generate estimates based on GitHub comment timestamp (`createdAt`, UTC)
- Use `createdAt` in the first comment as the start time
- Use `createdAt` from the last comment as the end time
- Estimated value is specified as `(※推定)` in the recording file.
- Check with the user for malformatted comments (do not auto-complete)

---

## Operating procedure

The aggregation flow is executed in the following three steps (①②③). **Direct acquisition of issue text and comments
(Data acquisition) is limited to the "MD overwrite update" step. ** Metadata search to narrow down issue number
(Only acquisition of title, label, update date and time using `search_issues`) is not subject to this restriction.
——If this metadata search is omitted, the MD update target cannot be identified and the flow itself will not be established, so it is allowed as an essential premise.

### With arguments

#### ①Identification of issues updated last week

- Record the execution start time (used in step 5). To determine the next target range based on this time,
  (Obtain it at the beginning of execution, before the search in ①)
- Check the list of target story/sub-issue numbers from `github_issue` on the story card or the specified issue number
- Check the last execution date and time of `worklog/worklog_timestamp.md` and `updated:>=<前回実行日時>` of `search_issues`
  (Metadata search. Text and comments are not retrieved) to narrow down to issues that were updated last week (first run/
  If there is no record, the starting point is the first week of the target period)
- Issues that are left open will also be targeted by this filter if there is an update.
- Also retain the metadata of `state` and `closedAt` included in this search result (when there are no arguments)
  Used in close aggregation filters. Similar to the execution start time used in ⑤, this is temporary data that is retained only during this execution.
  (Do not write to MD file)
- At this stage, only the issue number is identified (obtaining the issue text and comments will be left to the next step)

#### ②Local MD overwrite update by xp_issue2md

- Execute `xp_issue2md <issue_number>` for each target issue identified in ①,
  Overwrite `<EpicName>/docs/issues/issue-N.MD` with the latest contents
- **If there is an issue that does not yet have a local MD (`issue-N.MD`) under the target story,
  `updated_at` Execute `xp_issue2md` unconditionally regardless of filtering. ** Narrow down ① by “Last week”
  In order to target only issues that have been updated, issues that were omitted from the past `xp_issue2md` (e.g.
  Old issues (that were explicitly skipped during operation) will not be permanently converted to MD simply by this narrowing down. in that state
  If you proceed to step ③, it will be treated as "file does not exist = work time is zero", and the work time for the entire story will be reduced.
  underestimate
- **Retrieval of issue text and comments (direct data acquisition) is limited to this step. ** Directly from API for aggregation
  No processing is performed to obtain the text/comments (this is a case where the final content is not obtained due to issue2md startup time issue).
  (Resolved by re-running)

#### ③Aggregation of work time from local MD

Read the existing `<EpicName>/docs/issues/issue-N.MD` **All items** under the target story,
`## コメント` Aggregate the required time and token consumption from the work time comments in the section.
**Not limited to files updated in ②. ** ② only includes MDs of issues that were covered in ① (updated last week)Because it is overwritten and updated, existing files that do not need to be updated are also included in the aggregation target (from the refresh target in ②).
If you exclude child issues that were leaked, you'll underestimate the total work time for the story.)
**Does not retrieve comments directly from GitHub API. ** Aggregation is completed only by reading this local MD.

```
## ワークログレポート

ストーリー: #<番号> <タイトル>
期間: <最初のログ日付> 〜 <最後のログ日付>

### サマリー
合計時間: <n>h <m>分
見積もり: <total>pt（1pt ≈ 半日〜1日）

### イシュー別内訳

| イシュー | タイトル | 時間 | トークン消費 |
|---|---|---|---|
| #<番号> | <タイトル> | <n>h <m>分 | prompt=Xk completion=Xk total=Xk |
...
（全セッションで `tokens:` 行がないイシューのみ「記録なし」と表示する。一部セッションのみ記録がある
イシューは記録済みセッション分を合算し、未記録セッションがあることを付記する）

### 作業ログ詳細

#### #<番号> <タイトル>
| 日時 | 所要時間 | 備考 |
|---|---|---|
| YYYY-MM-DD | <n>分 | <中断あり等> |
...
```

#### 4. Save to worklog directory

Save the aggregation results to `worklog/YYYY/MM/<epic名>.md`.

**Epic name determination:**
- Look for the `epic/<EpicName>` pattern in the issue label
- Remove Japanese suffixes (extension, improvement, correction, etc.) included in the label.
- Match the repository root directory name by prefix match
- Use `misc` if there is no epic label

**Save file format:**

```markdown
# <Epic名> — YYYY年MM月 作業記録

## サマリー
- 合計作業時間: Xh Ym
- 完了Issue数: N件（tokens記録あり: M件）
- 総トークン消費: Xk（Issue単位平均: Yk/issue）

## イシュー別記録

| Issue | タイトル | 開始時間 | 終了時間 | 作業時間 | トークン消費 | 備考 |
|-------|---------|---------|---------|---------|------------|------|
| #123  | タスク名 | YYYY-MM-DD HH:MM | YYYY-MM-DD HH:MM | XXm | prompt=Xk completion=Xk total=Xk | |
| #124  | タスク名 | YYYY-MM-DD HH:MM | YYYY-MM-DD HH:MM | XXm | 記録なし | (※推定) |
```

- If a file for the same epic/same month already exists, add/update a new issue while preserving the existing issue line (merge update)
- Issues that span multiple months are recorded in separate files for each month.

#### 5. Update worklog_timestamp.md

After execution is complete, record the **last execution date and time** in `worklog/worklog_timestamp.md`. **The value to be recorded is ①
This is the acquired execution start time, not the execution completion time. ** Go to the target issue during execution (while processing ① to ④)
If a new comment is added, the update date and time of that comment may be earlier than the execution completion time.
Based on the completion time, it will be missed from the next `updated:>=` range and will be missed forever. execution start time
If recorded, updates that occur during the run will be included in the next `updated:>=<今回の開始時刻>` (within the range
Although there is a slight overlap, there is no real harm as re-running issue2md in ② is idempotent). The next time you run it, this
Determine the target range (①) using `updated:>=` based on the **previous execution date and time (=previous start time)**
(Do not use issue number-based cursors).

```markdown
| 実行日時（開始時刻） | 処理件数 | 備考 |
|---------|---------|------|
| YYYY-MM-DD HH:MM | 処理件数: N件 | |
```

---

### Without arguments (iteration report)

Processes ① to ⑤ are the same as when there are arguments (Identification of issues updated last week → Overwriting issue2md → Local MD aggregation →
Save worklog → update worklog_timestamp.md).

**The `updated:>=` filtering in ① and the filtering of report aggregation targets are treated as different things. ** ①
`updated:>=` is only for identifying "issues where local MD should be updated",
Even one comment added this week to an issue that was closed several weeks ago is counted.
If this is used as the parameter for "Issue closed this week" in the iteration report, the
Crows are mixed in. Therefore, in report aggregation (part of ③), the `closed_at` metadata held in ① is
Browse and narrow down to **only issues closed within the target period** before creating a report (`closed_at`
is not included in the local MD, so use the metadata search results from ①. What can be completed by loading local MD
The metadata from ① is used to narrow down the report target only by aggregating work time comments).

**Watermark recording in ⑤ differs from when there is an argument, and uses the boundary of the target period instead of the execution start time. ** With arguments
The execution start time of ① can be used as a watermark as is, but if there is no argument, it will be a regular cutoff (e.g. Saturday 15:00 UTC)
The actual execution start time may be different from the actual execution start time (execution may start with a delay, etc.). If the execution start time is
When set to watermark, issues closed between cutoff and start of execution will not be subject to ① in this execution.included, but is excluded because it is outside the reporting period (`closed_at` is after the current reporting period), and the next watermark
becomes the "current execution start time", so the `updated_at` of that issue will be before the next `updated:>=` range.
Never picked up again (permanently not included in reports). Therefore, when there is no argument, the watermark recorded in ⑤ is
Instead of "execution start time", use **``end boundary (cutoff time) of the current reporting period''**.

#### Reference count of open issues

```bash
gh issue list --state open --json number | python3 -c "import sys,json; print(len(json.load(sys.stdin)))"
```

If `gh` cannot be used (such as ClaudeCodeWeb), use `mcp__github__list_issues` (owner, repo, state: OPEN,
fields: [number]). While `pageInfo.hasNextPage` is true as there are maximum 100 items per page.
Accumulate the number of items while paging with `after` (pattern established in `xp_issue2md`〈#3204〉. #3217).

Targets the period equivalent to the most recent Sprint/iteration. Ask users if they are unsure of the period boundaries.

#### Output iteration report

```
## イテレーションレポート

期間: <開始日> 〜 <終了日>
クローズ Issue 数: <n>件
残オープン Issue 数: <n>件

### 合計作業時間
<n>h <m>分

### Issue 別サマリー

| # | タイトル | 見積もり | 実績 | トークン消費 | 差異 |
|---|---|---|---|---|---|
| #<番号> | <タイトル> | <pt>pt | <n>h | prompt=Xk completion=Xk total=Xk | <±> |
...
（全セッションで `tokens:` 行がないイシューのみ「記録なし」と表示する。一部セッションのみ記録がある
イシューは記録済みセッション分を合算し、未記録セッションがあることを付記する）

### 作業時間が記録されていない Issue
- #<番号> <タイトル>
...
```

Save all issues included in the iteration report to `worklog/YYYY/MM/<epic名>.md` by epic and month.
(Save format is the same as when there is an argument)

---

## Epic unit token consumption aggregation (ROI)

Add token consumption ROI aggregation per Epic to reports with arguments and iteration reports.

### Aggregation method

1. Scan the `worklog/YYYY/MM/<epic名>.md` file and collect all month data for the target Epic
2. For Epics that span multiple months, add up the token consumption of each month's files (if the same issue number is duplicated, the entry from the latest month takes priority)
3. `tokens:` Issues with no record are excluded from average calculation and displayed as "no record"

### Calculated values and output formats

- **Number of completed issues**: Total number of issue lines recorded in the worklog file (including both with and without tokens recorded)
- **Total token consumption**: Sum of `total=Xk` values of issues with `tokens:` records
- **Average token consumption per issue**: Total token consumption ÷ `tokens:` Number of issues with records

```
### Epic単位トークン消費ROIサマリー

| Epic | 完了Issue数 | 総トークン消費 | Issue単位平均トークン消費 |
|------|------------|--------------|-------------------------|
| SoloXP | 12件 | 2,400k | 200k/issue |
| DiscordAIbot | 5件 | 800k | 160k/issue |
```

(The number of completed issues includes both those with and without token records. The average is calculated only for issues with token records.)

---

## Notes

- Issues with no working time comments will be displayed as such.
- Check with the user for malformed comments instead of auto-completion
- Comparisons with estimates are displayed as reference values (not used for the purpose of blaming)
- `worklog/` Automatically create directory if it does not exist
- Automatically create year and month directories as needed
