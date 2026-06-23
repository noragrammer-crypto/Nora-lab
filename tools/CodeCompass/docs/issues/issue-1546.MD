---
issue: 1546
title: "[CodeCompass] ホットスポット検出→Issue自動起票スキル（しきい値ベース、処方箋はxp_Architectに委譲）"
state: closed
labels: [enhancement, PriorityHigh, epic/CodeCompass]
author: noragrammer-crypto
created_at: 2026-06-20T07:30:01Z
epic: CodeCompass
---

# #1546 [CodeCompass] ホットスポット検出→Issue自動起票スキル（しきい値ベース、処方箋はxp_Architectに委譲）

## 本文

## 背景

PR #1544 / #1545 で「PRのCodeCompassホットスポットコメントだけを根拠に、リファクタリング方向性を出せるか」という実験を行った。結論:

- **可視化（どのファイルが危険か）はコメントの数値だけで十分出せる**。具体的には `changes` 列を同テーブル内の他ファイルと比較するだけで、外れ値（god file疑い）を検出できる。
  - 実例: `modal/app.py` は changes=41、他の上位ファイルは最大10。4倍以上の外れ値。
- **処方箋（具体的に何をどう直すか）はコメントだけでは出せない**。ソースを開いて構造を見る必要がある。
- 処方箋を書くコスト自体は安い（既存のレビュースキル・xp_Architectで足りる）。本当に欠けているのは「どのファイルを見るべきか」を自動で拾って次のアクションに繋げる導線。
- 現状、CodeCompassのCI結果はPRコメントとして1回ポストされるだけで、読まれなければそこで終わる。検出から次アクション（Issue化）への自動導線がない。

## やること

「しきい値超え・トップ1件のみ」を対象にした軽量なIssue自動発行スキルを作る。**処方箋は出さない**。「このファイルは構造的リファクタリングが必要」という指摘とその根拠（changes外れ値・hotspotScore等）をIssue本文にまとめ、設計判断はxp_Architectなど既存スキルに委譲する。

### スコープ

1. 対象ブランチ（main、または指定ブランチ）の最新PRのCodeCompassホットスポットコメント（または `codecompass/hotspots.json`）を読む
2. トップ1件の `hotspotScore` がしきい値（初期値: **1**）を超えているか判定
   - 根拠: 今回の実測で唯一の構造的ホットスポット（`modal/app.py`, score 2.05〜2.18）が1を超え、2位以下（0.63以下）は1未満。しきい値1で実害のあるファイルのみを拾える
3. 超えていれば、対象ファイル名・スコア・根拠（changesの外れ値比較等）を含むIssueを起票する
   - Issueには処方箋を書かない。「構造的リファクタリングの検討が必要」という指摘 + 根拠データのみ
   - 既に同ファイルに対するオープンなIssueがあれば重複起票しない
4. 超えていなければ何もしない（無風時にノイズを出さない）

### スコープ外（今回やらない）

- 処方箋の自動生成（xp_Architect側の責務）
- 複数ファイルの並行Issue化（まずトップ1件のみで様子を見る）
- しきい値の自動チューニング（固定値1から開始し、運用しながら調整）

## 関連

- 実験元PR: #1544, #1545
- データ品質の前提課題: #1541（シャロークローン問題。本Issueの自動起票はCI（フルクローン）側の数値を使う前提なので直接の影響は受けにくいが、念頭に置く）
- 親エピック: #727

## コメント

### noragrammer-crypto — 2026-06-20T07:44:50Z

作業開始 2026-06-20 07:44
[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-06-20T07:44:50Z

[親ブランチ作成済み] feature/issue-1546

xp_Architect によりサブイシュー3件を発行・リンクしました:
- #1547 [Task] E2Eテストスイート作成
- #1548 [Task] PRホットスポットコメント検出→閾値判定→重複チェック付きIssue自動起票エンジン実装
- #1549 [Task] 機能仕様書更新（depends_on: #1548）

既存の `lib/codecompass-to-issues.js`（actions.md由来・複数件起票）とは責務分離した別実装として設計しています。

次回のセッションで /xp_Director 1547 を実行してください。

---

### noragrammer-crypto — 2026-06-20T09:03:39Z

[親ブランチ PR 発行済み] #1553

feature/issue-1546 → main
Story-level受け入れテスト: CodeCompass全244件 GREEN（hotspot-alert関連40件含む）
ドキュメントチェック: docs/spec/hotspot-alert.md 作成済み・README索引済み

作業完了 2026-06-20 09:xx / 所要時間: 約45分（07:44 着手 〜 PR発行）
[ProjectStatus: Done]

---

### noragrammer-crypto — 2026-06-20T09:03:55Z

（時刻修正）作業完了 2026-06-20 09:03 / 所要時間: 約79分（07:44 着手 〜 PR #1553 発行）

---
