# SoloXP 機能仕様書インデックス

## スキル仕様

| ファイル | 対象スキル | 概要 |
|---|---|---|
| [xp_plan.md](xp_plan.md) | xp_plan | ストーリーカードのタスク分解・見積もり（verifies必須） |
| [xp_architect.md](xp_architect.md) | xp_Architect | イシュー種別分類（観測可能性軸）・サブイシュー発行・E2E/spec必須化判定 |
| [xp_auditor.md](xp_auditor.md) | xp_Auditor | テスト実行・品質監査・サブイシュー完了報告 |
| [xp_director.md](xp_director.md) | xp_Director | AllGREEN後のxp_Reviewer呼び出し・E2E/PR発行/クローズフロー含む |
| [xp_reviewer.md](xp_reviewer.md) | xp_Reviewer | コードレビュー・高リスク自動起票・AllGREEN後PR発行前に実行 |
| [xp_review_workflow.md](xp_review_workflow.md) | xp_review_workflow | ワークフロー振り返り・逸脱検知・原因SKILL特定 |
| [xp_doc_generation.md](xp_doc_generation.md) | xp_doc_reference / xp_doc_spec / xp_doc_UnitTests / xp_doc_FunctionTests / xp_doc_E2ETests | ドキュメント生成対象・出力先ディレクトリの優先順位付き解決（api/&lt;EpicName&gt;優先→フォールバック、#1532） |

## SoloXP正本化・公開パイプライン（#2168）

| ファイル | 概要 |
|---|---|
| `docs/skill-files-sync.md`（モノレポ内パス。Nora-lab公開範囲外のためリンクではなくパス表記） | 正本（`SoloXP/skills/xp_*` + `workflow/skills/*`）→バイナリ（`dotfiles/.claude/skills/`・`.claude/skills/`）の同期方向・pre-pushフックの仕組み（Phase1/2） |
| [nora_lab_publish.md](nora_lab_publish.md) | `make sync-nora-lab` + `git subtree push` によるNora-lab公開パイプライン（Phase3） |

## ワークログ・計測スキル

| ファイル | 対象スキル | 概要 |
|---|---|---|
| [xp_worklog.md](xp_worklog.md) | xp_worklog | 作業時間・トークン消費の集計・レポート出力・worklog保存（Issue単位集計 #2143・Epic単位ROI集計 #2144） |

## 開発原則

| ファイル | 概要 |
|---|---|
| [tdd_principles.md](tdd_principles.md) | Solo XP TDD開発原則（バグ修正・ワンタスクワンPR・ドキュメント同時更新・トークン消費記録等） |

## 関連ドキュメント

- [README.md](../../README.md) — SoloXPの概要・特徴・ドキュメント一覧（はじめての人はここから）
- [CLAUDE.md.template](../../CLAUDE.md.template) — 新規リポジトリでSolo XPを動かすために `CLAUDE.md` へ必要な設定一式
- [WORKFLOW.md](../../WORKFLOW.md) — 全体ワークフロー
- [tests/E2ETests/](../tests/E2ETests/) — E2E 受け入れテスト
- [history/memo/](../history/memo/) — 初期設計フェーズの検討資料・ADR（**現在の実装とは乖離しているため運用ドキュメントとしては参照しないこと**。`ARCHITECTURE.md` 等はここに退避済み）

## 非xp_系スキルの仕様書について（#2637）

`SoloXP/docs/spec/` は `SoloXP/skills/` 配下の xp_* スキル群の仕様書専用ディレクトリである。
ProcessIssue・NovelGeneratorRun・issue-triage-agent・ops-meeting・kakuyomu_post・kakuyomu_post_ab・
feature-dev プラグイン等、非xp_系スキル／プラグインの仕様書は各スキルの実体移動先に合わせて以下へ移設済み。
これらは HolyAutomater モノレポ固有のファイルであり、Nora-lab（`SoloXP/` + `workflow/skills/ProcessIssue`
のみ公開）には含まれないため、リンクではなくモノレポ内パスとして記載する（#2643）：

- ProcessIssue: `workflow/docs/spec/process-issue.md`
- issue-triage-agent: `workflow/docs/spec/issue-triage-agent-skill.md`
- ops-meeting: `workflow/docs/spec/ops-meeting-skill.md`
- kakuyomu_post: `workflow/docs/spec/kakuyomu-post-skill.md`
- kakuyomu_post_ab: `workflow/docs/spec/kakuyomu-post-ab-skill.md`
- feature-dev プラグイン: `workflow/docs/spec/feature-dev-plugin.md`
- NovelGeneratorRun: `AINovelGenerator/docs/spec/novel_generator_run.md`（#404 で元々移設済み）
