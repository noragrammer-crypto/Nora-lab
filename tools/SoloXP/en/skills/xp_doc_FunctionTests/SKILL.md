---
model: claude-sonnet-4-6
---

# XP Doc FunctionTests Skill

## Command

### `xp_doc_FunctionTests <epic_name>`

Generate and update FunctionalTest documentation.

---

## Processing flow

### 1. Decide the target directory

Decide what to scan based on the following priority order (if more than one is found, use the priority found first, and check all patterns to ensure that test files existing in other layers are not missed):

| Priority | Scan target |
|--------|------------|
| 1 (preferred/backwards compatible) | `api/<EpicName>/tests/functional/` |
| 2 | `<EpicName>/tests/functional/` |
| 3 | `<EpicName>/__tests__/functional/` |
| 4 (Flat layout) | Files directly under `<EpicName>/__tests__/` whose file names include `.functional.test.*` or `_functional.py` (including conventions such as `_functional_test.py`) |

The document output destination is always `<EpicName>/docs/tests/FunctionTests/` (or `api/<EpicName>/docs/tests/FunctionTests/` if you use `api/<EpicName>/`).

### 2. Scan the test code

Read all test codes to be scanned.

### 3. Generate/update documentation

- Compare with existing documents in the determined document output destination
- Update documentation for features that have changed

---

## Output

Generate `<function name>.md` in the determined document output destination.

Document contents:
- Function to be tested
- Scenario list
- Test data explanation

---

## Notes

- Test code is correct. Do not modify tests based on test documentation
- HolyAutomater contains `<Epic>/__tests__/functional/` (CodeCompass etc.), `<Epic>/tests/functional/` (SoloXP),
`<Epic>/__tests__/` Because there are three types of flat layouts (m4a2md, modal, hermes, etc.) mixed, check the layout actually used in the corresponding epic before scanning.
