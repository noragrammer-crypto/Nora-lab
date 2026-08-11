# Nora-lab 公開パイプライン（`make sync-nora-lab` + `make publish-nora-lab`）

SoloXP フレームワーク本体をパブリックリポジトリ `noragrammer-crypto/Nora-lab` へ公開するための同期・公開手順（#2168 Phase3、#2761で継続同期方式を再設計）。

## 設計の全体像（#2761）

継続同期を「初回分離」「Private→Public」「Public→Private」の3つの役割に分け、それぞれ別の仕組みで扱う。

| 役割 | 頻度 | 手段 |
|---|---|---|
| 初回分離: 公開リポジトリの新規作成 | 一度きり | `git subtree split --prefix=Nora-lab` で履歴を切り出す |
| 継続 Private → Public | 都度 | **`make publish-nora-lab`**（公開HEAD基準のsnapshot/diff commit） |
| 継続 Public → Private | 都度 | `git subtree pull --prefix=Nora-lab nora-lab main --squash` |

### なぜ継続同期を作り直したか（2026-08-06の事故）

`git subtree push`（split方式）は「`Nora-lab/`に一度でも触れた全コミット」を祖先グラフに沿って辿る。
公開リポジトリが既に独立した履歴を持ち、そこで直接作業もされる状態になった後は、継続同期のたびに
Private側の履歴を再投影する必要はない。必要なのは「公開HEADを基準に、現在のスナップショットとの
差分を1コミット積む」ことだけである。

しかし旧方式（`git subtree split --prefix=Nora-lab` を継続同期にも使い回す）では、本体側で無関係な
事故（PR #2426の誤削除→PR #2428のrevert）が起きると、そのrevertコミットが `Nora-lab/` パスにも
触れる形になり、`git subtree split` から見て「`Nora-lab/`に関係するコミット」として本体の全履歴
（3月のAIchats一括syncコミット、Discordトークン含む）を祖先に持つことになった。2026-08-06の
`git subtree push` はこの汚染された祖先グラフを忠実に公開リポジトリへ運んでしまった（詳細: #2761）。

「`Nora-lab/`を`git rm -r`で削除→`git subtree add --squash`で再追加」という事後対応（#2760）も
検証の結果、汚染系統を切り離せないことが判明した。同じブランチの上に新しいコミットを積む限り、
その新しいコミット自身が本体の全履歴を祖先に持つため、境界を作れない（#2760コメント参照）。

**結論: 継続同期そのものから「本体の履歴を祖先グラフとして辿る」操作（subtree split/push）を排除する。**

## Step 1: `make -C SoloXP sync-nora-lab`

**実装**: `SoloXP/Makefile`

正本（`SoloXP/` 全体 + `workflow/skills/ProcessIssue`）を `Nora-lab/tools/SoloXP/Ja` へ同期する。
このステップの実装・設計は #2761 による変更を受けない（従来通り）。

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

## Step 2: `make -C SoloXP publish-nora-lab`（#2761で新設。`git subtree push` は使わない）

**実装**: `SoloXP/scripts/publish-nora-lab.sh`（`SoloXP/Makefile` の `publish-nora-lab` ターゲットから呼ばれる）

`Nora-lab/`（Step 1 の同期結果を含む）を公開リポジトリ `noragrammer-crypto/Nora-lab` へ反映する。

### 方式: 公開HEAD基準のsnapshot/diff commit

1. 公開リポジトリを `--depth 1` でclone する。この時点でPrivate側の履歴とは物理的に無関係（ローカルの
   一時clone上に、公開HEADより前のコミットは1件も存在しない）
2. cloneした作業ツリーの追跡ファイルを全て削除し、`Nora-lab/` の中身で丸ごと置き換える
   （`sync-nora-lab` と同様、正本側で削除済みのファイルも公開側から消える）
3. 差分があれば1コミットとして積む。**このコミットの親は公開HEADただ1つだけ**であり、Private側の
   履歴（本体の私的コミット・AIchats/等）を祖先グラフに持ち込むことは構造的に不可能
4. 新規ブランチとして `git push` する

差分がない場合はpushをスキップする（no-op）。

### なぜこの方式で事故が構造的に起こらないか

`git subtree split/push` は「本体リポジトリのどのコミットが `Nora-lab/` に触れたか」を本体の
コミットグラフ全体から辿る。本体側の無関係な事故（誤削除・revert等）が `Nora-lab/` パスに
触れる形になっただけで、汚染された祖先グラフが計算に混入する。

