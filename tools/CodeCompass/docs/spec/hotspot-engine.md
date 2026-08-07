# ホットスポット判定エンジン 仕様

## 概要

`CodeCompass/scripts/hotspot.js` が変更頻度データ（`analyzeChangeFrequency`）と
複雑度データ（`analyzeComplexity`）を統合し、密度スコア `(changes × complexity) / loc`
でホットスポットをランキングする。

人間可読の Markdown テーブル（`hotspots.md`）と機械可読 JSON（`hotspots.json`）を出力し、
xp_Architect 連携の入力データとして使用する。

CodeCompass のレイヤー2（ホットスポット判定）の中核。

---

## 実行方法

```bash
node CodeCompass/scripts/hotspot.js <repoPath> [--days=<N>] [--outDir=<dir>] [--out=<path>] [--md=<path>] [--ignore=<pattern,...>]
```

| 引数・オプション | 必須 | デフォルト | 説明 |
|---|---|---|---|
| `<repoPath>` | ✅ | なし | 解析対象のリポジトリパス |
| `--days=<N>` | - | `90` | 変更頻度の集計期間（日数） |
| `--outDir=<dir>` | - | なし | 出力ディレクトリ。指定時は `hotspots.json` と `hotspots.md` を同ディレクトリに書き出す |
| `--out=<path>` | - | なし（標準出力） | JSON の出力先ファイルパス |
| `--md=<path>` | - | なし | Markdown の出力先ファイルパス |
| `--ignore=<pattern,...>` | - | なし | 追加の除外パターン（カンマ区切り、複数可）。デフォルト除外パターンと `.codecompassignore` には常時適用に加えて統合される（[exclude-patterns.md](./exclude-patterns.md)） |

`<repoPath>` 省略時は使い方（Usage）を標準エラー出力に書き出し、異常終了する（`exitCode = 1`）。

`--outDir` を指定すると `<outDir>/hotspots.json` と `<outDir>/hotspots.md` を同時出力する。
`--out` / `--md` を個別指定した場合はそれぞれのファイルに書き出す。

---

## 出力形式

### hotspots.json

hotspotScore 降順でソートされた JSON 配列:

```json
[
  {
    "file": "path/to/file.js",
    "hotspotScore": 0.82,
    "complexity": 34,
    "changes": 120,
    "loc": 250,
    "linesChanged": 1800
  }
]
```

| フィールド | 型 | 説明 |
|---|---|---|
| `file` | `string` | ファイルパス（リポジトリルートからの相対パス、`/` 区切り） |
| `hotspotScore` | `number` | 密度スコア `(changes × complexity) / loc`。ゼロ除算回避で loc=0 または complexity=0 の場合は `0` |
| `complexity` | `number` | 制御フロー文（`if`/`for`/`while`/`switch` 等）の出現数 |
| `changes` | `number` | 指定期間内にそのファイルが変更されたコミット数 |
| `loc` | `number` | ファイルの行数 |
| `linesChanged` | `number` | 指定期間内の追加行数 + 削除行数の合計 |

### hotspots.md

hotspotScore 降順の Markdown テーブル:

```markdown
| file | hotspotScore | complexity | changes | loc | linesChanged |
|------|-------------|-----------|---------|-----|-------------|
| path/to/file.js | 0.8200 | 34 | 120 | 250 | 1800 |
```

---

## スコア算出ルール

### 密度スコア（hotspotScore）

```
hotspotScore = (changes × complexity) / loc
```

- `loc = 0` のファイル（空ファイル）はゼロ除算を避けるため `hotspotScore = 0`
- `complexity = 0` のファイル（制御フローなし）は `hotspotScore = 0`
- 変更頻度データに存在しないファイル（指定期間に変更なし）は `changes = 0`（`hotspotScore = 0`）

`/ loc` を含めることで大規模ファイルの過大評価を防ぎ、
「触るほど複雑なコード」を最優先のリファクタリング候補として特定する。

---

## 関数シグネチャ

### mergeData

```javascript
function mergeData(
  changeFrequency: { file: string, changes: number, linesChanged: number }[],
  complexity: { file: string, complexity: number, loc: number }[]
): { file: string, changes: number, linesChanged: number, complexity: number, loc: number }[]
```

