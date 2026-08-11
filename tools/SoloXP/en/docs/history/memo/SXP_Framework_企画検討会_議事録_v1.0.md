# Minutes: SXP (Solo eXtreme Programming) Framework planning review meeting

**Date and time**: February 5, 2026
**Participant**: Nora, Claude
**Agenda**: Basic design of multi-AI agent development framework
**Version**: v1.0

---

## 1. Background/Reference materials

Consideration based on the following technological trends and existing cases:

- **CCPM** (Claude Code PM): GitHub Issues × worktree parallel processing
  - https://github.com/automazeio/ccpm
  - https://note.com/engineers_hub/n/nebaf22b92be7
  
- **multi-agent-shogun**: tmux hierarchical agents, event driven
  - Separation of staff and magistrates in v1.2 (evolved from death from overwork)
  - https://github.com/yohey-w/multi-agent-shogun
  
- **Beans**: Flat file issue tracker, Markdown+YAML
  - https://github.com/hmans/beans
  
- **Gas Town**: Multi-agent coordination system
  - https://github.com/steveyegge/gastown

---

## 2. Core concept

### External specifications: XP framework (serious)
```
- Story card management
- Weekly iterations
- Velocity tracking
- GitHub Issues/Milestones integration
- Timespan visualization
```
→ From the outside, it looks like normal agile development.

### Internal implementation: Maid Squad Architecture (fun)
```
Sebastian (Head Maid)
    ↓
Staff Maid (Planner) / Magistrate Maid (Manager)
    ↓
Execution Maid x 3 (Alice/Belle/Claire)
```
→ A maid squad is working behind the scenes (tone flavor only, no game elements)

**Password**: "Serious on the outside, fun on the inside"

---

## 3. Technical configuration proposal

### 3.1. Device configuration

**Home server + mobile client configuration**:

- **Tablet (Android)**: Home resident server
  - Home WiFi connection, AC power always connected
  - tmux 24 hour operation
  - 5 agent execution environment
  - Automatically start with Termux:Boot
  - Maintenance can be done slowly after returning home

- **Smartphone (Android)**: On-the-go client
  - Connect to your home tablet via Tailscale VPN
  - SSH + tmux attach (or via GitHub Issue)
  - Only giving instructions and checking results
  - Retrospective editing with Obsidian
  - Luggage minimization (optimal for traveling by bike)

**Connection method**:
```bash
# From your smartphone (at a cafe, while your bike is parked, etc.)
farm # 1 command with alias settings
# → automatically ssh + tmux attach
```

**advantage**:
- ✅ Stability of power supply and communication (home environment)
- ✅ All you need to carry is your smartphone (lightweight)
- ✅ Your tablet will continue to work while you are on the bike.
- ✅ Zero risk of losing your tablet
- ✅ No worries about heat generation or battery
- ✅ Independent of cafe WiFi quality (via Tailscale)

### 3.2. Mobile environment optimization

**tmux screen configuration**:
- **Front screen (main)**: The only screen that Nora interacts with
- **Back screen (workers)**: Displays only 2-3 lines, basically not visible
- Supports movement between cafes with tmux detach/attach
- Check the log later on Obsidian

### 3.3. Agent configuration (5 people)

| Role | Name | Responsible | Token consumption |
|------|------|------|-------------|
| Head Maid | Sebastian | Judgment/approval/external response | Low |
| Planner | Staff Maid | Task breakdown and strategy planning | Medium |
| Manager | Magistrate Maid | Progress management, coordination, and reporting | Medium |
| Worker 1 | Alice | Writing (novels/documents) | High |
| Worker 2 | Belle | Technical (code/investigation) | High |
| Worker 3 | Claire | Data system (organizing and aggregating) | Medium |

**Key points for role definition**:
- Separation of staff and magistrate (lessons of Shogun v1.2)
- Single responsibility principle
- Compaction countermeasures: Recovery procedures are provided for each agent

**Token efficiency**:
- 3-tier context (Memory/Global/Project)
- YAML based communication
- Event driven (zero API consumption while waiting)

### 3.4. Weekly handoff coordination

```
Automatic execution on Sunday night 21:00
├─ .beans/ aggregation
├─ GitHub Milestone updated
├─ Weekly report generation
├─ Velocity calculation
└─ Create a confirmation file with Obsidian
```

Integrates with existing meal log/selection list management

### 3.5. How to operate (multiple choices)

**Method A: Direct interactive (SSH + tmux)**
```bash
# Connect from smartphone
farm
# → tmux attach

>Write chapter 3 of your novel
[Sebastian] I'm smart.
```

- Advantages: Fast response, interactive, detailed instructions
- Disadvantage: Connection operation required
- Suitable for: trial and error, debugging, consultation-based

**Method B: Asynchronous type (GitHub Issue driven)**
```
Create GitHub Issue using smartphone browser
  ↓
Home tablet detects webhook/Polling
  ↓
Maid Squad autorun
  ↓
Update issue upon completion (comments/file attachments)
```

