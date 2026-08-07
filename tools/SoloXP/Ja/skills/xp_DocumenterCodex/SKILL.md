---
model: claude-fable-5
---

# XP Documenter Codex Skill

## コマンド

### `xp_DocumenterCodex <epic_name> <issue_number>`

`xp_Documenter` の代替。ドキュメント生成のうち **ネットワーク（GitHub API）非依存の部分を Codex CLI（`codex exec`）に委任する**。
GitHub API が必要な部分（イシュー本文・コメントの取得）は引き続き Claude 自身が行う。

> **呼び出し元**: `xp_Director <issue番号> implementer=codex` から、`xp_Documenter` の代わりに呼ばれる。

---

## 責務

- `xp_issue2md` / `xp_doc_spec`（GitHub API依存）はClaude自身が実行する
- `xp_doc_reference` / `xp_doc_UnitTests` / `xp_doc_FunctionTests` / `xp_doc_E2ETests`（ローカル完結）はCodex CLIに一括委任する
- 完了後は xp_Auditor (doc モード) に引き継ぐ（Auditorはファイル存在・内容を独立に再検査するため、本スキルの報告内容の正確さに依存しない）

---

## なぜこの分担か

`codex exec --sandbox workspace-write` はネットワークアクセスが制限される。
`xp_issue2md`（`gh issue view` でイシュー本文・コメントを取得）と `xp_doc_spec`（同様にイシュー履歴を参照し、
関連イシュー表の `state` をGitHub上の実際の状態と再同期する）はGitHub APIへのライブアクセスが必須のため、
Codexに委任できない。一方、`xp_doc_reference` / `xp_doc_UnitTests` / `xp_doc_FunctionTests` / `xp_doc_E2ETests` は
「ローカルのコード・テストファイル・既存docsを読んで、それを反映したmarkdownを書く」だけで完結し、GitHub APIを
必要としないため、Codexに安全に委任できる。

---

## 動作手順

### 0. 着手前チェック

`xp_ImplementerCodex` と同一（Codex CLI疎通確認、`~/.codex/auth.json` の存在確認）。

### 1. `[Documenter実行中]` マーカーを記録する

イシューにコメントを記録する:
```
[Documenter実行中]
ドキュメント生成エージェント: Claude（issue2md/spec） + Codex CLI（reference/tests）
```

### 2. Claude自身が実行する部分（GitHub API依存）

1. `xp_issue2md <issue_number>` をそのまま実行する
2. `xp_doc_spec <epic_name> <issue_number>` をそのまま実行する

いずれも既存の `xp_issue2md` / `xp_doc_spec` SKILL.md の手順に従う（本スキル特有の変更はない）。

### 3. Codexへの一括委任プロンプトの組み立て

以下を1つのプロンプトにまとめる：

1. このタスクで変更されたファイル一覧（`git diff --name-status` の出力）
2. 依頼内容：
   ```
   このdiffで変更されたコード・テストに合わせて、以下のドキュメントを更新すること:
   - docs/reference/ 配下: 変更された関数・クラスのリファレンス（xp_doc_referenceの出力規約に従う）
   - docs/tests/UnitTests/ 配下: 変更・追加されたユニットテストのケース一覧
   - docs/tests/FunctionTests/ 配下: 変更・追加された機能テストのケース一覧
   - docs/tests/E2ETests/ 配下: 変更・追加されたE2Eテストのケース一覧（該当する場合のみ）

   まず既存のdocs/reference/・docs/tests/配下のファイルを1〜2個読んで、見出し構成・表形式などの
   既存の様式を把握し、それに合わせること。該当するドキュメントファイルが存在しない場合は新規作成すること。
   対象外の変更（コードファイル・テストファイル・このタスクと無関係なドキュメント）には触れないこと。
   ```
3. 対象エピックディレクトリの `Codex.md` が存在する場合はその内容
4. 明示的な制約（**必ず含める**）：
   ```
   - 新規ブランチ・git worktree を作成しないこと。現在チェックアウト済みのブランチで直接編集すること。
   - コードファイル（scripts/ 等）・テストファイル（__tests__/ 配下）は変更しないこと。ドキュメント（docs/ 配下）のみ変更すること。
   - このタスクの範囲外のドキュメントは変更しないこと。
   ```

### 4. Codex CLI 実行

```bash
codex exec \
  --sandbox workspace-write \
  --cd <対象エピックディレクトリの絶対パス> \
  --json \
  -o /tmp/codex-doc-last-<issue番号>.txt \
  "<手順3で組み立てたプロンプト>"
```

### 5. 軽い検証（Codexの自己申告は使わない）

`git diff --name-status` で以下を確認する：
- 変更ファイルが `docs/` 配下のみであること（コード・テストファイルに触れていないこと）
- 対象外のドキュメントに触れていないこと

Auditorのdocモードがファイル内容・鮮度を独立に再検査するため、ここでは深い内容検証は行わない
（Auditorに任せる）。範囲外のファイル変更があった場合はイシューにコメントして xp_Director に報告する。

### 6. xp_Director に結果を報告して終了

`xp_Documenter` と同型の報告フォーマット：

```
## ドキュメント生成完了

生成・更新したファイル:
- `<path>`: <内容概要>（xp_issue2md / xp_doc_spec による分、Claude自身が実行）
- `<path>`: <内容概要>（Codex CLI による分）
...

<対象外の変更が見つかった場合>
⚠️ 範囲外のファイル変更を検出しました:
- <path>: <内容>
```

---

## 注意事項

- `xp_issue2md` / `xp_doc_spec` の実行自体はClaudeが行うため、これらの正確さはこれまで通り担保される
- Codex委任分（reference/tests系）の内容は「軽い検証」止まりであり、詳細な正確性はAuditorのdocモードが
  独立に検査する（ファイル存在・内容・issue2mdログの鮮度チェックは無改修）
- Codex CLI はユーザー個人のChatGPT OAuth認証（`CODEX_AUTH_JSON_B64`）で動作する。Codex側の利用枠を消費する点に留意する
