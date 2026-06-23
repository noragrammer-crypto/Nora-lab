# codecompass-to-issues

`CodeCompass/lib/codecompass-to-issues.js`

actions.md をパースして GitHub Issue を自動発行するモジュール。

---

## parseActionsMd(content)

`actions.md` の全文から `## リファクタリング提案` セクション内の
`### \`<filepath>\`` エントリをパースして返す。

**パラメータ**

| 名前 | 型 | 説明 |
|------|----|------|
| `content` | `string` | actions.md の全文 |

**返り値**

`Array<{ file: string, hotspot_score: number }>`

**使用例**

```js
const { parseActionsMd } = require('./lib/codecompass-to-issues');
const fs = require('fs');

const content = fs.readFileSync('codecompass/actions.md', 'utf8');
const proposals = parseActionsMd(content);
// → [{ file: 'DiscordAIbot/lib/persona.js', hotspot_score: 2.0676 }, ...]
```

---

## buildIssueTitle(file, hotspot_score)

ファイルパスとスコアから GitHub Issue タイトル文字列を生成する。

**パラメータ**

| 名前 | 型 | 説明 |
|------|----|------|
| `file` | `string` | ファイルパス |
| `hotspot_score` | `number` | ホットスポットスコア |

**返り値**

`string` — `[Refactoring] <file> のリファクタリング（hotspot_score: <score>）`

**使用例**

```js
const { buildIssueTitle } = require('./lib/codecompass-to-issues');

buildIssueTitle('DiscordAIbot/lib/persona.js', 2.0676);
// → '[Refactoring] DiscordAIbot/lib/persona.js のリファクタリング（hotspot_score: 2.0676）'
```

---

## createIssues(proposals, options)

proposals を GitHub Issue として発行する非同期関数。

**パラメータ**

| 名前 | 型 | 説明 |
|------|----|------|
| `proposals` | `Array<{file, hotspot_score}>` | parseActionsMd の出力 |
| `options.limit` | `number` | 発行上限件数 |
| `options.dryRun` | `boolean` | true の場合 Issue 発行をスキップ |
| `options.repo` | `string` | `owner/repo` 形式のリポジトリ名 |

**返り値**

`Promise<Array<{file, hotspot_score}>>` — 対象として選択した proposals（`proposals.slice(0, limit)`）

**依存関係**

`child_process.execSync` 経由で `gh issue create` を実行する。

**使用例**

```js
const { parseActionsMd, createIssues } = require('./lib/codecompass-to-issues');
const fs = require('fs');

const content = fs.readFileSync('codecompass/actions.md', 'utf8');
const proposals = parseActionsMd(content);

// dry-run
await createIssues(proposals, { limit: 5, dryRun: true, repo: 'owner/repo' });

// 実際に発行
await createIssues(proposals, { limit: 5, dryRun: false, repo: 'owner/repo' });
```
