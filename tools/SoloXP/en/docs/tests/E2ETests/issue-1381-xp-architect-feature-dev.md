# E2E acceptance test: Issue #1381 Delegating xp_Architect conflict checking to feature-dev

## overview

E2E test suite to verify acceptance conditions for story #1381 "Delegating xp_Architect conflict checking to feature-dev".

- Test file: `SoloXP/tests/e2e/issue-1381-xp-architect-feature-dev.test.js`
- Number of test cases: 14
- How to run: `cd SoloXP && npx jest tests/e2e/issue-1381-xp-architect-feature-dev.test.js`

---

## Acceptance condition 1: step 3 is a description that calls feature-dev or an equivalent code search method

| # | Test case | Validation pattern | Condition |
|---|---|---|---|
| 1 | Contains a reference to feature-dev or equivalent code exploration agent | `/feature-dev\|Explore.*agent\|Explore subagent\|.../i` | ✅ PASS |
| 2 | Agent invocation description is included in the conflict check procedure (equivalent to step 3) | `in step3 section /feature-dev\|Explore\|subagent\|agent/i` | 🔴 RED (waiting for implementation) |

---

## Acceptance condition 2: Rules for converting feature-dev output to xp execution plan are specified.

| # | Test case | Validation pattern | Condition |
|---|---|---|---|
| 3 | Contains instructions for mapping depends_on and task_type | `/conversion\|mapping\|mapping\|convert/i` and `depends_on` + `task_type` both present | 🔴 RED (waiting for implementation) |
| 4 | Contains steps to convert code search results to task plans | `/Transformation\|Mapping\|mapping\|Output.*Execution Plan\|Exploration.*Plan/i` | 🔴 RED (waiting for implementation) |

---

## Acceptance condition 3: Fallback procedure in case feature-dev cannot be called is specified.

| # | Test case | Validation pattern | Condition |
|---|---|---|---|
| 5 | Contains reference to fallback | `/fallback\|fallback/i` | ✅ PASS |
| 6 | Alternative behavior (such as manual code tracing) is described in the fallback procedure | `/Fallback[\s\S]{0,400}(Manual\|manual\|Code tracing\|Existing.*Flow\|Conventional)/i` | ✅ PASS |
| 12 | The specific activation conditions (timeout, not found, unavailable, empty response) are specified in the fallback procedure (#2099) | `/Trigger condition/` and `/(Timeout\|Not found\|Unavailable\|Empty response)/` | ✅ PASS |
| 13 | Confirmation procedure (manual trace step/issue comment recording format) is specified in the fallback procedure (#2099) | `/Confirmation procedure/` and `/Fallback activation:\s*Yes/` | ✅ PASS |

---

## Acceptance condition 4: Existing xp flow (subissue issue/GitHub linkage) is not broken.

| # | Test case | Validation pattern | Condition |
|---|---|---|---|
| 7 | There is an instruction to issue a subissue | `/subissue.*issue\|sub.issue.*issue/i` | ✅ PASS |
| 8 | Depends_on field description exists | `/depends_on:/` | ✅ PASS |
| 9 | GitHub Sub-Issues API cooperation description exists | `/sub_issues\|GitHub Sub-Issues\|mcp__github__sub_issue/i` | ✅ PASS |
| 10 | task_type field description exists | `/task_type:\s*(e2e_test_creation\|spec_update)/` | ✅ PASS |
| 14 | The main processing flow sections (0, 1, 2, 4-7) are maintained even after adding the fallback (#2099 regression confirmation) | Check the existence of each `###` heading | ✅ PASS |

---

## Check the existence of SKILL.md

| # | Test case | Status |
|---|---|---|
| 11 | xp_Architect SKILL.md exists | ✅ PASS |

---

## Prerequisites

- `/root/.claude/skills/xp_Architect/SKILL.md` must exist
- xp_Architect SKILL.md must be readable as valid Markdown

## Given/When/Then

**Given**: xp_Architect SKILL.md exists in `/root/.claude/skills/xp_Architect/`

**When**: Run the E2E test script

**Then**:
- step 3 (conflict check step) contains feature-dev or equivalent code search agent call (AC1)
- Conversion rules from code search output to depends_on / task_type are specified (AC2)
- Fallback procedures in case feature-dev cannot be called (including activation conditions and confirmation procedures, switching to manual code tracing, etc.) are clearly specified (AC3)
- Existing sub-issue publication/GitHub linkage flow is intact (AC4)

## Test execution status

Before implementation (TDD RED state, as of #1381): 5 RED / 6 GREEN
After #2098 (SKILL.md step3 revision): 11 GREEN
After #2099 (definition of fallback activation conditions/confirmation procedure, addition of regression confirmation test): 14 GREEN (all PASS)
