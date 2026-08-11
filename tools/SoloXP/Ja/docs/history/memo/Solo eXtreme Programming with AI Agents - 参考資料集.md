了解です。Android(Termux)での動作可能性含めて、参考資料的にまとめます。

---

# Solo eXtreme Programming with AI Agents - 参考資料集

## プロジェクト構想の概要
個人開発者がXPワークフローを基盤に、GitHub、フラットファイル型イシュートラッカー、AIエージェント群を統合したプロジェクト管理環境を構築する。タイムスパン(週次/月次スプリント)の可視化とモバイル環境(Android/Termux)での運用を重視。

---

## 技術要素の候補

### 1. Beans - フラットファイル型イシュートラッカー

**リポジトリ**: https://github.com/hmans/beans

**特徴**:
- Go製シングルバイナリ → クロスプラットフォーム対応
- `.beans/`ディレクトリにMarkdown形式で保存
- Git管理可能、人間とAI両方が読み書き
- GraphQLクエリエンジン搭載(トークン効率的)
- TUI(ターミナルUI)内蔵
- Claude Code公式プラグイン対応

**コマンド例**:
```bash
beans init                    # 初期化
beans prime                   # エージェント用プロンプト生成
beans graphql '{beans{id}}'   # GraphQL問い合わせ
beans tui                     # TUI起動
```

**Android/Termux対応**:
- Go製 → ARM対応バイナリあり(要確認: `go install`でTermuxビルド可能)
- ファイルベース → Git操作がそのまま使える
- 検証必要事項: TUIのレンダリング、GraphQLサーバー起動

**統合アプローチ**:
- エージェントは`beans prime`の指示をCLAUDE.md等に追加
- 人間は`beans tui`で俯瞰、またはVS CodeでMarkdown直接編集
- GitHub Issuesとの同期: 週次スクリプトでbean → Issue生成

---

### 2. XPPlanner的インターフェース候補

**求める機能**:
- ストーリーカード管理
- イテレーション計画(1-2週スプリント)
- ベロシティトラッキング
- タイムライン可視化

**選択肢A: 既製品**
- **Taiga**: オープンソース、アジャイル特化、セルフホスト可能
  - 問題: Webアプリ = サーバー運用コスト、モバイル最適化不十分
- **Leantime**: 軽量、PHP製
  - 問題: 同上、個人には重い可能性
- **Linear/Height**: スタートアップ向け
  - 問題: 個人にオーバースペック、プライバシー懸念

**選択肢B: 静的サイト生成 + GitHub Pages**
```
Beansデータ(.beans/*.md)
  ↓ スクリプト(Python/GAS/Go)
Hugoテンプレート / Eleventyテンプレート
  ↓
タイムライン付きHTMLダッシュボード
  ↓ GitHub Pages
モバイルブラウザで閲覧
```
- メリット: サーバーレス、Git連動、カスタマイズ自由
- デメリット: 初期構築コスト、インタラクティブ性低い

**選択肢C: TUI拡張**
- Goで`beans`のTUIを拡張してタイムラインビュー追加
- Termuxで直接動作
- メリット: 統合性高い、モバイル最適
- デメリット: Go開発スキル要、グラフィカル表現限界

**選択肢D: Obsidian Dataviewプラグイン**
- Beansのmarkdownを`Obsidian vault`にシンボリックリンク
- Dataviewクエリでタイムライン生成
```dataview
TABLE status, priority, created
FROM ".beans"
WHERE type = "feature"
SORT created DESC
```
- メリット: Noraさんの既存ワークフロー活用、モバイルObsidian対応
- デメリット: Obsidian依存、GraphQL使わない

---

### 3. GitHub × XP × Beans の同期設計

**XP要素のマッピング**:
| XP概念 | GitHub | Beans | 同期タイミング |
|--------|--------|-------|----------------|
| イテレーション | Milestone (Week1, Week2...) | bean metadata `iteration: week1` | 日曜夜ハンドオフ |
| ユーザーストーリー | Issue | bean (type: feature) | 手動作成 or AIが自動生成 |
| タスク | Issue (子タスク) | bean (parent_id付き) | 随時 |
| 完了ストーリー | Closed Issue | archived bean | 週次クローズ時 |
| ベロシティ | Milestone統計 | GraphQL集計 | 週次レポート生成時 |

**同期スクリプト案**(Python/GAS):
```python
# 日曜夜実行
def weekly_sync():
    # 1. 今週のbeans状態を集計
    beans = run_graphql_query("{ beans(status: done) { id title } }")
    
    # 2. GitHub Milestone完了
    milestone = github.get_milestone("Week N")
    milestone.close()
    
    # 3. 来週Milestone作成
    next_week = github.create_milestone("Week N+1", due_date="+7days")
    
    # 4. 未完了beansを次週に移行
    for bean in beans_incomplete:
        github.create_issue(title=bean.title, milestone=next_week)
    
    # 5. 週次レポート生成(Markdown)
    generate_report(beans, milestone)
```

**プロジェクト横断集計**:
- Label活用: `project:novel`, `project:blog`, `project:tool`
- GraphQL: `beans(labels: ["project:novel"]) { ... }`
- ダッシュボード: 各プロジェクトの進捗を並列表示

---

### 4. エージェント会話システム

