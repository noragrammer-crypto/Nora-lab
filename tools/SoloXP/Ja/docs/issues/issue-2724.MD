# Issue #2724: [Bug] pre-push.sh: 新規スキルディレクトリが未コミットのまま残る／正本から削除されたスキルがdotfiles側に残留する

- URL: https://github.com/noragrammer-crypto/HolyAutomater/issues/2724
- 親ストーリー: #2168
- 親ブランチ: feature/issue-2168

## 本文

## 発見経緯
PR #2723（#2639「pre-push.sh の同期方向反転」）に対する Codex 自動レビューで2件の指摘を受けたが、指摘到着前にPRがマージされたため未反映のまま `feature/issue-2168` に取り込まれている。

## バグ内容

### 1. 新規スキルディレクトリが未コミットのまま残る（P1）
`.claude/hooks/pre-push.sh` の最終判定 `git diff --quiet "$DOTFILES_SKILLS"` は untracked（新規）ファイル・ディレクトリを無視する。正本にのみ存在し `dotfiles/.claude/skills/` にまだミラーがないスキル（現状: `ProcessIssue`・`ProcessTaskIssue`）は `cp` でコピーされても `git diff --quiet` が差分なしと判定してしまい `git add`/`git commit` に進まず、untracked状態（`??`）のまま放置される。次回実行時も `diff -rq` は「既にコピー済みで一致している」と判定するため、恒久的にコミットされない。

> Codex指摘原文（PR #2723 review comment, `.claude/hooks/pre-push.sh:50`）:
> "When a canonical skill has no tracked dotfiles mirror—as is currently true for `ProcessIssue` and `ProcessTaskIssue`—`cp` creates an untracked directory, but `git diff --quiet` ignores untracked paths and exits before `git add`. Running this hook in a clean worktree at the reviewed commit left exactly those two directories as `??`; subsequent runs then consider their contents synchronized and exit even earlier, so they are never committed or pushed. Check status including untracked files, or stage the copies before deciding whether there is anything to commit."

### 2. 正本から削除されたスキルがdotfiles側に残留する（P2）
現在の実装は `canonical_sources()`（`SoloXP/skills/xp_*` + `workflow/skills/*`）のみを列挙してコピーするループしか持たず、`dotfiles/.claude/skills/` 側にだけ存在する（正本から削除・リネームされた、または直接追加された）ディレクトリを検知・削除する経路がない。そのため「ドリフト検知・修正」を謳いながら、削除方向のドリフトは修正されない。

> Codex指摘原文（PR #2723 review comment, `.claude/hooks/pre-push.sh:35`）:
> "When a canonical skill is deleted or renamed, or a directory is added directly under `dotfiles/.claude/skills`, this loop never examines that target-only entry because it enumerates only `canonical_sources`. If all remaining mirrors match, `has_diff` stays zero and the obsolete generated skill survives indefinitely, contradicting the new canonical-to-generated synchronization model and leaving removed automation installed. Compare both directory sets and delete entries that have no canonical source."

## 修正方針（案）
- コミット要否の判定を `git diff --quiet` から `git status --porcelain -- "$DOTFILES_SKILLS"`（untracked含む）に変更する
- 正本側の名前一覧と `dotfiles/.claude/skills/` の既存ディレクトリ一覧を突き合わせ、正本に存在しないディレクトリを `rm -rf` してから差分判定・コミットする

## 影響範囲
`.claude/hooks/pre-push.sh`（#2639 で新設した正本→バイナリ同期ロジック）

## 関連イシュー
#2639（実装元タスク）, PR #2723（マージ済み・修正未反映）

## 親ストーリー
#2168

## 親ブランチ
feature/issue-2168

## コメント履歴

### コメント1（2026-08-07 01:41 JST）既存実装との競合チェック（code-architect）

## 既存実装との競合チェック（code-architect）

対象: #2724

フォールバック発動: あり
発動理由: 現セッションで利用可能なAgent typeに `code-architect` が存在しない（`claude`, `claude-code-guide`, `Explore`, `general-purpose`, `Plan`, `statusline-setup` のみ）ため、手動トレースに切り替えた。#2168 処理時と同一の制約。

