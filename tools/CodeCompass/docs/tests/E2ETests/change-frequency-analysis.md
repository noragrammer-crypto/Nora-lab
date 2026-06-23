# E2E Tests: CodeCompass 変更頻度分析エンジン（Story #1176）

テストファイル: `CodeCompass/__tests__/e2e/change-frequency-analysis.e2e.test.js`

テストフレームワーク: Jest（`execSync` で CLI を実行する受け入れテスト）

テスト対象: `CodeCompass/scripts/change-frequency.js <repoPath> [--days=<N>] [--out=<path>]`

フィクスチャ: `buildFixtureRepo()` が `GIT_AUTHOR_DATE` / `GIT_COMMITTER_DATE` で
コミット日時を固定した決定論的な一時 git リポジトリを構築する

---

## フィクスチャのコミット履歴

| コミット | 経過日数 | 内容 | 直近90日内か |
|---|---|---|---|
| `legacy: large rewrite of b.js` | 200日前 | `b.js` を50行追加 | ❌（90日ウィンドウ外） |
| `feat: add a.js and c.js` | 40日前 | `a.js`(+10行) `c.js`(+8行) を新規追加 | ✅ |
| `feat: extend a.js (1)` | 20日前 | `a.js` に+3行 | ✅ |
| `feat: extend a.js (2) and c.js` | 5日前 | `a.js`に+2行 `c.js`に+4行 | ✅ |
| `feat: small tweak to b.js` | 2日前 | `b.js` に+5行 | ✅ |

**期待される直近90日（デフォルト）の集計結果:**

| ファイル | changes | linesChanged | 順位 |
|---|---|---|---|
| `a.js` | 3 | 15 (10+3+2) | 1位 |
| `c.js` | 2 | 12 (8+4) | 2位 |
| `b.js` | 1 | 5 | 3位 |

---

## テスト一覧

### 1. scripts/change-frequency.js が存在する

**シナリオ概要**: 実装タスク #1182 完了前は RED、完了後は GREEN になる存在確認

| ステップ | 種別 | 内容 |
|---|---|---|
| Then | 検証 | `fs.existsSync(SCRIPT_PATH)` が `true` |

---

### 2. 受け入れ条件1: 任意のリポジトリパスに対して変更頻度集計を実行できる

**シナリオ概要**: フィクスチャリポジトリを指定して CLI を実行し、出力ファイルが生成されること

| ステップ | 種別 | 内容 |
|---|---|---|
| Given | 前提 | `buildFixtureRepo()` で一時 git リポジトリを構築する |
| When | 操作 | `node scripts/change-frequency.js "<repoDir>" --out="<outPath>"` を実行する |
| Then | 検証 | `outPath` にファイルが生成されている |
| Then | 検証 | 出力が JSON として解釈できる配列であり、要素数が1件以上 |

---

### 3. 受け入れ条件2: ファイルごとの「変更回数」「変更行数（追加+削除）」を取得できる

**シナリオ概要**: 各エントリのフィールド型と、フィクスチャの期待値との一致を検証する

| ステップ | 種別 | 内容 |
|---|---|---|
| Then | 検証 | 各エントリが `file: string` / `changes: number` / `linesChanged: number` を持つ |
| Then | 検証 | `a.js` は `changes: 3, linesChanged: 15`（10+3+2） |
| Then | 検証 | `c.js` は `changes: 2, linesChanged: 12`（8+4） |
| Then | 検証 | `b.js` は `changes: 1, linesChanged: 5`（90日ウィンドウ内の直近コミットのみ） |

---

### 4. 受け入れ条件3: 変更頻度降順でランキングされた構造化データ（JSON）を出力できる

**シナリオ概要**: 出力配列が `changes` 降順でソートされていることを検証する

| ステップ | 種別 | 内容 |
|---|---|---|
| Then | 検証 | 隣接する要素間で `changes[i-1] >= changes[i]` が成立する |
| Then | 検証 | `a.js`（3） > `c.js`（2） > `b.js`（1）の順でランキングされる |

---

### 5. 受け入れ条件4: 集計期間（デフォルト90日）をオプションで指定できる

**シナリオ概要**: `--days` 省略時はデフォルト90日、指定時は指定期間が適用されることを検証する

| ステップ | 種別 | 内容 |
|---|---|---|
| Given | 前提 | `b.js` は200日前に+50行の legacy リライトコミットを持つ |
| When | 操作 | `--days` を指定せずに実行する |
| Then | 検証 | `b.js` の `changes` は `1`、`linesChanged` は `5`（200日前のコミットを含まない） |
| When | 操作 | `node scripts/change-frequency.js "<repoDir>" --days=365 --out="<widePath>"` を実行する |
| Then | 検証 | `b.js` の `changes` は `2`、`linesChanged` は `55`（50 legacy + 5 直近、200日前のコミットを含む） |

---

## カバレッジサマリー

| 受け入れ条件 | テスト数 | 状態 |
|---|---|---|
| AC1: 任意のリポジトリパスに対して実行できる | 2 | ✅ |
| AC2: 変更回数・変更行数を取得できる | 4 | ✅ |
| AC3: 変更頻度降順でランキングされた JSON を出力できる | 2 | ✅ |
| AC4: 集計期間をオプションで指定できる | 2 | ✅ |
| 存在確認 | 1 | ✅ |

合計: 11件 — 全 GREEN（実装タスク #1182 完了により RED → GREEN に移行）
