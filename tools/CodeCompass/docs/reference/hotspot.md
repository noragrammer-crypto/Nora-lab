# lib/hotspot.js リファレンス

変更頻度データと複雑度データを統合してホットスポットをランキングするエンジンモジュール。
密度スコア `(changes × complexity) / loc` でファイルをランキングし、
リファクタリング優先度を特定する。

---

## mergeData(changeFrequency, complexity)

変更頻度データと複雑度データをファイル名で結合する。

### パラメータ

| 名前 | 型 | 説明 |
|------|-----|------|
| `changeFrequency` | `{ file: string, changes: number, linesChanged: number }[]` | `analyzeChangeFrequency` の戻り値 |
| `complexity` | `{ file: string, complexity: number, loc: number }[]` | `analyzeComplexity` の戻り値 |

### 戻り値

`{ file: string, changes: number, linesChanged: number, complexity: number, loc: number }[]`

- 複雑度データに存在するファイルを基準とする
- 変更頻度データに存在しないファイルは `changes = 0`, `linesChanged = 0` として扱う

### 使用例

```js
const { mergeData } = require('./lib/hotspot');

mergeData(
  [{ file: 'a.js', changes: 5, linesChanged: 50 }],
  [
    { file: 'a.js', complexity: 10, loc: 100 },
    { file: 'b.js', complexity: 3, loc: 50 },
  ]
);
// => [
//   { file: 'a.js', changes: 5, linesChanged: 50, complexity: 10, loc: 100 },
//   { file: 'b.js', changes: 0, linesChanged: 0, complexity: 3, loc: 50 },
// ]
```

---

## computeHotspotScores(merged)

マージ済みデータから密度スコア `(changes × complexity) / loc` を算出し、スコア降順でソートする。

### パラメータ

| 名前 | 型 | 説明 |
|------|-----|------|
| `merged` | `{ file, changes, linesChanged, complexity, loc }[]` | `mergeData` の戻り値 |

### 戻り値

`{ file: string, hotspotScore: number, complexity: number, changes: number, loc: number, linesChanged: number }[]`（`hotspotScore` 降順）

**スコア算出ルール:**
- `loc = 0` または `complexity = 0` の場合は `hotspotScore = 0`（ゼロ除算回避）
- それ以外: `hotspotScore = (changes × complexity) / loc`

### 使用例

```js
const { computeHotspotScores } = require('./lib/hotspot');

computeHotspotScores([
  { file: 'a.js', changes: 10, linesChanged: 200, complexity: 20, loc: 100 },
  { file: 'b.js', changes: 1, linesChanged: 10, complexity: 2, loc: 100 },
]);
// => [
//   { file: 'a.js', hotspotScore: 2.0, complexity: 20, changes: 10, loc: 100, linesChanged: 200 },
//   { file: 'b.js', hotspotScore: 0.02, complexity: 2, changes: 1, loc: 100, linesChanged: 10 },
// ]
```

---

## analyzeHotspots({ repoPath, days, excludePatterns })

指定リポジトリのホットスポットランキングを算出するエントリポイント関数。

### パラメータ

| 名前 | 型 | デフォルト | 説明 |
|------|-----|-----------|------|
| `repoPath` | `string` | なし | 解析対象の git リポジトリパス |
| `days` | `number` | `90` | 変更頻度の集計期間（直近 N 日） |
| `excludePatterns` | `string[]` | `[]` | 解析対象から除外するパターン一覧。`./exclude-patterns` の `resolveExcludePatterns` で解決する |

### 戻り値

`{ file: string, hotspotScore: number, complexity: number, changes: number, loc: number, linesChanged: number }[]`（`hotspotScore` 降順）

`analyzeChangeFrequency` と `analyzeComplexity` を呼び出してデータを取得し、
`mergeData` → `computeHotspotScores` の順で処理する。除外パターンは両関数にそのまま渡される。

### 使用例

```js
const { analyzeHotspots } = require('./lib/hotspot');
const { resolveExcludePatterns } = require('./lib/exclude-patterns');
const path = require('path');

const repoPath = path.resolve('.');
const excludePatterns = resolveExcludePatterns({ repoPath });
const result = analyzeHotspots({ repoPath, days: 90, excludePatterns });
console.log(JSON.stringify(result.slice(0, 5), null, 2));
// 上位5件のホットスポットを表示
```

### 依存関係

- `./change-frequency` — `analyzeChangeFrequency`（変更頻度データ取得）
- `./complexity-score` — `analyzeComplexity`（複雑度データ取得）
- `./exclude-patterns` — `resolveExcludePatterns` / `isExcluded`（除外パターン解決。詳細は `docs/spec/exclude-patterns.md` を参照）
