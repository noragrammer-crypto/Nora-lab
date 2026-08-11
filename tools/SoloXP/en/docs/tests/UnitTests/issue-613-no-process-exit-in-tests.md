# Unit Tests: process.exit prohibition check in E2E test file

**Test file**: `SoloXP/__tests__/issue-613-no-process-exit-in-tests.unit.test.js`
**Corresponding issue**: #616 (Bug reproduction test, parent bug: #613)

## Test target

Verify that all test files under `SoloXP/tests/e2e/` use a failure mechanism compatible with Jest. Use of `process.exit()` is prohibited as it causes Jest worker crash → chain failure of other suites.

## Test case list

### Check file existence

| Test name | Type | Verification content |
|---|---|---|
| `A test file exists in the tests/e2e/ directory` | Normal system | There is one or more files in the E2E test directory |
| `issue-274 test file exists` | Normal system | `issue-274-story-close-on-allgreen.test.js` exists |

### process.exit detection (bug reproduction)

| Test name | Type | Verification content |
|---|---|---|
| `List of files containing process.exit can be accurately obtained` | Regression prevention | `process.exit` does not exist in the E2E test file (RED before modification) |

## Coverage Summary

- Normal system: 2 cases
- Regression prevention: 1 item

## How to run

```bash
cd SoloXP && npx jest --no-coverage --testPathPatterns="issue-613"
```

## remarks

This test was created to reproduce bug #613.
**Before fix (when bug exists)**: `file containing process.exit` test is RED (6 files detected)
**After modification (#617 completed)**: All tests are GREEN (3 PASS) ✅

Detected pattern: `/process\.exit\s*\(/` (1 line match)

Files to be modified (fixed in #617):
- `issue-243-sub-issue-reporting.test.js` line 136
- `issue-254-workflow-update.test.js` line 175
- `issue-274-story-close-on-allgreen.test.js` line 158
- `issue-397-process-issue-commands.test.js` line 208
- `issue-579-kakuyomu-post-web.test.js` line 219
- `issue-582-label-skip-workflow.test.js` line 184
