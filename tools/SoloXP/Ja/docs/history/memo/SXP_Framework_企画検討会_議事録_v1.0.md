# 議事録：SXP (Solo eXtreme Programming) Framework 企画検討会

**日時**: 2026年2月5日  
**参加者**: Nora、Claude  
**議題**: マルチAIエージェント開発フレームワークの基本設計  
**バージョン**: v1.0

---

## 1. 背景・参考資料

以下の技術動向・既存事例を踏まえて検討：

- **CCPM** (Claude Code PM): GitHub Issues × worktree並列処理
  - https://github.com/automazeio/ccpm
  - https://note.com/engineers_hub/n/nebaf22b92be7
  
- **multi-agent-shogun**: tmux階層型エージェント、イベント駆動
  - v1.2で参謀・奉行分離（家老過労死からの進化）
  - https://github.com/yohey-w/multi-agent-shogun
  
- **Beans**: フラットファイル型イシュートラッカー、Markdown+YAML
  - https://github.com/hmans/beans
  
- **Gas Town**: マルチエージェント調整システム
  - https://github.com/steveyegge/gastown

---

## 2. コアコンセプト

### 外部仕様：XPフレームワーク（真面目）
```
- ストーリーカード管理
- 週次イテレーション
- ベロシティトラッキング
- GitHub Issues/Milestones連携
- タイムスパン可視化
```
→ 外から見ると普通のアジャイル開発

### 内部実装：Maid Squad Architecture（楽しい）
```
セバスチャン（Head Maid）
    ↓
参謀メイド（Planner） / 奉行メイド（Manager）
    ↓
実行メイド×3（Alice/Belle/Claire）
```
→ 裏ではメイド隊が動いてる（口調フレーバーのみ、ゲーム要素なし）

**合言葉**: 「表は真面目、裏は楽しい」

---

## 3. 技術構成案

### 3.1. デバイス構成

**自宅サーバー + モバイルクライアント構成**:

- **タブレット（Android）**: 自宅常駐サーバー
  - 自宅WiFi接続、AC電源常時接続
  - tmux 24時間稼働
  - 5エージェント実行環境
  - Termux:Boot で自動起動
  - メンテナンスは帰宅後にゆっくり

- **スマホ（Android）**: 外出先クライアント
  - Tailscale VPN経由で自宅タブレットに接続
  - SSH + tmux attach（またはGitHub Issue経由）
  - 指示出し・結果確認のみ
  - Obsidianで振り返り編集
  - 荷物最小化（バイク移動最適）

**接続方式**:
```bash
# スマホから（カフェ、バイク停車中など）
farm  # エイリアス設定で1コマンド
# → 自動的に ssh + tmux attach
```

**利点**:
- ✅ 電源・通信の安定性（自宅環境）
- ✅ スマホだけ持ち歩けばOK（軽量）
- ✅ バイク移動中もタブレットは稼働継続
- ✅ タブレット紛失リスクゼロ
- ✅ 発熱・バッテリー心配なし
- ✅ カフェWiFiの品質に依存しない（Tailscale経由）

### 3.2. モバイル環境最適化

**tmux画面構成**:
- **表画面（main）**: Noraさんが対話する唯一の画面
- **裏画面（workers）**: 2-3行だけ表示、基本見ない
- tmux detach/attachでカフェ間移動対応
- ログはObsidianで後から確認

### 3.3. エージェント構成（5名体制）

| 役割 | 名前 | 担当 | トークン消費 |
|------|------|------|-------------|
| Head Maid | セバスチャン | 判断・承認・外部対応 | 低 |
| Planner | 参謀メイド | タスク分解・戦略立案 | 中 |
| Manager | 奉行メイド | 進捗管理・調整・報告 | 中 |
| Worker 1 | Alice | 文章系（小説・ドキュメント） | 高 |
| Worker 2 | Belle | 技術系（コード・調査） | 高 |
| Worker 3 | Claire | データ系（整理・集計） | 中 |

