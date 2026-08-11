---
issue: 597 title: "[Task] Kakuyomu connection/login demonstration" state: open labels: [task, epic/kakuyomu-post] author: noragrammer-crypto created_at: 2026-04-11T01:58:42Z epic: kakuyomu-post
---

# #597 [Task] Kakuyomu connection/login demonstration

## Body

## overview
Demonstrate access and login to Kakuyomu using Playwright MCP. Check the login flow using the environment variables `KAKUYOMU_EMAIL` / `KAKUYOMU_PASSWORD` and confirm that the `/kakuyomu_post` skill actually works.

### Demonstration steps

1. Access https://kakuyomu.jp/ with `browser_navigate` (warm up)
2. Go to https://kakuyomu.jp/auth/login
3. Click “Continue with email address” → “Login”
4. Log in by entering your email address and password
5. After logging in, access https://kakuyomu.jp/my and check that the list of works is displayed.
6. Run the `/kakuyomu_post` skill and post one differential episode

### Notes on WAF avoidance

- UA impersonation: `--disable-blink-features=AutomationControlled` is already set in wrapper
- Avoid direct access and go through the homepage
- Do not repeat retries in a short period of time

## estimate
2pt — Demonstration test/operation confirmation/problem handling

## Dependencies
Start this task after completing #596 (Adding userDataDir persistence settings). (Start after [Auditor GREEN] comment is recorded in #596)

## Parent story
#579

## comment

### noragrammer-crypto — 2026-04-11T06:08:01Z

Start of work 2026-04-11 06:15

[Tester running]

---

### noragrammer-crypto — 2026-04-11T06:09:30Z

## Test proposition (Unit)

- [ ] The KAKUYOMU_EMAIL environment variable is set.
- [ ] KAKUYOMU_PASSWORD environment variable is set
- [ ] There is a userDataDir setting in playwright-mcp-wrapper.mjs
- [ ] Must include WAF avoidance settings (--disable-blink-features=AutomationControlled)
- [ ] userDataDir path must be /opt/pw-browsers/kakuyomu-session
- [ ] kakuyomu_post SKILL.md exists

Skip: Functional / E2E — This task itself is a live demonstration test. Implementer demonstrates directly using Playwright MCP.

---

### noragrammer-crypto — 2026-04-11T06:10:17Z

## Test execution results

### Unit Test
Test file: `SoloXP/__tests__/kakuyomu-login-prerequisites.unit.test.js` Results: 9 PASS / 0 FAIL

Proposition check:
- [x] KAKUYOMU_EMAIL environment variable is set
- [x] KAKUYOMU_PASSWORD environment variable is set
- [x] playwright-mcp-wrapper.mjs must exist
- [x] userDataDir setting must be present
- [x] userDataDir path must be /opt/pw-browsers/kakuyomu-session
- [x] Include WAF avoidance settings (--disable-blink-features=AutomationControlled)
- [x] SSL certificate error ignore setting (--ignore-certificate-errors) must be included
- [x] kakuyomu_post SKILL.md exists
- [x] Kakuyomu login URL is listed in SKILL.md

Skip: Functional / E2E — This task itself is a live demonstration test. Implementer will demonstrate by directly operating Playwright MCP.

[Tester completed] [Implementer running]

---

### noragrammer-crypto — 2026-04-11T06:17:28Z

## Implementation completed (partial)

### Identifying and remediating root causes

**Cause**: The playwright setting in `.mcp.json` was activated without using a proxy wrapper.
- A wrapper was already set in `dotfiles/.claude/settings.json`, but the project's `.mcp.json` took precedence.

Change file:
- `.mcp.json`: Changed playwright MCP via proxy wrapper
  - Old: `npx -y @playwright/mcp@latest --no-sandbox` (no proxy authentication → `ERR_INVALID_AUTH_CREDENTIALS`)
  - New: `node /root/dotfiles/bin/playwright-mcp-wrapper.mjs` (with JWT proxy authentication)
- `SoloXP/__tests__/kakuyomu-login-prerequisites.unit.test.js`: New creation

Test results:
- Unit test: 9 PASS / 0 FAIL
- Browser verification: **After the next session** (The MCP of the current session is not reflected due to cache activation)

---

### noragrammer-crypto — 2026-04-11T06:19:07Z

[Auditor RED] FAIL: Browser demonstration steps (demonstration steps 1 to 6) not completed

**Cause**: `.mcp.json` modifications were not reflected within the same session due to MCP session cache.
The fix (via wrapper) has been committed. Re-demonstration is required in a new session.

---

### noragrammer-crypto — 2026-04-11T06:22:18Z

Start of work 2026-04-11 06:22

[Implementer running] (1st remand/new session)

`.mcp.json` was modified in the previous session. In this session, MCP is started via wrapper, so we will perform browser demonstration (steps 1 to 6).

---

### noragrammer-crypto — 2026-04-11T06:32:23Z

[Auditor GREEN] PASS: 9 / Test command: `cd SoloXP && npm test`

### Browser demonstration (demonstration steps 1 to 6)

| Steps | Results |
|---|---|
| https://kakuyomu.jp/ Access (warm up) | ✅ PASS |
| https://kakuyomu.jp/auth/login Move | ✅ PASS |
| Click “Continue with email address” → “Login” | ✅ PASS |
| Enter email/password/Login | ✅ PASS |
| Access /my and check "Nora's dashboard" | ✅ PASS |
| kakuyomu_post Flow execution → v1c2e2s2 Draft submission (13th episode) | ✅ PASS |

---
