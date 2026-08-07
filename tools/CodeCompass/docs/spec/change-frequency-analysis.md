# 変更頻度分析エンジン 仕様

## 概要

`CodeCompass/scripts/change-frequency.js` が `git log --numstat` の出力を集計し、
ファイルごとの変更回数（`changes`）・変更行数（`linesChanged` = 追加+削除）を
変更頻度（`changes`）降順でランキングした JSON 配列を出力する。

CodeCompass の蒸留エンジン（レイヤー1）の最初の柱であり、ホットスポット判定（#1178）の入力データとなる。

`excludePatterns`（[exclude-patterns.md](./exclude-patterns.md) 参照）を指定すると、
`dist/` 等のノイズファイルの numstat エントリを集計前に除外できる（Story #1232）。

---

## 実行方法

```bash
node CodeCompass/scripts/change-frequency.js <repoPath> [--days=<N>] [--out=<path>]
```

| 引数・オプション | 必須 | デフォルト | 説明 |
|---|---|---|---|
| `<repoPath>` | ✅ | なし | 集計対象の git リポジトリパス |
| `--days=<N>` | - | `90` | 集計対象期間（直近 N 日） |
| `--out=<path>` | - | なし（標準出力） | 出力先ファイルパス。省略時は標準出力に書き出す |

`<repoPath>` 省略時は使い方（Usage）を標準エラー出力に書き出し、異常終了する（`exitCode = 1`）。

---

## 出力形式

`changes` 降順でソートされた JSON 配列:

```json
[
  { "file": "lib/change-frequency.js", "changes": 5, "linesChanged": 120 },
  { "file": "scripts/change-frequency.js", "changes": 2, "linesChanged": 40 }
]
```

| フィールド | 型 | 説明 |
|---|---|---|
| `file` | `string` | ファイルパス（リポジトリルートからの相対パス） |
| `changes` | `number` | そのファイルが変更されたコミット数（numstat エントリの出現数） |
| `linesChanged` | `number` | 追加行数 + 削除行数の合計（バイナリファイルの `-` は 0 として扱う） |

---

## 関数シグネチャ

### parseNumstatOutput

```javascript
function parseNumstatOutput(raw: string): { file: string, additions: number, deletions: number }[]
```

`git log --numstat --pretty=format:"commit %H"` の生出力を解析し、
numstat 形式の行（`<additions>\t<deletions>\t<file>`）のみを抽出する。

- コミットハッシュ行・著者行・空行など numstat 形式に一致しない行は無視する
- バイナリファイルを示す `-` は `0` として扱う

### aggregateChanges

```javascript
function aggregateChanges(entries: { file: string, additions: number, deletions: number }[]):
  { file: string, changes: number, linesChanged: number }[]
```

numstat エントリ群をファイル単位に集計し、`changes`（出現数）の降順でランキング化する。

- `changes`: そのファイルが変更されたコミット数（エントリ出現数）
- `linesChanged`: 追加行数 + 削除行数の合計

### analyzeChangeFrequency

```javascript
function analyzeChangeFrequency({ repoPath: string, days?: number, excludePatterns?: string[] }):
  { file: string, changes: number, linesChanged: number }[]
```

| 引数 | 型 | デフォルト | 説明 |
|---|---|---|---|
| `repoPath` | `string` | なし | 集計対象の git リポジトリパス |
| `days` | `number` | `90` | 集計対象期間（直近 N 日） |
| `excludePatterns` | `string[]` | `[]` | 除外パターン（[exclude-patterns.md](./exclude-patterns.md) の `isExcluded` で判定） |

`git log --numstat --since=<days>.days --pretty=format:"commit %H"` を実行し、
`parseNumstatOutput` で得たエントリを `isExcluded` でフィルタしたうえで `aggregateChanges` に渡し、
ランキング配列を返す。

---

## CLI インターフェース

### parseArgs

```javascript
function parseArgs(argv: string[]): { repoPath: string | null, days: number, out: string | null }
```

`--days=<N>` / `--out=<path>` をオプションとして解釈し、`--` で始まらない最初の引数を `repoPath` とする。

### main

```javascript
function main(argv: string[]): void
```

1. `repoPath` が指定されていない場合、`Usage: ...` を標準エラー出力に書き出して `exitCode = 1` で終了する
2. `analyzeChangeFrequency` の結果を `JSON.stringify(result, null, 2)` で整形する
3. `--out` 指定時はファイルに書き出し、未指定時は標準出力に書き出す

---

## ファイル構成

```
CodeCompass/
├── lib/change-frequency.js              # 集計ロジック（parseNumstatOutput / aggregateChanges / analyzeChangeFrequency）
├── scripts/change-frequency.js          # CLI エントリポイント（引数解釈・出力先切り替え）
└── __tests__/
    ├── change-frequency.unit.test.js          # lib の純粋関数の単体テスト
    ├── change-frequency.functional.test.js    # CLI インターフェースの機能テスト
    └── e2e/change-frequency-analysis.e2e.test.js  # ストーリー受け入れ条件の E2E テスト
```

---

## 依存ライブラリ

| モジュール | 用途 |
|---|---|
| `./exclude-patterns` | `isExcluded` によるノイズファイルの除外判定（[exclude-patterns.md](./exclude-patterns.md)） |
