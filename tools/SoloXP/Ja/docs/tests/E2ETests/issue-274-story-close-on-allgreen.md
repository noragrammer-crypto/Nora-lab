# E2E テストドキュメント: Issue #274
## xp_Director ストーリー全サブイシュー完了時のE2Eテスト→クローズフロー

テストファイル: `SoloXP/tests/e2e/issue-274-story-close-on-allgreen.test.js`

---

## ユーザーシナリオ概要

xp_Director がストーリーイシューの全サブイシュー完了（AllGREEN）を検知した際に、
E2Eテストを実行してから親ストーリーをクローズするフローが SKILL.md に正しく定義されていることを検証する。

---

## 前提条件

- `xp_Director` SKILL.md が2箇所に存在すること
  - dotfiles版: `/root/.claude/skills/xp_Director/SKILL.md`
  - SoloXP版: `SoloXP/skills/xp_Director/SKILL.md`

---

## テストケース一覧（10件）

### [dotfiles] AllGREEN→E2E→クローズフロー（5件）

| # | Given | When | Then |
|---|---|---|---|
| 1 | dotfiles版 SKILL.md が存在する | AllGREEN 検知ロジックを確認する | `AllGREEN` または `[Auditor GREEN]` の全サブイシューチェックが記載されている |
| 2 | dotfiles版 SKILL.md が存在する | xp_RunE2ETests 呼び出しを確認する | `xp_RunE2ETests` の文字列が記載されている |
| 3 | dotfiles版 SKILL.md が存在する | E2E GREEN 後のクローズ処理を確認する | E2E GREEN → ストーリークローズの指示が記載されている |
| 4 | dotfiles版 SKILL.md が存在する | E2E 実行不可時の処理を確認する | 実行不可/スキップ時にユーザーに委ねる指示が記載されている |
| 5 | dotfiles版 SKILL.md が存在する | E2E 失敗時のフォールバックを確認する | 失敗時に新サブイシューを起票する指示が記載されている |

### [SoloXP] AllGREEN→E2E→クローズフロー（5件）

| # | Given | When | Then |
|---|---|---|---|
| 6 | SoloXP版 SKILL.md が存在する | AllGREEN 検知ロジックを確認する | `AllGREEN` または `[Auditor GREEN]` の全サブイシューチェックが記載されている |
| 7 | SoloXP版 SKILL.md が存在する | xp_RunE2ETests 呼び出しを確認する | `xp_RunE2ETests` の文字列が記載されている |
| 8 | SoloXP版 SKILL.md が存在する | E2E GREEN 後のクローズ処理を確認する | E2E GREEN → ストーリークローズの指示が記載されている |
| 9 | SoloXP版 SKILL.md が存在する | E2E 実行不可時の処理を確認する | 実行不可/スキップ時にユーザーに委ねる指示が記載されている |
| 10 | SoloXP版 SKILL.md が存在する | E2E 失敗時のフォールバックを確認する | 失敗時に新サブイシューを起票する指示が記載されている |

---

## テスト実行方法

```bash
node SoloXP/tests/e2e/issue-274-story-close-on-allgreen.test.js
```

---

## 受け入れ条件（Issue #274）

- [x] xp_Director が全サブイシューに `[Auditor GREEN]` が揃ったことを検知する → `xp_RunE2ETests` を実行
- [x] E2E GREEN → 親ストーリーイシューをクローズする
- [x] E2E 実行不可/スキップ → イシューにコメントしてユーザーに判断を委ねる（自動クローズしない）
- [x] E2E 失敗 → 失敗内容で新サブイシューを起票し、親イシューは継続
- [x] xp_Director の SKILL.md（dotfiles + SoloXP）にフローを追記する
