# issue-2625-xp-auditor-doc-diff-stat-consistency unit test

## Test target

`SoloXP/skills/xp_Auditor/SKILL.md`

Added consistency between PR Summary (assumed change scope) and actual `git diff --stat` in xp_Auditor's doc mode.
Verify that the procedure to verify exists (bug reproduction/regression prevention of Issue #2625).

## Background

The explanation of PR #2426 was "only adding 2 files", but the actual merge commit (`f614d40`) is in the repository
The content was to delete a total of 8385 files. Merge after `[Auditor doc OK]` → `[Auditor GREEN]` judgment
necessitated an emergency revert (PR #2428) after the fact. The cause is that the doc mode of `xp_Auditor` is incorrect in the PR body.
The consistency between the Summary and the actual change scope (diff scope) was not verified.

## Test file

`SoloXP/tests/unit/issue-2625-xp-auditor-doc-diff-stat-consistency.unit.test.js`

## Test case list

| Test case | Type | Content |
|---|---|---|
| doc mode processing flow section exists | Normal system | `## 処理フロー（doc モード）` section exists in SKILL.md |
| The procedure for acquiring the change range using git diff --stat is clearly specified | Preventing regression | There is a description of `git diff --stat` |
| Procedures for checking consistency with the PR Summary (expected range of changes) are clearly specified | Prevention of regression | `PR Summary` and `整合性` are written |
| If the discrepancy is large, it is clearly stated that OK is not issued and the request is sent back for confirmation | Preventing regression | `乖離`, `NG`, `要確認`/`差し戻` are written near `git diff --stat` |
| A diff scope consistency line has been added to the check result comment template | Preventing regression | `diffスコープ整合性` must be written |
| NG case of diff scope inconsistency is added to the return category to xp_Director | Prevention of regression | `[Auditor doc NG: diffスコープ不整合]` must be described |
| Past accident (PR #2426) is referenced as evidence | Prevention of regression | `#2426` must be stated |
| It is clearly stated that the remote tracking branch with origin/ is used as the base instead of a branch name that does not exist locally. | Preventing regression (as pointed out by Codex review PR #3375) | There is a description of `origin/feature/issue-{親番号}` and `origin/main` |
| It is clearly stated that uncommitted changes are detected by comparing with the work tree instead of comparing between commits (`<base>...HEAD`) | Preventing regression (codex review pointed out PR #3375) | `作業ツリー` and `未コミット` must be written near `git diff --stat <base>` |
| Story-level AllGREEN flow explicitly states that origin/feature/issue-{parent number} is targeted instead of the current session branch | Prevention of regression (codex review pointed out PR #3375) | `Story-level AllGREENフロー` and `現在のセッションブランチをそのまま比較してはならず` must be described |

## Implementation notes

- Added new step "2.5. PR Summary andAdded "consistency check of actual change range (git diff --stat)", and if the discrepancy is large, `[Auditor doc OK]`
  Fixed to send back to xp_Director as `[Auditor doc NG: diffスコープ不整合]` without issuing
- The same content has also been reflected in the doc mode specifications of `SoloXP/docs/spec/xp_auditor.md`.
- Following Codex automatic review (P1×2, P2×1) for PR #3375, base resolution and diff ranges were modified as follows:
  1. The fetched `feature/issue-{親番号}` is not locally
     Based on `origin/feature/issue-{親番号}` (prevents ambiguous revision errors)
  2. Use `git diff --stat <base>` (working tree comparison) instead of `<base>...HEAD` inter-commit comparison
     (Uncommitted changes to xp_Implementer/xp_Documenter are also included in the detection target)
  3. In Story-level AllGREEN flow, explicitly fetched instead of current session branch
     Target `origin/feature/issue-{親番号}` (actually diagnose the branch that is the head of the PR)

## Coverage Summary

- doc mode section existence confirmation: 1 item
- Bug reproduction verification of diff scope consistency check: 6 items
- Accuracy verification of base resolution/diff range (corresponding to Codex review indications): 3 items
- Total: 10 items
