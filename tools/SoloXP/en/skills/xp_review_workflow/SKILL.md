---
model: claude-sonnet-4-6
---

# XP Review Workflow Skill

## Command

### `/xp_review_workflow`

Read the issue/PR logs for the past week, identify the one log that deviates the most from the "ideal workflow (expected achievement conditions)", and report it as an improvement item. Also include any suggestions for improvement.

---

## Constraints

- Do not make suggestions that conflict with Nora's policies or judgments.
- Just "Improving the writing style to make it easier for Claude to work"
- **Only one point**. Do not list multiple

---

## Workflow expected achievement conditions (normal completion conditions)

The normal completion conditions (expected achievement conditions) for each skill are defined below. This is the standard for the "ideal workflow," and logs that do not meet the criteria are treated as "deviation logs."

| Skills | Expected achievement conditions (successful completion comment pattern) |
|---|---|
| xp_Architect | `[Architect completed]` or sub-issue with comments |
| xp_Tester | `[Tester completed]` |
| xp_Implementer | `[Implementer completed]` |
| xp_Auditor (test) | `[Auditor GREEN]` |
| xp_Auditor (doc) | `[PR issued #\d+]` |
| xp_Documenter | `[Documenter completed]` |

---

## Operating procedure

### 1. Get the issue/PR log for the past week

```bash
SINCE=$(date -d '7 days ago' +%Y-%m-%d)

# Issue list (filter by date after getting all issues)
gh issue list --repo noragrammer-crypto/HolyAutomater \
  --state all --limit 200 \
  --json number,title,labels,comments,body,createdAt,closedAt,updatedAt \
  > /tmp/xp_review_issues.json

# PR list
gh pr list --repo noragrammer-crypto/HolyAutomater \
  --state all --limit 200 \
  --json number,title,labels,comments,body,createdAt,closedAt,updatedAt,mergedAt \
  > /tmp/xp_review_prs.json

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

Check whether each issue has progressed in the order of Architect → Tester → Implementer → Auditor → PR creation → Closed according to the table of expected achievement conditions from the comments/text of the obtained issue/PR (`Closes #N`, etc.).

Example of confirmation observation:
- Issues where `[Implementer completed]` is not recorded after `[Tester completed]`
- Issues where `[Auditor GREEN]` is not recorded after `[Implementer completed]`
- Issues where the same phase is repeated three or more times (remand loop)
- Issues with PR issued without `[Auditor GREEN]` (mergedAt or `[PR issued]`)
- Although a PR exists, no completion comment is recorded in the associated issue.
- The part where Claude wrote in the comment that he was "at a loss for judgment" and "needed confirmation"
- Locations where multiple skills are performing the same process overlappingly

### 3. Identify the single most divergent log

Even if multiple deviations are found, select only the one with the largest deviation from the ideal workflow.

Selection criteria (in order of priority):
1. Significant deviation from expected achievement conditions (complete missing phase, repeated loops, etc.)
2. High reproducibility (same type of deviation occurs in multiple logs)
3. The problem can be resolved with a small modification to the definition file.
4. Improvements that do not go against Nora's intentions and policies

### 4. Identifying the cause SKILL

For the selected item, identify which SKILL.md definition caused the problem (identifying the cause SKILL).

Verification steps:
1. Identify the phase in which the discrepancy occurred (after which skill comment the problem occurred)
2. Check the SKILL.md of the skill in charge of that phase (causal SKILL)
3. Look for vague instructions, missing assumptions, and contradictory statements.

```
Example of possible cause skill:
- xp_Director: Routing flow control issue
- xp_Tester: Problems with test creation and skip judgment
- xp_Implementer: Problems with implementation scope and start conditions
- xp_Auditor: GREEN/RED judgment or PR-creation issue
```

### 5. Report

Output in the following format:

```
## Workflow review (last week)

### The most divergent log
#<number> <title> (Issue/PR)

### Contents of deviation from the ideal workflow
<Where did we deviate from the expected achievement conditions/what happened>

### CauseSKILL
"<Section Name>" of <Skill Name>

### Improvement proposal (one word)
<How should I rewrite it?>
```

---

## Notes

- Points are fact-based. Do not include guesses that are not recorded in the log.
- Target is limited to logs from the most recent week (old logs are excluded)
- The improvement proposal is a modification of the "writing style" of the skill definition (do not propose implementation changes or policy changes)
- This skill does not modify files. End with just a report
