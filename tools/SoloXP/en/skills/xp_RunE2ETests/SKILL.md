---
model: claude-sonnet-4-6
---

# XP Run E2E Tests Skill

## Command

### `/xp_RunE2ETests`

Run the E2E test suite. Used to confirm acceptance upon story completion and before PR creation.

---

## Operating procedure

### 0. Execution environment check (must be done first)

Tests cannot be executed in an environment where Playwright is not running. Check the environment using the method below, and if it cannot be executed, immediately skip it.

```bash
# Check if Playwright is available
npx playwright --version 2>/dev/null
# or
which playwright 2>/dev/null
```

**Conditions that are considered unfeasible:**
- `npx playwright --version` causes an error
- Working on an Android device (no browser execution environment)

**Running in ClaudeCode web environment:**

ClaudeCode Web uses Playwright MCP to perform E2E testing on local servers. A local server is automatically started at `http://localhost:3000` when the session starts.

Start the local server manually if it is not started:

```bash
# Start local server (mimics Vercel routing)
node /home/user/HolyAutomater/scripts/dev-server.js > /tmp/dev-server.log 2>&1 &

# Confirm communication
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
# → If 200 is returned, startup is successful
```

**Processing if execution is not possible (Android only):**

Finish by posting the following comment on the story issue you are working on:

```
## /xp_RunE2ETests Skip

Execution date and time: YYYY-MM-DD HH:MM

### Skip reason
**Skipped E2E test due to execution environment constraints.**

Playwright is not available in the current environment (Android), so
Unable to run test.

### E2E test design
The test suite design and code have been created (see `/xp_E2Etest`).
Please perform the actual execution in an environment where Playwright is available (local PC / CI / ClaudeCode Web).

### Acceptance judgment
⏭️ Skip: Cannot be executed due to environmental constraints. Confirmation in the local environment is required.
```

After posting a comment, this skill will end processing. Do not perform subsequent steps.

---

### 1. Determine the test runner

Check the `test:e2e` script contents of `package.json` of the project to be executed and determine whether it is based on Playwright or Jest.

```bash
TEST_E2E_SCRIPT=$(node -p "require('./package.json').scripts['test:e2e'] || ''")
echo "$TEST_E2E_SCRIPT"
```

- If it includes `playwright` → Playwright base. Proceed to step 2 (confirm the test target URL) and check communication to Vercel/localhost as usual.
- Including `jest` (not including `playwright`) → Based on Jest. Skip the communication check and run `npm run test:e2e` in step 3 without setting `BASE_URL`.

### 2. Check the test target URL (only for Playwright-based cases)

**For ClaudeCode web environments:** Use a local server.

```bash
# Check communication with local server
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$STATUS" = "200" ]; then
  BASE_URL="http://localhost:3000"
echo "Local server OK: $BASE_URL"
else
echo "Local server not started. Start it and retry."
  node /home/user/HolyAutomater/scripts/dev-server.js > /tmp/dev-server.log 2>&1 &
  sleep 3
  BASE_URL="http://localhost:3000"
fi
```

**For local PC/CI environments:** Use the Vercel preview URL.
Manually assembling the URL from the branch name is not used because it will not match the actual URL due to Vercel's automatic shortening and hashing.

```bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# If VARCEL_TOKEN is available: Get the preview URL corresponding to the branch using Vercel API
if [ -n "$VERCEL_TOKEN" ]; then
  PREVIEW_URL=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
    "https://api.vercel.com/v6/deployments?projectId=holyautomater&limit=20" \
    | python3 -c "
import sys, json
deps = json.load(sys.stdin)['deployments']
for d in deps:
    if d['meta'].get('githubCommitRef') == '$BRANCH':
        print('https://' + d['url']); break
")
fi

# Fallback to BASE_URL → localhost:3000 if VERSEL_TOKEN is not set/obtainment failed
PREVIEW_URL=${PREVIEW_URL:-${BASE_URL:-http://localhost:3000}}
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $PREVIEW_URL)
# If it is other than 200, wait 30 seconds and retry (up to 2 times)
BASE_URL=$PREVIEW_URL
```

If communication cannot be confirmed: Report to that effect and end the process.

### 3. Run E2E tests

**For Playwright based:**

```bash
BASE_URL=$BASE_URL npm run test:e2e
```

**Jest-based (skip communication check):**

```bash
npm run test:e2e
```

### 4. Report your results

```
## /xp_RunE2ETests results

Execution date and time: YYYY-MM-DD HH:MM
Target URL: <PREVIEW_URL>
Target story: #<issue number>

### Results
- PASS: n items
- FAIL: n results

### FAIL Details
- `<Test name>`: <Failure details>

### Acceptance judgment
- ✅ All items PASS: Story completed/PR creation possible
- ❌ FAIL: Acceptance criteria not met
- Items that require action: <List>
```

---

## Notes

- Excludes Unit/Functional tests (uses `/xp_RunTestSuites`)
- Tests will not be modified or deleted
- Comment on the target story issue for the acceptance decision result.
