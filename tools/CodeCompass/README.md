# CodeCompass

git 履歴とAST解析から「変更頻度 × 複雑度」のホットスポットを検出するツール。
詳細なコンセプト・設計は `CLAUDE.md` を参照。

**導入手順（ダウンロード・インストール・CI登録・動作確認）は [`docs/installmanual-handoff2ai.md`](./docs/installmanual-handoff2ai.md) を参照。**

## 使い方

```bash
node CodeCompass/scripts/hotspot.js <repoPath> [--days=<N>] [--out=<path>] [--md=<path>] [--ignore=<pattern,...>]
```

| オプション | 説明 |
|---|---|
| `--days=<N>` | 集計期間（デフォルト 90 日） |
| `--outDir=<dir>` | `hotspots.json` / `hotspots.md` を出力するディレクトリ |
| `--out=<path>` | JSON 出力先ファイル（省略時は標準出力） |
| `--md=<path>` | Markdown テーブル出力先ファイル |
| `--ignore=<pattern,...>` | 追加の除外パターン（カンマ区切りで複数指定可） |

## 対応言語・スコープ

各分析エンジンが対象とする言語・記法は機能ごとに異なる。

| 分析 | 対象 | 備考 |
|---|---|---|
| 変更頻度分析（`change-frequency.js`） | git管理下のすべてのファイル | `git log --numstat` のみに依存するため言語不問 |
| 複雑度分析（`complexity-score.js`） | `.js` / `.py` のみ | 他拡張子のファイルは複雑度算出の対象外（解析自体が行われない） |
| 依存グラフ（`dependency-graph.js`） | CommonJS の `require()` のみ | ES Modules（`import`）・TypeScript・他言語の依存解析は未対応 |

`hotspots.md` のスコア（`(変更頻度 × 複雑度) / LOC`）は複雑度が算出できないファイル（`.js` / `.py` 以外）では常に `0` になり、ランキングに現れない。
TypeScript / Ruby 等への対応は今後のロードマップ（`CLAUDE.md` の「対応言語ロードマップ」参照）であり、現時点では未対応。

## 除外ルール

ホットスポット分析の対象から外すファイル・ディレクトリは、以下の3種類が
この優先順で統合される（`lib/exclude-patterns.js` の `resolveExcludePatterns`）。

1. **デフォルト除外パターン**（常に適用）
   ```
   dist/
   build/
   node_modules/
   .obsidian/
   *.min.js
   *-lock.json
   package-lock.json
   yarn.lock
   ```
2. **`.codecompassignore`**（分析対象リポジトリのルートに置く。任意）
   - 1行1パターン。空行・`#` で始まる行は無視する。
   - 例:
     ```
     # generated files
     coverage/
     *.generated.js
     ```
3. **`--ignore=<pattern,...>`**（CLI 指定。任意）
   - カンマ区切りで複数パターンを指定できる。
   - 例: `--ignore=tmp/,*.snap`

### パターン記法

- 末尾が `/` のパターンはディレクトリ指定で、パスの各セグメントと完全一致するかを見る
  （例: `dist/` は `src/dist/index.js` の `dist` セグメントにマッチする）。
- それ以外は `*` のみ対応する glob パターンとして扱い、相対パス全体・ファイル名（basename）の
  両方に対してマッチを試みる（例: `*.min.js` は `dist/app.min.js` にもマッチする）。

除外判定は変更頻度分析（`lib/change-frequency.js`）・複雑度分析（`lib/complexity-score.js`）の
両方に適用される。

## GitHub Actions での利用

PR 作成時にホットスポット分析を自動実行するサンプルワークフローを `.github/workflows/codecompass.yml` に用意している。

```yaml
name: CodeCompass Hotspot Analysis

on:
  pull_request:

jobs:
  hotspots:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm install
        working-directory: CodeCompass
      - run: node scripts/hotspot.js .. --outDir=../codecompass
        working-directory: CodeCompass
      - uses: actions/upload-artifact@v4
        with:
          name: codecompass-hotspots
          path: codecompass/hotspots.md
```

`hotspots.md` はワークフロー実行結果のアーティファクトとして保存され、ダウンロードして確認できる。
さらにサンプルでは Top10 のホットスポットを PR コメントとして自動投稿するオプションステップも含む。
自分のリポジトリで使う場合は、この `.github/workflows/codecompass.yml` をそのままコピーすれば動作する。

## 現在のプロジェクトステータス（MVP）

CodeCompassは拡張可能な設計だが、**現時点でサポートしている範囲は以下に限定される**。導入前に必ず確認すること。

| 項目 | 現状 |
|---|---|
| 実装言語 | Node.js（JavaScript） |
| 動作環境 | GitHub Actions経由のみ（ローカル単体実行はシャロークローンの制約で変更頻度が不正確になるため非対応。詳細は[`docs/installmanual-handoff2ai.md`](./docs/installmanual-handoff2ai.md)） |
| Node.jsバージョン | CI実証済みは `22`。ハード制限ではないが、他バージョンでの動作は未検証 |
| 対応言語（分析対象） | 複雑度分析・依存グラフ生成は JS / Python のみ（TypeScript・Rubyは未対応。ロードマップは`CLAUDE.md`の「対応言語ロードマップ」参照） |

### 想定ユーザー（現時点）

- JavaScript / Python で書かれた個人開発・小規模チームのリポジトリを GitHub 上で運用している人
- リファクタリング優先度をCIで自動検知したい人

上記以外（他言語メイン・GitHub以外でのCI運用・ローカル単体での厳密な分析）は現時点では想定外。対応拡大は今後のロードマップ。
