# CodeCompass プロジェクトガイド

## プロジェクト概要

**愛称**: CodeScene Lite / 個人開発者・小さなチーム向けCodeScene / 蒸留エンジン as SKILL.md

git 履歴とAST解析から「変更頻度 × 複雑度」のホットスポットを検出し、
構造化データを xp_Architect に渡してリファクタリング提案まで自動生成する SKILL.md ベースのツール。

CodeScene（企業向け・高額）の核心ロジックを、個人開発者・小チーム向けに軽量実装する。

### コンセプト

コードレビューは人間がやる時代が終わりつつある。
しかしアーキテクチャ判断にはコードの外の文脈（変更頻度・依存関係）が必要で、AIはまだ自力では持てない。
**必要な情報を蒸留して渡せば、AIは勝手に設計判断をし始める。**

---

## IPOモデル

| フェーズ | 役割 |
|----------|------|
| Input | `git log --numstat` + AST解析でデータ収集 |
| Process | (変更頻度 × 複雑度) / LOC でホットスポット判定（密度スコア） |
| Output | Markdown/JSON + Mermaid依存グラフ → xp_Architect へ連携 |

---

## レイヤー構成

### レイヤー1: 蒸留エンジン（データ収集）

```
git log --numstat --since=90.days  → 変更頻度集計（自前実装。ここが核心）
AST 制御フロー（if/for/while）      → 複雑度スコア（自前実装）
CodeGraph (npm, MIT)               → 上位ホットスポットのみ caller/callee 展開
```

- JS: ESLint/Babel AST を流用
- Python: 標準 `ast` モジュールを使用
- パーサー自作はしない。複雑度計算とホットスポット分析に集中する

### レイヤー2: ホットスポット判定

```
(変更頻度 × 複雑度) / LOC = リファクタリングROI（密度スコア）
```

`/ LOC` により大規模ファイルの過大評価を防ぐ。触るほど複雑なコードを最優先対象とする。

### レイヤー3: AIアーキテクト連携（SKILL.md）

蒸留済み情報（スコア + caller/callee + git履歴）を **構造化JSONのみ** xp_Architect に渡す
（コードそのものは渡さない＝判断ブレ防止）。

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

---

## 出力形式

SQLite には永続化せず、リポジトリにコミット可能な形式で出力する
（ClaudeCode Web はエフェメラル環境のため、セッションをまたいで参照できる形にする）。

```
codecompass/
├── hotspots.md          # ホットスポットランキング（人間が読む用）
├── hotspots.json        # xp_Architect に渡す機械可読データ
├── actions.md           # リファクタリングアクション一覧
└── dependency-graph.mmd # Mermaid 形式の依存グラフ
```

---

## 対応言語ロードマップ

| フェーズ | 言語 | 理由 |
|----------|------|------|
| Phase 1 | JavaScript / Python | ユーザー数最大。まずここで効果検証 |
| Phase 2 | TypeScript / Ruby | JS延長 + flog/reek本家との比較検証 |
| Phase 3 | 他言語 | LLMで概念移植 |

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
xp_Auditor: 改善確認
```

---

## スコープ外（現時点）

- SQLite等への永続化（出力はリポジトリコミット可能なファイル形式に統一）
- FileWatcher による差分更新（常駐デーモン前提のため今の運用とミスマッチ）
- Phase 2 以降の言語対応（Phase 1 で効果検証してから着手）

---

## ストーリー一覧

各ストーリーの詳細・進捗は対応する GitHub Issue を参照。

| Story | Issue | depends_on | 概要 |
|---|---|---|---|
| 変更頻度分析エンジン | [#1176](docs/issues/issue-1176.MD) | なし | `git log --numstat` 集計でホットスポット候補を抽出 |
| 複雑度スコアリングエンジン | [#1177](docs/issues/issue-1177.MD) | なし | AST制御フロー解析で JS/Python の複雑度を算出 |
| ホットスポット判定とランキング出力 | [#1178](docs/issues/issue-1178.MD) | #1176, #1177 | 密度スコア算出 + hotspots.md/json 出力 |
| 依存グラフ生成（CodeGraph統合） | [#1179](docs/issues/issue-1179.MD) | #1178 | caller/callee 依存グラフを mermaid 出力 |
| xp_Architect連携リファクタリング提案 | [#1180](docs/issues/issue-1180.MD) | #1178, #1179 | 蒸留JSONを渡し actions.md を自動生成 |
| PRホットスポットしきい値Issue自動起票 | [#1546](docs/issues/issue-1546.MD) | #1178 | PRコメントのトップ1件がしきい値超えで構造的リファクタリング検討Issueを起票 |
| hotspot-alert CI自動トリガー化 | [#1555](docs/issues/issue-1555.MD) | #1546 | `.github/workflows/hotspot-alert.yml` で main push 連動・手動実行不要化 |

---

## 親イシュー

- Story (Epic): [noragrammer-crypto/HolyAutomater#727](docs/issues/issue-727.MD)
- 企画書: `StoryCards/codescene-lite-plan.md`
