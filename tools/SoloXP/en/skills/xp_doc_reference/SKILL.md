---
model: claude-sonnet-4-6
---

# XP Doc Reference Skill

## Command

### `xp_doc_reference <epic_name> [package_name]`

Generate and update implementation documentation.
**Code is correct. Read and generate code.**

---

## Processing flow

### 1. Decide the target directory

Decide what to scan and where to output documents using the following priorities:

| Priority | Scan target | Document output destination |
|--------|------------|------------------|
| 1 (preferred) | If `api/<EpicName>/` exists | `api/<EpicName>/docs/reference/` |
| 2 | If `<EpicName>/scripts/` exists | `<EpicName>/docs/reference/` |
| 3 (Fallback) | `*.js` / `*.py` directly under `<EpicName>/` | `<EpicName>/docs/reference/` |

If `package_name` is specified, only that package will be targeted.

### 2. Compare with existing documents

Compare with existing documents in the determined output destination.

### 3. Updated documentation for classes and functions that have changed.

- Update MD of classes/functions that have changed
- Delete MD of deleted class

---

## Output

Generate `<packagename>/<ClassName>.md` to the determined output destination.

Contents of each document:
- Overview of classes and functions
- Parameters/Return values
- Usage example
- dependencies

---

## Notes

- Reads and generates code, so assumes the code is up to date
- Do not change code based on documentation (one-way)
ay)
