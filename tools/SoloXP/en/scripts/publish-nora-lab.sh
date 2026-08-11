#!/bin/bash
# publish-nora-lab.sh — 公開HEAD基準のsnapshot/diff commitでNora-labへ継続同期する（Issue #2761）
#
# 背景（Issue #2761）:
# 継続的なPrivate→Public同期に `git subtree split`/`git subtree push` を使うと、
# 「Nora-lab/に一度でも触れた全コミット」を祖先グラフに沿って辿るため、HolyAutomater本体側で
# 無関係な事故（例: 巨大な誤削除→revert）が起きるとその祖先グラフごと公開リポジトリへ運ばれてしまう
# （2026-08-06、本体の私的履歴が公開リポジトリへ漏洩する事故が実際に発生した）。
#
# このスクリプトは「祖先グラフを一切参照しない」方式で継続同期する:
#   1. 公開リポジトリを --depth 1 でclone（この時点でPrivate側の履歴とは完全に無関係）
#   2. 公開HEADが、private側が最後に取り込んだ地点から進んでいないか確認する（後述）
#   3. clone直後の作業ツリーを空にし、ローカルのスナップショット（例: Nora-lab/）の
#      git管理下ファイル（tracked files）のみで丸ごと置き換える
#   4. 差分があれば1コミットとして積む。コミットの親は「公開HEAD」ただ〇1つだけであり、
#      Private側の履歴を祖先に持ち込むことは構造的に不可能
#   5. 新規ブランチとしてpushする（publicのmainはbranch protectedのため、PRはオーナーが発行・マージする）
#
# 使い方:
#   SoloXP/scripts/publish-nora-lab.sh <snapshot-dir> <remote-url> <base-branch> <publish-branch> <commit-message>
#
# 例:
#   SoloXP/scripts/publish-nora-lab.sh \
#     "$(git rev-parse --show-toplevel)/Nora-lab" \
#     https://github.com/noragrammer-crypto/Nora-lab.git \
#     main \
#     sync/nora-lab-20260807 \
#     "sync: HolyAutomater Nora-lab/ snapshot (2026-08-07)"
#
# 環境変数:
#   NORA_LAB_ALLOW_DIVERGED_PUBLISH=1 — 公開側の未取り込み変更を検知しても中断せず強制的に進める
#
# 終了コード:
#   0 = push成功、または差分なしでpushをスキップ（どちらも正常終了）
#   1 = 引数不足・clone失敗・公開側の未取り込み変更を検知した場合等のエラー

set -euo pipefail

if [ "$#" -ne 5 ]; then
  echo "Usage: $0 <snapshot-dir> <remote-url> <base-branch> <publish-branch> <commit-message>" >&2
  exit 1
fi

SNAPSHOT_DIR="$1"
REMOTE_URL="$2"
BASE_BRANCH="$3"
PUBLISH_BRANCH="$4"
COMMIT_MESSAGE="$5"

if [ ! -d "$SNAPSHOT_DIR" ]; then
  echo "❌ スナップショットディレクトリが見つかりません: $SNAPSHOT_DIR" >&2
  exit 1
fi

# スナップショットディレクトリはgitリポジトリ配下にあることを要求する。
# 単純に `cp -r` で物理コピーすると、HolyAutomater本体側の .gitignore（例: `.env`）で
# 除外されているだけで実体としては存在するファイルまで、独立したclone先では除外ルールの
# 対象外になり `git add -A` でそのまま公開されてしまう。tracked files（`git ls-files`）のみを
# コピー対象にすることでこれを防ぐ（PR #2762 Codexレビュー指摘）。
if ! git -C "$SNAPSHOT_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "❌ スナップショットディレクトリはgitリポジトリ配下にある必要があります: $SNAPSHOT_DIR" >&2
  exit 1
fi

PRIVATE_REPO_ROOT="$(git -C "$SNAPSHOT_DIR" rev-parse --show-toplevel)"

