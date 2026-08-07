# Solo XP 自律エージェントシステム構成案

## アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────┐
│ プロジェクトマネージャー層（Nora on Android/Termux）    │
│ - Issue作成で指示                                        │
│ - 進捗モニタリング（gh issue list）                      │
│ - PR承認                                                 │
│ - 緊急時はTermuxで直接作業                               │
└────────────┬────────────────────────────────────────────┘
             │
             │ GitHub API
             ↓
┌─────────────────────────────────────────────────────────┐
│ GitHub Repository（情報共有基盤）                        │
│ ├─ Issues: タスクキュー                                 │
│ ├─ PRs: 成果物提出                                      │
│ ├─ Projects: 進捗ボード                                 │
│ └─ META/README/TODO/ChangeLog: プロジェクト状態管理     │
└────────────┬────────────────────────────────────────────┘
             │
             │ Webhook / GitHub Actions
             ↓
┌─────────────────────────────────────────────────────────┐
│ Codespace（奉行屋敷 = 自律エージェント実行環境）        │
│                                                           │
│  ┌──────────────────────────────────────────┐          │
│  │ 奉行プロセス（bugyo-daemon）               │          │
│  │ - Issue監視ループ（30秒間隔）              │          │
│  │ - tmuxセッション管理                        │          │
│  │ - タスク割り当て                            │          │
│  │ - 完了報告                                  │          │
│  └────────┬─────────────────────────────────┘          │
│           │                                               │
│  ┌────────┴──────────────────────────────┐             │
│  │ メイド軍団（tmux sessions）             │             │
│  │                                          │             │
│  │  ┌─────────────────────────┐          │             │
│  │  │ maid-issue-42             │          │             │
│  │  │ タスク: バグ修正           │          │             │
│  │  │ 状態: コード生成中         │          │             │
│  │  └─────────────────────────┘          │             │
│  │                                          │             │
│  │  ┌─────────────────────────┐          │             │
│  │  │ maid-issue-43             │          │             │
│  │  │ タスク: ドキュメント作成   │          │             │
│  │  │ 状態: PR作成中             │          │             │
│  │  └─────────────────────────┘          │             │
│  │                                          │             │
│  │  ┌─────────────────────────┐          │             │
│  │  │ maid-issue-44             │          │             │
│  │  │ タスク: テスト実装         │          │             │
│  │  │ 状態: レビュー待ち         │          │             │
│  │  └─────────────────────────┘          │             │
│  └─────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────┘
```

## ファイル構成

```
solo-xp-toolkit/
├── .github/
│   └── workflows/
│       └── wake_bugyo.yml          # Issue検知→Codespace起動
│
├── .devcontainer/
│   ├── devcontainer.json           # Codespace設定
│   ├── bugyo-daemon.sh             # 奉行メインループ
│   └── install-deps.sh             # 依存関係インストール
│
├── agent/
│   ├── maid_worker.py              # メイド実行プログラム
│   ├── github_helper.py            # GitHub API操作
│   ├── ai_client.py                # Claude/OpenAI API
│   └── utils.py                    # 共通ユーティリティ
│
├── docs/
│   ├── META.md                     # プロジェクト全体像
│   ├── ARCHITECTURE.md             # このドキュメント
│   ├── METRICS.md                  # メトリクス定義
│   ├── TARGET_AUDIENCE.md          # ターゲット顧客
│   ├── WORKFLOW.md                 # 運用フロー
│   └── BUGYO_LOG.md                # 奉行活動ログ
│
├── src/                            # 実際のプロジェクトコード
│   └── (プロジェクト本体)
│
└── README.md
```

## 各コンポーネントの役割

### 1. GitHub Actions（起動トリガー）

**ファイル**: `.github/workflows/wake_bugyo.yml`

```yaml
name: Wake Up Bugyo
on:
  issues:
    types: [opened, labeled]
  schedule:
    - cron: '*/30 * * * *'  # 30分ごとに定期チェック

jobs:
  wake:
    runs-on: ubuntu-latest
    steps:
      - name: Start Codespace
        env:
          GH_TOKEN: ${{ secrets.GH_PAT }}
        run: |
          gh codespace start -c bugyo-yashiki
```

**役割**:
- 新規Issue検知（`待機中`ラベル）
- Codespace自動起動
- 定期的な生存確認

### 2. 奉行デーモン（タスク管理者）

**ファイル**: `.devcontainer/bugyo-daemon.sh`

**動作フロー**:
```bash
while true; do
  # 1. gh issue list で「待機中」Issue取得
  # 2. 各Issueにtmuxセッション割り当て
  # 3. メイドプロセス起動
  # 4. 完了したセッションのクリーンアップ
  # 5. 30秒sleep
