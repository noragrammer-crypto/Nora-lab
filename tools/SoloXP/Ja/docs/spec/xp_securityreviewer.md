# xp_SecurityReviewer 機能仕様書

## 概要

xp_SecurityReviewer はセキュリティレビュースキル。
xp_Director が AllGREEN・E2E GREEN 確認後、`xp_Reviewer`（コードレビュー）に続けて呼び出し、
PR 発行前にセキュリティ観点でのレビューを実施する。

`xp_Reviewer` がバグ・品質・規約観点のレビューを担うのに対し、xp_SecurityReviewer は
インジェクション・認証認可・シークレット漏洩・依存関係の既知脆弱性等のセキュリティ観点に特化する。

---

## コマンド

| コマンド | 説明 |
|---|---|
| `xp_SecurityReviewer <epic> <issue>` | 現在の PR・ブランチをセキュリティレビューし、結果をイシューコメントとして記録する |

---

## 呼び出しタイミング

xp_Director の AllGREEN フローから、`xp_Reviewer` の直後・`xp_Auditor doc` の前に呼び出される：

```
AllGREEN（全サブイシュー完了マーカー確認）
  → xp_Auditor test（Story-level 受け入れテスト） → ✅ GREEN
  → xp_Reviewer（コードレビュー）
  → xp_SecurityReviewer（セキュリティレビュー）
  → xp_Auditor doc（ドキュメントチェック）
  → xp_RunE2ETests（E2Eテストスイート確認）
  → spec_update完了確認・全サブタスクPRマージ確認
  → main向けPR発行 → イシュークローズ
```

詳細な手順・ゲート条件は `xp_director.md`「AllGREEN → xp_Auditor Story-level 委譲フロー」を参照。

---

## レビュー実行手段

組み込みスキル `security-review`（`/security-review`）を Skill tool 経由で呼び出す。
呼び出し不可時（ツール未対応・エラー・空応答）は、エラー内容を記録した上でレビューをスキップし、
xp_Director にその旨を報告する（PR発行はブロックしない）。この場合もイシューコメント内で
`[SecurityReviewer完了]` を明示的に記録する（通常経路の手順3・4を経由しないため、記録漏れを防ぐ目的）。

---

## リスク分類と対応

| security-review 出力 | xp リスク分類 | 対応 |
|---|---|---|
| Critical・High（悪用可能な脆弱性、シークレット漏洩、認証・認可の欠陥等） | 高リスク（High Risk） | イシューコメント記録 + 改善勧告イシューを自動起票（ラベル: `bug`） |
| Medium（防御的だが改善余地のある実装等） | 中程度（Medium Risk） | イシューコメントのみ（ユーザーアクション不要） |
| Low・Info（軽微な指摘） | 低リスク（Low Risk） | イシューコメントのみ（ユーザーアクション不要） |

---

## ステージコメント

レビュー開始時に `[SecurityReviewer実行中]`、レポート記録（該当する場合は改善勧告イシュー起票）
完了後に `[SecurityReviewer完了]` をイシューに記録する。

---

## アウトプット

### イシューコメント（必須）

```markdown
## xp_SecurityReviewer レポート

### 高リスク指摘（High Risk）
<指摘一覧。なければ「なし」>

### 中程度・低リスク指摘
<指摘一覧。なければ「なし」>

### 総評
<全体的なセキュリティ評価>
```

### 改善勧告イシュー（高リスク時のみ）

高リスク指摘 1 件につき 1 イシューを自動起票する：
- タイトル: `[改善勧告] <指摘の概要>`
- ラベル: `bug`

改善勧告イシューの起票（`gh issue create`）は、`gh` が使えない環境（ClaudeCodeWeb等）では
`mcp__github__issue_write`（method: `create`, labels: [`bug`]）にフォールバックする
（`xp_issue2md`〈#3204〉で確立したパターン。#3216）。

---

## 注意事項

- 高リスク指摘の起票のみで作業をブロックしない（`xp_Reviewer` と同様、改善勧告イシューとして別途起票し現在のPR発行自体は妨げない）
- 中程度以下のリスクはユーザーアクション不要（現状維持）
- コードファイルへの直接書き込みは行わない

---

## 変更履歴

| 日付 | バージョン | 変更内容 | Issue |
|---|---|---|---|
| 2026-08-20 | 1.0.0 | 新規作成 | #1688, #3026 |
| 2026-08-20 | 1.1.0 | ステージコメント（`[SecurityReviewer実行中]`/`[SecurityReviewer完了]`）を追加 | #1688, #3027 |
| 2026-08-20 | 1.2.0 | 呼び出しタイミング図を実際のAllGREENフロー順序（xp_Auditor doc・xp_RunE2ETests等を含む）に修正 | #1688, #3029 |
| 2026-08-20 | 1.2.1 | security-review呼び出し不可時のフォールバック経路で `[SecurityReviewer完了]` の記録漏れを修正（通常経路の手順3・4を経由しないため明示化） | #1688, PR #3034 |
| 2026-08-29 | 1.3.0 | 改善勧告イシュー起票の `gh issue create` に `mcp__github__issue_write` フォールバックを追記 | #3205, #3216 |
