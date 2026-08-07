# E2E テストドキュメント: Issue #2168
## SoloXP正本化とNora-lab公開パイプライン整備

テストファイル: `SoloXP/tests/e2e/issue-2168-soloxp-canonicalization-nora-lab-pipeline.test.js`

---

## ユーザーシナリオ概要

`SoloXP/skills/` に非xp_系スキル（`ops-meeting`、`daily-tasks`、`kakuyomu_post` 等）が
混在し、実装・テスト・仕様書も `SoloXP/lib`・`scripts`・`tests`・`docs` に一極集中している状態を
解消し、以下を実現する：

1. `SoloXP/skills/` を xp_* 系のみに正規化する（Phase 1）
2. `pre-push` フックの同期方向を「正本（SoloXP・workflow）→ バイナリ（dotfiles/.claude）」に反転し、
   バイナリ側の直接編集によるドリフトを検知・修正できるようにする（Phase 2）
3. `SoloXP/Makefile` の `sync-nora-lab` ターゲットで `Nora-lab/tools/SoloXP/Ja` へ同期し、
   `git subtree push` で公開リポジトリ（`noragrammer-crypto/Nora-lab`）へリンク切れなく反映できるようにする（Phase 3）

ファイルシステム・スクリプト内容をチェックする受け入れテスト
（構造・契約を検証する方式。ドキュメント文言の完全一致はアサートしない）。

---

## 前提条件

- `SoloXP/skills/`・`SoloXP/lib`・`SoloXP/scripts`・`SoloXP/tests`・`SoloXP/docs` が存在すること（既存）
- `.claude/hooks/pre-push.sh` が存在すること（既存、Phase2で書き換え対象）
- `docs/skill-files-sync.md` が存在すること（既存、Phase2で新構造に合わせて書き換え対象）
- `workflow/skills/ProcessIssue` が存在すること（既存）

---

## テストケース一覧（21件、うち1件skip）

### 受け入れ条件 1: `SoloXP/skills/` に xp_* 以外のスキルが存在しない（1件）

| # | Given | When | Then |
|---|---|---|---|
| 1 | `SoloXP/skills/` 配下に非xp_系スキルが混在 | 直下ディレクトリを列挙する | 全て `xp_` プレフィックスである |

### 受け入れ条件 2: lib/scripts/tests/docs に非xp_系ファイルが残っていない（4件）

| # | Given | When | Then |
|---|---|---|---|
| 2〜5 | 各ディレクトリ（lib/scripts/tests/docs）に非xp_系ファイルが混在 | 非xp_系キーワード（ops-meeting・daily-tasks・kakuyomu_post等）でファイル名を走査する | 該当ファイルが存在しない |

### 受け入れ条件 3: pre-pushフックが「正本→バイナリ」の向きで動作する（4件）

| # | Given | When | Then |
|---|---|---|---|
| 6 | `.claude/hooks/pre-push.sh` | ファイルを確認する | 存在する |
| 7 | フック内容 | コピー方向のパターンを確認する | `SoloXP/workflow → dotfiles` の向きの記載がある |
| 8 | フック内容 | ドリフト検知・修正の記載を確認する | `dotfiles` と `diff/ドリフト/drift` の記載がある |
| 9 | フック内容 | 旧向き(`cp -r "$DOTFILES_SKILLS`)の残存を確認する | 残っていない |

### 受け入れ条件 4: CLAUDE.mdの該当セクションが新構造を説明する（5件）

| # | Given | When | Then |
|---|---|---|---|
| 10 | `docs/skill-files-sync.md` | ファイルを確認する | 存在する |
| 11 | `CLAUDE.md` | 該当セクションへの参照を確認する | `skill-files-sync` または `スキルファイル` の記載がある |
| 12 | `docs/skill-files-sync.md` | 正本の記載を確認する | `SoloXP`/`workflow` が正本であると明記されている |
| 13 | 同上 | バイナリの記載を確認する | `dotfiles` がバイナリ（生成物）であると明記されている |
| 14 | 同上 | 同期方向の記載を確認する | 「正本→バイナリ」の記載がある |

### 受け入れ条件 5: `make sync-nora-lab` でNora-lab/tools/SoloXP/Jaに同期される（4件）

| # | Given | When | Then |
|---|---|---|---|
| 15 | `SoloXP/Makefile` | ファイルを確認する | 存在する |
| 16 | Makefile内容 | `sync-nora-lab` ターゲットを確認する | 定義されている |
| 17 | 同上 | 同期先パスを確認する | `Nora-lab/tools/SoloXP/Ja` の記載がある |
| 18 | 同上 | ProcessIssue含有を確認する | `ProcessIssue` の記載がある |

### 受け入れ条件 6: git subtree pushでリンク切れなく反映される（構造的事前検証、2件＋skip1件）

| # | Given | When | Then |
|---|---|---|---|
| 19 | `SoloXP/` 配下 | シンボリックリンクを再帰走査する | 存在しない |
| 20 | `workflow/skills/ProcessIssue` 配下 | シンボリックリンクを再帰走査する | 存在しない |
| skip | 実際の `git subtree push` 反映確認 | — | ネットワーク・外部公開リポジトリ依存のため自動実行対象外（#2643で手動確認） |

---

## 実装状況

| サブイシュー | 内容 | 状態 |
|---|---|---|
| #2635 | E2Eテストスイート作成 | 完了 |
| #2636 | SoloXP/skills 非xp_スキルの workflow/skills/ への実体移動 | 未着手 |
| #2637 | SoloXP/lib・scripts・tests・docs 配下の非xp_系ファイルの workflow/ への実体移動 | 未着手 |
| #2638 | Phase1完了確認 | 未着手（depends_on #2636, #2637） |
| #2639 | pre-push.sh の同期方向反転 | 未着手（depends_on #2638） |
| #2640 | .claude/skills/ 側の同期方式見直し | 未着手（depends_on #2639） |
| #2641 | CLAUDE.md のスキルファイル同期セクション更新 | 未着手（depends_on #2639, #2640） |
| #2642 | SoloXP/Makefile 新設・sync-nora-lab ターゲット実装 | 未着手（depends_on #2638） |
| #2643 | git subtree push による Nora-lab 公開実施 | 未着手（depends_on #2642） |
| #2644 | 機能仕様書更新 | 未着手（depends_on 全サブタスク） |

---

## 実行結果

| 実行日 | PASS | FAIL | SKIP | 状態 |
|---|---|---|---|---|
| 2026-08-05 | 6 | 14 | 1 | #2635作成直後（Phase1〜3未着手のためRED。想定通り） |