**Beans vs Gas Town vs 自作**

**Beans**:
- タスク管理に特化、会話システムなし
- エージェントは`beans prime`経由で指示を受け取る
- 会話ログは別途管理(Slack/Discord/ファイル)

**Gas Town** (https://github.com/steveyegge/gastown):
- マルチエージェント調整に特化
- Git worktree + メールシステムでエージェント間通信
- 用語: rig(プロジェクト), convoy(タスクバンドル), bead(イシュー)
- Claude Code / Codex対応
- Android対応: 不明(調査必要)

**自作の場合**:
- Noraさんの「AI mercenary team」思想に最適化
- 構成案:
```
agents/
  claude.md     # Claude用コンテキスト
  gemini.md     # Gemini用コンテキスト
  deepseek.md   # DeepSeek用コンテキスト
shared/
  META.md       # プロジェクト全体情報
  TODO.md       # 共通タスクリスト
logs/
  2025-02-01-session.md  # 会話ログ
```
- 各エージェントは`shared/`を読んで状態同期
- ログはGit管理、後から振り返り可能

**推奨構成**: Beans(タスク管理) + 自作ログシステム(会話履歴)
- 理由: Beansは軽量で拡張しやすい、Gas Townは複雑すぎる可能性

---

### 5. タイムスパン可視化の具体案

**週次ビュー**:
```
Week 1 (2025-02-03 ~ 02-09) [████████░░] 80%
  novel:     ████████░░ 3/4 beans done
  blog:      ██████████ 2/2 beans done
  tool:      ████░░░░░░ 1/3 beans done

Week 2 (2025-02-10 ~ 02-16) [██░░░░░░░░] 20%
  novel:     ░░░░░░░░░░ 0/2 beans planned
  blog:      ██████████ 1/1 beans done
```

**実装方法**:
- **Option 1**: GitHub Actions + Mermaid Gantt生成
```yaml
# .github/workflows/weekly-report.yml
on:
  schedule:
    - cron: '0 15 * * 0'  # 日曜夜JST
jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - run: beans graphql '{...}' | python generate_gantt.py
      - commit: weekly-report.md
```

- **Option 2**: Termux cronジョブ + markdownテーブル生成
```bash
# termux crontab
0 21 * * 0 cd ~/projects && beans-weekly-report.py
```

- **Option 3**: Obsidian Dataview動的生成
```dataview
TABLE WITHOUT ID
  file.name as "Bean",
  status,
  iteration
WHERE iteration = "week1"
GROUP BY project
```

---

### 6. Android/Termux環境での実践構成

**前提**:
- Termux + Git + Python/Go環境
- Obsidian (Android) でMarkdown編集
- Google Drive同期(GAS経由)

**ディレクトリ構成案**:
```
~/projects/myproject/
  .git/
  .beans/
    inbox/
    active/
    archive/
  .github/
    workflows/
      weekly-sync.yml
  agents/
    CLAUDE.md
  docs/
    weekly-reports/
      2025-W05.md
  README.md
```

**ワークフロー**:
1. カフェで作業 → Termux起動
2. `beans tui`でタスク確認
3. Claudeに指示 → beansが自動更新
4. Git commit/push
5. 帰宅後 → Obsidian (Android)で振り返り編集
6. 日曜夜 → 週次スクリプト実行 → GitHub同期

**Beans on Termux検証項目**:
- [ ] `go install github.com/hmans/beans@latest`がビルド通るか
- [ ] TUIが正常レンダリングするか(termux-api依存確認)
- [ ] GraphQLサーバーがlocalhost起動するか

---

### 7. 参考リンク集

**Beans関連**:
- リポジトリ: https://github.com/hmans/beans
- Claude Codeプラグイン: `/plugin install beans-prime`

**Gas Town (参考)**:
- リポジトリ: https://github.com/steveyegge/gastown
- マルチエージェント調整の思想

**XP参考**:
- XPPlanner (オリジナル): http://www.xpplanner.org/ (アーカイブ)
- イテレーション計画の原則: https://www.extremeprogramming.org/

**静的サイト生成**:
- Hugo: https://gohugo.io/
- Eleventy: https://www.11ty.dev/

**Obsidian Dataview**:
- プラグイン: https://blacksmithgu.github.io/obsidian-dataview/

**GitHub API**:
- Milestones: https://docs.github.com/en/rest/issues/milestones
- Issues: https://docs.github.com/en/rest/issues/issues

---

## Next Steps (アイディア段階)

1. **検証フェーズ**:
   - [ ] Termuxで`beans`ビルド・動作確認
   - [ ] サンプルプロジェクトで`.beans/`運用テスト
   - [ ] 週次同期スクリプトのプロトタイプ作成

2. **設計フェーズ**:
   - [ ] XP × Beans × GitHubの詳細マッピング
   - [ ] タイムライン可視化の手法決定
   - [ ] エージェント会話ログの設計

3. **実装フェーズ**:
   - [ ] 週次ハンドオフスクリプト
   - [ ] ダッシュボード生成ツール
   - [ ] Obsidian統合テンプレート

---

**冗談タイトル**: "SoloXP" = セックスプログラミング = 一人で気持ちよくコード書く究極のワークフロー 🚀

(以上、参考資料としてのぐちゃぐちゃまとめでした)