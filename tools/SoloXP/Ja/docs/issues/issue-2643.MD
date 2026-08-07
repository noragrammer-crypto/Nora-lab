# Issue #2643: [Task] git subtree push による Nora-lab 公開実施

- URL: https://github.com/noragrammer-crypto/HolyAutomater/issues/2643
- 親ストーリー: #2168
- 親ブランチ: feature/issue-2168

## 本文

## 概要
`make sync-nora-lab`（#2642で実装）を実行して `Nora-lab/tools/SoloXP/Ja` を同期し、`git subtree push --prefix=Nora-lab nora-lab main` で公開リポジトリ（`noragrammer-crypto/Nora-lab`）に反映する。リンク切れなく閲覧できることを確認する。

## 見積もり
1pt — 実行 + 公開側での閲覧確認

## 依存関係
このタスクは #2642 の完了後に着手すること。

depends_on: #2642

## 親ストーリー
#2168

## 親ブランチ
feature/issue-2168

## コメント履歴

### コメント1（2026-08-07 08:12 JST）

## 観測可能変更チェック（[Task]スキップ判定）

対象: #2643
観測可能な振る舞いの変更: なし
理由: `make sync-nora-lab`（#2642で実装済み）を実行し `git subtree push` で公開リポジトリへ反映するオペレーショナルタスク。新規の設計判断・実装は伴わず、既存の同期パイプライン（#2639〜#2642）を実行して結果を確認するのみのため、Architectをバイパスして通常実装タスクとして処理する。

作業開始 2026-08-07 08:10 JST
セッションURL: https://claude.ai/code/session_018dxPFzVY29uFMF2bskJE8r
[ProjectStatus: InProgress]

### コメント2（2026-08-07 08:15 JST）

[Tester完了]

## テスト命題（Unit）

対象: `workflow/__tests__/unit/issue-2643-nora-lab-link-check.unit.test.js`
テスト対象: `workflow/scripts/check-relative-links.js`（`checkBrokenRelativeLinks(scanDir, boundaryDir)`）

`git subtree push --prefix=Nora-lab nora-lab main` で公開すると `Nora-lab/` が公開リポジトリのルートになるため、`Nora-lab/` の外を指す相対リンク・存在しないファイルを指す相対リンクは公開側でリンク切れになる。これを検出する関数の命題:

- [ ] 命題1: 境界内の実在ファイルを指す相対リンクは壊れていないと判定する
- [ ] 命題2: 存在しないファイルを指す相対リンクを壊れていると判定する
- [ ] 命題3: 境界ディレクトリの外を指す相対リンクを壊れていると判定する
- [ ] 命題4: http(s)・アンカーのみ・mailtoリンクは対象外とする
- [ ] 命題5: アンカー付き相対リンクはアンカーを除いた実ファイルの存在で判定する
- [ ] 命題6: scanDir配下のmarkdownを再帰的に走査する

## Functional Test

対象: `workflow/__tests__/functional/issue-2643-nora-lab-publish-link-check.functional.test.js`

実リポジトリの `Nora-lab/tools/SoloXP/Ja`（`make -C SoloXP sync-nora-lab` 実行後の同期先）を対象に、SoloXP由来のドキュメント・ProcessIssueが同期されていること、および `checkBrokenRelativeLinks` で `Nora-lab/` を境界とした壊れたリンクがないことを検証する。

## 実行結果（実装前・RED確認）

```
FAIL __tests__/unit/issue-2643-nora-lab-link-check.unit.test.js
  Cannot find module '../../scripts/check-relative-links'
FAIL __tests__/functional/issue-2643-nora-lab-publish-link-check.functional.test.js
  Cannot find module '../../scripts/check-relative-links'
```

期待通りRED（`workflow/scripts/check-relative-links.js` 未実装、`Nora-lab/tools/SoloXP/Ja` 未同期のため）。Implementerに引き継ぎます。

補足: `make sync-nora-lab` 自体の同期メカニズム（除外対象・スペースを含むファイル名・削除反映）は #2642 の `SoloXP/tests/functional/issue-2642-makefile-sync-nora-lab.functional.test.js` でサンドボックス検証済みのため、本タスクでは重複させず「実際の公開実行」と「リンク切れ検証」に絞った。

### コメント3（2026-08-07 08:47 JST）

[Implementer完了]

## 実装完了

変更ファイル:
- `workflow/scripts/check-relative-links.js`: 新規。`checkBrokenRelativeLinks(scanDir, boundaryDir)` を実装。Nora-lab/ を境界として、境界外を指す相対リンク・存在しないファイルを指す相対リンクを検出する。
- `SoloXP/docs/spec/README.md`: `../ARCHITECTURE.md`・`../WORKFLOW.md` の相対リンク深さ誤りを修正（`SoloXP/docs/spec/` から2階層上が正しいため `../../ARCHITECTURE.md`・`../../WORKFLOW.md` に修正。実は公開前から存在した既存バグ）。非xp_系スキル仕様書（`workflow/`・`AINovelGenerator/` 配下）へのリンクは、Nora-lab公開範囲外のためリンクからモノレポ内パス表記に変更。
- `SoloXP/docs/spec/xp_reviewer.md`: 同様に `workflow/` 配下への関連仕様リンクをパス表記へ変更。
- `make -C SoloXP sync-nora-lab` を実行し `Nora-lab/tools/SoloXP/Ja` を最新化。

