# issue-2625-xp-auditor-doc-diff-stat-consistency ユニットテスト

## テスト対象

`SoloXP/skills/xp_Auditor/SKILL.md`

xp_Auditor の doc モードに、PR Summary（想定変更範囲）と実際の `git diff --stat` の整合性を
検証する手順が存在することを検証する（Issue #2625 のバグ再現・回帰防止）。

## 背景

PR #2426 の説明は「2ファイル追加のみ」だったが、実際のマージコミット（`f614d40`）はリポジトリ
全体8385ファイルを削除する内容だった。`[Auditor doc OK]` → `[Auditor GREEN]` の判定を経てマージ
され、事後に緊急revert（PR #2428）が必要になった。原因は `xp_Auditor` の doc モードが、PR本文の
Summaryと実際の変更範囲（diffスコープ）の整合性を検証していなかったこと。

## テストファイル

`SoloXP/tests/unit/issue-2625-xp-auditor-doc-diff-stat-consistency.unit.test.js`

## テストケース一覧

| テストケース | 種別 | 内容 |
|---|---|---|
| doc モードの処理フローセクションが存在する | 正常系 | SKILL.md に `## 処理フロー（doc モード）` セクションが存在すること |
| git diff --stat による変更範囲の取得手順が明記されている | 回帰防止 | `git diff --stat` の記述があること |
| PR Summary（想定変更範囲）との整合性チェック手順が明記されている | 回帰防止 | `PR Summary`・`整合性` の記述があること |
| 乖離が大きい場合は OK を出さず要確認として差し戻す旨が明記されている | 回帰防止 | `git diff --stat` 近傍に `乖離`・`NG`・`要確認`/`差し戻` の記述があること |
| チェック結果コメントのテンプレートに diffスコープ整合性の行が追加されている | 回帰防止 | `diffスコープ整合性` の記述があること |
| xp_Director への返却区分に diffスコープ不整合の NG ケースが追加されている | 回帰防止 | `[Auditor doc NG: diffスコープ不整合]` の記述があること |
| 過去の事故（PR #2426）が根拠として参照されている | 回帰防止 | `#2426` の記述があること |
| ローカルに存在しないブランチ名ではなく origin/ 付きのリモート追跡ブランチを base とする旨が明記されている | 回帰防止（Codexレビュー指摘 PR #3375） | `origin/feature/issue-{親番号}`・`origin/main` の記述があること |
| コミット間比較（`<base>...HEAD`）ではなく作業ツリーとの比較で未コミット変更も検出する旨が明記されている | 回帰防止（Codexレビュー指摘 PR #3375） | `git diff --stat <base>` 近傍に `作業ツリー`・`未コミット` の記述があること |
| Story-level AllGREENフローでは現在のセッションブランチではなく origin/feature/issue-{親番号} を明示的に対象とする旨が明記されている | 回帰防止（Codexレビュー指摘 PR #3375） | `Story-level AllGREENフロー`・`現在のセッションブランチをそのまま比較してはならず` の記述があること |

## 実装メモ

- `SoloXP/skills/xp_Auditor/SKILL.md` の doc モード処理フローに新規ステップ「2.5. PR Summary と
  実際の変更範囲（git diff --stat）の整合性チェック」を追加し、乖離が大きい場合は `[Auditor doc OK]`
  を出さず `[Auditor doc NG: diffスコープ不整合]` として xp_Director に差し戻すよう修正した
- 併せて `SoloXP/docs/spec/xp_auditor.md` の doc モード仕様にも同内容を反映した
- PR #3375 への Codex 自動レビュー（P1×2, P2×1）を受け、base 解決とdiff範囲を以下の通り修正した：
  1. ローカルに存在しない `feature/issue-{親番号}` ではなく、fetch済みの
     `origin/feature/issue-{親番号}` をbaseとする（ambiguous revisionエラー防止）
  2. `<base>...HEAD` のコミット間比較ではなく `git diff --stat <base>`（作業ツリー比較）を用いる
     （xp_Implementer/xp_Documenterの未コミット変更も検出対象に含める）
  3. Story-level AllGREENフローでは現在のセッションブランチではなく、明示的にfetchした
     `origin/feature/issue-{親番号}` を対象とする（実際にPRのheadとなるブランチを診断する）

## カバレッジサマリー

- doc モードセクション存在確認: 1件
- diffスコープ整合性チェックのバグ再現検証: 6件
- base解決・diff範囲の正確性検証（Codexレビュー指摘対応）: 3件
- 合計: 10件
