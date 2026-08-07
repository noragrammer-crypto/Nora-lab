# Functional Test: scripts/complexity-score.js CLI

テストファイル: `CodeCompass/__tests__/functional/complexity-score.functional.test.js`

## テスト対象

`scripts/complexity-score.js` — 複雑度スコアリングエンジンの CLI インターフェース
（引数解釈・出力先切り替え・エラーハンドリング）

> スコア算出そのものの受け入れ条件検証は E2E テスト
> （`__tests__/e2e/complexity-score.e2e.test.js` / #1184）が担当する。

## テストシナリオ

| # | シナリオ | 種別 |
|---|---------|------|
| 1 | `scripts/complexity-score.js` が存在する | 存在確認 |
| 2 | リポジトリパスを指定しない場合は使い方（Usage）を表示して異常終了する | 異常系 |
| 3 | `--out` を指定しない場合は標準出力に `{ file, complexity, loc }` の JSON 配列を書き出す | 正常系 |
| 4 | `--out` を指定するとファイルに JSON 配列を書き出す | 正常系 |

## テストデータ説明

`buildSmallFixtureRepo()` で一時ディレクトリに最小構成のフィクスチャリポジトリを作成する（git 不要）。

| 項目 | 値 |
|------|----|
| ファイル | `only.js`（`if` 文を1個含む4行の関数定義） |
| 期待される算出結果 | `{ file: 'only.js', complexity: 1, loc: 4 }` を含む配列 |

## カバレッジサマリー

| 観点 | テスト数 | 状態 |
|------|---------|------|
| 引数解釈（repoPath 必須・--out） | 1 | ✅ |
| 出力先切り替え（標準出力 / ファイル） | 2 | ✅ |
| エラーハンドリング（Usage 表示・異常終了コード） | 1 | ✅ |
| 存在確認 | 1 | ✅ |

合計: 4件 — 全 GREEN

## RED 状態ガード

スクリプト未実装時（`scriptExists === false`）は以降のテストをスキップし、
存在確認テストのみが RED として記録される設計とする
（実装タスク #1185 完了前の RED フェーズが正しい状態であることを保証する）。