done
```

**役割**:
- Issueキュー監視
- メイドセッションの起動・管理
- ステータス更新（待機中→作業中→完了）
- 全タスク完了時の自動シャットダウン

### 3. メイドワーカー（実作業者）

**ファイル**: `agent/maid_worker.py`

**処理フロー**:
```python
1. Issue内容解析
2. AI APIでコード生成（Claude/OpenAI）
3. ブランチ作成
4. コミット・プッシュ
5. PR作成
6. Issue完了報告
```

**入力**: `--issue=42`  
**出力**: PR作成 + Issueコメント

### 4. devcontainer設定

**ファイル**: `.devcontainer/devcontainer.json`

```json
{
  "name": "Solo XP Bugyo Yashiki",
  "image": "mcr.microsoft.com/devcontainers/python:3.11",
  "postStartCommand": "tmux new-session -d -s bugyo 'bash .devcontainer/bugyo-daemon.sh'",
  "customizations": {
    "codespaces": {
      "openFiles": ["docs/BUGYO_LOG.md"]
    }
  },
  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": {}
  }
}
```

**役割**: Codespace起動時に奉行を自動起動

## 管理インターフェースの使い分け

### 1. Web版Claude Code（最軽量）
```
使用状況: カフェでスマホのみ
操作: チャット感覚で指示
例: 「ログイン機能のバグ直して」
→ Claude Codeが勝手にIssue作成
→ 奉行が拾って処理

メリット: 本当に「話すだけ」
デメリット: 詳細な確認は難しい
```

### 2. Android Termux + gh CLI（標準）
```
使用状況: 通常のモニタリング
操作: CLI経由で確認
例: 
$ gh issue list
$ gh pr view 42
$ gh pr review 42 --approve

メリット: 軽量で詳細も見れる
デメリット: CLI操作は必要
```

### 3. Android Claude Code（詳細確認）
```
使用状況: デバッグや詳細確認
操作: Codespaceに直接接続
例:
- ファイル直接確認
- tmuxセッション監視
- 手動修正

メリット: 完全コントロール
デメリット: 起動に時間かかる
```

### 4. 直接コーディング（緊急時）
```
使用状況: CPUタイム枯渇時
操作: Termuxで直接git操作
例:
$ git checkout -b hotfix
$ vim src/main.py
$ git push

メリット: コスト無視
デメリット: 手動作業
```

## 通常ワークフロー

```bash
# 1. カフェでIssue作成（15秒）
gh issue create \
  --title "ログイン機能にエラーハンドリング追加" \
  --label "待機中" \
  --body "現在のログイン処理では例外が握りつぶされています..."

# 2. （自動）GitHub ActionsがCodespaceを起動

# 3. （自動）奉行がメイドを配置
#    → tmux session "maid-issue-42" 起動
#    → Python agent/maid_worker.py --issue=42

# 4. （自動）メイドが作業
#    → Claude APIでコード生成
#    → ブランチ作成、コミット
#    → PR作成

# 5. （通知）Issue #42 にコメント
#    「✅ PR #100 を作成しました」

# 6. Noraが確認・承認（10秒）
gh pr review 100 --approve
gh pr merge 100

# 7. （自動）全タスク完了でCodespace停止
```

## 設計の要点

### 1. tmuxの役割変化
- ❌ 従来: 人間がSSH接続時のセッション永続化
- ✅ Solo XP: エージェントの並行実行管理ツール

### 2. 単一Codespace + 複数エージェント
- 複数Codespace起動は可能だがコスト高
- 1つのCodespace内でtmuxによる並行処理
- 各タスクが独立プロセスで隔離

### 3. フォールバック戦略
- 各レイヤーで代替手段を確保
- CPUタイム枯渇時も継続可能
- 人間が完全にブロックされない設計

## 次のステップ

### Phase 1: 最小MVP
- [ ] bugyo-daemon.sh（基本ループ）
- [ ] maid_worker.py（echo動作確認）
- [ ] 1 Issue → 1 コメント

### Phase 2: 実用化
- [ ] Claude API連携
- [ ] PR自動作成
- [ ] tmux並行処理

### Phase 3: 最適化
- [ ] メトリクス計測
- [ ] コスト最適化
- [ ] エラーハンドリング

---

**更新日**: 2025-02-07  
**ステータス**: 設計完了・実装待ち
