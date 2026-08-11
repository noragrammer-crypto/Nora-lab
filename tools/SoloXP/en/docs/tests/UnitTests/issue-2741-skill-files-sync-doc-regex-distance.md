# Unit Test: issue-2741 skill-files-sync-doc-regex-distance

Target file: `SoloXP/tests/unit/issue-2741-skill-files-sync-doc-regex-distance.unit.test.js` Verification target: `docs/skill-files-sync.md`

## Background

For the regular expression `/dotfiles.{0,40}(binary|product)/` required by Story #2168's acceptance test (`issue-2168-soloxp-canonicalization-nora-lab-pipeline.test.js` AC4), the text in the corresponding part of `docs/skill-files-sync.md` is "dotfiles" and "product" were 50 characters apart and did not match (#2741).

## Test case

1. Full text of `docs/skill-files-sync.md` matches Story #2168 AC4 regular expression
2. At least one line in the file matches the regular expression within the same line (to prevent accidental matching due to the expression being split into separate lines, explicitly verify that it is true within a single line)

## Execution result

2 PASS / 0 FAIL
