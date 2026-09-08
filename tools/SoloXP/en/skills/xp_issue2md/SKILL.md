---
model: claude-sonnet-4-6
---

# XP Issue2MD Skill

## Command

### `/xp_issue2md <issue_number> [EpicName]`

Get the GitHub issue (text and all comments) and save it as a Markdown file.

`[EpicName]` is optional. If the caller has already identified the destination epic directory
(e.g. the directory where `xp_issueArchiveFinalize` found the candidate file) explicitly.
If omitted, label-based epic judgment in step 2 is performed.

---

## Processing flow

### 1. Get issue

`gh` If CLI is available, use the following command (traditional route):

```bash
# イシュー本文を取得（--repo は固定せず、実行ディレクトリのリポジトリを gh に自動解決させる）
gh issue view <issue_number> --json number,title,body,labels,state,createdAt,author,comments
```

`gh` command not installed, authentication error, or `HTTP 403` (GraphQL queries are disabled in the session, etc.)
If the tool fails and cannot be used, fall back to the GitHub MCP tool (such as ClaudeCodeWeb environment, etc.).
`gh` Support for cases where CLI cannot be used. #3204):

```
mcp__github__issue_read（method: get, issue_number: <issue_number>）
  → number, title, body, state, labels, created_at, user.login（author）を取得

mcp__github__issue_read（method: get_comments, issue_number: <issue_number>, perPage: 100）
  → 各コメントの body, user.login（author）, created_at を取得
  → perPage は省略せず必ず 100（最大値）を明示指定する（省略時のデフォルトは30件であり、
    31〜100件のコメントを持つイシューで暗黙に切り詰められ取りこぼす恐れがあるため）。
    返却件数が100件（＝指定したperPage）に達した場合は page を1ずつ増やし、
    返却件数が100件未満になるまで繰り返し呼び出して全件を取得する
```

Even during MCP fallback, `owner`/`repo` are resolved from the repository settings (current repository) and fixed values are not hard-coded.

**Normalization of obtained results:** `gh` Whether obtained using CLI or MCP fallback, before passing to the subsequent steps (2 to 5)
Normalize to the following common fields. This will generate the same Markdown regardless of the acquisition method:

| Normalization fields | gh CLI (`--json`) | GitHub MCP fallback |
|---|---|---|
| title | `title` | `issue_read get` of `title` |
body | `body` | `issue_read get` of `body` |
state | `state` | `issue_read get` of `state` |
| labels | `labels[].name` | `labels` of `issue_read get` (array. If the element is an object, use `.name`, if it is a string, use it as is. The standard GitHub Issue representation is an array of label objects, and if you neglect to extract `.name` `epic/<EpicName>` pattern string match fails, `gh` route and Markdown conflict) |
| createdAt | `createdAt` | `created_at` of `issue_read get` |
| author | `author.login` | `issue_read get` of `user.login` |
| comments[].author | `comments[].author.login` | `issue_read get_comments` `user.login` for each element |
| comments[].body | `comments[].body` | `issue_read get_comments` `body` for each element || comments[].createdAt | `comments[].createdAt` | `issue_read get_comments` `created_at` for each element |

- Get the text, all comments, label, status, creation date, and author
- For GitHub repositories, do not hard-code fixed values, and leave it to automatic resolution from the current directory of `gh` (to ensure correct operation when introducing to other repositories)

### 2. Determine epic

If `[EpicName]` is explicitly passed by the caller, the following label-based judgment will not be performed.
Use the value as is (case where the caller has already specified the storage location. Label `epic/<EpicName>`
Even if the value of is inconsistent with the actual directory structure, the explicit specification takes precedence. #2971 related・
Codex review pointed out/PR #3508).

If `[EpicName]` is omitted, search for a label with the `epic/<EpicName>` pattern from the obtained labels.

- Example: Label `epic/DiscordAIbot拡張` → Epic name `DiscordAIbot`
- Remove the Japanese suffix (extension, improvement, modification, etc.) included in `<EpicName>` of label `epic/<EpicName>` and match it with the directory name.
- Matching method: Get the repository root directory list with `ls` and identify the corresponding directory with a prefix or exact match of `<EpicName>`
- If there is no epic label: refer to issue title or parent issue label
- If it still can't be determined: ask the user for the epic name

### 3. Decide the save destination directory

```
<EpicName>/docs/issues/
```

Example:
- `DiscordAIbot` Epic → `DiscordAIbot/docs/issues/`
- `DiscordBotDashboard` Epic → `DiscordBotDashboard/docs/issues/`

Create the directory if it does not exist.

### 4. Generate Markdown file

File name: `issue-<issue_number>.MD`

Output in the following format:

```markdown
---
issue: <issue_number>
title: "<イシュータイトル>"
state: <open|closed>
labels: [<ラベル1>, <ラベル2>, ...]
author: <作者>
created_at: <作成日時>
epic: <EpicName>
---

# #<issue_number> <イシュータイトル>

## 本文

<イシュー本文をそのまま転写>

## コメント

### <作者> — <日時>

<コメント本文>

---

### <作者> — <日時>

<コメント本文>

---
```

If there are no comments, omit the "## Comment" section.

### 5. Save file

Write to `<EpicName>/docs/issues/issue-<issue_number>.MD`.

---

## Output

- `<EpicName>/docs/issues/issue-<issue_number>.MD` (new or overwrite)

Display the following after completion:

```
## Issue2MD 完了

保存先: <EpicName>/docs/issues/issue-<issue_number>.MD
イシュー: #<issue_number> <タイトル>
コメント数: <件数>
```

---

## Notes

- Comments are output in ascending order of creation date and time (oldest first)
- Overwrite if file already exists (maintains idempotency)
- `gh` If acquisition with the CLI fails, do not immediately issue an error, but first switch to GitHub MCP fallback (`mcp__github__issue_read`). Report an error and exit the skill only if the fallback also fails
- If the epic cannot be determined, check with the user before proceeding
