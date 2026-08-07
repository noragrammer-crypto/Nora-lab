# issue-1364-spec-readme-link-integrity ユニットテスト

## テスト対象

`SoloXP/docs/spec/README.md`（リンク整合性）

spec/README.md に記載された spec ディレクトリ内 .md リンクが全て実在することを検証する
（Issue #1364 のバグ再現・回帰防止）。

## テストファイル

`SoloXP/tests/unit/issue-1364-spec-readme-link-integrity.unit.test.js`

## テストケース一覧

| テストケース | 種別 | 内容 |
|---|---|---|
| spec/README.md が存在する | 正常系 | SPEC_DIR/README.md が存在すること |
| spec/README.md 内の spec ディレクトリ内 .md リンクが全て実在する | 正常系 | `../` で始まらない相対 .md リンクが全て存在すること |

## スコープ注記

- `../WORKFLOW.md`・`../ARCHITECTURE.md` は issues #1734/#1735 で別途対応のため除外
- spec ディレクトリ内リンク（`../` で始まらないもの）のみをチェック対象とする

## 変更履歴（#2637）

当初は novel_generator_run.md の不在を dangling link として検出・修正した経緯があるが、
novel_generator_run.md 自体は #404（NovelGeneratorRunの管理場所変更）で
`AINovelGenerator/docs/spec/` へ移設済みが正しい状態であり、`SoloXP/docs/spec/` に
存在してはならない。本テストは README.md からの該当リンク削除をもって dangling link を
解消する方針に統一し、「novel_generator_run.md が spec ディレクトリに存在すること」を
要求するテストケースは削除した。

## カバレッジサマリー

- spec README リンク整合性: 2件
- 合計: 2件
