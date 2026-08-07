# CodeCompass 機能仕様書 索引

## 概要

git 履歴と AST 解析から「変更頻度 × 複雑度」のホットスポットを検出し、
構造化データを xp_Architect に渡してリファクタリング提案まで自動生成する蒸留エンジン。

## ドキュメント一覧

| ファイル | 内容 |
|---------|------|
| [concept.md](../concept.md) | プロダクトコンセプト・ピッチ資料（一言で言うと／なぜ作ったか／誰向けか） |
| [change-frequency-analysis.md](./change-frequency-analysis.md) | 変更頻度分析エンジン（`git log --numstat` 集計）仕様 |
| [complexity-scoring-engine.md](./complexity-scoring-engine.md) | 複雑度スコアリングエンジン（AST解析）仕様 |
| [hotspot-engine.md](./hotspot-engine.md) | ホットスポット判定エンジン（密度スコア算出・ランキング出力）仕様 |
| [dependency-graph.md](./dependency-graph.md) | 依存グラフ生成エンジン（caller/callee 解析・Mermaid出力）仕様 |
| [refactoring-proposal.md](./refactoring-proposal.md) | リファクタリング提案エンジン（構造化JSON生成・actions.md 出力）仕様 |
| [codecompass-skill.md](./codecompass-skill.md) | CodeCompass スキル（`/codecompass` パイプライン実行・SKILL.md）仕様 |
| [exclude-patterns.md](./exclude-patterns.md) | 除外パターン解決エンジン（デフォルト除外・`.codecompassignore`・`--ignore`）仕様 |
| [codecompass-to-issues.md](./codecompass-to-issues.md) | actions.md パース → GitHub Issue 自動発行仕様 |
| [hotspot-alert.md](./hotspot-alert.md) | PRホットスポットコメント検出→閾値判定→重複チェック付きIssue自動起票仕様 |

## 関連イシュー

| # | タイトル | 状態 |
|---|---------|------|
| [#727](../issues/issue-727.MD) | [Story] CodeScene Lite — AIコードレビュースキル（CodeCompassをエピック名として採用） | closed ✅ |
| [#1176](../issues/issue-1176.MD) | [Story] 変更頻度分析エンジン | closed ✅ |
| [#1177](../issues/issue-1177.MD) | [Story] CodeCompass: 複雑度スコアリングエンジン（AST解析） | closed ✅ |
| [#1178](../issues/issue-1178.MD) | [Story] CodeCompass: ホットスポット判定とランキング出力 | closed ✅ |
| [#1181](../issues/) | [Task] E2Eテストスイート作成 | closed ✅ |
| [#1182](../issues/issue-1182.MD) | [Task] 変更頻度分析エンジン実装（git log --numstat 集計） | closed ✅ |
| [#1183](../issues/) | [Task] 機能仕様書更新 | closed ✅ |
| [#1184](../issues/) | [Task] E2Eテストスイート作成 | closed ✅ |
| [#1185](../issues/issue-1185.MD) | [Task] 複雑度スコアリングエンジン実装（AST解析） | closed ✅ |
| [#1186](../issues/) | [Task] 機能仕様書更新 | closed ✅ |
| [#1197](../issues/) | [Task] E2Eテストスイート作成（ホットスポット判定） | closed ✅ |
| [#1198](../issues/issue-1198.MD) | [Task] ホットスポット判定エンジン実装 | closed ✅ |
| [#1199](../issues/issue-1199.MD) | [Task] 機能仕様書更新 | closed ✅ |
| [#1179](../issues/issue-1179.MD) | [Story] CodeCompass: 依存グラフ生成（CodeGraph統合） | closed ✅ |
| [#1205](../issues/) | [Task] E2Eテストスイート作成（依存グラフ生成） | closed ✅ |
| [#1206](../issues/issue-1206.MD) | [Task] 依存グラフ生成エンジン実装 | closed ✅ |
| [#1207](../issues/) | [Task] 機能仕様書更新 | closed ✅ |
| [#1180](../issues/issue-1180.MD) | [Story] CodeCompass: xp_Architect連携によるリファクタリング提案生成 | closed ✅ |
| [#1215](../issues/) | [Task] E2Eテストスイート作成 | closed ✅ |
| [#1216](../issues/issue-1216.MD) | [Task] 構造化JSON生成・リファクタリング提案エンジン実装 | closed ✅ |
| [#1217](../issues/issue-1217.MD) | [Task] SKILL.md 整備（CodeCompass 独立呼び出し化） | closed ✅ |
| [#1218](../issues/) | [Task] 機能仕様書更新 | closed ✅ |
| [#1232](../issues/) | [Story] CodeCompass: public公開向け品質向上（フィルタ改善 + CI サンプル） | closed ✅ |
| [#1404](../issues/) | [Task] E2Eテストスイート作成 | closed ✅ |
| [#1405](../issues/) | [Task] 除外フィルタの改善（dist/.obsidian/min.js等 + --ignore オプション） | closed ✅ |
| [#1406](../issues/) | [Task] GitHub Actions CI サンプル作成（PR時ホットスポット生成） | closed ✅ |
| [#1407](../issues/) | [Task] 機能仕様書更新 - CodeCompass フィルタ改善 + CI サンプル | closed ✅ |
| [#1396](../issues/) | [Story] コードコンパスのワークフロー統合 | closed ✅ |
| [#1440](../issues/) | [Task] ホットスポット除外パターン追加 | closed ✅ |
| [#1441](../issues/issue-1441.MD) | [Task] codecompass-to-issues スクリプト実装 | closed ✅ |
| [#1442](../issues/) | [Task] SKILL.md へのイシュー発行フロー追記 | closed ✅ |
| [#1525](../issues/) | [Task] ホットスポット除外フィルタの実装をexclude-patterns.js（#1232）に統合 | closed ✅ |
| [#1443](../issues/) | [Task] 機能仕様書更新 | closed ✅ |
| [#1528](../issues/) | [Task] CodeCompass テストディレクトリを __tests__/unit・functional・e2e に統一する | closed ✅ |
| [#1546](../issues/issue-1546.MD) | [CodeCompass] ホットスポット検出→Issue自動起票スキル（しきい値ベース、処方箋はxp_Architectに委譲） | closed ✅ |
| [#1547](../issues/) | [Task] E2Eテストスイート作成 | closed ✅ |
| [#1548](../issues/) | [Task] PRホットスポットコメント検出→閾値判定→重複チェック付きIssue自動起票エンジン実装 | closed ✅ |
| [#1549](../issues/) | [Task] 機能仕様書更新 | closed ✅ |
| [#1555](../issues/issue-1555.MD) | [CodeCompass] hotspot-alert の CI 自動トリガー化（main push連動）+ ドキュメント整備 | closed ✅ |
