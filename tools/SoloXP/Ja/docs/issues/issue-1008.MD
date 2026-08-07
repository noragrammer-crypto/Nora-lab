---
issue: 1008
title: "[Task] kakuyomu_post_ab eval インジェクション修正"
state: open
labels: [task, epic/workflow]
author: noragrammer-crypto
created_at: 2026-05-15T22:25:56Z
epic: workflow
---

# #1008 [Task] kakuyomu_post_ab eval インジェクション修正

## 本文

## 概要
`kakuyomu_post_ab` SKILL.md の本文入力例を修正する。

現状のコード例:
```bash
npx agent-browser --session-name kakuyomu eval "
  const textarea = document.querySelector('textarea[name=body]');
  if (textarea) { textarea.value = \`$(cat /path/to/story.md)\`; textarea.dispatchEvent(new Event('input', {bubbles:true})); }
"
```

`$(cat /path/to/story.md)` でシェル変数展開し、バッククォートまたは `${...}` を含む原稿テキストをテンプレートリテラルに直接注入すると以下のエラーが発生する:
- バッククォート → JavaScriptテンプレートリテラルが途中で閉じる
- `${...}` → JavaScript式として評価される
- ダブルクォート → 外側のbashクォートが閉じる

## 修正方針
1. `node -e` またはシェルの `printf '%s'` で本文を JSON エスケープする
2. JavaScriptのevalには `JSON.parse(...)` でデコードした文字列を使う

修正例:
```bash
BODY_JSON=$(node -e "const fs=require('fs'); process.stdout.write(JSON.stringify(fs.readFileSync('/path/to/story.md','utf8')))")
npx agent-browser --session-name kakuyomu eval "
  const textarea = document.querySelector('textarea[name=body]');
  if (textarea) { textarea.value = JSON.parse($BODY_JSON); textarea.dispatchEvent(new Event('input', {bubbles:true})); }
"
```

## 見積もり
1pt — SKILL.md の例コード修正

## 依存関係
このタスクは #1007 の完了後に着手すること。
（依存先サブイシューに [Auditor GREEN] コメントが記録されてから着手する）

depends_on: #1007

## 親ストーリー
#822

## 親ブランチ
feature/issue-822

## コメント

### noragrammer-crypto — 2026-05-15T23:27:03Z

作業開始 2026-05-15 23:27

[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-05-15T23:27:18Z

[Tester実行中]

---

### noragrammer-crypto — 2026-05-15T23:28:22Z

## テスト実行結果

### Unit Test
テストファイル: `SoloXP/__tests__/issue-822-kakuyomu-post-ab-eval-injection.unit.test.js`
結果: PASS 3件 / FAIL 1件

命題チェック:
- [ ] [RED] SKILL.md の eval 例に `$(cat ...)` をテンプレートリテラルへ直接注入するパターンが含まれないこと（**現在 FAIL: バグ存在確認済み → 修正後 GREEN**）
- [x] [GREEN/バグ証明] バッククォートを含む本文をテンプレートリテラルへ直接注入すると JS 構文エラーが発生すること
- [x] [GREEN/バグ証明] ${...} を含む本文をテンプレートリテラルへ直接注入すると変数参照として評価されること
- [x] [GREEN/バグ証明] ダブルクォートを含む本文が外側のシェルクォートを壊すこと

### Functional Test
テストファイル: `SoloXP/__tests__/issue-822-kakuyomu-post-ab-eval-injection.functional.test.js`
結果: PASS 11件 / FAIL 0件

### E2E Test
スキップ: SKILL.md ドキュメント修正のみのため E2E 対象外

**Implementer への引き継ぎ:**
- 修正対象: `dotfiles/.claude/skills/kakuyomu_post_ab/SKILL.md`
- 行 139 付近の `textarea.value = \`$(cat /path/to/story.md)\`` を JSON エスケープ方式に変更する
- 修正後に Unit テストの RED が GREEN になることを確認する

---

### noragrammer-crypto — 2026-05-15T23:28:27Z

[Tester完了]

---

### noragrammer-crypto — 2026-05-15T23:29:32Z

## 実装完了

変更ファイル:
- `dotfiles/.claude/skills/kakuyomu_post_ab/SKILL.md`: 行136-140 の本文入力例を修正

  **変更前（危険）:**
  ```bash
  npx agent-browser --session-name kakuyomu eval "
    const textarea = document.querySelector('textarea[name=body]');
    if (textarea) { textarea.value = \`$(cat /path/to/story.md)\`; ... }
  "
  ```

  **変更後（安全）:**
  ```bash
  BODY_JSON=$(node -e "const fs=require('fs'); process.stdout.write(JSON.stringify(fs.readFileSync('/path/to/story.md','utf8')))")
  npx agent-browser --session-name kakuyomu eval "
    const textarea = document.querySelector('textarea[name=body]');
    if (textarea) { textarea.value = JSON.parse($BODY_JSON); ... }
  "
  ```

テスト結果:
- Unit テスト: PASS 4件 / FAIL 0件（修正前の RED が GREEN に変わった）
- Functional テスト: PASS 11件 / FAIL 0件

---

### noragrammer-crypto — 2026-05-15T23:29:35Z

[Implementer完了]

---

### noragrammer-crypto — 2026-05-15T23:30:28Z

[Auditor テスト実行中]

---

### noragrammer-crypto — 2026-05-15T23:30:41Z

[Auditor GREEN]

**Unit テスト**: PASS 70件 / FAIL 0件（#822 の RED テストが GREEN に変わった）
**Functional テスト**: PASS 17件 / FAIL 0件

修正タスク #1008 の受け入れ基準達成。`dotfiles/.claude/skills/kakuyomu_post_ab/SKILL.md` から危険なパターン `` `$(cat ...)` `` を除去し、JSON エスケープ方式の安全な代替例に変更済み。

---
