# lib/complexity-score.js リファレンス

AST 解析による複雑度スコアリングエンジンの共通ライブラリモジュール。
リポジトリ配下の `.js` / `.py` ファイルを再帰的に走査し、制御フロー文（`if`/`for`/`while`/`switch` 等）の
出現数を「複雑度スコア」として算出する。LOC（行数）と合わせて `{ file, complexity, loc }` を返す。

---

## countLines(source)

行数（LOC）を数える。

### パラメータ

| 名前 | 型 | 説明 |
|------|-----|------|
| `source` | `string` | 対象ファイルのソース文字列 |

### 戻り値

`number` — 改行（`\n`）区切りの行数

- 末尾が空行（末尾改行による）の場合はそれを1行として数えない
- 空文字列に対しては `0` を返す

### 使用例

```js
const { countLines } = require('./lib/complexity-score');

countLines('a\nb\nc\n'); // => 3
countLines('a\nb\nc');   // => 3
countLines('');          // => 0
```

---

## walkAst(node, visit)

ESTree 形式の AST を再帰的に走査し、出現したノードごとに `visit` を呼び出す汎用ウォーカー。

### パラメータ

| 名前 | 型 | 説明 |
|------|-----|------|
| `node` | `object` | `type` プロパティを持つ ESTree 形式の AST ノード |
| `visit` | `(node: object) => void` | ノードごとに呼び出されるコールバック |

### 戻り値

`void`

- `node` が `type` プロパティを持つオブジェクトでない場合は何もしない
- 配列プロパティ・オブジェクトプロパティの両方を再帰的に走査する

### 使用例

```js
const acorn = require('acorn');
const { walkAst } = require('./lib/complexity-score');

const ast = acorn.parse('if (x) { y(); }', { ecmaVersion: 'latest' });
const types = [];
walkAst(ast, (node) => types.push(node.type));
// => ['Program', 'IfStatement', 'Identifier', 'BlockStatement', ...]
```

---

## countJsComplexity(source)

JS ソースを Acorn で AST 解析し、制御フロー文の出現数を合計する。

### パラメータ

| 名前 | 型 | 説明 |
|------|-----|------|
| `source` | `string` | JS ソース文字列 |

### 戻り値

`number` — `IfStatement` / `ForStatement` / `ForInStatement` / `ForOfStatement` /
`WhileStatement` / `DoWhileStatement` / `SwitchStatement` の出現数の合計

- Acorn の解析オプションは `{ ecmaVersion: 'latest', sourceType: 'module' }`
- `else` 節・`case`/`default` 節は専用の文ノードを持たない（`IfStatement.alternate` /
  `SwitchCase`）ため二重カウントされない（`else if` は独立した `IfStatement` として数える）

### 使用例

```js
const { countJsComplexity } = require('./lib/complexity-score');

countJsComplexity('function f(x) { if (x) { return 1; } return 0; }');
// => 1
```

---

## countPythonComplexities(absolutePaths)

複数の Python ファイルの複雑度をまとめて算出する。

### パラメータ

| 名前 | 型 | 説明 |
|------|-----|------|
| `absolutePaths` | `string[]` | 解析対象 Python ファイルの絶対パス一覧 |

### 戻り値

`Map<string, number>` — 絶対パス → 複雑度（`If`/`For`/`AsyncFor`/`While`/`Match` ノードの出現数の合計）の `Map`

### 実装メモ

ファイルごとに `python3` を起動するコストを避けるため、対象ファイルの絶対パス一覧を JSON で
標準入力に渡し、`python3 -c <標準 ast モジュールを使う子プロセス>` を1回だけ `execFileSync` で起動する
（シェル経由ではないためコマンドインジェクションの心配はない）。`absolutePaths` が空配列の場合は
子プロセスを起動せず空の `Map` を返す。

### 使用例

```js
const { countPythonComplexities } = require('./lib/complexity-score');

const result = countPythonComplexities(['/repo/a.py', '/repo/b.py']);
result.get('/repo/a.py'); // => 3
```

---

## analyzeComplexity({ repoPath })

指定リポジトリ配下の JS/Python ファイルの複雑度スコアと LOC を算出するエントリポイント関数。

### パラメータ

| 名前 | 型 | 説明 |
|------|-----|------|
| `repoPath` | `string` | 解析対象リポジトリのパス |

### 戻り値

`{ file: string, complexity: number, loc: number }[]`（走査順）

- `repoPath` 配下の `.js` / `.py` ファイル（`.git` / `node_modules` を除く）を再帰的に列挙する
- `file` はリポジトリルートからの相対パス（`/` 区切り）
- JS は `countJsComplexity`、Python は `countPythonComplexities` の結果を使用する

### 使用例

```js
const { analyzeComplexity } = require('./lib/complexity-score');
const path = require('path');

const result = analyzeComplexity({ repoPath: path.resolve('.') });
console.log(JSON.stringify(result, null, 2));
// => [{ file: 'lib/complexity-score.js', complexity: 12, loc: 150 }, ...]
```
