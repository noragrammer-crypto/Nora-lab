# issue-2761-publish-nora-lab-snapshot 機能テスト

## テスト対象

`SoloXP/scripts/publish-nora-lab.sh`（公開HEAD基準のsnapshot/diff commit方式でのNora-lab継続同期）

`git subtree push` を使わず、公開リポジトリを `--depth 1` でcloneして1コミットだけ積む方式に
継続同期を切り替えたことを、実際の一時git環境（公開リポジトリ役のbare repository + スナップショット
ディレクトリ）上で検証する（Issue #2761）。

2026-08-06に発生した「本体の私的履歴（AIchats/一括syncコミット・Discordトークン含む）が
`git subtree push` の祖先グラフ経由で公開リポジトリへ流出した事故」の再発が、新方式では
構造的に不可能であることを直接証明する。

## テストファイル

`SoloXP/tests/functional/issue-2761-publish-nora-lab-snapshot.functional.test.js`

## テストケース一覧

| テストケース | 種別 | 内容 |
|---|---|---|
| スナップショットの追加・変更ファイルが公開側へ反映される | 正常系 | 新規ファイル・変更ファイルがpush後のブランチに存在すること |
| スナップショットに存在しないファイルは公開側から削除される | 正常系（削除反映） | 公開側にのみ存在するファイルが同期後に消えること（`--delete`相当） |
| 新規コミットの親は公開HEADただ1つだけである | 正常系（設計の核） | `git log -1 --pretty=%P` の親コミット数が1件であることを直接検証 |
| Private側の履歴がどれだけ汚染されていても公開側のコミット数は増えない | 異常系（回帰防止・事故再現不可能性の証明） | Private側に無関係な履歴を意図的にマージした「汚染リポジトリ」を用意しても、スクリプトの引数に一切現れないため公開側のコミット数（2件: 公開HEAD+新規1件）が変化しないことを確認 |
| 公開HEADとの差分がない場合はpushをスキップし、公開側のブランチは作られない | 正常系（no-op） | 差分なし時に無駄なコミット・ブランチが作られないこと |
| スナップショット配下の未トラッキングファイルは公開されない | 異常系（回帰防止、PR #2762 Codexレビュー指摘） | `git add`されていないファイル（本体側`.gitignore`除外相当、例: `.env`）が`git ls-files`ベースのコピーで除外されることを確認 |
| スナップショットディレクトリがgitリポジトリ配下でない場合はエラーで中断する | 異常系（ガード確認） | tracked filesのみコピーする前提が成立しない入力を拒否すること |
| private側が最後に取り込んだ地点と公開HEADが一致していればpublishは成功する | 正常系（divergenceチェックの非該当ケース） | `git-subtree-split:`トレーラーのSHAと実際の公開HEADが一致する場合は通常通り進むこと |
| 公開HEADがprivate側の既知地点より進んでいる場合はpublishを中断し、ブランチを作らない | 異常系（回帰防止、PR #2762 Codexレビュー指摘） | 公開側の未取り込み変更（オーナーの直接push等）を検知してpublishを中断し、それを削除・巻き戻す形のコミットを作らないこと |
| `NORA_LAB_ALLOW_DIVERGED_PUBLISH`で未取り込み変更の検知を明示的に上書きできる | 正常系（エスケープハッチ） | 環境変数で意図的にdivergenceチェックを上書きできること |

## カバレッジサマリー

- `publish-nora-lab.sh` の実際のgit操作を通じた検証: 10件
- 合計: 10件

## 関連

- 仕様書: `SoloXP/docs/spec/nora_lab_publish.md`（Step 2）
- イシュー: `SoloXP/docs/issues/issue-2761.MD`
