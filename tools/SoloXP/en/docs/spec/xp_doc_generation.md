# Document generation skills (xp_doc_*)

Target skills: `xp_doc_reference` / `xp_doc_spec` / `xp_doc_UnitTests` / `xp_doc_FunctionTests` / `xp_doc_E2ETests`

Called from `xp_Documenter`, it generates and updates various documents (reference / spec / UnitTests / FunctionTests / E2ETests) after implementation is complete.

## Resolution of scan target/output directory (#1532)

HolyAutomater has a monorepo configuration where `api/` is dedicated to Vercel Function entry points.
(see root `CLAUDE.md`), source test documents are placed directly under the root of each epic.
Therefore, each `xp_doc_*` skill determines the scan target/output directory in the following priority order:

| Priority | Directory |
|--------|------------|
| 1 (preferred/backwards compatible) | If `api/<EpicName>/...` exists |
| 2 (Fallback) | Directly under `<EpicName>/...` (actual placement used by most real epics) |

Specific target paths for each skill:

| Skill | Scan target (fallback) | Output destination (fallback) |
|---|---|---|
| `xp_doc_reference` | `<EpicName>/scripts/` → `<EpicName>/` directly below `*.js`/`*.py` (3 levels) | `<EpicName>/docs/reference/` |
| `xp_doc_spec` | — | `<EpicName>/docs/spec/` |
| `xp_doc_UnitTests` | `<EpicName>/tests/unit/` → `<EpicName>/__tests__/unit/` → `<EpicName>/__tests__/` Flat arrangement directly below (`*.unit.test.*`/`*_unit.py`) | `<EpicName>/docs/tests/UnitTests/` |
| `xp_doc_FunctionTests` | `<EpicName>/tests/functional/` → `<EpicName>/__tests__/functional/` → `<EpicName>/__tests__/` Flat arrangement directly below (`*.functional.test.*`/`*_functional.py`) | `<EpicName>/docs/tests/FunctionTests/` |
| `xp_doc_E2ETests` | `<EpicName>/tests/e2e/` or `<EpicName>/__tests__/e2e/` (if applicable) | `<EpicName>/docs/tests/E2ETests/` |

`api/<EpicName>/` By specifying a fixed path, non-api epics (CodeCompass, SocialMediaAgent, workflow, etc.)
The scan target may be incorrectly detected, and the document may be incorrectly determined to not exist even though it exists, or the document that should be generated may be incorrectly detected.
There was a bug that completed without generating (actual damage was confirmed in #1531, `xp_doc_spec` / `xp_doc_UnitTests` /
Fixed `xp_doc_FunctionTests`. `xp_doc_reference` and `xp_doc_E2ETests` are supported separately).

### 3 systems of test placement (as identified by #2456 review)

There are three types of unit/functional test arrangements in HolyAutomater, `xp_doc_UnitTests` /
`xp_doc_FunctionTests` both correspond:| System | Examples | Placement |
|---|---|---|
| Categorization subdirectory (under `__tests__/`) | CodeCompass・SocialMediaAgent・workflow・DiscordAIbot・DiscordBotDashboard | `__tests__/unit/`, `__tests__/functional/` |
| Categorized subdirectory (under `tests/`) | SoloXP | `tests/unit/`, `tests/functional/` |
| Flat layout (categorization by file name) | m4a2md, modal, hermes | `__tests__/*.unit.test.*` / `*_unit.py`, `__tests__/*.functional.test.*` / `*_functional.py` |

### Consistency with xp_Auditor (doc mode)

The doc mode of `xp_Auditor` (index consistency check of `api/<EpicName>/docs/spec/README.md`) is also
spec with the same priority as `xp_doc_spec` (`api/<EpicName>/docs/spec/` priority → `<EpicName>/docs/spec/`)
Resolve directories. Path resolution logic on generation side (`xp_doc_spec`) and audit side (`xp_Auditor`)
If there is a discrepancy, it will cause an accident in which a correctly generated spec is incorrectly determined to not exist in a non-api epic.
Both always refer to the same priority.

### GitHub access method/MCP fallback

`xp_doc_spec` `gh issue view --json state` of "## Synchronize the status of related issue table" cannot be used with `gh`
In environments (such as ClaudeCodeWeb) fallback to `mcp__github__issue_read` (method: `get`)
(Pattern established in `xp_issue2md`〈#3204〉. #3217).
