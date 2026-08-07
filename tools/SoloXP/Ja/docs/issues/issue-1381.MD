---
issue: 1381
title: "[Story] xp_Architect の競合チェックを feature-dev に委譲する"
state: open
labels: [enhancement, epic/SoloXP]
author: noragrammer-crypto
created_at: 2026-06-13T19:20:17Z
epic: SoloXP
---

# #1381 [Story] xp_Architect の競合チェックを feature-dev に委譲する

## 本文

## 概要

xp_Architect の step 3（既存実装との競合チェック）を `/feature-dev` 呼び出しに差し替え、
コード分析品質を向上させる。

step 4 以降（実行計画立案 → GitHub subissue 発行）は現行のまま維持する。

## 背景

- `xp_Reviewer` はすでに `/review`（feature-dev の review サブコマンド）を呼んでいる
- `xp_Architect` の SKILL.md には「設計思想（feature-dev code-explorer/architect から学ぶ）」セクションがあり、哲学として参照済みだが**実際には呼んでいない**
- 現状の step 3 は Claude が手動でコードをトレースするため、見落としリスクがある

## 方針

feature-dev の architect サブコマンドをブリッジとして使い、出力を xp 実行計画に変換する。

```
xp_Architect の新フロー:

step 1-2: イシュー読み込み・種別分類（変更なし）
step 3:   /feature-dev を呼び出してコード分析・競合チェックを取得  ← ★変更点
step 4:   feature-dev の出力 + estimate.breakdown から実行計画を立案
step 5-7: subissue 発行・ストーリーカード更新・xp_Director への返答（変更なし）
```

## 受け入れ条件

- [ ] xp_Architect の step 3 が `/feature-dev`（または同等サブコマンド）を呼び出す記述になっている
- [ ] feature-dev の出力をどう xp 実行計画に変換するか（depends_on / task_type のマッピング）が SKILL.md に明記されている
- [ ] feature-dev が呼べない場合（コマンド未対応・エラー）のフォールバック手順が明記されている
- [ ] 既存の xp フロー（subissue 発行・GitHub 連携部分）が壊れていない

## 影響範囲

- `~/.claude/skills/xp_Architect/SKILL.md`（主要変更対象）
- E2E テスト: `SoloXP/tests/e2e/` に xp_Architect の受け入れテストがあれば更新

## 見積もり

estimate:
  total: 2pt
  breakdown:
    - task: feature-dev 呼び出し手順の調査・SKILL.md 改訂
      pt: 1
      depends_on: null
    - task: フォールバック手順の定義と E2E テスト更新
      pt: 1
      depends_on: 前タスク

## コメント

### noragrammer-crypto — 2026-07-15T12:08:50Z

