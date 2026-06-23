# E2E Tests: CodeCompass ホットスポット判定とランキング出力（Story #1178）

テストファイル: `CodeCompass/__tests__/e2e/hotspot.e2e.test.js`

テストフレームワーク: Jest（`execSync` で CLI を実行する受け入れテスト）

テスト対象: `CodeCompass/scripts/hotspot.js <repoPath> [--outDir=<dir>]`

フィクスチャ: `buildFixtureRepo()` が `GIT_AUTHOR_DATE` / `GIT_COMMITTER_DATE` で
コミット日時を固定した決定論的な一時 git リポジトリを構築する

---

## フィクスチャのコミット履歴と期待値

| ファイル | complexity | changes（直近90日） | loc | 期待 hotspotScore |
|---|---|---|---|---|
| `a.js` | 3 (`if`/`for`/`while`) | 3 | 10 | `(3×3)/10 = 0.9` |
| `b.js` | 2 (`if`/`if`) | 2 | 10 | `(2×2)/10 = 0.4` |
| `c.js` | 0（制御フローなし） | 4 | 5 | `(4×0)/5 = 0` |

**期待ランキング順**: a.js（0.9）> b.js（0.4）> c.js（0）

### a.js の内容

```js
function processA(items) {
  for (let i = 0; i < items.length; i++) {
    if (items[i] > 0) {
      console.log(items[i]);
    }
  }
  let count = 0;
  while (count < 10) { count++; }
  return count;
}
```

### b.js の内容

```js
function processB(x) {
  if (x > 0) { return x * 2; }
  if (x < 0) { return x * -1; }
  return 0;
}
```

### c.js の内容

```js
const C = 42;
function getC() { return C; }
function setC(v) { return v; }
module.exports = { C, getC, setC };
```

---

## テスト一覧

### 1. scripts/hotspot.js が存在する

**シナリオ概要**: 実装タスク #1198 完了前は RED、完了後は GREEN になる存在確認

| ステップ | 種別 | 内容 |
|---|---|---|
| Then | 検証 | `fs.existsSync(SCRIPT_PATH)` が `true` |

---

### 2. 受け入れ条件1: hotspot スクリプトを実行したとき hotspots.md が生成される

**シナリオ概要**: `--outDir` 指定で `hotspots.md` が生成されること

| ステップ | 種別 | 内容 |
|---|---|---|
| Given | 前提 | `buildFixtureRepo()` で一時 git リポジトリを構築する |
| When | 操作 | `node scripts/hotspot.js "<repoDir>" --outDir="<outDir>"` を実行する |
| Then | 検証 | `<outDir>/hotspots.md` が作成されている |
| Then | 検証 | `hotspots.md` の内容が空でない |

---

### 3. 受け入れ条件2: hotspot スクリプトを実行したとき hotspots.json が生成される

**シナリオ概要**: `--outDir` 指定で `hotspots.json` が生成されること

| ステップ | 種別 | 内容 |
|---|---|---|
| Then | 検証 | `<outDir>/hotspots.json` が作成されている |
| Then | 検証 | 出力が JSON として解釈できる配列であり、要素数が1件以上 |

---

### 4. 受け入れ条件3: hotspots.json の各エントリに必須フィールドが含まれる

**シナリオ概要**: 各エントリのフィールド型と、フィクスチャの期待値との一致を検証する

| ステップ | 種別 | 内容 |
|---|---|---|
| Then | 検証 | 各エントリが `file: string` / `hotspotScore: number` / `complexity: number` / `changes: number` / `loc: number` を持つ |
| Then | 検証 | `a.js` は `complexity: 3, changes: 3` |
| Then | 検証 | `b.js` は `complexity: 2, changes: 2` |
| Then | 検証 | `c.js` は `complexity: 0` |
| Then | 検証 | `a.js` の `hotspotScore` が `(changes × complexity) / loc` の計算式に従う |
| Then | 検証 | `c.js`（complexity=0）の `hotspotScore` が `0` |

---

### 5. 受け入れ条件4: ホットスポットランキングが密度スコア降順で並んでいる

**シナリオ概要**: 出力配列が `hotspotScore` 降順でソートされていることを検証する

| ステップ | 種別 | 内容 |
|---|---|---|
| Then | 検証 | 隣接する要素間で `hotspotScore[i] >= hotspotScore[i+1]` が成立する |
| Then | 検証 | `a.js`（0.9）が `b.js`（0.4）より上位にランクされる |

---

## カバレッジサマリー

| 受け入れ条件 | テスト数 | 状態 |
|---|---|---|
| AC1: hotspots.md が生成される | 2 | ✅ |
| AC2: hotspots.json が生成される | 2 | ✅ |
| AC3: 必須フィールドと期待値一致 | 6 | ✅ |
| AC4: hotspotScore 降順ソート | 2 | ✅ |
| 存在確認 | 1 | ✅ |

合計: 13件 — 全 GREEN（実装タスク #1198 完了により RED → GREEN に移行）
