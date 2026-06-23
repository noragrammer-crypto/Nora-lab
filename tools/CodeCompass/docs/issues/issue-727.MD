---
issue: 727
title: "[Story] CodeScene Lite — AIコードレビュースキル（CodeCompassをエピック名として採用）"
state: open
labels: [story, backlog]
author: noragrammer-crypto
created_at: 2026-04-24T17:46:06Z
epic: CodeCompass
---

# #727 [Story] CodeScene Lite — AIコードレビュースキル（CodeCompassをエピック名として採用）

## 本文

## ストーリー

**副題**: 個人開発者・小さなチーム向けCodeScene / 蒸留エンジン as SKILL.md

コードレビューは人間がやる時代が終わりつつある。  
しかしアーキテクチャ判断にはコードの外の文脈が必要で、AIはまだ自力では持てない。  
**必要な情報を蒸留して渡せば、AIは勝手に設計判断をし始める。**

その「蒸留エンジン」をSKILL.mdとして実装する。

---

## 背景・目的

| 目的 | 詳細 |
|------|------|
| **アーキテクチャ壊れの予防** | スケールした時に複雑度×変更頻度でホットスポットを早期検知する |
| **GitHub Star 実験** | SoloXP の public 化と合わせて、OSS としての訴求力を試す |
| **個人開発への適用** | CodeScene は企業向けで重厚。個人・小チーム向けに軽量版を作る |

---

## 問題定義

| 課題 | 詳細 |
|------|------|
| CodeSceneは高い・重厚 | 企業向け。個人開発者・小チームには過剰 |
| 人間によるコードレビューはコスト高 | 現役エンジニアほどAI適応が遅い |
| リファクタリングの優先度が不明 | 複雑でも触らないコードに時間を使う無駄 |
| 設計提案までは既存ツールが届かない | スコアを出しても次のアクションが不明 |

---

## 実装方針：CodeGraph を流用してスタート

