# 設計メモ・ADR（過去の検討資料）

このディレクトリには、Solo XP フレームワークの初期設計フェーズで作成された検討資料・議事録・
草案を置く。**いずれも現在の実装とは乖離しており、運用ドキュメントとしては参照しないこと。**
現在の運用は [`../../../WORKFLOW.md`](../../../WORKFLOW.md)・[`../../spec/`](../../spec/) を参照する。

意思決定の経緯を残す ADR（Architecture Decision Record）的な価値はあるため削除はせず、
「腐って構わない過去の記録」としてここに退避してある。

## 収録ファイル

| ファイル | 内容 | 現状との乖離 |
|---|---|---|
| `ARCHITECTURE.md` | 初期構想（GitHub Actions起動 + 奉行デーモン + tmux並行メイドワーカー + Codespace常駐）。ステータス「設計完了・実装待ち」のまま更新日2025-02-07で停止 | 実際の実装は Claude Code（Web/CLI）上で `xp_Director` 系スキルを都度呼び出す方式で、常駐デーモン・tmux・Codespace自動起動は存在しない |
| `METRICS.md` | 奉行デーモン運用を前提としたメトリクス設計（トークン/CPUタイム制約理論）。「実測ダッシュボード」は空のまま | 同上の理由で前提となる運用形態が異なる |
| `TARGET_AUDIENCE.md` | ターゲット顧客分析（Digital Farmer ペルソナ）。「奉行が勝手に管理してくれる」等、上記アーキテクチャ前提の文言を含む | 同上 |
| `SXP_Framework_企画検討会_議事録_v1.0.md` | 2026-02-05付、企画検討会議事録（Nora・Claude間） | 検討開始時点のブレインストーミング記録 |
| `Solo eXtreme Programming with AI Agents - 参考資料集.md` | 設計時に参照した外部事例（CCPM・multi-agent-shogun・Beans等）の雑多なまとめ | 参考資料としての価値のみ |
| `xp_skills_全体設計草案_v2.md` | スキル全体設計の草案（TODO未消化のまま） | 確定仕様は [`../../spec/`](../../spec/) 配下の各仕様書を参照 |
| `solo_xp_workflow_v2.drawio.txt` | ワークフロー図 v2（「xp スキルマッピング」）。draw.io形式 | `v3`（Director制御モデル）に置き換えられた旧版 |

## 公開範囲について

Nora-lab（パブリックリポジトリ）への公開可否は未確定（`SoloXP/docs/issues/issue-2747` 系で検討中）。
ADRとしての価値を優先して残すか、実装との乖離が読者を混乱させるとして除外するかはオーナー判断待ち。
