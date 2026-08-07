# xp_Architect スキル仕様

## 概要

参謀・アーキテクトとして、イシューを分類しサブイシューを全件発行し、xp_Director へ実行計画を返すスキル。

## コマンド

```
/xp_Architect <issue_number>
```

## 配置先

```
.claude/skills/xp_Architect/SKILL.md
```

## 処理フロー

### 1. イシューの種別分類

**第一基準（最優先）: 観測可能な振る舞いの変更を伴うか**

ユーザー/外部から観測可能な振る舞いの変更を伴うか（＝受け入れ条件を書けるか）を、種別判定の第一基準とする。
タスク数・規模（「複数タスクにまたがる」か否か）は副次基準であり、第一基準だけでは判断がつかない場合の参考情報として使う。

| 種別 | 判断基準 |
|---|---|
| **Story** | 受け入れ条件を書ける（観測可能な振る舞いの変更を伴う）、`[Story]` タグ、複数タスクにまたがる機能追加 |
| **Task** | `[Task]` タグ、単一の実装作業（観測可能な振る舞いの変更を伴う場合は 1-1 の要否判定を必須で行う） |
| **Bug** | `[Bug]` タグ、エラー報告、既存機能の不具合 |

分類結果を xp_Director に返す（以降の計画立案にも使用する）。

### 1-1. Task イシューの E2E/spec 要否判定（必須）

`[Task]` と判定したイシューについても、Architect は以下を必ず明示的に判定し、
判定理由をイシューにコメントとして記録する（「タスクだから不要」という暗黙のスキップを禁止する）：

- このタスクは観測可能な振る舞いの変更を伴うか
- 伴う場合: Story と同様に「① E2Eテストスイート作成タスク」「② 機能仕様書更新タスク」（手順5参照）を併せて発行する
- 伴わない場合: その判断理由（例: 内部リファクタのみ、設定変更のみ、ドキュメントのみ等）をコメントに明記する

判定コメントの例:

```
## E2E/spec 要否判定（Task）

対象: #<task番号>
観測可能な振る舞いの変更: あり / なし
理由: <判断理由>
追加タスク: E2Eテストスイート作成 #<番号> / 機能仕様書更新 #<番号>（「なし」の場合は記載しない）
```

### 2. ストーリーイシューの内容を全文読む

- GitHub Issue 本文・コメント全履歴を取得する
- ストーリーの目的・受け入れ条件・estimate.breakdown を把握する

### 3. 既存実装との競合チェック

`code-architect` サブエージェント（Agent tool, `subagent_type: code-architect` — feature-dev プラグイン提供）を呼び出し、既存実装との競合チェックを行う。

> **経緯（#1381）**: `/feature-dev` コマンド本体に "architect" / "explore" サブコマンドは存在せず、
> Phase 3（Clarifying Questions）・Phase 5（Implementation 承認）・Phase 6（レビュー判断）で
> 人間応答待ちが必須なため自動フローへの組み込みは不可。一方 feature-dev プラグインが提供する
> `code-architect` サブエージェント単体は読み取り専用ツール（Glob/Grep/LS/Read/NotebookRead/
> WebFetch/TodoWrite/WebSearch/KillShell/BashOutput）のみで完結し、人間応答待ちなしで呼び出せる。

**呼び出し方法:**

Agent tool で以下を渡して呼び出す：
- `subagent_type`: `code-architect`
- `prompt`: ストーリー/タスクの目的・受け入れ条件・影響範囲候補（`api/<EpicName>/` 配下等）を含め、
  「新規に導入せず、既存パターンの延長線上で設計してほしい」旨を明記する
- `isolation`: 指定しない（読み取り専用のため worktree 不要）

**出力の xp 実行計画へのマッピング:**

code-architect の出力形式（Patterns & Conventions Found / Architecture Decision / Component Design /
Implementation Map / Data Flow / Build Sequence / Critical Details）を、以下のルールで
xp 実行計画（手順4・5）に変換する：

| code-architect 出力 | xp 実行計画へのマッピング |
|---|---|
| Build Sequence の各フェーズ | サブイシュー（`estimate.breakdown` の各タスク）の単位に対応させる |
| Build Sequence 内の順序依存 | `depends_on` に変換する（先行フェーズ完了後にのみ着手可能なタスクへ付与） |
| Implementation Map の各ファイル変更 | 対応するサブイシューの「概要」に変更対象ファイルとして明記する |
| Critical Details（テスト・性能・セキュリティ観点） | 該当タスクの「概要」または手順1-1（Task の E2E/spec 要否判定）の参考情報として利用する |
| Patterns & Conventions Found | 下記コメントフォーマットにそのまま転記し、既存パターン遵守の根拠として残す |

**競合チェック結果をイシューにコメントする:**

```
## 既存実装との競合チェック（code-architect）

対象: #<issue_number>
Patterns & Conventions Found: <要約>
Architecture Decision: <要約>
競合の有無: あり / なし
```