[CodeGraph（MIT）](https://github.com/colbymchenry/codegraph) の以下を npm パッケージとして採用し、自前実装を最小化する。

| 機能 | CodeGraph 流用 | 自前実装 |
|------|---------------|---------|
| AST解析（Tree-sitter）| ✅ そのまま流用（25言語対応済み） | - |
| Caller/Callee 依存グラフ | ✅ `GraphTraverser` をそのまま使用 | - |
| SQLite スキーマ | ✅ nodes/edges テーブルを拡張 | + 複雑度・変更頻度フィールド追加 |
| **変更頻度分析** | ❌ 未実装 | ✅ `git log` 集計を自前実装（ここが核心） |
| **複雑度スコア** | ❌ 未実装 | ✅ 制御フロー（if/for/while）カウントを追加 |
| **ホットスポット判定** | ❌ 未実装 | ✅ 変更頻度 × 複雑度スコアを実装 |

### なぜ「フルビルド前提」か

- **ClaudeCode Web はエフェメラル環境**：セッションをまたいで SQLite DB が保持されない
- CodeGraph の FileWatcher（差分更新）機能は常駐デーモン前提のため、今の運用とミスマッチ
- HolyAutomater のリポジトリサイズでは、毎回フルビルドしても数秒で完了する見込み
- 出力は SQLite に留めず **Markdown/JSON としてコミット** → どのセッションからでも参照可能

---

## ソリューション構成

### レイヤー1: 蒸留エンジン（データ収集）

```
git log --numstat --since=90.days  → 変更頻度集計（ホットスポット候補） ← 自前実装
AST 制御フロー                     → 複雑度スコア（if/for/while カウント） ← 自前実装
CodeGraph (npm)                    → 上位20%のホットスポットのみ caller/callee 展開
```

**CodeGraph は絞り込み後に使う**: 全ファイルのグラフ生成はコスト爆発の原因になるため、
git log で変更頻度上位を抽出してから CodeGraph で深掘りする。

### レイヤー2: ホットスポット判定

```
(変更頻度 × 複雑度) / LOC = リファクタリングROI（密度スコア）
```

CodeSceneの核心ロジック。`/ LOC` を入れることで大きいファイルの過大評価を防ぐ。
触るほど複雑なコードが最優先対象。

### レイヤー3: AIアーキテクト（SKILL.md）

蒸留済み情報をxp_Architectに渡す。**コードそのものは渡さず、構造化JSONのみ渡す**（判断ブレ防止）。

```json
{
  "file": "path/to/file.js",
  "hotspot_score": 0.82,
  "complexity": 34,
  "changes_90d": 120,
  "callers": 8,
  "callees": 12
}
```

**期待される出力例**
- 「このファイルは変更頻度が高く複雑度スコアが閾値超え。IPO分離を推奨」
- 「caller/calleeが蜘蛛の巣状。Strategy Patternで解消可能」
- 「バリデーションロジックが散在。validate_*メソッドに集約すべき」

---

## 出力形式

SQLite への永続化ではなく、リポジトリにコミットできる形式で出力する。

```
codescene/
├── hotspots.md          # ホットスポットランキング（人間が読む用）
├── hotspots.json        # xp_Architect に渡す機械可読データ
├── actions.md           # リファクタリングアクション一覧（分析→行動を閉じる）
└── dependency-graph.mmd # Mermaid 形式の依存グラフ
```

---

## IPOモデルとの対応

| フェーズ | 本ツールの役割 |
|----------|---------------|
| Input | git log + CodeGraph（AST + caller/callee）でデータ収集 |
| Process | 変更頻度 × 複雑度でホットスポット判定 |
| Output | Markdown/JSON + Mermaid依存グラフ → Issueとして起票 |

---

## SoloXPへの統合

```
ホットスポット検出
    ↓
xp_Director: 「このファイル要リファクタリング」Issue起票
    ↓
xp_Architect: 設計提案（パターン提示）
    ↓
xp_Implementer: IPO分離 / DI導入 / クラス抽出
    ↓
xp_Auditor: flog/reek相当スコアで改善確認
```

---

## 受け入れ条件

- [ ] git log から変更頻度を集計できる
- [ ] CodeGraph を使って JS/Python コードの caller/callee 依存グラフを生成できる
- [ ] 複雑度スコアを算出できる（制御フロー AST カウント）
- [ ] (変更頻度 × 複雑度) / LOC でホットスポットランキングを出力できる（密度スコア）
- [ ] 依存グラフを mermaid 形式で出力できる
- [ ] 出力を Markdown/JSON としてリポジトリにコミットできる
- [ ] xp_Architect スキルに蒸留済みデータを渡してリファクタリング提案を得られる

---

## 競合ポジション

「貧乏人用CodeScene。しかもAIが設計提案までする。」

| | CodeScene | ESLint/Pylint | 本プロダクト |
|--|-----------|---------------|------------|
| 価格 | 高（企業向け） | 無料 | 無料〜低価格 |
| 変更頻度分析 | ✅ | ❌ | ✅ |
| 設計提案 | ❌ | ❌ | ✅（LLM） |
| 可視化 | ✅ | ❌ | ✅（mermaid） |
| SKILL.md統合 | ❌ | ❌ | ✅ |
| 個人開発向け | ❌ | ✅ | ✅ |

---

## ストーリーカード

`StoryCards/codescene-lite-plan.md`

## コメント

### noragrammer-crypto — 2026-04-24T18:27:26Z

## 実装方針メモ（検討中）

### feature-dev との連携

Anthropic公式プラグイン **feature-dev** のエージェント構成を参考に、以下の取り込みを検討する。

- GitHub: https://github.com/anthropics/claude-code/tree/main/plugins/feature-dev

```
code-explorer  → 読み取り専用でコードをトレース（入口〜ストレージまで）
code-architect → 既存パターンから設計案を1つに絞り込む
code-reviewer  → 信頼度80%以上の指摘のみ出力
```

### 取り込み候補

1. **レビューワークフローへの統合 + イシュー自動起票**
   - code-reviewer の結果をそのまま GitHub Issue として起票する
   - `/xp_review_workflow` に組み込むか、専用スキルとして切り出す

2. **セキュリティレビューの追加**
   - code-reviewer のセキュリティチェック（OWASP系）を独立レイヤーとして追加
   - ホットスポット検出後のレビュー対象に優先適用

3. **ultrareview との統合**
   - ultrareview（クラウドレビュー）と code-reviewer（ローカルエージェント）の役割分担を整理
   - ultrareview = 全体俯瞰、code-reviewer = 変更差分の詳細レビュー

4. **CodeScene Lite → feature-dev リファクタリングフロー**
   - CodeScene Lite でホットスポット（変更頻度×複雑度）を検出
   - code-explorer で該当ファイルの依存関係をトレース
   - code-architect でリファクタリング設計案を生成
   - xp_Implementer で実施 → xp_Auditor で確認

### 備考

- feature-devの各エージェントは単体でも動作可能（独立したMarkdown定義）
- 実装は余裕のあるタイミングで。まず CodeScene Lite 本体（蒸留エンジン）が先

---

### noragrammer-crypto — 2026-05-09T06:13:51Z

xp_Architectは
エピックディレクトリの作成
そのディレクトリへのClaude.mdの作成後に
このイシュー全体から複数のストーリーを抽出し、各ストーリーをサブイシューとして展開。
各ストーリーをサブイシューとしてタスク分解して実装することとする。

---
