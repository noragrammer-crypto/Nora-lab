---
issue: 1392
title: "[Task] SoloXP テスト: 3スイート11件のアサーションを現行設計（PR責務=Director）に追随させる"
state: open
labels: [task, epic/SoloXP]
author: noragrammer-crypto
created_at: 2026-06-13T23:38:32Z
epic: SoloXP
---

# #1392 [Task] SoloXP テスト: 3スイート11件のアサーションを現行設計（PR責務=Director）に追随させる

## 本文

## 概要

`npm test` で 3スイート 11テストが失敗している。
原因は SKILL.md のリファクタリング（PR発行責務の Auditor → Director への移管）に対してテストが追随できていないこと。

## 失敗スイートと修正内容

### `tests/e2e/issue-638-pr-autoclose-keywords.test.js` (6件)

テストが `xp_Auditor SKILL.md` に `gh pr create` / `Closes #` を要求しているが、PR責務は `xp_Director` に移管済み。
→ **修正**: テストの参照対象を `xp_Auditor` から `xp_Director` に変更する

### `tests/e2e/issue-826-story-level-auditor.test.js` (4件)

- テスト1: `/xp_Auditor test.*epic.*story|AllGREEN.*xp_Auditor test/` が一致しない
  - 現在の SKILL.md: `xp_Auditor test <親ストーリー番号>` (「story」英語なし、「AllGREEN」と「xp_Auditor test」は別行)
  - → **修正**: パターンを `/xp_Auditor test.*epic/` に更新
- テスト2〜4: `xp_Auditor SKILL.md` に `feature→main PR 発行指示` / `gh pr create --base main` / ストーリークローズを要求
  - PR責務は Director に移管済み
  - → **修正**: `auditorSkill` → `directorSkill` に変更

### `tests/e2e/issue-243-sub-issue-reporting.test.js` (1件)

- `/残り.*サブイシュー/` パターンが、現在の Auditor SKILL.md の順序（`サブイシュー #<番号> 完了。残り: #<番号>`）と不一致
- → **修正**: パターンに `サブイシュー.*残り` を追加

## 見積もり

1pt — 既存テスト3ファイルのアサーション更新（コード変更なし・テストのみ）

## 依存関係

なし（即着手可能）

## 親ストーリー
#1294

## 親ブランチ
feature/issue-1294

## 備考
CLAUDE.md TDD原則「バグ修正はワンタスクで完結させる」に従い、再現確認と修正を1タスクで実施。
再現テストは失敗している3スイートがすでに存在するため独立タスク化しない。

## コメント

### noragrammer-crypto — 2026-06-27T06:45:07Z

