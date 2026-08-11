# XP Skills overall design draft v2

Creation date: 2026-02-25 Status: Draft (awaiting review)

---

## 1. Overall skill map

```
xp_Director (Responsible person/control tower)
    ↓ Issue type determination
    ├── Story issue → xp_Architect
    │ ↓ Publish all sub-issues at once (with depends_on)
    │ ↓ Return execution plan to Director
    └── Task issue (without depends_on block)
            ↓ Request things that can be executed in parallel at the same time
            xp_E2Etest ← E2E test creation
            ↓
            xp_FunctionalTest ← Create functional test
            ↓
            xp_UnitTest ← Create unit test
            ↓
            xp_implement ← Implementation
            ↓
            xp_Auditor ← Test execution/result report
            ↓ RED → xp_implement remand (maximum 3 times)
            ↓ GREEN → [Auditor GREEN] comment on sub-issue
            xp_doc ← Document generation (all types)
            ↓
            xp_Auditor ← Document check/PR issue
            ↓
            xp_Director ← Task completion/stop
```

---

## 2. Directory conventions (rewritten version)

### Monorepo configuration

This repository (ObsidianVault) is a Git repository. Each epic (project) is managed under `api/<EpicName>/` as the root.

> **Note:** Due to the restrictions of Vercel Serverless Functions, it is required under `api/`.
> Logically, it is treated the same as the project directly under the root.

### Standard directory structure under epic

```
api/<EpicName>/
├── stories/
│ ├── backlog/ ← Unfinished story cards
│ ├── in_progress/ ← Working (GitHub Issue already)
│ └── done/ ← Completed
└── docs/
    ├── spec/ ← Functional specifications (story integral)
    │ ├── README.md ← Functional area index/overview
    │ ├── <area>.md ← Specifications for each area (AI manages the appropriate size)
    │ └── history/ ← Replaced old specifications
    ├── reference/ ← Implementation document (generated from code)
    │   └── <packagename>/
    │       └── <ClassName>.md
    └── tests/ ← Test document
        ├── UnitTests/
        ├── FunctionTests/
        └── E2ETests/
```

### Story Card Life Cycle

```
backlog/ → in_progress/ (when creating a GitHub issue) → done/ (when implementation is complete)
```

> Moving history/ from done/ is outside the responsibility of xp_doc. You can delete it if it is no longer needed in GitHub management.

---

## 3. Story Card Front Matter Standard

```yaml
---
title: Knowledge base feature
epic: DiscordAIbot
status: backlog          # backlog / in_progress / done
issue_number: # Added by xp_Architect when the story issue was published
estimate:
  total: 6
  breakdown:
    - task: Design/specification finalization
      pt: 1
      note: Detailed memo
    - task: lib/knowledge.js implementation
      pt: 1
      note: Detailed memo
      depends_on: Design/specification finalized
estimate_history:
  - date: 2026-02-23
    total: 6
    reason: initial estimate
---
```

### Front matter write permission

| Field | Written By |
|---|---|
| title / epic / estimate / breakdown | xp_plan |
| status | xp_Architect(in_progress)/manual(done) |
| issue_number | xp_Architect (at the time of story issue publication) |

---

## 4. GitHub issue progress management

### Sub-issue comments are progress logs

xp_Director records the start and completion of each stage as a comment in the subissue.

```
[Creating E2ETests]
[E2ETests completed]
[Creating UnitTest]
[UnitTest completed]
[implementation in progress]
[implementation completed]
[Auditor test running]
[Auditor GREEN] ← Determination key for eliminating depends_on
[Creating doc]
[doc completed]
[Checking Auditor document]
[PR issued #99]
```

### Determining whether depends_on is resolved

- Do not check the closed status of GitHub (Nora-san executes the closing at any time)
- **Unblocked if there is `[Auditor GREEN]` in the dependent sub-issue comment**
- Director requests parallel execution of unblocked sub-issues

---

## 5. Skill definition