変更頻度データと複雑度データをファイル名で結合する。
複雑度データに存在するファイルを基準とし、変更頻度データに存在しないファイルは
`changes = 0`, `linesChanged = 0` として扱う。

### computeHotspotScores

```javascript
function computeHotspotScores(
  merged: { file: string, changes: number, linesChanged: number, complexity: number, loc: number }[]
): { file: string, hotspotScore: number, complexity: number, changes: number, loc: number, linesChanged: number }[]
```

マージ済みデータから密度スコアを算出し、`hotspotScore` 降順でソートした配列を返す。

### analyzeHotspots

```javascript
function analyzeHotspots({ repoPath: string, days?: number, excludePatterns?: string[] }):
  { file: string, hotspotScore: number, complexity: number, changes: number, loc: number, linesChanged: number }[]
```

`analyzeChangeFrequency` と `analyzeComplexity` を呼び出してデータを取得し、
`mergeData` → `computeHotspotScores` の順で処理してホットスポットランキングを返す。
`days` のデフォルトは `90`。`excludePatterns` は両エンジンに同一の値が渡され、
ノイズファイル（`dist/` 等）を分析対象から除外する（[exclude-patterns.md](./exclude-patterns.md)）。

---

## CLI インターフェース

### parseArgs

```javascript
function parseArgs(argv: string[]): {
  repoPath: string | null,
  days: number,
  outDir: string | null,
  out: string | null,
  md: string | null,
  ignore: string[]
}
```

`--days=<N>`, `--outDir=<dir>`, `--out=<path>`, `--md=<path>`, `--ignore=<pattern,...>` をオプションとして解釈し、
`--` で始まらない最初の引数を `repoPath` とする。
`--ignore=<pattern,...>` はカンマ区切りで分割し、前後の空白を除去・空文字列を除いた配列を `ignore` とする。

### main

```javascript
function main(argv: string[]): void
```

1. `repoPath` が指定されていない場合、`Usage: ...` を標準エラー出力に書き出して `exitCode = 1` で終了する
2. `resolveExcludePatterns({ repoPath, cliPatterns: ignore })`（[exclude-patterns.md](./exclude-patterns.md)）で
   デフォルト除外パターン・`.codecompassignore`・`--ignore` を統合した `excludePatterns` を組み立てる
3. `analyzeHotspots` に `excludePatterns` を渡してランキングを取得する
4. `--outDir` 指定時: `<outDir>/hotspots.json` と `<outDir>/hotspots.md` を出力する
5. `--out` 指定時: 指定パスに JSON を書き出す（`--md` も指定時は MD も書き出す）
6. どちらも未指定時: JSON を標準出力に書き出す（`--md` 指定時は MD も書き出す）

---

## ファイル構成

```
CodeCompass/
├── lib/hotspot.js                              # 解析ロジック（mergeData / computeHotspotScores / analyzeHotspots）
├── scripts/hotspot.js                          # CLI エントリポイント（引数解釈・出力先切り替え・--ignore）
└── __tests__/
    ├── hotspot.unit.test.js                    # lib の純粋関数の単体テスト
    ├── hotspot.functional.test.js              # CLI インターフェースの機能テスト
    ├── exclude-patterns.unit.test.js           # resolveExcludePatterns / isExcluded の単体テスト
    ├── exclude-patterns.functional.test.js     # --ignore / .codecompassignore CLI の機能テスト
    └── e2e/hotspot.e2e.test.js                 # ストーリー受け入れ条件の E2E テスト（#1178 作成済み）
```

---

## 依存ライブラリ

| モジュール | 用途 |
|---|---|
| `./change-frequency` | 変更頻度データ取得（`analyzeChangeFrequency`） |
| `./complexity-score` | 複雑度データ取得（`analyzeComplexity`） |
| `./exclude-patterns` | CLI（`scripts/hotspot.js`）が `resolveExcludePatterns` で除外パターンを組み立てる |

---

## 関連ドキュメント

- [change-frequency-analysis.md](./change-frequency-analysis.md) — 変更頻度分析エンジン仕様
- [complexity-scoring-engine.md](./complexity-scoring-engine.md) — 複雑度スコアリングエンジン仕様
- [exclude-patterns.md](./exclude-patterns.md) — 除外パターン解決エンジン仕様