**Patterns & Conventions Found（要約・実地確認）:**
- `.claude/hooks/pre-push.sh`（`feature/issue-2168` 最新 = commit `4b9430f`）を実地確認した。
- **バグ1（未コミット残留）は #2640（commit `b922b6f`）で既に解消済みであることを確認した**: 元の実装（PR #2723 マージ時点 = commit `02f66e1`）はコピー後に `git diff --quiet "$DOTFILES_SKILLS"`（working tree比較、untracked無視）でコミット要否を判定していたため、正本にのみ存在するスキル（`ProcessIssue`・`ProcessTaskIssue`）が `cp` されても untracked のまま放置されていた。その後 `.claude/skills/` のsymlink化対応（#2640）で「symlinkへの置き換えも検知できるよう」`git add "${add_targets[@]}"` → `git diff --cached --quiet` に変更されており、この副作用として新規ディレクトリも `git add` で拾われるようになった。#2640 の Implementer コメントにも「dotfiles/.claude/skills/ 側の ProcessIssue・ProcessTaskIssue 未同期分も解消された」と明記されている。→ 本タスクでは回帰防止テストとして再現確認する。
- **バグ2（削除ドリフト未検知）は未解消であることを確認した**: `canonical_sources()` は `SoloXP/skills/xp_*` + `workflow/skills/*` を列挙するのみで、コピー処理・diff検知処理ともにこの列挙結果に対してのみループする。`dotfiles/.claude/skills/`・`.claude/skills/` 側にのみ存在する（正本から削除・リネームされた）ディレクトリを検出・削除する経路が存在しない。→ 本タスクで対応が必要。
- 現状の `dotfiles/.claude/skills/`（38件）と正本合計（`SoloXP/skills/xp_*` 27件 + `workflow/skills/*` 11件 = 38件）は実地確認で完全一致しており、現時点で実害は顕在化していないが、将来スキルが削除・リネームされた際に確実に再発する。

**Architecture Decision（要約）:**
- 既存の関数構成（`canonical_sources()` / `is_termux()` / dotfiles同期ブロック / `.claude/skills` 同期ブロック）は変更せず、両ブロックの末尾に「正本名一覧と比較して不要エントリを削除する」プルーニング処理を追加する方針を採用する。
- 新規ヘルパー関数 `canonical_names()`（`canonical_sources()` の basename 一覧）を追加し、`dotfiles/.claude/skills/` と `.claude/skills/` それぞれに対して不要エントリ（正本に対応する名前がないディレクトリ/symlink）を検出・削除する共通関数を追加する。
- バグ1については新規のコード変更は不要（#2640で解消済み）。再現テストのみ追加し、将来の回帰を防ぐ。
- バグ2の修正により発生する削除も既存の `git add "${add_targets[@]}"` → `git diff --cached --quiet` の流れでコミットされる（`git add` は Git 2.0 以降デフォルトで指定パス配下の削除も検知するため、追加のフラグ変更は不要）。

競合の有無: なし（新規実装ではなく既存フックの追加修正であり、他機能と衝突する変更ではない）

---

作業開始 2026-08-07 01:20 JST
セッションURL: https://claude.ai/code/session_0136gsaW53BQTYu2khuUFKQm
[ProjectStatus: InProgress]

### コメント2（2026-08-07 01:51 JST）[Tester完了]

[Tester完了]

## テスト種別判定

対象: `.claude/hooks/pre-push.sh`（Bashスクリプト、実行時の同期挙動）

- Unit: 静的検証（`prune_stale_entries` 関数の存在・呼び出し箇所・コミット判定ロジックの記述確認）
- Functional: 一時gitサンドボックス上でフックを実際に実行し、以下を検証
  1. バグ1回帰確認: 正本にのみ存在する新規スキルが `dotfiles/.claude/skills/` にコピーされ、untrackedのまま放置されずコミットされる（#2640で解消済みであることの再現確認）
  2. バグ2修正確認: `dotfiles/.claude/skills/` 側に残留した削除済みスキルの残骸が削除・コミットされる
  3. バグ2修正確認: `.claude/skills/`（symlinkモード）側でも削除済みスキルへのsymlinkが削除・コミットされる
  4. 既存スキルが影響を受けないこと・冪等性

追加テストファイル:
- `SoloXP/tests/unit/issue-2724-pre-push-hook-stale-entry-pruning.unit.test.js`
- `SoloXP/tests/functional/issue-2724-pre-push-hook-stale-entry-pruning.functional.test.js`

E2E: 対象外（`.claude/hooks/pre-push.sh` はWebアプリのエンドポイントを持たないローカルgit hookのため）

### コメント3（2026-08-07 01:52 JST）[Implementer完了]

[Implementer完了]

## 実装完了

対象: `.claude/hooks/pre-push.sh`

### バグ1（新規スキルディレクトリが未コミットのまま残る）

調査の結果、**既に #2640（commit `b922b6f`）で解消済み**であることを確認した。
コミット要否判定が `git diff --quiet "$DOTFILES_SKILLS"`（working tree比較・untracked無視）から
`git add "${add_targets[@]}"` → `git diff --cached --quiet`（staged比較）に変更されており、
`git add` の時点で新規ディレクトリも拾われるようになっていた。
本タスクでは追加のコード変更は行わず、functional テストで回帰確認のみ追加した。

