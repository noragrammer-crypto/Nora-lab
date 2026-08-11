# Solo XP autonomous agent system configuration proposal

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│ Project manager layer (Nora on Android/Termux) │
│ - Instructions when creating an issue │
│ - Progress monitoring (gh issue list) │
│ - PR approval │
│ - Work directly with Termux in case of emergency │
└────────────┬────────────────────────────────────────────┘
             │
             │ GitHub API
             ↓
┌─────────────────────────────────────────────────────────┐
│ GitHub Repository (information sharing platform) │
│ ├─ Issues: Task Queue │
│ ├─ PRs: Submission of deliverables │
│ ├─ Projects: Progress Board │
│ └─ META/README/TODO/ChangeLog: Project state management │
└────────────┬────────────────────────────────────────────┘
             │
             │ Webhook / GitHub Actions
             ↓
┌─────────────────────────────────────────────────────────┐
│ Codespace (bugyoyashiki = autonomous agent execution environment) │
│                                                           │
│  ┌──────────────────────────────────────────┐          │
│ │ Bugyo process (bugyo-daemon) │ │
│ │ - Issue monitoring loop (30 seconds interval) │ │
│ │ - tmux session management │ │
│ │ - Task assignment │ │
│ │ - Completion report │ │
│  └────────┬─────────────────────────────────┘          │
│           │                                               │
│  ┌────────┴──────────────────────────────┐             │
│ │ Maid Corps (tmux sessions) │ │
│  │                                          │             │
│  │  ┌─────────────────────────┐          │             │
│  │  │ maid-issue-42             │          │             │
│ │ │ Task: Bug fixes │ │ │
│ │ │ Status: Generating code │ │ │
│  │  └─────────────────────────┘          │             │
│  │                                          │             │
│  │  ┌─────────────────────────┐          │             │
│  │  │ maid-issue-43             │          │             │
│ │ │ Task: Document creation │ │ │
│ │ │ Status: Creating PR │ │ │
│  │  └─────────────────────────┘          │             │
│  │                                          │             │
│  │  ┌─────────────────────────┐          │             │
│  │  │ maid-issue-44             │          │             │
│ │ │ Task: Test implementation │ │ │
│ │ │ Status: Waiting for review │ │ │
│  │  └─────────────────────────┘          │             │
│  └─────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────┘
```

## File structure

```
solo-xp-toolkit/
├── .github/
│   └── workflows/
│ └── wake_bugyo.yml # Issue detection → Codespace startup
│
├── .devcontainer/
│ ├── devcontainer.json # Codespace settings
│ ├── bugyo-daemon.sh # Bugyo main loop
│ └── install-deps.sh # Install dependencies
│
├── agent/
│ ├── maid_worker.py # Maid execution program
│ ├── github_helper.py # GitHub API operation
│   ├── ai_client.py                # Claude/OpenAI API
│ └── utils.py # Common utilities
│
├── docs/
│ ├── META.md # Overall project image
│ ├── ARCHITECTURE.md # This document
│ ├── METRICS.md # Metrics definition
│ ├── TARGET_AUDIENCE.md # Target customer
│ ├── WORKFLOW.md # Operation flow
│ └── BUGYO_LOG.md # Bugyo activity log
│
├── src/ # Actual project code
│ └── (project body)
│
└── README.md
```

## Role of each component

### 1. GitHub Actions (launch trigger)

**File**: `.github/workflows/wake_bugyo.yml`

```yaml
name: Wake Up Bugyo
on:
  issues:
    types: [opened, labeled]
  schedule:
    - cron: '*/30 * * * *' # Regular check every 30 minutes

jobs:
  wake:
    runs-on: ubuntu-latest
    steps:
      - name: Start Codespace
        env:
          GH_TOKEN: ${{ secrets.GH_PAT }}
        run: |
          gh codespace start -c bugyo-yashiki
```

**role**:
- New issue detection (`Waiting` label)
- Codespace autostart
- Periodic survival confirmation

### 2. Magistrate Demon (Task Manager)

**File**: `.devcontainer/bugyo-daemon.sh`

**Operation flow**:
```bash
while true; do
  # 1. Get “waiting” issues in gh issue list
  # 2. Assign tmux session to each issue
  # 3. Start maid process
  # 4. Clean up completed sessions
  # 5. 30 seconds sleep
