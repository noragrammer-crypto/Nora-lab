# Solo XP operational workflow

> For an overview, features, and document list of SoloXP itself, see [README.md](./README.md).
> Background explanation of branch naming, base branch, why merge conflicts are likely to occur, etc.
> See [Notes on branch/PR merge strategy](./docs/manual/branch-strategy.md).

> **Assumptions**: The following workflow requires branch operation, PR issuance pre-approval, and
> It is assumed that TDD principles, work time recording rules, etc. are defined. If you don't have one yet,
> Copy [`CLAUDE.md.template`](./CLAUDE.md.template) to your `CLAUDE.md` and edit it.

## Basic flow

```
Issue 作成（ユーザー）
    ↓
/xp_Director <issue_number> 起動
    ↓
xp_Architect: サブイシュー発行
    ↓
xp_Director: タスク1件ずつ順番に処理
  └─ xp_Tester → xp_Implementer → xp_Auditor test → xp_Documenter → xp_Auditor doc
    ↓
[Auditor GREEN] → 親イシューへ完了報告
    ↓
全サブイシュー AllGREEN → xp_RunE2ETests（受け入れテスト）
    ↓
✅ 通過 → 親ストーリーPR発行・Close
❌ 失敗 → 失敗内容で新サブイシュー起票・継続
```

---

## Detailed Workflow

### 1. Issue creation (user)

```bash
# Web版Claude Code、Termux、GitHub アプリなど任意の方法で
gh issue create \
  --title "[Story] 機能名" \
  --body "## 背景\n...\n\n## 受け入れ条件\n- [ ] ..."
```

### 2. Start xp_Director

```
/xp_Director <issue_number>
```

Or auto-select unprocessed issues without arguments:

```
/xp_Director
```

### 3. Task decomposition using xp_Architect

`[Story]`, `[Bug]`, untagged → xp_Architect publishes sub-issue.
`[Task]` Tagged → Skip Architect and go straight to the execution flow.

Architect:
- Categorize issue types into Story / Task / Bug
- Publish the task as a sub-issue with dependencies (if the total number of tasks including required accompanying tasks is only one, do not create a sub-issue/parent branch, and treat the parent issue as the root task. For details, see `xp_Architect/SKILL.md` Step 4-A)
- Record the execution plan as an Architect analysis result comment

### 4. Task processing (1 task 1 PR rule)

**Only one task is processed in one xp_Director execution. **

#### Task type and processing method

| Task type | Identification method | Processing skill |
|---|---|---|
| `e2e_test_creation` | "E2E test suite creation" or task_type: e2e_test_creation | xp_E2Etest <parent story number> |
| `spec_update` | "Functional specification update" or task_type: spec_update | xp_issue2md <task_issue> → xp_doc_spec <epic> <parent story number> |
| `bug_reproduction_test` | "Add bug reproduction test" or task_type: bug_reproduction_test | xp_Tester <task_issue> |
| Normal implementation task | Other than above | xp_Tester → xp_Implementer → xp_Auditor → xp_Documenter |

#### Typical implementation task steps

```
[Tester実行中]    → テストスイート作成・実行
[Tester完了]
[Implementer実行中] → テストをグリーンにする実装
[Implementer完了]
[Auditor テスト実行中] → テスト実行・結果分析
[Auditor GREEN] または [Auditor RED]
[Documenter実行中]   → 全種ドキュメント生成
[Documenter完了]
[Auditor ドキュメントチェック中] → spec/reference 確認
[PR発行済み #xx]
```

### 5. Sub-issue completion report

When a task issue becomes `[Auditor GREEN]`, xp_Auditor reports to the parent story issue:

```
サブイシュー #42 完了。残り: #43, #45
```

When all sub-issues are completed:

```
サブイシュー #42 完了。残り: なし（全タスク完了）
```

### 6. AllGREEN check → acceptance test

**Important (Execution Timing)**: As per the steps of the normal implementation task in Section 4, `xp_Director` is
After issuing a task PR, be sure to **pause** (1 task 1 PR rule, see `xp_Director/SKILL.md` step 3 for details).
AllGREEN checks are not performed within the run. The next time `/ProcessIssue` is executed, the parent Story/Bug issue will be
The completion of all sub-issues is detected at the evaluation stage, and from there `xp_Director <親イシュー番号>` is **as a separate run**
When called, performs the following AllGREEN check.

`xp_Director` checks completion markers for all subissues (normal tasks are `[Auditor GREEN]`,
`spec_update` Task <`task_type: spec_update` or "Functional specification update"> is `[Auditor doc OK]`
——`spec_update` does not output `[Auditor GREEN]` due to its structure, so it is determined using these two types of completion markers):

