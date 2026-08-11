---
model: claude-sonnet-4-6
---

# XP Issue2MD Skill

## Command

### `/xp_issue2md <issue_number>`

Get the GitHub issue (text and all comments) and save it as a Markdown file.

---

## Processing flow

### 1. Get issue

```bash
# Get issue text
gh issue view <issue_number> --repo noragrammer-crypto/HolyAutomater --json number,title,body,labels,state,createdAt,author,comments
```

- Get the text, all comments, label, status, creation date, and author

### 2. Determine epic

Search for labels with the `epic/<EpicName>` pattern from the obtained labels.

- Example: label `epic/DiscordAIbot拡張` → epic name `DiscordAIbot`
- Remove literal Japanese suffixes in `<EpicName>`—such as `拡張` (extension), `改善` (improvement), and `修正` (fix)—before matching the `epic/<EpicName>` label to a directory name.
- Matching method: Get the directory list of the repository root with `ls` and identify the corresponding directory by prefix or exact match of `<EpicName>`
- If there is no epic label: refer to issue title or parent issue label
- If it still can't be determined: ask the user for the epic name

### 3. Decide the save destination directory

```
<EpicName>/docs/issues/
```

example:
- `DiscordAIbot` Epic → `DiscordAIbot/docs/issues/`
- `DiscordBotDashboard` Epic → `DiscordBotDashboard/docs/issues/`

Create the directory if it does not exist.

### 4. Generate Markdown file

File name: `issue-<issue_number>.MD`

Output in the following format:

```markdown
---
issue: <issue_number>
title: "<Issue title>"
state: <open|closed>
labels: [<label1>, <label2>, ...]
author: <author>
created_at: <Creation date and time>
epic: <EpicName>
---

# #<issue_number> <issue title>

## Body

<Original issue body copied verbatim>

## comment

### <author> — <date and time>

<Comment text>

---

### <author> — <date and time>

<Comment text>

---
```

If there are no comments, omit the "## Comment" section.

### 5. Save file

Write to `<EpicName>/docs/issues/issue-<issue_number>.MD`.

---

## Output

- `<EpicName>/docs/issues/issue-<issue_number>.MD` (new or overwritten)

Display the following after completion:

```
## Issue2MD completed

Saved to: <EpicName>/docs/issues/issue-<issue_number>.MD
Issue: #<issue_number> <title>
Number of comments: <number>
```

---

## Notes

- Comments are output in ascending order of creation date and time (oldest first)
- Overwrite if file already exists (maintains idempotency)
- Immediately report an error and terminate the skill when GitHub API acquisition fails.
- If the epic cannot be determined, check with the user before proceeding
