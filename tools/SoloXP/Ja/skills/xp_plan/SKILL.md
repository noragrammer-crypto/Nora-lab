# XP Planner Skill

## 概要
XPのストーリーカード（Markdown）を読み込み、タスク分解・コスト見積もりを行い、
結果をfrontmatterのYAMLとして書き戻すSkill。

## コマンド

### `/xp_plan <storycard_path>`
ストーリーカードを読んでタスク分解と見積もりを実行する。

### `/xp_plan <storycard_path> --reestimate`
既存の見積もりを再評価し、estimate_historyに追記する。

---

## 動作手順

### 1. ストーリーカードを読み込む
- 指定されたパスのMarkdownファイルを読む
- frontmatterのYAMLがあれば既存情報として把握する
- ストーリー本文から実装すべき内容を理解する

### 2. タスク分解
以下の観点でタスクを分解する：
- 設計・仕様確定
- 実装（機能ごとに細分化）
- テスト
- ドキュメント更新

タスクの粒度目安：1タスク = 1〜4pt（1pt ≈ 半日〜1日作業）

各タスクについて**依存関係（ブロック）**を明示する：
- 他のタスクが完了していないと着手できない場合は `depends_on` に記載する
- インターフェース・スタブが未確定のタスクは必ず依存関係を設定する
- 依存がない場合は省略してよい

各タスクについて**このタスクが満たすストーリーの受け入れ条件（verifies）**を明示する：
- ストーリーの受け入れ条件（Acceptance Criteria）のID または該当箇所の文言を `verifies` に記載する
- どの受け入れ条件にも紐づかないタスク（内部リファクタ・準備作業等）は `verifies: none（理由）` と明示する
- `verifies` は全タスクで必須項目。省略不可

### 3. コスト見積もり
各タスクにストーリーポイント（pt）を付与する。
見積もり根拠も簡潔に記録する。

### 4. frontmatterに書き戻す

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
- `estimate` を新しい見積もりで上書き
- `estimate_history` に追記（上書きしない）

```yaml
estimate_history:
  - date: <旧日付>
    total: <旧pt>
    reason: <旧理由>
  - date: <新日付>
    total: <新pt>
    reason: <再見積もり理由>
```

---

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

---

## ディレクトリ規約

```
api/<EpicName>/stories/
  backlog/      # 未着手
  in_progress/  # 実装中（GitHub Issue化済み）
  done/         # 完了
```

- ファイル名はスネークケース推奨: `persona_setting.md`
- フォルダ移動 = ステータス変更

---

## 連携コマンド

- `/xp_Architect <story_issue_number>` : ストーリーイシューからサブイシューを発行
- `/xp_move <storycard_path> <status>` : ストーリーカードをフォルダ間移動

---

## 注意事項

- エピック名が不明な場合はユーザーに確認する
- 見積もりはあくまで推定。実装中に変わることを前提とする
- `--reestimate` は意図的な再評価時のみ使用（自動実行しない）
