# issue-1364-spec-readme-link-integrity unit test

## Test target

`SoloXP/docs/spec/README.md` (link integrity)

Verify that all .md links in the spec directory listed in spec/README.md exist (to prevent bug reproduction and regression of Issue #1364).

## Test file

`SoloXP/tests/unit/issue-1364-spec-readme-link-integrity.unit.test.js`

## Test case list

| Test case | Type | Content |
|---|---|---|
| spec/README.md exists | Normal system | SPEC_DIR/README.md exists |
| All .md links in the spec directory in spec/README.md exist | Normal | All relative .md links that do not start with `../` |

## Scope Note

- `../WORKFLOW.md` and `../ARCHITECTURE.md` are excluded as they are handled separately due to issues #1734/#1735
- Check only links in the spec directory (those that do not start with `../`)

## Change history (#2637)

Initially, the absence of novel_generator_run.md was detected and corrected as a dangling link, but novel_generator_run.md itself was correctly moved to `AINovelGenerator/docs/spec/` in #404 (change of management location of NovelGeneratorRun), and should not exist in `SoloXP/docs/spec/`. In this test, we unified the policy of eliminating dangling links by deleting the relevant link from README.md, and deleted the test case that required ``novel_generator_run.md to exist in the spec directory.''

## Coverage Summary

- spec README Link integrity: 2 items
- Total: 2 items
