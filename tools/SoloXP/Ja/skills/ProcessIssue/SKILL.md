---
model: claude-sonnet-4-6
---

# ProcessIssue スキル

## 概要

オープンイシューリストから未ブロックのイシューを1件選択し、
イシューの内容に応じて3つのワークフローのうちどれかを実行する。

`/xp_Director`（引数なし）の後継・移行先として機能する。
`/xp_Director`（引数なし）自体は削除しない。引き続き利用可能。

---

## コマンド

### `/ProcessIssue [implementer=codex]`

オープンイシューから未ブロックのイシューを選択し、
内容に応じたワークフローを実行する。

`implementer=codex` が指定された場合、ワークフロー3（ソフトウェア開発・スキル開発系）で
`xp_Director` に委譲する際にそのままフラグを引き渡す。バックログをCodex CLI実装で
消化するバッチ実験用のオプション。省略時の動作は無変更。

---

## 責務

- オープンイシューリストの取得と未ブロックイシューの選択
- イシュー内容に基づくワークフロー振り分け判定
- 各ワークフローへの処理委譲

---

## 処理フロー

### 1. オープンイシューリストを取得する

```bash
gh issue list --repo <owner>/<repo> --state open --limit 50 --json number,title,labels,createdAt,body
```

全件を一括取得して、後続の選択ロジックで優先度・FIFO順に処理する。
`task` ラベルによる優先取得は廃止。優先度（Emergency > PriorityHigh > 通常）＋ FIFO が唯一の選択基準。

### 2. 未ブロックイシューを選択する

#### 2-1. 基本フィルタ

以下の条件でスキップ対象を除外する：

- ラベルに `backlog`、`block`、または `ignore` が含まれる → スキップ（`ignore` は意識的に無視する提案、`backlog` は作業延期、`block` は一時ブロック）
- 現在の環境を検出する（`CLAUDE_CODE_ENV` 環境変数、または未設定時のデフォルト: `ClaudeCodeWeb`）
  - イシューに `env/*` ラベルが付いている場合、現在環境と一致しなければスキップ
  - 対応ラベル: `env/Termux`, `env/ClaudeCodeWeb`, `env/Codespace`, `env/Windows`
  - `env/*` ラベルがない場合はどの環境でも実行可能とみなす

#### 2-2. 優先度バケット分類と FIFO ソート

フィルタを通過したイシューを以下の3バケットに分類する：

| バケット | 条件 |
|----------|------|
| `emergency` | `Emergency` ラベルあり |
| `high` | `PriorityHigh` ラベルあり |
| `normal` | 上記いずれでもない |

各バケット内でイシュー番号**昇順**（小さい番号が優先＝古い順・FIFO）にソートする。
`gh issue list` の返却順は更新日時降順なので、**必ず番号でソートし直すこと**。

#### 2-3. 候補イシューを順番に評価して1件選択する

`emergency` → `high` → `normal` の順でバケットを処理し、
各バケット内では番号昇順（古い順）で候補を1件ずつ評価する。

**評価手順（各候補イシューに対して）：**

**A. InProgress チェック**

```bash
gh issue view <issue_number> --json comments --repo <owner>/<repo>
```

コメント一覧から `[ProjectStatus: InProgress]` を含む**最新**コメントを探す。

- 該当コメントが**ない** → InProgress なし（次のチェックへ）
- 該当コメントの投稿日時が **1時間以内** → スキップして次の候補へ（別スレッドで処理中）
- 該当コメントの投稿日時が **1時間以上前** → InProgress 無効（古い処理が停止とみなす）。チェック通過して次へ
- コメント取得に失敗した場合はこのチェックをスキップしてよい

**B. `depends_on` チェック**

イシュー本文の `## 依存関係` セクションから依存先イシュー番号を抽出する。
`depends_on: #<番号>` のような明示的フィールドと、「このタスクは #<番号> の完了後に着手すること」のような自然文中の `#<番号>` 参照の両方が対象。`depends_on:` フィールドが無い旧形式のイシューでも、セクション内の `#<数字>` をすべて依存先として扱う。
依存先が1件以上見つかった場合：

```bash
gh issue view <depends_on番号> --json comments --repo <owner>/<repo> \
  | python3 -c "import json,sys; cs=json.load(sys.stdin).get('comments',[]); bodies=[c.get('body','') for c in cs]; print('GREEN') if any('[Auditor GREEN]' in b or '[Auditor doc OK]' in b for b in bodies) else None"
```

- `[Auditor GREEN]` が見つかれば依存解消とみなす。依存先が `spec_update` タスク（`xp_doc_spec` → `xp_Auditor doc` のみを通過し `[Auditor GREEN]` は構造的に出力されない）の場合は `[Auditor doc OK]` の有無で判定する（両マーカーは排他的なため、依存先の種別を個別判定せず両方チェックしてよい）
- どちらも見つからなければブロック中 → スキップして次の候補へ
- **GitHub の close 状態は見ない**（クローズ済みでも `[Auditor GREEN]` / `[Auditor doc OK]` がなければブロック中）

**C. Architect済みイシュー チェック**

候補にしようとしたイシューについて、タイトル種別（`[Story]` / `[Task]` / `[Bug]` / タグなし）に関わらずコメントを確認する
（`[Task]` イシューでも観測可能変更ゲート経由で Architect 分解される場合がある。
サブイシューの有無では判定しない——関連タスクを手動でサブイシューに紐付ける運用があるため）：

