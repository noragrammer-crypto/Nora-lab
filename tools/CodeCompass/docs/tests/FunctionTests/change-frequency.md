# Functional Test: scripts/change-frequency.js CLI

テストファイル: `CodeCompass/__tests__/functional/change-frequency.functional.test.js`

## テスト対象

`scripts/change-frequency.js` — 変更頻度分析エンジンの CLI インターフェース
（引数解釈・出力先切り替え・エラーハンドリング）

> 集計結果そのものの受け入れ条件検証は E2E テスト
> （`__tests__/e2e/change-frequency-analysis.e2e.test.js` / #1181）が担当する。

## テストシナリオ

| # | シナリオ | 種別 |
|---|---------|------|
| 1 | `scripts/change-frequency.js` が存在する | 存在確認 |
| 2 | リポジトリパスを指定しない場合は使い方（Usage）を表示して異常終了する | 異常系 |
| 3 | `--out` を指定しない場合は標準出力に JSON 配列を書き出す | 正常系 |
| 4 | `--out` を指定するとファイルに JSON 配列を書き出す | 正常系 |
| 5 | `--days` オプションを指定してもエラーなく実行できる | 正常系 |

## テストデータ説明

`buildSmallFixtureRepo()` で一時ディレクトリに最小構成の git リポジトリを作成する。

| 項目 | 値 |
|------|----|
| ブランチ名 | `main` |
| コミット内容 | `only.js` を追加する commit 1 件（`feat: add only.js`） |
| 期待される集計結果 | `{ file: 'only.js', changes: 1 }` を含む配列 |

## カバレッジサマリー

| 観点 | テスト数 | 状態 |
|------|---------|------|
| 引数解釈（repoPath 必須・--days・--out） | 3 | ✅ |
| 出力先切り替え（標準出力 / ファイル） | 2 | ✅ |
| エラーハンドリング（Usage 表示・異常終了コード） | 1 | ✅ |
| 存在確認 | 1 | ✅ |

合計: 5件 — 全 GREEN

## RED 状態ガード

スクリプト未実装時（`scriptExists === false`）は以降のテストをスキップし、
存在確認テストのみが RED として記録される設計とする
（実装タスク #1182 完了前の RED フェーズが正しい状態であることを保証する）。
