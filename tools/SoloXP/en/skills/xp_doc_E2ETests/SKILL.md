---
model: claude-sonnet-4-6
---

# XP Doc E2ETests Skill

## Command

### `xp_doc_E2ETests <epic_name>`

Generate and update E2ETest documents.

---

## Processing flow

### 1. Scan the test code

Identify and read all Epic E2E test directories. The area under `api/` is dedicated to Vercel Function's entry point, and the test document is placed in the epic root directory (repository configuration rules. `api/<EpicName>/` is not a fixed path).

- Use `<EpicName>/tests/e2e/` or `<EpicName>/__tests__/e2e/`, whichever exists.
- If neither exists, match the directory actually created by xp_E2Etest

### 2. Generate/update documentation

- Compare with existing `<EpicName>/docs/tests/E2ETests/`
- Update scenario documentation with changes

---

## Output

`<EpicName>/docs/tests/E2ETests/<User Scenario Name>.md`

Document contents:
- User scenario overview
- Given/When/Then step
- Prerequisites

---

## Notes

- Test code is correct. Do not modify tests based on test documentation
