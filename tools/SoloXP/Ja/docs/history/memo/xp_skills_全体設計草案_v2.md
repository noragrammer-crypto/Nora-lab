# XP Skills 全体設計草案 v2

作成日: 2026-02-25  
ステータス: 草案（レビュー待ち）

---

## 1. スキル全体マップ

```
xp_Director（責任者・司令塔）
    ↓ Issue種別判断
    ├── ストーリーイシュー → xp_Architect
    │       ↓ 全サブイシューを一気に発行（depends_on付き）
    │       ↓ Directorに実行計画を返す
    └── タスクイシュー（depends_onブロックなし）
            ↓ 並列実行可能なものは同時に依頼
            xp_E2Etest          ← E2Eテスト作成
            ↓
            xp_FunctionalTest   ← 機能テスト作成
            ↓
            xp_UnitTest         ← 単体テスト作成
            ↓
            xp_implement        ← 実装
            ↓
            xp_Auditor          ← テスト実行・結果報告
            ↓ RED → xp_implement差し戻し（上限3回）
            ↓ GREEN → サブイシューに[Auditor GREEN]コメント
            xp_doc              ← ドキュメント生成（全種）
            ↓
            xp_Auditor          ← ドキュメントチェック・PR発行
            ↓
            xp_Director         ← タスク完了・停止
```

---

## 2. ディレクトリ規約（リライト版）

### モノレポ構成

本リポジトリ（ObsidianVault）がそのままGitリポジトリ。  
各エピック（プロジェクト）は `api/<EpicName>/` 配下をルートとして管理する。

> **Note:** Vercel Serverless Functionsの制約上 `api/` 配下が必須。  
> 論理的にはルート直下プロジェクトと同等に扱う。

### エピック配下の標準ディレクトリ構成

```
api/<EpicName>/
├── stories/
│   ├── backlog/          ← 未着手ストーリーカード
│   ├── in_progress/      ← 作業中（GitHub Issue化済み）
│   └── done/             ← 完了
└── docs/
    ├── spec/             ← 機能仕様書（ストーリーの積分）
    │   ├── README.md     ← 機能領域の索引・全体像
    │   ├── <領域>.md     ← 領域ごとの仕様（AIが適切サイズで管理）
    │   └── history/      ← 置き換えられた旧仕様書
    ├── reference/        ← 実装ドキュメント（コードから生成）
    │   └── <packagename>/
    │       └── <ClassName>.md
    └── tests/            ← テストドキュメント
        ├── UnitTests/
        ├── FunctionTests/
        └── E2ETests/
```

### ストーリーカードのライフサイクル

```
backlog/ → in_progress/（GitHub Issue化時）→ done/（実装完了時）
```

> done/ からの history/ 移動はxp_docの責務外。GitHub管理で不要になれば削除OK。

---

## 3. ストーリーカード フロントマター標準

```yaml
---
title: ナレッジベース機能
epic: DiscordAIbot
status: backlog          # backlog / in_progress / done
issue_number:            # xp_Architectがストーリーイシュー発行時に追記
estimate:
  total: 6
  breakdown:
    - task: 設計・仕様確定
      pt: 1
      note: 詳細メモ
    - task: lib/knowledge.js 実装
      pt: 1
      note: 詳細メモ
      depends_on: 設計・仕様確定
estimate_history:
  - date: 2026-02-23
    total: 6
    reason: 初期見積もり
---
```

### フロントマターの書き込み権限

| フィールド | 書き込み者 |
|---|---|
| title / epic / estimate / breakdown | xp_plan |
| status | xp_Architect（in_progress）/ 手動（done） |
| issue_number | xp_Architect（ストーリーイシュー発行時） |

---

## 4. GitHubイシューの進捗管理

### サブイシューのコメントが進捗ログ

xp_Directorが各ステージの開始・完了をサブイシューにコメントとして記録する。

```
[E2ETests作成中]
[E2ETests完了]
[UnitTest作成中]
[UnitTest完了]
[implement実行中]
[implement完了]
[Auditor テスト実行中]
[Auditor GREEN]          ← depends_on解消の判定キー
[doc生成中]
[doc完了]
[Auditor ドキュメントチェック中]
[PR発行済み #99]
```

### depends_on の解消判断

- GitHub の close 状態は見ない（クローズはのらさんが任意タイミングで実施）
- **依存先サブイシューのコメントに `[Auditor GREEN]` があればブロック解除**
- ブロック解除されたサブイシューはDirectorが並列実行を依頼

---