---

### xp_Director ★Newly established

**Role:** Responsible person/control tower
**Model:** claude-opus-4-6
**Authority:** Issue/PR comment writing, instructions to all skills, progress management

**Responsibilities:**
- Determine the type by looking at the issue and PR (story issue or task issue)
- Execution order and timing control of all skills
- depends_on resolution check/parallel execution management
- Write stage comments to sub-issues
- Remand judgment and iteration upper limit management during RED (3 times)
- Determine task completion/stop

**Do not touch the cord. Focus on judgment and progress management.**

**Processing flow:**

```
1. Receive issue number
2. Read the issue content (MCP or gh)
3. Type determination
   - Story issue → call xp_Architect
   - Task issue → Go to execution flow
4. Execution flow (for task issue)
   a. Identify sub-issues without a depends_on block
   b. Request things that can be executed in parallel at the same time.
   c. For each sub-issue:
      - xp_E2Etest → xp_FunctionalTest → xp_UnitTest
      - xp_implement
      - xp_Auditor (test)
        - RED → Return to implement (up to 3 times, escalation will stop if exceeded)
        - GREEN → [Auditor GREEN] Write a comment → Check to unblock dependent sub-issues
      - xp_doc
      - xp_Auditor (document check/PR issue)
   d. All sub-issues completed → stopped
```

**How ​​to call:**
```
xp_Director <issue_number>
```

---

### xp_Architect ★Newly established (old: xp_issue)

**Role:** Staff Architect/Architect
**Model:** claude-opus-4-6
**Permissions:** Read all files, operate GitHub issues, issue sub-issues, write story cards

**Responsibilities:**
- Load content of story issue
- Conflict check with existing implementations, specs, and tests
- Drafting an implementation plan
- Publish all sub-issues at once (with depends_on)
- Updated `issue_number` / `status` of story card
- Return execution plan to xp_Director

**Processing flow:**

```
1. Read the full story issue content
2. Checking conflicts with existing implementations
   - Read docs/spec/
   - Read the related code
   - Read existing tests
3. Identify the scope of impact and formulate an action plan
4. Publish all sub-issues at once based on story card breakdown
   - Record depends_on in each subissue
5. Write issue_number on story card and update status to in_progress
6. Return execution plan (subissue list) to xp_Director
```

**If you can't see any competition:**
- Report to xp_Director specifying any points that cannot be determined.
- xp_Director makes escalation decision

**How ​​to call:**
```
xp_Architect <story_issue_number>
```

---

### xp_Auditor ★Change

**Role:** Inspector
**Model:** claude-sonnet-4-6
**Authority:** Read only (file cannot be changed) + Write issue comment + Issue PR

> **Changes:** Transferred workflow control to xp_Director. Added PR issuing authority.

**Responsibilities:**
- Test execution and report of results (no judgment, just return to Director)
- Document checking/reporting
- PR issue (after document check OK)

**Processing flow (test mode):**

```
1. Run xp_RunTestSuites
2. Analyze the results
3. Record GREEN/RED as a stage comment on the issue
4. Return results to xp_Director
   - For RED: Record the cause and relevant part in the issue comment
```

**Processing flow (document check mode):**

```
1. Check the products below docs/
   - index integrity of spec/README.md
   - Is the content of each document too thin?
2. Comment the check results on the issue
3. OK → PR issued (MCP or gh) → [PR issued #xx] as a comment
4. Return results to xp_Director
```

**How ​​to call:**
```
xp_Auditor test <epic> <issue>
xp_Auditor doc <epic> <issue>
```

---

### xp_doc ★Newly established (wrapper)

**Role:** Generate all types of documents
**Model:** claude-sonnet-4-6

**Processing flow:**
```
1. xp_doc_spec <epic> <issue>
2. xp_doc_reference <epic>
3. xp_doc_UnitTests <epic>
4. xp_doc_FunctionTests <epic>
5. xp_doc_E2ETests <epic>
```

