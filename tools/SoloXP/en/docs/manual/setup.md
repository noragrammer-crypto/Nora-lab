# Setup manual

Necessary preparations before actually using SoloXP skills. After registering the skill in the [Installation Manual](./install.md), complete the following steps before proceeding to the [Usage Tutorial](./tutorial.md).

## 1. `gh` CLI authentication

All SoloXP skills use `gh` CLI for GitHub Issue/PR operations. If it has not been installed or certified, please complete it first.

```bash
# Confirm installation
gh --version

# Authentication (login via browser)
gh auth login

# Check authentication status and scope
gh auth status
```

You need permission to read and write issues, create PRs, and create labels for the target repository.

> In the Claude Code web version, `gh auth status` incorrectly displays "Token invalid" due to proxy constraints.
> There are some things. Notes specific to the web version [Claude Code Operational know-how in a web environment](./claude-code-web.md)
> See

## 2. Preparing the label

The type of issue (Story/Task/Bug) itself is determined not by the label but by the `[Story]`/`[Task]`/`[Bug]` tags in the title (xp_Director looks at the title and determines the delegation destination). Labels are mainly used for classifying sub-issues and propagating priorities issued by xp_Architect. Main labels used:

| Label | Use |
|---|---|
| `task` | Automatically assigned to subtask issues issued by xp_Architect |
| `bug` | Bug fix issue (often given along with the `[Bug]` title tag) |
| `epic/<name>` | Epic name to which the parent story belongs (propagated by xp_Architect from the parent issue's epic label) |
| `PriorityHigh` | High priority (automatic propagation from parent to child) |
| `Emergency` | Emergency response (automatic propagation from parent to child) |

> Just adding the `task` label does not make it a Task flow (Architect bypass). Architect
> Do not confuse the title tag `[Task]` to be bypassed and the label `task` attached to a sub-issue as they are different.

If a label does not exist, xp_Architect automatically creates it using `gh label create` when issuing a sub-issue, so it is not necessary to prepare it manually in advance. However, the first run will fail if you do not have label creation privileges, so make sure you are participating in the repository with repository administrator privileges (or privileges that are allowed to create labels).

## 3. Project test environment

SoloXP delegates test execution to the test runner provided by the repository in which it is installed. The English distribution’s mirrored `package.json` is metadata-only: it defines no test scripts or executable Jest suite.

Before using `xp_Tester`, `xp_Implementer`, or `xp_Auditor`, install the target project's dependencies and confirm that the project's own test command succeeds. Record the applicable commands in the project-level `CLAUDE.md`; do not assume that `npm test` or named npm scripts exist unless that project defines them.

## 4. Placement of `CLAUDE.md.template`

Each skill in SoloXP operates on the assumption that the following is defined in `CLAUDE.md` in the repository root:

- Branch operation (flow during Story/Bug/SubTask processing, flow after AllGREEN)
- User pre-approval for PR issuance
- Issue/PR workflow
- TDD development principles
- Working time recording rules
- Operation confirmation/preview environment (project specific)

Copy [`CLAUDE.md.template`](../../CLAUDE.md.template) as is to `CLAUDE.md` in your repository (at the end of the existing `CLAUDE.md` if there is one) and fill in the `<...>` placeholders.

```bash
cat SoloXP/CLAUDE.md.template >> CLAUDE.md
# or if you don't have CLAUDE.md yet
cp SoloXP/CLAUDE.md.template CLAUDE.md
```

If you run the skill without this file, the skill will not be able to refer to the branch operation or the criteria for determining whether to issue a PR, resulting in unintended behavior (confirmation is required each time a PR is issued, parent branch operation does not function, etc.).

## 5. About supported platforms

The author mainly verifies using Claude Code (web version) on a daily basis. In principle, it should work in other AI coding agent environments such as Claude Code CLI and Codex, but there is no guarantee of operation (**No Warranty**, see [README.md](../../README.md) for details).

When using the Claude Code web version, please also refer to [Claude Code operating know-how in a web environment](./claude-code-web.md), which summarizes know-how specific to the web version, such as proxy constraints, GitHub authentication misdetection, and communication confirmation of the preview environment to which you are deploying.

## Ready Checklist

- [ ] `gh auth status` indicates valid permissions for the target repository
- [ ] The contents of `CLAUDE.md.template` have been reflected in `CLAUDE.md` (placeholder embedded)
- [ ] If tests will run, the target project's dependencies are installed and its own test command succeeds
- [ ] The skill is registered in `.claude/skills/` or `~/.claude/skills/` ([Installation Manual](./install.md))

Once everything is done, go to [Usage Tutorial](./tutorial.md).
