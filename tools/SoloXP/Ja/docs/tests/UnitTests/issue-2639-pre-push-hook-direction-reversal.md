# issue-2639-pre-push-hook-direction-reversal ユニットテスト

## テスト対象

`.claude/hooks/pre-push.sh`（内容の静的検証）

pre-push フックの同期方向が「正本（`SoloXP/skills/xp_*` + `workflow/skills/*`）→ バイナリ
（`dotfiles/.claude/skills/*`）」に反転されていること、旧向き（`dotfiles` を読み取り元にする
`cp`）が残っていないこと、ドリフト検知・修正の記載があることを検証する（Issue #2639）。

## テストファイル

`SoloXP/tests/unit/issue-2639-pre-push-hook-direction-reversal.unit.test.js`

## テストケース一覧

| テストケース | 種別 | 内容 |
|---|---|---|
| 命題1: `.claude/hooks/pre-push.sh` が存在する | 正常系 | フックファイル自体の存在確認 |
| 命題2: 正本→バイナリの向きでコピーする記載がある | 正常系 | `(SoloXP\|workflow).*(→\|to).*dotfiles` にマッチすること |
| 命題3: dotfiles配下の直接編集によるドリフトを検知・修正する記載がある | 正常系 | `dotfiles` と `diff\|ドリフト\|drift` の両方を含むこと |
| 命題4: 旧向き（`cp -r "$DOTFILES_SKILLS`）が残っていない | 異常系（回帰防止） | 旧方向のcpパターンが存在しないこと |
| 命題5: `workflow/skills/` が同期元として参照されている | 正常系 | 非xp_系スキル（workflow/skills）も正本に含まれること |
| 命題6: `SoloXP/skills/` の `xp_*` が同期元として参照されている | 正常系 | xp_*系スキルが正本として参照されていること |

## カバレッジサマリー

- pre-push.sh 同期方向の静的検証: 6件
- 合計: 6件
