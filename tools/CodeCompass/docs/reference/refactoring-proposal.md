# lib/refactoring-proposal.js リファレンス

ホットスポットスコアと依存グラフ情報を統合した構造化 JSON を生成し、
xp_Architect プロンプト形式のリファクタリング提案 Markdown を出力するエンジンモジュール。
コードそのものは含めず、構造化メトリクスのみを渡すことで判断ブレを防止する。

---

## buildStructuredJson(hotspots, mmdContent)

hotspots 配列と Mermaid 依存グラフ文字列を統合し、構造化 JSON を返す。

### パラメータ

| 名前 | 型 | 説明 |
|------|-----|------|
| `hotspots` | `{ file: string, hotspotScore: number, complexity: number, changes: number, loc: number, linesChanged: number }[]` | `analyzeHotspots` の戻り値 |
| `mmdContent` | `string` | `analyzeDependencyGraph` の出力 Mermaid 文字列（空文字も可） |

### 戻り値

`{ file: string, hotspot_score: number, complexity: number, changes_90d: number, callers: number, callees: number }[]`

**フィールド変換:**
- `hotspotScore` → `hotspot_score`
- `changes` → `changes_90d`
- `loc`, `linesChanged` は出力に含まれない

**callers / callees の算出:**
- `callees`: Mermaid グラフで自ファイルが from 側（`self --> other`）に登場する回数
- `callers`: Mermaid グラフで自ファイルが to 側（`other --> self`）に登場する回数
- `mmdContent` が空文字の場合は両方 0

**MMD 対応フォーマット:**
```
"a.js" -->|calls| "b.js"   # 引用符あり・アノテーションあり
a.js --> b.js               # 引用符なし・アノテーションなし
```

### 使用例

```js
const { buildStructuredJson } = require('./lib/refactoring-proposal');

const hotspots = [
  { file: 'lib/foo.js', hotspotScore: 1.5, complexity: 30, changes: 50, loc: 200, linesChanged: 400 },
];
const mmd = `graph LR\n  "lib/foo.js" -->|calls| "lib/bar.js"\n`;

buildStructuredJson(hotspots, mmd);
// => [
//   { file: 'lib/foo.js', hotspot_score: 1.5, complexity: 30, changes_90d: 50, callers: 0, callees: 1 }
// ]
```

---

## generateActionsMarkdown(structuredJson)

構造化 JSON 配列から xp_Architect プロンプト形式のリファクタリング提案 Markdown を生成する。

### パラメータ

| 名前 | 型 | 説明 |
|------|-----|------|
| `structuredJson` | `{ file: string, hotspot_score: number, complexity: number, changes_90d: number, callers: number, callees: number }[]` | `buildStructuredJson` の戻り値 |

### 戻り値

`string` — Markdown 形式のリファクタリング提案。空配列を渡しても有効な文字列を返す。

**出力構造:**
1. `# CodeCompass リファクタリング提案` — タイトル
2. `## ホットスポット一覧` — 全ファイルのメトリクス表
3. `## リファクタリング提案` — ファイルごとの提案（`hotspot_score = 0` のファイルは除外）

**提案ロジック（ファイルごと）:**

| 条件 | 提案内容 |
|------|---------|
| `complexity >= 20` | IPO分離またはメソッド抽出でモジュールを分割することを推奨 |
| `callers >= 5` | 変更時の影響範囲が広い。インターフェースを安定させること |
| `callees >= 5` | 依存先が多い。依存関係逆転原則（DI）の適用を検討 |
| 上記なし | 変更頻度と複雑度の組み合わせによるリファクタリング候補として検出 |

### 使用例

```js
const { buildStructuredJson, generateActionsMarkdown } = require('./lib/refactoring-proposal');

const structured = buildStructuredJson(hotspots, mmd);
const markdown = generateActionsMarkdown(structured);
console.log(markdown);
```

### 依存関係

なし（純粋関数。外部モジュールへの依存なし）

---

## 関連スクリプト

`scripts/refactoring-proposal.js` — CLI エントリポイント

```bash
node CodeCompass/scripts/refactoring-proposal.js \
  --hotspots=codecompass/hotspots.json \
  --graph=codecompass/dependency-graph.mmd \
  --out=codecompass/actions.md
```

詳細: [機能仕様書 refactoring-proposal.md](../spec/refactoring-proposal.md)
