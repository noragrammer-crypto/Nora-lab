# xp_Implementer functional specification

## overview

xp_Implementer is the Solo XP workflow implementer skill. Faithfully implement the specifications indicated by the test and return the results to xp_Director.
**Responsible for correct code. The correctness of the test is determined by the Auditor.**

---

## Command

| Command | Description |
|---|---|
| `xp_Implementer <issue_number>` | Load and implement task issue |

> Called from xp_Director. Do not run alone.

---

## Processing flow

### 1. [While Implementer is running] Record the marker

Record a comment on an issue and then start working:
```
[Implementer running]
```

### 2. Pre-start check

- **Branch confirmation**: Do not work on the main branch
- **Checking dependency issues**: Check the `[Auditor GREEN]` comment if there is `depends_on`. If not, don't start

### 3. Implementation

1. Load the task issue (purpose, estimate, parent story, existing test)
2. Review existing tests and understand the expected behavior of the tests
3. Implement according to the style and design of existing code
4. Run the test and record the results (continue with GREEN or RED)
5. Report results to xp_Director and exit

---

## Constraints

- Do not modify or delete tests to make them GREEN.
- Even if you have doubts about the test, do not stop at your own judgment and hand it over to Auditor via xp_Director
- Avoid excessive abstraction and future support (stay within the scope of the current task)
- Not applicable for E2E testing (confirm upon story completion)
- Be careful to avoid security issues (injection, XSS, etc.)

---

## Related specifications

- `xp_director.md`: Control of entire workflow
- `tdd_principles.md`: TDD principles
