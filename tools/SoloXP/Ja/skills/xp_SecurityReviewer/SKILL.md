---
model: claude-sonnet-4-6
---

# XP SecurityReviewer Skill

## コマンド

### `xp_SecurityReviewer <epic> <issue>`

現在のPR・ブランチの変更に対してセキュリティレビューを実施し、結果をイシューコメントとして記録する。
重大な指摘（High Risk）は改善勧告イシューを自動起票する。

`xp_Reviewer`（コードレビュー: バグ・品質・規約観点）と責務を分離し、本スキルはセキュリティ観点
（インジェクション・認証認可・シークレット漏洩・依存関係の既知脆弱性等）に特化する。

---

## 責務

- 組み込みスキル `security-review`（`/security-review`）を呼び出してセキュリティレビューを実行する
- レビュー結果をイシューコメントとして記録する
- 重大な指摘（High Risk）については改善勧告イシューを自動起票する
- 中程度以下のリスク（Medium Risk / Low Risk）はコメントのみ（ユーザーアクション不要）

---

## 処理フロー

### 0. ステージコメントの記録

レビュー開始時にイシューへ `[SecurityReviewer実行中]` を記録する。手順3（イシューコメントへの記録）・
該当する場合は手順4（改善勧告イシュー起票）完了後に `[SecurityReviewer完了]` を記録する。

### 1. レビューの実行

**呼び出し方法:**

Skill tool で `security-review` を呼び出す（現在のブランチの pending changes、未コミットの変更が
なければベースブランチとの差分をレビュー対象とする）。

```
Skill: security-review
```

**`security-review` が呼べない場合（ツール未対応・エラー）のフォールバック:**

**発動条件（いずれか1つでも該当したら発動）:**
- Skill tool の呼び出し自体がエラー・タイムアウトで失敗する
- `security-review` が見つからない・利用不可というエラーが返る
- 呼び出しは成功したが、出力に指摘の有無が判断できる内容が一切含まれない（空応答・フォーマット崩壊）

**確認手順:**
1. 発生したエラーメッセージ、または不十分だった出力内容をそのまま記録する
2. イシューに以下を記録して xp_Director に報告する（PRはブロックしない。中断せず次のステップ〈`xp_Auditor doc`〉へ進めるよう xp_Director に委ねる）：
   ```
   ## xp_SecurityReviewer レポート

   ⚠️ security-review 呼び出し失敗
   理由: <エラー内容>
   セキュリティレビューは未実施です。手動確認を推奨します。

   [SecurityReviewer完了]
   ```
   本フォールバック経路は手順3・4（イシューコメントへの記録・改善勧告イシュー起票）を経由しないため、
   `[SecurityReviewer完了]` はこの手順2の中で明示的に記録すること（記録し忘れるとイシューが
   `[SecurityReviewer実行中]` のまま停滞して見え、AllGREENフローは先へ進んでいるのに完了状態が
   不整合になる）。

### 2. リスク分類

`security-review` の出力する指摘（重大度: Critical / High / Medium / Low 等、レビュー内容に応じた表現）を、以下の基準でxpのリスク分類にマッピングする：

| security-review 出力 | xp リスク分類 |
|---|---|
| Critical・High（悪用可能な脆弱性、シークレット漏洩、認証・認可の欠陥等） | 高リスク（High Risk） |
| Medium（防御的だが改善余地のある実装、非推奨パターン等） | 中程度（Medium Risk） |
| Low・Info（軽微な指摘、ベストプラクティス外れ） | 低リスク（Low Risk） |
| 指摘なし | なし |

| リスクレベル | 対応 |
|---|---|
| 高リスク（High Risk） | イシューコメント記録 + 改善勧告イシューを自動起票 |
| 中程度（Medium Risk） | イシューコメントのみ（ユーザーアクション不要） |
| 低リスク（Low Risk） | イシューコメントのみ（ユーザーアクション不要） |

### 3. イシューコメントへの記録

レビュー結果を以下のフォーマットでイシューコメントとして記録する（書き込み）：

```markdown
## xp_SecurityReviewer レポート

### 高リスク指摘（High Risk）
<高リスクの指摘一覧。なければ「なし」>

### 中程度・低リスク指摘
<中程度・低リスクの指摘一覧。なければ「なし」>

### 総評
<全体的なセキュリティ評価>
```

### 4. 高リスク指摘の改善勧告イシュー起票

高リスク（High Risk）な指摘が1件以上ある場合、各指摘に対して改善勧告イシューを発行（issue create）する：

```bash
gh issue create \
  --repo <owner>/<repo> \
  --title "[改善勧告] <指摘の概要>" \
  --body "<詳細な説明・影響範囲・修正方法の提案>" \
  --label "bug"
```

`gh` が使えない場合（ClaudeCodeWeb等）は `mcp__github__issue_write`（owner, repo, method: `create`, title, body,
labels: [`bug`]）にフォールバックする（`xp_issue2md`〈#3204〉で確立したパターン。#3216）。

起票したイシュー番号をレビューレポートのコメントに追記する。

---

## xp_Director からの呼び出しタイミング

`xp_Director` の AllGREENフロー（Story-level `xp_Auditor test` GREEN確認後）から、`xp_Reviewer` の直後・
`xp_Auditor doc` および `main` へのPR発行前に呼び出される。詳細は `xp_Director` SKILL.md 参照。

---

## 注意事項

- 高リスク指摘の起票のみで作業をブロックしない（改善勧告イシューとして別途起票し、現在のPRの発行自体は妨げない。xp_Reviewerと同様の運用）
- 中程度以下のリスクについてはユーザーからのアクションがない場合は現状維持
- コードファイルへの直接書き込みは行わない
