# E2E テストドキュメント: Issue #1410
## xp_Director 親イシュー作業開始記録 + xp_Implementer スレッドマーカー追加

テストファイル: `SoloXP/tests/e2e/issue-1410-worklog-markers.test.js`

---

## ユーザーシナリオ概要

xp_Director SKILL.md の「Architect 完了後」セクションに親 Bug/Story イシューへの作業開始記録指示が存在し、
AllGREEN 完了時に作業完了記録指示が存在すること、および xp_Implementer SKILL.md に
`[Implementer実行中]` マーカーの記録指示が存在することを検証する。
dotfiles と SoloXP の両コピーが同一内容であることも確認する。

---

## 前提条件

- `dotfiles/.claude/skills/xp_Director/SKILL.md` が存在すること
- `SoloXP/skills/xp_Director/SKILL.md` が存在すること
- `dotfiles/.claude/skills/xp_Implementer/SKILL.md` が存在すること
- `SoloXP/skills/xp_Implementer/SKILL.md` が存在すること

---

## テストケース一覧（9件）

### 受け入れ条件 1: xp_Director - Architect 完了後セクションに親イシューへの作業開始記録指示がある（3件）

| # | Given | When | Then |
|---|---|---|---|
| 1 | xp_Director SKILL.md が存在する | 「Architect 完了後（Story/Bug の場合）」セクションを確認する | セクションが存在する |
| 2 | セクションが存在する | 作業開始記録指示を確認する | `作業開始` の記述がある |
| 3 | セクションが存在する | [ProjectStatus] 記録指示を確認する | `[ProjectStatus: InProgress]` の記述がある |

### 受け入れ条件 2: xp_Director - AllGREEN 完了時に親イシューへの作業完了記録指示がある（2件）

| # | Given | When | Then |
|---|---|---|---|
| 4 | xp_Director SKILL.md が存在する | AllGREEN チェックセクションを確認する | セクションが存在する |
| 5 | セクションが存在する | 作業完了記録指示を確認する | `作業完了` の記述がある |

### 受け入れ条件 3: xp_Implementer SKILL.md に [Implementer実行中] 記録指示がある（2件）

| # | Given | When | Then |
|---|---|---|---|
| 6 | xp_Implementer SKILL.md が存在する | [Implementer実行中] テキストを確認する | `[Implementer実行中]` の記述がある |
| 7 | [Implementer実行中] が存在する | コメント記録指示として存在するか確認する | `コメント` と `[Implementer実行中]` が 300 文字以内に近接している |

### 受け入れ条件 4: dotfiles と SoloXP の SKILL.md が同一内容である（2件）

| # | Given | When | Then |
|---|---|---|---|
| 8 | dotfiles と SoloXP の xp_Director SKILL.md が存在する | 両ファイルを比較する | 内容が完全一致する |
| 9 | dotfiles と SoloXP の xp_Implementer SKILL.md が存在する | 両ファイルを比較する | 内容が完全一致する |

---

## 実装状況

| サブイシュー | 内容 | 状態 |
|---|---|---|
| #1444 | 再現テスト追加 + 修正実装 | 完了 |
| #2059 | AllGREEN セクション見出しがテキスト変更でリグレッション（受け入れ条件2が再びRED化） → #2792（再現テスト）・#2793（見出し修正）で解消 | 完了 |

---

## 実行結果

| 実行日 | PASS | FAIL | 状態 |
|---|---|---|---|
| 2026-06-15 | 0 | 9 | 実装前（RED 確認） |
| 2026-06-15 | 9 | 0 | #1444 実装後（全件 GREEN） |
| 2026-08-08 | 7 | 2 | #2059 リグレッション検知（見出し `AllGREEN チェック` 文字列消失により受け入れ条件2が再RED化） |
| 2026-08-09 | 9 | 0 | #2793 実装後（見出し修正、全件 GREEN 復旧） |
