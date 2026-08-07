---
issue: 1112
title: "[Task] バグ再現テスト追加: $BODY_JSON パターンのランタイム実行検証テスト"
state: open
labels: [task, epic/workflow]
author: noragrammer-crypto
created_at: 2026-05-21T12:13:49Z
epic: workflow
---

# #1112 [Task] バグ再現テスト追加: $BODY_JSON パターンのランタイム実行検証テスト

## 本文

## 概要

Issue #1011 で指摘された、`kakuyomu_post_ab/SKILL.md` の `$BODY_JSON` パターンに対するランタイム動作確認テストを追加する。

既存テスト（`issue-822-kakuyomu-post-ab-eval-injection.unit.test.js`）の `isValidJavaScript` は `new Function(code)` による構文チェックのみ。実際に `textarea.value = $BODY_JSON` 展開後のコードが正しく textarea.value を設定するかを検証するテストが欠けている。

## 追加するテスト

### unit テストに追加

`SoloXP/__tests__/issue-1011-body-json-runtime.unit.test.js` を新規作成：

- mock `document` + `querySelector` を使って textarea オブジェクトをシミュレートする
- JSON.stringify 済み文字列を直接代入した場合、`textarea.value` に正しい文字列が設定されること
- 以下の特殊文字でも正しく動作すること：
  - 改行（`\n`）
  - バッククォート（`` ` ``）
  - ダブルクォート（`"`）
  - `${ }` テンプレートリテラル的な文字列
- SKILL.md の eval コード例が `JSON.parse` を使わず `$BODY_JSON` を直接代入するパターンになっていること

## 見積もり

1pt — ランタイム実行テストの追加

## 依存関係

なし（即着手可能）

## 親ストーリー
#1011

## 親ブランチ
feature/issue-1011

## 備考
task_type: bug_reproduction_test
xp_Director はこのタスクを xp_Tester で処理すること（Implementer 不要）。

## コメント

### noragrammer-crypto — 2026-05-22T03:53:42Z

作業開始 2026-05-22 04:00

[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-05-22T03:53:46Z

[Tester実行中]

---

### noragrammer-crypto — 2026-05-22T03:57:44Z

## テスト命題（Unit）

- [ ] SKILL.md の eval 例に `JSON.parse($BODY_JSON)` パターンが含まれないこと（SKILL.md 修正確認）
- [ ] SKILL.md の eval 例に `textarea.value = $BODY_JSON` 直接代入パターンが含まれること
- [ ] 直接代入パターンが通常テキストを正しく `textarea.value` に設定できること（ランタイム確認）
- [ ] 直接代入パターンが改行（`\n`）を含む本文を正しく設定できること（ランタイム確認）
- [ ] 直接代入パターンがバッククォートを含む本文を正しく設定できること（ランタイム確認）
- [ ] 直接代入パターンがダブルクォートを含む本文を正しく設定できること（ランタイム確認）
- [ ] 直接代入パターンが `${ }` テンプレートリテラル的な文字列を変数展開せず設定できること（ランタイム確認）
- [ ] `JSON.parse($BODY_JSON)` パターンが SyntaxError を引き起こすこと（バグ存在証明）

## テスト命題（Functional）

- [ ] 実ファイル経由の完全フロー（ファイル読み込み→JSON.stringify→eval）で通常テキストが正しく設定されること
- [ ] 特殊文字（改行・バッククォート・ダブルクォート・`${}`）を含む小説原稿が正しく設定されること

---

### noragrammer-crypto — 2026-05-22T03:59:09Z

## テスト実行結果

### Unit Test
テストファイル: `SoloXP/__tests__/issue-1011-body-json-runtime.unit.test.js`
結果: PASS 9件 / FAIL 0件

命題チェック:
- [x] SKILL.md の eval 例に `JSON.parse($BODY_JSON)` パターンが含まれないこと
- [x] SKILL.md の eval 例に `textarea.value = $BODY_JSON` 直接代入パターンが含まれること
- [x] 直接代入パターンが通常テキストを正しく `textarea.value` に設定できること
- [x] 直接代入パターンが改行（`\n`）を含む本文を正しく設定できること
- [x] 直接代入パターンがバッククォートを含む本文を正しく設定できること
- [x] 直接代入パターンがダブルクォートを含む本文を正しく設定できること
- [x] 直接代入パターンが `${ }` テンプレートリテラル的な文字列を変数展開せず設定できること
- [x] `JSON.parse($BODY_JSON)` は通常テキストで SyntaxError を引き起こすこと（バグ証明）
- [x] `JSON.parse($BODY_JSON)` は改行を含む本文でも SyntaxError を引き起こすこと（バグ証明）

### Functional Test
テストファイル: `SoloXP/__tests__/issue-1011-body-json-runtime.functional.test.js`
結果: PASS 3件 / FAIL 0件

- [x] 実ファイル経由の完全フローで通常テキストが正しく設定されること
- [x] 特殊文字（改行・バッククォート・ダブルクォート・`${}`）を含む小説原稿が正しく設定されること
- [x] `dispatchEvent` が正しく呼ばれること

スキップ: E2E — bug_reproduction_test のため不要

[Tester完了]

---

### noragrammer-crypto — 2026-05-22T04:00:12Z

[Auditor GREEN]
PASS: unit 86件 / functional 20件 — 回帰なし
テストコマンド: `cd SoloXP && npx jest --no-coverage`

新規テスト 12件すべて GREEN:
- `issue-1011-body-json-runtime.unit.test.js`: 9件 PASS
- `issue-1011-body-json-runtime.functional.test.js`: 3件 PASS

スコープ外バグ: なし

---
