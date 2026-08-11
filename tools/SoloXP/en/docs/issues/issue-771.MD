---
issue: 771 title: "[Task] kakuyomu_post_ab SKILL.md creation" state: open labels: [task] author: noragrammer-crypto created_at: 2026-05-01T00:30:54Z epic: SoloXP
---

# #771 [Task] kakuyomu_post_ab SKILL.md creation

## Body

## overview

Create `dotfiles/.claude/skills/kakuyomu_post_ab/SKILL.md`. Develop documentation for the agent-browser version of Kakuyomu posting skills.

## Things to do

- Create front matter (name, description, trigger) for SKILL.md
- Describe how to use the skill and prerequisites
- Describe how to call the `agent-browser` CLI and command examples
- If proxy support is required, specify how to set it up
- Describes how to use and switch between kakuyomu_post (Playwright version)

## estimate

2pt — Skill document creation/agent-browser command design

## Dependencies

Start this task after completing #770. (To write SKILL.md after confirming proxy operation and finalizing the environment settings) (Start after [Auditor GREEN] comment is recorded in #770)

depends_on: #770

## Parent story

#605

## Parent branch

feature/issue-605

## comment

### noragrammer-crypto — 2026-05-07T00:18:07Z

Start of work 2026-05-07 00:00

[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-05-07T00:18:32Z

[Tester running]

## Test execution results

Skip: Unit / Functional / E2E — No code to test because the task is documentation only

Creating a new `dotfiles/.claude/skills/kakuyomu_post_ab/SKILL.md` is pure documentation work. No changes to implementation code → Skip all test layers. Transferred to Implementer.

[Tester completed]

---

### noragrammer-crypto — 2026-05-07T00:22:38Z

[Implementer running]

## Implementation completed

### Change file

- `dotfiles/.claude/skills/kakuyomu_post_ab/SKILL.md` (newly created, 211 lines)

### Description

- **Front Matter**: `name: kakuyomu_post_ab`, `description`
- **Environment variable settings**: `AGENT_BROWSER_IGNORE_HTTPS_ERRORS=true`, `AGENT_BROWSER_EXECUTABLE_PATH`, `AGENT_BROWSER_ARGS`
- **Proxy support**: HTTP_PROXY autoload + SSL error ignored (#770 investigation results reflected)
- **Session persistence**: Login cookie retention with `--session-name kakuyomu`
- **Basic commands**: open / snapshot / click / fill / eval / screenshot
- **Login procedure**: Homepage warm-up → Login page → Form entry
- **Draft submission flow**: Work page → New episode → Enter title/text → Save draft
- **Comparison table with Playwright MCP version**: Usage guidelines
- **Troubleshooting**: ERR_CERT_AUTHORITY_INVALID / Chromium not detected / Stay logged in

[Implementer completed]

---

### noragrammer-crypto — 2026-05-07T00:24:01Z

[Auditor GREEN] PASS: 253 items (DiscordAIbot: 146 items, DiscordBotDashboard: 107 items)

### Test Results Summary

Execution date and time: 2026-05-07 Branch: claude/vigilant-franklin-O3REM

**DiscordAIbot unit test**
- Results: PASS 12 suites / 146 results

**DiscordBotDashboard Unit Test**
- Results: PASS 6 suites / 107 results

**Functional testing**
- No code changes for documentation-only tasks → Skip

Verdict: **GREEN**

---
