# Unit Test: issue-2741 skill-files-sync-doc-regex-distance

対象ファイル: `SoloXP/tests/unit/issue-2741-skill-files-sync-doc-regex-distance.unit.test.js`
検証対象: `docs/skill-files-sync.md`

## 背景

Story #2168 の受け入れテスト（`issue-2168-soloxp-canonicalization-nora-lab-pipeline.test.js` AC4）が要求する
正規表現 `/dotfiles.{0,40}(バイナリ|生成物)/` に対し、`docs/skill-files-sync.md` の該当箇所の文言が
「dotfiles」から「生成物」まで50文字離れており、マッチしていなかった（#2741）。

## テストケース

1. `docs/skill-files-sync.md` 全文が Story #2168 AC4 の正規表現にマッチする
2. ファイル中の少なくとも1行が、同一行内で当該正規表現にマッチする（表記が別行に分割されて偶然マッチする事故を防ぐため、単一行内での成立を明示的に検証）

## 実行結果

PASS 2件 / FAIL 0件
