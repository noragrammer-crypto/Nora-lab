---
title: "AIと一緒に個人開発してるノラです（自己紹介＆近況まとめ）"
emoji: "🧭"
type: "idea"
topics: ["claudecode", "個人開発", "AIエージェント", "自己紹介"]
published: false
---

## はじめに

はじめまして、ノラです。
Claude Code を相棒に、個人開発のモノレポをひたすら育てています。今回は自己紹介を兼ねて、今何をやっているか・何を作っているかをまとめてみます。

最初に手に取ってもらいたいリポジトリはこちらです。

https://github.com/noragrammer-crypto/Nora-lab

実験的に作ったツールやZenn記事のソースをまとめている「実験室」リポジトリです。

![Nora-lab リポジトリ](/images/nora-lab-repo.png)

## 何をやっているか

メインでやっているのは、**Claude Code を使った個人開発の自動化**です。

- 自分用のSNS/Discord連携ツールづくり
- Solo開発でもチーム開発のプロセス（TDD・レビュー・監査）を回せるよう、Claude Codeにレールを敷く「Solo XP」というワークフローの構築
- 小説「落ちこぼれ人形使い」の執筆をAIと一緒に進める仕組みづくり
- 開発しながら見つけた小ネタツールをNora-labに切り出して公開

「AIに全部やらせる」ではなく、「AIが迷わず動けるように文脈と構造を渡す」ことに比重を置いています。Issue・PR・ブランチ運用・テストといった普通の開発プロセスをAIにそのまま乗せる、という方向性です。

## ツール紹介: Claude週制限トラッカー

その中のひとつ、Claude Codeの週次利用上限を見える化するツールです。

https://noragrammer-crypto.github.io/Nora-lab/tools/ClaudeWeekMeator/

現在の使用率とリセット曆日・時刻を入力すると、残り日数から「今日使える枠」を逆算してくれます。「今週どこまで攻めて良いか」を毎回頭の中で計算するのが地味に面倒だったので作りました。

![Claude週制限トラッカー](/images/claude-week-meator.png)

JP/EN切り替え対応で、ブラウザだけで動く単純なツールです。

## カミングソウン: CodeCompass

そして今ちょうど準備中なのが **CodeCompass**（コードコンパス）です。

> CodeScene Lite ／ 個人開発者・小さなチーム向けのCodeScene ／ 蒸留エンジン as SKILL.md

ひとことで言うと、「変更頻度 × 複雑度」でリポジトリのホットスポット（触ると危ないファイル）を自動検出して、そのままAIにリファクタリング提案まで出させるツールです。CodeSceneという有償の企業向けツールの核心ロジックを、個人開発者でも使える軽量実装に落とし込んでいます。

```
git log --numstat（変更頻度） × AST複雑度 ÷ LOC = ホットスポットスコア
```

直近では GitHub Actions と連携させて、PR作成時に自動でホットスポットTop10をコメント投稿するところまで動かしました。実際にPRに投稿された出力例がこちらです。

```md
## CodeCompass Hotspots (Top 10)

| file | hotspotScore | complexity | changes | loc | linesChanged |
|------|-------------|-----------|---------|-----|-------------|
| modal/app.py | 2.0764 | 23 | 39 | 432 | 1012 |
| SoloXP/tests/e2e/issue-743-feature-dev-plugin.test.js | 0.6316 | 6 | 10 | 95 | 805 |
| 4SceneComic2ShortMovie/lib/pipeline.js | 0.5714 | 4 | 10 | 70 | 73 |
| SocialMediaAgent/__tests__/collect-x-posts.unit.test.js | 0.3881 | 17 | 5 | 219 | 527 |
| SoloXP/tests/e2e/issue-746-xp-reviewer-workflow.test.js | 0.3535 | 5 | 7 | 99 | 963 |
```

「コードレビューを人間がやる時代は終わりつつあるけど、アーキテクチャ判断にはコードの外側の文脈（変更頻度・依存関係）が必要で、それはAIがまだ自力で持てない。だから必要な情報だけ蒸留して渡す」というのがコンセプトです。

このあたりの詳しい解説記事も近々書く予定です。

## フォローお願いします

個人開発の進捗やツールは主にこのZennとNora-labで発信していきます。よかったらフォロー・スターしていただけると嬉しいです。

https://github.com/noragrammer-crypto/Nora-lab

それでは、次の記事で！
