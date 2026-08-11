# Unit Tests: xp_Director SKILL.md "Close"/"Close" notation consistency check

**Test file**: `SoloXP/__tests__/issue-614-close-vs-close-ja.unit.test.js`
**Corresponding issue**: #620 (Bug reproduction test, parent bug: #614)

## Test target

Verify that `SoloXP/skills/xp_Director/SKILL.md` and `dotfiles/.claude/skills/xp_Director/SKILL.md` describe the story closing instructions after AllGREEN in "close" (Japanese). Use of "Close" (English) is prohibited as it is inconsistent with the expected pattern of `issue-274-story-close-on-allgreen.test.js`.

## Test case list

### Check file existence

| Test name | Type | Verification content |
|---|---|---|
| `SoloXP SKILL.md exists` | Normal system | `SoloXP/skills/xp_Director/SKILL.md` exists |
| `dotfiles SKILL.md exists` | Normal system | `/root/.claude/skills/xp_Director/SKILL.md` exists |

### "Closed" pattern detection (bug reproduction)

| Test name | Type | Verification content |
|---|---|---|
| `[SoloXP] SKILL.md contains a "close" pattern` | Prevention of regression | SoloXP SKILL.md contains a pattern such as `GREEN.*CLOSE` (RED before modification) |
| `[dotfiles] SKILL.md contains a "close" pattern` | Prevention of regression | Dotfiles SKILL.md contains a pattern such as `GREEN.*CLOSE` (RED before modification) |

## Coverage Summary

- Normal system: 2 cases
- Regression prevention: 2 cases

## How to run

```bash
cd SoloXP && npx jest --no-coverage --testPathPatterns="issue-614"
```

## Validation pattern

```js
/E2E.*GREEN.*Close|GREEN.*Close|Close.*E2E GREEN|Story.*Close/
```

(Same pattern as `SoloXP/tests/e2e/issue-274-story-close-on-allgreen.test.js`)

## remarks

This test was created to reproduce bug #614.
**Before fix (when bug exists)**: 2 tests of `[SoloXP]` / `[dotfiles]` are RED (because "Close" exists in SKILL.md)
**After modification (#621 completed)**: All tests are GREEN (4 PASS) ✅

Files to be modified (scheduled for #621):
- `SoloXP/skills/xp_Director/SKILL.md:111` → `Publish PR and Close` → `Publish PR and close`
- `dotfiles/.claude/skills/xp_Director/SKILL.md:111` → Same as above
