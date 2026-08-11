---
model: claude-opus-4-6
---

# XP Issue Skill

## Command

### `/xp_issue <storycard_path>`

Load a story card (Markdown) and create a story issue on GitHub. It does not break down into tasks or issue sub-issues (that is the responsibility of `xp_Architect`).

---

## Operating procedure

### 1. Load story card

- Read Markdown file at specified path
- Get the following from frontmatter:
- `title`: Issue title
- `epic` : Epic name (used for label)
- `estimate.total` : Total estimate (if any)
- Understand the background and acceptance conditions of the story from the text

### 2. Create a story issue

Create a GitHub Issue in the following format:

```
Title: [Story] <title>

## Story
<Transfer the text of the story card as is>

## Acceptance conditions
<Story Card Acceptance Conditions Section>

## estimate
Total: <total>pt
(Omitted if estimate.total is not available)
```

Label: `story`, `epic/<epic name>` is assigned. If the label does not exist, use `gh label create` to create it and then assign it.

### 3. Update frontmatter of story card

```yaml
github_issue: <story issue number>
status: open
```

---

## Output format

After execution, print the following to the console:

```
## Issue creation completed

Story issue: #<number> [Story] <title>
URL: https://github.com/<owner>/<repo>/issues/<number>

Updated story card: <path>

Next steps:
If task decomposition is required: /xp_Architect <number>
If the estimate is incomplete: /xp_plan <storycard_path>
```

---

## Notes

- GitHub repositories are automatically discovered with `gh repo view`
- Proceed with issue creation even if `estimate.total` does not exist in frontmatter
- Prompt user before overwriting if `github_issue` is already set
- If an error occurs while creating an issue, report it immediately and exit.