done
```

**role**:
- Issue queue monitoring
- Starting and managing maid sessions
- Status update (waiting → working → completed)
- Automatic shutdown when all tasks are completed

### 3. Maid worker (actual worker)

**File**: `agent/maid_worker.py`

**Processing flow**:
```python
1. Issue content analysis
2. Code generation with AI API (Claude/OpenAI)
3. Create branch
4. Commit Push
5. PR creation
6. Issue completion report
```

**Input**: `--issue=42`
**Output**: PR creation + Issue comment

### 4. devcontainer settings

**File**: `.devcontainer/devcontainer.json`

```json
{
  "name": "Solo XP Bugyo Yashiki",
  "image": "mcr.microsoft.com/devcontainers/python:3.11",
  "postStartCommand": "tmux new-session -d -s bugyo 'bash .devcontainer/bugyo-daemon.sh'",
  "customizations": {
    "codespaces": {
      "openFiles": ["docs/BUGYO_LOG.md"]
    }
  },
  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": {}
  }
}
```

**Role**: Automatically start Bugyo when starting Codespace

## How to use management interfaces

### 1. Web version Claude Code (lightest)
```
Usage situation: Smartphone only at cafe
Operation: Instructions like a chat
Example: "Fix the bug in the login function"
→ Claude Code creates an issue without permission
→ The magistrate picks it up and disposes of it.

Advantages: Really “just talk”
Disadvantages: Difficult to check in detail
```

### 2. Android Termux + gh CLI (Standard)
```
Usage: Normal monitoring
Operation: Check via CLI
example:
$ gh issue list
$ gh pr view 42
$ gh pr review 42 --approve

Advantages: Lightweight and allows you to see details
Disadvantages: CLI operation required
```

### 3. Android Claude Code (details check)
```
Usage: Debugging and checking details
Operation: Connect directly to Codespace
example:
- Check files directly
- tmux session monitoring
- Manual correction

Benefit: Full control
Disadvantages: Takes time to start up
```

### 4. Direct coding (emergency)
```
Usage status: When CPU time is exhausted
Operation: Direct git operation in Termux
example:
$ git checkout -b hotfix
$ vim src/main.py
$ git push

Advantage: No cost
Disadvantages: Manual work
```

## Normal workflow

```bash
# 1. Create an issue at the cafe (15 seconds)
gh issue create \
  --title "Add error handling to login function" \
  --label "Waiting" \
  --body "The current login process is handling an exception..."

# 2. (Automatic) GitHub Actions launch Codespace

# 3. (Automatic) Magistrate places maid
# → tmux session "maid-issue-42" start
#    → Python agent/maid_worker.py --issue=42

# 4. (Automatic) Maid works
# → Generate code with Claude API
# → Create branch, commit
# → PR creation

# 5. (Notification) Comment on Issue #42
# "✅ PR #100 created"

# 6. Nora confirms and approves (10 seconds)
gh pr review 100 --approve
gh pr merge 100

# 7. (Automatic) Stop Codespace when all tasks are completed
```

## Design essentials

### 1. Change of role of tmux
- ❌ Conventional: Session persistence when a human connects via SSH
- ✅ Solo XP: Agent parallel execution management tool

### 2. Single Codespace + Multiple Agents
- It is possible to launch multiple Codespaces, but it is expensive
- Parallel processing with tmux within one Codespace
- Each task is isolated in an independent process

### 3. Fallback Strategy
- Ensure alternatives at each layer
- Can be continued even when CPU time is exhausted
- Designed so that humans are not completely blocked

## Next steps

### Phase 1: Minimum MVP
- [ ] bugyo-daemon.sh (basic loop)
- [ ] maid_worker.py (echo operation check)
- [ ] 1 Issue → 1 Comment

### Phase 2: Commercialization
- [ ] Claude API cooperation
- [ ] PR automatic creation
- [ ] tmux parallel processing

### Phase 3: Optimization
- [ ] Metric measurement
- [ ] Cost optimization
- [ ] Error handling

---

**Updated date**: 2025-02-07
**Status**: Design completed/waiting for implementation
