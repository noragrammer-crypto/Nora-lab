# Unit Test: lib/dependency-graph.js

テストファイル: `CodeCompass/__tests__/unit/dependency-graph.unit.test.js`

## テスト対象

`lib/dependency-graph.js` — 依存グラフ生成の純粋関数群
（`selectTopFiles`, `buildMermaidGraph`, `extractEdges`）

## テストケース一覧

### selectTopFiles

| # | テストケース | 種別 |
|---|------------|------|
| 1 | hotspotScore 降順リストから上位 topN 件のファイルパスを返す | 正常系 |
| 2 | hotspotScore=0 のファイルは選択対象外 | 正常系 |
| 3 | topN が非ゼロファイル数を超える場合は非ゼロ全件を返す | 境界値 |
| 4 | 全ファイルが score=0 の場合は空配列を返す | 異常系 |
| 5 | 空配列に対しては空配列を返す | 異常系 |
| 6 | topN=0 の場合は空配列を返す | 境界値 |

### buildMermaidGraph

| # | テストケース | 種別 |
|---|------------|------|
| 7 | 空のエッジリストから graph LR ヘッダのみを返す | 境界値 |
| 8 | 出力は graph LR で始まる | 正常系 |
| 9 | エッジは `-->|calls|` 形式で表現される | 正常系 |
| 10 | ファイルパスはダブルクォートで囲まれる | 正常系 |
| 11 | 複数エッジが改行で区切られて出力される | 正常系 |

### extractEdges

| # | テストケース | 種別 |
|---|------------|------|
| 12 | `require('./callee')` から callee.js へのエッジを返す | 正常系 |
| 13 | `require('./callee.js')` から callee.js へのエッジを返す | 正常系 |
| 14 | 外部モジュール（相対パスなし）は除外する | 正常系 |
| 15 | .js 拡張子なしの require も補完して返す | 正常系 |
| 16 | require がない場合は空配列を返す | 異常系 |
| 17 | 複数の require から複数のエッジを返す | 正常系 |

## カバレッジサマリー

| 関数 | テスト数 | 状態 |
|------|---------|------|
| `selectTopFiles` | 6 | ✅ |
| `buildMermaidGraph` | 5 | ✅ |
| `extractEdges` | 6 | ✅ |
| `analyzeDependencyGraph` | — | (ファイルシステム依存のため Functional で検証) |

合計: 17件 — 全 GREEN
