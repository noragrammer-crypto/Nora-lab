# Issue #2802: [Task] バグ再現テスト追加

- URL: https://github.com/noragrammer-crypto/HolyAutomater/issues/2802
- 親ストーリー: #2735
- 親ブランチ: feature/issue-2735

## 概要

報告されたバグ #2735（`SoloXP/skills/xp_RunE2ETests/SKILL.md` がHolyAutomater固有の絶対パス
`/home/user/HolyAutomater/scripts/dev-server.js` をハードコードしており公開版で機能しない）を
再現するテストケースを追加するタスク（`task_type: bug_reproduction_test`）。

## 対応内容

`SoloXP/tests/unit/issue-2735-dev-server-cmd-configurable.unit.test.js` を追加した。
`dotfiles/` / `SoloXP/` / Nora-lab公開スナップショット（`Nora-lab/tools/SoloXP/Ja/skills/`）の
3コピーの `xp_RunE2ETests/SKILL.md` を対象に、以下2命題を検証する：

1. HolyAutomater固有の絶対パス（`/home/user/HolyAutomater/scripts/dev-server.js`）が残っていない（否定）
2. `DEV_SERVER_CMD` がデフォルト値（`npx vercel dev`）を伴って実際の起動コマンドに接続されている（肯定。
   元のハードコード箇所2件分に相当する接続数を要求）

`bug_reproduction_test` タスクのため実装（Implementer）・Functional・E2Eは対象外。
修正実装は依存タスク #2803（`depends_on: #2802`）で行う。

### PR #2925 Codexレビュー対応

初回コミット後、Codexレビューで2件のP2指摘（Nora-lab公開スナップショットの検証対象漏れ、
`DEV_SERVER_CMD`存在チェックが実際の起動コマンドへの接続を保証しない）を受け、テストを強化した：
- 検証対象を `dotfiles/` / `SoloXP/` の2コピーから、`make publish-nora-lab` が参照する
  Nora-lab公開スナップショットを加えた3コピーへ拡張
- `DEV_SERVER_CMD` の単純な文字列存在チェックを廃し、デフォルト値（`npx vercel dev`）を伴って
  実際の起動コマンドに接続されていることを検証する形に強化

## テスト結果

- `SoloXP/tests/unit/issue-2735-dev-server-cmd-configurable.unit.test.js`: FAIL 6件 / PASS 0件
  （意図通り＝修正前の現状でバグが再現することの証明。#2803 の受け入れ基準として機能する）
- `SoloXP/tests/unit` 全体: 他35スイート全PASSで回帰なし
- 無関係な既存FAIL（`issue-1461-ai-dev-cost-token-tracking.test.js`・`issue-254-workflow-update.test.js`）を観測したが、
  本タスクの変更前から存在する既知の事前失敗でありスコープ外

[Auditor GREEN]（再現テスト作成タスクとして完了）
