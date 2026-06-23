# Functional Test: scripts/dependency-graph.js

テストファイル: `CodeCompass/__tests__/functional/dependency-graph.functional.test.js`

## テスト対象

`scripts/dependency-graph.js` — 依存グラフ生成 CLI
（引数解釈・ファイル出力・topN フィルタリング）

## テストケース一覧

| # | テストケース | 種別 |
|---|------------|------|
| 1 | `scripts/dependency-graph.js` が存在する | 存在確認 |
| 2 | リポジトリパスを指定しない場合は使い方を表示して異常終了する | 異常系 |
| 3 | `--out` を指定するとファイルに Mermaid グラフを書き出す | 正常系 |
| 4 | `caller.js` はデフォルト topN（20%）で分析対象に含まれる | 正常系 |
| 5 | `caller.js` が `callee.js` を require している場合、依存エッジが出力される | 正常系 |
| 6 | `--topN=1` 指定時はゼロスコアファイルがグラフに含まれない | 正常系 |
| 7 | `--out` 省略時は標準出力に Mermaid グラフを出力する | 正常系 |

## フィクスチャ構成

一時ディレクトリに以下のファイルを生成して検証する：

```
<repoDir>/
  caller.js     (hotspotScore=1.0, callee.js を require)
  callee.js     (hotspotScore=0.5)
  unrelated.js  (hotspotScore=0.1)
  low1-3.js     (hotspotScore=0.0)
  hotspots.json
```

## カバレッジサマリー

| シナリオ | 状態 |
|---------|------|
| 正常実行 | ✅ |
| `--topN` フィルタリング | ✅ |
| `--out` ファイル出力 | ✅ |
| 標準出力フォールバック | ✅ |
| エラーハンドリング（引数なし） | ✅ |

合計: 7件 — 全 GREEN