**役割定義のポイント**:
- 参謀と奉行の分離（Shogun v1.2の教訓）
- 単一責任の原則
- コンパクション対策：各エージェントに復帰手順記載

**トークン効率化**:
- 3層コンテキスト（Memory/Global/Project）
- YAMLベース通信
- イベント駆動（待機中API消費ゼロ）

### 3.4. 週次ハンドオフ連携

```
日曜夜21:00自動実行
├─ .beans/ 集計
├─ GitHub Milestone更新
├─ 週次レポート生成
├─ ベロシティ計算
└─ Obsidianで確認用ファイル作成
```

既存の食事ログ・選択リスト管理と統合

### 3.5. 操作方法（複数選択肢）

**方式A: 直接対話型（SSH + tmux）**
```bash
# スマホから接続
farm
# → tmux attach

> 小説第3章書いて
[セバスチャン] かしこまりました
```

- メリット: レスポンス早い、対話的、細かい指示
- デメリット: 接続操作必要
- 向いてる: 試行錯誤、デバッグ、相談ベース

**方式B: 非同期型（GitHub Issue駆動）**
```
スマホブラウザでGitHub Issue作成
  ↓
自宅タブレットがWebhook/Polling検知
  ↓
Maid Squad自動実行
  ↓
完了時にIssue更新（コメント・ファイル添付）
```

- メリット: 投げっぱなしOK、履歴明確、どこからでも
- デメリット: レスポンス遅延、対話しにくい
- 向いてる: 明確なタスク、長時間作業、放置系

**Issue作成補助**:
- ChatGPT/Claudeでドラフト作成→コピペ
- Issue Template利用（穴埋め形式）
- メール送信で作成

**方式C: ハイブリッド**
- Issue作成で開始 → 進捗気になったらSSH接続
- SSH接続で相談 → 結果をIssue化して自動化

**実運用で使いやすい方法を検証予定**

---

## 4. 開発アプローチ

### メタ開発方式

**「SXPフレームワーク自体を、XPで開発する」**

プロジェクト:
- 名称: SXP Framework開発
- 開発手法: XP（手動→段階的自動化）
- 成果物: agents.md、通信プロトコル、スクリプト群、ドキュメント
- 検証: フレームワーク開発自体でフレームワークを回す

### 段階的自動化

**Phase 1: 完全手動（Week 1-2）**
```
Noraさん自身が:
✓ ストーリーカードを書く
✓ タスクに分解する
✓ Claudeに個別指示
✓ 進捗をGitHub Issues に手動更新
✓ 週次集計を手動実施

目的: ワークフローの肌感覚を掴む
```

**Phase 2: 半自動化（Week 3-4）**
```
✓ タスク分解を参謀に任せる（手動承認）
✓ 実行を3名メイドに任せる
✓ 進捗集計スクリプト導入
✗ GitHub同期はまだ手動

目的: エージェントの挙動を観察・調整
```

**Phase 3: ほぼ自動（Week 5-8）**
```
✓ ストーリー作成のみ手動
✓ 分解・配分・実行は自動
✓ GitHub同期も自動
✓ 週次ハンドオフ自動化

目的: トークン消費とベロシティを実測
```

**Phase 4: 完全稼働（Week 9以降）**
```
✓ 全自動（Noraさんは承認のみ）
✓ 小説執筆など他プロジェクトに適用
✓ フレームワークとして公開？

目的: Digital Farmer本領発揮
```

### ベロシティについて

**「まったり遊ぶペース」で進行**
- 無理しない
- 週次使用量（トークン・コスト）を見ながら調整
- 楽しくないと続かない
- ベロシティは参考値、厳密な管理はしない

---

## 5. Phase 0: 技術検証（最優先）

**以下を実機で検証してから本格開発判断**

### 5.1. 必須検証項目

