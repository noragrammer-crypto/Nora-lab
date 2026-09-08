# issue-3484-xp-issue-archive-finalize 機能テスト

## テスト対象

`SoloXP/scripts/find-stale-issue-archives.sh`（複数Epic・多数issueが混在する現実的なディレクトリ構成での候補抽出）と
`SoloXP/skills/xp_issueArchiveFinalize/SKILL.md`（GitHub API連携・xp_issue2md再利用等、LLM駆動部分の仕様）

`<EpicName>/docs/issues/issue-*.MD` のうち `state: open` のまま実際はGitHub上でclosed済みになって
いるものを、Epic完了付近でfinalizeする仕組み（Issue #2971）のうち、新規作成部分（#3484）を検証する。

## テストファイル

`SoloXP/tests/functional/issue-3484-xp-issue-archive-finalize.functional.test.js`

## テストケース一覧

| テストケース | 種別 | 内容 |
|---|---|---|
| 複数Epic・多数issueが混在する現実的なディレクトリ構成でも対象Epic配下のstate:openのみを抽出する | 正常系 | EpicA（open2件・closed3件）とEpicB（open1件）が同一ルート配下に存在しても、それぞれ独立して正しい候補を返すこと |
| docs/issuesが存在しない別Epicディレクトリと隣接していても誤検出しない | 異常系（境界確認） | `docs/issues` の無いEpicディレクトリが隣に存在しても、対象Epicの抽出結果に影響しないこと |
| SKILL.mdが find-stale-issue-archives.sh の利用を明記している | 仕様確認 | 候補抽出をスクリプトに委ねる設計であることの記述確認 |
| SKILL.mdが gh issue view --json state での軽量状態確認を明記している | 仕様確認 | 候補ごとの状態再確認コマンドの記述確認 |
| SKILL.mdが gh CLI不可時のMCPフォールバック（mcp__github__issue_read）を明記している | 仕様確認 | ClaudeCodeWeb等でのフォールバック経路の記述確認 |
| SKILL.mdが closed判定時のxp_issue2md再利用（新規生成ロジック不要）を明記している | 仕様確認 | Markdown再生成を独自実装しない設計方針の記述確認 |
| SKILL.mdが open候補は書き換えないことを明記している | 仕様確認 | 不要な書き換えを避ける受け入れ条件（#2971）の記述確認 |
| SKILL.mdがサマリ報告に触れている | 仕様確認 | 走査件数・finalize件数・スキップ件数の報告仕様の記述確認 |
| SKILL.mdがstate:open候補のみに限定する非目的を反映している | 仕様確認 | 常時同期・全Issue再取得を行わない非目的（#2971）の記述確認 |

## 実行結果

- 実装前（バグ再現時点）: PASS 1件 / FAIL 8件（スクリプト・SKILL.md不在のため想定通りRED）
- 実装後: PASS 9件 / FAIL 0件（GREEN）
- 関連回帰確認: `SoloXP/tests/functional` 全体8スイート（PASS 69件）
