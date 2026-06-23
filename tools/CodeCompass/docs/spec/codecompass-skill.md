# CodeCompass スキル仕様

## 概要

CodeCompass 分析パイプライン（ホットスポット判定 → 依存グラフ生成 → リファクタリング提案）を
`/codecompass <repoPath>` で一括実行できる Claude Code スキル。

関連イシュー: [#1217](../issues/issue-1217.MD)（SKILL.md 整備・CodeCompass 独立呼び出し化）

---

## スキル定義ファイル

`CodeCompass/SKILL.md`

---

## 呼び出し形式

```
/codecompass <repoPath>
```

| 引数 | 説明 | 必須 |
|------|------|------|
| `<repoPath>` | 分析対象リポジトリのパス（絶対パスまたは相対パス） | ✅ |

---

## 実行パイプライン

以下の3ステップを順番に実行する。各ステップは前のステップの出力を入力として使用する。

### Step 1: ホットスポット判定

```bash
node CodeCompass/scripts/hotspot.js <repoPath> --outDir=codecompass
```

- 出力: `codecompass/hotspots.json`（構造化 JSON）、`codecompass/hotspots.md`（人間可読ランキング）
- 詳細: [hotspot-engine.md](./hotspot-engine.md)

### Step 2: 依存グラフ生成

```bash
node CodeCompass/scripts/dependency-graph.js <repoPath> \
  --hotspots=codecompass/hotspots.json \
  --out=codecompass/dependency-graph.mmd
```

- Step 1 の `hotspots.json` を入力として使用する
- 出力: `codecompass/dependency-graph.mmd`（Mermaid 形式）
- 詳細: [dependency-graph.md](./dependency-graph.md)

### Step 3: リファクタリング提案生成

```bash
node CodeCompass/scripts/refactoring-proposal.js \
  --hotspots=codecompass/hotspots.json \
  --graph=codecompass/dependency-graph.mmd \
  --out=codecompass/actions.md
```

- Step 1・Step 2 の出力を統合して構造化 JSON を生成し、提案 Markdown を出力する
- 出力: `codecompass/actions.md`（リファクタリングアクション一覧）
- 詳細: [refactoring-proposal.md](./refactoring-proposal.md)

### Step 4: イシュー自動発行（オプション）

```bash
node CodeCompass/scripts/codecompass-to-issues.js \
  [--actions=codecompass/actions.md] \
  [--limit=5] \
  [--dry-run]
```

- Step 3 の `actions.md` を入力として使用し、上位 `--limit` 件まで GitHub Issue を発行する
- hotspot_score によるフィルタリングは Step 3 側で完了済みのため、本ステップでは行わない
- 詳細: [codecompass-to-issues.md](./codecompass-to-issues.md)

---

## 出力ファイル

```
codecompass/
├── hotspots.json        # 構造化 JSON（xp_Architect 連携用）
├── hotspots.md          # ホットスポットランキング（人間可読）
├── dependency-graph.mmd # Mermaid 依存グラフ
└── actions.md           # リファクタリング提案一覧
```

---

## オプション

| オプション | スクリプト | 説明 | デフォルト |
|---|---|---|---|
| `--days=<N>` | hotspot.js | 変更頻度の集計期間（日） | 90 |
| `--topN=<n>` | dependency-graph.js | 依存グラフ対象ファイル数 | 上位20% |
| `--actions=<path>` | codecompass-to-issues.js | 入力する actions.md のパス | `codecompass/actions.md` |
| `--limit=<n>` | codecompass-to-issues.js | イシュー発行上限件数 | 5 |
| `--dry-run` | codecompass-to-issues.js | イシューを発行せず対象一覧を出力 | なし |

---

## 既知の制約

- `change-frequency.js` の `execFileSync` はデフォルト `maxBuffer`（1MB）を使用するため、
  大規模リポジトリ（コミット数 ~1000 以上）では `ENOBUFS` エラーが発生する場合がある。
  参照: #1226（バグイシュー）
