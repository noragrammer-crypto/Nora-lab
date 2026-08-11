# 使い方チュートリアル

初めてのIssue起票から `xp_Director` 実行・PRマージまでの一連の流れを、実例つきで説明する。
[インストールマニュアル](./install.md)・[セットアップマニュアル](./setup.md) が完了している前提。

## 全体像

```
Issue作成（あなた）
    ↓
/xp_Director <issue番号>
    ↓
xp_Tester → xp_Implementer → xp_Auditor（test）→ xp_Documenter → xp_Auditor（doc）
    ↓
[Auditor GREEN] コメントがIssueに記録される
    ↓
PRが自動発行される
    ↓
あなたがPRを確認してマージ
```

`[Task]` タグ付きの小さめのIssue1件は、上記の流れがそのまま1回の `xp_Director` 実行で
完結する（1タスク1PRルール）。`[Story]` や `[Bug]` の場合はxp_Architectがサブイシューに
分解してから同じ流れを繰り返す（詳細は [WORKFLOW.md](../../WORKFLOW.md)）。

## 実例: 重複した日付フォーマット処理を共通関数に切り出す

`xp_Director` は `[Task]` タグ付きイシューでも、**ユーザー/外部から観測可能な振る舞いの変更を
伴う場合**（API・UI・出力内容の追加/変更等）はArchitectをバイパスせず、E2E/spec相当のサブ
タスクを追加発行することがある（[WORKFLOW.md](../../WORKFLOW.md) の「観測可能変更チェック」）。
最初の1件はこのゲートに引っかからない、**内部リファクタのみ**（挙動を変えない）の例にする。

### 1. Issueを作成する（あなた）

```bash
gh issue create \
  --title "[Task] 日付表示処理の重複コードを共通関数に切り出す" \
  --body "## 背景
複数箇所にほぼ同じ日付フォーマット処理（YYYY-MM-DD整形）が重複している。

## やること
- \`lib/dateFormat.js\` に \`formatDate(date)\` を追加する
- 重複していた各呼び出し箇所を \`formatDate(date)\` の呼び出しに置き換える
- 外部から見える出力・挙動は変えない（内部整理のみ）

## 受け入れ条件
- [ ] 既存のテストが引き続き全てパスする（出力が変わっていないことの担保）
- [ ] \`formatDate\` 単体のユニットテストを追加する"
```

`gh issue create` はWeb版Claude Code・ターミナル・スマホのGitHubアプリ、どこから実行しても良い。
起票した瞬間に開発対象が確定する（デルタアプローチ）。

発行されたIssue番号を控える（以下では `#101` とする）。

### 2. `xp_Director` を実行する

Claude Codeで以下を入力する。

```
/xp_Director 101
```

今回は「内部リファクタのみ、外部の振る舞いは変えない」ため観測可能変更チェックは
「なし」と判定され、`[Task]` タグの通りArchitectはバイパスされてそのままタスク処理フローに
入る。実行中、Issue上には進捗コメントが積まれていく：

```
## 観測可能変更チェック（[Task]スキップ判定）
対象: #101
観測可能な振る舞いの変更: なし
理由: 既存の日付フォーマット処理を共通関数に切り出すのみで、出力・外部インターフェースは変えない

[Tester実行中] テストスイートを作成しています…
[Tester完了] tests/unit/dateFormat.test.js を追加（4ケース）

作業開始 2026-08-08 10:00 JST

[Implementer実行中] テストをグリーンにする実装を行っています…
[Implementer完了] lib/dateFormat.js を実装、既存呼び出し箇所を置き換え

[Auditor テスト実行中] 独立した観点でテストを再実行・分析しています…
[Auditor GREEN] 全4ケース pass。既存テストも回帰なし。実装がテストの意図を満たしていることを確認。

[Documenter実行中] spec/reference/testsドキュメントを生成しています…
[Documenter完了] docs/spec/dateFormat.md, docs/reference/dateFormat.md を更新

[Auditor ドキュメントチェック中] spec/referenceの整合性を確認しています…
[Auditor doc OK]

作業完了 2026-08-08 10:24 JST / 所要時間: 24分

[PR発行済み #102]
```

（実際のコメント文言・粒度はスキルのバージョンにより多少変わる。上記は流れを掴むための一例）

もし今回の例と違い「API/UI/出力内容の追加・変更を伴うタスク」だった場合は、観測可能な
振る舞いの変更が「あり」と判定され、`xp_Architect` が呼ばれてE2E/specサブタスクが追加発行
される。その場合は上記のような単発フローにはならず、[WORKFLOW.md](../../WORKFLOW.md) の
Story/Bugと同様に複数サブイシューを順番に処理する流れになる。

### 3. PRを確認する（あなた）

```bash
gh pr view 102
gh pr diff 102
```

PR本文には対応Issue（`Closes #101`）・変更内容・テスト結果が記載されている。
差分に問題がなければマージする。

```bash
gh pr merge 102 --squash --delete-branch
```

`--delete-branch` を付けることで、マージ後にリモート/ローカル双方のブランチが確実に削除される
（[ブランチ削除ルール](../../CLAUDE.md.template) 参照）。リポジトリ設定で
「Automatically delete head branches」を有効にしている場合はリモート側は自動削除されるが、
設定に依存せず確実に消すにはこのフラグを付けるのが安全。

これでIssue #101 はクローズされ、1サイクル完了。

### 4. 次のIssueへ

`/xp_Director` を引数なしで実行すると、オープンなIssueの中から次に処理すべきものを
自動選択する。

```
/xp_Director
```

## `[Story]`・`[Bug]` の場合（発展）

`[Story]`（複数タスクにまたがる機能追加）や `[Bug]`（バグ修正）でIssueを起票すると、
`xp_Architect` が実装内容をサブイシューに分解し、`feature/issue-{番号}` ブランチを作成する。
その後は各サブイシューに対して `/xp_Director <サブイシュー番号>` を個別に実行し、
全サブイシューが `[Auditor GREEN]`（または `spec_update` タスクの場合は `[Auditor doc OK]`）
になったところで `feature/issue-{番号}` → デフォルトブランチのPRが発行される。

詳しい役割分担・依存関係解消・リトライ制御は [WORKFLOW.md](../../WORKFLOW.md) を参照。

## つまずいたら

- `gh` の認証・権限エラー → [セットアップマニュアル](./setup.md) の1・2節を再確認
- スキルが候補に出てこない → [インストールマニュアル](./install.md) の2節（スキル登録）を再確認
- 想定外の動作 → `CLAUDE.md` に `CLAUDE.md.template` の内容が正しく反映されているか確認
  （プレースホルダー `<...>` が埋まっていない、記載自体が欠落している、等）
