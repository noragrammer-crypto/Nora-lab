# Unit Test: issue-2735 dev-server-cmd-configurable（バグ再現テスト・タスク#2802）

対象ファイル: `SoloXP/tests/unit/issue-2735-dev-server-cmd-configurable.unit.test.js`
検証対象: `dotfiles/.claude/skills/xp_RunE2ETests/SKILL.md`・`SoloXP/skills/xp_RunE2ETests/SKILL.md`・
`Nora-lab/tools/SoloXP/Ja/skills/xp_RunE2ETests/SKILL.md`（3コピー）

## 背景

`SoloXP/skills/xp_RunE2ETests/SKILL.md` のClaudeCode Web環境向け手順が、ローカルサーバー起動コマンドとして
`node /home/user/HolyAutomater/scripts/dev-server.js` を複数箇所でハードコードしている（#2735）。
SoloXPはNora-lab（公開リポジトリ）に汎用フレームワークとして公開されているため、この絶対パス依存は
公開版で機能しない（Nora-lab PR #20 Codexレビュー指摘）。

## テストケース

1. HolyAutomater固有の絶対パス（`/home/user/HolyAutomater/scripts/dev-server.js`）が残っていない（否定）
2. `DEV_SERVER_CMD` がデフォルト値（`npx vercel dev`）を伴う代入と、その変数を実行する
   `eval "$DEV_SERVER_CMD"` 文の両方が揃って存在する（元のハードコード箇所2件分、肯定）

`dotfiles/` / `SoloXP/` / Nora-lab公開スナップショット（`make publish-nora-lab` が参照する
`Nora-lab/tools/SoloXP/Ja/skills/`）の3コピーに対して `describe.each` で同一検証を実施する
（issue-2059の2コピー検証形式を拡張。PR #2925 Codexレビュー指摘: 公開スナップショットを含めないと
SoloXP側だけ修正してsync漏れのまま全アサーションが通ってしまうため追加。PR #2932 Codexレビュー指摘:
「DEV_SERVER_CMDという文字列が近接している」だけの判定では説明コメントや代入文だけで閾値を満たし、
`eval "$DEV_SERVER_CMD"` 実行文を削除しても検知できなかったため、代入と実行を別々にカウントし
両方が揃っている数を要求する形に強化）。

## 実行結果

- 修正前（#2802時点）: FAIL 6件 / PASS 0件（意図通り＝バグ実在の証明）
- 修正後（#2803完了時点）: PASS 6件 / FAIL 0件（GREEN。`SoloXP/skills/xp_RunE2ETests/SKILL.md`・
  `dotfiles/.claude/skills/xp_RunE2ETests/SKILL.md`・`Nora-lab/tools/SoloXP/Ja/skills/xp_RunE2ETests/SKILL.md`
  の3コピー全てで `DEV_SERVER_CMD="${DEV_SERVER_CMD:-npx vercel dev --listen 3000}"` を導入）
