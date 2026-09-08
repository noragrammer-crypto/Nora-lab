# xp_Auditor 機能仕様

## 概要

xp_Auditor はテスト実行・結果分析・品質報告を担うスキル。
ワークフロー制御は行わず、結果を xp_Director に返す。

## コマンド

### `xp_Auditor test <epic> <issue>`

指定タスクイシューのテストを実行し、結果をイシューにコメントして xp_Director に返す。

### `xp_Auditor doc <epic> <issue>`

ドキュメントをチェックし、結果を xp_Director に返す。PR 発行は xp_Director の責務。

### `xp_Auditor`（引数なし）

リポジトリ全体を監査してレポートを出力する。

---

## test モードの処理フロー

### テスト実行ルール

**直接テストコマンド（npx jest, pytest 等）を実行してはならない。**

テスト実行は必ず以下のスキル経由で行うこと：

- Unit + Functional テスト → `xp_RunTestSuites` SKILL.md に従う
- E2E テスト → `xp_RunE2ETests` SKILL.md に従う

### 手順

1. イシューを読み込み、スコープとタスク種別を把握する
2. `xp_RunTestSuites` 経由で Unit + Functional テストを実行する
3. **E2E テストの判断（Story-level Auditor フェーズ）**：タスクイシュー単体の場合は E2E をスキップする。xp_Director から AllGREEN 後に `xp_Auditor test <epic> <story>` として呼ばれた場合は **Story-level Auditor フェーズ** を実行する：
   - `xp_RunE2ETests` で E2E テストを実行する
   - **GREEN/RED 判定は E2E 単独でなく、2. の Unit + Functional 総合判定も対象に含める（#2814）**
   - GREEN（自ストーリーが所有するブロック対象がゼロ件。Unit + Functional 総合判定と E2E の両方が対象） → `[Auditor GREEN]` をストーリーイシューに記録し **xp_Director に返す**。xp_Reviewer 呼び出し・PR 発行・ストーリークローズは xp_Director の責務
   - RED → バグイシューを起票し（Unit/Functional/E2E のいずれかで RED がある場合。テスト種別を問わず同一ロジック）、**所有権ベースの非対称ブロック（#2807/#2809）** を適用する：既存バグイシューの親が自ストーリー、親未設定、または親ストーリーが既に**クローズ済み**（`replace_parent: true` で現ストーリーへ付け替え、所有権を再取得。#2818）で新規に所有権を取得した場合はブロック（ストーリー継続・クローズしない）。親が**他のオープンなストーリー**の場合はブロックしない（重複検知コメントのみ記録して先へ進む。#2807 の相互ロック解消）
   - E2E 実行不可 → `[E2E スキップ]` コメントを記録しユーザーに委ねる
   - **スコープ限定（#2784）**: 下記4.の「別タスクスコープ」判断基準（現タスクのテスト結果には影響しない）は Task-level 専用であり、Story-level Auditor フェーズには適用されない・援用できない。既知・別タスクスコープの RED であっても、Story-level では所有権判定（上記）に従う

4. 各 FAIL テストについてスコープを判断する（Task-level `xp_Auditor test <epic> <task_issue>` 専用。3.の Story-level Auditor フェーズには適用しない）：
   - **同一タスクスコープ内**: Implementer に差し戻し
   - **別タスクスコープ**: バグイシューを新規発行して通常キューへ

5. **Bug 修正タスクの実環境確認（Bug タスクのみ）**：タスクの親イシューが `[Bug]` の場合、テスト GREEN に加えて以下を実施する：
   1. バグイシューの本文・再現テストを読み込み、再現手順を把握する
   2. 再現手順をモックなしで実行し、エラーが発生しないことを確認する
   3. 確認できた場合 → `[実環境確認 OK]` をコメント記録し、[Auditor GREEN] を発行する
   4. 実環境確認が不可能な場合（環境依存・ネットワーク不可等）→ `[実環境確認 スキップ]` + 理由をコメントし、ユーザーに判断を委ねる（[Auditor GREEN] を自動記録しない）

6. イシューにステージコメントとして結果を記録する

### ステージコメント

GREEN の場合：
```
[Auditor GREEN]
PASS: n件 / テストコマンド: `<コマンド>`
```