作業開始 2026-07-15 12:07
セッションURL: https://claude.ai/code/session_01Lc9rjuhGzAudSsCrGDnA6d
[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-07-15T12:12:35Z

## 実行計画

イシュー種別: Story
ストーリーイシュー: #1381
サブイシュー（全4件）:
  - #2097 [Task] E2Eテストスイート作成 (1pt) depends_on: なし — task_type: e2e_test_creation
  - #2098 [Task] feature-dev 呼び出し手順の調査・SKILL.md 改訂 (1pt) depends_on: なし
  - #2099 [Task] フォールバック手順の定義と E2E テスト更新 (1pt) depends_on: #2098
  - #2100 [Task] 機能仕様書更新 (1pt) depends_on: #2098, #2099 — task_type: spec_update

即着手可能（depends_onなし）:
  - #2097, #2098

ブロック中（depends_on待ち）:
  - #2099 ← #2098 の [Auditor GREEN] 待ち
  - #2100 ← #2098, #2099 の [Auditor GREEN] 待ち

---
⚠️ 設計上の懸念（実装前に #2098 で調査すること）:
feature-dev には "architect" サブコマンドは存在せず、フェーズ3・5で人間インタラクションが必要。
自動フローに埋め込む際は `Explore` サブエージェント等の同等手段を検討すること。

[親ブランチ作成済み] feature/issue-1381
次回のセッションで /xp_Director 2097 を実行してください。

---

### noragrammer-crypto — 2026-07-16T12:12:27Z

サブイシュー #2097 完了。残り: #2098, #2099, #2100

---

### noragrammer-crypto — 2026-07-16T13:25:04Z

サブイシュー #2098 完了（PR #2119 発行済み、`feature/issue-1381` へマージ待ち）。残り: #2099, #2100

---

### noragrammer-crypto — 2026-07-17T00:14:28Z

サブイシュー #2100 完了。PR #2138 を `feature/issue-1381` ベースで発行済み。

全サブイシュー（#2098, #2099, #2100）の [Auditor GREEN] / [Auditor doc OK] が揃いました。
次回 `/xp_Director 1381` で AllGREEN フローを実行してください。

---

### noragrammer-crypto — 2026-07-17T01:22:38Z

[Auditor GREEN]

### Story-level E2E テスト結果（`SoloXP`）

コマンド: `cd SoloXP && npm run test:e2e`（`jest --testPathPattern=tests/e2e`）

- 本Storyの受け入れテスト `tests/e2e/issue-1381-xp-architect-feature-dev.test.js`: **PASS 14/14**（全AC GREEN）
- スイート全体: 18 suites中16 PASS / 2 FAIL、216 tests中213 PASS / 3 FAIL

### FAIL 2件の切り分け（スコープ外・既知）

いずれも本Storyの変更（`xp_Architect` step3のcode-architect委譲）とは無関係な既存不具合で、既に別バグイシューとして起票・追跡済み:

- `tests/e2e/issue-1410-worklog-markers.test.js` → #2059（xp_Director SKILL.md の AllGREEN セクション記述の欠落）
- `tests/e2e/issue-254-workflow-update.test.js` → #2060（xp_review_workflow SKILL.md の逸脱イシュー特定ロジック記述の欠落）

PR #2133 の Test plan 記載時点でも同一条件（`git stash` で本Story差分を除いた `origin/feature/issue-1381`）で再現することを確認済みであり、本Storyのマージ判断への影響なしと判断。

### 受け入れ判定

✅ Story #1381 の受け入れ条件（AC1〜AC4）は満たされている。GREEN。

xp_Director が続けて xp_Reviewer を呼び出します。

---

### noragrammer-crypto — 2026-07-17T01:25:26Z

## xp_Reviewer レポート

対象差分: `origin/main...origin/feature/issue-1381`（実質変更ファイル: `.claude/skills/xp_Architect/SKILL.md`, `SoloXP/skills/xp_Architect/SKILL.md`, `dotfiles/.claude/skills/xp_Architect/SKILL.md`, `SoloXP/docs/spec/xp_architect.md`, `SoloXP/tests/e2e/issue-1381-xp-architect-feature-dev.test.js`, `SoloXP/docs/tests/E2ETests/issue-1381-xp-architect-feature-dev.md`, `SoloXP/docs/issues/issue-209{7,8,9}.MD`, `issue-2100.MD`）

### 高リスク指摘（High Risk）
なし

### 中程度・低リスク指摘

- **[Low] ブランチ差分のノイズ**: `git diff origin/main...origin/feature/issue-1381 --stat` には `wiki/`・`ProcessTaskIssue`・`bookmark_save`・`CLAUDE.md` 等、本Story無関係のファイルも変更ありとして表示される（`feature/issue-1381` のブランチ履歴に他セッション由来と見られるコミット `2b22986`/`a59baa2`/`5948912` が混入しているため）。ただし個別に内容diffを取ったところ、`CLAUDE.md` の軽微な差分（JST表記追加、mainが後発で非競合）を除き**全て main と内容が完全一致**しており、実質的な変更内容は上記の xp_Architect 関連ファイルのみ。main へのマージ時に実害はないが、次回以降ブランチ作成時のベース選定を見直す余地あり（対応不要・観察事項として記録）。

### 総評

`code-architect` サブエージェント呼び出しへの委譲という設計判断が SKILL.md と spec 両方に一貫して反映されており、出力→xp実行計画の変換ルール（depends_on/task_type マッピング表）、フォールバック発動条件・確認手順も具体的に明記されている。ドキュメントのみの変更でコード実行ロジックへの影響はなく、E2E受け入れテスト14件も全GREEN。品質上の懸念なし。

高リスク指摘なし。改善勧告イシューの起票は不要。

---

### noragrammer-crypto — 2026-07-17T01:26:18Z

[Auditor ドキュメントチェック中]

### ドキュメントチェック結果
- spec/README.md: OK — `xp_architect.md` への索引エントリが既存のまま正しく維持されている
- spec/xp_architect.md: OK — step3 の code-architect 委譲・マッピング表・フォールバック手順・バージョン履歴 v1.2.0 の記載を確認（#2100 で既にAuditor doc OK済み）
- reference/: 対象なし（このStoryはreference文書の対象外）
- issue2mdログ: **NG: 欠落** — `SoloXP/docs/issues/issue-1381.MD`（Story自身のログ）が存在しない。サブタスク（#2097〜#2100）の issue2md ログは揃っているが、親ストーリー #1381 自体のログが未生成。

[Auditor doc NG: issue2mdログ]
対象: SoloXP/docs/issues/issue-1381.MD
理由: 欠落
xp_Director は xp_issue2md による Story #1381 自身のログ生成を実施してください。

---
