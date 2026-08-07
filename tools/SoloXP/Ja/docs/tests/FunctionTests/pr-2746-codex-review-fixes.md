# Function Test: PR #2746 Codexレビュー指摘の回帰防止

対象ファイル: `SoloXP/tests/functional/pr-2746-codex-review-fixes.functional.test.js`

## 背景

Story #2168 を `feature/issue-2168` → `main` へマージするPR #2746 に対し、Codex自動レビューが
2件のP2指摘を行った。

### 指摘1: `SoloXP/Makefile` の `sync-nora-lab` がコピー失敗を伝播しない

`find ... | while read ...; do cp ...; done` のループ内で `cp` が失敗しても、ループ自体は
継続し、最後のイテレーションが成功していれば `while` 全体の終了ステータスが0になり、
make からは成功に見えてしまう。同期先が不完全なまま `✅ 同期完了` と表示され、
#2734 で修正した「スペースを含むファイル名の静かな欠落」と同種の事故が別経路で再発しうる。

**修正**: レシピの先頭に `set -e -o pipefail` を追加し、`cp` 呼び出しに `|| exit 1` を付与。
`while` サブシェルの異常終了が `pipefail` によりパイプライン全体の終了ステータスへ反映され、
`set -e` により make のレシピ自体が失敗する。

### 指摘2: `.claude/hooks/pre-push.sh` のTermuxフォールバックがsymlinkを置き換えない

Termux分岐の差分検知は `diff -rq "$src" "$CLAUDE_SKILLS/$name"` のみで判定していたが、
`$CLAUDE_SKILLS/$name` が既にsymlink（正本と内容が一致）の場合、`diff -rq` はリンクを
辿って内容比較するため差分なしと誤判定し、Termux環境で必須の実体コピーへの置き換えが
発動しない。

**修正**: `[ -L "$CLAUDE_SKILLS/$name" ]` をhas_diff判定の条件に追加し、symlinkであること
自体を差分として扱う。

## テストケース

1. `cp` が失敗した場合、`make sync-nora-lab` は非ゼロで終了する（root実行環境では
   パーミッションによる再現ができないため、`process.getuid() === 0` の場合はskipし、
   `set -e -o pipefail` / `|| exit 1` の存在は対応するユニットテスト（命題8・9）で
   静的に担保する）
2. Termux強制モード（`PRE_PUSH_FORCE_TERMUX=1`）で、`.claude/skills/xp_Sample` が
   既にsymlinkとして存在する状態からフックを実行すると、実体ディレクトリへ置き換わる
3. 置き換え後の内容が正本と一致する

## 実行結果

PASS 3件 / FAIL 0件（root実行環境のためテスト1は実質skip、命題8・9で静的に担保）