### バグ2（正本から削除されたスキルがdotfiles側に残留する）

新規実装。以下を追加:

- `canonical_names()`: `canonical_sources()` の basename 一覧を返すヘルパー関数
- `prune_stale_entries(target_dir)`: `target_dir` 配下を走査し、`canonical_names()` に
  対応する名前がないエントリ（ディレクトリ／symlink）を `rm -rf` で削除する。
  既存の `canonical_sources()` ループ（正本 → コピー先の向き）とは逆に、コピー先を起点に
  正本の名前一覧と突き合わせる向きで走査することで、正本から削除・リネームされたスキルの
  残骸を検知できるようにした
- `dotfiles/.claude/skills/` の同期ブロック末尾、`.claude/skills/`（symlink/Termuxコピー両モード）
  の同期ブロック末尾それぞれで `prune_stale_entries` を呼び出す
- コミット対象への `git add` に `-A` を付与し、削除の検知を明示化（Git 2.0以降のデフォルト挙動と
  一致するが、意図を明確にするため明示指定した）

## テスト結果

- 新規テスト（issue-2724）: PASS 13件（unit 6 + functional 7）/ FAIL 0件
- 回帰確認 `SoloXP/tests/unit`: PASS 138件 / FAIL 0件
- 回帰確認 `SoloXP/tests/functional`: PASS 33件 / FAIL 0件

Auditorでの確認をお願いします。

### コメント4（2026-08-07 01:52 JST）[Auditor テスト実行中]

[Auditor テスト実行中]

## /xp_RunTestSuites 相当の独立実行結果

実行日時: 2026-08-07 01:55 JST
ブランチ: claude/issue-processing-avnrbd（base: feature/issue-2168）

### 静的チェック
- `bash -n .claude/hooks/pre-push.sh`: 構文エラーなし

### 単体テスト
```
npx jest --testPathPatterns=tests/unit
Test Suites: 15 passed, 15 total
Tests:       138 passed, 138 total
```
- 結果: PASS 138件 / FAIL 0件（新規6件含む・既存分回帰なし）

### 機能テスト
```
npx jest --testPathPatterns=tests/functional
Test Suites: 4 passed, 4 total
Tests:       33 passed, 33 total
```
- 結果: PASS 33件 / FAIL 0件（新規7件含む・既存分回帰なし）

### 実装内容の確認
- `prune_stale_entries()` が `dotfiles/.claude/skills/`・`.claude/skills/` 双方の同期ブロック末尾で呼ばれており、正本に対応しないエントリ（ディレクトリ・symlinkいずれも）を削除する実装になっていることをコード上で確認した
- バグ1（未コミット残留）は #2640 で解消済みであることをコード上（`git diff --cached --quiet`）で確認し、functional テストで再現確認された
- 本タスクはローカルgit hookの変更でありWebアプリの変更を伴わないため、プレビューURL疎通確認は非該当（#2639・#2640・#2641と同様の判断）

### 総合判定
✅ GREEN

[Auditor GREEN]
PASS: 171件（unit 138 + functional 33） / テストコマンド: `npx jest --testPathPatterns=tests/unit`, `npx jest --testPathPatterns=tests/functional`

### コメント5（2026-08-07 01:53 JST）[Documenter完了]

[Documenter完了]

## ドキュメント生成完了

生成・更新したファイル:
- `docs/skill-files-sync.md`: 「ドリフト検知の両方向性（#2724）」節を追加。正本起点の差分検知（更新・追加）と `prune_stale_entries()` によるコピー先起点の削除検知が別ロジックであることを明記した
- `SoloXP/docs/tests/UnitTests/issue-2724-pre-push-hook-stale-entry-pruning.md`: 新規（ユニットテストドキュメント）
- `SoloXP/docs/tests/FunctionTests/issue-2724-pre-push-hook-stale-entry-pruning.md`: 新規（機能テストドキュメント）
- `SoloXP/docs/issues/issue-2724.MD`: 新規（本イシューの本文・コメント全件のアーカイブ、xp_issue2md相当）

`SoloXP/docs/spec/README.md` は `docs/skill-files-sync.md` へのリンクが既存のため更新不要（既存エントリの説明が本タスクの追加内容にも引き続き当てはまる）。

スキップした生成物:
- `xp_doc_reference`: `.claude/hooks/pre-push.sh` は git hookスクリプトでありAPIリファレンス対象外のため対象外