# 直近の `git subtree pull/add --squash` が記録した「private側が最後に取り込んだ公開側コミットSHA」を
# private側のコミット履歴（`git-subtree-split: <sha>` トレーラー）から取得する。
# 公開側でこの時点より進んだ変更（オーナーによる直接push・PR等）があるのに気づかず publish すると、
# その変更を削除・巻き戻す形のPRを作ってしまう（PR #2762 Codexレビュー指摘）。これを検知する基準値として使う。
LAST_KNOWN_PUBLIC_SHA="$(
  git -C "$PRIVATE_REPO_ROOT" log --format='%B' -- "$SNAPSHOT_DIR" 2>/dev/null \
    | grep -m1 -oE 'git-subtree-split: [0-9a-f]{40}' \
    | awk '{print $2}' || true
)"

WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

echo "🔄 公開リポジトリを --depth 1 でclone中（$BASE_BRANCH）..."
# --depth 1: これより前のコミットはこのローカルclone上に一切存在しない。
# Private側の履歴を「知らない」状態を物理的に保証するための最重要ポイント。
git clone --quiet --depth 1 --branch "$BASE_BRANCH" "$REMOTE_URL" "$WORKDIR/public"

cd "$WORKDIR/public"
git config user.email "solo-xp@holyautomater.local"
git config user.name "Solo XP (publish-nora-lab)"

PUBLIC_HEAD_SHA="$(git rev-parse HEAD)"

if [ -n "$LAST_KNOWN_PUBLIC_SHA" ] && [ "$LAST_KNOWN_PUBLIC_SHA" != "$PUBLIC_HEAD_SHA" ]; then
  if [ "${NORA_LAB_ALLOW_DIVERGED_PUBLISH:-}" != "1" ]; then
    echo "❌ 公開HEAD（$PUBLIC_HEAD_SHA）が、private側が最後に取り込んだ時点（$LAST_KNOWN_PUBLIC_SHA）から進んでいます。" >&2
    echo "   公開側で直接push・PRされた変更が private側へ pull されていない可能性があります。" >&2
    echo "   先に 'git subtree pull --prefix=<snapshot-dir> <remote> <branch> --squash' で取り込んでから再実行してください。" >&2
    echo "   （承知の上で強制的に進める場合は環境変数 NORA_LAB_ALLOW_DIVERGED_PUBLISH=1 を設定してください）" >&2
    exit 1
  fi
  echo "⚠️  公開HEADが最後の取り込み時点から進んでいますが、NORA_LAB_ALLOW_DIVERGED_PUBLISH=1 のため続行します。"
fi

# 公開HEADの追跡ファイルを一旦すべて削除してから、スナップショットで置き換える。
# こうすることで、正本側で削除済みのファイルも公開側から消える（--delete相当）。
git ls-files -z | xargs -0 -r rm -f
find . -mindepth 1 -type d -not -path './.git*' -empty -delete

# $SNAPSHOT_DIR配下のgit管理下ファイル（tracked files）のみをコピーする（上記の理由によりcp -rは使わない）。
while IFS= read -r -d '' rel; do
  mkdir -p "$(dirname "$rel")"
  cp "$SNAPSHOT_DIR/$rel" "$rel"
done < <(git -C "$SNAPSHOT_DIR" ls-files -z)

git add -A

if git diff --cached --quiet; then
  echo "✅ 公開HEADとの差分なし。publishをスキップします。"
  exit 0
fi

git commit --quiet -m "$COMMIT_MESSAGE"

# コミットグラフの健全性を出力する（祖先が公開HEAD1件だけであることの目視確認用）
PARENT_COUNT="$(git log -1 --pretty=%P HEAD | wc -w | tr -d ' ')"
echo "🔎 新規コミットの親コミット数: $PARENT_COUNT（1であること = Private側履歴を一切含まないことの確認）"

echo "🔼 $PUBLISH_BRANCH へpush中..."
git push --quiet origin "HEAD:refs/heads/$PUBLISH_BRANCH"

echo "✅ push完了: $PUBLISH_BRANCH（公開リポジトリ側でPRを発行しオーナーがマージする）"
