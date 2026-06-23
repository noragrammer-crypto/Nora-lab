# リファクタリング提案エンジン仕様

## 概要

`hotspots.json`（ホットスポット判定出力）と `dependency-graph.mmd`（依存グラフ Mermaid 出力）を統合し、
構造化 JSON を生成して xp_Architect 形式のリファクタリング提案 Markdown（`actions.md`）を出力する。
CodeCompass のレイヤー3（AIアーキテクト連携）に当たる。

関連イシュー: [#1216](../issues/issue-1216.MD)（構造化JSON生成・リファクタリング提案エンジン実装）

---

## lib/refactoring-proposal.js

### buildStructuredJson(hotspots, mmdContent)

hotspots 配列と Mermaid 依存グラフ文字列を統合し、構造化 JSON を返す。

**引数**

| 引数 | 型 | 説明 |
|------|----|------|
| `hotspots` | `Array` | hotspot.js の出力配列（`hotspotScore, complexity, changes, loc, linesChanged` を含む） |
| `mmdContent` | `string` | dependency-graph.js の出力 Mermaid 文字列（空文字も可） |

**返り値**

```json
[
  {
    "file": "path/to/file.js",
    "hotspot_score": 0.82,
    "complexity": 34,
    "changes_90d": 120,
    "callers": 8,
    "callees": 12
  }
]
```

**フィールド変換規則**

| 入力フィールド | 出力フィールド | 備考 |
|--------------|--------------|------|
| `hotspotScore` | `hotspot_score` | スネークケースに変換 |
| `changes` | `changes_90d` | 変数名を意味的に変換 |
| `loc`, `linesChanged` | （除外） | コード本体情報は出力しない |
| MMD エッジの from 側登場回数 | `callees` | 自ファイルが呼ぶファイル数 |
| MMD エッジの to 側登場回数 | `callers` | 他ファイルから呼ばれる回数 |

**MMD エッジ解析**

以下の両形式に対応する:
- `"a.js" -->|calls| "b.js"` （dependency-graph.js 出力形式）
- `a.js --> b.js`（引用符なし・アノテーションなし）

mmdContent が空文字の場合、全エントリの `callers` と `callees` は 0 になる。

---

### generateActionsMarkdown(structuredJson)

構造化 JSON 配列から xp_Architect プロンプト形式のリファクタリング提案 Markdown を生成する。

**引数**

| 引数 | 型 | 説明 |
|------|----|------|
| `structuredJson` | `Array` | `buildStructuredJson` の出力 |

**返り値**

Markdown 文字列（`string`）。空配列を渡した場合も有効な Markdown を返す（エラーにならない）。

**出力構造**

```markdown
# CodeCompass リファクタリング提案

## ホットスポット一覧
| file | hotspot_score | complexity | changes_90d | callers | callees |
...

## リファクタリング提案
### `<file>`
- hotspot_score: ...
- complexity: ...
- callers: ... / callees: ...
- <提案メッセージ>
```

**提案ロジック**

`hotspot_score === 0` のエントリは提案対象から除外される（ホットスポット一覧には表示される）。

| 条件 | 提案内容 |
|------|---------|
| `complexity >= 20` | IPO分離またはメソッド抽出でモジュールを分割することを推奨 |
| `callers >= 5` | 変更時の影響範囲が広いためインターフェースを安定させること |
| `callees >= 5` | 依存関係逆転原則（DI）の適用を検討 |
| 上記のどれにも該当しない | 変更頻度と複雑度の組み合わせによりリファクタリング候補として検出。定期的なレビューを推奨 |

---

## scripts/refactoring-proposal.js（CLI）

```
node CodeCompass/scripts/refactoring-proposal.js
  [--hotspots=<path>]   省略時: codecompass/hotspots.json
  [--graph=<path>]      省略時: codecompass/dependency-graph.mmd
  [--out=<path>]        省略時: codecompass/actions.md
```

**動作**

1. `--hotspots` で指定されたファイルから hotspots JSON を読み込む
2. `--graph` で指定された Mermaid ファイルを読み込む（存在しない場合は空文字として扱う）
3. `buildStructuredJson` で統合し、`generateActionsMarkdown` で Markdown を生成する
4. 出力先の決定:
   - `--out` 指定時: 指定ファイルに書き出す（ディレクトリが存在しない場合は自動作成）
   - オプション未指定（すべてデフォルト）: `codecompass/actions.md` に書き出し、かつ標準出力にも出力する
   - `--hotspots`/`--graph` は指定したが `--out` は省略: 標準出力のみに出力する

**エラーハンドリング**

- `--hotspots` ファイルが存在しない場合: stderr に Usage を出力し、exit code 1 で終了する
- `--hotspots` が未指定かつデフォルトパス（`codecompass/hotspots.json`）が存在しない場合: 同上

---

## 設計原則

- コードそのものを構造化 JSON に含めない（判断ブレ防止）
- 既存 `lib/*.js` の純粋関数パターンに従う（I/O なし、引数→戻り値のみ）
- 依存グラフファイルが存在しない環境でも動作する（graph なしで `callers=0, callees=0`）
