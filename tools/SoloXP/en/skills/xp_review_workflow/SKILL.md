---
model: claude-sonnet-4-6
---

# XP Review Workflow Skill

## Command

### `/xp_review_workflow`

Load the issue/PR log for the past week,
Identify only one log that deviates most from the "ideal workflow (expected achievement conditions)",
Report as an improvement item.
Also include any suggestions for improvement.

---

## Constraints

- Do not make suggestions that conflict with Nora's policies or judgments.
- Just "Improving the writing style to make it easier for Claude to work"
- **Only one point**. Do not list multiple

---

## Workflow expected achievement conditions (normal completion conditions)

The normal completion conditions (expected achievement conditions) for each skill are defined below.
This is the standard for the "ideal workflow," and logs that do not meet the criteria are treated as "deviation logs."

| Skills | Expected achievement conditions (successful completion comment pattern) |
|---|---|
| xp_Architect | `[Architect完了]` or sub-issue with comments |
| xp_Tester | `[Tester完了]` |
| xp_Implementer | `[Implementer完了]` |
| xp_Auditor (test) | `[Auditor GREEN]` |
| xp_Auditor (doc) | `[PR発行済み #\d+]` |
| xp_Documenter | `[Documenter完了]` |

---

## Operating procedure

### 1. Get the issue/PR log for the past week

```bash
SINCE=$(date -d '7 days ago' +%Y-%m-%d)

# イシュー一覧（全件取得してから日付フィルタする）
gh issue list --repo noragrammer-crypto/HolyAutomater \
  --state all --limit 200 \
  --json number,title,labels,comments,body,createdAt,closedAt,updatedAt \
  > /tmp/xp_review_issues.json

# PR一覧
gh pr list --repo noragrammer-crypto/HolyAutomater \
  --state all --limit 200 \
  --json number,title,labels,comments,body,createdAt,closedAt,updatedAt,mergedAt \
  > /tmp/xp_review_prs.json
```

If `gh` cannot be used (such as ClaudeCodeWeb), replace `gh issue list` with `mcp__github__list_issues` (owner, repo,
Omit `fields` and get all fields (to include `closed_at`). When narrowing down with `fields`, `closed_at` is
`state` is also omitted to target all items, and `pageInfo.hasNextPage` is used.
(Page with `after` to get up to 200 results), then `gh pr list` with `mcp__github__list_pull_requests`
(Owner, repo, state: `all`, `fields` are similarly omitted, paging with `page`/`perPage`).

**The MCP response is different from the `gh --json` format read by subsequent Python processing, so before saving it to the /tmp file,
Perform the following normalization (as pointed out by Codex review, #3258. If you simply save the raw MCP response, `created_at`/
There is only `updated_at`, read `createdAt`/`updatedAt`, `in_range()` always returns False, working hours aggregation
No more hits for issue/PR): **

```python
def normalize(items):
    out = []
    for it in items:
        labels = [{'name': l} if isinstance(l, str) else l for l in it.get('labels', [])]
        out.append({
            **it,
            'createdAt': it.get('created_at', it.get('createdAt')),
            'updatedAt': it.get('updated_at', it.get('updatedAt')),
            'closedAt': it.get('closed_at', it.get('closedAt')),
            'mergedAt': it.get('merged_at', it.get('mergedAt')),
            'labels': labels,
        })
    return out
```

The list of issues / prs obtained by MCP is passed through this `normalize()` and the result is `/tmp/xp_review_issues.json` /
Save it to `/tmp/xp_review_prs.json` and use it without modification for subsequent Python processing (`in_range()` etc.)
(Conforms to the field normalization pattern established in `xp_issue2md`〈#3204〉. #3217, #3258).```bash
python3 -c "
import sys, json, datetime
since = datetime.datetime.fromisoformat('${SINCE}T00:00:00+00:00')

def in_range(item):
    for k in ('createdAt', 'updatedAt', 'closedAt'):
        v = item.get(k)
        if v and datetime.datetime.fromisoformat(v.replace('Z', '+00:00')) >= since:
            return True
    return False

issues = json.load(open('/tmp/xp_review_issues.json'))
prs = json.load(open('/tmp/xp_review_prs.json'))

xp_issues = [i for i in issues if in_range(i) and (
    '[Story]' in i['title'] or '[Task]' in i['title'] or '[Bug]' in i['title'] or
    any(l['name'].startswith('epic/') for l in i['labels'])
)]
xp_prs = [p for p in prs if in_range(p)]

print(json.dumps({'issues': xp_issues, 'prs': xp_prs}, ensure_ascii=False, indent=2))
"
```

### 2. Map actual progress to workflow

From the comments/text of the obtained issue/PR (`Closes #N`, etc.), each issue is
According to the table of expected achievement conditions Architect → Tester → Implementer → Auditor → PR issue → Close
Check that you have proceeded in this order.

Example of confirmation observation:
- Issues where `[Implementer完了]` is not recorded after `[Tester完了]`
- Issues where `[Auditor GREEN]` is not recorded after `[Implementer完了]`
- Issues where the same phase is repeated three or more times (remand loop)
- Issues with PRs issued without `[Auditor GREEN]` (mergedAt or `[PR発行済み]`)
- Although a PR exists, no completion comment is recorded on the associated issue.
- The part where Claude wrote in the comment that he was "at a loss for judgment" and "needed confirmation"
- Locations where multiple skills are performing the same process overlappingly

### 3. Identify the single most divergent log

Even if multiple deviations are found, select only the one with the largest deviation from the ideal workflow.
This process is also a step to identify issues that deviate from the ideal workflow.

Selection criteria (in order of priority):
1. Significant deviation from expected achievement conditions (complete missing phase, repeated loops, etc.)
2. High reproducibility (same type of deviation occurs in multiple logs)
3. Can be resolved with a small modification to the definition file
4. Improvements that do not go against Nora's intentions and policies

### 4. Identifying the cause SKILL

For the selected item, identify which SKILL.md definition caused the problem (identifying the cause SKILL).

Verification steps:
1. Identify the phase in which the discrepancy occurred (after which skill comment the problem occurred)
2. Check the SKILL.md of the skill in charge of that phase (causal SKILL)
3. Look for vague instructions, missing assumptions, and contradictory statements.

```
原因SKILL候補の例:
- xp_Director: ルーティング・フロー制御の問題
- xp_Tester: テスト作成・スキップ判定の問題
- xp_Implementer: 実装範囲・着手条件の問題
- xp_Auditor: GREEN/RED判定・PR発行の問題
```

### 5. Report

Output in the following format:

```
## ワークフロー振り返り（直近1週間）

### 一番乖離したログ
#<番号> <タイトル>（Issue / PR）

### あるべきワークフローとの乖離内容
<期待達成条件のどこから外れたか / 何が起きたか>

### 原因SKILL
<スキル名>の「<セクション名>」

### 改善案（一言）
<どう書き直せばよいか>
```

---

## Notes

- Points are fact-based. Do not include guesses that are not recorded in the log.
- Target is limited to logs from the most recent week (old logs are excluded)
- The improvement proposal is a modification of the "writing style" of the skill definition (do not propose implementation changes or policy changes)
- This skill does not modify files. End with just a report