**`code-architect` が呼べない場合のフォールバック:**

**発動条件（いずれか1つでも該当したら発動）:**
- Agent tool の呼び出し自体がエラー・タイムアウトで失敗する
- `subagent_type: code-architect` が見つからない・利用不可というエラーが返る
- 呼び出しは成功したが、出力に `Patterns & Conventions Found` 相当の内容が一切含まれない（空応答・フォーマット崩壊）

**確認手順:**
1. 発生したエラーメッセージまたは不十分な出力内容をそのまま記録する
2. 手動コードトレースに切り替える（`api/<EpicName>/docs/spec/` の Read、影響範囲の Grep/Glob、既存テストの Read）
3. 上記コメントフォーマットに以下を追記して記録する：
   ```
   フォールバック発動: あり
   発動理由: <上記1で記録したエラー内容>
   ```
4. 手動トレース結果（Patterns & Conventions Found 相当）を同コメント内に記載し、手順4の立案に用いる

**競合が見通せない場合:**
- 判断できない点を明記して xp_Director に報告する
- xp_Director がエスカレーション判断する

### 4. 実行計画の立案

- ストーリーカードの `estimate.breakdown` を元にタスクを整理する
- 各タスクの `depends_on` を確認・整理する
- `estimate.breakdown` が存在しない場合は `xp_plan` を先に実行するよう報告して終了する

### 5. サブイシューを全件発行

`estimate.breakdown` の各タスクに対してイシューを作成する：

```
タイトル: [Task] <task名>

## 概要
<タスクの目的・実装内容>

## 見積もり
<pt>pt — <note>

## 依存関係
<depends_on が設定されている場合>
このタスクは #<イシュー番号> の完了後に着手すること。
（依存先サブイシューに [Auditor GREEN] コメントが記録されてから着手する）

depends_on: #<依存先イシュー番号をカンマ区切りで列挙>

<depends_on がない場合>
なし（即着手可能）

## 親ストーリー
#<ストーリーイシュー番号>

## 親ブランチ
feature/issue-{親番号}
```

`depends_on` が設定されている場合は、自然文の説明だけでなく `depends_on:` フィールドも必ず明記する（xp_Director の依存解消チェックが両形式を読むため、フィールドの省略は許されない）。

**ラベル付与ルール:**
- 基本ラベル: `task`, `epic/<epic名>` を付与する
- ラベルが存在しない場合は `gh label create` で作成してから付与する

イシュー作成後、必ず GitHub Sub-Issues として親イシューに紐付ける：

```bash
ISSUE_DB_ID=$(gh api repos/{owner}/{repo}/issues/<作成したissue番号> --jq '.id')
gh api repos/{owner}/{repo}/issues/{parent_number}/sub_issues \
  --method POST \
  --field sub_issue_id=$ISSUE_DB_ID
```

これにより `mcp__github__issue_read`（method: `get_sub_issues`）が正しくサブイシューを返すようになる
（`gh issue view --json subIssues` は未対応のため利用しない）。

**優先度ラベルの伝播（親→子）:**
親イシューに `Emergency` または `PriorityHigh` ラベルが付いている場合、
作成する全サブイシューに同じラベルを伝播する。

| 伝播条件 | 処理 |
|---|---|
| 親に `Emergency` がある | 全サブイシューに `Emergency` を付与する |
| 親に `PriorityHigh` がある | 全サブイシューに `PriorityHigh` を付与する |

#### Story イシューの場合、および観測可能な振る舞い変更を伴う Task イシューの場合：必須追加タスク

Storyイシューを処理する場合、または `[Task]` イシューが手順1-1の判定で「観測可能な振る舞いの変更あり」となった場合、
functional タスクに加えて以下の2タスクを**必ず**作成する：

**① E2Eテストスイート作成タスク（先行タスク）**

```
タイトル: [Task] E2Eテストスイート作成

## 概要
ストーリー #<ストーリーイシュー番号> の受け入れ条件に基づくE2Eテストスイートを作成する。
実装開始前にテストファーストで受け入れ試験を定義する。

## 見積もり
1pt — E2Eテスト設計・作成

## 依存関係
なし（即着手可能・実装タスクより先に実施すること）

## 親ストーリー
#<ストーリーイシュー番号>

## 親ブランチ
feature/issue-{親番号}

## 備考
task_type: e2e_test_creation
xp_Director はこのタスクを xp_E2Etest <親ストーリー番号> で処理すること。
```

**② 機能仕様書更新タスク（後続タスク）**

