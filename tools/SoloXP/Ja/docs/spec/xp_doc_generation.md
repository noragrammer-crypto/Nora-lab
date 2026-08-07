# ドキュメント生成スキル群（xp_doc_*）

対象スキル: `xp_doc_reference` / `xp_doc_spec` / `xp_doc_UnitTests` / `xp_doc_FunctionTests` / `xp_doc_E2ETests`

`xp_Documenter` から呼ばれ、実装完了後の各種ドキュメント（reference / spec / UnitTests / FunctionTests / E2ETests）を生成・更新する。

## スキャン対象・出力先ディレクトリの解決（#1532）

HolyAutomater は `api/` 配下を Vercel Function のエントリポイント専用とするモノレポ構成であり
（ルート `CLAUDE.md` 参照）、ソース・テスト・ドキュメントは各エピックのルート直下に置かれる。
そのため各 `xp_doc_*` スキルは、以下の優先順位でスキャン対象・出力先ディレクトリを決定する：

| 優先度 | ディレクトリ |
|--------|------------|
| 1（優先・後方互換） | `api/<EpicName>/...` が存在する場合 |
| 2（フォールバック） | `<EpicName>/...` 直下（実在するエピックの大半が使う実際の配置） |

スキルごとの具体的な対象パス：

| スキル | スキャン対象（フォールバック） | 出力先（フォールバック） |
|---|---|---|
| `xp_doc_reference` | `<EpicName>/scripts/` → `<EpicName>/` 直下の `*.js`/`*.py`（3段階） | `<EpicName>/docs/reference/` |
| `xp_doc_spec` | — | `<EpicName>/docs/spec/` |
| `xp_doc_UnitTests` | `<EpicName>/tests/unit/` → `<EpicName>/__tests__/unit/` → `<EpicName>/__tests__/` 直下のフラット配置（`*.unit.test.*`/`*_unit.py`） | `<EpicName>/docs/tests/UnitTests/` |
| `xp_doc_FunctionTests` | `<EpicName>/tests/functional/` → `<EpicName>/__tests__/functional/` → `<EpicName>/__tests__/` 直下のフラット配置（`*.functional.test.*`/`*_functional.py`） | `<EpicName>/docs/tests/FunctionTests/` |
| `xp_doc_E2ETests` | `<EpicName>/tests/e2e/` または `<EpicName>/__tests__/e2e/`（実在する方） | `<EpicName>/docs/tests/E2ETests/` |

`api/<EpicName>/` 固定パスへの決め打ちにより、非apiエピック（CodeCompass・SocialMediaAgent・workflow 等）で
スキャン対象を誤検出し、ドキュメントが存在するにも関わらず「存在しない」と誤判定したり、生成すべきドキュメントを
生成しないまま完了する不具合があった（#1531 で実害を確認、#1532 で `xp_doc_spec` / `xp_doc_UnitTests` /
`xp_doc_FunctionTests` を修正。`xp_doc_reference` と `xp_doc_E2ETests` は別途対応済み）。

### テスト配置の3系統（#2456 レビュー指摘で判明）

HolyAutomater 内には unit/functional テストの配置が3系統混在しており、`xp_doc_UnitTests` /
`xp_doc_FunctionTests` はいずれも対応する：

| 系統 | 例 | 配置 |
|---|---|---|
| カテゴリ分けサブディレクトリ（`__tests__/` 配下） | CodeCompass・SocialMediaAgent・workflow・DiscordAIbot・DiscordBotDashboard | `__tests__/unit/`, `__tests__/functional/` |
| カテゴリ分けサブディレクトリ（`tests/` 配下） | SoloXP | `tests/unit/`, `tests/functional/` |
| フラット配置（ファイル名でカテゴリ判別） | m4a2md, modal, hermes | `__tests__/*.unit.test.*` / `*_unit.py`、`__tests__/*.functional.test.*` / `*_functional.py` |

### xp_Auditor（doc モード）との整合

`xp_Auditor` の doc モード（`api/<EpicName>/docs/spec/README.md` の索引整合性チェック）も、
`xp_doc_spec` と同じ優先順位（`api/<EpicName>/docs/spec/` 優先 → `<EpicName>/docs/spec/`）でspec
ディレクトリを解決する。生成側（`xp_doc_spec`）と監査側（`xp_Auditor`）でパス解決ロジックが
食い違うと、非apiエピックで「正しく生成されたspecを存在しないと誤判定する」事故になるため、
両者は常に同じ優先順位を参照する。
