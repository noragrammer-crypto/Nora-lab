# Document generation skills (xp_doc_*)

Target skills: `xp_doc_reference` / `xp_doc_spec` / `xp_doc_UnitTests` / `xp_doc_FunctionTests` / `xp_doc_E2ETests`

Called by `xp_Documenter`, it generates and updates various documents (reference / spec / UnitTests / FunctionTests / E2ETests) after implementation is complete.

## Resolution of scan target/output directory (#1532)

HolyAutomater has a monorepo structure where `api/` is dedicated to Vercel Function entry points (see root `CLAUDE.md`), and source test documents are placed directly under the root of each epic. Therefore, each `xp_doc_*` skill determines the scan target/output directory in the following priority order:

| Priority | Directory |
|--------|------------|
| 1 (preferred/backwards compatible) | If `api/<EpicName>/...` exists |
| 2 (fallback) | Directly under `<EpicName>/...` (actual placement used by most real epics) |

Specific target paths for each skill:

| Skill | Scan target (fallback) | Output destination (fallback) |
|---|---|---|
| `xp_doc_reference` | `<EpicName>/scripts/` → `*.js`/`*.py` directly under `<EpicName>/` (3 steps) | `<EpicName>/docs/reference/` |
| `xp_doc_spec` | — | `<EpicName>/docs/spec/` |
| `xp_doc_UnitTests` | `<EpicName>/tests/unit/` → `<EpicName>/__tests__/unit/` → `<EpicName>/__tests__/` Flat layout directly under (`*.unit.test.*`/`*_unit.py`) | `<EpicName>/docs/tests/UnitTests/` |
| `xp_doc_FunctionTests` | `<EpicName>/tests/functional/` → `<EpicName>/__tests__/functional/` → `<EpicName>/__tests__/` Flat layout directly under (`*.functional.test.*`/`*_functional.py`) | `<EpicName>/docs/tests/FunctionTests/` |
| `xp_doc_E2ETests` | `<EpicName>/tests/e2e/` or `<EpicName>/__tests__/e2e/` (whichever exists) | `<EpicName>/docs/tests/E2ETests/` |

Due to the fixed path `api/<EpicName>/`, non-api epics (CodeCompass, SocialMediaAgent, workflow, etc.) incorrectly detected the scan target, mistakenly judged that the document did not exist even though it existed, or completed without generating the document that should have been generated (actual damage was confirmed in #1531, `xp_doc_spec` / Fixed `xp_doc_UnitTests` / `xp_doc_FunctionTests`. `xp_doc_reference` and `xp_doc_E2ETests` are supported separately).

### 3 systems of test placement (as identified by #2456 review)

There are three types of unit/functional test arrangements in HolyAutomater, and `xp_doc_UnitTests` / `xp_doc_FunctionTests` correspond to all of them:

| System | Examples | Placement |
|---|---|---|
| Categorized subdirectory (under `__tests__/`) | CodeCompass・SocialMediaAgent・workflow・DiscordAIbot・DiscordBotDashboard | `__tests__/unit/`, `__tests__/functional/` |
| Categorized subdirectory (under `tests/`) | SoloXP | `tests/unit/`, `tests/functional/` |
| Flat arrangement (categorization by file name) | m4a2md, modal, hermes | `__tests__/*.unit.test.*` / `*_unit.py`, `__tests__/*.functional.test.*` / `*_functional.py` |

### Consistency with xp_Auditor (doc mode)

`xp_Auditor`'s doc mode (index consistency check for `api/<EpicName>/docs/spec/README.md`) also resolves the spec directory with the same priority as `xp_doc_spec` (`api/<EpicName>/docs/spec/` first → `<EpicName>/docs/spec/`). If the path resolution logic differs between the generation side (`xp_doc_spec`) and the audit side (`xp_Auditor`), it will cause an accident in which a correctly generated spec is incorrectly judged as non-existent in a non-api epic, so both sides always refer to the same priority.
