# xp_Reviewer 機能仕様書

## 概要

xp_Reviewer はコードレビュースキル。
xp_Director が AllGREEN・E2E GREEN 確認後に呼び出し、PR 発行前にコードレビューを実施する。

---

## コマンド

| コマンド | 説明 |
|---|---|
| `xp_Reviewer <epic> <issue>` | 現在の PR・ブランチをレビューし、結果をイシューコメントとして記録する |

---

## 呼び出しタイミング

xp_Director の AllGREEN フローから呼び出される：

```
AllGREEN → xp_RunE2ETests → ✅ GREEN → xp_Reviewer → PR発行 → イシュークローズ
```

---

## リスク分類と対応

| リスクレベル | 対応 |
|---|---|
| 高リスク（High Risk） | イシューコメント記録 + 改善勧告イシューを自動起票（ラベル: `bug`） |
| 中程度（Medium Risk） | イシューコメントのみ（ユーザーアクション不要） |
| 低リスク（Low Risk） | イシューコメントのみ（ユーザーアクション不要） |

---

## アウトプット

### イシューコメント（必須）

```markdown
## xp_Reviewer レポート

### 高リスク指摘（High Risk）
<指摘一覧。なければ「なし」>

### 中程度・低リスク指摘
<指摘一覧。なければ「なし」>

### 総評
<全体的な品質評価>
```

### 改善勧告イシュー（高リスク時のみ）

高リスク指摘 1 件につき 1 イシューを自動起票する：
- タイトル: `[改善勧告] <指摘の概要>`
- ラベル: `bug`

---

## 注意事項

- Auditor の判断がクローズ判定の場合は親イシューをクローズして構わない
- 中程度以下のリスクはユーザーアクション不要（現状維持）
- コードファイルへの直接書き込みは行わない

---

## 関連仕様

HolyAutomater モノレポ内の以下のファイルに詳細がある（`workflow/` は Nora-lab には含まれないため、
リンクではなくモノレポ内パスとして記載する。#2643）：

- `workflow/docs/spec/xp-reviewer-skill.md` — 詳細仕様
- `workflow/docs/spec/xp-director-allgreen-pr.md` — AllGREEN フロー全体
- `workflow/docs/reference/xp-reviewer-skill.md` — コマンドリファレンス
