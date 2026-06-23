# E2E Tests: CodeCompass xp_Architect連携によるリファクタリング提案生成（Story #1180）

テストファイル: `CodeCompass/__tests__/e2e/refactoring-proposal.e2e.test.js`

テストフレームワーク: Jest（`execSync` で CLI を実行する受け入れテスト）

テスト対象:
```
node CodeCompass/scripts/refactoring-proposal.js
  --hotspots=<path>   (省略時: codecompass/hotspots.json)
  --graph=<path>      (省略時: codecompass/dependency-graph.mmd)
  --out=<path>        (省略時: codecompass/actions.md)
```

---

## フィクスチャ

| ファイル | 内容 |
|---------|------|
| `hotspots.json` | `[{ file: 'a.js', hotspotScore: 0.9, ... }, { file: 'b.js', hotspotScore: 0.4, ... }]` |
| `dependency-graph.mmd` | `graph LR\n  a.js --> b.js\n  b.js --> c.js` |

期待される callers/callees:

| ファイル | callers | callees | 理由 |
|---------|---------|---------|------|
| `a.js` | 0 | 1 | a.js → b.js エッジが 1 本 |
| `b.js` | 1 | 1 | a.js から呼ばれ、b.js → c.js エッジが 1 本 |

---

## テストシナリオ

### 受け入れ条件1: buildStructuredJson — 構造化JSONを生成できる

**Given** `lib/refactoring-proposal.js` が存在する
**When** `buildStructuredJson(FIXTURE_HOTSPOTS, FIXTURE_MMD)` を呼ぶ
**Then** 各エントリに `file, hotspot_score, complexity, changes_90d, callers, callees` が含まれる

| # | テストケース | 種別 |
|---|------------|------|
| 1 | `lib/refactoring-proposal.js` が存在する | 存在確認 |
| 2 | `buildStructuredJson` 関数がエクスポートされている | 正常系 |
| 3 | hotspots 配列と mmd 文字列を受け取り配列を返す | 正常系 |
| 4 | 各エントリに file, hotspot_score, complexity, changes_90d, callers, callees が含まれる | 正常系 |
| 5 | コードそのものが含まれない（source/code/content フィールドなし） | 正常系 |
| 6 | hotspot_score が hotspots.json の hotspotScore と対応する | 正常系 |
| 7 | a.js の callees が 1 になる（a.js --> b.js） | 正常系 |
| 8 | b.js の callers が 1 になる（a.js --> b.js） | 正常系 |
| 9 | mmd が空のとき callers/callees はすべて 0 になる | 異常系 |

### 受け入れ条件2: generateActionsMarkdown — リファクタリング提案を生成できる

**Given** `buildStructuredJson` の出力
**When** `generateActionsMarkdown(structuredJson)` を呼ぶ
**Then** Markdown 文字列が返り、ホットスポットファイル名を含む

| # | テストケース | 種別 |
|---|------------|------|
| 10 | `generateActionsMarkdown` 関数がエクスポートされている | 正常系 |
| 11 | 構造化JSONを受け取り文字列を返す | 正常系 |
| 12 | 出力 Markdown にホットスポットファイル名が含まれる | 正常系 |
| 13 | 空の入力配列でも空文字ではなく最低限の構造を返す | 異常系 |

### 受け入れ条件3: CLI スクリプトで actions.md を出力できる

**Given** hotspots.json と dependency-graph.mmd が存在する
**When** CLI を `--hotspots` `--graph` `--out` 指定で実行する
**Then** actions.md が生成され、Markdown 形式でファイル名を含む

| # | テストケース | 種別 |
|---|------------|------|
| 14 | `scripts/refactoring-proposal.js` が存在する | 存在確認 |
| 15 | actions.md が生成される | 正常系 |
| 16 | actions.md は空でない | 正常系 |
| 17 | actions.md にリファクタリング対象ファイル名が含まれる | 正常系 |
| 18 | actions.md が Markdown 形式である（見出しを含む） | 正常系 |

### 受け入れ条件4: SKILL.md として独立呼び出し可能な形に整備されている

| # | テストケース | 種別 | 担当タスク |
|---|------------|------|---------|
| 19 | `CodeCompass/SKILL.md` が存在する | 存在確認 | #1217 |
| 20 | SKILL.md に `/codecompass` コマンド定義が含まれる | 正常系 | #1217 |

> **注意**: テスト #19〜20 は #1217（SKILL.md 整備）完了後に GREEN になる。
> #1216（本タスク）完了時点では RED が正しい状態。

---

## カバレッジサマリー

| 受け入れ条件 | テスト数 | 状態（#1216完了時点） |
|------------|---------|-------------------|
| 受け入れ条件1: buildStructuredJson | 9 | ✅ GREEN |
| 受け入れ条件2: generateActionsMarkdown | 4 | ✅ GREEN |
| 受け入れ条件3: CLI で actions.md 出力 | 5 | ✅ GREEN |
| 受け入れ条件4: SKILL.md 整備 | 2 | 🔴 RED（#1217 待ち） |

合計: 20件（うち 19件 GREEN / 1件 RED）

---

## RED 状態ガード

`lib/refactoring-proposal.js` または `scripts/refactoring-proposal.js` が存在しない場合は、
それ以降の依存テストをスキップし、存在確認テストのみが RED として記録される設計とする。
