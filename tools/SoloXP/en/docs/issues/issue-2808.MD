---
issue: 2808
title: "[Task] Add a bug reproduction test"
state: open
labels: [bug, task, epic/SoloXP]
author: noragrammer-crypto
created_at: 2026-08-09T07:47:20Z
epic: SoloXP
---

# #2808 [Task] Add a bug reproduction test

## Overview

Add a test that reproduces bug #2807 in the Story-level Auditor phase of `SoloXP/skills/xp_Auditor/SKILL.md`. The current wording blocks the current Story for every existing bug Issue, even when that bug belongs to another open Story.

The test `SoloXP/tests/unit/issue-2807-auditor-story-level-ownership-block.unit.test.js` establishes RED acceptance criteria: an other-Story-owned RED must not block the current Story; the old unconditional “the Story continues” conclusion must be replaced by ownership branches; and GREEN must require zero blockers owned by the current Story.

## Result

The new test reported PASS 1 / FAIL 3 as intended, while existing unit tests and all 50 functional tests passed. This correctly proves the bug for fix task #2809; `[Auditor GREEN]` records successful reproduction rather than a production fix.