- Advantages: Can keep throwing, clear history, from anywhere
- Disadvantages: Delayed response, difficult to interact
- Suitable for: Clear tasks, long hours of work, and people who are left alone

**Issue creation assistance**:
- Create a draft with ChatGPT/Claude → Copy and paste
- Use Issue Template (fill in the blanks format)
- Create by sending email

**Method C: Hybrid**
- Start by creating an issue → Connect to SSH if you are interested in the progress
- Consult via SSH connection → Automate by turning the results into issues

**We plan to verify a method that is easy to use in actual operation**

---

## 4. Development approach

### Meta development method

**"Develop the SXP framework itself with XP"**

project:
- Name: SXP Framework development
- Development method: XP (manual → gradual automation)
- Deliverables: agents.md, communication protocols, scripts, documentation
- Verification: Run the framework during framework development itself

### Gradual automation

**Phase 1: Fully manual (Week 1-2)**
```
Nora herself:
✓ Write a story card
✓ Break down into tasks
✓ Individual instructions to Claude
✓ Manually update progress to GitHub Issues
✓ Manually perform weekly aggregation

Objective: Get a feel for the workflow
```

**Phase 2: Semi-automation (Week 3-4)**
```
✓ Delegating task breakdown to staff staff (manual approval)
✓ Entrust the execution to three maids
✓ Introduction of progress aggregation script
✗ GitHub sync is still manual

Purpose: Observe and adjust agent behavior
```

**Phase 3: Almost automatic (Week 5-8)**
```
✓ Manual story creation only
✓ Decomposition, allocation, and execution are automatic
✓ Automatic GitHub sync
✓ Weekly handoff automation

Purpose: Measure token consumption and velocity
```

**Phase 4: Fully operational (Week 9 onwards)**
```
✓ Fully automatic (Nora only approves)
✓ Applicable to other projects such as novel writing
✓ Released as a framework?

Purpose: Demonstrate the true power of Digital Farmer
```

### About velocity

**Proceed at a "relaxing pace"**
- Don't overdo it
- Adjust while looking at weekly usage (token cost)
- If it's not fun, it won't last.
- Velocity is a reference value and is not strictly managed.

---

## 5. Phase 0: Technical verification (top priority)

**Verify the following on actual equipment before making full-scale development decisions**

### 5.1. Required verification items

#### Home tablet side
- [ ] Termux environment construction (tmux, Python, Go, Tailscale)
- [ ] tmux 5 window startup/stability check
- [ ] 24-hour continuous operation test (leaved on weekends)
- [ ] Termux:Boot automatic startup confirmation
- [ ] Confirmation of heat generation (installation location/ventilation)
- [ ] Go environment: `pkg install golang`
- [ ] Beans build: `go install github.com/hmans/beans@latest`
- [ ] `beans tui` rendering confirmation
- [ ] `beans graphql` operation check

#### Smartphone side
- [ ] SSH connection via Tailscale VPN
- [ ] tmux attach operation confirmation
- [ ] Stability on 4G/5G lines
- [ ] Behavior when switching cafe WiFi
- [ ] Confirm latency tolerance range (experience)
- [ ] Confirm operability (screen size, input method)

#### YAML communication protocol
- [ ] Latency measurement of file-based communication
- [ ] tmux send-keys (twice split) operation confirmed
- [ ] Event-driven stability

#### Python + Claude API
- [ ] Authentication from Termux
- [ ] Simultaneous execution of multiple processes
- [ ] Check behavior of rate limit
- [ ] Token consumption measurement

#### Actual operation simulation
- [ ] Morning: Connect at home → Insert task → Detach
- [ ] Afternoon: Connect at cafe → Check progress → Additional instructions
- [ ] Evening: Connect at another cafe → Check result → Approve
- [ ] Evening: Weekly processing confirmation after returning home

### 5.2. Option validation
- [ ] Obsidian ⇄ Termux sync (symlink or Google Drive)
- [ ] GitHub Webhook reception (via Tailscale)
- [ ] Battery consumption measurement
- [ ] Measures against fever in summer

### 5.3. Verification completion conditions

Go to this implementation if you clear 70% or more of the following:
- tmux stable operation (24 hours)
- SSH connection response tolerance range
- Beans build success
- Basic communication test successful

**If there is a fatal problem, consider alternatives**

---

## 6. Assumed risks and countermeasures

| Risk | Probability of occurrence | Impact | Countermeasures |
|--------|---------|--------|--------|
| Beans cannot be built | Medium | Medium | Pre-built binaries or homemade lightweight tracker |
| tmux instability (Android) | Low | High | Reducing the number of windows, periodic restart script |
| Over-consumption of API | Medium | High | Thoroughly event-driven, reducing the number of agents, monitoring costs |
| Home power outage | Low | Medium | Termux:Boot automatic recovery, consideration of UPS installation |
| Tailscale connection unstable | Low | Medium | Polling backup, retry logic |
| Tablet fever | Medium | Low | Consider installation location, reduce processing in summer |

---

