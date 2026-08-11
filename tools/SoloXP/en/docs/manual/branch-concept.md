# Why does SoloXP use branches this way? (Super introduction)

An explanation that can be read even if you are not familiar with Git/GitHub. Almost no commands appear.

> How to operate Git itself (`merge`, `rebase`, `--base`, etc.) and what to do when it actually gets stuck.
> [Memo about branch/PR merge strategy](./branch-strategy.md) is summarized. Over there
> This material is for people who have had an accident with Git, so first-time users should read this page first.

## Remember only 3 locations

There are only three types of locations that SoloXP uses.

| Example | Official name | Role |
|---|---|---|
| **Finished product storage area** | `main` (default branch) | A place to store only completed states that have been confirmed to work |
| **Large workshop** | Parent branch (`feature/issue-{number}`) | Place to assemble the entire big work (Story/Bug) |
| **Small work desk** | Sub-Task branch | An even smaller space in the workshop for making only one part |

```
small work desk
   ↓
Small work desk ─→ Large work space
   ↓                 ↓
Small work desk completed
                     ↓
                    main
```

You make one part (sub-task) on a small work desk, transport it to a large workshop, repeat the process, and when all parts are assembled and pass inspection (test/audit), they are reflected in the finished product storage area (`main`) for the first time.

> The diagram above shows the shape of ``when a large task (`[Story]`/`[Bug]`) is divided into multiple parts.''
> If it is a one-off small task (`[Task]`), it can be done from a small work desk without going through a large work area.
> It may be reflected directly in the finished product storage area (`main`).

This is the basic idea behind SoloXP:

> **Do not directly modify the finished product storage area, make it in a separate work area, and reflect it on the finished product side after all inspections are completed.**

The reason why we do not directly rewrite `main` is to prevent "unfinished state" or "state not yet inspected" from being mixed into the finished product storage area.

## However, the finished product is still working while you are working on it.

This is where beginners tend to get confused the most.

The large workspace (parent branch) was created only once as a "copy at that point." Even while parts are being made in the workshop, the finished product storage area (`main`) is constantly being updated with other tasks (different issues).

**Immediately after creating a workshop:**

```
main ─── A
          \
           Workshop ─ B ─ C ─ D
```

**After working for a while (main has moved on):**

```
main ─── A ─ X ─ Y
          \
           Workshop ─ B ─ C ─ D
```

In the workshop, parts B, C, and D are being assembled, but in the meantime, another change, X and Y, is being made in the finished product storage area. This ``Is there a conflict between X and Y and the contents of the workshop (are the same locations rewritten separately?'') is checked when it is finally reflected in the finished product storage area.

**If there is no collision, just reflect it and finish. If there is a collision, move X and Y to the work area.
It is necessary to resolve conflicts after importing them.**

This operation of ``incorporating new changes from the finished product storage area into the work area and resolving discrepancies'' is named `merge` and `rebase` (if there are no conflicts, this operation itself is often unnecessary).

## "Collision" = Merge conflict

If X/Y and B/C/D rewrite the same part, it is not possible to mechanically decide which one to use. This "conflict state" is called a **merge conflict**.

Even when using SoloXP alone, this happens when:

- While you are working on a big task, you interrupt another task with a higher priority and reflect it on `main` first.
- While making multiple parts (sub-tasks) in order in the workshop, over time the finished product storage area is
  I've moved on

``A conflict occurred even though only one person was using it'' is not an abnormal situation, but a normal occurrence in the operation of SoloXP.

## What to do if you get stuck?

In most cases, a coding agent (Claude Code / Codex, etc.) automatically handles the above import and conflict resolution. There is no need for humans to be aware of this every time.

However, when an agent says things like ``There is a conflict'' or ``The workshop is older than the finished product storage area,'' it is enough if you can imagine that they are ``in the process of importing X and Y into the workshop'' as shown in the diagram above.

For a more detailed mechanism (actual branch naming method, commands, differences in behavior on Claude Code Web, etc.), see [Memo about branch/PR merge strategy](./branch-strategy.md).
