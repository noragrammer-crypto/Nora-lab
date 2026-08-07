# xp_plan 機能仕様書

## 概要

プランナーとして、ストーリーカード（Markdown）を読み込みタスク分解・コスト見積もりを行い、
結果を frontmatter の YAML として書き戻すスキル。

## コマンド

| コマンド | 説明 |
|---|---|
| `/xp_plan <storycard_path>` | ストーリーカードを読んでタスク分解と見積もりを実行する |
| `/xp_plan <storycard_path> --reestimate` | 既存の見積もりを再評価し、estimate_history に追記する |

## 処理フロー

### 1. ストーリーカードを読み込む

指定パスの Markdown を読み、既存 frontmatter とストーリー本文（実装すべき内容）を把握する。

### 2. タスク分解

以下の観点でタスクを分解する：設計・仕様確定 / 実装（機能ごとに細分化） / テスト / ドキュメント更新。
タスクの粒度目安：1タスク = 1〜4pt（1pt ≈ 半日〜1日作業）。

各タスクについて以下を明示する：

- **`depends_on`（依存関係）**: 他タスク完了が前提のタスクに記載する。インターフェース・スタブ未確定のタスクは必須。依存がなければ省略可。
- **`verifies`（受け入れ条件対応）**: このタスクが満たすストーリーの受け入れ条件（Acceptance Criteria）の ID または該当文言を記載する。**全タスクで必須項目、省略不可**。どの受け入れ条件にも紐づかないタスク（内部リファクタ・準備作業等）は `verifies: none（理由）` と明示する。

### 3. コスト見積もり

各タスクにストーリーポイント（pt）を付与し、見積もり根拠を簡潔に記録する。

### 4. frontmatter に書き戻す

#### 初回実行時

```yaml
---
title: <タイトル>
epic: <エピック名（推定またはユーザー指定）>
status: backlog
estimate:
  total: <合計pt>
  breakdown:
    - task: <タスク名>
      pt: <pt>
      note: <根拠・懸念点>
      depends_on: <このタスクの前に完了が必要なタスク名またはイシュー番号（なければ省略）>
      verifies: <このタスクが満たす受け入れ条件のID/文。紐づかない場合は none（理由）>
estimate_history:
  - date: <YYYY-MM-DD>
    total: <合計pt>
    reason: 初期見積もり
---
```

#### `--reestimate` 時

`estimate` を新しい見積もりで上書きし、`estimate_history` に追記する（上書きしない）：

```yaml
estimate_history:
  - date: <旧日付>
    total: <旧pt>
    reason: <旧理由>
  - date: <新日付>
    total: <新pt>
    reason: <再見積もり理由>
```

## 出力形式

実行後、以下をコンソールに表示する：

```
## タスク分解結果

| タスク | pt | 備考 | 依存 | verifies |
|--------|-----|------|------|------|
| 設計   | 2  | API仕様確認が必要 | なし | none（設計確認のみ） |
| 実装   | 5  | ... | 設計完了後 | AC-1 |
| テスト | 2  | ... | 実装完了後 | AC-1, AC-2 |

合計: 9pt

ストーリーカードを更新しました: StoryCards/backlog/xxx.md
```

## ディレクトリ規約

```
api/<EpicName>/stories/
  backlog/      # 未着手
  in_progress/  # 実装中（GitHub Issue化済み）
  done/         # 完了
```

- ファイル名はスネークケース推奨: `persona_setting.md`
- フォルダ移動 = ステータス変更

## 連携コマンド

- `/xp_Architect <story_issue_number>`: ストーリーイシューからサブイシューを発行（`estimate.breakdown` の `verifies` を引き継ぐ）
- `/xp_move <storycard_path> <status>`: ストーリーカードをフォルダ間移動

## 注意事項

- エピック名が不明な場合はユーザーに確認する
- 見積もりはあくまで推定。実装中に変わることを前提とする
- `--reestimate` は意図的な再評価時のみ使用（自動実行しない）

## 変更履歴

| 日付 | バージョン | 変更内容 | Issue |
|---|---|---|---|
| 2026-06-21 | 1.0.0 | 新規作成。タスク分解の観点に `verifies`（受け入れ条件対応）フィールドを必須項目として追加 | #1557, #1564 |
