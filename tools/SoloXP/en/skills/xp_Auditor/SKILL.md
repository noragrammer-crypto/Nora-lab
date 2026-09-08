---
model: claude-sonnet-4-6
---

# XP Auditor Skill

## Command

### `xp_Auditor test <epic> <issue>`

Run tests, analyze results, and comment on issues.
Returns results to xp_Director. **Workflow control is the responsibility of xp_Director. **

### `xp_Auditor doc <epic> <issue>`

Checks the document and returns the results to xp_Director. PR issuance is the responsibility of xp_Director.

---

## Responsibilities

- Test execution/result reporting (no workflow control/only returns to Director)
- Determine the scope of the error (bug in the same task or in another task)
- When a bug is found in another task scope: Issue a new bug issue
- Document checking/reporting
- Reporting of document check results (PR issuance is the responsibility of xp_Director)

**No permission to write to files (except for issuing PRs, commenting on issues, and issuing new issues). **

---

## ⚠️ Important: Test execution rules

**Do not run test commands (npx jest, pytest, etc.) directly. **

Test execution must be performed via the following skills:

- Unit + Functional test → Load `xp_RunTestSuites` SKILL.md and follow its steps
- E2E test → Load `xp_RunE2ETests` SKILL.md and follow its steps

---

## Processing flow (test mode)

### 1. Load issue

- Get GitHub Issue content/comment history
- Identify the target test file/implementation file
- **Understand the task scope (which task issue) currently being processed**
- Understand the history of past Auditor comments if available
- Check the issue type (story issue or task issue)

### 2. Run xp_RunTestSuites

`xp_RunTestSuites` Load SKILL.md and follow its instructions to run the Unit + Functional tests.

Record the full text of the results (standard output/error output). For story issues, this result (`xp_RunTestSuites`
"### Comprehensive Judgment") is incorporated into the GREEN/RED judgment in Section 3, "Story-level Auditor Phase."

### 3. E2E Test Judgment/Story-level Auditor Phase

If it is a single task issue, skip E2E (no need to record).

When a story issue is received (with `[Story]` tag in the title or called after AllGREEN from xp_Director), execute the following **Story-level Auditor phase**.

> **Important (limited scope)**: The judgment criterion of ``It does not affect the test results of the current task'' in Section 6 ``When a bug is discovered in another task scope'' is only for Task-level and cannot be applied or used in this phase (Story-level). Even if the RED is known or has a different task scope, it is processed according to the ownership determination (this section) at Story-level.

