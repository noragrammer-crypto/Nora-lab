# Functional Test: scripts/hotspot.js CLI

テストファイル: `CodeCompass/__tests__/functional/hotspot.functional.test.js`

## テスト対象

`scripts/hotspot.js` — ホットスポット判定エンジンの CLI インターフェース
（引数解釈・出力先切り替え・エラーハンドリング・Markdown 出力）

> 集計結果そのものの受け入れ条件検証は E2E テスト
> （`__tests__/e2e/hotspot.e2e.test.js` / #1197）が担当する。

## テストシナリオ

| # | シナリオ | 種別 |
|---|---------|------|
| 1 | `scripts/hotspot.js` が存在する | 存在確認 |
| 2 | リポジトリパスを指定しない場合は使い方（Usage）を表示して異常終了する | 異常系 |
| 3 | `--out` を指定しない場合は標準出力に JSON 配列を書き出す | 正常系 |
| 4 | `--out` を指定するとファイルに JSON 配列を書き出す | 正常系 |
| 5 | `--days` オプションを指定してもエラーなく実行できる | 正常系 |
| 6 | `--md` を指定すると Markdown テーブルをファイルに書き出す | 正常系 |
| 7 | 変更頻度の高いファイルが配列の先頭に来る（スコア降順） | 正常系 |

## テストデータ説明

`buildSmallFixtureRepo()` で一時ディレクトリに git リポジトリを作成する。

| 項目 | 値 |
|------|----|
| ブランチ名 | `main` |
| ファイル | `main.js`（`if` 文1件 = complexity=1） |
| コミット数 | 2件（初回追加 + 1回更新） |
| 期待される集計結果 | `main.js` が hotspotScore > 0 として先頭に来る配列 |

`main.js` の内容:
```js
function foo(x) {
  if (x > 0) {
    return x * 2;
  }
  return 0;
}
```

## 出力フォーマット検証

JSON 出力に `file`, `hotspotScore`, `complexity`, `changes`, `loc`, `linesChanged` の
6フィールドが含まれることを検証する。

Markdown 出力（`--md` 指定時）は `hotspotScore` の列名と `main.js` を含む
テーブル形式であることを検証する。

## カバレッジサマリー

| 観点 | テスト数 | 状態 |
|------|---------|------|
| 引数解釈（repoPath 必須・--days・--out・--md） | 4 | ✅ |
| 出力先切り替え（標準出力 / ファイル / Markdown） | 3 | ✅ |
| エラーハンドリング（Usage 表示・異常終了コード） | 1 | ✅ |
| スコア降順ソート確認 | 1 | ✅ |
| 存在確認 | 1 | ✅ |

合計: 7件 — 全 GREEN

## RED 状態ガード

スクリプト未実装時（`scriptExists === false`）は以降のテストをスキップし、
存在確認テストのみが RED として記録される設計とする
（実装タスク #1198 完了前の RED フェーズが正しい状態であることを保証する）。
