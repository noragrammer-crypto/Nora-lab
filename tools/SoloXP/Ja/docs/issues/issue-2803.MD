# Issue #2803: [Task] xp_RunE2ETests SKILL.md: dev-server起動コマンドをDEV_SERVER_CMD環境変数で設定可能にする

- URL: https://github.com/noragrammer-crypto/HolyAutomater/issues/2803
- 親ストーリー: #2735
- 親ブランチ: feature/issue-2735

## 概要

`SoloXP/skills/xp_RunE2ETests/SKILL.md` の `### 0. 実行環境チェック`・`### 2. テスト対象URLの確認` 内にある
`node /home/user/HolyAutomater/scripts/dev-server.js` のハードコードを、`DEV_SERVER_CMD` 環境変数で上書き可能にし、
デフォルトは `playwright.config.js` の `webServer.command` と同一の汎用コマンド `npx vercel dev --listen 3000` に変更する。

依存: #2802（バグ再現テスト。PR #2925でマージ済み）

## 対応内容

以下3ファイル（内容は同一のスナップショット）を同時修正した：
- `SoloXP/skills/xp_RunE2ETests/SKILL.md`
- `dotfiles/.claude/skills/xp_RunE2ETests/SKILL.md`
- `Nora-lab/tools/SoloXP/Ja/skills/xp_RunE2ETests/SKILL.md`（`make publish-nora-lab` が参照する公開スナップショット。#2802のCodexレビュー指摘で検証対象に追加された分）

いずれも2箇所（実行環境チェック節・テスト対象URLの確認節）で、ハードコードされた絶対パスを
`DEV_SERVER_CMD="${DEV_SERVER_CMD:-npx vercel dev --listen 3000}"; eval "$DEV_SERVER_CMD"` に置き換えた。

## テスト結果

- `SoloXP/tests/unit/issue-2735-dev-server-cmd-configurable.unit.test.js`: PASS 6件 / FAIL 0件（RED → GREEN）
- `SoloXP/tests/unit` 全体: 18スイート / 155件 全PASSで回帰なし
- [実環境確認 OK]: モックなしのbash実行で、デフォルト値が `npx vercel dev --listen 3000` に解決すること、
  および `DEV_SERVER_CMD` オーバーライドが実際の起動コマンドとして評価されることを確認した
- 無関係な既存FAIL（`issue-1461`・`issue-254`）は変更前から存在する既知の事前失敗でありスコープ外

[Auditor GREEN]
