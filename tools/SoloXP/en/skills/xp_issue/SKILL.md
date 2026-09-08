---
model: claude-opus-4-6
---

# XP Issue Skill

## Command

### `/xp_issue <storycard_path>`

Load a story card (Markdown) and create a story issue on GitHub.
It will not be broken down into tasks or issue sub-issues (that is the responsibility of `xp_Architect`).

---

## Operating procedure

### 1. Load story card

- Read Markdown file at specified path
- Get the following from frontmatter:
  - `title` : Issue title
  - `epic` : Epic name (used for label)
  - `estimate.total` : Total estimate (if any)
- Understand the background and acceptance conditions of the story from the text

### 2. Create a story issue

Create a GitHub Issue in the following format:

```
タイトル: [Story] <title>

## ストーリー
<ストーリーカードの本文をそのまま転写>

## 受け入れ条件
<ストーリーカードの受け入れ条件セクション>

## 見積もり
合計: <total>pt
（estimate.total がない場合は省略）
```

Labels: `story`, `epic/<epic名>` are assigned.
If the label does not exist, create it with `gh label create` and then assign it.
(For environments where `gh` cannot be used (such as ClaudeCodeWeb): There is no MCP tool that directly corresponds to `gh label create`
Known gap (same as `xp_Architect`〈#3214〉). Frequently appearing labels such as `story` / `epic/<EpicName>` are created in advance.
If the label does not exist, give up on adding it, create an issue, and then manually add it to this issue after creating it.
Leave a comment asking to do so. #3217). If you cannot use `gh issue create` to create the issue itself
Fallback to `mcp__github__issue_write` (owner, repo, method: `create`, title, body, labels).

### 3. Update frontmatter of story card

```yaml
github_issue: <ストーリーイシュー番号>
status: open
```

---

## Output format

After execution, print the following to the console:

```
## Issue 作成完了

ストーリーイシュー: #<番号> [Story] <title>
URL: https://github.com/<owner>/<repo>/issues/<番号>

ストーリーカードを更新しました: <path>

次のステップ:
  タスク分解が必要な場合: /xp_Architect <番号>
  見積もりが未完の場合:   /xp_plan <storycard_path>
```

---

## Notes

- GitHub repositories are automatically detected using `gh repo view` (in environments where `gh` cannot be used (such as ClaudeCodeWeb),
  Tool calls via MCP require `owner`/`repo` as explicit arguments, so no processing equivalent to automatic detection is required.
  Resolve `owner`/`repo` from the current repository settings (`git remote`, etc.) and pass it to each MCP tool call. #3217)
- Issue creation continues even if `estimate.total` does not exist in frontmatter
- Prompt user before overwriting if `github_issue` is already set
- If an error occurs while creating an issue, report it immediately and exit.
