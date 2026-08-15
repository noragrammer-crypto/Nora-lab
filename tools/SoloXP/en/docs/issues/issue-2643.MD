# Issue #2643: [Task] Publication of Nora-lab by git subtree push

- URL: https://github.com/noragrammer-crypto/HolyAutomater/issues/2643
- Parent story: #2168
- Parent branch: feature/issue-2168

## Body

## overview
Run `make sync-nora-lab` (implemented in #2642) to synchronize `Nora-lab/tools/SoloXP/Ja`, and reflect it in the public repository (`noragrammer-crypto/Nora-lab`) with `git subtree push --prefix=Nora-lab nora-lab main`. Confirm that the link can be viewed without breaking.

## estimate
1pt — Execution + Viewing confirmation on the publishing side

## Dependencies
Start this task after completing #2642.

depends_on: #2642

## Parent story
#2168

## Parent branch
feature/issue-2168

## Comment history

### Comment 1 (2026-08-07 08:12 JST)

## Observable change check ([Task] Skip judgment)

Target: #2643 Observable behavior change: None Reason: Operational task to run `make sync-nora-lab` (implemented in #2642) and reflect it to the public repository with `git subtree push`. It does not involve any new design decisions or implementation, but only executes the existing synchronization pipeline (#2639 to #2642) and confirms the results, so it bypasses Architect and processes it as a normal implementation task.

Work started 2026-08-07 08:10 JST Session URL: https://claude.ai/code/session_018dxPFzVY29uFMF2bskJE8r [ProjectStatus: InProgress]

### Comment 2 (2026-08-07 08:15 JST)

[Tester completed]

## Test proposition (Unit)

Target: `workflow/__tests__/unit/issue-2643-nora-lab-link-check.unit.test.js` Test target: `workflow/scripts/check-relative-links.js` (`checkBrokenRelativeLinks(scanDir, boundaryDir)`)

When you publish with `git subtree push --prefix=Nora-lab nora-lab main`, `Nora-lab/` becomes the root of the public repository, so any relative links pointing outside `Nora-lab/` or relative links pointing to files that do not exist will be broken on the publishing side. The proposition of a function that detects this:

- [ ] Proposition 1: Determine that a relative link pointing to an actual file within the boundary is not broken.
- [ ] Proposition 2: Determine relative links pointing to non-existent files as broken.
- [ ] Proposition 3: Determine relative links pointing outside the boundary directory as broken.
- [ ] Proposition 4: Exclude http(s), anchor only, and mailto links.
- [ ] Proposition 5: An anchored relative link is determined by the existence of the actual file excluding the anchor.
- [ ] Proposition 6: Recursively scan markdown under scanDir

## Functional Test

Target: `workflow/__tests__/functional/issue-2643-nora-lab-publish-link-check.functional.test.js`

Targeting the real repository `Nora-lab/tools/SoloXP/Ja` (the synchronization destination after executing `make -C SoloXP sync-nora-lab`), verify that documents and ProcessIssues derived from SoloXP are synchronized, and that there are no broken links with `Nora-lab/` as the boundary using `checkBrokenRelativeLinks`.

## Execution results (before implementation/RED confirmation)

```
FAIL __tests__/unit/issue-2643-nora-lab-link-check.unit.test.js
  Cannot find module '../../scripts/check-relative-links'
FAIL __tests__/functional/issue-2643-nora-lab-publish-link-check.functional.test.js
  Cannot find module '../../scripts/check-relative-links'
```

RED as expected (`workflow/scripts/check-relative-links.js` not implemented, `Nora-lab/tools/SoloXP/Ja` not synchronized). Hand over to Implementer.

Note: The synchronization mechanism of `make sync-nora-lab` itself (exclusion targets, file names with spaces, deletion reflection) has already been sandbox verified in #2642 `SoloXP/tests/functional/issue-2642-makefile-sync-nora-lab.functional.test.js`, so in this task we focused on “actual public execution” and “broken link verification” without duplicating it.

### Comment 3 (2026-08-07 08:47 JST)

[Implementer completed]

## Implementation completed

Change file:
- `workflow/scripts/check-relative-links.js`: New. Implemented `checkBrokenRelativeLinks(scanDir, boundaryDir)`. With Nora-lab/ as the boundary, detect relative links pointing outside the boundary and relative links pointing to non-existent files.
- `SoloXP/docs/spec/README.md`: Corrected relative link depth errors in `../ARCHITECTURE.md` and `../WORKFLOW.md` (2 levels above `SoloXP/docs/spec/` is correct, so `../../ARCHITECTURE.md` and `../../WORKFLOW.md` (Actually, it was an existing bug that existed before release). Links to non-xp_-based skill specifications (under `workflow/` and `AINovelGenerator/`) are outside the Nora-lab public scope, so the link has been changed from a link to a path within a monorepo.
- `SoloXP/docs/spec/xp_reviewer.md`: Similarly, changed the related specification link under `workflow/` to path notation.
- Run `make -C SoloXP sync-nora-lab` to update `Nora-lab/tools/SoloXP/Ja`.

## Execution result

- Unit test (issue-2643 minutes): 6 PASS / 0 FAIL
- Functional test (issue-2643 minutes): 3 PASS / 0 FAIL (make sure there are no broken relative links in `Nora-lab/tools/SoloXP/Ja`)
- Entire `workflow/tests` (regression check): unit 96 PASS / 3 FAIL (known obsolescence of `process-issue-1654.unit.test.js`, unrelated/existing part to this task), functional 59 PASS / 0 FAIL
- `SoloXP/tests` whole (regression check): unit 132 PASS / 0 FAIL, functional 23 PASS / 0 FAIL

## `git subtree push` execution result

When I executed `git subtree push --prefix=Nora-lab nora-lab main`, there were differences after the direct push (direct push by the owner, such as article additions and CodeCompass workflows) on the public repository side, and it was rejected as non-fast-forward. I imported it with `git subtree pull --prefix=Nora-lab nora-lab main --squash` (all three conflicts were resolved as the owner's direct modification on the publishing side as positive), then pushed the split commit calculated with `git subtree push` as a new branch and issued a PR:

- **Nora-lab side PR**: https://github.com/noragrammer-crypto/Nora-lab/pull/20
- In this repository (Nora-lab), `main` is branch protected and cannot be pushed directly, so merging via PR is required (waiting for owner merge)
- CI (CodeCompass Hotspot Analysis) is running. Monitoring continues.

Please check with Auditor.

### Comment 4 (2026-08-07 08:50 JST)

[Auditor test running]

## /xp_RunTestSuites Results

Execution date and time: 2026-08-07 08:50 JST Branch: claude/issue-processing-a5vgle (base: feature/issue-2168)

### Unit tests
```
workflow: npx jest --testPathPattern=unit
Test Suites: 1 failed, 12 passed, 13 total
Tests:       3 failed, 96 passed, 99 total
```
- FAIL: `__tests__/unit/process-issue-1654.unit.test.js` (ProcessIssue SKILL.md description obsolete. Existing part and not subject to change in this task. Also known from Story E2E confirmation as of #2642)

```
SoloXP: npx jest --testPathPattern=tests/unit
Test Suites: 14 passed, 14 total
Tests:       132 passed, 132 total
```
- Results: 132 PASS / 0 FAIL (The direct test for issue-2643 is on the workflow side, so SoloXP only checks the regression, all PASS including existing ones)

### Functional testing
- This task is not a web application but a git operation/document verification, so preview URL communication confirmation is not applicable (same judgment as #2639 to #2642)
```
workflow: npx jest --testPathPattern=functional
Test Suites: 10 passed, 10 total
Tests:       59 passed, 59 total
```
- Results: 59 PASS / 0 FAIL (including 3 for issue-2643. `checkBrokenRelativeLinks` confirms that there are no broken links in the actual `Nora-lab/tools/SoloXP/Ja`)

```
SoloXP: npx jest --testPathPattern=tests/functional
Test Suites: 3 passed, 3 total
Tests:       23 passed, 23 total
```
- Results: 23 PASS / 0 FAIL (existing, no regression)

### Check implementation details
- Confirmed through 6 unit tests that `checkBrokenRelativeLinks` correctly detects out-of-bounds links and links to non-existent files.
- Corrected the relative link depth error (existing bug) in the actual `SoloXP/docs/spec/README.md` and `xp_reviewer.md`, and confirmed using actual data that there are no broken links in `Nora-lab/tools/SoloXP/Ja` after executing `make -C SoloXP sync-nora-lab`.
- Actually executed `git subtree push` and issued Nora-lab side PR #20 (https://github.com/noragrammer-crypto/Nora-lab/pull/20). Waiting for owner merge

### Overall judgment
✅ GREEN

[Auditor GREEN] PASS: 158 items (workflow unit 96 + workflow functional 59 + SoloXP unit 132 + SoloXP functional 23, including 9 new items for issue-2643) / Test commands: `npx jest --testPathPattern=unit`, `npx jest --testPathPattern=functional` (both workflow/ and SoloXP/)
