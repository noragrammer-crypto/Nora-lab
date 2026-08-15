---
issue: 2799
title: "[Task] Add a bug reproduction test"
state: open
labels: [task, epic/SoloXP]
author: noragrammer-crypto
created_at: 2026-08-09T00:35:46Z
epic: SoloXP
---

# #2799 [Task] Add a bug reproduction test

## Overview

Add a test that reproduces bug #2791: the `Work-time recording rules` section of `CLAUDE.md` refers to `docs/worklog-format.md` but does not include `tokens:` or `model:` format examples itself.

Add `SoloXP/tests/unit/issue-2791-claude-md-worklog-tokens-model.unit.test.js` before the fix. It must verify that the section contains `tokens:`, a `tokens:.*prompt=.*completion=.*total=` example, `model:`, and a policy to ask the user instead of automatically repairing malformed token/model data.

## Execution record

This `bug_reproduction_test` changes no observable runtime behavior. The four new assertions were RED (PASS 0 / FAIL 4), proving the missing format information; existing 151 unit tests passed. Functional tests remained PASS 50 / FAIL 0, and task-level E2E was skipped. The Auditor recorded `[Auditor GREEN]` because the intentional RED result is the acceptance criterion. Fix task: #2800.
