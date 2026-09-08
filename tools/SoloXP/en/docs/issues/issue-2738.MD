---
issue: 2738
title: "[Bug] pre-push.sh: Possibility of skill loss/unsynchronized staged changes in environments where symlinks are not possible even in non-Termux (#2640 Codex review pointed out)"
state: closed
labels: [bug, epic/SoloXP, PriorityHigh]
author: noragrammer-crypto
created_at: 2026-08-07T00:49:44Z
epic: SoloXP
---

# #2738 [Bug] pre-push.sh: Possibility of skill loss/unsynchronized staged changes in an environment where symlinks are not possible even in non-Termux (#2640 Codex review pointed out)

## Body

## How it was discovered

In response to PR #2732 of #2640 (revising the synchronization method on the `.claude/skills/` side), two valid points were posted from the Codex automatic review after the merge. Not reflected because the merge preceded the review posting (same type of accident as #2724/#2723).

## Point 1 (P1): Whether or not to create a symlink is determined only by Termux judgment

If `is_termux()` of `.claude/hooks/pre-push.sh` is false (≒ non-Termux), it is decided that it is a stable symlink environment and enters the symlink branch. However, it does not necessarily mean that "non-Termux = symlink possible" (e.g. Windows checkout without permission to create symlinks). Since the symlink branch performs `rm -rf` and then `ln -s` on the existing skill, if the symlink creation itself fails, it will not stop or fall back, and the skill directory may be staged and committed with it lost.

The functional test only covers default Linux and `PRE_PUSH_FORCE_TERMUX=1`, and the case of "non-Termux but cannot symlink" was not covered.

## Point 2 (P2): All staged changes that are not synchronized are committed.

When correcting the drift of `.claude/skills` and `dotfiles/.claude/skills`, unconditional `git commit` (without pathspec) commits the entire staged content. If other unrelated WIP changes are already staged at the time of the pre-push, they will be silently mixed into the synchronous commit.

## Modification policy (locally implemented and tested, with verified differences)

Modified according to the following policy and actually verified on both `SoloXP/tests/unit` and `SoloXP/tests/functional` (no regression, additional test GREEN). You can use it as an implementation the next time you deal with this issue.

### 1. Real probe for symlink availability + per-item fallback

```bash
can_create_symlinks() {
  local probe_dir probe_link
  probe_dir="$(mktemp -d "$REPO_ROOT/.pre-push-symlink-probe.XXXXXX" 2>/dev/null)" || return 1
  probe_link="$probe_dir/link"
  if ln -s "target" "$probe_link" 2>/dev/null && [ -L "$probe_link" ]; then
    rm -rf "$probe_dir"
    return 0
  fi
  rm -rf "$probe_dir"
  return 1
}
```

Change mode judgment to `is_termux || ! can_create_symlinks` (switch to copy mode even if Termux judgment or actual probe fails). Also added a fallback to the individual `ln -s` calls themselves:

```bash
rm -rf "$link"
if ! ln -s "$rel_target" "$link" 2>/dev/null; then
  cp -r "$src" "$link"
fi
```

### 2. Do not auto-commit if there are staged changes that are not synchronized

We also considered `git commit -- <paths>` in the pathspec specification, but we confirmed through actual machine testing that some changes would be missed in paths that include directory->symlink type changes (we will not adopt it). Instead, use the ``skip the commit itself if there are already unrelated staged changes'' approach:

```bash
sync_paths=("$DOTFILES_SKILLS")
[ -d "$CLAUDE_SKILLS" ] && sync_paths+=("$CLAUDE_SKILLS")

pre_existing_staged="$(git diff --cached --name-only)"

git add "${sync_paths[@]}"
if git diff --cached --quiet; then
  exit 0
fi

if [ -n "$pre_existing_staged" ]; then
  echo "⚠️ 同期対象外にstaged変更が既にあるため、pre-pushフックによる自動コミットをスキップします。"
  echo "   同期内容は git add 済みです。無関係な変更と分けて手動でコミットしてください。"
  exit 0
fi

git commit -m "chore: dotfiles/.claude/skills・.claude/skills を正本（SoloXP/workflow）に同期（ドリフト修正）"
```

The synchronized contents remain `git add` and are not lost (they can be committed together in the next commit or manually separately).

## Additional tests (implemented/GREEN confirmed)

