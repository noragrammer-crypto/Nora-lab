# E2E Tests: CodeCompass 複雑度スコアリングエンジン（Story #1177）

テストファイル: `CodeCompass/__tests__/e2e/complexity-score.e2e.test.js`

テストフレームワーク: Jest（`execSync` で CLI を実行する受け入れテスト）

テスト対象: `CodeCompass/scripts/complexity-score.js <repoPath> [--out=<path>]`

フィクスチャ: `buildFixtureRepo()` が複雑度・LOC が既知の固定ファイル群を持つ一時リポジトリを構築する
（`else-if` チェーンや `switch`/`case` は数え方の解釈揺れを避けるため固定ファイルには含めない）

---

## フィクスチャのファイル構成

| ファイル | 制御フロー数 | LOC | 備考 |
|---|---|---|---|
| `low-complexity.js` | 0 | 5 | 制御フローなし |
| `low_complexity.py` | 0 | 2 | 制御フローなし |
| `src/high-complexity.js` | 4（for + if + while + if） | 18 | サブディレクトリ配下 |
| `src/high_complexity.py` | 4（for + if + while + if） | 13 | サブディレクトリ配下 |
| `README.md` | — | — | 対象外拡張子（カウント対象外であることを確認する） |

---

## テスト一覧

### 1. scripts/complexity-score.js が存在する

**シナリオ概要**: 実装タスク #1185 完了前は RED、完了後は GREEN になる存在確認

| ステップ | 種別 | 内容 |
|---|---|---|
| Then | 検証 | `fs.existsSync(SCRIPT_PATH)` が `true` |

---

### 2. 受け入れ条件1: JS ファイルの制御フローを AST 解析でカウントし複雑度スコアを算出できる

**シナリオ概要**: フィクスチャの JS ファイルに対して、制御フローなし／ありそれぞれの複雑度が一致すること

| ステップ | 種別 | 内容 |
|---|---|---|
| Given | 前提 | `buildFixtureRepo()` で一時リポジトリを構築し、`--out` 指定で CLI を実行する |
| Then | 検証 | `low-complexity.js` の `complexity` は `0` |
| Then | 検証 | `src/high-complexity.js` の `complexity` は `4`（for(1) + if(1) + while(1) + if(1)） |

---

### 3. 受け入れ条件2: Python ファイルも同様に複雑度スコアを算出できる

**シナリオ概要**: フィクスチャの Python ファイルに対して、制御フローなし／ありそれぞれの複雑度が一致すること

| ステップ | 種別 | 内容 |
|---|---|---|
| Then | 検証 | `low_complexity.py` の `complexity` は `0` |
| Then | 検証 | `src/high_complexity.py` の `complexity` は `4`（for(1) + if(1) + while(1) + if(1)） |

---

### 4. 受け入れ条件3: ファイルごとの LOC（行数）も合わせて取得できる

**シナリオ概要**: 各エントリのフィールド型と、フィクスチャの実際の行数との一致を検証する

| ステップ | 種別 | 内容 |
|---|---|---|
| Then | 検証 | 各エントリが `file: string` / `complexity: number` / `loc: number` を持つ |
| Then | 検証 | `low-complexity.js` の `loc` は `5`、`low_complexity.py` は `2` |
| Then | 検証 | `src/high-complexity.js` の `loc` は `18`、`src/high_complexity.py` は `13` |

---

### 5. 受け入れ条件4: 複雑度スコア + LOC を構造化データ（JSON）として出力できる

**シナリオ概要**: 出力ファイルが生成され、対象拡張子のみを含む JSON 配列であることを検証する

| ステップ | 種別 | 内容 |
|---|---|---|
| When | 操作 | `node scripts/complexity-score.js "<repoDir>" --out="<outPath>"` を実行する |
| Then | 検証 | `outPath` にファイルが生成されている |
| Then | 検証 | 出力は JSON として解釈できる配列であり、要素数は `4`（`.js`/`.py` のみ。`README.md` を含まない） |
| Then | 検証 | サブディレクトリ配下のファイルもリポジトリルートからの相対パス（`/` 区切り）で含まれる |

---

## カバレッジサマリー

| 受け入れ条件 | テスト数 | 状態 |
|---|---|---|
| AC1: JS ファイルの複雑度を AST 解析で算出できる | 2 | ✅ |
| AC2: Python ファイルも同様に複雑度を算出できる | 2 | ✅ |
| AC3: ファイルごとの LOC を取得できる | 2 | ✅ |
| AC4: 複雑度 + LOC を構造化データ（JSON）として出力できる | 3 | ✅ |
| 存在確認 | 1 | ✅ |

合計: 10件 — 全 GREEN（実装タスク #1185 完了により RED → GREEN に移行）