RED の場合（同一タスクスコープ）：
```
[Auditor RED]
FAIL: n件
### FAIL 分析
...
```

### サブイシュー完了報告

タスクイシューが GREEN になったとき、親ストーリーイシューへ完了報告コメントを書き込む。

**手順:**
1. サブイシュー本文「## 親ストーリー」セクションから親イシュー番号を取得する
2. 同じ親を持つオープンなサブイシューのうち `[Auditor GREEN]` 未記録のものを「残り」とする
3. 親イシューへコメント: `サブイシュー #xx 完了。残り: #yy, #zz`

**コメント形式:**
```
サブイシュー #42 完了。残り: #43, #45
```
全サブイシュー完了時：
```
サブイシュー #42 完了。残り: なし（全タスク完了）
```

### xp_Director への返却

- GREEN: 完了として返す（親イシューへの完了報告済み）
- RED（同一タスクスコープ）: 原因・該当箇所を添えて返す → Director が Implementer に差し戻す
- 別タスクバグ発見: バグイシュー番号を添えて「バグイシュー発行済み」として返す

---

## doc モードの処理フロー

### 手順

1. `<EpicName>/docs/spec/README.md` の索引整合性を確認する
2. 各 spec ドキュメントの内容が薄すぎないか確認する
3. **PR Summary と `git diff --stat` の整合性チェック（#2625）**：base を「タスクPRなら
   `origin/feature/issue-{親番号}`、ルートタスクなら `origin/main`、Story-level AllGREENフローなら
   `origin/feature/issue-{親番号}` を明示的にfetchして対象とし `origin/main` を base」として解決し、
   `git diff --stat <base>`（第2引数省略・作業ツリー比較。未コミット変更も検出対象に含める）を取得し、
   イシュー本文・ステージコメントに記載された想定変更範囲と比較する。乖離が大きい場合（説明にない
   大量のファイル追加・削除等）は NG とし `[Auditor doc OK]` を出さない（過去に PR #2426 で Summary
   「2ファイル追加のみ」に対し実際はリポジトリ全体8385ファイル削除という乖離を検出できず、緊急revert
   （PR #2428）が必要になった事故がある）
4. イシューにチェック結果をコメントする：

```
[Auditor ドキュメントチェック中]

### ドキュメントチェック結果
- spec/README.md: <OK / NG: 理由>
- spec/<領域>.md: <OK / NG: 理由>
- diffスコープ整合性: <OK / NG: 理由（git diff --stat件数 vs 想定範囲）>
```

5. OK の場合: xp_Director に OK を返す（PR 発行は xp_Director の責務）：
```
[Auditor doc OK]
xp_Director がPRを発行します。
```

### xp_Director への返却

- OK: `[Auditor doc OK]` を記録して Director に返す。PR発行は Director の責務
- NG: 問題点を添えて返す
- NG（diffスコープ不整合）: `[Auditor doc NG: diffスコープ不整合]` として、実際の変更範囲が
  イシューの想定と乖離している旨を明記して返す。`[Auditor doc OK]` は出さない

---

## GitHub アクセス方法・MCPフォールバック

ClaudeCodeWeb 環境では `gh` CLI が使えない（`HTTP 403` 等）。`gh` 優先→失敗時MCPフォールバック→
フィールド正規化のパターンは `xp_issue2md`（#3204）で確立済みで、本スキルにも適用済み（#3216）：

| `gh` コマンド | 用途 | MCP フォールバック |
|---|---|---|
| `gh issue comment`（重複検知・完了報告） | イシューへのコメント記録 | `mcp__github__add_issue_comment` |
| `gh issue create`（バグ自動起票） | 別タスクスコープのバグ発見時の新規イシュー起票 | `mcp__github__issue_write`（method: `create`, labels） |
| `gh issue view --json state`（親イシュー状態確認） | 重複バグの親ストーリー状態判定 | `mcp__github__issue_read`（method: `get`） |

---

## 注意事項

- **ファイルを編集しない**。Read ツールでの参照のみ許可
- **直接テストコマンドを実行しない**。必ずスキル経由で実行する
- GREEN 偽装（テスト削除・スキップ追加）は禁止
- 別タスクスコープのバグはサイレントスキップ禁止。必ずバグイシューを発行する
