# Installation manual

Steps to introduce SoloXP skills (`skills/xp_*`) to your repository/Claude Code environment.

> As a prerequisite, [Claude Code](https://claude.com/product/claude-code) (either CLI version or Web version is available) can be used.
> `gh` For preparation of peripheral tools such as CLI and Node/npm, refer to [Setup Manual](./setup.md).

## 1. Bring SoloXP into your repository

Copy this directory (`SoloXP/`) to any location in your project.

```bash
# Example: Place SoloXP/ at the root of your repository
cp -r /path/to/Nora-lab/tools/SoloXP/en <your-project>/SoloXP
```

As long as the set of `skills/`, `WORKFLOW.md`, and `CLAUDE.md.template` are included, it doesn't matter where they are placed (it will work as long as you have registered the skills as described below).

## 2. Register your skill with Claude Code

Claude Code recognizes skills in two types of scope. Use one or both.

| Scope | Location | Effective range |
|---|---|---|
| Project scope | `<repository root>/.claude/skills/<skill name>/SKILL.md` | Only that repository |
| Personal scope | `~/.claude/skills/<skill name>/SKILL.md` | All repositories on the execution environment |

Each directory under `SoloXP/skills/` (`xp_Director`, `xp_Architect`, `xp_Tester`, etc.) corresponds to one skill and one directory. Registration can be done by "copy" or "symbolic link".

### When copying (simple/environment independent)

```bash
mkdir -p .claude/skills
for d in SoloXP/skills/xp_*; do
  cp -r "$d" ".claude/skills/$(basename "$d")"
done
```

You will need to copy it again every time you update SoloXP.

### When using a symbolic link (updates on the SoloXP side are automatically reflected)

```bash
mkdir -p .claude/skills
for d in "$(pwd)"/SoloXP/skills/xp_*; do
  ln -s "$d" ".claude/skills/$(basename "$d")"
done
```

If you want to reuse it in multiple repositories, you can create a similar symbolic link to `~/.claude/skills/` so that the same skill definition can be referenced from any repository (this method is also used in the development environment of this project).

> Symbolic links cannot overcome synchronization methods such as `git subtree push` that move files by following the history
> (The string itself, not the link destination, is carried and the link becomes broken.) To other repositories
> When setting up an operation to continuously publish and synchronize a set of skills, use a physical copy synchronization script.

## 3. Operation confirmation

Start Claude Code and type `/` followed by `xp_Director`. If the `xp_*` skill group including `xp_Director` is displayed in the skill candidates (command list), registration is successful.

> ⚠️ At this point, do not actually specify the issue number and run it.** `xp_Director <issue number>` is
> Not just a command to confirm operation, but also comments, branch creation/push, and PR issuance for specified issues
> Actual processing to be performed. `gh` CLI authentication and preparation of `CLAUDE.md` ([Setup manual](./setup.md))
> If you run it on the actual issue before it is finished, unintended changes will be made. To check the operation, check the candidate display.
> Only for confirmation, and for actual execution, please refer to [Usage tutorial](./tutorial.md) after setup is complete.
> Follow the steps.

Installation is now complete. Next, proceed to the setup manual.

## Next steps

- [Setup manual](./setup.md) — Necessary preparations before starting use
- [How to use tutorial](./tutorial.md) — Example from first issue to PR merge
