# Solo XP Target Customer Analysis

## Resource constraint matrix

```
        │ Plenty of time │ Limited time
────────┼─────────────┼──────────────
Money │ Millionaire freelancer │ Rich company
Abundance │ (Rare case) │ → API pounding
        │ │ Hire people
        │ │ Solo XP not required
────────┼─────────────┼──────────────
Money │ Digital Farmer │ Poor office worker
Constraints │ ⭐Solo XP optimal │ → Clogged
        │ (Nora type) │ (night pot labor)
        │ │ Solo XP effect weak
```

**Solo XP shines in the “I don't have money but I don't have time”**

## Primary Target: Digital Farmer

### Basic attributes

```
Age: 40-60s
Occupation: Retired engineer, semi-retired, freelance
Work style: Mobile worker, cafe-hopping type
Budget: Within 5,000 yen per month
Skills: Engineering experience (required)
```

### Resource status

**Money (Budget)**:
- ❌ Enterprise API contract is impossible
- ❌ It is impossible to hire full-time engineers
- ✅ Free tier + small charge possible

**Time (Availability)**:
- ❌ Unable to get continuous work time (a lot of traveling)
- ❌ Fixed hours like 9:00-17:00 are not available
- ✅ Plenty of fragmented time (cafe, on the move)
- ✅ Make effective use of waiting time

**Skills (technical ability)**:
- ✅ No resistance to Git/GitHub operations
- ✅ Familiar with CLI operations
- ✅ Code review possible
- ✅ Able to judge and approve

### Typical day

```
10:00 Arrival at Cafe A
10:00-10:15 Issue issue (15 minutes)
10:15-12:00 Reading/Novel writing (Magistrate works behind the scenes)

12:00 Motorcycle movement (the magistrate continues to work)

13:00 Arrive at Cafe B
13:00-13:10 PR confirmation/approval (10 minutes)
13:10-15:00 Other work (bugyo is the next task)

15:00 Motorcycle movement (the magistrate continues to work)

16:00 Arrival at Cafe C
16:00-16:05 Final confirmation (5 minutes)
16:05-18:00 Writing my own novel

Human work: 30 minutes
AI work: 6 hours (parallel)
Travel time: make good use of it
```

### Value proposition

**“Your travel time turns into production time”**

- If you throw an issue, the AI ​​will work while you are moving.
- When you arrive at the cafe, your PR will be ready.
- No continuous work time required, just judgment is required
- Budget fits in the free tier

### Pain points (problems to be solved)

1. **Unable to get continuous working time**
   - Café patrol, motorcycle transportation
   - → With Solo XP, AI works even while on the move

2. **Limited budget**
   - Enterprise tools are too expensive
   - → Free tier + operation with small charges

3. **You have to do it all by yourself**
   - No team
   - → AI cooperates as multiple maids

4. **I don't want to manage infrastructure**
   - Server operation is troublesome
   - → Codespace does it all for you.

## Secondary target: Side job engineer

### Basic attributes

```
Age: 30-50s
Occupation: Full-time employee (main job) + side job
Work style: Main job 9-17 weekdays, side job in the evenings/weekends
Budget: Within 10,000 yen per month
Skill: Active engineer
```

### Resource status

**Money (Budget)**:
- ✅ Possible for around 10,000 yen per month
- ❌ Enterprise plans are tough

**Time (Availability)**:
- ❌ Complete block during weekday daytime (main job)
- ✅ Fragmented time at night and on weekends
- ✅ Can be checked and approved during commuting time

**Skills (technical ability)**:
- ✅ Active engineer (no problem)

### Typical day

```
07:00 Commuter train
07:00-07:10 Post issue

09:00-17:00 Main job (AI works)

18:00 Train home
18:00-18:10 PR confirmation/approval

19:00-22:00 Family time (AI next task)

22:00 Check before going to bed
22:00-22:05 Final check
```

### Value proposition

**"AI is writing code while you sleep"**

- AI helps you with your side job even during your main job
- Instructions and approval based on commuting time
- It is OK if you concentrate on checking on the weekend.

### Pain Point

1. **I don't have time for my day job**
   - Side jobs only available at night and on weekends
   - → AI works during main work

2. **Limits of physical strength and energy**
   - Coding at night is painful.
   - → Just leave the decision to AI