#### 自宅タブレット側
- [ ] Termux環境構築（tmux, Python, Go, Tailscale）
- [ ] tmux 5ウィンドウ起動・安定性確認
- [ ] 24時間連続稼働テスト（週末放置）
- [ ] Termux:Boot 自動起動確認
- [ ] 発熱確認（設置場所・通気性）
- [ ] Go環境: `pkg install golang`
- [ ] Beansビルド: `go install github.com/hmans/beans@latest`
- [ ] `beans tui` レンダリング確認
- [ ] `beans graphql` 動作確認

#### スマホ側
- [ ] Tailscale VPN経由SSH接続
- [ ] tmux attach 動作確認
- [ ] 4G/5G回線での安定性
- [ ] カフェWiFi切り替わり時の挙動
- [ ] レイテンシ許容範囲確認（体感）
- [ ] 操作性確認（画面サイズ、入力方法）

#### YAML通信プロトコル
- [ ] ファイルベース通信のレイテンシ測定
- [ ] tmux send-keys（2回分割）動作確認
- [ ] イベント駆動の安定性

#### Python + Claude API
- [ ] Termuxからの認証
- [ ] 複数プロセス同時実行
- [ ] レート制限の挙動確認
- [ ] トークン消費実測

#### 実運用シミュレーション
- [ ] 朝：自宅で接続→タスク投入→detach
- [ ] 昼：カフェで接続→進捗確認→追加指示
- [ ] 夕：別カフェで接続→結果確認→承認
- [ ] 夜：帰宅後に週次処理確認

### 5.2. オプション検証
- [ ] Obsidian ⇄ Termux同期（シンボリックリンク or Google Drive）
- [ ] GitHub Webhook受信（Tailscale経由）
- [ ] バッテリー消費測定
- [ ] 夏場の発熱対策

### 5.3. 検証完了条件

以下70%以上クリアで本実装GO判断：
- tmux安定稼働（24時間）
- SSH接続レスポンス許容範囲
- Beansビルド成功
- 基本的な通信テスト成功

**致命的問題があれば代替案検討**

---

## 6. 想定リスクと対策

| リスク | 発生確率 | 影響度 | 対策案 |
|--------|---------|--------|--------|
| Beansがビルドできない | 中 | 中 | 事前ビルド済みバイナリ or 自作軽量トラッカー |
| tmux不安定（Android） | 低 | 高 | ウィンドウ数削減、定期再起動スクリプト |
| API消費過多 | 中 | 高 | イベント駆動徹底、エージェント数削減、コスト監視 |
| 自宅停電 | 低 | 中 | Termux:Boot自動復帰、UPS導入検討 |
| Tailscale接続不安定 | 低 | 中 | Pollingバックアップ、リトライロジック |
| タブレット発熱 | 中 | 低 | 設置場所工夫、夏場は処理軽減 |

---

## 7. 成果物イメージ（8週後）

```
sxp-framework/
├─ .beans/
│  ├─ stories/       # 開発したストーリー群
│  ├─ tasks/         # タスク（自動生成）
│  ├─ iterations/    # 8週分のイテレーション記録
│  ├─ metrics/       # ベロシティ、コスト、トークン消費データ
│  └─ comm/          # エージェント間通信（実装済み）
│
├─ agents/
│  ├─ agents.md      # ← 主要成果物：エージェント仕様書
│  ├─ RULES.md       # 禁止事項定義
│  ├─ sebastian.py   # Head Maid実装
│  ├─ planner.py     # 参謀メイド
│  ├─ manager.py     # 奉行メイド
│  └─ maid.py        # 実行メイド
│
├─ scripts/
│  ├─ farm-setup.sh       # tmux起動スクリプト
│  ├─ weekly-handoff.py   # 週次処理自動化
│  ├─ github-sync.py      # GitHub連携
│  └─ usage-tracker.py    # トークン・コスト監視
│
├─ docs/
│  ├─ architecture.md     # システム設計
│  ├─ protocol.md         # 通信プロトコル仕様
│  ├─ tutorial.md         # 使い方ガイド
│  └─ retrospectives/     # 週次振り返り
│
└─ README.md
```

