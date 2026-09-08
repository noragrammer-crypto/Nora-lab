---
issue: 1565
title: "[Task] xp_Architect: 種別判定をストーリー軸に再定義 + Task直行時のE2E/spec要否明示判定を必須化"
state: closed
labels: [task, epic/SoloXP, PriorityHigh]
author: noragrammer-crypto
created_at: 2026-06-20T18:07:29Z
epic: SoloXP
---

# #1565 [Task] xp_Architect: 種別判定をストーリー軸に再定義 + Task直行時のE2E/spec要否明示判定を必須化

## 本文

## 概要
ストーリー #1557 の改善提案B。

- 種別分類基準に「ユーザー/外部から観測可能な振る舞いの変更を伴うか（＝受け入れ条件を書けるか）」を Story判定の第一基準として明記する。規模（タスク数）は副次基準に下げる。
- 単発 `[Task]` を処理する場合も、E2Eテスト要否・仕様書更新要否を必ず明示的に判定し、その判定理由をイシューにコメントとして記録することを必須化する。観測可能な振る舞い変更を伴う Task には Story と同様に E2E/spec タスクを付随させる。
- 編集対象: `dotfiles/.claude/skills/xp_Architect/SKILL.md` と `SoloXP/skills/xp_Architect/SKILL.md`（同期必須）

## 見積もり
2pt

## 依存関係
なし（即着手可能）

## 親ストーリー
#1557

## 親ブランチ
feature/issue-1557

## コメント

### noragrammer-crypto — 2026-06-20T22:47:49Z

タスク粒度の作業内容の場合は特にサブイシュー分解する必要はなく、そのスレッドで処理するルートを明記、TODOツールにてきちんと対応タスクが実行されることをディレクターに伝えること。

---

### noragrammer-crypto — 2026-06-20T23:51:48Z

作業開始 2026-06-21 00:00
[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-06-20T23:52:04Z

## テスト実行結果

タスク種別判定: ドキュメントのみの変更（`dotfiles/.claude/skills/xp_Architect/SKILL.md` と `SoloXP/skills/xp_Architect/SKILL.md` の記述更新のみ）

スキップ: Unit / Functional / E2E すべて — テスト対象コードなし（SKILL.md は実行可能コードではなく、Director/Architect が読み込む記述ドキュメント）

備考: この変更内容を検証する「SKILL.md 記述の存在チェック」ユニットテストは別タスク #1568（e2e_test_creation）で `SoloXP/tests/unit/` に追加される予定。本タスクではテスト作成は行わない。

---

### noragrammer-crypto — 2026-06-20T23:52:13Z

[Implementer実行中]

---

### noragrammer-crypto — 2026-06-20T23:53:53Z

## 実装完了

変更ファイル:
- `dotfiles/.claude/skills/xp_Architect/SKILL.md`: 種別分類基準（手順1）に「観測可能な振る舞いの変更を伴うか」を第一基準として明記し、タスク数/規模を副次基準に降格。新設の手順1-1で `[Task]` イシューに対するE2E/spec要否判定の必須化（判定理由をイシューコメントに記録）を追加。手順5の必須追加タスク見出しを Story に加えて「観測可能な振る舞い変更を伴うTask」にも適用するよう拡張。
- `SoloXP/skills/xp_Architect/SKILL.md`: 上記と同一内容を同期（dotfiles版とdiffなし）。

テスト結果:
- 単体テスト: PASS 94件 / FAIL 0件（`SoloXP/tests/unit/`、ドキュメント変更につき既存スイートに回帰なしを確認。本タスク自体はTesterフェーズで「ドキュメントのみの変更」と判定済みのため新規テストは作成していない）
- 機能テスト: 対象外（ドキュメントのみの変更）

---

### noragrammer-crypto — 2026-06-20T23:54:20Z

## /xp_RunTestSuites 結果

実行日時: 2026-06-21 00:10
ブランチ: claude/issue-processing-s9v0nz

### 単体テスト
- 結果: PASS 94件 / FAIL 0件（`SoloXP/tests/unit/` 全10スイート）
- 本タスクの変更は `dotfiles/.claude/skills/xp_Architect/SKILL.md` / `SoloXP/skills/xp_Architect/SKILL.md` のドキュメント記述のみ。既存スイートに回帰なし。

### 機能テスト
- スキップ: 本タスクはAPI・実行コードの変更を含まないため、プレビュー環境への疎通確認・機能テストは対象外（Testerフェーズでの「ドキュメントのみの変更」判定と一致）

### 総合判定
- ✅ GREEN: push 可能

---

[Auditor GREEN]
PASS: 94件 / テストコマンド: `npm run test:unit`（SoloXP）。ドキュメントのみの変更のため機能テストは対象外と判断。

---

### noragrammer-crypto — 2026-06-20T23:55:19Z

## ドキュメント生成完了

生成・更新したファイル:
- `SoloXP/docs/issues/issue-1565.MD`: イシュー本文・コメント全件を保存（`xp_issue2md`）

スキップしたステップ:
- `xp_doc_spec`: 親ストーリー #1557 の計画上、機能仕様書更新（`SoloXP/docs/spec/xp_architect.md` 等）は専用タスク #1569（depends_on: #1564,#1565,#1566,#1567）に一元化されている。実装タスクごとに spec を更新すると #1569 の役割と重複・競合するため、本タスクでは見送り、#1569 にて全実装タスク完了後にまとめて反映する。
- `xp_doc_reference` / `xp_doc_UnitTests` / `xp_doc_FunctionTests` / `xp_doc_E2ETests`: 本タスクは `SKILL.md` のドキュメント記述変更のみで、コード・テストファイルの追加変更がないため対象なし（Testerフェーズの「ドキュメントのみの変更」判定と一致）。

---

### noragrammer-crypto — 2026-06-20T23:55:46Z

[Auditor ドキュメントチェック中]

### ドキュメントチェック結果
- `dotfiles/.claude/skills/xp_Architect/SKILL.md` / `SoloXP/skills/xp_Architect/SKILL.md`: OK（両ファイル完全一致を確認、同期済み）
- `SoloXP/docs/issues/issue-1565.MD`: OK（xp_issue2mdで生成済み、本文・コメント全件を記録）
- `SoloXP/docs/spec/xp_architect.md`: 未更新（意図的）。親ストーリー #1557 の計画上、spec反映は専用タスク #1569 に一元化されているため本タスクではスキップが正当と判断。
- `SoloXP/docs/spec/README.md`: 既存の索引未掲載状態（`xp_architect.md` が未索引）は本タスク起因ではなく既知の別イシュー #1365 の範疇。本タスクのスコープ外。

[Auditor doc OK]
xp_Director がPRを発行します。

---

### noragrammer-crypto — 2026-06-20T23:56:30Z

[PR発行済み #1571]

---

### noragrammer-crypto — 2026-06-20T23:56:31Z

[ProjectStatus: Done]
作業完了 2026-06-21 00:15 / 所要時間: 15分

---