3. **Delivery pressure**
   - Client project deadline
   - → Accelerate with 24-hour operation

## Deprecated target

### ❌ Rich companies/startups

**reason**:
- Unlimited usage with Claude API Enterprise
- Can be executed in parallel with Codespace Team
- Hire a full-time engineer
- No need for Solo XP within-constraint optimizations

**Recommended tools**:
- GitHub Copilot Enterprise
- Cursor Pro
- Input human resources

### ❌ Non-engineers (lack of skills)

**reason**:
- Git/GitHub operation required
- Code review ability required
- There is resistance to CLI operation
- Difficult to set up

**Recommended tools**:
- Replit Agent
- Bolt.new
- No-code tools

### ❌ Students who don't have time or money

**reason**:
- Severe time constraints (part-time job + classes)
- Unable to utilize waiting time
- Free tier is also limited

**Recommended**:
- Make time
- or tools with student free tier

## Persona details

### Persona 1: Nora (ideal user)

```
Name: Nora
Age: 60s
Occupation: Former engineer (retired) → Digital Farmer
Work style: Visiting cafes on a 125cc motorcycle

resource:
- Budget: 5,000 yen per month
- Time: Flexible (free)
- Skills: 25 years of engineering experience

Current issues:
- Mainly novel writing, technical development secondary.
- Unable to get continuous work time
- I don't want to manage infrastructure
- But I like engineering.

After Solo XP:
- Post an issue and move → When you arrive at the cafe, you can promote it.
- Mainly writing novels, development progressing
- Leave it to the magistrate to make the decision.
- Can also be used as blog material
```

### Persona 2: Takeshi (side job engineer)

```
Name: Takeshi
Age: 35 years old
Occupation: Full-time SIer + side job Web development
Work style: Weekdays 9-17 main job, night/weekend side job

resource:
- Budget: 10,000 yen per month
- Time: 2 hours at night, 6 hours on weekends
- Skills: Active engineer (React/Node.js)

Current issues:
- It's hard to code at night because I'm tired from my day job.
-Delivery pressure for side job projects
- I want to secure family time as well.

After Solo XP:
- AI advances side business projects during the main job
- Instructions and approvals on commuter trains
- Only final confirmation on weekends
- Increased family time
```

### Persona 3: Yuki (Mom Engineer)

```
Name: Yuki
Age: 38 years old
Occupation: Freelance while raising children
Work style: Only when the child is sleeping

resource:
- Budget: 3,000 yen per month
- Time: Super fragmentary (depending on the child)
- Skill: Full stack engineer

Current issues:
- Immediately stop when the child wakes up
- Unable to get 1 hour of continuous work time
- But I need income

After Solo XP:
- AI works while you are playing with your child
- Confirm and approve after putting to bed
- No problem with interruptions
- Realize flexible working styles
```

## Marketing message

### Draft catchphrase

1. **"Rich people keep hitting the API. I make the AI ​​wait."**
2. **"A story about an AI working for 6 hours while traveling to a cafe"**
3. **“1 million monthly income with free tier: Digital Farmer’s survival strategy”**
4. **“AI utilization techniques for people who are poor but have free time”**
5. **“While I was sleeping, I made three PRs”**

### Appeal points

**Efficiency**:
- “Travel time turns into production time”
- "24-hour operation, all you have to do is make decisions"

**Economy**:
- "Can be operated only in the free tier"
- "Full-scale AI collaborative development within 5,000 yen per month"

**Flexibility**:
- "No continuous working time required"
- "Instructions and approvals with just your smartphone"

**Autonomy**:
- "GitHub Issue automatically turns into PR"
- “The magistrate will manage it as he pleases.”

## Success metrics

### Signs that users are satisfied with Solo XP

- You can leave it alone by just posting an issue.
- The feeling of being able to promote while on the move
- Monthly costs are within budget
- I feel "easier"
- I can concentrate on other tasks (such as writing a novel)

### Signs users are dissatisfied with Solo XP

- Intervention required for debugging each time
- CPU time/token runs out quickly
- PR quality is too low
- Too troublesome to set up
- In the end, manual is faster

---

**Conclusion**: Solo XP is a system optimized for those who don't have money or time, but have skills.

**Updated date**: 2025-02-07
