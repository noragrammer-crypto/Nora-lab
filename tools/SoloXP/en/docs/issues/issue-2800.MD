---
issue: 2800
title: "[Task] Add tokens/model format examples to CLAUDE.md work-time recording rules"
state: open
labels: [task, epic/SoloXP]
author: noragrammer-crypto
created_at: 2026-08-09T00:35:58Z
epic: SoloXP
---

# #2800 [Task] Add tokens/model format examples to CLAUDE.md work-time recording rules

## Overview

Update `CLAUDE.md` to turn #2799's reproduction test GREEN. In `Work-time recording rules`, copy the concise examples already defined in `docs/worklog-format.md`:

```
tokens: prompt=XXXk completion=XXXk total=XXXk
model: <model name>
```

State that malformed `tokens:` or `model:` values must not be completed automatically; ask the user. Keep the reference to `docs/worklog-format.md` as the authoritative detailed format and retain the existing explanation that work time is recorded through Issue comments.

## Result

The change was additive only. Unit tests: PASS 155 / FAIL 0, including the four #2799 assertions; Functional: PASS 50 / FAIL 0; related E2E `issue-1461-ai-dev-cost-token-tracking.test.js`: PASS 15 / FAIL 0. `[Auditor GREEN]` was recorded with no regressions.