⚠️ 親ブランチ feature/issue-1294 が見つかりません。
先に親Story (#1294) を /xp_Director 1294 で処理してください。

（#1294 には `[親ブランチ作成済み] feature/issue-1294` というコメントがありますが、`git ls-remote origin` で該当ブランチが存在しないことを確認済みです。）

---

### noragrammer-crypto — 2026-06-27T06:49:47Z

## 観測可能変更チェック（[Task]スキップ判定）

対象: #1392
観測可能な振る舞いの変更: なし
理由: 既存テストファイル（issue-638 / issue-826 / issue-243 の各E2Eテスト）のアサーション内容をSKILL.mdの現行設計（PR発行責務=xp_Director）に追随させるのみで、プロダクションコード・SKILL.md本体の変更は行わない。Architectをスキップして実行フローへ進む。

---

### noragrammer-crypto — 2026-06-27T06:49:48Z

作業開始 2026-06-27 (時刻はシステム時刻不明のため省略)
セッションURL: https://claude.ai/code/session_013YiLnJsfKJ6bLGRWHqF7s9
[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-06-27T06:49:58Z

作業開始 2026-06-27 06:49

---

### noragrammer-crypto — 2026-06-27T06:54:21Z

[Tester実行中]

## テスト実行結果

本タスクは「テストファイル自体の修正」が実装内容のため、xp_Tester が直接3ファイルを修正した（xp_Implementerへの引き継ぎは不要）。

### 修正内容

1. `tests/e2e/issue-638-pr-autoclose-keywords.test.js`
   - PR発行責務が xp_Director に移管済みのため、`gh pr create` / `Closes #` のアサート対象を `xp_Auditor SKILL.md` → `xp_Director SKILL.md` に変更
   - `xp_Auditor SKILL.md` 側は「PR発行は xp_Director の責務」という委譲記述の存在のみを検証する形に変更

2. `tests/e2e/issue-826-story-level-auditor.test.js`
   - 受け入れ条件1: パターンを `/xp_Auditor test.*epic.*story|AllGREEN.*xp_Auditor test/` → `/xp_Auditor test.*epic/` に変更（ステップ番号非依存・実際のSKILL.md記述に追随）
   - 受け入れ条件4: 検証対象を `auditorSkill` → `directorSkill` に変更（PR発行責務はDirectorに移管済み）

3. `tests/e2e/issue-243-sub-issue-reporting.test.js`
   - 「残りサブイシュー特定ロジック」のパターンに `サブイシュー.*残り` を追加（現行の文言順「サブイシュー完了。残り:」に対応）

### Unit + Functional Test
対象外（プロダクションコード変更なし）

### E2E Test
テストファイル: `tests/e2e/issue-638-pr-autoclose-keywords.test.js`, `tests/e2e/issue-826-story-level-auditor.test.js`, `tests/e2e/issue-243-sub-issue-reporting.test.js`

```
npx jest tests/e2e/issue-638-pr-autoclose-keywords.test.js tests/e2e/issue-826-story-level-auditor.test.js tests/e2e/issue-243-sub-issue-reporting.test.js

Test Suites: 3 passed, 3 total
Tests:       31 passed, 31 total
```

命題チェック:
- [x] issue-638: PR発行責務委譲の検証が現行設計に追随する
- [x] issue-826: ステップ番号非依存・PR発行責務移管に追随する
- [x] issue-243: 「サブイシュー完了。残り:」の語順に追随する

### 全体テストスイートへの影響確認

```bash
npm test
Test Suites: 2 failed, 31 passed, 33 total
Tests:       3 failed, 329 passed, 332 total
```

残る2スイート（`issue-1410-worklog-markers.test.js`, `sub-issue-completion-reporting.test.js`）の失敗は本タスク（#1392）のスコープ外（#1294本文に記載の対象3ファイルに含まれない）であり、本修正による回帰ではないことを確認済み。

[Tester完了]

---

### noragrammer-crypto — 2026-06-27T06:57:07Z

[Auditor テスト実行中]

対象3スイートを再実行して結果を検証。

```
PASS tests/e2e/issue-243-sub-issue-reporting.test.js
PASS tests/e2e/issue-826-story-level-auditor.test.js
PASS tests/e2e/issue-638-pr-autoclose-keywords.test.js

Test Suites: 3 passed, 3 total
Tests:       31 passed, 31 total
```

### スコープ判断

- 対象3スイート・11件のアサーション修正はすべてGREEN。イシュー本文の要求（issue-638/issue-826/issue-243 の文言アサート修正）を満たしている。
- SoloXP全体の `npm test` では他に2スイートが RED（`issue-1410-worklog-markers.test.js`, `sub-issue-completion-reporting.test.js`）だが、これらは本イシュー #1392 のスコープ外（別イシューの懸念）であり、本変更によるリグレッションではないことを確認済み（変更前から失敗、本PRの変更ファイルと無関係なテスト対象）。
- `issue-904-auditor-bug-template-parent-branch.unit.test.js`（親 #1294 の他サブイシュー領域）は本変更と無関係に既にPASS。

[Auditor GREEN]
PASS: 31件 / テストコマンド: `npx jest tests/e2e/issue-638-pr-autoclose-keywords.test.js tests/e2e/issue-826-story-level-auditor.test.js tests/e2e/issue-243-sub-issue-reporting.test.js`

---
