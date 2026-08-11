# Issue #2741: [Bug] issue-2168 Story E2E AC4: The description distance of "dotfiles" → "product" in docs/skill-files-sync.md exceeds the allowable range of regular expressions (40 characters)

- URL: https://github.com/noragrammer-crypto/HolyAutomater/issues/2741
- Parent story: #2168
- Parent branch: feature/issue-2168

## overview

AC4 section of acceptance test `SoloXP/tests/e2e/issue-2168-soloxp-canonicalization-nora-lab-pipeline.test.js` for Story #2168, the following tests are RED:

```
It is clearly stated that dotfiles/.claude and .claude/skills are binary (products)
expect(syncDoc).toMatch(/dotfiles.{0,40}(binary|product)/);
```

`docs/skill-files-sync.md` line 17:
```
Both `dotfiles/.claude/skills/` and `.claude/skills/` are generated from the original and should not be edited directly**
```

There is no match because the distance from "dotfiles" to "product" is 50 characters, which exceeds the allowable range for the test (40 characters).

## Compatible details

`docs/skill-files-sync.md` Rewritten line 17 so that the distance from "dotfiles" to "product" is within 40 characters without changing the meaning:

```diff
- Both `dotfiles/.claude/skills/` and `.claude/skills/` are generated from the original and should not be edited directly**
+`dotfiles/.claude/skills/` and `.claude/skills/` are **generated products (copies of the original) and should not be edited directly**
```

Added `SoloXP/tests/unit/issue-2741-skill-files-sync-doc-regex-distance.unit.test.js` to prevent regression.

## Test results

- Story E2E（`issue-2168-soloxp-canonicalization-nora-lab-pipeline.test.js`）: 20 passed / 1 skipped / 0 failed（RED → GREEN）
- `SoloXP/tests/unit` Overall: PASS 142 / FAIL 0 (including 2 new items)
- `SoloXP/tests/functional` Overall: PASS 37 / FAIL 0
- `SoloXP/tests/e2e` Overall: 11 passed / 3 failed (issue-1461, issue-1410, issue-254 are existing degradations unrelated to this task, known from comments in preceding tasks)
