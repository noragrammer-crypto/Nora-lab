# Solo XP metrics definition

## Paradigm shift: Reversing constraints

### Traditional development
```
Constraint (bottleneck) = human work time
    ↓
Optimization target = “How to save human time”
    ↓
Methodology = automation, efficiency, tool implementation
```

### Solo XP with AI
```
Constraint (bottleneck) = token or CPU time
    ↓
Optimization target = “How to use AI/computing resources efficiently”
    ↓
Humans have relatively abundant time (the magistrate works even while traveling to the cafe)
```

**This is a complete reversal of position. AI-era version of TOC (Theory of Constraints).**

## Important metrics

### Primary metrics (constraint candidates)

#### 1. Token consumption rate

**Measurement items**:
- Number of tokens per issue processed
- Daily token consumption
- Remaining amount up to monthly limit (%)

**Calculation formula**:
```
Token consumption rate = Cumulative consumption for the month / Monthly upper limit
Issue unit price (tokens) = Total consumed tokens / Number of issues processed
```

**Optimization direction**:
- Prompt efficiency (system prompt optimization)
- Context compression (delete unnecessary history)
- Proper model selection (Haiku vs Sonnet vs Opus)
- Improved efficiency in batch processing

**Target value**:
- Monthly consumption rate: < 80% (buffer secured)
- Issue unit price: < 100K tokens

#### 2. CPU time consumption rate

**Measurement items**:
- Codespace uptime (hours/day)
- Percentage of idle time (%)
- Average time per issue processed
- Number of parallel executions (tmux sessions)

**Calculation formula**:
```
CPU time consumption rate = (current month's cumulative time x number of cores) / monthly upper limit
Operating efficiency = Actual working time / Total operating time
Issue unit price (hours) = total working time / number of issues processed
```

**Optimization direction**:
- Reduce waiting time (polling interval adjustment)
- Parallelism adjustment (tmux session number optimization)
- Immediate shutdown (sleep after work)
- Nighttime suspension (suspension during unnecessary hours)

**Target value**:
- Monthly consumption rate: < 80%
- Operating efficiency: > 60% (idle time less than 40%)
- Issue unit price: < 2.0h

### Secondary metrics (throughput)

#### 3. Issue completion rate

**Measurement items**:
- Number of issues processed/day
- Number of PRs created/day
- Number of completed merges/day
- Issue retention time (created → completed)

**Target value**:
- Issue processing: 3-5 issues/day
- PR creation rate: > 80% (Issue → PR conversion rate)
- Merge rate: > 70% (PR → merge conversion rate)

#### 4. Human intervention time

**Measurement items**:
- Issue creation time (average)
- PR confirmation time (average)
- Debugging intervention time (total/day)

**Target value**:
- Issue creation: < 5 minutes/issue
- PR confirmation: < 3 minutes/item
- Debugging intervention: < 30 minutes/day

## Strategy matrix according to constraints

| Constraints | Strategy | Implementation example |
|---------|------|--------|
| **Token constraint** | Prompt efficiency | - System prompt optimization<br>- Reduction of unnecessary context<br>- Preferential use of Haiku<br>- Request for simplification of answer |
| **CPU time is a constraint** | Shortened operating time | - Extended polling interval (30 seconds → 60 seconds)<br>- Immediate shutdown<br>- Complete stop at night<br>- Increased work on Android side |
| **Affordable for both** | Maximizing throughput | - Maximizing parallelism (more tmux sessions)<br>- Aggressive background processing<br>- Speculative code generation<br>- Refactoring automation |
| **Both exhausted** | Manual fallback | - Termux direct work<br>- Wait until next month<br>- Reassess priorities |

## Monthly report template

```markdown
# Solo XP Monthly Report - MM month, YYYY

## Restriction status
- **Token consumption**: XX% (X.XM / 10M)
- **CPU time consumption**: XX% (XXh / 120h) [⚠️ Constraint / ✅ Margin]
- **Human intervention time**: X.Xh/day

## Bottleneck analysis
[Which is the constraint: token or CPU time?]

**Constraints**: CPU time
→ Next month's optimization policy:
  1. Extended polling interval from 30 seconds to 60 seconds
  2. Implement immediate stop after task completion
  3. Completely closed at night (23:00-06:00)

## Throughput
- Issue handling: XX
- PR creation: XX (conversion rate: XX%)
- Merge completed: XX items (Merge rate: XX%)

## Issue unit price
- Tokens/Issue: Average XXK tokens
- CPU time/Issue: Average X.Xh
- Human Time/Issue: Average X minutes

## Efficiency indicators
- Operating efficiency: XX% (actual working time / total working time)
- Issue dwell time: Average Xh
- Automation rate: XX% (percentage completed without human intervention)

## Topics
[Notable events, improvements, and problems]

## Next month's actions
- [ ] Action 1
- [ ] Action 2
```

## Cost efficiency analysis

### The reality of the free tier

#### GitHub Codespaces
```
Free tier: 120 core hours per month (2 cores x 60 hours or 4 cores x 30 hours)

Expected consumption pattern:
- 2 cores, 2 hours a day: 60 hours/month → barely
- 2 cores, 24-hour operation: 720 hours/month → significantly exceeded
- 4 cores, 1 hour a day operation: 60 hours/month → Barely

Conclusion: “Start it only when you have work to do” is essential.
```

#### Claude API (assumes Pro membership)
```
Free tier: Details to be confirmed (waiting for actual measurements)

Estimated consumption:
- 1 Issue = 50-150K tokens
- 3 Issues per day = 150-450K tokens
- Monthly = 4.5-13.5M tokens

Bottom line: prompt efficiency is key
```

### Cost optimization priorities

1. **Reducing CPU time** (easily exhausted)
   - Implementation of immediate shutdown
   - Adjust polling interval
   - Night stop

2. **Token efficiency** (next depletion)
   - Optimized system prompts
   - Context compression
   - Model selection (using Haiku)

3. **Improve throughput** (when there is margin)
   - Increased concurrency
   - Expansion of automation scope

## Actual measurement dashboard (recorded after operation starts)

### Week 1
```
Date: 2025-02-XX
Tokens: X% (cumulative since start)
CPU time: X% (cumulative since start)
Processing Issue: X
```

### Week 2
```
(Recorded in the same way below)
```

---

**Important**: This metric will be continuously improved based on actual measurements.
After the start of operation, data will be recorded weekly and reviewed monthly.

**Updated date**: 2025-02-07
**Next update**: 1 week after start of operation
