# 依存グラフ生成エンジン 仕様

## 概要

`CodeCompass/scripts/dependency-graph.js` が `hotspots.json`（ホットスポットランキング）を読み込み、
スコア上位ファイルの caller/callee 依存関係を Mermaid graph LR 形式で出力する。

全ファイルの依存グラフ生成はコスト爆発の原因になるため、
ホットスポット上位（デフォルト20%）のみを分析対象とする。
依存解析は相対 `require` / `import` パターンのマッチングで実装し、CodeGraph npm パッケージは不使用。

CodeCompass のレイヤー1後段（依存関係の可視化）に当たる。

---

## 実行方法

```bash
node CodeCompass/scripts/dependency-graph.js <repoPath> \
  [--hotspots=<path>] [--topN=<n>] [--out=<path>] [--maxDepth=<n>]
```

| 引数・オプション | 必須 | デフォルト | 説明 |
|---|---|---|---|
| `<repoPath>` | ✅ | なし | 解析対象のリポジトリパス |
| `--hotspots=<path>` | - | `<repoPath>/hotspots.json` | ホットスポットスコアが格納された JSON ファイルのパス |
| `--topN=<n>` | - | 非ゼロスコアファイル数の 20%（最小1） | 分析対象とする上位ファイル数 |
| `--out=<path>` | - | なし（標準出力） | Mermaid 出力先ファイルパス |
| `--maxDepth=<n>` | - | `1` | 依存追跡の深さ（現バージョンでは1固定） |

`<repoPath>` 省略時は使い方（Usage）を標準エラー出力に書き出し、異常終了する（`exitCode = 1`）。

---

## topN 算出ルール

```
topN = --topN オプションが指定された場合はその値を使用
     = 指定なし: max(1, ceil(非ゼロスコアファイル数 × 0.2))
```

- `hotspotScore = 0` のファイルは非ゼロカウントから除外し、グラフにも含めない
- `hotspots.json` が存在しない場合は空のホットスポット配列として扱う（空グラフを出力）

---

## 出力形式

### Mermaid graph LR

```mermaid
graph LR
  "lib/hotspot.js" -->|calls| "lib/change-frequency.js"
  "lib/hotspot.js" -->|calls| "lib/complexity-score.js"
```

- ヘッダ行: `graph LR`
- エッジ行: `  "<from>" -->|calls| "<to>"`
- `from` / `to` はリポジトリルートからの相対パス（`/` 区切り）
- 依存なし・対象ファイルなしの場合は `graph LR` のみ出力（空グラフ）

---

## 依存解析ルール

### 対象パターン

JavaScript ファイル内の相対 `require` を解析する:

```javascript
require('./relative/path')
require('../parent/module')
```

- 相対パス（`./` または `../` で始まる）のみ追跡する
- 外部モジュール（`require('fs')` 等）は除外する
- 拡張子なしの場合は `.js` を補完する
- パスは `path.normalize` で正規化し `/` 区切りに統一する

### maxDepth

現バージョンでは `maxDepth=1` 固定で動作する。
`topFiles` に含まれるファイルのみを起点として依存を追跡し、その先への再帰はしない。

### 重複エッジ

同一の `from → to` エッジは重複排除する（Set で管理）。

---

## 関数シグネチャ

### selectTopFiles

```javascript
function selectTopFiles(
  hotspots: Array<{ file: string, hotspotScore: number }>,
  topN: number
): string[]
```

hotspots 配列からスコア上位 `topN` 件のファイルパスを返す。
`hotspotScore = 0` のファイルは除外する。入力は `hotspotScore` 降順を前提とする。
`topN <= 0` の場合は空配列を返す。

### extractEdges

```javascript
function extractEdges(
  content: string,
  filePath: string,
  _repoDir: string
): Array<{ from: string, to: string }>
```

ファイル内容から相対 `require` / `import` の依存エッジを抽出する。
`filePath` はリポジトリルートからの相対パス。
外部モジュール（相対パスなし）は除外する。

### buildMermaidGraph

```javascript
function buildMermaidGraph(
  edges: Array<{ from: string, to: string }>
): string
```

エッジリストから Mermaid `graph LR` 形式の文字列を生成する。

### analyzeDependencyGraph

```javascript
function analyzeDependencyGraph(options: {
  repoPath: string,
  topFiles: string[],
  maxDepth?: number
}): string
```

指定されたファイル群の依存グラフを解析して Mermaid 文字列を返す。
`topFiles` にあるファイルの相対 `require` を追いかけてエッジを構築する。
`maxDepth` のデフォルトは `1`。

---

## CLI インターフェース

### parseArgs

```javascript
function parseArgs(argv: string[]): {
  repoPath: string | null,
  hotspots: string | null,
  topN: number | null,
  out: string | null,
  maxDepth: number
}
```

`--hotspots=<path>`, `--topN=<n>`, `--out=<path>`, `--maxDepth=<n>` をオプションとして解釈し、
`--` で始まらない最初の引数を `repoPath` とする。

### main

```javascript
function main(argv: string[]): void
```

1. `repoPath` が指定されていない場合、`Usage: ...` を標準エラー出力に書き出して `exitCode = 1` で終了する
2. `hotspots.json` を読み込む（ファイルが存在しない場合は空配列）
3. 非ゼロスコアファイル数から `topN` を算出する（`--topN` 指定時はその値）
4. `selectTopFiles` で上位ファイルを抽出する
5. `analyzeDependencyGraph` で Mermaid 文字列を生成する
6. `--out` 指定時: 指定パスに Mermaid ファイルを書き出す（親ディレクトリを自動作成）
7. `--out` 未指定時: 標準出力に書き出す

---

## ファイル構成

```
CodeCompass/
├── lib/dependency-graph.js                    # 解析ロジック（selectTopFiles / extractEdges / buildMermaidGraph / analyzeDependencyGraph）
├── scripts/dependency-graph.js                # CLI エントリポイント（引数解釈・出力先切り替え）
└── __tests__/
    ├── dependency-graph.unit.test.js          # lib の純粋関数の単体テスト
    ├── dependency-graph.functional.test.js    # CLI インターフェースの機能テスト
    └── e2e/dependency-graph.e2e.test.js       # ストーリー受け入れ条件の E2E テスト（#1179 / #1205 作成済み）
```

---

## 依存ライブラリ

| モジュール | 用途 |
|---|---|
| `fs` | ファイル読み書き（Node.js 標準） |
| `path` | パス解決・正規化（Node.js 標準） |

外部 npm パッケージへの依存はなし。

---

## 関連ドキュメント

- [hotspot-engine.md](./hotspot-engine.md) — ホットスポット判定エンジン仕様（`hotspots.json` の生成元）
- [change-frequency-analysis.md](./change-frequency-analysis.md) — 変更頻度分析エンジン仕様
- [complexity-scoring-engine.md](./complexity-scoring-engine.md) — 複雑度スコアリングエンジン仕様
