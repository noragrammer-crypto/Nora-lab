# issue-2642-makefile-sync-nora-lab 機能テスト

## テスト対象

`make -C SoloXP sync-nora-lab`（実際の一時gitリポジトリ上での同期挙動）

`SoloXP/Makefile` の `sync-nora-lab` ターゲットを実際に実行し、`SoloXP/`（`skills/xp_*`
+ トップレベルdoc）と `workflow/skills/ProcessIssue` が `Nora-lab/tools/SoloXP/Ja` へ
実体コピーとして同期されること、`node_modules`・`Makefile` 自体などの除外対象が
同期先に含まれないこと、スペースを含むファイル名がシェルの単語分割で欠落しないこと、
正本側でファイルが削除された場合に再実行で同期先からも削除される（`rm -rf` による
作り直しで `--delete` 相当の挙動を実現）ことを検証する（Issue #2642）。

## テストファイル

`SoloXP/tests/functional/issue-2642-makefile-sync-nora-lab.functional.test.js`

## テストケース一覧

| テストケース | 種別 | 内容 |
|---|---|---|
| `SoloXP/skills/xp_Sample` が同期される | 正常系 | `Nora-lab/tools/SoloXP/Ja/skills/xp_Sample/SKILL.md` の内容一致 |
| `SoloXP/ARCHITECTURE.md` が同期される | 正常系 | トップレベルdocも同期対象であることの確認 |
| `workflow/skills/ProcessIssue` が同期される | 正常系 | `Nora-lab/tools/SoloXP/Ja/skills/ProcessIssue/SKILL.md` の内容一致 |
| スペースを含むファイル名が単語分割で欠落せず同期される | 異常系（回帰防止） | `for entry in $$(ls -A ...)` の単語分割バグ（#2734 Codexレビュー指摘）の再発防止 |
| `node_modules` は同期先に含まれない | 異常系（除外確認） | 除外対象が漏れないことの確認 |
| `Makefile` 自体は同期先に含まれない | 異常系（除外確認） | 除外対象が漏れないことの確認 |
| 正本側は変更されない | 正常系 | 同期が一方向であることの確認 |
| 再実行時に正本で削除されたファイルが同期先からも削除される | 正常系（削除反映） | `SoloXP/skills/xp_Sample` 削除後の再実行で同期先からも消えること |
| 他の同期対象は再実行後も残っている | 正常系（回帰防止） | 削除反映が対象ファイル以外に影響しないこと |

## カバレッジサマリー

- 実際の `make sync-nora-lab` 実行による同期挙動検証: 9件
- 合計: 9件