`publish-nora-lab.sh` は本体リポジトリの `.git` 履歴を祖先として一切参照しない。祖先として持つのは、
cloneした時点の公開HEAD1件だけである。

`SoloXP/tests/functional/issue-2761-publish-nora-lab-snapshot.functional.test.js` に、Private側の
履歴を意図的に汚染（無関係な履歴とのマージ）させても公開側のコミット数が変化しないことを検証する
回帰テストがある。

### 追加の安全対策（PR #2762 Codexレビュー指摘）

初版実装には以下2点の抜けがあり、PR #2762でのレビューで指摘され修正済み:

1. **未トラッキングファイルの誤公開防止**: `cp -r` でスナップショットディレクトリを物理コピーすると、
   本体側の `.gitignore`（例: `Nora-lab/.env`）で除外されているだけで実体は存在するファイルが、
   独立したclone先では除外ルールの対象外になり `git add -A` でそのまま公開されてしまう。
   `publish-nora-lab.sh` はスナップショットディレクトリが必ずgitリポジトリ配下にあることを要求し、
   `git ls-files`（tracked filesのみ）を列挙してコピーすることでこれを防ぐ。gitに追跡されていない
   ファイルは、その理由（gitignore・単なる未addなど）を問わず一切コピー対象にならない。
2. **公開側の未取り込み変更の検知**: 公開側でオーナーが直接push・PRした変更が、private側へ
   `git subtree pull --squash` でまだ取り込まれていない状態で `publish-nora-lab.sh` を実行すると、
   旧方式（`git subtree push`）ならnon-fast-forwardで拒否されていたが、新方式はcloneし直す時点で
   常に最新の公開HEADを基準にするため拒否されず、その未取り込み変更を静かに削除・巻き戻す形の
   コミットを作ってしまいかねない。これを防ぐため、private側の直近の`git subtree pull/add --squash`
   コミットに埋め込まれる `git-subtree-split: <sha>` トレーラーを「最後に取り込んだ公開側コミットSHA」
   として読み取り、実際の公開HEADと食い違っていれば中断する。意図的に上書きする場合は環境変数
   `NORA_LAB_ALLOW_DIVERGED_PUBLISH=1` を設定する。

### 公開先のブランチ保護・PRフロー（従来と同じ）

公開リポジトリの `main` は branch protected のため直push不可。生成されたブランチを公開側へpushし、
公開リポジトリ側でPRを発行してオーナーがマージする（`Makefile`の`NORA_LAB_PUBLISH_BRANCH`で
ブランチ名を上書き可能）。

公開側で直接push・PRされた変更（記事追加等）がある場合でも、`publish-nora-lab.sh` は毎回
公開HEADを最新clone基準にするため、旧方式のような non-fast-forward 拒否は発生しない
（cloneし直す時点で常に最新の公開HEADを基準にしているため）。

### ClaudeCode Web セッションでの実行について

ClaudeCode Web セッションはアウトバウンドの `git push` がプロキシでブロックされる
（GitHub MCP スコープ外のリポジトリへの `git push` は403になる。`Nora-lab/CLAUDE.md`参照）。
この場合は同じ「公開HEAD基準の1コミット」という設計原則を、GitHub Contents API
（`GET/PUT /repos/.../contents/<path>` + `POST /repos/.../pulls`）で実現する代替手順を
`Nora-lab/CLAUDE.md`「Syncing from Claude Code Web」に記載している。どちらの手段も
「本体の履歴を辿らない」という設計原則は同じであり、環境差による実装（transport）の違いに過ぎない。

## 初回分離（`git subtree split`）— 一度きりの操作、継続同期には使わない

新しい公開リポジトリを一から作る場合のみ、`git subtree split --prefix=Nora-lab` で履歴を切り出す。
この操作はリポジトリのブートストラップ時にのみ実行し、継続的な同期には使わない（#2761）。

## 相対リンクの境界チェック（`workflow/scripts/check-relative-links.js`）

`Nora-lab/` が公開リポジトリのルートになるため、`Nora-lab/` の外を指す相対リンク・存在しない
ファイルを指す相対リンクは公開側でリンク切れになる。`checkBrokenRelativeLinks(scanDir, boundaryDir)`
がこれを検出する（#2643）。この検証はStep2の方式変更（#2761）とは独立しており、影響を受けない。

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
- 継続同期の再設計（本ドキュメントの前提）: #2761
