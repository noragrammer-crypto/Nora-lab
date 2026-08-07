---
title: "個人開発のコードベースに健康診断を：CodeCompassをMVPリリースした話"
emoji: "🩺"
type: "tech"
topics: ["claudecode", "githubactions", "個人開発", "リファクタリング"]
published: true
---

## はじめに

AIにコードを書かせていると、「動く」コードはどんどん増えていく。けれど「動く」と「健全」は別の話だ。気づいたら同じファイルに手を入れ続けていて、複雑度もどんどん上がっていて、でも誰も気づかない――というのは、AIと一緒に個人開発をしていると割とよく起きる現象だと思う。

その「気づかないうちに進行する不健康」を早期に検出するツールとして、**CodeCompass** を作った。今回MVPとしてリリースしたので、コンセプトと使い方を紹介したい。

リポジトリはこちら。

https://github.com/noragrammer-crypto/Nora-lab/tree/main/tools/CodeCompass

## CodeCompassは何をするツールか

一言で言うと、**コードベースの健康診断ツール**だ。

git の変更履歴とAST解析から「変更頻度 × 複雑度」を計算して、リポジトリの中で「触ると危ないファイル（ホットスポット）」を自動検出する。検出結果はGitHub Issueやプルリクエストのコメントとして報告される。

診断はするが、処方箋を書いて終わり、というスタンスだ。「ここを直すとコードベース全体が締まりますよ」という指摘までは出すが、実際に直すかどうかはこちらで判断する。セカンドオピニオンは自分で考える必要がある。

### なぜ作ったか

AIにコードを書かせるスタイルでは、「動くコードを増やす」方向に最適化されやすい。典型的な劣化のパターンはだいたい決まっている。

- 新しい機能の追加がじわじわ遅くなる
- バグがなかなか取れなくなる
- 直したつもりの箇所で別のバグが出る「モグラ叩き」が始まる

この状態になって初めて「リファクタリングが必要だった」と気づくのが典型パターンだ。CodeCompassは、**その手前で教えてくれる**ことを目指している。

イメージとしては健康診断と漢方薬に近い。効いているのかよくわからないけど、続けていると気づいたら良くなっている。そして、やめると怖い。

### 想定ユーザー

- **チャットで指示してコードを直すスタイルの開発者**: 「どこを直すとコードベース全体が良くなるか」というオラクルが欲しい人。レビューツールは多いが、「ここを直せば全体が締まる」という診断をしてくれるツールは意外と少ない。
- **バイブコーディングをしている人**: 動けばOKで進めていると、ある日突然カオスになる。CI/CDに組み込んでおけば、気づかないうちに健康状態を監視できる。

## コンセプト：蒸留して渡せば、AIは判断し始める

CodeCompassの設計思想は、CodeScene（企業向けの高額な静的解析SaaS）の核心ロジック――「変更頻度 × 複雑度でホットスポットを判定する」――を、個人開発者・小チームでも使えるレベルに軽量実装する、というものだ。

コードレビューを人間がやる時代は終わりつつあるが、アーキテクチャ判断には「コードの外側の文脈」（変更頻度・依存関係といった、ファイル単体を見ていてはわからない情報）が必要で、それはAIがまだ自力では持てない。**必要な情報だけを蒸留して渡せば、AIは勝手に設計判断をし始める。**というのが根っこにある仮説だ。

### IPOモデル

| フェーズ | 役割 |
|----------|------|
| Input | `git log --numstat` + AST解析でデータ収集 |
| Process | (変更頻度 × 複雑度) / LOC でホットスポット判定（密度スコア） |
| Output | Markdown / JSON（+ Mermaid依存グラフ）として出力 |

スコア計算式はこれだけだ。

```
(変更頻度 × 複雑度) / LOC = ホットスポットスコア
```

`/ LOC` で割ることで、ただ大きいだけのファイルが過大評価されるのを防いでいる。**触る頻度が高くて、かつ複雑なコード**を最優先のリファクタリング対象として浮かび上がらせる、というのがこのスコアの狙いだ。

### データはコードそのものではなく構造化情報として渡す

検出したホットスポットの情報は、ファイルそのもの（ソースコード本文）ではなく、スコア・複雑度・変更回数・caller/callee数といった構造化JSONとして後段（将来的にはリファクタリング提案エージェント）に渡す設計になっている。コードそのものを渡さないことで、判断のブレを防ぐ狙いがある。

```json
{
  "file": "path/to/file.js",
  "hotspot_score": 0.82,
  "complexity": 34,
  "changes_90d": 120,
  "callers": 8,
  "callees": 12
}
```

## 現在のMVPでできること・できないこと

ここが今回一番大事なポイントだ。CodeCompassは拡張可能な設計を意識しているが、**現時点でサポートしている範囲はかなり限定的**なので、導入前に必ず確認してほしい。

| 項目 | 現状 |
|---|---|
| 動作環境 | **GitHub Actions（CI）経由のみ**。ローカル単体実行は非対応 |
| 対応言語（変更頻度分析） | git管理下のすべてのファイル（言語不問） |
| 対応言語（複雑度・依存グラフ分析） | `.js` / `.py` のみ。TypeScript・Rubyなどは未対応 |
| 実装言語 | Node.js |
| Node.jsバージョン | CI実証済みは `22` |

### なぜCI専用なのか

