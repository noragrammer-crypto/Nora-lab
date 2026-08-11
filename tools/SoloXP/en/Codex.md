# Codex Guide: SoloXP

Working notes for Codex when changing this directory (SoloXP).

## the purpose
- Work safely by limiting changes to this directory.
- Ensure minimum testing is performed according to the scope of impact.

## Work rules
1. Check the related documentation (README/CLAUDE.md/spec/docs) before making changes.
2. Prefer changes directly related to this directory.
3. Be sure to run any test commands and record the results.

## Test
- If you have `package.json`: check scripts and run necessary tests.
- If `__tests__/` exists: select unit / functional / e2e depending on the scope of change.
- If the test is not yet in place: At the very least, describe the execution confirmation procedure in the PR.

## Finishing
- Concisely summarize the reason for the change, scope of impact, and confirmation details.
- Check if extraneous files have been modified.
