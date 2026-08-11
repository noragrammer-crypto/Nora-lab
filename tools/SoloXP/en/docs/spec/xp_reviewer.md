# xp_Reviewer functional specification

## overview

xp_Reviewer is a code review skill. xp_Director calls after confirming AllGREEN/E2E GREEN and performs code review before issuing PR.

---

## Command

| Command | Description |
|---|---|
| `xp_Reviewer <epic> <issue>` | Review the current PR/branch and record the results as issue comments |

---

## Call timing

Called from xp_Director's AllGREEN flow:

```
AllGREEN → xp_RunE2ETests → ✅ GREEN → xp_Reviewer → PR issue → Issue closed
```

---

## Risk classification and response

| Risk level | Response |
|---|---|
| High Risk | Issue comment record + Automatically raise improvement recommendation issue (label: `bug`) |
| Medium Risk | Issue comments only (no user action required) |
| Low Risk | Issue comments only (no user action required) |

---

## Output

### Issue comment (required)

```markdown
## xp_Reviewer report

### High Risk
<List of indications. If not, “none”>

### Moderate/low risk indication
<List of indications. If not, “none”>

### Overall review
<Overall quality evaluation>
```

### Improvement recommendation issue (only for high risk cases)

Automatically raise one issue for each high-risk finding:
- Title: `[Improvement Recommendation] <Summary of the findings>`
- Label: `bug`

---

## Notes

- If the Auditor's decision is to close, you can close the parent issue.
- No user action required for risks below medium (maintain the status quo)
- Do not write directly to code files

---

## Related specifications

The details are in the following file in the HolyAutomater monorepo (`workflow/` is not included in Nora-lab, so it is written as a path in the monorepo rather than a link. #2643):

- `workflow/docs/spec/xp-reviewer-skill.md` — Detailed specifications
- `workflow/docs/spec/xp-director-allgreen-pr.md` — Entire AllGREEN flow
- `workflow/docs/reference/xp-reviewer-skill.md` — Command reference
