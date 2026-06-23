# codecompass-to-issues 仕様

## 概要

`codecompass/actions.md`（`refactoring-proposal.js` の出力）を読み込み、
リファクタリング提案を GitHub Issue として自動発行する。

関連イシュー: [#1441](../issues/issue-1441.MD)（codecompass-to-issues スクリプト実装）

---

## lib/codecompass-to-issues.js

### parseActionsMd(content)

`actions.md` の全文から `## リファクタリング提案` セクション以下の
`### \`<filepath>\`` エントリをすべてパースして返す。

**引数**

| 引数 | 型 | 説明 |
|------|----|------|
| `content` | `string` | actions.md の全文（空文字・null も可） |

**返り値**

```json
[
  { "file": "DiscordAIbot/lib/persona.js", "hotspot_score": 2.0676 },
  { "file": "DiscordAIbot/lib/discord.js", "hotspot_score": 2.0455 }
]
```

**パース対象フォーマット**

`## リファクタリング提案` セクション内の以下の形式を認識する：

```markdown
### `path/to/file.js`

- hotspot_score: **2.0676**
```

`## リファクタリング提案` セクションがない場合は空配列を返す。
`hotspot_score` が取得できないセクションはスキップする。

---

### buildIssueTitle(file, hotspot_score)

ファイルパスとスコアから GitHub Issue のタイトルを生成する。

**引数**

| 引数 | 型 | 説明 |
|------|----|------|
| `file` | `string` | ファイルパス |
| `hotspot_score` | `number` | ホットスポットスコア |

**返り値**

```
[Refactoring] <file> のリファクタリング（hotspot_score: <score>）
```

例: `[Refactoring] DiscordAIbot/lib/persona.js のリファクタリング（hotspot_score: 2.0676）`

---

### createIssues(proposals, options)

proposals を GitHub Issue として発行する。
`dryRun: true` の場合は発行せず対象配列を返すのみ。

**引数**

| 引数 | 型 | 説明 |
|------|----|------|
| `proposals` | `Array<{file, hotspot_score}>` | parseActionsMd の出力 |
| `options.limit` | `number` | 発行上限件数（先頭から取る） |
| `options.dryRun` | `boolean` | true の場合は Issue 発行をスキップ |
| `options.repo` | `string` | GitHub リポジトリ（`owner/repo` 形式） |

**返り値**

発行（または dry-run で対象選択）した proposals の配列（`proposals.slice(0, limit)`）。

**Issue 発行仕様**

| 項目 | 値 |
|------|----|
| タイトル | `buildIssueTitle(file, hotspot_score)` の結果 |
| ラベル | `refactoring,codecompass-detected` |
| 本文 | 自動生成（file・hotspot_score を記載） |

`gh issue create` を `child_process.execSync` 経由で実行する。

---

## scripts/codecompass-to-issues.js

### 使い方

```bash
node CodeCompass/scripts/codecompass-to-issues.js \
  [--actions=<path>]  (省略時: codecompass/actions.md)
  [--limit=<n>]       (省略時: 5)
  [--dry-run]         イシューを発行せず対象一覧を stdout に出力
```

### 前提条件

- `codecompass/actions.md` が最新状態であること（事前に `refactoring-proposal.js` を実行済み）

### 出力例（dry-run）

```
dry-run: 3 issues would be created
  [Refactoring] DiscordAIbot/lib/persona.js のリファクタリング（hotspot_score: 2.0676）
  [Refactoring] DiscordAIbot/lib/discord.js のリファクタリング（hotspot_score: 2.0455）
  [Refactoring] DiscordAIbot/lib/claude.js のリファクタリング（hotspot_score: 1.6981）
```

### エラー処理

`actions.md` が見つからない場合は stderr にメッセージを出力して exit 1 する。
