# lib/change-frequency.js リファレンス

`git log --numstat` の集計を行う変更頻度分析エンジンの共通ライブラリモジュール。
ファイル単位の変更回数・変更行数を集計し、変更頻度（`changes`）降順でランキング化する。

---

## parseNumstatOutput(raw)

`git log --numstat` の生出力を `{ file, additions, deletions }` の配列に変換する。

### パラメータ

| 名前 | 型 | 説明 |
|------|-----|------|
| `raw` | `string` | `git log --numstat --pretty=format:"commit %H"` の標準出力 |

### 戻り値

`{ file: string, additions: number, deletions: number }[]`

- numstat 形式の行（`<additions>\t<deletions>\t<file>`）のみを抽出する
- コミットハッシュ行・著者行・空行など形式に一致しない行は無視する
- バイナリファイルを示す `-` は `0` として扱う

### 使用例

```js
const { parseNumstatOutput } = require('./lib/change-frequency');

const raw = [
  'commit abc123',
  '',
  '10\t0\ta.js',
  '5\t2\tb.js',
].join('\n');

parseNumstatOutput(raw);
// => [
//   { file: 'a.js', additions: 10, deletions: 0 },
//   { file: 'b.js', additions: 5, deletions: 2 },
// ]
```

---

## aggregateChanges(entries)

numstat エントリ群をファイル単位に集計し、変更回数（出現数）の降順でランキング化する。

### パラメータ

| 名前 | 型 | 説明 |
|------|-----|------|
| `entries` | `{ file: string, additions: number, deletions: number }[]` | `parseNumstatOutput` の戻り値 |

### 戻り値

`{ file: string, changes: number, linesChanged: number }[]`（`changes` 降順でソート済み）

- `changes`: そのファイルが変更されたコミット数（エントリ出現数）
- `linesChanged`: 追加行数 + 削除行数の合計

### 使用例

```js
const { aggregateChanges } = require('./lib/change-frequency');

aggregateChanges([
  { file: 'a.js', additions: 10, deletions: 0 },
  { file: 'b.js', additions: 5, deletions: 2 },
  { file: 'a.js', additions: 3, deletions: 1 },
]);
// => [
//   { file: 'a.js', changes: 2, linesChanged: 14 },
//   { file: 'b.js', changes: 1, linesChanged: 7 },
// ]
```

---

## fetchNumstatLog(repoPath, days)

指定リポジトリの `git log --numstat` を実行し、生出力（文字列）を返す。

### パラメータ

| 名前 | 型 | 説明 |
|------|-----|------|
| `repoPath` | `string` | 集計対象の git リポジトリパス |
| `days` | `number` | 集計対象期間（直近 N 日） |

### 戻り値

`string` — `git log --numstat --since=<days>.days --pretty=format:"commit %H"` の標準出力

### 実装メモ

`execFileSync` で `cwd: repoPath` を指定して実行する（シェル経由ではないためコマンドインジェクションの心配はない）。

---

## analyzeChangeFrequency({ repoPath, days })

指定リポジトリの変更頻度を集計するエントリポイント関数。

### パラメータ

| 名前 | 型 | デフォルト | 説明 |
|------|-----|-----------|------|
| `repoPath` | `string` | なし | 集計対象の git リポジトリパス |
| `days` | `number` | `90` | 集計対象期間（直近 N 日） |

### 戻り値

`{ file: string, changes: number, linesChanged: number }[]`（`changes` 降順）

`fetchNumstatLog` → `parseNumstatOutput` → `aggregateChanges` の順に処理する。

### 使用例

```js
const { analyzeChangeFrequency } = require('./lib/change-frequency');
const path = require('path');

const result = analyzeChangeFrequency({ repoPath: path.resolve('.'), days: 90 });
console.log(JSON.stringify(result, null, 2));
```
