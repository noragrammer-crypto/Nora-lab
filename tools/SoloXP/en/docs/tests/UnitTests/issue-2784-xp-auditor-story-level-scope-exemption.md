# Unit test: issue-2784-xp-auditor-story-level-scope-exemption

## Test target

`SoloXP/skills/xp_Auditor/SKILL.md` (static validation of its content)

A bug-reproduction test for the structural defect (Issue #2784) where, because the scope of
the Story-level Auditor phase (`### 3.`) and the Task-level-only "other task scope" bug
exemption logic section (`### 6.`) was not explicitly stated, the Task-level-only judgment
criterion "does not affect the current task's test results" could be misapplied at the
Story level as well, permanently institutionalizing missed REDs. It reproduces the bug
against the pre-fix state by regex-checking that the relevant SKILL.md section lacks the
scope-limiting wording ("Task-level専用" / Task-level only).

## Test file

`SoloXP/tests/unit/issue-2784-xp-auditor-story-level-scope-exemption.unit.test.js`

## Test case list

| Test case | Type | Content |
|---|---|---|
| The Story-level Auditor phase section (`### 3.`) explicitly states that the Task-level-only separate-scope exemption logic does not apply | Regression (happy path) | Fixed to GREEN in #2787 by adding scope-limiting wording ("Task-level専用" + "適用されない/援用できない/例外なく") |
| The "on discovering a bug in another task's scope" section (`### 6.`) explicitly states that it is Task-level only | Regression (happy path) | Fixed to GREEN in #2787 by adding a scope-limiting note at the top of the section stating it is Task-level only |

## Coverage summary

- Static checks for Story-level / Task-level scope-limiting wording: 2 cases
- Total: 2 cases (created as RED = bug reproduction in #2786; turned GREEN by the #2787 fix
  to `SoloXP/skills/xp_Auditor/SKILL.md`; now functions as a regression-prevention test)
