# Issue #2761: [Bug] Nora-lab subtreeの汚染を検知する事前チェックが存在しない（本体の私的履歴が公開リポジトリへ漏洩した実績あり）

- URL: https://github.com/noragrammer-crypto/HolyAutomater/issues/2761

## 概要

`git subtree push --prefix=Nora-lab` を実行する前に、「`Nora-lab/`の祖先履歴がHolyAutomater本体の
私的コミット履歴と混ざっていないか」を検知する仕組みが存在しなかった。2026-08-06、実際に本体の
私的履歴（2026-03のAIchats一括syncコミット、Discord Botトークンを含む）が公開リポジトリ
`noragrammer-crypto/Nora-lab` のmainへ流出する事故が発生した（経緯はGitHub Issue本文参照）。

事故発覚後の追記コメントで、「`Nora-lab/`を`git rm -r`で削除→`git subtree add --squash`で再追加」
という事後対応（PR #2760）でも汚染系統を切り離せないことが実証され、恒久対応として
「継続同期そのものから `git subtree push`（history-preserving方式）を廃止する」方針が決定した。

## 決定した対応方針（本イシューのスコープ）

「初回分離」と「継続同期」を別物として設計し直す:

| 役割 | 頻度 | 手段 |
|---|---|---|
| 初回分離: 公開リポジトリの新規作成 | 一度きり | `git subtree split --prefix=Nora-lab` |
| 継続 Private → Public | 都度 | 公開HEAD基準のsnapshot/diff commit（新設: `make publish-nora-lab`） |
| 継続 Public → Private | 都度 | `git subtree pull --prefix=Nora-lab nora-lab main --squash`（変更なし） |

公開リポジトリが既に独立した履歴を持ち、そこで直接作業もされる状態になった後は、継続同期のたびに
「Private側の履歴を再投影する」（=subtree split/push）必要はない。必要なのは、公開HEADを親にして、
現在のスナップショットとの差分を1コミット積むことだけ。この方式は「本体の`.git`履歴を一切参照しない」
ため、本体側でどんな事故（誤削除・revert等）が起きても、その祖先グラフが公開側へ運ばれることが
構造的に不可能になる。当初の受け入れ条件にあった「汚染を検知する事前チェック」は、この再設計により
「検知」ではなく「発生させない」設計へと置き換えられる。

## 実装

- `SoloXP/scripts/publish-nora-lab.sh`: 新規。公開リポジトリを `--depth 1` でcloneし、追跡ファイルを
  スナップショット（`Nora-lab/`）で置き換えて1コミット積み、新規ブランチとしてpushする
- `SoloXP/Makefile`: `publish-nora-lab` ターゲットを新設し、上記スクリプトを呼び出す
  （`NORA_LAB_REMOTE_URL`・`NORA_LAB_BASE_BRANCH`・`NORA_LAB_PUBLISH_BRANCH`・
  `NORA_LAB_COMMIT_MESSAGE` で上書き可能）
- `SoloXP/docs/spec/nora_lab_publish.md`: Step 2 を全面改訂。新方式の設計と、事故が構造的に
  起こらない理由を記載
- `CLAUDE.md`（ルート）: Nora-lab同期コマンドの案内を新方式に更新
- `Nora-lab/CLAUDE.md`: Repository Relationship節を新方式に合わせて更新

## テスト

`SoloXP/tests/functional/issue-2761-publish-nora-lab-snapshot.functional.test.js` — 実際の一時git
環境（公開リポジトリ役のbare repository）上で `publish-nora-lab.sh` を実行し、以下を検証:

- ファイルの追加・変更・削除が正しく公開側へ反映されること
- 新規コミットの親が公開HEADただ1つだけであること
- Private側の履歴をどれだけ汚染させても（無関係な履歴とマージしても）公開側のコミット数が
  変化しないこと（2026-08-06の事故パターンの再現不可能性を直接証明する回帰テスト）
- 差分がない場合はpushをスキップすること
- スナップショット配下の未トラッキングファイル（本体側`.gitignore`除外相当）が公開されないこと
- 公開側が private側の最後の取り込み地点から進んでいる場合はpublishを中断すること（`NORA_LAB_ALLOW_DIVERGED_PUBLISH=1`で上書き可能）

## PR #2762 Codexレビューでの追加指摘（実装済み）

初版実装（PR #2762初回コミット）に対し、Codexが以下2点のP1指摘を行い、いずれも同PR内で修正済み:

1. **未トラッキングファイルの誤公開**: `cp -r`による物理コピーは、本体側`.gitignore`で除外されている
   だけで実体は存在するファイル（例: `Nora-lab/.env`）まで公開してしまう。`git ls-files`ベースの
   tracked-files-onlyコピーに変更して対処
2. **公開側の未取り込み変更の静かな削除**: 公開側でオーナーが直接push・PRした変更が private側へ
   pullされないまま publish すると、その変更を削除・巻き戻す形のPRを作ってしまう。旧方式
   （`git subtree push`）が持っていたnon-fast-forward拒否という安全網が新方式には無かったため。
   `git-subtree-split:`トレーラーによる基準SHA比較の中断チェックを追加して対処

## 関連

- 事故発覚・調査・事後対応: HolyAutomater PR #2760
- 元の汚染原因: PR #2426 / #2428
- subtree公開パイプライン（Phase3）: #2168, #2642, #2643