## 5. スキル定義

---

### xp_Director ★新設

**役割:** 責任者・司令塔  
**担当モデル:** claude-opus-4-6  
**権限:** Issue/PRコメント書き込み・全スキルへの指示・進行管理

**責務:**
- IssueとPRを見て種別判断（ストーリーイシュー or タスクイシュー）
- 全スキルの実行順序・タイミング制御
- depends_on解消チェック・並列実行管理
- サブイシューへのステージコメント書き込み
- RED時の差し戻し判断・イテレーション上限管理（3回）
- タスク完了判断・停止

**コードは触らない。判断と進行管理に徹する。**

**処理フロー:**

```
1. Issue番号を受け取る
2. Issue内容を読む（MCP or gh）
3. 種別判断
   - ストーリーイシュー → xp_Architect を呼ぶ
   - タスクイシュー    → 実行フローへ
4. 実行フロー（タスクイシューの場合）
   a. depends_onブロックなしのサブイシューを特定
   b. 並列実行可能なものは同時に依頼
   c. 各サブイシューに対して:
      - xp_E2Etest → xp_FunctionalTest → xp_UnitTest
      - xp_implement
      - xp_Auditor（テスト）
        - RED → implementに差し戻し（最大3回、超えたらエスカレーション停止）
        - GREEN → [Auditor GREEN]コメント書き込み → 依存サブイシューのブロック解除チェック
      - xp_doc
      - xp_Auditor（ドキュメントチェック・PR発行）
   d. 全サブイシュー完了 → 停止
```

**呼び出し方:**
```
xp_Director <issue_number>
```

---

### xp_Architect ★新設（旧: xp_issue）

**役割:** 参謀・アーキテクト  
**担当モデル:** claude-opus-4-6  
**権限:** あらゆるファイル読み取り・GitHub Issue操作・サブイシュー発行・ストーリーカード書き込み

**責務:**
- ストーリーイシューの内容を読み込む
- 既存実装・spec・テストとの競合チェック
- 実行計画の立案
- サブイシューを全件一気に発行（depends_on付き）
- ストーリーカードの `issue_number` / `status` を更新
- xp_Directorへ実行計画を返す

**処理フロー:**

```
1. ストーリーイシューの内容を全文読む
2. 既存実装との競合チェック
   - docs/spec/ を読む
   - 関連するコードを読む
   - 既存テストを読む
3. 影響範囲を特定・実行計画を立案
4. ストーリーカードの breakdown を元に全サブイシューを一気に発行
   - depends_on を各サブイシューに記録
5. ストーリーカードに issue_number を書き込み・status を in_progress に更新
6. xp_Directorに実行計画（サブイシュー一覧）を返す
```

**競合が見通せない場合:**
- 判断できない点を明記してxp_Directorに報告
- xp_Directorがエスカレーション判断

**呼び出し方:**
```
xp_Architect <story_issue_number>
```

---

### xp_Auditor ★変更

**役割:** 検査官  
**担当モデル:** claude-sonnet-4-6  
**権限:** 読み取り専用（ファイル変更不可）＋Issueコメント書き込み＋PR発行

> **変更点:** ワークフロー制御を xp_Director に移譲。PR発行権限を追加。

**責務:**
- テスト実行・結果の報告（判断はしない・Directorに返すだけ）
- ドキュメントのチェック・報告
- PR発行（ドキュメントチェックOK後）

**処理フロー（テストモード）:**

```
1. xp_RunTestSuites 実行
2. 結果を分析
3. IssueにステージコメントとしてGREEN / RED を記録
4. xp_Director に結果を返す
   - RED の場合: 原因・該当箇所をIssueコメントに記録
```

**処理フロー（ドキュメントチェックモード）:**

```
1. docs/ 以下の生成物を確認
   - spec/README.md の索引整合性
   - 各ドキュメントの内容が薄すぎないか
2. Issueにチェック結果をコメント
3. OK → PR発行（MCP or gh）→ [PR発行済み #xx] をコメント
4. xp_Director に結果を返す
```

**呼び出し方:**
```
xp_Auditor test <epic> <issue>
xp_Auditor doc <epic> <issue>
```

---

### xp_doc ★新設（ラッパー）

**役割:** ドキュメント全種生成  
**担当モデル:** claude-sonnet-4-6

**処理フロー:**
```
1. xp_doc_spec <epic> <issue>
2. xp_doc_reference <epic>
3. xp_doc_UnitTests <epic>
4. xp_doc_FunctionTests <epic>
5. xp_doc_E2ETests <epic>
```