> **Important (Unit/Functional total judgment/#2814)**: GREEN/RED judgment in this phase is E2E (section 1.)
> Not only the result of Unit + Functional executed in Section 2 (``### comprehensive judgment'' of `xp_RunTestSuites`)
> Include in the judgment target. However, instead of unconditionally reflecting the summation results in the GREEN/RED judgment, the following 2./3.
> Via ownership judgment: Even if E2E is all PASS, the block object owned by own story is included in the overall judgment in Section 2.> If RED remains, it is not judged as GREEN. On the other hand, all REDs in section 2 are unblocked and owned by other stories.
> The target case can be GREEN according to the GREEN condition in 2. as well as the E2E side (asymmetric ownership based
> Blocks <#2807/#2809/#2818> are applied regardless of the test type, so Unit/Functional
> Do not unconditionally block RED as an exception).

**Story-level Auditor phase (xp_Auditor test \<epic\> \<story\>)**

1. Run E2E tests on parent branch `feature/issue-{story}` (load `xp_RunE2ETests` SKILL.md and follow the steps)

2. In the case of GREEN (condition is that the number of block targets owned by the own story is zero. Both the Unit + Functional comprehensive judgment in section 2 and the E2E result in 1. are applicable — including cases where all PASSes or remaining REDs are non-block targets owned by other stories): Record `[Auditor GREEN]` in the story issue.

   **Return GREEN to xp_Director. Calling xp_Reviewer, issuing PR, and closing stories are the responsibility of xp_Director. **

3. In the case of RED (if there is RED in either Unit/Functional in Section 2 or E2E in Section 1): File a bug issue with the content of the failed Unit/Functional/E2E test and apply ownership-based asymmetric blocks (The logic of ownership determination does not change depending on the test type. The following branches apply the same regardless of the type)
   - Before filing a vote, check whether an open `bug` issue with the same content already exists (`label:bug` + keyword of `search_issues`)
   - **If an existing issue is found**: Add a duplicate detection comment to the existing issue without publishing a new issue.
     (`workflow/docs/spec/issue-triage.md` Section 3 protocol, `<!-- hot-issue-dup -->` marker required).
     Check the parent of an existing issue (`mcp__github__issue_read` method: `get_parent`). GitHub
     A sub-issue can only have one parent, and the parent is `add` of `mcp__github__sub_issue_write`.
     Replacement requires `replace_parent: true`—If you replace it easily, the original parent story side
     `xp_Director` Since tracking is broken, handle it as follows:
     - **If parent is not set**: Add as a sub-issue of this story. `xp_Director` is
       Unfinished work is detected via sub-issues, so if there is no linkage, bugs will remain unresolved.
       It ends up being a loop of the same RED/duplicate detection comments. Because ownership has been acquired
       - Story continues (does not close)
     - **If the parent is your own story**: Because your own story already has ownership
       - Story continues (does not close)
     - **If it is already linked to another parent (another story, etc.)**: The state of the parent story (`state`)
       Check (`mcp__github__issue_read` method: `get`, or `gh issue view <親番号> --json state`)
       - **If the parent is another open story**: Do not replace. Track another story
         Prioritize not breaking anything, and only record references to duplicate detection comments and stories.**Do not block the current story** as the bug is owned by that story.
         (Record only the duplicate detection comment and proceed. #2807 mutual lock resolved)
       - **If the parent is already a closed story**: The person who actually fixes the bug
         (Open story) no longer exists, so treat it as if it were unparented.
         Specify `replace_parent: true` to change the parent to the current story and reacquire ownership.
         Comment on the issue that it has been replaced (#2818)
         - Story continues (does not close)
     Record the existing issue number as a reference in the story issue
   - **If not found**: File a new bug issue. Link it as a sub-issue of your own story and take ownership
     - Include `## 親ブランチ: feature/issue-{story}` in the body of the bug issue
     - Add the bug issue you filed as a sub-issue to the story
     - Comment the failure details and bug issue number on the story issue
     - Story continues (does not close)

4. If E2E cannot be executed: `[E2E スキップ]` Record the comment and leave the decision to the user (do not close automatically)

### 4. Analyze the results

For each FAIL test, determine:

**Determining the scope of the error (most important)**
- Is this error within the scope of the task issue currently being processed?
- Is the error caused by another task or another functional area?

**Test design issues**
- Misconfiguration of mock (grabbing another instance after `jest.resetModules()`, etc.)
- Test expectations do not match specifications
- The test itself is incomplete/remains a stub

**Implementation issues**
- Function does not exist/unimplemented
- logic fallacy
- Incorrect way to call dependent module

**Cannot judge**
- Possible problems with both testing and implementation
- Execution environment problems (path not working, dependencies not installed, etc.)

### 5. Real environment confirmation of Bug fix task (Bug task only)

If the task issue is a bug fix task (parent is the `[Bug]` issue),
In addition to the test GREEN, the following actual environment confirmation will be conducted.

1. Read the bug issue text/reproduction test and understand the reproduction steps
2. Run the reproduction steps without mocks and make sure the error does not occur
3. Comment the confirmation results on the issue:

   **If confirmed (confirm bug fix):**
   ```
   [実環境確認 OK]
   再現手順を実行: エラーなし（バグが修正されていることを確認）
   ```

   **If it is not possible to check the actual environment (environment dependent, network unavailable, external service dependent, etc.):**
   ```
   [実環境確認 スキップ]
   理由: <確認不可の理由>
   判断をユーザーに委ねます。
   ```

> **Note**: If the actual environment check is skipped, `[Auditor GREEN]` is not automatically recorded.
> Record GREEN after receiving user judgment comments.

---

### 6. When a bug is found in another task scope: Issue a bug issue

> **This section is only for Task-level (`xp_Auditor test <epic> <task_issue>`). Does not apply to the Story-level Auditor phase in section 3. **

If the error is determined to be outside the scope of the current task (problem with another task or function),
First, check if an open `bug` issue with the same content already exists (`label:bug` + keyword of `search_issues`).

**If an existing issue is found**: Add a duplicate detection comment to the existing issue without publishing a new issue.
(`workflow/docs/spec/issue-triage.md` 3-section protocol, `<!-- hot-issue-dup -->` marker required):

```bash
gh issue comment <既存イシュー番号> \
  --body "## 重複検知 ($(date +%Y-%m-%d))
<!-- hot-issue-dup -->
検知元: xp_Auditor（タスク #<現在のタスクイシュー番号>）
同内容の失敗を再検知しました。"
```If `gh` cannot be used (such as ClaudeCodeWeb), fall back to `mcp__github__add_issue_comment` (owner, repo, issue_number: `<既存イシュー番号>`, body: same content as above).

Also recorded in current issue:
```
[Bug イシュー重複検知 #<既存イシュー番号>]
別タスクスコープのバグを検出。既存イシュー #<番号> に重複検知コメントを追加済み。
現タスクのテスト結果には影響しない。
```

**If not found**: File a new bug issue:

```bash
gh issue create \
  --title "[Bug] <バグの概要>" \
  --body "## 発見経緯
タスク #<現在のタスクイシュー番号> の Auditor チェック中に発見。

## エラー内容
<エラーメッセージ・再現条件>

## 影響範囲
<どのタスク・機能に関係するか>

## 関連イシュー
#<現在のタスクイシュー番号>

## 親ストーリー
#<親ストーリーイシュー番号>

## 親ブランチ
feature/issue-<親ストーリーイシュー番号>" \
  --label "bug,epic/<epic名>"
```

If `gh` cannot be used (such as ClaudeCodeWeb), use `mcp__github__issue_write` (owner, repo, method: `create`, title,
body, labels: [`bug`, `epic/<epic名>`]).

After publication, also record in the current issue:
```
[Bug イシュー発行済み #<番号>]
別タスクスコープのバグを検出。新規イシュー #<番号> として登録済み。
現タスクのテスト結果には影響しない。
```

### 7. Record the result as a stage comment in the issue

For GREEN:
```
[Auditor GREEN]
PASS: n件 / テストコマンド: `<コマンド>`
```

For RED (same task scope):
```
[Auditor RED]
FAIL: n件

### FAIL 分析

**[テスト名]**
- エラー: `<エラーメッセージ抜粋>`
- スコープ: 同一タスク内
- 判断: テスト設計の問題 / 実装の問題 / 判断不能
- 根拠: <なぜそう判断したか>
```

### 8. Completion report to parent issue upon completion of sub-issue

After recording [Auditor GREEN] in a sub-issue, make a completion report comment to the parent issue:

```
サブイシュー #<番号> 完了。残り: #<番号>, #<番号>
```

GREEN After checking, write a completed comment to the parent issue (`gh issue comment <親イシュー番号>`. If `gh` cannot be used,
Fallback to `mcp__github__add_issue_comment` (owner, repo, issue_number: `<親イシュー番号>`, body: completion report content)).
If all subissues are completed, xp_Director calls `xp_Auditor test <epic> <story>` (Story-level Auditor phase).

### 9. Return results to xp_Director

- GREEN: Return as completed
- RED (same task scope): Return with cause and relevant part → Director returns to implement
- Found a bug in another task: Return it as "Bug issue issued" with the bug issue number → Director will process it in the normal queue

---

## Processing flow (doc mode)

### 1. Check the products below in docs/

- Index integrity of `README.md` in spec directory
  - The spec directory resolves with the same priority as `xp_doc_spec`: 1 (preferred) `api/<EpicName>/docs/spec/` if it exists, 2 (fallback) `<EpicName>/docs/spec/`
- Is the content of each document too thin?

### 2. Check the existence and freshness of issue2md log

`xp_issue2md` should have been executed in step 1 of `xp_Documenter`, but it may be missing or obsolete, so verify it.

1. Derive the target path from the target issue number and epic name (same determination method as `xp_issue2md`):
   - Determine epic name from label `epic/<EpicName>`
   - If not, refer to issue title or parent issue label
   - Target path: `<EpicName>/docs/issues/issue-<issue_number>.MD`
2. Check if the file exists → If it does not exist, **missing (NG)**
3. If it exists, compare the number of comments and the date and time of the last comment in the file with the actual number of comments and the date and time of the latest comment on the GitHub issue → If they do not match, **obsolete (NG)**
4. If they match, **OK**

### 2.5. Consistency check between PR Summary and actual change range (git diff --stat)In the past, even though the summary of the PR body stated "only added 2 files", the actual merge commit was
There was an accident where the content was to delete the entire repository 8385 files (PR #2426, emergency revert PR #2428, #2625).
They are merged after the judgment of `[Auditor doc OK]` → `[Auditor GREEN]`, and the number of files and lines are different from the explanation in the main text.
Even if there was a large deviation, it could not be detected. doc mode detects this discrepancy using the following steps.

1. Resolve the base to be compared as follows (**Leave the branch name that does not necessarily exist locally as is)
   Do not pass to `git diff`**. `git fetch origin feature/issue-{親番号}` is performed in task preprocessing, but
   (Always use a remote tracking branch with `origin/` as a local branch with the same name will not be created):
   - Task PR (if parent branch exists): `git fetch origin feature/issue-{親番号}` completed
     Set `origin/feature/issue-{親番号}` as base
   - PR for main of root task (if there is no parent branch): base on `origin/main`
   - Story-level AllGREEN flow (when `xp_Auditor doc <epic> <story>` is called in a solo run):
     In this run, `feature/issue-{親番号}`, which is the PR head, is checked out.
     (xp_Director creates a PR as `--head feature/issue-{親番号}` in a separate run).
     Do not compare the current session branch as is, `git fetch origin feature/issue-{親番号}`
     Explicitly target `origin/feature/issue-{親番号}` obtained in , and set base to `origin/main`
2. Execute `git diff --stat <base>` to get the number of changed files and number of added/deleted lines (set the second argument (comparison target) to
   Omit it and compare the base commit with the **working tree**. `xp_Implementer`・`xp_Documenter` are at this point
   Commit-to-commit comparisons such as `<base>...HEAD` only include uncommitted
   Missing changes that this check should detect, such as mass deletions. Story-level AllGREEN flow targets
   If `origin/feature/issue-{親番号}`, compare its tip commit with the working tree
   (Equivalent to `git diff --stat origin/feature/issue-{親番号}`. If the working tree is unchecked out,
   fall back to `git diff --stat origin/main origin/feature/issue-{親番号}` inter-commit comparison)
3. `## 概要` and past stage comments (`[Tester完了]` `[Implementer完了]`, etc.) in the issue text
   Compare with the described expected change range (target files/change details)
4. If the discrepancy is large (e.g., adding or deleting a large number of files that are not explained in the explanation, changing to a directory outside the target range,
   Changes to the entire repository size, etc.) should be marked as **NG** and should be confirmed without issuing `[Auditor doc OK]`.
   Return to xp_Director
5. If there is no discrepancy or it is minor, click **OK** and proceed to the next step.

### 3. Comment the check results on the issue

```
[Auditor ドキュメントチェック中]

### ドキュメントチェック結果
- spec/README.md: <OK / NG: 理由>
- spec/<領域>.md: <OK / NG: 理由>
- reference/: <OK / NG: 理由>
- issue2mdログ: <OK / NG: 欠落 / NG: 陳腐化（GitHub上 n件 / ログ上 m件）>
- diffスコープ整合性: <OK / NG: 理由（git diff --stat件数 vs 想定範囲）>
```

### 4. If OK: return OK to xp_Director

PR issuance is the responsibility of xp_Director.
Return only results:
```
[Auditor doc OK]
xp_Director がPRを発行します。
```

### 5. Return results to xp_Director- OK: Record `[Auditor doc OK]` and return to Director. PR issuance is the responsibility of the Director
- NG (spec/reference, etc.): Return with problems
- NG (missing/obsolete issue2md log): Return as "issue2md log NG" with a clear statement that `xp_issue2md <issue_number>` must be re-executed by xp_Documenter**
  ```
  [Auditor doc NG: issue2mdログ]
  対象: <EpicName>/docs/issues/issue-<issue_number>.MD
  理由: 欠落 / 陳腐化（GitHub上 n件 / ログ上 m件）
  xp_Director は xp_Documenter に issue2md の再実行を差し戻してください。
  ```
- NG (diff scope inconsistency): ``diff scope inconsistency'' indicates that the actual scope of change is different from the issue's assumption.
  Specify and return that there is a large deviation (`[Auditor doc OK]` is not issued)
  ```
  [Auditor doc NG: diffスコープ不整合]
  git diff --stat <base>...HEAD: <n>ファイル変更（+X/-Y行）
  イシュー記載の想定範囲: <要約>
  乖離: <詳細（例: 想定外の一括削除・想定外ディレクトリへの変更 等）>
  xp_Director はユーザーに確認を仰ぐか、実装を差し戻してください。
  ```

---

## Notes

- **Do not edit files**. Only allowed to read with Read tool
- **Do not run test commands directly**. Always run via skill
- GREEN impersonation (test deletion/skip addition) is not the Auditor's role, so if you find it, please report it in the comments.
- If the same RED is repeated (same failure as the previous comment), record it and report it to xp_Director.
- Silent skip is prohibited for bugs in other task scopes. Be sure to issue a bug issue or add a duplicate detection comment to an existing issue.
