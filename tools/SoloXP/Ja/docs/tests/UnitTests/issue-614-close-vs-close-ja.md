# Unit Tests: xp_Director SKILL.md の "Close"/"クローズ" 表記統一チェック

**テストファイル**: `SoloXP/__tests__/issue-614-close-vs-close-ja.unit.test.js`
**対応イシュー**: #620（バグ再現テスト、親バグ: #614）

## テスト対象

`SoloXP/skills/xp_Director/SKILL.md` および `dotfiles/.claude/skills/xp_Director/SKILL.md` が
AllGREEN後のストーリークローズ指示を「クローズ」（日本語）で記述していることを検証する。
「Close」（英語）の使用は `issue-274-story-close-on-allgreen.test.js` の期待パターンと不一致になるため禁止。

## テストケース一覧

### ファイル存在確認

| テスト名 | 種別 | 検証内容 |
|---|---|---|
| `SoloXP SKILL.md が存在する` | 正常系 | `SoloXP/skills/xp_Director/SKILL.md` が存在する |
| `dotfiles SKILL.md が存在する` | 正常系 | `/root/.claude/skills/xp_Director/SKILL.md` が存在する |

### "クローズ" パターン検出（バグ再現）

| テスト名 | 種別 | 検証内容 |
|---|---|---|
| `[SoloXP] SKILL.md に "クローズ" パターンが記載されている` | 回帰防止 | SoloXP SKILL.md に `GREEN.*クローズ` 等のパターンが存在すること（修正前は RED） |
| `[dotfiles] SKILL.md に "クローズ" パターンが記載されている` | 回帰防止 | dotfiles SKILL.md に `GREEN.*クローズ` 等のパターンが存在すること（修正前は RED） |

## カバレッジサマリー

- 正常系: 2件
- 回帰防止: 2件

## 実行方法

```bash
cd SoloXP && npx jest --no-coverage --testPathPatterns="issue-614"
```

## 検証パターン

```js
/E2E.*GREEN.*クローズ|GREEN.*クローズ|クローズ.*E2E GREEN|ストーリー.*クローズ/
```

（`SoloXP/tests/e2e/issue-274-story-close-on-allgreen.test.js` と同一パターン）

## 備考

このテストはバグ #614 の再現テストとして作成された。  
**修正前（バグ存在時）**: `[SoloXP]` / `[dotfiles]` の2テストが RED（SKILL.md に "Close" が存在するため）  
**修正後（#621 完了）**: 全テストが GREEN（4件 PASS）✅

修正対象ファイル（#621 で対応予定）:
- `SoloXP/skills/xp_Director/SKILL.md:111` → `PRを発行してClose` → `PRを発行してクローズ`
- `dotfiles/.claude/skills/xp_Director/SKILL.md:111` → 同上
