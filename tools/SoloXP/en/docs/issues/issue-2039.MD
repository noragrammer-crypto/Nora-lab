---
issue: 2039 title: "[Task] Fix dangling link in spec/README.md + Create new novel_generator_run.md" state: open labels: [task, epic/SoloXP] author: noragrammer-crypto created_at: 2026-07-14T00:08:37Z epic: SoloXP
---

# #2039 [Task] Fix dangling link in spec/README.md + Create new novel_generator_run.md

## Body

## overview

Fixed bug #1364. There is a link to `novel_generator_run.md` in `SoloXP/docs/spec/README.md`, but the file does not exist (dangling link).

### Correction details

1. **Added reproduction test**: Create `SoloXP/tests/unit/issue-1364-spec-readme-link-integrity.unit.test.js` and verify the existence of all linked files listed in `spec/README.md`
2. **Create a new file**: Create `SoloXP/docs/spec/novel_generator_run.md` to describe the specifications of the NovelGeneratorRun skill (see `.claude/skills/NovelGeneratorRun/SKILL.md`)

### Implementation guidance

Reproduction test pattern (see existing tests):

```js
// SoloXP/tests/unit/issue-1364-spec-readme-link-integrity.unit.test.js
const fs = require('fs');
const path = require('path');

const SPEC_DIR = path.resolve(__dirname, '../../docs/spec');
const README = path.join(SPEC_DIR, 'README.md');

test('Links to all .md files listed in spec/README.md exist', () => {
  const content = fs.readFileSync(README, 'utf-8');
  const links = [...content.matchAll(/\[.*?\]\((\S+?\.md)\)/g)].map(m => m[1]);
  for (const link of links) {
    const fullPath = path.join(SPEC_DIR, link);
    expect(fs.existsSync(fullPath)).toBe(true); // fails for novel_generator_run.md until fix
  }
});
```

The contents of `novel_generator_run.md` are written in SoloXP spec format based on `.claude/skills/NovelGeneratorRun/SKILL.md`.

## estimate

2pt — Create reproduction test + create new spec file

## Dependencies

None (can start immediately)

## Parent story

#1364

## Parent branch

feature/issue-1364

## comment

### noragrammer-crypto — 2026-07-14T12:02:00Z

## Observable change check ([Task] Skip judgment)

Target: #2039 Changes in observable behavior: None Reason: Create a new spec file (novel_generator_run.md) and add a unit test to check the link integrity of README.md. Changes to the documentation layer only, without API/UI/endpoint changes. Architect Skip.

---

Work started 2026-07-14 12:02 Session URL: https://claude.ai/code/session_01Dz2QBf97v1NfP2E16fBQng [ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-07-14T12:10:00Z

[Auditor GREEN] PASS: 233 items (Unit 183 + Functional 50)

- Unit test: PASS 183 / FAIL 0 (total 18 suites GREEN)
- Functional test: PASS 50 / FAIL 0

Check the existence of novel_generator_run.md. Dangling link resolved.

Work completed 2026-07-14 12:10 / Required time: 8 minutes

---