**汎用フレームワークとして他プロジェクトにも適用可能**
- 小説執筆ワークフロー
- note記事自動生成
- 技術調査・ドキュメント作成

---

## 8. コスト・トークン管理

### 8.1. 想定コスト
- Shogun実例: 月$200（Max×20）
- SXP想定: 月$50-100（用途・頻度による）
- イベント駆動でAPI消費最小化

### 8.2. 監視方法
```python
# .beans/metrics/usage.jsonl に記録
{
  "timestamp": "2026-02-05T10:30:00",
  "agent": "alice",
  "tokens": 1500,
  "cost_usd": 0.045,
  "story": "STORY-001"
}
```

### 8.3. 週次レポート
```markdown
## Week N Usage Report
Total Cost: $12.50
Budget: $50/week → 25% 使用 ✓

By Agent:
- Planner: $4.20
- Alice: $5.10
- Belle: $2.30
- Others: $0.90

Cost per Story Point: $2.50/pt
```

---

## 9. Next Actions

### 優先度：最高（今週～来週）

**Phase 0 技術検証** ← まずはここから

1. **環境準備（1日）**
   - [ ] 自宅タブレットにTermux導入
   - [ ] 基本パッケージインストール
   - [ ] Tailscale設定

2. **基本動作確認（2日）**
   - [ ] tmux 5ウィンドウ起動テスト
   - [ ] SSH接続確認
   - [ ] Python + YAML通信テスト

3. **長時間稼働テスト（週末）**
   - [ ] 24時間放置稼働
   - [ ] 発熱・安定性確認
   - [ ] 問題発生時の挙動観察

4. **検証結果まとめ（1日）**
   - [ ] Obsidianにメモ
   - [ ] 致命的問題の有無判断
   - [ ] GO/NOGO判断

### 優先度：高（検証後、GO判断の場合）

**Week 1実装**
- [ ] GitHub Project作成（sxp-framework）
- [ ] Week 1 Milestone設定
- [ ] agents.mdドラフト作成
- [ ] 通信プロトコル仕様書
- [ ] 最小構成プロトタイプ（3名体制）

### 優先度：中（Phase 2以降）
- 5名体制への拡張
- GitHub Issue連携実装
- 週次ハンドオフ自動化
- ベロシティ計測

### 優先度：低（Phase 3以降）
- ダッシュボード可視化
- Obsidian統合強化
- ドキュメント整備
- 他プロジェクトへの適用

---

## 10. 参考リンク

### 技術資料
- CCPM: https://github.com/automazeio/ccpm
- multi-agent-shogun: https://github.com/yohey-w/multi-agent-shogun
- Beans: https://github.com/hmans/beans
- Gas Town: https://github.com/steveyegge/gastown
- note記事: https://note.com/engineers_hub/n/nebaf22b92be7

### 関連手法
- XP (Extreme Programming): https://www.extremeprogramming.org/
- Story Mapping: ユーザーストーリーの可視化手法
- Velocity Tracking: アジャイル開発の生産性指標

### Android開発
- Termux: https://termux.dev/
- Termux:Boot: 自動起動設定
- Tailscale: https://tailscale.com/

---

## 11. 所感

**Claude**: 
- 「フレームワーク自体をXPで開発」は自己言及的で美しい設計
- 自宅タブレット＋スマホ構成で実用性が大幅向上
- 技術的実現可能性は高い（90%）
- Android環境での安定性は検証次第だが、リスクは管理可能
- Noraさんの「まったりペース」が持続可能性の鍵
- 操作方法の選択肢が多く、実運用で最適化できる

**Nora**: 
- 基本方針OK
- ベロシティはゆっくりで、遊び感覚で
- **まずは技術検証から** ← 最重要
- 使える/使えないの判断が先

---

## 12. 次回ミーティング予定

**Phase 0 検証完了後**
- 検証結果レビュー
- GO/NOGO判断
- GOの場合：Week 1実装計画詳細化
- NGの場合：代替案検討

---

**以上**

（バージョン履歴）
- v1.0: 2026-02-05 初版作成