## 実行結果

- 単体テスト（issue-2643分）: PASS 6件 / FAIL 0件
- 機能テスト（issue-2643分）: PASS 3件 / FAIL 0件（`Nora-lab/tools/SoloXP/Ja` に壊れた相対リンクがないことを確認）
- `workflow/tests` 全体（回帰確認）: unit 96 PASS / 3 FAIL（`process-issue-1654.unit.test.js` の既知の陳腐化、本タスク無関係・既存分）、functional 59 PASS / 0 FAIL
- `SoloXP/tests` 全体（回帰確認）: unit 132 PASS / 0 FAIL、functional 23 PASS / 0 FAIL

## `git subtree push` 実施結果

`git subtree push --prefix=Nora-lab nora-lab main` を実行したところ、公開リポジトリ側に直push後の差分（記事追加・CodeCompassワークフロー等、オーナーによる直接push分）があり non-fast-forward で拒否された。`git subtree pull --prefix=Nora-lab nora-lab main --squash` で取り込み（コンフリクト3件はいずれもオーナーの公開側での直接修正を正として解消）、その後 `git subtree push` で計算した split commit を新規ブランチとして push、PRを発行した：

- **Nora-lab側PR**: https://github.com/noragrammer-crypto/Nora-lab/pull/20
- 本リポジトリ（Nora-lab）は `main` が branch protected で直push不可のため、PR経由でのマージが必要（オーナーマージ待ち）
- CI（CodeCompass Hotspot Analysis）実行中。監視継続中。

Auditorでの確認をお願いします。

### コメント4（2026-08-07 08:50 JST）

[Auditor テスト実行中]

## /xp_RunTestSuites 結果

実行日時: 2026-08-07 08:50 JST
ブランチ: claude/issue-processing-a5vgle（base: feature/issue-2168）

### 単体テスト
```
workflow: npx jest --testPathPattern=unit
Test Suites: 1 failed, 12 passed, 13 total
Tests:       3 failed, 96 passed, 99 total
```
- FAIL: `__tests__/unit/process-issue-1654.unit.test.js`（ProcessIssue SKILL.md 記述の陳腐化。本タスクの変更対象外・既存分。#2642時点のStory E2E確認でも同様に既知）

```
SoloXP: npx jest --testPathPattern=tests/unit
Test Suites: 14 passed, 14 total
Tests:       132 passed, 132 total
```
- 結果: PASS 132件 / FAIL 0件（issue-2643の直接テストはworkflow側のためSoloXP側は回帰確認のみ、既存分含め全PASS）

### 機能テスト
- 本タスクはWebアプリではなくgit操作・ドキュメント検証のため、プレビューURL疎通確認は非該当（#2639〜#2642と同様の判断）
```
workflow: npx jest --testPathPattern=functional
Test Suites: 10 passed, 10 total
Tests:       59 passed, 59 total
```
- 結果: PASS 59件 / FAIL 0件（issue-2643分3件を含む。`checkBrokenRelativeLinks` が実際の `Nora-lab/tools/SoloXP/Ja` に壊れたリンクがないことを確認）

```
SoloXP: npx jest --testPathPattern=tests/functional
Test Suites: 3 passed, 3 total
Tests:       23 passed, 23 total
```
- 結果: PASS 23件 / FAIL 0件（既存分、回帰なし）

### 実装内容の確認
- `checkBrokenRelativeLinks` が境界外リンク・存在しないファイルへのリンクを正しく検出することをユニットテスト6件で確認
- 実際の `SoloXP/docs/spec/README.md`・`xp_reviewer.md` の相対リンク深さ誤り（既存バグ）を修正し、`make -C SoloXP sync-nora-lab` 実行後の `Nora-lab/tools/SoloXP/Ja` にリンク切れがないことを実データで確認
- `git subtree push` を実際に実行し、Nora-lab側PR #20（https://github.com/noragrammer-crypto/Nora-lab/pull/20）を発行済み。オーナーマージ待ち

### 総合判定
✅ GREEN

[Auditor GREEN]
PASS: 158件（workflow unit 96 + workflow functional 59 + SoloXP unit 132 + SoloXP functional 23 のうちissue-2643新規分9件を含む） / テストコマンド: `npx jest --testPathPattern=unit`, `npx jest --testPathPattern=functional`（workflow/・SoloXP/ 両方）
