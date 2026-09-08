# xp_Director functional specification

## Overview

xp_Director is the command center skill for Solo XP workflow.
Controls the execution order and timing of all skills and does not touch the code.

---

## Command

| Command | Description |
|---|---|
| `xp_Director <issue_number>` | Control the workflow of a specified issue |
| `xp_Director` (no arguments) | Immediately delegate to `/ProcessIssue` |

---

## Processing flow

### Without arguments: Delegates to ProcessIssue

Immediately delegate the process to `/ProcessIssue` and stop.
ProcessIssue is in charge of issue selection and distribution logic.

### Delegation decision to Architect (observable change check)

If the title says `[Task]`, pass the observable change check (lightweight gate) before bypassing Architect completely:

1. Determine from the issue text/title whether it involves changes in behavior that are observable from users/externals.
   - Example: Change only SKILL.md/document description, change only setting values, only internal refactor → **None**
   - Example: Implementation involving addition/change of API/endpoint, addition/change of UI, change of output content → **Yes**
2. Record the judgment result as a comment on the issue:
   ```
   ## 観測可能変更チェック（[Task]スキップ判定）

   対象: #<issue_number>
   観測可能な振る舞いの変更: あり / なし
   理由: <判断理由>
   ```
3. **None** → Skip Architect and proceed directly to the execution flow
4. **Yes** → Call `xp_Architect <issue_number>` without skipping Architect (Architect executes 1-1 E2E/spec necessity judgment)

Other than `[Task]` (`[Story]`, `[Bug]`, no tag), the above gate is not performed and `xp_Architect <issue_number>` is always called.

### Task issue processing

**[1 task 1 PR rule]** — Even if there are multiple sub-issues, only one task is executed at a time.

#### Identifying task type

| Type | Identification condition | Processing |
|---|---|---|
| `e2e_test_creation` | "E2E test suite creation" or task_type: e2e_test_creation | xp_E2Etest <parent story number> |
| `spec_update` | "Functional specification update" or task_type: spec_update | xp_issue2md <task_issue> → xp_doc_spec <epic> <parent story number> |
| `bug_reproduction_test` | "Add bug reproduction test" or task_type: bug_reproduction_test | xp_Tester <task_issue> |
| Normal implementation task | Other than above | xp_Tester + xp_Implementer + xp_Auditor + xp_Documenter |

#### Execution steps for typical implementation tasks

```
a. depends_on ブロックなしのサブイシューを特定
b. 最初の1件のみ選択（並列実行しない）
c. タスク種別を識別して対応フローを実行
d. PR発行完了 → 必ず停止（AllGREEN判定の有無に関わらず、本ランではこれ以上の処理を行わない）
```

### AllGREEN → xp_Auditor Story-level delegation flow (run as a separate run)