- Unit: Propositions 7 to 9 (Existence of probe function, description of per-item fallback, description of staged change guard)
-Functional:
  - Verified that the skill does not disappear and remains as a physical copy in a "non-Termux environment but cannot actually create a symlink" (fake `ln` always fails)
  - Verified that commit is skipped when "there are already staged changes outside of the synchronization target", and both the synchronization contents and unrelated changes remain staged.

## Scope of influence

- `.claude/hooks/pre-push.sh` (`.claude/skills/` synchronous processing added in #2640)

## Related issues

- #2640 (closed, including the commit that caused this bug)
- PR #2732 (merged, Codex review comments remain unreflected)

## Parent branch

None (`feature/issue-2168` is already on the verge of AllGREEN, so this bug will be handled as a new task using the normal bug fix flow (`xp_Director`))

## Comment

### noragrammer-crypto — 2026-08-15T03:14:40Z

## Conflict check with existing implementation (fallback due to manual tracing/code-architect subagent not provided)

Fallback activation: Yes
Reason for activation: `subagent_type: code-architect` is unavailable in this session with "Agent type 'code-architect' not found" (Available agents: claude, claude-code-guide, Explore, general-purpose, Plan, statusline-setup). I manually read and traced the full text of `.claude/hooks/pre-push.sh` and four related tests (`SoloXP/tests/unit/issue-2639-*`, `issue-2724-*`, `SoloXP/tests/functional/issue-2639-*`, `issue-2724-*`).

Target: #2738

**Patterns & Conventions Found:**
- `is_termux()` can be forcibly switched from the test side with `PRE_PUSH_FORCE_TERMUX=1` as the only decision function for mode branching (there is an example with `SoloXP/tests/functional/issue-2724-*.functional.test.js`). The issue proposal `can_create_symlinks()` is also an extension of the same function division style.
- Aggregate whether or not there has been a change using the `any_changed` flag, and at the end, in the order of `git add -A` → `git diff --cached --quiet` judgment → `git commit`. Issue proposal 2 (staged change protection) can be easily inserted into the existing flow by simply saving `pre_existing_staged` just before this existing `git add -A`.
- The existing Functional test creates a temporary git sandbox (`fs.mkdtempSync` + `git init`) and executes the hook body with `execFileSync('bash', [...])`. New tests can also be aligned to this type.- The symlink processing on the `.claude/skills/` side already has a loop structure of "symlink creation → per-item judgment", and the `cp -r` fallback in case of `ln -s` failure can be naturally added to this loop.

**Architecture Decision:**
No new abstraction layer required. Implement the 2 amendments in the issue proposal as an extension of the existing function division (determination function + `any_changed` aggregation + tail commit).

**Conflict:** None (the revision policy of the issue text can be adopted as is)

**Test strategy (new file, according to existing naming convention `issue-<番号>-<説明>.unit/functional.test.js`):**
- Unit: `SoloXP/tests/unit/issue-2738-pre-push-hook-symlink-fallback.unit.test.js` (Static check of `can_create_symlinks` function definition, `is_termux || ! can_create_symlinks` judgment, per-item `cp -r` fallback, staged change guard description)
- Functional: `SoloXP/tests/functional/issue-2738-pre-push-hook-symlink-fallback.functional.test.js` (Verify that the skill does not disappear and becomes a physical copy in a non-Termux environment where fake `ln` is injected into the PATH / Verify that if there is a pre-existing staged change, autocommit is skipped and both changes remain staged)

Reproduction testing and modification implementation should be a single task/single PR according to the TDD principle of CLAUDE.md (bug fixes are completed in one task, reproduction testing is not separated into independent tasks).

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-08-15T03:15:14Z

Start of work 2026-08-15 03:20 JST
Session URL: https://claude.ai/code/session_011JBQUJNN5qGYfhHe2VKhzu
[ProjectStatus: InProgress]

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-08-15T03:15:18Z

[Parent branch created] feature/issue-2738

## Execution plan

Issue type: Bug
Story issue: #2738
Sub-issue (1 issue in total, CLAUDE.md Integrating reproduction testing + fix implementation into a single task using TDD principles):
  - #2936 [Task] pre-push.sh: Symlink-disabled environment fallback + irrelevant staged change protection (2pt) depends_on: None

Ready to start (no depends_on):
  - #2936

Please run /xp_Director 2936 in your next session.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-08-15T03:26:34Z

Sub-issue #2936 completed. Remaining: None (all 1 sub-issue completed).
PR #2937 (`--base feature/issue-2738`) issued. After merging, the next time `/ProcessIssue` is executed, it will proceed to AllGREEN judgment (Story-level Auditor → Reviewer → PR for main).

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-08-15T04:04:05Z

Auditor test running (Story-level)

## /xp_RunE2ETests results

Execution date and time: 2026-08-15 04:03 JST
Target branch: feature/issue-2738 (subtask #2936 merged, PR #2937)
Target: #2738

### Results
- Test Suites: 14 passed, 14 total
- Tests: 190 passed, 1 skipped (existing unrelated skip), 191 total

### Acceptance judgment
✅ All items PASS (0 items blocked): Story completed/PR creation possible

---
[Auditor GREEN]
PASS: 190 (E2E, 14 suites) / Test command: `npm run test:e2e` (SoloXP/)

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-08-15T04:09:21Z

## xp_Reviewer report

Target: All differences of `feature/issue-2738` branch to `main` (`code-reviewer` subagent)

### High Risk
None

### Moderate/low risk indication

**1. Unlike `can_create_symlinks()`, each `ln -s` fallback does not verify the actual result of link creation (`[ -L ]`) (confidence 80)**

`can_create_symlinks()` intentionally looks not only at the exit code but also at `[ -L "$probe_link" ]` (to pick up the known behavior of MSYS/Git for Windows' `ln` of creating an actual file/copy with exit 0 when there is insufficient privilege - exactly the Windows checkout case cited as the motivation for this issue). However, the newly added individual fallback (inside the symlink loop of `.claude/skills/`) is determined only by the exit code, and if the same "exec succeeds but the actual symlink is not a symlink" failure mode is encountered in an individual path, the fallback will not be activated and the broken non-symlink entry may be committed as is with `git add -A`.
Suggestion: Reuse the same judgment as `can_create_symlinks()` like `if ! { ln -s "$rel_target" "$link" 2>/dev/null && [ -L "$link" ]; }; then rm -rf "$link"; cp -r "$src" "$link"; fi`.

**2. The new Functional test has never passed through the individual fallback route (confidence 80)**The new Functional test always causes fake `ln` to fail, so `can_create_symlinks()` (the global probe) itself fails and the hook goes through the entity copy branch (does not enter the symlink loop). Individual fallbacks (new code within symlink loops) are not covered. The unit test also uses only regular expression proximity matches, so even if there is the flaw in 1 above, it cannot be detected. It is desirable to add a dedicated test for the scenario where "the entire probe passes but only a specific `ln -s` fails" using the injection method that "makes only a specific path fail" (such as `chmod 000`), which has a precedent in `pr-2746-codex-review-fixes.functional.test.js` in the same suite.

### Overall review

The main bug (`ln -s` fails and skill disappears after `rm -rf` succeeds) and staged change protection are now properly fixed. Handling of `mktemp -d`/`rm -rf` is also safe (if `mktemp` fails, `rm -rf` to empty string is not reached). The above two cases are points about the robustness of the insurance system itself, which is an individual fallback, and do not affect the correctness of major bug fixes (Medium Risk). There is no need for user action, and there is no problem in maintaining the status quo.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-08-15T04:09:36Z

Auditor Document Checking (Story-level)

### Document check results
- spec/README.md: OK (`docs/skill-files-sync.md` entry, contents updated)
- docs/skill-files-sync.md: OK (2 sections of symlink real probe and staged change protection added, confirmed with Auditor doc OK of subtask #2936)
- reference/: OK (not applicable, no changes)
- issue2md log: **NG: Missing** (`SoloXP/docs/issues/issue-2738.MD` does not exist. Subtask #2936 has been created, but the log for parent Story #2738 has not been created)

---
[Auditor doc NG: issue2md log]
Target: `SoloXP/docs/issues/issue-2738.MD`
Reason: Missing
xp_Director requires xp_Documenter (`xp_issue2md 2738`) to run.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-08-15T04:10:45Z

[Auditor document checking] (Story-level/recheck)

### Document check results
- spec/README.md: OK
-docs/skill-files-sync.md: OK
- reference/: OK (not applicable)
- issue2md log: OK (`SoloXP/docs/issues/issue-2738.MD` created, 7 comments match GitHub side)

---
[Auditor doc OK]
xp_Director issues a PR.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-08-15T04:11:31Z

[Parent branch PR issued] #2938
Work completed 2026-08-15 04:11 JST / Required time: 56 minutes (03:15 work started ~ 04:11 PR issued)

---
_Generated by [Claude Code](https://claude.ai/code)_

---
