---
model: claude-sonnet-4-6
---

# XP Run All Unit Tests Skill

## Command

### `/xp_RunAllUnitTests`

Run the entire unit test suite and report the results. If RED remains, list it with issue number.

---

## Operating procedure

### 1. Identify the test target

Check all unit test files in the repository.

```bash
find . -path "*/node_modules" -prune -o -name "*.unit.test.*" -print
find . -path "*/node_modules" -prune -o -name "*.test.*" -path "*unit*" -print
```

### 2. Run all unit tests

```bash
npm run test:unit / pytest tests/unit / go test ./... / etc.
```

Use the appropriate command for each project.

### 3. Aggregate and report results

```
## /xp_RunAllUnitTests results

Execution date and time: YYYY-MM-DD HH:MM

| Project | PASS | FAIL | SKIP |
|---|---|---|---|
| <name> | n | n | n |

### RED list (needs action)

- [ ] #<issue number> `<test name>` — <summary of failure reason>
- [ ] #<issue number> `<test name>` — <summary of failure reason>

### All tests GREEN ✅
(if there is no RED)
```

If any REDs remain, list them with the corresponding GitHub issue number. If the issue cannot be identified, write the target file name and test name.

---

## Notes

- Functional tests and E2E tests are not applicable (unit tests only)
- Tests will not be modified or deleted
- Issues with the execution environment (dependencies not installed, etc.) will be reported separately.
