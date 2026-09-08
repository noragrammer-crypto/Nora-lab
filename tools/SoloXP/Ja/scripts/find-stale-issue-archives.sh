#!/bin/bash
# find-stale-issue-archives.sh — Epic配下のIssue Markdownスナップショットのうち
# GitHub上のclosed済み再確認候補（front matter state: open）を列挙する（Issue #3484 / 親Story #2971）
#
# 背景（Issue #2971）:
# `<EpicDir>/docs/issues/issue-*.MD` は取得時点のGitHub Issue状態をスナップショットするが、
# 後からGitHub上でclosedになってもMarkdown側のfront matter `state` は更新されず古いまま残る。
# 本スクリプトは「再確認が必要な候補（state: open のまま）」だけを決定的に洗い出す純粋な
# ファイルシステム走査を担う。GitHub APIへの問い合わせ（実際にclosedかどうかの確認・
# closed時の再生成）はこのスクリプトの責務外であり、`xp_issueArchiveFinalize` スキルが
# gh CLI / GitHub MCP を介して行う。
#
# 使い方:
#   SoloXP/scripts/find-stale-issue-archives.sh <EpicDir>
#
# 出力:
#   候補issue番号（front matter の `issue:` フィールド値）を1行1件で標準出力する。
#   候補が無い場合（docs/issues が存在しない場合を含む）は何も出力せず正常終了（exit 0）する。

set -euo pipefail

EPIC_DIR="${1:?Usage: find-stale-issue-archives.sh <EpicDir>}"
# 末尾スラッシュの有無によらず同じ結果になるよう正規化する
EPIC_DIR="${EPIC_DIR%/}"
ISSUES_DIR="${EPIC_DIR}/docs/issues"

if [ ! -d "$ISSUES_DIR" ]; then
  exit 0
fi

shopt -s nullglob
for f in "$ISSUES_DIR"/issue-*.MD; do
  # xp_issue2md はIssue本文・コメントを（front matter直下の1件目を除き）そのまま転写するため、
  # 本文やコメント中に偶然 `state: open` という行が含まれる可能性がある（例: 他Issueの
  # front matterを引用したコメント）。判定対象は先頭のfront matterブロック（最初の `---` から
  # 次の `---` まで）に限定し、本文・コメントの誤検知を避ける（Codexレビュー指摘）。
  front_matter=$(awk 'NR==1 && $0=="---" {infm=1; next} infm && $0=="---" {exit} infm {print}' "$f")
  if printf '%s\n' "$front_matter" | grep -q '^state: open$'; then
    num=$(printf '%s\n' "$front_matter" | grep -m1 '^issue: ' | sed 's/^issue: *//')
    if [ -n "$num" ]; then
      echo "$num"
    fi
  fi
done