**How ​​to call:**
```
xp_doc <epic_name> <issue_number>
```

---

### xp_doc_spec ★Newly established

**Role:** Generate and update functional specifications
**Model:** claude-sonnet-4-6

**Thought:**
- Story card = difference (delta)
- spec = integral
- No reverse direction of spec → stories

**input:**
- GitHub issue text + full comment history (MCP or gh)
- All MDs under existing `docs/spec/`

**Processing flow:**
```
1. Understand the current functional area map in docs/spec/README.md
2. Read the entire issue text + comments (specification changes are often buried in comments)
3. Identify differences with existing specs
4. Integrate the difference into the MD of the relevant functional area
   - Update if existing area
   - If it is a new area, create a new file
   - If one file is likely to exceed 200 to 500 lines, divide it appropriately.
5. Updated index of docs/spec/README.md
```

**Output:**
- `docs/spec/README.md` (updated)
- `docs/spec/<area>.md` (new or updated)

**How ​​to call:**
```
xp_doc_spec <epic_name> <issue_number>
```

---

### xp_doc_reference ★Newly established

**Role:** Generate and update implementation documents
**Model:** claude-sonnet-4-6

**Thought:** The code is correct. Read and generate code.

**Processing flow:**
```
1. Scan the implementation code under api/<EpicName>/
2. Compare with existing docs/reference/
3. Updated documentation for classes and functions that have changed.
4. Delete MD of deleted class
```

**Output:** `docs/reference/<packagename>/<ClassName>.md`

**How ​​to call:**
```
xp_doc_reference <epic_name> [package_name]
```

---

### xp_doc_UnitTests ★Newly established

**Role:** Generate and update UnitTest documents
**Model:** claude-sonnet-4-6

**Input:** Test code under `api/<EpicName>/tests/unit/`
**Output:** `docs/tests/UnitTests/<module name>.md`
**Document contents:** Test target/test case list (normal/abnormal)/coverage summary

**How ​​to call:**
```
xp_doc_UnitTests <epic_name>
```

---

### xp_doc_FunctionTests ★Newly established

**Role:** Generate and update FunctionalTest documents
**Model:** claude-sonnet-4-6

**Input:** Test code under `api/<EpicName>/tests/functional/`
**Output:** `docs/tests/FunctionTests/<function name>.md`
**Document contents:** Test target functions, scenario list, test data explanation

**How ​​to call:**
```
xp_doc_FunctionTests <epic_name>
```

---

### xp_doc_E2ETests ★Newly established

**Role:** Generate and update E2ETest documents
**Model:** claude-sonnet-4-6

**Input:** Test code under `api/<EpicName>/tests/e2e/`
**Output:** `docs/tests/E2ETests/<user scenario name>.md`
**Document contents:** User scenario overview/Given/When/Then steps/Prerequisites

**How ​​to call:**
```
xp_doc_E2ETests <epic_name>
```

---

### Addition to existing skills (no changes/additions only)

| Skills | Additional information |
|---|---|
| xp_plan | Story card storage is `api/<EpicName>/stories/backlog/` |
| xp_E2Etest | Called from xp_Director. Generated from Issue |
| xp_FunctionalTest | Same as above |
| xp_UnitTest | Same as above |
| xp_implement | Same as above |
| xp_RunAllUnitTests | No change |
| xp_RunTestSuites | No change |
| xp_RunE2ETests | No change |
| xp_worklog | No change |

---

## 6. GitHub access policy

| Environment | Access |
|---|---|
| Claude Code Web | `gh` command |
| claude.ai / Others | Via MCP |

Each skill detects the environment and switches automatically.

---

## 7. TODO (undecided items)

- [ ] xp_Architect: Detailed conflict check criteria
- [ ] xp_Auditor: Detailed OK/NG criteria for document checking
- [ ] Additions to existing skills (after finalizing this draft)
- [ ] `done/` → `docs/history/stories/` Organize movement timing