AllGREEN checks will not be run in this `/xp_Director` run.
The next time `/ProcessIssue` is run, the parent Story/Bug issue will be evaluated.
(Detected in ProcessIssue 2-2-C "Architected Story Check"):1. When the completion markers for all sub-issues are aligned, **AllGREEN** (normal tasks do not output `[Auditor GREEN]`, `spec_update` tasks do not output `[Auditor GREEN]` due to their structure, but use `[Auditor doc OK]` as the completion marker)
2. For AllGREEN, ProcessIssue calls `xp_Director <親イシュー番号>` as a separate run and does the following:
   - Delegate to `xp_Auditor test <epic> <親ストーリー番号>` (Story-level quality gate, E2E acceptance testing)
   - Execute xp_Reviewer call after Story-level GREEN confirmation
   - After completing xp_Reviewer, call `xp_SecurityReviewer <epic> <親ストーリー番号>` (Security review. Calls the built-in skill `security-review` and automatically raises an improvement recommendation issue if a high risk is pointed out. For details, refer to `xp_securityreviewer.md`)
   - After completing xp_SecurityReviewer, call `xp_Auditor doc <epic> <親ストーリー番号>` (document check)
   - Check E2E test suite with `xp_RunE2ETests`
   - **spec_update task completion confirmation (AllGREEN prerequisite):**
     - Identify the task with the title `task_type: spec_update` or "Functional specification update" from the sub-issue list
     - The spec_update task only passes through `xp_issue2md` → `xp_doc_spec` → `xp_Auditor doc`, and the completion marker is `[Auditor doc OK]` (`[Auditor GREEN]` is not output due to the structure)
     - If the corresponding task exists and there is no `[Auditor doc OK]` in the comment: It is assumed that AllGREEN is not established and the task is stopped without issuing a PR. Record the following in the parent issue:
       ```
       ⚠️ spec_update タスク (#<spec_update_issue番号>) が未完了のため AllGREEN 判定を見送ります。
       /xp_Director <spec_update_issue番号> で先に処理してください。
       ```
     - Proceed to the next step only if the task does not exist or has been `[Auditor doc OK]`
   - Confirmation of merging of all subtask PRs (individual confirmation whether `merged` PR corresponding to completed subissue exists)
   - **Issue Markdown finalize (incidental synchronous processing that does not affect whether AllGREEN is established/#2971/#3485):**
     Call `xp_issueArchiveFinalize <EpicName>`. Of `docs/issues/issue-*.MD` under the target Epic
     Replace the closed version on GitHub with the front matter as `state: open` with the latest version.
     xp_Director itself only calls without rewriting files (maintaining the principle of not rewriting code or documentation).
     The number of scanned items and the number of finalized items are not used in SSOT for AllGREEN judgment, `depends_on` resolution, and `[Auditor GREEN]` judgment.
     Do not stop issuing PR even when the call fails (Will be rolled up in the Epic cross finalize of the next `daily-tasks` execution <#3486>)- Acceptance test GREEN, xp_Reviewer completed, xp_SecurityReviewer completed, spec_update completed, all subtask PRs merged: Parent branch (feature/issue-{number}) → Publish main PR and close the story issue. Record `[親ブランチ PR 発行済み]` comment after publication. The results of Issue Markdown finalize are also included as reference information in `## AllGREEN チェック結果` of the PR body.
   - When the acceptance test fails: A new sub-issue will be created with the details of the failure and the story will continue.
3. If there are unfinished sub-issues → stop immediately

---

## depends_on resolution decision

- Extract the dependent issue number from the `## 依存関係` section. Targets both explicit fields like `depends_on: #123` and references to `#<番号>` in natural sentences like "This task should start after #123 is completed" (even in old-style issues without the `depends_on:` field, all `#<数字>` in the section are treated as dependencies)
- Don't check GitHub's closed state
- Unblocked if there is `[Auditor GREEN]` in the dependent sub-issue comment
- Even if it is unblocked, it will not be executed immediately in one run (it will start on the next call)

---

## Stage comments

Record in subissues at the start/completion of each stage:

```
[Tester実行中] / [Tester完了]
[Implementer実行中] / [Implementer完了]
[Auditor テスト実行中] / [Auditor GREEN]
[Documenter実行中] / [Documenter完了]
[Auditor ドキュメントチェック中]
[PR発行済み #xx]
[親ブランチ PR 発行済み] #xx  ← AllGREEN 後の feature→main PR 発行時
```

**Work log (required):**

**Log to parent Bug/Story issue (after Architect completes):**
After completing Architect and creating the parent branch, record it in the parent Bug/Story issue:
```
作業開始 YYYY-MM-DD HH:MM JST
セッションURL: https://claude.ai/code/session_XXXXXXXX
[ProjectStatus: InProgress]
```

**Record in subtask issue (when task starts):**
At the start of each subtask (before starting xp_Tester), record the following in one comment:
```
作業開始 YYYY-MM-DD HH:MM JST
セッションURL: https://claude.ai/code/session_XXXXXXXX
[ProjectStatus: InProgress]
```

**Record in parent issue after AllGREEN completion:**
```
作業完了 YYYY-MM-DD HH:MM JST / 所要時間: XX分
```


## Working hours time zone

For new working time comments, be sure to add the `JST` suffix to the date and time in Japan time.
Past comments that do not specify JST are interpreted as UTC for backward compatibility.
`xp_worklog` normalizes the time with `JST` to JST and the time without `JST` to UTC before calculating the required time.

---

## GitHub access method

| Environment | Access |
|---|---|
| Claude Code Web | Via MCP (`gh` CLI cannot be used due to outbound proxy restrictions) |
| claude.ai / Others (local, Codespaces, etc.) | `gh` Command priority. In case of failure (not installed, authentication error, `HTTP 403`, etc.), fallback to MCP |

Before 2026-08-28, the above mapping was written in reverse (fixed in #3214). `gh` Priority → MCP fallback in case of failure →
Field normalization pattern was established in `xp_issue2md` (#3204). This skill applies to the following main commands:

| `gh` Command | Purpose | MCP Fallback |
|---|---|---|
| `gh pr list --search "#<番号>" --base <branch> --state merged` | Check depends_on resolution and all subtask PR merge | `mcp__github__search_pull_requests` || `gh issue close <task_issue>` | Explicitly close a task issue | `mcp__github__issue_write` (method: update, state: closed) |
| `gh pr create --base main` / `--base feature/issue-{番号}` | PR issue | `mcp__github__create_pull_request` |

## Notes

- Do not write to code file
- Can be sent back up to 3 times. If exceeded, stop escalation

---

## Changelog

| Date | Version | Changes | Issue |
|---|---|---|---|
| 2026-06-21 | 1.1.0 | `[Task]` Added observable change check (lightweight gate) before skipping. Added completion confirmation gate for spec_update task to AllGREEN prerequisites | #1557, #1566, #1567 |
| 2026-07-15 | 1.2.0 | Unify working time comments to JST explicit text and add backward compatibility rules to treat past comments without JST explicit text as UTC | #2080 |
| 2026-08-20 | 1.3.0 | Add xp_SecurityReviewer call (immediately after xp_Reviewer and before issuing main PR) to AllGREEN flow | #1688, #3027 |
| 2026-08-20 | 1.3.1 | Corrected the error in the completion marker of the spec_update task (`[Auditor GREEN]` → Correctly `[Auditor doc OK]`) and supplemented the missing step of xp_Auditor doc, xp_RunE2ETests, and all subtask PR merge confirmation | #1688, #3029 |
| 2026-08-21 | 1.4.0 | spec_update Added `xp_issue2md <task_issue>` (before `xp_doc_spec`) to the taskflow. Resolved `xp_Auditor doc` NG due to missing issue2md log | #1733 |
| 2026-08-29 | 1.5.0 | Fixed environment mapping reversal bug in "## GitHub access method" (Claude Code Web ↔ Others were reversed). Add gh priority → MCP fallback pattern to main commands (PR merge confirmation, issue close, PR issue) | #3205, #3214 |
| 2026-09-03 | 1.6.0 | Added `xp_issueArchiveFinalize` call to AllGREEN flow (immediately after confirming all subtask PR merges and immediately before deciding to issue main PR). Position it as an incidental synchronization process that does not affect whether AllGREEN is established or not, and write it as reference information in `## AllGREEN チェック結果` of the PR text | #2971, #3485 |