**呼び出し方:**
```
xp_doc <epic_name> <issue_number>
```

---

### xp_doc_spec ★新設

**役割:** 機能仕様書の生成・更新  
**担当モデル:** claude-sonnet-4-6

**思想:**
- ストーリーカード = 差分（delta）
- spec = 積分（integral）
- spec → stories の逆方向なし

**インプット:**
- GitHubイシュー本文＋コメント全履歴（MCP or gh）
- 既存の `docs/spec/` 以下の全MD

**処理フロー:**
```
1. docs/spec/README.md で現状の機能領域マップを把握
2. Issue本文＋コメントを全読み（仕様変更はコメントに埋まっていることが多い）
3. 既存specとの差分を特定
4. 差分を該当機能領域のMDに積分
   - 既存領域なら更新
   - 新規領域なら新ファイル作成
   - 1ファイル200〜500行超えそうなら適切に分割
5. docs/spec/README.md の索引を更新
```

**アウトプット:**
- `docs/spec/README.md`（更新）
- `docs/spec/<領域>.md`（新規 or 更新）

**呼び出し方:**
```
xp_doc_spec <epic_name> <issue_number>
```

---

### xp_doc_reference ★新設

**役割:** 実装ドキュメントの生成・更新  
**担当モデル:** claude-sonnet-4-6

**思想:** コードが正。コードを読んで生成。

**処理フロー:**
```
1. api/<EpicName>/ 配下の実装コードを走査
2. 既存 docs/reference/ と比較
3. 変更があったクラス・関数のドキュメントを更新
4. 削除されたクラスのMDを削除
```

**アウトプット:** `docs/reference/<packagename>/<ClassName>.md`

**呼び出し方:**
```
xp_doc_reference <epic_name> [package_name]
```

---

### xp_doc_UnitTests ★新設

**役割:** UnitTestドキュメントの生成・更新  
**担当モデル:** claude-sonnet-4-6

**インプット:** `api/<EpicName>/tests/unit/` 配下のテストコード  
**アウトプット:** `docs/tests/UnitTests/<モジュール名>.md`  
**ドキュメント内容:** テスト対象・テストケース一覧（正常系/異常系）・カバレッジサマリー

**呼び出し方:**
```
xp_doc_UnitTests <epic_name>
```

---

### xp_doc_FunctionTests ★新設

**役割:** FunctionalTestドキュメントの生成・更新  
**担当モデル:** claude-sonnet-4-6

**インプット:** `api/<EpicName>/tests/functional/` 配下のテストコード  
**アウトプット:** `docs/tests/FunctionTests/<機能名>.md`  
**ドキュメント内容:** テスト対象機能・シナリオ一覧・テストデータ説明

**呼び出し方:**
```
xp_doc_FunctionTests <epic_name>
```

---

### xp_doc_E2ETests ★新設

**役割:** E2ETestドキュメントの生成・更新  
**担当モデル:** claude-sonnet-4-6

**インプット:** `api/<EpicName>/tests/e2e/` 配下のテストコード  
**アウトプット:** `docs/tests/E2ETests/<ユーザーシナリオ名>.md`  
**ドキュメント内容:** ユーザーシナリオ概要・Given/When/Thenステップ・前提条件

**呼び出し方:**
```
xp_doc_E2ETests <epic_name>
```

---

### 既存スキルへの追記（変更なし・追記のみ）

| スキル | 追記内容 |
|---|---|
| xp_plan | ストーリーカード置き場は `api/<EpicName>/stories/backlog/` |
| xp_E2Etest | xp_Directorから呼ばれる。Issueから生成 |
| xp_FunctionalTest | 同上 |
| xp_UnitTest | 同上 |
| xp_implement | 同上 |
| xp_RunAllUnitTests | 変更なし |
| xp_RunTestSuites | 変更なし |
| xp_RunE2ETests | 変更なし |
| xp_worklog | 変更なし |

---

## 6. GitHub アクセス方針

| 環境 | アクセス方法 |
|---|---|
| Claude Code Web | `gh` コマンド |
| claude.ai / その他 | MCP経由 |

各スキルは環境を検出して自動切り替え。

---

## 7. TODO（未決事項）

- [ ] xp_Architect: 競合チェックの判断基準の詳細化
- [ ] xp_Auditor: ドキュメントチェックのOK/NG基準の詳細化
- [ ] 既存スキルへの追記作業（本草案確定後）
- [ ] `done/` → `docs/history/stories/` 移動タイミングの整理
