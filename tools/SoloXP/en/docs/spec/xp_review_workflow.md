# xp_review_workflow functional specifications

## overview

xp_review_workflow is a skill responsible for reviewing workflows and detecting deviations. Analyze comment patterns in issue logs and identify differences from expected workflow achievement conditions. Report only one improvement proposal. **Do not modify files. It ends with just a report.**

## Command

### `/xp_review_workflow`

Looking back at the XP Skills workflow, identify and report on just one point where you think, ``If it had been written this way, it would have worked better.''

---

## Constraints

- Do not make suggestions that conflict with Nora's policies or judgments.
- Just "Improving the writing style to make it easier for Claude to work"
- **Only one point**. Do not list multiple

---

## Workflow expected achievement conditions (normal completion conditions)

Comment patterns indicating successful completion of each skill (expected achievement conditions):

| Skills | Expected achievement conditions |
|---|---|
| xp_Architect | `[Architect completed]` or sub-issue publication comment |
| xp_Tester | `[Tester completed]` |
| xp_Implementer | `[Implementer completed]` |
| xp_Auditor (test) | `[Auditor GREEN]` |
| xp_Auditor (doc) | `[PR issued #\d+]` |
| xp_Documenter | `[Documenter completed]` |

---

## Deviation detection logic

Identify deviant issues using the following patterns:

- Issues without `[Implementer running]` after `[Tester completed]`
- Issues without `[Auditor GREEN]` after `[Implementer completed]`
- Issues where the same phase is repeated three or more times (remand loop)
- Issues with `[PR issued]` recorded without `[Auditor GREEN]`

---

## Identify the cause SKILL

If a deviation is found, identify which SKILL.md is the cause (identifying the cause SKILL).

1. Identify the deviation phase (after which skill comment the problem occurred)
2. Read the SKILL.md of the skill in charge
3. Look for vague instructions, missing assumptions, and contradictory statements.

---

## Report format

```
## Workflow review

### Issues
"<Section Name>" of <Skill Name>

### Current writing problem
<What exactly happened/How was it misunderstood?>

### Improvement proposal (one word)
<How should I rewrite it?>

### Issue based on
- #<number> <title> (<reason>)
```

---

## Notes

- Points are fact-based. Do not include guesses that are not recorded in the issue log.
- The improvement proposal is a modification of the "writing style" of the skill definition (do not propose implementation changes or policy changes)
- This skill does not modify files. End with just a report
