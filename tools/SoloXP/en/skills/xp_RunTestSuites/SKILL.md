---
model: claude-sonnet-4-6
---

# XP Run Test Suites Skill

## Command

### `/xp_RunTestSuites`

Run Unit and Functional tests in sequence. Use as a continuous integration check before pushing.

---

## Operating procedure

### 1. Run unit tests

```bash
npm run test:unit / pytest tests/unit / etc.
```

If there is a RED, record it and proceed (do not stop).

### 2. Check communication in preview environment

Identify the preview URL by following the "Communication confirmation procedure" in CLAUDE.md. Manually assembling the URL from the branch name is not used because it will not match the actual URL due to Vercel's automatic shortening and hashing.

```bash
# 1. Get current branch name
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# 2. If you can use VARCEL_TOKEN: Get the preview URL corresponding to the branch using Vercel API
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

# 3. Fallback to BASE_URL → localhost:3000 if VERSEL_TOKEN is not set/obtainment failed
PREVIEW_URL=${PREVIEW_URL:-${BASE_URL:-http://localhost:3000}}

# 4. Confirm communication (test can be executed if 200 is returned)
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $PREVIEW_URL)

# 5. If it is other than 200, wait 30 seconds and retry (up to 2 times)
```

If communication cannot be confirmed: Deployment may not be completed, so record this and skip functional testing.

### 3. Run functional tests

```bash
BASE_URL=$PREVIEW_URL npm run test:functional / pytest tests/functional / etc.
```

### 4. Report the results together

```
## /xp_RunTestSuites Results

Execution date and time: YYYY-MM-DD HH:MM
Branch: <branch name>

### Unit tests
- Results: PASS n results / FAIL n results
- <FAIL details>

### Functional testing
- Preview URL: <URL with communication confirmed or "Unconfirmed (waiting for deployment)">
- Results: PASS n cases / FAIL n cases / SKIP n cases (deployment incomplete, etc.)
- <FAIL details>

### Overall judgment
- ✅ GREEN: push possible
- ❌ With RED: Resolve the following before pushing
- <Items that require action>
```

---

## Notes

- Not applicable for E2E tests (use `/xp_RunE2ETests`)
- Run all suites to completion even with RED
- Tests will not be modified or deleted
- Reports whether or not a push is possible, but does not execute the push itself
