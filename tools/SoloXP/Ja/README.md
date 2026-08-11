# SoloXP

**AIコーディングエージェント時代に、個人がきちんとしたプロセスに従ってソフトウェア開発を進めるための仕組み。**
最近の言葉で言うなら「ハーネスエンジニアリング」の一例にあたる。

GitHub（または類似のgit環境ツール）を基盤に、Issueドリブンで開発を進める。

> ⚠️ 使い始める前に、[`CLAUDE.md.template`](./CLAUDE.md.template) を自分のリポジトリの `CLAUDE.md` にコピーしてください。
> SoloXPの各スキルは、そこに定義されるブランチ運用・PR発行の前提・TDD原則・作業時間記録フォーマットを前提に動作します。

---

## クイックスタート

最短ルートは次の5ステップ（0番の詳細は [インストールマニュアル](./docs/manual/install.md)・
[セットアップマニュアル](./docs/manual/setup.md) 参照）:

0. （初回のみ）SoloXPのスキルを `.claude/skills/` 等に登録し、`CLAUDE.md.template` を自分の
   `CLAUDE.md` にコピーする
1. GitHub Issueを起票する（例: `gh issue create --title "[Task] ..." --body "..."`)
2. Claude Codeで `/xp_Director <issue番号>` を実行する
3. xp_Tester → xp_Implementer → xp_Auditor（テスト）→ xp_Documenter → xp_Auditor（ドキュメント）
   が自動で回り、ドキュメント監査までグリーンになった時点でPRが発行される
4. PRを確認してマージする（`gh pr merge <PR番号> --squash --delete-branch`）

### 実行例

`/xp_Director` 実行中、Issueには進捗コメントが自動で積まれていく（抜粋）:

```
[Tester完了] tests/unit/dateFormat.test.js を追加（4ケース）
[Implementer完了] lib/dateFormat.js を実装、既存呼び出し箇所を置き換え
[Auditor GREEN] 全4ケース pass。既存テストも回帰なし。実装がテストの意図を満たしていることを確認。
[Documenter完了] docs/spec/dateFormat.md, docs/reference/dateFormat.md を更新
[Auditor doc OK]
[PR発行済み #102]
```

Issue本文の書き方からPRマージまでの完全な実例は [使い方チュートリアル](./docs/manual/tutorial.md) を参照。

---

## 対応プラットフォーム

原理的には Claude Code・Codex 等、複数のAIコーディングエージェントプラットフォームで動くことを
目指している。ただし作者は主に Claude Code（それも Web版）をメインに使って開発・検証しており、
その他のプラットフォームでの動作については確実に動くとは言い切れない。**No Warranty**。

これは Claude Code についても本質的には同じ（無保証）だが、作者自身が日常的に検証している分、
相対的な信頼度には差がある、という程度の話。

---

## 特徴

### 1. Issueドリブン・デルタアプローチ

GitHub Issue を開発の起点に据え、Issueという「差分（デルタ）」を積み重ねながら完成品に近づけていく。
1タスク1PRを基本ルールとし、各Issueが独立して検証可能な単位になるよう設計している。

### 2. XPを基にしたAIエージェント協働ワークフロー

アジャイルプロセスの代表であり先駆的アプローチでもある XP（Extreme Programming）を土台に、
AIエージェントと安定的に協働するためのワークフロー定義（Architect / Tester / Implementer / Auditor
等の役割分担、差し戻し制御、ドキュメント同時更新など）を追加している。単発の指示応答ではなく、
繰り返し安定して開発が進むことを狙って設計した仕組み。

### 3. TDD中心 — バイブコーディングより重量級

TDDを開発の中心に据えているため、少しずつ着実にシステムが積み上がっていく。裏を返せば、
バイブコーディングのように「手早く結果が出る」方法論と比べるとかなり重い手法になる。

**バイブコーディングで「良し悪しの判断が難しくなってきた」と感じている人には、SoloXPが向いている
可能性が高い。** テストという明示的な合格基準を挟むことで、AIの出力を人間が逐一判断しなくても
品質を担保できるようにしている。

### 4. Human-on-the-Loopな運用スタイル

Issue起票で開発をスタートし、PRマージのタイミングで人間が関与する、というのが基本スタイル。
これは Human-in-the-Loop（逐一介入）と Human-off-the-Loop（完全自律）の中間、
**Human-on-the-Loop**（人間はループの外から監視・要所だけ介入）に位置する設計になっている。

Issue選定や PRマージ判断に別のエージェントを組み合わせれば、そのまま自然に
Human-off-the-Loopまで拡張していける余地を持たせているのもポイント。

---

## こんな人に向いている

- バイブコーディングで「これで合っているのか」の判断に疲れてきた人
- AIエージェントに開発を任せつつも、テストという明示的な品質基準を残しておきたい人
- スマホ・カフェ等、まとまった作業時間を確保しにくい環境からIssue単位で開発を進めたい人
- GitHub（Issue/PRベース）での開発フローに慣れている、または慣れたい人

---

## ドキュメント

### はじめての人向け

- [SoloXPはなぜブランチをこう使うのか（超入門）](./docs/manual/branch-concept.md) — Git用語
  ほぼ無しで「作業机・作業場・完成品」の比喩から仕組みを理解する
- [ソロXPの実運用ループ](./docs/manual/actual-loop.md) — Issue起票→コード化→PR→評価→次のIssue
  という、コード化フェーズの外側にある実際の運用ループ全体像
- [インストールマニュアル](./docs/manual/install.md)
- [セットアップマニュアル](./docs/manual/setup.md)
- [使い方チュートリアル](./docs/manual/tutorial.md)
- [Claude Code Web 環境での運用ノウハウ](./docs/manual/claude-code-web.md)
- [`CLAUDE.md.template`](./CLAUDE.md.template) — 自分のリポジトリの `CLAUDE.md` に必要な設定一式

### 運用・仕様

- [WORKFLOW.md](./WORKFLOW.md) — 詳細な運用ワークフロー・スキル一覧
- [ブランチ・PRマージ戦略についてのメモ](./docs/manual/branch-strategy.md) — Git用語前提。
  ブランチ命名・ベースブランチ・マージコンフリクトが起きやすい理由・Claude Code Webとの挙動差
- [docs/spec/](./docs/spec/) — 各スキルの機能仕様書インデックス

### 過去の設計資料

- [docs/history/memo/](./docs/history/memo/) — 初期設計フェーズの検討資料・ADR（現在の実装とは
  乖離しているため、運用ドキュメントとしては参照しないこと）

---

## 質問・サポート

Issue以外での質問・相談は note メンバーシップで受け付け予定です（詳細は近日公開）。
[note.com/noragrammer](https://note.com/noragrammer)

---

## ライセンス

[MIT License](./LICENSE)。上記「対応プラットフォーム」の通り No Warranty（無保証）です。自己責任で利用してください。
