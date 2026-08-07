---
issue: 1007
title: "[Task] バグ再現テスト追加"
state: open
labels: [bug, task, epic/workflow]
author: noragrammer-crypto
created_at: 2026-05-15T22:25:42Z
epic: workflow
---

# #1007 [Task] バグ再現テスト追加

## 本文

## 概要
報告されたバグ #822 を再現するテストケースを追加する。
`kakuyomu_post_ab` SKILL.md のeval例で `$(cat /path/to/story.md)` がバッククォートや `${...}` を含む本文で失敗することを証明する。

テストファーストでバグの存在を証明し、修正タスクの受け入れ基準を定める。

## 見積もり
1pt — 再現テストの設計・作成

## 依存関係
なし（即着手可能・修正タスクより先に実施すること）

## 親ストーリー
#822

## 親ブランチ
feature/issue-822

## 備考
task_type: bug_reproduction_test
xp_Director はこのタスクを xp_UnitTest + xp_FunctionalTest で処理すること。

## コメント

### noragrammer-crypto — 2026-05-15T22:29:31Z

作業開始 2026-05-15 22:28

[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-05-15T22:29:43Z

[Tester実行中]

---

### noragrammer-crypto — 2026-05-15T22:32:06Z

## テスト命題（Unit）

- [ ] [RED] SKILL.md の eval 例に `$(cat ...)` をテンプレートリテラルへ直接注入するパターンが含まれないこと（修正後 GREEN）
- [ ] [GREEN/バグ証明] バッククォートを含む本文をテンプレートリテラルへ直接注入すると JS 構文エラーが発生すること
- [ ] [GREEN/バグ証明] `${...}` を含む本文をテンプレートリテラルへ直接注入すると変数参照として評価されること

## テスト命題（Functional）

- [ ] [RED] buildEvalSafe（修正後の関数）がバッククォートを含む本文を安全に処理できること（修正後 GREEN）
- [ ] [GREEN/バグ証明] シェル変数展開相当の直接注入でバッククォートがJSを破壊することをシミュレートで証明すること

---

### noragrammer-crypto — 2026-05-15T23:04:38Z

## テスト実行結果

### Unit Test
テストファイル: `SoloXP/__tests__/issue-822-kakuyomu-post-ab-eval-injection.unit.test.js`
結果: PASS 3件 / FAIL 1件

命題チェック:
- [ ] [RED] SKILL.md の eval 例に `$(cat ...)` をテンプレートリテラルへ直接注入するパターンが含まれないこと（**現在 FAIL: バグ存在確認済み**）
- [x] [GREEN/バグ証明] バッククォートを含む本文をテンプレートリテラルへ直接注入すると JS 構文エラーが発生すること
- [x] [GREEN/バグ証明] `${...}` を含む本文をテンプレートリテラルへ直接注入すると変数参照として評価されること
- [x] [GREEN/バグ証明] ダブルクォートを含む本文がシェルクォートを壊すこと

### Functional Test
テストファイル: `SoloXP/__tests__/issue-822-kakuyomu-post-ab-eval-injection.functional.test.js`
結果: PASS 8件 / FAIL 0件

命題チェック:
- [x] [GREEN/バグ証明] バッククォートを含む実ファイルの直接注入がJSエラーになること
- [x] [GREEN/参照実装] buildEvalSafe（JSON エスケープ方式）が各種特殊文字を安全に処理すること

### E2E Test
スキップ: `bug_reproduction_test` タスクのため

---

**バグ再現テスト完了**: テストが RED であることを確認。修正タスク (#1008) の受け入れ基準を定義済み。

**修正後の受け入れ基準**:
- `dotfiles/.claude/skills/kakuyomu_post_ab/SKILL.md` から `` `$(cat /path/to/story.md)` `` パターンを除去する
- JSON エスケープ方式（`JSON.stringify` + `JSON.parse`）による安全な代替例を記述する
- Unit テストの RED 1件が GREEN になること

---

### noragrammer-crypto — 2026-05-15T23:04:42Z

[Tester完了]

---

### noragrammer-crypto — 2026-05-15T23:05:14Z

[Auditor テスト実行中]

---

### noragrammer-crypto — 2026-05-15T23:06:23Z

[Auditor GREEN]

バグ再現テスト完了: テストが RED であることを確認。修正タスク #1008 の受け入れ基準を定義済み。

### テスト実行結果

**Unit テスト**: PASS 69件 / FAIL 1件（意図的 RED）
**Functional テスト**: PASS 17件 / FAIL 0件

### FAIL 分析（意図的 RED）

**テスト名**: `SKILL.md の eval 例に $(cat ...) をテンプレートリテラルへ直接注入するパターンが含まれないこと`
- スコープ: 現タスク #1007 内
- 判断: **意図的 RED** — `bug_reproduction_test` タスクとして正しい動作
- 根拠: `dotfiles/.claude/skills/kakuyomu_post_ab/SKILL.md` 行139 に `` `$(cat /path/to/story.md)` `` が存在することを証明済み。修正タスク #1008 完了後に GREEN になる。

### 修正タスク #1008 の受け入れ基準

SKILL.md から危険なパターン `` `$(cat ...)` `` を除去し、JSON エスケープ方式の安全な代替例を追加した時点で Unit テストの RED が GREEN に変わる。

---

### noragrammer-crypto — 2026-05-15T23:06:37Z

[Documenter実行中]

---