ローカルやサンドボックスで実行すると、シャロークローン（浅いclone）の構造的な制約により `git log --since=90.days` が実際には数十日分しか遡れず、変更頻度の集計が不正確になることがわかっている。そのため、このMVPでは **GitHub Actions経由の利用のみを正式サポート対象**としている。ローカル単体実行で出た数値はあくまで参考値で、正式な判定には使わない。

つまり、「`/codecompass` のようなスキル経由でその場で軽く試す」という使い方は、今のところ正確な診断にはならない。CIで`fetch-depth: 0`（全履歴フェッチ）した状態で動かすのが前提だ。

## 導入手順

導入の流れをざっくり紹介する。詳細は[ハンドオフ手順書](https://github.com/noragrammer-crypto/Nora-lab/blob/main/tools/CodeCompass/docs/installmanual-handoff2ai.md)にまとめているので、AIエージェントにそのまま渡せば実行できるはずだ。

### 1. ダウンロード（sparse-checkout）

CodeCompass単体だけが必要な場合、Nora-lab全体をcloneせずに済む。

```bash
git clone --no-checkout --filter=blob:none https://github.com/noragrammer-crypto/Nora-lab.git
cd Nora-lab
git sparse-checkout init --cone
git sparse-checkout set tools/CodeCompass
git checkout main
```

### 2. インストール

```bash
cd tools/CodeCompass
npm install
```

### 3. GitHub Actionsへの登録

CI専用ツールなので、分析対象リポジトリに2つのワークフローを登録するのが必須の手順になる。

| ワークフロー | トリガー | やること |
|---|---|---|
| `codecompass.yml` | `pull_request` | ホットスポット分析を実行し、Top10をPRコメントとして投稿 |
| `hotspot-alert.yml` | `main` へのpush | しきい値超えのホットスポットがあれば自動でIssueを起票 |

必要な権限はこの通り。

| ワークフロー | permissions |
|---|---|
| `codecompass.yml` | `contents: read`, `pull-requests: write` |
| `hotspot-alert.yml` | `contents: read`, `pull-requests: read`, `issues: write` |

`tools/CodeCompass/workflows/` 配下のテンプレートは「CodeCompassをリポジトリ直下に置く」前提で書かれているので、`tools/CodeCompass` のようにサブディレクトリに置く場合は `working-directory` と `hotspot.js` への相対パスをその分調整する必要がある。Nora-labでも実際にこの調整をして、自分自身のリポジトリでCodeCompassを動かす（ドッグフーディングする）設定を入れた。

### 4. 動作確認

1. 適当な変更でPRを作成する
2. `codecompass.yml` が走り、`## CodeCompass Hotspots (Top 10)` というコメントがPRに投稿されることを確認する
3. PRをmainにマージする
4. `hotspot-alert.yml` が走ることを確認する
5. しきい値を超えるホットスポットがあれば `[CodeCompass Alert] ...` というIssueが自動起票される（しきい値以下なら起票されないのが正常動作）

### 実行サンプル

実際にNora-labへ`codecompass.yml`を導入したPRで投稿された、本物の`## CodeCompass Hotspots (Top 10)`コメントがこちら。

| file | hotspotScore | complexity | changes | loc | linesChanged |
|------|-------------|-----------|---------|-----|-------------|
| tools/CodeCompass/scripts/hotspot.js | 0.1333 | 12 | 1 | 90 | 90 |
| tools/CodeCompass/scripts/dependency-graph.js | 0.1282 | 10 | 1 | 78 | 78 |
| tools/CodeCompass/scripts/codecompass-to-issues.js | 0.1136 | 10 | 1 | 88 | 88 |
| tools/CodeCompass/scripts/change-frequency.js | 0.1071 | 6 | 1 | 56 | 56 |
| tools/CodeCompass/lib/refactoring-proposal.js | 0.1069 | 14 | 1 | 131 | 131 |
| tools/CodeCompass/scripts/hotspot-alert.js | 0.1020 | 5 | 1 | 49 | 49 |
| tools/CodeCompass/scripts/refactoring-proposal.js | 0.0971 | 10 | 1 | 103 | 103 |
| tools/CodeCompass/lib/dependency-graph.js | 0.0968 | 9 | 1 | 93 | 93 |
| tools/CodeCompass/scripts/complexity-score.js | 0.0909 | 5 | 1 | 55 | 55 |
| tools/CodeCompass/lib/codecompass-to-issues.js | 0.0864 | 7 | 1 | 81 | 81 |

`changes`がどのファイルも`1`なのは、このPRがCodeCompass自体を導入したばかりで、まだ各ファイルへの変更が1回ずつしか記録されていないため。運用が進むほど`changes`の差が開いていき、本来検出したい「触る頻度が高くて複雑なファイル」が上位に浮かんでくるようになる。

## 今後の展望

対応言語のロードマップとしては、まずJS/Python（Phase 1）で効果を検証してから、TypeScript/Ruby（Phase 2）、それ以外の言語（Phase 3、LLMで概念移植）へ広げていく予定だ。また、検出したホットスポットの構造化データをAIアーキテクトに渡してリファクタリング提案を自動生成する、という連携部分も設計はあるが、こちらはまだMVPの範囲外になっている。

## おわりに

CodeCompassは、Nora-labで実際にCI連携の設定を入れて動かし始めたところだ。今回は導入直後の実行サンプルを紹介したが、運用が進んでデータが積み重なってきたら、また別記事で続報を出したいと思っている。

気になる人はリポジトリを覗いてみてほしい。

https://github.com/noragrammer-crypto/Nora-lab/tree/main/tools/CodeCompass

それでは、また次の記事で！
