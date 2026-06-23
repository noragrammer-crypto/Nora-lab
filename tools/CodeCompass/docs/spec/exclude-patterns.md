# 除外パターン解決エンジン 仕様

## 概要

`CodeCompass/lib/exclude-patterns.js` が、ホットスポット分析（変更頻度・複雑度の両エンジン）から
ノイズファイル（`dist/`・`node_modules/`・`.obsidian/`・minify済みファイル・lockファイル等）を
除外するための共通ロジックを提供する。

デフォルト除外パターン・対象リポジトリの `.codecompassignore`・CLI の `--ignore` オプションを
この順で統合し、変更頻度分析（`change-frequency.js`）・複雑度分析（`complexity-score.js`）の
両方に同一の除外ルールを適用する。

Story #1232（public公開向け品質向上）の受け入れ条件「デフォルト分析で dist/.obsidian 等が
ランキングに出ない」「`.codecompassignore` または `--ignore` オプションで除外追加できる」を実現する。

---

## デフォルト除外パターン

```javascript
const DEFAULT_EXCLUDE_PATTERNS = [
  'dist/',
  'build/',
  'node_modules/',
  '.obsidian/',
  '*.min.js',
  '*-lock.json',
  'package-lock.json',
  'yarn.lock',
];
```

常に適用される。`complexity-score.js` の `SKIP_DIRECTORIES`（`.git` / `node_modules`）とは別の
レイヤーであり、`SKIP_DIRECTORIES` はディレクトリ走査を打ち切るための低レベル除外、
`DEFAULT_EXCLUDE_PATTERNS` 以降はユーザーが `.codecompassignore` / `--ignore` で拡張できる
高レベル除外ルールという役割分担になっている。

---

## `.codecompassignore` ファイル

分析対象リポジトリのルート直下に置く任意のファイル。`gitignore` 風の1行1パターン形式。

- 空行・`#` で始まる行は無視する
- ファイルが存在しない場合は空配列として扱う（エラーにしない）

```
# generated files
coverage/
*.generated.js
```

---

## パターン記法

| 記法 | 判定方法 |
|---|---|
| 末尾が `/`（ディレクトリ指定） | 相対パスを `/` で分割したセグメントのいずれかが、`/` を除いた値と完全一致するか |
| `*` を含む（glob） | `*` を `.*` に変換した正規表現で、相対パス全体 または ファイル名（basename）のいずれかにマッチするか |
| 上記以外 | `*` を含まない glob と同様に、相対パス全体またはファイル名との完全一致 |

末尾 `/` 指定は部分一致しない（`dist/` は `distfiles/` には一致しない。セグメント単位の完全一致のため）。

---

## 関数シグネチャ

### globToRegExp

```javascript
function globToRegExp(pattern: string): RegExp
```

`*` のみに対応する glob パターンを正規表現に変換する（`*` 以外の正規表現特殊文字はエスケープする）。

### matchesPattern

```javascript
function matchesPattern(relativePath: string, pattern: string): boolean
```

単一の除外パターンが相対パスにマッチするか判定する。「パターン記法」の表に従う。

### isExcluded

```javascript
function isExcluded(relativePath: string, patterns: string[]): boolean
```

`relativePath` がいずれかの `patterns` にマッチすれば `true`。`patterns` が空配列なら常に `false`。

### loadIgnoreFile

```javascript
function loadIgnoreFile(repoPath: string): string[]
```

`<repoPath>/.codecompassignore` が存在しない場合は空配列を返す。
存在する場合は行ごとに分割し、空行・`#` コメント行を除いた行をパターン配列として返す。

### resolveExcludePatterns

```javascript
function resolveExcludePatterns({ repoPath: string, cliPatterns?: string[] }): string[]
```

`DEFAULT_EXCLUDE_PATTERNS` → `loadIgnoreFile(repoPath)` → `cliPatterns` の順で連結した
パターン配列を返す。この配列が `analyzeChangeFrequency` / `analyzeComplexity` の
`excludePatterns` オプションとして両エンジンに渡される。

---

## 利用箇所

| 呼び出し元 | 用途 |
|---|---|
| `lib/change-frequency.js` の `analyzeChangeFrequency` | `parseNumstatOutput` で得たエントリを `isExcluded` でフィルタ |
| `lib/complexity-score.js` の `collectTargetFiles` | ディレクトリ走査中のファイル・ディレクトリを `isExcluded` でフィルタ |
| `scripts/hotspot.js` の `main` | `resolveExcludePatterns` で `--ignore` CLI引数と `.codecompassignore` を統合し、両エンジンに伝播 |

---

## ファイル構成

```
CodeCompass/
├── lib/exclude-patterns.js                       # 本体（DEFAULT_EXCLUDE_PATTERNS / matchesPattern / isExcluded / loadIgnoreFile / resolveExcludePatterns）
└── __tests__/
    ├── exclude-patterns.unit.test.js              # lib の純粋関数の単体テスト
    └── exclude-patterns.functional.test.js        # change-frequency / complexity-score / hotspot.js CLI への統合の機能テスト
```

---

## 関連ドキュメント

- [change-frequency-analysis.md](./change-frequency-analysis.md) — 変更頻度分析エンジン仕様
- [complexity-scoring-engine.md](./complexity-scoring-engine.md) — 複雑度スコアリングエンジン仕様
- [hotspot-engine.md](./hotspot-engine.md) — ホットスポット判定エンジン仕様
