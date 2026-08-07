# Nora-lab 公開パイプライン（`make sync-nora-lab` + `git subtree push`）

SoloXP フレームワーク本体をパブリックリポジトリ `noragrammer-crypto/Nora-lab` へ公開するための同期・公開手順（#2168 Phase3）。

## 全体像

```
正本（HolyAutomater モノレポ）              公開先（Nora-lab）
─────────────────────────────         ─────────────────────
SoloXP/（skills/xp_* + doc/tests等）  ─┐
workflow/skills/ProcessIssue          ─┼─▶ Nora-lab/tools/SoloXP/Ja/
                                        │   （make sync-nora-lab）
                                        │
Nora-lab/                             ─┴─▶ noragrammer-crypto/Nora-lab（main）
                                            （git subtree push --prefix=Nora-lab）
```

2段階の同期になっている理由:
1. `Nora-lab/` は本モノレポ内のローカル作業コピー（`git subtree` の管理対象ディレクトリ）
2. `git subtree push` は `Nora-lab/` の内容をそのまま公開リポジトリのルートとして運ぶため、
   まず `SoloXP/` の内容を `Nora-lab/tools/SoloXP/Ja` へコピーしてから subtree push する

## Step 1: `make -C SoloXP sync-nora-lab`

**実装**: `SoloXP/Makefile`

正本（`SoloXP/` 全体 + `workflow/skills/ProcessIssue`）を `Nora-lab/tools/SoloXP/Ja` へ同期する。

- 同期先を `rm -rf` で作り直してから `cp -r` で実体コピーするため、正本側で削除済みのファイルも
  同期先から消える（`--delete` 相当）
- `rsync` コマンドには依存しない（実行環境によっては未導入のため）。`find -print0` +
  `while IFS= read -r -d ''` でNUL区切り列挙し、スペースを含むファイル名も正しく扱う
  （#2734 Codexレビュー指摘で発覚・修正。`for entry in $(ls -A ...)` は単語分割の対象になり
  スペース入りファイル名が静かに欠落する）
- `SHELL := /bin/bash`（`read -d ''` がdash等のPOSIX shにないbash拡張のため明示指定）

### 同期対象からの除外（`EXCLUDE`）

| 除外エントリ | 理由 |
|---|---|
| `node_modules` | 生成物 |
| `.git` | リポジトリメタデータ |
| `package-lock.json` | ローカル専用 |
| `Makefile` | 本Makefile自体 |
| `tests` | `SoloXP/tests/` はモノレポ構造（`dotfiles/`・`.claude/hooks/pre-push.sh`・`SoloXP/Makefile`自体等）への相対パス依存が大半で、公開先単体（`Nora-lab/tools/SoloXP/Ja`）にコピーすると `REPO_ROOT` の解決先がずれて `ENOENT` になる（Nora-lab PR #20 Codexレビュー指摘、#2643）。テスト内容は `docs/tests/{UnitTests,FunctionTests,E2ETests}/` のドキュメントとして公開側でも参照可能なため、実行可能な形での公開は行わずソースのみ除外する |

### `workflow/skills/ProcessIssue` の追加同期

`ProcessIssue` は Solo XP フレームワーク実行に必要な workflow 全体のトリアージ役だが、`SoloXP/` の
外（`workflow/skills/`）に配置されているため、`SoloXP/` 本体のコピーとは別に
`Nora-lab/tools/SoloXP/Ja/skills/ProcessIssue/` へ追加でコピーする。

### `package.json` のテスト関連設定除去

`tests` を除外した結果、同期先で `npm test` 等を実行すると "No tests found" になるだけの
誤解を招く記載が残るため、`sync-nora-lab` 実行時に同期先の `package.json` から
`scripts.test`・`scripts.test:unit`・`scripts.test:functional`・`scripts.test:e2e`・
`jest` 設定・`devDependencies.jest` を削除する（PR #2737 Codexレビュー指摘）。

## Step 2: `git subtree push --prefix=Nora-lab nora-lab main`

`Nora-lab/`（Step 1 の同期結果を含む）を公開リポジトリ `noragrammer-crypto/Nora-lab` の `main`
ブランチへ反映する。

- 公開リポジトリの `main` は branch protected のため直push不可。`git subtree push` で計算した
  split commit を新規ブランチとして push し、公開リポジトリ側でPRを発行してオーナーがマージする
- 公開側で直接push・PRされた変更（記事追加等）がある場合は non-fast-forward で拒否されるため、
  先に `git subtree pull --prefix=Nora-lab nora-lab main --squash` で取り込んでコンフリクトを
  解消してから push する

## 相対リンクの境界チェック（`workflow/scripts/check-relative-links.js`）

`git subtree push` で `Nora-lab/` が公開リポジトリのルートになるため、`Nora-lab/` の外を指す
相対リンク・存在しないファイルを指す相対リンクは公開側でリンク切れになる。
`checkBrokenRelativeLinks(scanDir, boundaryDir)` がこれを検出する（#2643）。

- 境界外を指すリンク・存在しないファイルへのリンクを壊れていると判定する
- http(s)・アンカーのみ・mailtoリンクは対象外
- アンカー付き相対リンクはアンカーを除いた実ファイルの存在で判定する

この検証により、`SoloXP/docs/spec/README.md`・`xp_reviewer.md` にあった相対リンク深さの既存バグ
（`SoloXP/docs/spec/` から2階層上を指すべきところが1階層上になっていた）が発覚・修正された。
Nora-lab公開範囲外（`workflow/`・`AINovelGenerator/` 配下）を指す仕様書リンクは、リンクから
モノレポ内パス表記に変更した（README.md「非xp_系スキルの仕様書について」節参照）。

## 関連

- スキル同期（正本→バイナリ、Phase1/2）: `docs/skill-files-sync.md`（モノレポ内パス。Nora-lab公開範囲外のためリンクではなくパス表記）
- 公開先: [noragrammer-crypto/Nora-lab](https://github.com/noragrammer-crypto/Nora-lab)
- 親ストーリー: #2168
