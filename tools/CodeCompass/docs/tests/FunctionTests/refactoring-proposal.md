# Functional Test: scripts/refactoring-proposal.js CLI

テストファイル: `CodeCompass/__tests__/functional/refactoring-proposal.functional.test.js`

## テスト対象

`scripts/refactoring-proposal.js` — リファクタリング提案エンジンの CLI インターフェース
（引数解釈・入力ファイル読み込み・出力先切り替え・エラーハンドリング）

> 受け入れ条件の統合検証（buildStructuredJson + generateActionsMarkdown + CLI）は
> E2E テスト（`__tests__/e2e/refactoring-proposal.e2e.test.js` / #1215）が担当する。

## テストシナリオ

| # | シナリオ | 種別 |
|---|---------|------|
| 1 | `scripts/refactoring-proposal.js` が存在する | 存在確認 |
| 2 | `--hotspots` と `--graph` を指定して実行できる | 正常系 |
| 3 | `--out` を指定するとファイルに Markdown を書き出す | 正常系 |
| 4 | `--out` を指定しない場合は標準出力に Markdown を書き出す | 正常系 |
| 5 | hotspots ファイルが存在しない場合はエラーで終了する | 異常系 |
| 6 | `--hotspots` を指定しない場合は Usage を表示して異常終了する | 異常系 |
| 7 | 出力 Markdown にファイルパスとメトリクスが含まれる | 正常系 |

## テストデータ説明

各テストケースで `fs.mkdtempSync` により一時ディレクトリを作成し、以下のフィクスチャファイルを配置する。

| ファイル | 内容 |
|---------|------|
| `hotspots.json` | `[{ file: 'a.js', hotspotScore: 1.5, complexity: 30, changes: 50, loc: 200, linesChanged: 400 }, { file: 'b.js', ... }]` |
| `dependency-graph.mmd` | `graph LR\n  "a.js" -->|calls| "b.js"\n` |

期待される出力 Markdown:
- ファイルパス `a.js`, `b.js` を含む
- `1.5`（hotspot_score）を含む
- Markdown の見出し（`#`）を含む

## エラーハンドリング仕様

| 条件 | 動作 |
|------|------|
| `--hotspots` 未指定かつデフォルト `codecompass/hotspots.json` が不在 | stderr に `Usage` を出力し exit code 1 |
| 指定した `--hotspots` ファイルが不在 | stderr にエラーメッセージを出力し exit code 1 |
| `--graph` が存在しない | エラーにならず `callers=0, callees=0` として動作する |

## カバレッジサマリー

| 観点 | テスト数 | 状態 |
|------|---------|------|
| 引数解釈（--hotspots・--graph・--out） | 3 | ✅ |
| 出力先切り替え（標準出力 / ファイル） | 2 | ✅ |
| エラーハンドリング（存在チェック・Usage 表示） | 2 | ✅ |
| 存在確認 | 1 | ✅ |

合計: 7件 — 全 GREEN

## RED 状態ガード

スクリプト未実装時（`scriptExists === false`）は以降のテストをスキップし、
存在確認テストのみが RED として記録される設計とする
（実装タスク #1216 完了前の RED フェーズが正しい状態であることを保証する）。
