# CodeCompass

コードの変更頻度・複雑度・依存関係を蒸留し、xp_Architect 形式のリファクタリング提案を自動生成する Claude Code スキル。

## 前提条件

```bash
cd CodeCompass
npm install
```

## 使い方

```
/codecompass <repoPath>
```

`<repoPath>` には分析対象リポジトリのパス（絶対パスまたはカレントからの相対パス）を指定する。省略すると `.`（カレントディレクトリ）を使用する。

**対応言語**: 複雑度分析・依存グラフは `.js` / `.py`（依存グラフは CommonJS `require()` のみ）が対象。詳細は [README.md の「対応言語・スコープ」](./README.md#対応言語スコープ) を参照。

### 実行例

```bash
# カレントリポジトリを分析
/codecompass .

# 別リポジトリを分析
/codecompass /path/to/other-repo
```

## パイプライン

以下の3ステップを順番に実行する。

### Step 1: ホットスポット判定

```bash
node CodeCompass/scripts/hotspot.js <repoPath> --outDir=codecompass
```

- git log（直近90日）の変更頻度 × AST複雑度スコア ÷ LOC で密度スコアを算出する
- 出力: `codecompass/hotspots.json`（機械可読）、`codecompass/hotspots.md`（人間可読ランキング）

### Step 2: 依存グラフ生成

```bash
node CodeCompass/scripts/dependency-graph.js <repoPath> \
  --hotspots=codecompass/hotspots.json \
  --out=codecompass/dependency-graph.mmd
```

- ホットスポット上位ファイルの caller/callee 依存関係を Mermaid 形式で生成する
- 出力: `codecompass/dependency-graph.mmd`

### Step 3: リファクタリング提案生成

```bash
node CodeCompass/scripts/refactoring-proposal.js \
  --hotspots=codecompass/hotspots.json \
  --graph=codecompass/dependency-graph.mmd \
  --out=codecompass/actions.md
```

- hotspots.json と dependency-graph.mmd を統合した構造化 JSON を xp_Architect 形式で処理し、提案を生成する
- 出力: `codecompass/actions.md`（リファクタリングアクション一覧）

## 出力ファイル

```
codecompass/
├── hotspots.json        # 構造化 JSON（xp_Architect 連携用）
├── hotspots.md          # ホットスポットランキング（人間可読）
├── dependency-graph.mmd # Mermaid 依存グラフ
└── actions.md           # リファクタリング提案一覧
```

## 提案の確認

```bash
cat codecompass/actions.md
```

提案内容を確認後、対応が必要なものは `/xp_Director` で通常の SoloXP フローに乗せる。

### Step 4: イシュー自動発行（オプション）

`actions.md` の提案を GitHub Issue として自動発行する。

```bash
node CodeCompass/scripts/codecompass-to-issues.js \
  [--actions=codecompass/actions.md] \
  [--limit=5] \
  [--dry-run]
```

| オプション | 説明 | デフォルト |
|---|---|---|
| `--actions=<path>` | 入力する actions.md のパス | `codecompass/actions.md` |
| `--limit=<n>` | 発行上限件数（スパム防止） | 5 |
| `--dry-run` | イシューを発行せず対象一覧を stdout に出力 | なし |

- hotspot_score によるフィルタリングは Step 3（`refactoring-proposal.js`）で `actions.md` 生成時に行われる。本スクリプトは `actions.md` に記載済みの提案を上位 `--limit` 件まで発行するのみ
- 発行されるイシューにはラベル `refactoring,codecompass-detected` が付く
- 発行されたイシューは xp_Director の通常フローで処理される

## オプション

| オプション | スクリプト | 説明 | デフォルト |
|---|---|---|---|
| `--days=<N>` | hotspot.js | 変更頻度の集計期間（日） | 90 |
| `--topN=<n>` | dependency-graph.js | 依存グラフ対象ファイル数 | 上位20% |

例: 直近30日・上位10件に絞って分析する場合

```bash
node CodeCompass/scripts/hotspot.js <repoPath> --days=30 --outDir=codecompass
node CodeCompass/scripts/dependency-graph.js <repoPath> \
  --hotspots=codecompass/hotspots.json --topN=10 \
  --out=codecompass/dependency-graph.mmd
node CodeCompass/scripts/refactoring-proposal.js \
  --hotspots=codecompass/hotspots.json \
  --graph=codecompass/dependency-graph.mmd \
  --out=codecompass/actions.md
```
