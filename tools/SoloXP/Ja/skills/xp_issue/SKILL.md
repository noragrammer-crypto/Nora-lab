---
model: claude-opus-4-6
---

# XP Issue Skill

## コマンド

### `/xp_issue <storycard_path>`

ストーリーカード（Markdown）を読み込み、GitHub にストーリーイシューを作成する。
タスクへの分解・サブイシューの発行は行わない（それは `xp_Architect` の責務）。

---

## 動作手順

### 1. ストーリーカードを読み込む

- 指定パスの Markdown ファイルを読む
- frontmatter から以下を取得する：
  - `title` : イシュータイトル
  - `epic` : エピック名（ラベルに使用）
  - `estimate.total` : 合計見積もり（あれば）
- 本文からストーリーの背景・受け入れ条件を把握する

### 2. ストーリーイシューを作成

以下の形式で GitHub Issue を作成する：

```
タイトル: [Story] <title>

## ストーリー
<ストーリーカードの本文をそのまま転写>

## 受け入れ条件
<ストーリーカードの受け入れ条件セクション>

## 見積もり
合計: <total>pt
（estimate.total がない場合は省略）
```

ラベル: `story`, `epic/<epic名>` を付与する。
ラベルが存在しない場合は `gh label create` で作成してから付与する。

### 3. ストーリーカードの frontmatter を更新

```yaml
github_issue: <ストーリーイシュー番号>
status: open
```

---

## 出力形式

実行後、以下をコンソールに表示する：

```
## Issue 作成完了

ストーリーイシュー: #<番号> [Story] <title>
URL: https://github.com/<owner>/<repo>/issues/<番号>

ストーリーカードを更新しました: <path>

次のステップ:
  タスク分解が必要な場合: /xp_Architect <番号>
  見積もりが未完の場合:   /xp_plan <storycard_path>
```

---

## 注意事項

- GitHub リポジトリは `gh repo view` で自動検出する
- `estimate.total` が frontmatter に存在しない場合でもイシュー作成は進める
- `github_issue` が既に設定されている場合は上書き前にユーザーに確認する
- イシュー作成中にエラーが発生した場合は即座に報告して終了する
