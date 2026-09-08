# issue-2971-issue-archive-finalize-workflow E2E Tests

## ユーザーシナリオ概要

Issue Markdownスナップショット（`<EpicName>/docs/issues/issue-*.MD`）のうち front matter が
`state: open` のままGitHub上ではclosed済みのものを、Epic完了付近で再取得・finalizeする仕組み
（親Story #2971）のストーリー全体の受け入れ試験。段階的にサブタスク（#3484〜#3486）が完了する
ため、本テストは完了したサブタスクに対応する部分から順にGREENになる（`xp_SecurityReviewer`
導入時の受け入れテスト・issue-1688と同型のアプローチ: SKILL.md・spec文書の構造・契約検証に加え、
決定的なスクリプト部分は実ディレクトリでの実行検証を組み合わせる）。

関連イシュー: #2971 / #3484 / #3485 / #3486 / #3487 / #3488

## 前提条件

- `SoloXP/scripts/find-stale-issue-archives.sh`・`SoloXP/skills/xp_issueArchiveFinalize/SKILL.md` が
  存在すること（#3484完了後）
- `SoloXP/skills/xp_Director/SKILL.md`・`workflow/skills/daily-tasks/SKILL.md`（いずれも正本。生成物である
  `.claude/skills/` 配下ではなく正本を直接検証する。理由はPR #3490のCodexレビュー指摘参照）が存在すること
- `SoloXP/docs/spec/xp_issue_archive_finalize.md`・`SoloXP/docs/spec/README.md` が存在すること
- `dotfiles/.claude/skills/xp_issueArchiveFinalize/SKILL.md` が存在すること（#3484完了後、pre-pushフックによる自動同期）

## Given/When/Then ステップ

### 受け入れ条件1: xp_issueArchiveFinalize スキルの存在と基本契約（AC2・3・4・6・7）

| # | Given | When | Then |
|---|---|---|---|
| 1 | リポジトリ | `find-stale-issue-archives.sh` の存在を確認する | 存在する |
| 2 | リポジトリ | `xp_issueArchiveFinalize/SKILL.md` の存在を確認する | 存在する |
| 3 | xp_issueArchiveFinalize/SKILL.md を読み込む | `xp_issue2md` 再利用の記述を検索する | 記述が見つかる（AC3） |
| 4 | xp_issueArchiveFinalize/SKILL.md を読み込む | open候補を書き換えない旨を検索する | 記述が見つかる（AC4） |
| 5 | xp_issueArchiveFinalize/SKILL.md を読み込む | `depends_on`・`SSOT` の記述を検索する | 両方の記述が見つかる（AC6） |
| 6 | xp_issueArchiveFinalize/SKILL.md を読み込む | 「常時同期」の記述を検索する | 記述が見つかる（AC7） |

### 受け入れ条件2: 候補抽出スクリプトの実動作（AC2の直接検証）

| # | Given | When | Then |
|---|---|---|---|
| 7 | 一時ディレクトリに open 1件・closed 1件のIssue Markdownを用意する | `find-stale-issue-archives.sh` を実行する | open側のissue番号のみを標準出力する（AC2）。closed側ファイルの内容は実行前後で変化しない（AC4） |

### 受け入れ条件3: xp_Director AllGREENフローへの統合（AC1、#3485完了までRED）

| # | Given | When | Then |
|---|---|---|---|
| 8 | xp_Director/SKILL.md を読み込む | 「AllGREEN チェック・AllGREENフローについて」節を抽出する | `xp_issueArchiveFinalize` の呼び出し記述が見つかる |

### 受け入れ条件4: daily-tasksへのEpic横断統合（AC5、#3486完了までRED）

| # | Given | When | Then |
|---|---|---|---|
| 9 | daily-tasks/SKILL.md を読み込む | `xp_issueArchiveFinalize` の記述を検索する | 記述が見つかる |

### 受け入れ条件5〜6: ドキュメント整合性・正本同期

| # | Given | When | Then |
|---|---|---|---|
| 10 | `docs/spec/xp_issue_archive_finalize.md`・`docs/spec/README.md`・`dotfiles/.claude/skills/xp_issueArchiveFinalize/SKILL.md` | 存在・索引登録・正本との一致を確認する | すべて満たす |

## 実行結果（作成時点、#3484 PR #3489 未マージのブランチ上）

```
cd SoloXP && npx jest --testPathPattern="issue-2971-issue-archive-finalize-workflow"
Test Suites: 1 failed, 1 total
Tests:       8 failed, 2 passed, 10 total
```

未マージの#3484・未着手の#3485/#3486に対応するケースがREDであることは想定通り（E2Eテスト作成タスク
としての意図通り）。全サブタスク完了・マージ後にStory-level `xp_Auditor test` で再実行し、全件GREEN
であることを確認する。
