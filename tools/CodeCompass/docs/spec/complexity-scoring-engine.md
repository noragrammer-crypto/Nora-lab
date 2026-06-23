# 複雑度スコアリングエンジン（AST解析） 仕様

## 概要

`CodeCompass/scripts/complexity-score.js` がリポジトリ配下の `.js` / `.py` ファイルを
再帰的に走査し、AST 解析による制御フロー文（`if` / `for` / `while` / `switch` 等）の
出現数を「複雑度スコア」として算出する。LOC（行数）と合わせて `{ file, complexity, loc }`
の JSON 配列として出力する。

CodeCompass の蒸留エンジン（レイヤー1）の2本目の柱であり、ホットスポット判定（#1178）の入力データとなる。

`excludePatterns`（[exclude-patterns.md](./exclude-patterns.md) 参照）を指定すると、
`dist/` 等のノイズファイル・ディレクトリをファイル走査の段階で除外できる（Story #1232）。

---

## 実行方法

```bash
node CodeCompass/scripts/complexity-score.js <repoPath> [--out=<path>]
```

| 引数・オプション | 必須 | デフォルト | 説明 |
|---|---|---|---|
| `<repoPath>` | ✅ | なし | 解析対象のリポジトリパス |
| `--out=<path>` | - | なし（標準出力） | 出力先ファイルパス。省略時は標準出力に書き出す |

`<repoPath>` 省略時は使い方（Usage）を標準エラー出力に書き出し、異常終了する（`exitCode = 1`）。

---

## 出力形式

走査順（ディレクトリ走査順）の JSON 配列:

```json
[
  { "file": "lib/complexity-score.js", "complexity": 12, "loc": 150 },
  { "file": "scripts/complexity-score.py", "complexity": 4, "loc": 40 }
]
```

| フィールド | 型 | 説明 |
|---|---|---|
| `file` | `string` | ファイルパス（リポジトリルートからの相対パス、`/` 区切り） |
| `complexity` | `number` | 制御フロー文（`if`/`for`/`while`/`switch` 等）の出現数の合計 |
| `loc` | `number` | ファイルの行数（末尾改行は1行として数えない） |

走査対象は拡張子 `.js` / `.py` のファイルのみ。`.git` / `node_modules` 配下は常に走査対象から除外する
（`SKIP_DIRECTORIES`）。加えて `excludePatterns` に一致するファイル・ディレクトリ
（`dist/` / `.obsidian/` 等。[exclude-patterns.md](./exclude-patterns.md) 参照）も除外する。

---

## 複雑度のカウント対象

「制御フロー文の出現数の合計」であり、`else` / `case` / `default` のような派生節は
専用の文ノードを持たないため二重カウントされない（`else-if` は独立した `if` として数える）。

### JavaScript（Acorn / ESTree AST）

| カウント対象ノード型 | 対応する構文 |
|---|---|
| `IfStatement` | `if` / `else if`（ネストした `IfStatement` として個別カウント） |
| `ForStatement` | `for` |
| `ForInStatement` | `for...in` |
| `ForOfStatement` | `for...of` |
| `WhileStatement` | `while` |
| `DoWhileStatement` | `do...while` |
| `SwitchStatement` | `switch`（`case`/`default` は `SwitchCase` であり対象外） |

### Python（標準 `ast` モジュール）

| カウント対象ノード型 | 対応する構文 |
|---|---|
| `If` | `if` / `elif`（ネストした `If` として個別カウント） |
| `For` / `AsyncFor` | `for` / `async for` |
| `While` | `while` |
| `Match` | `match`（`case` は `match_case` であり対象外。Python 3.10 未満では出現しない） |

---

## 関数シグネチャ

### countLines

```javascript
function countLines(source: string): number
```

文字列を改行（`\n`）で分割して行数を数える。末尾が空行（末尾改行による）の場合は
それを1行として数えない。空文字列に対しては `0` を返す。

### walkAst

```javascript
function walkAst(node: object, visit: (node: object) => void): void
```

`type` プロパティを持つ ESTree 形式の AST ノードを再帰的に走査し、出現したノードごとに
`visit` を呼び出す汎用ウォーカー。

### countJsComplexity

```javascript
function countJsComplexity(source: string): number
```

JS ソースを Acorn（`ecmaVersion: 'latest'`, `sourceType: 'module'`）で AST 解析し、
上記「カウント対象ノード型（JavaScript）」の出現数を合計する。

### countPythonComplexities

```javascript
function countPythonComplexities(absolutePaths: string[]): Map<string, number>
```

複数の Python ファイルの複雑度をまとめて算出する。ファイルごとに `python3` を
起動するコストを避けるため、対象ファイルの絶対パス一覧を JSON で標準入力に渡し、
`python3 -c <標準astモジュールを使う子プロセス>` を1回だけ起動する。
戻り値は「絶対パス → 複雑度」の `Map`。

### collectTargetFiles

```javascript
function collectTargetFiles(repoPath: string, excludePatterns?: string[]): string[]
```

`repoPath` 配下を再帰的に走査し、対象拡張子（`.js` / `.py`）ファイルの絶対パス一覧を返す。
走査中の各エントリ（ファイル・ディレクトリ）は `isExcluded`（[exclude-patterns.md](./exclude-patterns.md)）
で `excludePatterns` に一致するか判定し、一致すれば走査対象から除く。`SKIP_DIRECTORIES`
（`.git` / `node_modules`）は `excludePatterns` の指定に関わらず常に除外する。

### analyzeComplexity

```javascript
function analyzeComplexity({ repoPath: string, excludePatterns?: string[] }):
  { file: string, complexity: number, loc: number }[]
```

`collectTargetFiles` で `repoPath` 配下の `.js` / `.py` ファイル（`.git` / `node_modules` および
`excludePatterns` に一致するものを除く）を列挙し、各ファイルについて `{ file, complexity, loc }`
を算出して配列で返す。JS は `countJsComplexity`、Python は `countPythonComplexities` の結果を使用する。

---

## CLI インターフェース

### parseArgs

```javascript
function parseArgs(argv: string[]): { repoPath: string | null, out: string | null }
```

`--out=<path>` をオプションとして解釈し、`--` で始まらない最初の引数を `repoPath` とする。

### main

```javascript
function main(argv: string[]): void
```

1. `repoPath` が指定されていない場合、`Usage: ...` を標準エラー出力に書き出して `exitCode = 1` で終了する
2. `analyzeComplexity` の結果を `JSON.stringify(result, null, 2)` で整形する
3. `--out` 指定時はファイルに書き出し、未指定時は標準出力に書き出す

---

## ファイル構成

```
CodeCompass/
├── lib/complexity-score.js              # 解析ロジック（countLines / walkAst / countJsComplexity / countPythonComplexities / collectTargetFiles / analyzeComplexity）
├── scripts/complexity-score.js          # CLI エントリポイント（引数解釈・出力先切り替え）
└── __tests__/
    ├── complexity-score.unit.test.js          # lib の純粋関数の単体テスト
    ├── complexity-score.functional.test.js    # CLI インターフェースの機能テスト
    └── e2e/complexity-score.e2e.test.js       # ストーリー受け入れ条件の E2E テスト
```

---

## 依存ライブラリ

| パッケージ／モジュール | 用途 |
|---|---|
| `acorn` | JS ソースの AST 解析（ESTree 形式） |
| `python3`（標準 `ast` モジュール） | Python ソースの AST 解析。Node.js から子プロセスとして起動 |
| `./exclude-patterns` | `isExcluded` によるノイズファイル・ディレクトリの除外判定（[exclude-patterns.md](./exclude-patterns.md)） |
