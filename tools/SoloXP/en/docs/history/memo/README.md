# Design memo/ADR (past study materials)

This directory contains study materials, minutes, and drafts created during the initial design phase of the Solo XP framework. **All of these differ from the current implementation and should not be referred to as operational documentation.** For current operation, refer to [`../../../WORKFLOW.md`](../../../WORKFLOW.md) and [`../../spec/`](../../spec/).

Because it has the value of an ADR (Architecture Decision Record) that records the history of decision-making, it is not deleted, but is saved here as a ``past record that is safe to rot.''

## Recorded files

| File | Contents | Discrepancy from the current situation |
|---|---|---|
| `ARCHITECTURE.md` | Initial concept (GitHub Actions launch + Magistrate daemon + tmux parallel maid worker + Codespace resident). Updated on 2025-02-07 with the status "Design completed/Waiting for implementation" and stopped. | The actual implementation is a method that calls the `xp_Director` type skill each time on Claude Code (Web/CLI), and there is no resident daemon, tmux, or Codespace automatic startup. |
| `METRICS.md` | Metrics design (token/CPU time constraint theory) assuming bugyo daemon operation. The “Actual Measurement Dashboard” remains empty | The assumed operational format is different for the same reason |
| `TARGET_AUDIENCE.md` | Target customer analysis (Digital Farmer persona). Contains language that assumes the above architecture, such as "the magistrate will manage it without permission" | Same as above |
| `SXP_Framework_Planning Review Meeting_Minutes_v1.0.md` | Minutes of the Planning Review Meeting dated 2026-02-05 (between Nora and Claude) | Brainstorming record at the time the review started |
| `Solo eXtreme Programming with AI Agents - Reference material collection.md` | Miscellaneous summary of external examples (CCPM, multi-agent-shogun, Beans, etc.) referenced during design | Value only as reference material |
| `xp_skills_overall design draft_v2.md` | Draft of overall skills design (TODO not completed) | For final specifications, refer to each specification under [`../../spec/`](../../spec/) |
| `solo_xp_workflow_v2.drawio.txt` | Workflow diagram v2 ("xp skill mapping"). draw.io format | Old version replaced by `v3` (Director control model) |

## About the disclosure range

Whether it can be published to Nora-lab (public repository) is undecided (under consideration in `SoloXP/docs/issues/issue-2747`). We are waiting for the owner's decision as to whether to keep it, giving priority to its value as an ADR, or to exclude it because the deviation from the implementation will confuse readers.
