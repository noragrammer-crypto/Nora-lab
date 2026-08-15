#!/bin/bash
# publish-nora-lab.sh — Continuously synchronize Nora-lab using a snapshot/diff commit based on the public HEAD (Issue #2761)
#
# Background (Issue #2761):
# Using `git subtree split`/`git subtree push` for ongoing Private-to-Public synchronization
# follows every commit that ever touched `Nora-lab/` through the ancestor graph. Therefore,
# an unrelated incident in HolyAutomater (for example, an accidental large deletion followed by a revert)
# could carry that entire ancestor graph into the public repository.
# (On 2026-08-06, private history from the main repository was actually leaked to the public repository.)
#
# This script performs ongoing synchronization without ever consulting the ancestor graph:
#   1. Clone the public repository with --depth 1 (completely unrelated to Private history at this point).
#   2. Verify that the public HEAD has not advanced since Private last incorporated it (explained below).
#   3. Empty the newly cloned working tree, then replace it entirely with only the Git-tracked files
#      from the local snapshot (for example, Nora-lab/).
#   4. If a diff exists, create one commit. Its sole parent is the public HEAD, so structurally
#      it cannot introduce Private history as an ancestor.
#   5. Push it as a new branch (the public main branch is protected; the owner opens and merges the PR).
#
# Usage:
#   SoloXP/scripts/publish-nora-lab.sh <snapshot-dir> <remote-url> <base-branch> <publish-branch> <commit-message>
#
# Example:
#   SoloXP/scripts/publish-nora-lab.sh \
#     "$(git rev-parse --show-toplevel)/Nora-lab" \
#     https://github.com/noragrammer-crypto/Nora-lab.git \
#     main \
#     sync/nora-lab-20260807 \
#     "sync: HolyAutomater Nora-lab/ snapshot (2026-08-07)"
#
# Environment variable:
#   NORA_LAB_ALLOW_DIVERGED_PUBLISH=1 — Continue without stopping even when unincorporated public changes are detected.
#
# Exit codes:
#   0 = push succeeds, or is skipped because there is no diff (both are normal completion)
#   1 = error such as missing arguments, clone failure, or detecting unincorporated public changes

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
  echo "❌ Snapshot directory not found: $SNAPSHOT_DIR" >&2
  exit 1
fi

# Require the snapshot directory to be inside a Git repository.
# A physical `cp -r` would also copy files that exist locally but are merely excluded by the
# HolyAutomater .gitignore (for example, `.env`). Those exclusion rules do not apply in the
# independent clone, so `git add -A` would publish them unchanged. Copying only tracked files
# (`git ls-files`) prevents this (as noted in the PR #2762 Codex review).
if ! git -C "$SNAPSHOT_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "❌ Snapshot directory must be inside a Git repository: $SNAPSHOT_DIR" >&2
  exit 1
fi

PRIVATE_REPO_ROOT="$(git -C "$SNAPSHOT_DIR" rev-parse --show-toplevel)"

# Obtain the public commit SHA that Private last incorporated, recorded by the latest
# `git subtree pull/add --squash`, from Private's commit history (`git-subtree-split: <sha>` trailer).
# Publishing without noticing newer public changes (direct owner pushes, PRs, etc.) could create a PR
# that removes or reverts them. Use this as the reference value for detecting that condition
# (as noted in the PR #2762 Codex review).
LAST_KNOWN_PUBLIC_SHA="$(
  git -C "$PRIVATE_REPO_ROOT" log --format='%B' -- "$SNAPSHOT_DIR" 2>/dev/null \
    | grep -m1 -oE 'git-subtree-split: [0-9a-f]{40}' \
    | awk '{print $2}' || true
)"

WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

echo "🔄 Cloning the public repository with --depth 1 ($BASE_BRANCH)..."
# --depth 1: no commits before this one exist in the local clone.
# This is the key safeguard that physically ensures it has no knowledge of Private history.
git clone --quiet --depth 1 --branch "$BASE_BRANCH" "$REMOTE_URL" "$WORKDIR/public"

cd "$WORKDIR/public"
git config user.email "solo-xp@holyautomater.local"
git config user.name "Solo XP (publish-nora-lab)"

PUBLIC_HEAD_SHA="$(git rev-parse HEAD)"

if [ -n "$LAST_KNOWN_PUBLIC_SHA" ] && [ "$LAST_KNOWN_PUBLIC_SHA" != "$PUBLIC_HEAD_SHA" ]; then
  if [ "${NORA_LAB_ALLOW_DIVERGED_PUBLISH:-}" != "1" ]; then
    echo "❌ Public HEAD ($PUBLIC_HEAD_SHA) has advanced since Private last incorporated it ($LAST_KNOWN_PUBLIC_SHA)." >&2
    echo "   Changes pushed directly or through PRs on the public side may not have been pulled into Private." >&2
    echo "   First incorporate them with 'git subtree pull --prefix=<snapshot-dir> <remote> <branch> --squash', then rerun." >&2
    echo "   (To force continuation intentionally, set NORA_LAB_ALLOW_DIVERGED_PUBLISH=1.)" >&2
    exit 1
  fi
  echo "⚠️  Public HEAD has advanced since the last incorporation, but continuing because NORA_LAB_ALLOW_DIVERGED_PUBLISH=1."
fi

# Remove all tracked files from the public HEAD, then replace them with the snapshot.
# This also removes from Public any files already deleted in the source of truth (equivalent to --delete).
git ls-files -z | xargs -0 -r rm -f
find . -mindepth 1 -type d -not -path './.git*' -empty -delete

# Copy only Git-tracked files below $SNAPSHOT_DIR (do not use cp -r for the reason above).
while IFS= read -r -d '' rel; do
  mkdir -p "$(dirname "$rel")"
  cp "$SNAPSHOT_DIR/$rel" "$rel"
done < <(git -C "$SNAPSHOT_DIR" ls-files -z)

git add -A

if git diff --cached --quiet; then
  echo "✅ No diff from public HEAD. Skipping publish."
  exit 0
fi

git commit --quiet -m "$COMMIT_MESSAGE"

# Print commit-graph health information for manually confirming the sole ancestor is the public HEAD.
PARENT_COUNT="$(git log -1 --pretty=%P HEAD | wc -w | tr -d ' ')"
echo "🔎 Parent commit count of the new commit: $PARENT_COUNT (1 confirms it contains no Private history)"

echo "🔼 Pushing to $PUBLISH_BRANCH..."
git push --quiet origin "HEAD:refs/heads/$PUBLISH_BRANCH"

echo "✅ Push complete: $PUBLISH_BRANCH (open a PR in the public repository for the owner to merge)"
