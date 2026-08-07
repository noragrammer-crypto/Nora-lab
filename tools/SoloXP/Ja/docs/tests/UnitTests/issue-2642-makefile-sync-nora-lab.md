# issue-2642-makefile-sync-nora-lab ユニットテスト

## テスト対象

`SoloXP/Makefile`（`sync-nora-lab` ターゲットの静的検証）

`SoloXP/` 直下に新設した Makefile に `sync-nora-lab` ターゲットが定義され、同期先が
`Nora-lab/tools/SoloXP/Ja` であること、`workflow/skills/ProcessIssue` が同期対象に
含まれていること、`rsync` コマンドに依存しないポータブルな実装（`cp -r` ベース）で
あることを検証する（Issue #2642）。

## テストファイル

`SoloXP/tests/unit/issue-2642-makefile-sync-nora-lab.unit.test.js`

## テストケース一覧

| テストケース | 種別 | 内容 |
|---|---|---|
| 命題1: `SoloXP/Makefile` が存在する | 正常系 | ファイル存在確認 |
| 命題2: `sync-nora-lab` ターゲットが定義されている | 正常系 | `^sync-nora-lab:` の記載があること |
| 命題3: 同期先が `Nora-lab/tools/SoloXP/Ja` である | 正常系 | 同期先パスの記載があること |
| 命題4: `workflow/skills/ProcessIssue` が同期対象に含まれる | 正常系 | 参照があること |
| 命題5: `.PHONY` に `sync-nora-lab` が含まれる | 正常系 | `.PHONY` 行に含まれること |
| 命題6: rsyncコマンドに依存していない | 正常系（設計方針） | 実行環境によっては `rsync` が未導入のため、`cp -r` ベースの実装であることを確認（コメント中の説明文言は許容） |
| 命題7: `SHELL` が `bash` に固定されている | 異常系（回帰防止） | `find -print0` + `read -d ''` はdash等のPOSIX shにないbash拡張のため、デフォルトshellがdashの環境（`read: Illegal option -d`）でも動くよう固定されていることの確認（#2734 Codexレビュー指摘） |

## カバレッジサマリー

- SoloXP/Makefile の静的検証: 7件
- 合計: 7件
