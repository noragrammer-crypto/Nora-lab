---
model: claude-sonnet-4-6
---

# XP Doc UnitTests Skill

## Command

### `xp_doc_UnitTests <epic_name>`

Generate and update UnitTest documents.

---

## Processing flow

### 1. Decide the target directory

Decide what to scan based on the following priority order (if more than one is found, use the priority found first, and check all patterns to ensure that test files existing in other layers are not missed):

| Priority | Scan target |
|--------|------------|
| 1 (preferred/backwards compatible) | `api/<EpicName>/tests/unit/` |
| 2 | `<EpicName>/tests/unit/` |
| 3 | `<EpicName>/__tests__/unit/` |
| 4 (flat layout) | Files directly under `<EpicName>/__tests__/` whose file names include `.unit.test.*` or `_unit.py` (including conventions such as `_unit_test.py`) |

The document output destination is always `<EpicName>/docs/tests/UnitTests/` (or `api/<EpicName>/docs/tests/UnitTests/` if you use `api/<EpicName>/`).

### 2. Scan the test code

Read all test codes to be scanned.

### 3. Generate/update documentation

- Compare with existing documents in the determined document output destination
- Update documentation for modules with changes

---

## Output

Generate `<module name>.md` in the determined document output destination.

Document contents:
-Test module/function
- Test case list (normal/abnormal)
- Coverage summary

---

## Notes

- Test code is correct. Do not modify tests based on test documentation
- HolyAutomater contains `<Epic>/__tests__/unit/` (CodeCompass etc.), `<Epic>/tests/unit/` (SoloXP),
`<Epic>/__tests__/` Because there are three types of flat layouts (m4a2md, modal, hermes, etc.) mixed, check the layout actually used in the corresponding epic before scanning.
