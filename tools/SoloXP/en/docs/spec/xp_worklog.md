# xp_worklog functional specification

## Overview

A prompt-driven skill that aggregates work time and token consumption from GitHub issue comments, outputs a report, and saves it to `worklog/`.

## Command

| Command | Description |
|---|---|
| `/xp_worklog <issue番号 or ストーリーカードパス>` | Aggregate work logs including sub-issues of the specified story and output a report |
| `/xp_worklog` (no argument) | Totalizes all recently closed issues and outputs an iteration report |

## Input format

Recognize the following as work log comments:

```
作業開始 YYYY-MM-DD HH:MM JST
作業完了 YYYY-MM-DD HH:MM JST / 所要時間: XX分
tokens: prompt=XXXk completion=XXXk total=XXXk
model: <model-id>
作業中断 YYYY-MM-DD HH:MM JST
作業再開 YYYY-MM-DD HH:MM JST
```

### Timestamp processing

- JST clearly stated → Interpreted as JST
- JST Not specified (old format) → Interpret as UTC and convert to JST
- With interruption and restart → Calculate the required time excluding interruption time
- `所要時間: XX分` Specified → That value takes precedence

### Token consumption format (added in #2141 and #2143)

- Add `tokens: prompt=XXXk completion=XXXk total=XXXk` immediately after the `作業完了` line (optional)
- Add `model: <model-id>` to the next line after the `tokens:` line (optional)
- `k` suffix = kilotokens (e.g. `350k` → 350,000 tokens)
- If `k` is not specified, it is interpreted as an integer.
- Corrupted format → Ask user (do not auto-complete)

### Token consumption aggregation rules

- **Aggregate** tokens for issues that span multiple sessions
- Session issues without the `tokens:` line are displayed as "no record"

## Output format

### With arguments (story report)

```
## ワークログレポート

ストーリー: #<番号> <タイトル>
期間: <最初のログ日付> 〜 <最後のログ日付>

### サマリー
合計時間: <n>h <m>分
見積もり: <total>pt

### イシュー別内訳

| イシュー | タイトル | 時間 | トークン消費 |
|---|---|---|---|
| #<番号> | <タイトル> | <n>h <m>分 | prompt=Xk completion=Xk total=Xk |
...
（tokens: 行がないイシューは「記録なし」と表示）
```

### Without arguments (iteration report)

```
## イテレーションレポート

### Issue 別サマリー

| # | タイトル | 見積もり | 実績 | トークン消費 | 差異 |
|---|---|---|---|---|---|
| #<番号> | <タイトル> | <pt>pt | <n>h | prompt=Xk completion=Xk total=Xk | <±> |
...
（tokens: 行がないイシューは「記録なし」と表示）
```

## Save format (`worklog/YYYY/MM/<epic>.md`)

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

- If there is an existing file for the same epic in the same month, update the merge while keeping the existing line.
- Issues that span multiple months are recorded in each monthly file.

## Epic unit token consumption summary (ROI) (added in #2144)

Add Epic-level ROI summary to reports with and without arguments.

### Aggregation method

1. Scan the `worklog/YYYY/MM/<epic名>.md` file and collect all month data for target Epic
2. For Epic that spans multiple months, add up the token consumption of each month's file (if the same issue number is duplicated, the latest month entry takes priority)
3. `tokens:` Issues with no record are excluded from average calculation and displayed as "no record"

### Calculated value

| Item | Definition |
|---|---|
| **Number of completed issues** | Total number of issue lines recorded in the worklog file (including both with and without tokens recorded) |
| **Total token consumption** | Addition of `total=Xk` values of issues with `tokens:` records |
| **Average token consumption per issue** | Total token consumption ÷ `tokens:` Number of recorded issues |

### Output format

```
### Epic単位トークン消費ROIサマリー

| Epic | 完了Issue数 | 総トークン消費 | Issue単位平均トークン消費 |
|------|------------|--------------|-------------------------|
| SoloXP | 12件 | 2,400k | 200k/issue |
| DiscordAIbot | 5件 | 800k | 160k/issue |
```

(The number of completed issues includes both those with and without tokens recorded. The average is calculated only for issues with tokens recorded.)

## Other processing

### Epic name determinationDetermined from label `epic/<EpicName>`. Japanese suffixes removed. `misc` for no label.

### If timestamp is not recorded
Use `createdAt` (UTC) from GitHub comment as an estimate. Specified as `(※推定)`.

### Rerun issue2md
Rerun from the last processing number of `worklog/worklog_timestamp.md` and update `worklog_timestamp.md`.

### GitHub access method/MCP fallback
The reference count of the number of open issues (`gh issue list --state open --json number`) is based on an environment where `gh` cannot be used.
(ClaudeCodeWeb, etc.) falls back to `mcp__github__list_issues` (state: OPEN, fields: [number]),
The maximum number of items per page is 100, so the number is accumulated by paging (pattern established in `xp_issue2md`〈#3204〉. #3217).

## Related issues

| Issue | Title | Status |
|---|---|---|
| #1461 | [Story] AI development cost visualization — Token consumption tracking by issue | open |
| #2141 | [Task] Definition of token consumption record format and maintenance of work log rules | closed |
| #2143 | [Task] Addition of token consumption parsing and issue unit aggregation to xp_worklog | closed |
| #2144 | [Task] Addition of Epic unit token consumption tally and ROI display to xp_worklog | closed |
| #2145 | [Task] Add weekly token summary section to ops-meeting (see worklog data) | closed |