```bash
gh issue view <issue_number> --json comments --repo <owner>/<repo> \
  | python3 -c "import json,sys; cs=json.load(sys.stdin).get('comments',[]); print(sum(1 for c in cs if '[親ブランチ作成済み]' in c.get('body','')))"
```

- `[親ブランチ作成済み]` が **ない** → 通常の候補として選択する（ステップDへ）
- `[親ブランチ作成済み]` が **ある** → **Architect済みイシュー** として、サブタスクに委譲する：

  **サブタスク委譲フロー：**
  1. このStoryのサブイシュー一覧を取得する：
     `gh` CLI の `--json subIssues` は未対応のため、MCP ツール経由で取得する：
     - tool: `mcp__github__issue_read`
     - method: `get_sub_issues`
     - issue_number: `<story番号>`
  2. 各サブイシューに対して、以下を確認して候補を絞り込む：
     - `backlog` / `block` ラベルなし
     - env ラベル一致（または env ラベルなし）
     - InProgress でない（最新の `[ProjectStatus: InProgress]` コメントが**存在しない**、または投稿から **1時間以上経過している**こと）
     - `depends_on` 解消済み（`[Auditor GREEN]` あり。ただし依存先が `spec_update` タスク〈タイトルに「機能仕様書更新」または本文に `task_type: spec_update`〉の場合は `[Auditor doc OK]` あり）
  3. 有効なサブイシューをイシュー番号**昇順**でソートし、最古のものを選択する
  4. 有効なサブイシューがゼロ件の場合:
     - 全サブイシューのコメントを確認する
     - 各サブイシューの完了マーカーは、通常タスクは `[Auditor GREEN]`、`spec_update` タスク（タイトルに「機能仕様書更新」または本文に `task_type: spec_update`）は `[Auditor doc OK]` とする（`spec_update` タスクは `xp_doc_spec` → `xp_Auditor doc` のみを通過し、`[Auditor GREEN]` は構造的に出力されない）
     - 全サブイシューが該当の完了マーカーを満たしている → `xp_Director <ストーリー番号>` を呼び AllGREEN 完了フローへ委譲する
     - 該当の完了マーカーを満たさない未完了サブイシューが残っている → このStoryは未完了サブイシューありとして保留し、候補評価へ戻る

**D. 選択確定**

上記チェックをすべて通過したイシュー（またはStoryから委譲されたサブイシュー）を選択する。

---

### 3. ワークフロー振り分け

選択したイシューのタイトル・ラベル・本文を確認し、以下のワークフローのうちどれかを実行する：

#### ワークフロー 1: NovelGeneratorワークフロー

**判定条件：**
- ラベルに `epic/AINovelGenerator` が含まれる
- タイトルや本文に「小説」「エピソード」「NovelGenerator」等が含まれる

**処理：**
NovelGeneratorRun の呼び出し：
```
/NovelGeneratorRun <issue番号>
```

#### ワークフロー 2: 落ちこぼれ人形使い執筆系

**判定条件：**
- ラベルに `epic/ningyotsukai` が含まれる
- タイトルや本文に「落ちこぼれ」「人形使い」等が含まれる

**処理：**
自動実行しない。ユーザー指示に従う手動作業として扱う。
イシューにコメントして停止する：
```
⚠️ 落ちこぼれ人形使い執筆系イシューを検出しました。
このワークフローは手動作業です。ユーザーの指示をお待ちします。
Issue: #<issue番号> <タイトル>
```

#### ワークフロー 3: ソフトウェア開発・スキル開発系

**判定条件：**
- ワークフロー1〜2・4に該当しない場合

**処理：**
xp_Director に issue 番号を渡して委譲する：
```
/xp_Director <issue番号>
```
ProcessIssue自身が `implementer=codex` 付きで呼ばれていた場合は、そのフラグをそのまま引き渡す：
```
/xp_Director <issue番号> implementer=codex
```

#### ワークフロー 4: Codex 自動レビューイシュー

**判定条件（すべて満たす場合）：**
- タイトルが `**<sub><sub>![P1 Badge]` または `**<sub><sub>![P2 Badge]` 形式
- body に `@chatgpt-codex-connector` が含まれる

**処理：**
xp_Director を呼ばず、以下のフローを直接実行する：

1. 指摘内容（タイトル＋body）を読んで納得できるか判断する
2. **納得できる場合**:
   - 対象ファイルを特定して修正する（テストスイートの全実行は不要）
   - `feature/issue-{番号}` ブランチを作成し、修正をコミット・プッシュする
   - PR を作成して `Closes #<番号>` を含める
3. **納得できない場合**:
   - 理由をイシューにコメントする
   - `ignore` ラベルを付けて終了する

**連続する Codex イシューの処理：**
選択したイシューが Codex イシューだった場合、処理後に次の Codex イシューがあれば続けて処理する（1セッションで連続処理可）。ただし通常のソフトウェア開発イシューが混在している場合は1件で停止してユーザーに確認する。

---

## 注意事項

- 通常フロー（ワークフロー1〜3）では1回の実行で処理するイシューは1件のみ
- Codex イシュー（ワークフロー4）は連続処理可
- 判断に迷う場合はユーザーに確認する
- `xp_Director`（引数なし）との違いは振り分けロジックの追加のみ
