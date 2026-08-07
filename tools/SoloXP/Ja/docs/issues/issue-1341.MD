---
issue: 1341
title: "[Task] SKILL.md内容アサート型テストの方針見直し（脆弱テストの構造的削減）"
state: open
labels: [task, epic/SoloXP]
author: noragrammer-crypto
created_at: 2026-06-13T00:54:50Z
epic: SoloXP
---

# #1341 [Task] SKILL.md内容アサート型テストの方針見直し（脆弱テストの構造的削減）

## 本文

## 内容

SKILL.mdの文言・セクション構成をアサートするテストが、スキル改善のたびに壊れる構造問題を解消する。

## 背景

同型のバグイシューが累積している:
- #1313（NovelGeneratorRun SKILL.md変更にテスト追随できず）
- #1301 / #1302（LLMwiki settings.json変更・wiki未生成で失敗）
- #1291〜#1294（SoloXP 4スイート14テスト）
- #1279（xp_Auditor セクション番号変更で失敗）

プロンプト内容のアサートは「実装の写経」であり、仕様変更のたびに二重メンテが発生する。
AI運用に専念するための時間が、このテスト保守に構造的に吸われ続けている（2026-06-13 経営レビュー）。

## 検討方針

- [ ] テスト対象を「文言一致」から「構造・契約」に変える（例: 必須セクションの存在、frontmatterスキーマ、参照ファイルの実在）
- [ ] 文言依存テストの棚卸しと削除/書き換え基準の策定
- [ ] 上記の同型バグイシュー群をこの方針でまとめて解消できるか評価
- [ ] テスト作成ガイド（xp_UnitTest等のスキル）に「SKILL.md文言をアサートしない」原則を追記

## 完了条件

- テスト方針がドキュメント化され、既存の同型バグイシューの処理方針が決まっている

## コメント

### noragrammer-crypto — 2026-06-21T18:04:15Z

## 観測可能変更チェック（[Task]スキップ判定）

対象: #1341
観測可能な振る舞いの変更: なし
理由: SKILL.md文言アサート型テストの方針見直し・ドキュメント化が目的であり、外部APIやUI、出力内容など利用者から観測可能な振る舞いの変更を伴わない（テスト構造・ガイドドキュメントの内部変更のみ）。

→ Architect をスキップし、実行フロー（xp_Tester/xp_Implementer/xp_Auditor/xp_Documenter）へ進みます。

---

### noragrammer-crypto — 2026-06-21T18:04:20Z

作業開始 2026-06-21 18:04
[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-06-21T18:04:38Z

[Tester実行中]

## テスト実行結果

本タスクはテスト方針の検討・ドキュム化が完了条件であり、実装コード（アプリケーションロジック）の追加・変更を伴わない。
「ドキュメントのみの変更」に該当するため、Unit/Functional/E2E の全層をスキップする。

スキップ: Unit/Functional/E2E — テスト対象コードなし（方針ドキュメントの策定タスクのため）

[Tester完了]

---

### noragrammer-crypto — 2026-06-21T18:04:47Z

[Implementer実行中]

---

### noragrammer-crypto — 2026-06-21T18:10:17Z

## 実装完了

本タスクはテスト方針の検討・ドキュム化（実装コード変更なし）。

### テスト方針（原則7として追加）

`SoloXP/docs/spec/tdd_principles.md` に「7. SKILL.md文言をアサートしない（構造・契約テストの原則）」を追加：
- ❌ 避けるべきパターン: 文言・段落・コードブロック本文の固定アサート、見出し番号依存の正規表現抽出
- ✅ 採用すべきパターン: frontmatterスキーマ検証、必須セクション存在の柔軟マッチ、参照ファイル実在確認、ドキュメント間索引整合性
- 棄却/書き換え判断フロー: 「セクション存在」契約への書き換え可否 → 不可なら文言テストとして明示的に残し運用ルールでカバー

### ガイドへの原則追記

`xp_UnitTest` / `xp_FunctionalTest` / `xp_E2Etest` の SKILL.md（`dotfiles/.claude/skills/` と `SoloXP/skills/` の両コピー、計6ファイル）の「注意事項」に原則7への参照を追加。

### 既存同型バグイシュー群の処理方針評価

- #1313（CLOSED）/ #1279（CLOSED）: 解消済み、本方針の実例として参照のみ
- **#1294**: 本方針の直接対象と判断。テストを更新する方針（A）を採用し、対象テストごとの修正方針をイシューにコメント済み
- #1301 / #1302: 設定・wikiデータ起因のドリフトであり方針の対象外と判断、コメント済み
- #1292 / #1293: Vercelプレビュー URL構築・E2E実行フロー分類の問題であり方針の対象外と判断、コメント済み

変更ファイル:
- `SoloXP/docs/spec/tdd_principles.md`: 原則7追加
- `dotfiles/.claude/skills/{xp_UnitTest,xp_FunctionalTest,xp_E2Etest}/SKILL.md`: 注意事項に追記
- `SoloXP/skills/{xp_UnitTest,xp_FunctionalTest,xp_E2Etest}/SKILL.md`: 注意事項に追記（dotfiles版と同期）

テスト結果:
- `npm test`（SoloXP）: 5 failed, 25 passed / 14 failed, 289 passed（変更前と同一の失敗数 = #1294 由来の既知の失敗であり本タスクの変更による影響なしを確認）

[Implementer完了]

---

### noragrammer-crypto — 2026-06-21T18:10:45Z

[Auditor テスト実行中]

## /xp_RunTestSuites 結果

実行日時: 2026-06-21 18:10
ブランチ: claude/elegant-goldberg-topiux

### 単体テスト
- 結果: PASS 106件 / FAIL 0件

### 機能テスト
- 結果: PASS 20件 / FAIL 0件

### E2E
- 本タスクはタスクイシュー（ストーリーではない）のためスキップ

### 既存の既知の失敗（参考・本タスクと無関係）
- `npm test`（全体）は #1294 由来の既存failure（5 suites / 14 tests）が変更前後で同数であることを確認済み（本タスクのドキュメント変更による新規RED発生なし）

[Auditor GREEN]
PASS: 126件 / テストコマンド: `npm run test:unit && npm run test:functional`

---

### noragrammer-crypto — 2026-06-21T18:11:30Z

[Documenter実行中]

## ドキュメント生成完了

生成・更新したファイル:
- `SoloXP/docs/issues/issue-1341.MD`: 本Issueの本文・コメント全履歴を転写（xp_issue2md）
- `SoloXP/docs/spec/tdd_principles.md`: 原則7「SKILL.md文言をアサートしない」を追加（xp_doc_spec、既存ファイルへの積分）

スキップしたステップ（対象なしのため no-op）:
- `xp_doc_reference`: クラス・関数の変更なし（ドキュメントのみの変更）
- `xp_doc_UnitTests` / `xp_doc_FunctionTests` / `xp_doc_E2ETests`: テストファイルの新規追加・変更なし（本タスクはテスト方針のドキュメント化のみ）

[Documenter完了]

---

