---
model: claude-sonnet-4-6
---

# XP Functional Test Skill

## Command

### `/xp_FunctionalTest <#issue number>`

Load a task issue and create a functional test suite that spans multiple functions/modules.

> **Caller**: Called by xp_Director. Generate from GitHub Issue.

---

## Operating procedure

### 1. Load task issue

- Get GitHub Issue content/comments
- Understand:
- Functions/processing flow to be implemented
- Parent story issue (see link if available)
- Related source files
- Epic name (taken from `epic/<EpicName>` label)

### 2. Investigate the target code

- Identify and load source files related to the task
- Understand dependencies and data flows between modules
- Identify testable input/output boundaries

### 3. Create a functional test suite

Granularity larger than unit tests and smaller than E2E. Verify that multiple functions/classes work together and work correctly.

```
api/<EpicName>/tests/functional/
└── <task_name>.test.<ext>
```

Test case perspective:
- Normal flow (all major data flows)
- Abnormal flow (chain of error handling)
- Boundary values/edge cases
- Interface between modules

### 4. Report the issue with a comment

```
## Functional test suite creation completed

Test file: `api/<EpicName>/tests/functional/<task_name>.test.<ext>`
Number of test cases: <n>

Coverage:
- <Module name>: <Verification content>
...
```

---

## Notes

- Use mocks/stubs for external API/DB as necessary
- Write tests assuming an interface if the code under test does not already exist
- Avoid duplication with `/xp_UnitTest` and focus on inter-module cooperation
- Do not assert document text/heading numbers such as SKILL.md as they are using `toContain`/regular expression. Verify only the structure/contract (existence of required sections, frontmatter schema, existence of reference files, etc.) (SoloXP/docs/spec/tdd_principles.md Principle 7)