- For **AllGREEN** → Parent branch → Pass through **all** the required gates below before issuing the PR for main (see `xp_Director/SKILL.md` step 3-e for details):
  1. Perform Story-level acceptance testing (E2E) on `xp_Auditor test <epic> <story>`
     - ✅ GREEN → Proceed to the next gate
     - ❌ RED → Raise a new sub-issue with the details of failure, continue the parent issue (no PR will be issued)
  2. After confirming Story-level GREEN, conduct a code review by `xp_Reviewer <epic> <story>` (If a high risk is identified, an issue with improvement recommendations will be automatically raised)
  3. After completing xp_Reviewer, conduct a security review by `xp_SecurityReviewer <epic> <story>` (call the built-in skill `security-review` and automatically raise an improvement recommendation issue if a high risk is pointed out)
  4. Perform document check with `xp_Auditor doc <epic> <story>`
  5. Confirm the E2E test suite with `xp_RunE2ETests` (In addition to the Story-level acceptance test in step 1, this is a reference information E2E suite confirmation gate executed by xp_Director itself. Since `xp_RunE2ETests` itself does not have an ownership determination, raw FAIL matches the RED of ``Owned by another story'' whose ownership has already been determined in step 1. If a new FAIL is detected that does not match the RED list in step 1, it will not be established and the process will start again from `xp_Auditor test` in step 1).
  6. `spec_update` task completion gate: If the sub-issue has a `task_type: spec_update` (or "Functional Specification Update") task, check if `[Auditor doc OK]` is recorded. If incomplete, stop without issuing PR
  7. Merge confirmation gate for all subtask PRs: Check individually whether a PR in the `merged` state corresponding to each completed sub-issue exists (If the PR is not merged even if there are `[Auditor GREEN]`/`[Auditor doc OK]`, AllGREEN will not hold)8. Issue Markdown finalize (not a gate, but ancillary synchronization process): Call `xp_issueArchiveFinalize <EpicName>` and replace the closed Issue Markdown with the latest version as `state: open` under the target Epic. The result is not used to determine whether AllGREEN is established (non-purpose of #2971). If there is one or more updates, commit/push on the parent branch before proceeding to the next step.
  - Pass all gates 1 to 7 above (Step 8 is for reference information and is not included in the passing conditions) → Publish a PR for the parent story issue and close (Summary the results of each gate + Issue Markdown finalize in the `## AllGREEN チェック結果` section in the PR body. For the template, see `xp_Director/SKILL.md` Step 3-e-9. #1690, #3485)
- **If there are unfinished sub-issues** → Stop immediately (the next task will start the next time `/xp_Director` is called)

### 7. Human confirmation/merge (user)

```bash
# PR 確認
gh pr view <番号>
gh pr diff <番号>

# マージ
gh pr merge <番号> --squash
```

---

## Resolving depends_on (dependency)

- Don't check GitHub's closed state
- **Unblocked if `[Auditor GREEN]` is found in the dependent sub-issue comment**
- Unblocked subissues will be eligible for execution on the next `/xp_Director` call

---

## Work logging rules

Record work time with issue comments (device independent, stays on GitHub timeline).

**At start:**
```
作業開始 YYYY-MM-DD HH:MM
```

**When completed:**
```
作業完了 YYYY-MM-DD HH:MM / 所要時間: XX分
```

Aggregation is done using `/xp_worklog`.

---

## Retry control during RED

RED of the same task scope is returned by xp_Director to xp_Implementer (up to 3 times).
If it exceeds 3 times, the escalation will be stopped and the user will be contacted by commenting on the issue.

---

## Skill list

| Skill | Role |
|---|---|
| xp_Director | Control tower. Control the execution order and timing of all skills |
| xp_Architect | Categorize issues into Story/Task/Bug and publish sub-issues |
| xp_Tester | Create and run a test suite |
| xp_Implementer | Implement to make tests green |
| xp_Auditor | Test execution/quality audit/sub-issue completion report |
| xp_Documenter | Generate all types of documentation (spec/reference/tests) |
| xp_E2Etest | Create an E2E test suite |
| xp_RunTestSuites | Run Unit + Functional tests |
| xp_RunE2ETests | Run E2E tests |
| xp_RunAllUnitTests | Run and report all unit tests |
| xp_worklog | Total work time and report |
| xp_review_workflow | Review the workflow and indicate areas for improvement |

---

**Updated date**: 2026-03-18