## 7. Deliverable image (after 8 weeks)

```
sxp-framework/
├─ .beans/
│ ├─ stories/ # Developed stories group
│ ├─ tasks/ # Task (automatically generated)
│ ├─ iterations/ # 8 weeks of iteration records
│ ├─ metrics/ # Velocity, cost, token consumption data
│ └─ comm/ # Communication between agents (implemented)
│
├─ agents/
│ ├─ agents.md # ← Main deliverable: Agent specification
│ ├─ RULES.md # Prohibited items definition
│ ├─ sebastian.py # Head Maid implementation
│ ├─ planner.py # Staff Maid
│ ├─ manager.py # Magistrate maid
│ └─ maid.py # Execution maid
│
├─ scripts/
│ ├─ farm-setup.sh # tmux startup script
│ ├─ weekly-handoff.py # Weekly processing automation
│ ├─ github-sync.py # GitHub integration
│ └─ usage-tracker.py # Token cost monitoring
│
├─ docs/
│ ├─ architecture.md # System design
│ ├─ protocol.md # Communication protocol specification
│ ├─ tutorial.md # Usage guide
│ └─ retrospectives/ # Weekly retrospectives
│
└─ README.md
```

**Can be applied to other projects as a general-purpose framework**
- Novel writing workflow
- Automatic generation of note articles
- Technical research/document creation

---

## 8. Cost token management

### 8.1. Estimated costs
- Shogun example: $200 per month (Max x 20)
- SXP assumption: $50-100 per month (depending on usage and frequency)
- Event-driven to minimize API consumption

### 8.2. Monitoring method
```python
# recorded in .beans/metrics/usage.jsonl
{
  "timestamp": "2026-02-05T10:30:00",
  "agent": "alice",
  "tokens": 1500,
  "cost_usd": 0.045,
  "story": "STORY-001"
}
```

### 8.3. Weekly Report
```markdown
## Week N Usage Report
Total Cost: $12.50
Budget: $50/week → 25% usage ✓

By Agent:
- Planner: $4.20
- Alice: $5.10
- Belle: $2.30
- Others: $0.90

Cost per Story Point: $2.50/pt
```

---

## 9. Next Actions

### Priority: Highest (this week to next week)

**Phase 0 technical verification** ← Start here

1. **Environmental preparation (1 day)**
   - [ ] Install Termux on your home tablet
   - [ ] Basic package installation
   - [ ] Tailscale settings

2. **Basic operation confirmation (2 days)**
   - [ ] tmux 5 window startup test
   - [ ] SSH connection confirmation
   - [ ] Python + YAML communication test

3. **Long-term operation test (weekend)**
   - [ ] 24 hours unattended operation
   - [ ] Heat generation/stability confirmation
   - [ ] Observation of behavior when a problem occurs

4. **Summary of verification results (1 day)**
   - [ ] Note to Obsidian
   - [ ] Determine if there is a fatal problem
   - [ ] GO/NOGO judgment

### Priority: High (after verification, in case of GO judgment)

**Week 1 implementation**
- [ ] GitHub Project creation (sxp-framework)
- [ ] Week 1 Milestone settings
- [ ] agents.md draft creation
- [ ] Communication protocol specifications
- [ ] Minimum configuration prototype (3 people)

### Priority: Medium (Phase 2 and later)
- Expansion to 5 people
- GitHub Issue integration implementation
- Weekly handoff automation
- Velocity measurement

### Priority: Low (Phase 3 or later)
- Dashboard visualization
- Obsidian integration enhancements
- Document maintenance
- Application to other projects

---

## 10. Reference links

### Technical data
- CCPM: https://github.com/automazeio/ccpm
- multi-agent-shogun: https://github.com/yohey-w/multi-agent-shogun
- Beans: https://github.com/hmans/beans
- Gas Town: https://github.com/steveyegge/gastown
- note article: https://note.com/engineers_hub/n/nebaf22b92be7

### Related methods
- XP (Extreme Programming): https://www.extremeprogramming.org/
- Story Mapping: User story visualization method
- Velocity Tracking: Agile development productivity metrics

### Android development
- Termux: https://termux.dev/
- Termux:Boot: Automatic boot settings
- Tailscale: https://tailscale.com/

---

## 11. Impressions

**Claude**: 
- "The framework itself was developed with XP" is a self-referential and beautiful design
- Greatly improves practicality with home tablet + smartphone configuration
- Technical feasibility is high (90%)
- Stability in Android environment depends on verification, but risk is manageable
- Nora's "relaxing pace" is the key to sustainability
- There are many options for operation methods and can be optimized in actual operation.

**Nora**: 
- Basic policy OK
- Velocity is slow and playful
- **Start with technical verification** ← Most important
- Decide whether it can be used or not.

---

## 12. Next meeting schedule

**After Phase 0 validation complete**
- Verification result review
- GO/NOGO judgment
- For GO: Week 1 implementation plan details
- In case of NG: Consider alternatives

---

**More than**

(version history)
- v1.0: 2026-02-05 First edition created
