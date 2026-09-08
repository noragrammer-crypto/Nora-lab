---
model: claude-sonnet-4-6
---

# XP Issue Archive Finalize Skill

## Command

### `/xp_issueArchiveFinalize <EpicName>`

Among the Issue Markdown snapshots saved in `<EpicName>/docs/issues/issue-*.MD`,
If the front matter is `state: open` and it is closed on GitHub,
Replace with the latest version (including text, comments, and front matter).

> **Caller**: Called from `xp_Director` (near AllGREEN flow), `daily-tasks` (regular execution of Epic cross-over).

---

## Background (Issue #2971)

`docs/issues/issue-*.MD` just takes a snapshot of the GitHub issue state at the time of acquisition,
Even if the issue is later closed on GitHub, the Markdown side will not be automatically updated. Especially for task issues.
In Markdown, the execution timing of `xp_Documenter` (which includes `xp_issue2md`) is based on `xp_Director`
Since it is **earlier** than `gh issue close`, it almost always remains `state: open` as old as soon as it is generated.

This skill has a two-step operation: ``Allow some stale while open, and finalize it as a completed document after closing.''
In order to achieve this, it is responsible for the synchronization process near the completion of the Epic (no constant synchronization or re-obtaining of all issues).

---

## Responsibilities

- Identify `state: open` Issue Markdown under the target Epic as candidates
- Double-check the actual state on GitHub for each candidate
- If it is already closed, reuse the existing `xp_issue2md` and regenerate the entire thing (no new generation logic will be created)
- Don't rewrite any open candidates yet
- Report the number of scans, finalizes, and skips as a summary to the caller.

**This skill itself does not write code (it only generates documents as a Documenter-type responsibility). **

---

## Processing flow

### 1. Identify candidates

Delegate the definitive filesystem traversal to `SoloXP/scripts/find-stale-issue-archives.sh`:

```bash
SoloXP/scripts/find-stale-issue-archives.sh <EpicName>
```

The issue number of the file under `<EpicName>/docs/issues/` whose front matter is `state: open`
Standard output with one item per line. Returns empty if `docs/issues` does not exist or there are 0 candidates
(Does not cause an error).

If the output is empty, report the summary of step 4 as "no candidates" and exit.

### 2. Recheck the status on GitHub for each candidate

Perform only a light status check for each candidate issue number (do not re-obtain the text/comments yet):

```bash
gh issue view <issue_number> --json state -q .state
```

If `gh` cannot be used (such as ClaudeCodeWeb, `HTTP 403` etc. fails), use the GitHub MCP tool.
Fallback (same as pattern already established with `xp_issue2md`):

```
mcp__github__issue_read（method: get, issue_number: <issue_number>）
  → state フィールドを確認する
```

### 3. Regenerate if closed, do nothing if it remains open

- Call `closed`: `xp_issue2md <issue_number> <EpicName>` on GitHub (this command
  `<EpicName>` argument, i.e., pass the epic directory where the candidate file was found as is).
  Regenerate the entire text, all comments, and front matter (including `state: closed`).The storage path and front matter format completely follow the existing specifications of `xp_issue2md` (this skill
  does not have its own regeneration logic).

  **`<EpicName>` must not be omitted**: `xp_issue2md` is the issue label if omitted.
  Redetermine the save destination epic based on the label from (`epic/<EpicName>`). Candidate file
  There is a discrepancy between the actual directory and the epic name pointed to by the issue label.
  Cases (e.g. `Cowork/docs/issues/issue-596.MD` has label `epic/kakuyomu-post`
  `kakuyomu-post/` directory does not exist directly under the repository), label-based judgment is
  Unable to determine whether to resolve directories unrelated to candidate files, requesting user confirmation,
  Unattended execution (calls from `daily-tasks`, etc.) stops/loses writing (Codex review
  Pointed out/PR #3508). If `<EpicName>` is specified, this label re-judgment will be skipped.
  The candidate file itself is definitely overwritten.
- Still on GitHub `open`: **Does nothing**. Do not rewrite any files
  (To avoid unnecessary rewriting to open issues. Acceptance condition of #2971).

Repeat the above for all candidates.

### 4. Report summary

Report to the caller (`xp_Director` or `daily-tasks`) in the following format:

```
## Issue Archive Finalize 完了

対象Epic: <EpicName>
走査件数: <候補として抽出したファイル数>
finalize件数: <closed判定で再生成した件数>
スキップ件数: <まだopenで書き換えなかった件数>
```

---

## Notes

- This skill queries GitHub API for only `state: open` candidates. Re-enumerate all issues each time
  No constant synchronization (non-purpose of #2971)
- Issue Markdown's `state` is resolved by SoloXP's `depends_on` and `[Auditor GREEN]` is determined by SSOT.
  No. Workflow judgment will continue based on the actual status on GitHub, `[Auditor GREEN]` comments, etc.
  Follow existing rules
- `docs/issues` If called for an Epic where the directory does not exist, it will not be an error and will be returned as "No candidate"
  end as
