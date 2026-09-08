# issue-3484-xp-issue-archive-finalize Functional test

## Test target

`SoloXP/scripts/find-stale-issue-archives.sh` (Candidate extraction in a realistic directory structure where multiple Epics and many issues are mixed)
`SoloXP/skills/xp_issueArchiveFinalize/SKILL.md` (Specifications of LLM driving part, such as GitHub API cooperation and xp_issue2md reuse)

Of `<EpicName>/docs/issues/issue-*.MD`, `state: open` is actually closed on GitHub.
We will verify the newly created part (#3484) of the mechanism (Issue #2971) that finalizes the existing content near the completion of the Epic.

## Test file

`SoloXP/tests/functional/issue-3484-xp-issue-archive-finalize.functional.test.js`

## Test case list

| Test case | Type | Content |
|---|---|---|
| Extract only state:open under the target Epic even in a realistic directory structure where multiple Epics and many issues coexist | Normal system | Even if EpicA (2 open items, 3 closed items) and Epic B (1 open item) exist under the same root, correct candidates should be returned independently for each |
| No false detection even if docs/issues is adjacent to another Epic directory that does not exist | Abnormal system (boundary confirmation) | Even if an Epic directory without `docs/issues` exists next to it, it will not affect the extraction results of the target Epic |
| SKILL.md specifies the use of find-stale-issue-archives.sh | Check the specifications | Check the description that the design leaves candidate extraction to a script |
| SKILL.md specifies lightweight state confirmation with gh issue view --json state | Specification confirmation | Check the description of the state reconfirmation command for each candidate |
| SKILL.md specifies MCP fallback (mcp__github__issue_read) when gh CLI is unavailable | Check specifications | Check description of fallback path on ClaudeCodeWeb, etc. |
| Specifies the reuse of xp_issue2md when SKILL.md is judged closed (no new generation logic required) | Specification confirmation | Check the description of the design policy that does not independently implement Markdown regeneration |
| SKILL.md clearly states that open candidates will not be rewritten | Check specifications | Check description of acceptance condition (#2971) to avoid unnecessary rewriting |
| SKILL.md mentions the summary report | Check the specifications | Check the description of the reporting specifications for the number of scanned items, number of finalized items, and number of skipped items |
| SKILL.md reflects the non-purpose limited to only state:open candidates | Check specifications | Check the description of the non-purpose (#2971) that does not always synchronize and re-acquire all issues |

## Execution result

- Before implementation (bug re-present): 1 PASS / 8 FAIL (RED as expected due to absence of script/SKILL.md)
- After implementation: 9 PASS / 0 FAIL (GREEN)
- Related regression confirmation: `SoloXP/tests/functional` Total 8 suites (69 PASS)
