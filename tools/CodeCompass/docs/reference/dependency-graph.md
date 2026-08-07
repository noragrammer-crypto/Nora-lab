# lib/dependency-graph.js リファレンス

ホットスポット上位ファイルの caller/callee 依存関係を解析し、
Mermaid graph LR 形式で出力するエンジンモジュール。

---

## selectTopFiles(hotspots, topN)

hotspots 配列からスコア上位 topN 件のファイルパスを返す。
`hotspotScore=0` のファイルは除外する。

### パラメータ

| 名前 | 型 | 説明 |
|------|-----|------|
| `hotspots` | `{ file: string, hotspotScore: number, ... }[]` | `hotspotScore` 降順でソート済みの配列 |
| `topN` | `number` | 取得する件数 |

### 戻り値

`string[]` — ファイルパスの配列（`hotspotScore > 0` かつ上位 topN 件）

### 使用例

```js
const { selectTopFiles } = require('./lib/dependency-graph');

const hotspots = [
  { file: 'a.js', hotspotScore: 1.0 },
  { file: 'b.js', hotspotScore: 0.5 },
  { file: 'c.js', hotspotScore: 0.0 },
];
selectTopFiles(hotspots, 2);
// => ['a.js', 'b.js']
```

---

## buildMermaidGraph(edges)

エッジリストから Mermaid `graph LR` 形式の文字列を生成する。

### パラメータ

| 名前 | 型 | 説明 |
|------|-----|------|
| `edges` | `{ from: string, to: string }[]` | 依存エッジのリスト |

### 戻り値

`string` — Mermaid グラフ文字列（`graph LR` ヘッダで始まる）

### 使用例

```js
const { buildMermaidGraph } = require('./lib/dependency-graph');

buildMermaidGraph([{ from: 'a.js', to: 'b.js' }]);
// => 'graph LR\n  "a.js" -->|calls| "b.js"\n'
```

---

## extractEdges(content, filePath, repoDir)

ファイル内容から相対 `require()` の依存エッジを抽出する。
外部モジュール（相対パスなし）は除外する。`.js` 拡張子がない場合は補完する。

### パラメータ

| 名前 | 型 | 説明 |
|------|-----|------|
| `content` | `string` | ファイルの内容 |
| `filePath` | `string` | リポジトリルートからの相対パス |
| `repoDir` | `string` | リポジトリルートパス（将来の拡張用） |

### 戻り値

`{ from: string, to: string }[]` — 依存エッジのリスト

### 使用例

```js
const { extractEdges } = require('./lib/dependency-graph');

extractEdges(
  "const { greet } = require('./callee');",
  'caller.js',
  '/repo'
);
// => [{ from: 'caller.js', to: 'callee.js' }]
```

---

## analyzeDependencyGraph({ repoPath, topFiles, maxDepth })

指定されたファイル群の依存グラフを解析して Mermaid 文字列を返す。

### パラメータ

| 名前 | 型 | デフォルト | 説明 |
|------|-----|-----------|------|
| `repoPath` | `string` | なし | 解析対象のリポジトリルートパス |
| `topFiles` | `string[]` | なし | 分析対象ファイルの相対パス配列 |
| `maxDepth` | `number` | `1` | 依存追跡の深さ（現バージョン: 1固定） |

### 戻り値

`string` — Mermaid グラフ文字列

### 使用例

```js
const { analyzeDependencyGraph } = require('./lib/dependency-graph');
const path = require('path');

const mmd = analyzeDependencyGraph({
  repoPath: path.resolve('.'),
  topFiles: ['lib/hotspot.js', 'lib/change-frequency.js'],
});
console.log(mmd);
// graph LR
//   "lib/hotspot.js" -->|calls| "lib/change-frequency.js"
//   "lib/hotspot.js" -->|calls| "lib/complexity-score.js"
```