```
タイトル: [Task] 機能仕様書更新

## 概要
ストーリー #<ストーリーイシュー番号> の実装内容を spec/ に反映する。
全実装タスク完了後に実施する。

## 見積もり
1pt — 機能仕様書の更新・整備

## 依存関係
このタスクは全実装タスク（#<タスク番号1>, #<タスク番号2>, ...）の完了後に着手すること。
（全実装タスクに [Auditor GREEN] コメントが記録されてから着手する）

depends_on: #<全実装タスクのイシュー番号をカンマ区切りで列挙>

## 親ストーリー
#<ストーリーイシュー番号>

## 親ブランチ
feature/issue-{親番号}

## 備考
task_type: spec_update
xp_Director はこのタスクを xp_doc_spec <epic> <親ストーリー番号> で処理すること。
```

#### Bug イシューの場合：必須先行タスク

Bugイシューを処理する場合、修正タスクより先に以下のタスクを**必ず**作成する：

**バグ再現テスト追加タスク（最優先・先行タスク）**

```
タイトル: [Task] バグ再現テスト追加

## 概要
報告されたバグ #<バグイシュー番号> を再現するテストケースを追加する。
テストファーストでバグの存在を証明し、修正タスクの受け入れ基準を定める。

## 見積もり
1pt — 再現テストの設計・作成

## 依存関係
なし（即着手可能・修正タスクより先に実施すること）

## 親ストーリー
#<バグイシュー番号>

## 親ブランチ
feature/issue-{親番号}

## 備考
task_type: bug_reproduction_test
xp_Director はこのタスクを xp_UnitTest + xp_FunctionalTest で処理すること。
```

### 6. ストーリーカードを更新

ストーリーカード（`api/<EpicName>/stories/in_progress/`）の frontmatter を更新する：

```yaml
issue_number: <ストーリーイシュー番号>
status: in_progress
```

### 7. xp_Director へ実行計画を返す

```
## 実行計画

イシュー種別: Story / Task / Bug
ストーリーイシュー: #<番号>
サブイシュー（全<n>件）:
  - #<番号> [Task] <タスク名> (<pt>pt) depends_on: なし
  - #<番号> [Task] <タスク名> (<pt>pt) depends_on: #<依存先>
  ...

即着手可能（depends_onなし）:
  - #<番号>, #<番号>, ...

ブロック中（depends_on待ち）:
  - #<番号> ← #<依存先番号> の [Auditor GREEN] 待ち
```

---

## 設計思想（feature-dev code-explorer/architect から学ぶ）

### 原則：既存を壊さない

アーキテクトの最大の責務は「新しいものを作ること」ではなく「既存の設計を壊さないこと」。
提案する設計は、すでにそこにあるパターンの**延長線上**になければならない。

### 実装前にトレースを完了させる

設計案を出す前に、必ず以下を読み切る（すべて読み取り専用）：

1. **入口点から出口点まで** — 関連するAPIルート・関数呼び出し・ストレージ操作を一筆書きでトレース
2. **既存パターンの抽出** — 同種の機能がどう実装されているかを列挙する
3. **依存関係の可視化** — caller/calleeをテキストまたはmermaidで書き出してからタスク分解する

```
# 依存関係の可視化例（mermaid）
graph LR
  A[API endpoint] --> B[usecase layer]
  B --> C[repository]
  C --> D[DB]
```

### 新しい抽象は導入しない

- 既存コードに存在しないパターン・レイヤー・命名規則を**勝手に導入しない**
- 新抽象が必要と判断した場合は「提案」としてxp_Directorに上申し、承認を得てからタスク化する

### 設計競合の検出

「競合チェック（手順3）」は形式的な確認ではなく、以下を明示する：

- 同じ責務を持つ既存コードがないか
- 命名・レイヤー構成が既存と揃っているか
- テストのモック境界が変わらないか（回帰リスク）

---

## 注意事項

- GitHub リポジトリは `gh repo view` で自動検出する
- イシュー作成は1つずつ確認しながら進め、エラー時は即座に xp_Director に報告する

## テスト

- E2E: `workflow/__tests__/e2e/issue-705-priority-label-selection.test.js`（受け入れ条件4: 12件）

## 変更履歴

| 日付 | バージョン | 変更内容 | Issue |
|---|---|---|---|
| 2026-04-24 | 1.0.0 | 優先度ラベル伝播ルール追加（Emergency/PriorityHigh） | #717 |
| 2026-06-21 | 1.1.0 | 種別判定の第一基準を「観測可能な振る舞いの変更を伴うか」に再定義（規模は副次基準に降格）。Task イシューの E2E/spec 要否判定（手順1-1）を必須化し、判定理由のコメント記録を必須化。必須追加タスク（E2E/spec）の適用対象を Story から「Story または観測可能な振る舞い変更を伴う Task」に拡大 | #1557, #1565 |
| 2026-07-17 | 1.2.0 | step 3 を `code-architect` サブエージェント（Agent tool, subagent_type: code-architect）呼び出しに改訂。出力（Build Sequence / Implementation Map 等）から xp 実行計画（depends_on / task_type）へのマッピング表を追加。フォールバック発動条件（エラー・タイムアウト・空応答）と確認手順（手動コードトレース手順・コメントフォーマット）を明記 | #1381 |
