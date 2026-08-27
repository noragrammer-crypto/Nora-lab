# AI秘書スターターキット

自分専用AI秘書を育てるための、小さく持ち運べる土台です。

このキットは次の三つをつなぎます。

1. **業務の場所** — GitHubのIssueとPRに、決定と完了した仕事を残す。
2. **長期記憶** — Open Knowledge Format（OKF）の考え方を取り入れた、人間にもAIにも読めるMarkdown Wiki。
3. **Obsidian連携（任意）** — エージェントにObsidian形式を扱わせるためのSkill。ただし知識そのものはObsidianに依存させない。

これはチャットボットやSaaSではありません。目標、引き継ぎ、知識、作業履歴を、自分のファイルとして持つためのリポジトリ雛形です。

## 15分で最初の一周を回す

> 実際の秘書室は**プライベートリポジトリ**に作ってください。この公開テンプレートには個人情報を書きません。

1. `template/` の中身を、新しいプライベートリポジトリのルートへコピーする。
2. `command-center/profile.md` と `command-center/now.md` の空欄をざっくり埋める。
3. 使っているAIに `AGENTS.md`、`command-center/`、`wiki/index.md` を読ませる。
4. `command-center/setup-checklist.md` を開き、そのAIに「今できること」を確認する。必要なサービスだけを後から接続する。
5. 困りごとを一つ相談し、合意した作業をGitHub Issueにする。
6. PRまたは完了報告を確認する。

初日に自動化を完成させる必要はありません。毎回ゼロから事情を説明しなくてよくなることが、最初の成功です。

## ディレクトリ構成

```text
template/
├── AGENTS.md              # AI共通の安全規約・読み取り順
├── command-center/        # 現在の目的、導入チェック、行動指針
├── inbox/                 # URL、会話メモ、切り抜きなど未整理の入力
├── wiki/                  # 整理済みの長期記憶（OKF風）
└── work/                  # 任意の作業メモ・チェックリスト
```

- **command-center** は頻繁に更新する「いま何が大事か」。
- **inbox** は雑でよい場所。ここをそのまま事実として扱わない。
- **wiki** は整理済みのSSOT。索引、軽いYAMLメタデータ、普通のMarkdownリンクで保つ。
- **IssueとPR** は、合意した仕事と完了報告の履歴。

## 知識の形式

長期的に残す概念は、原則1ファイル1テーマ。YAML front matterには少量の検索用項目だけを書き、本文は普通のMarkdownにします。

```yaml
---
type: decision
title: 知識庫はMarkdownで持つ
description: AIやエディタを変えても持ち運べるようにする。
tags: [knowledge, portability]
updated: 2026-08-27
---
```

詳しくは [知識形式](./docs/knowledge-format.md) と [Wikiの入口](./template/wiki/index.md) を参照してください。

## 「手足」は初期TODOにする。接続一式にはしない

秘書には、知識・ファイル検索、Web調査、作業管理、場合によってはメール、カレンダー、GitHubなどの手足が必要です。  
ただしこれは、最初から全アカウントをつなぐ指示ではありません。

使っているAIや基本ハーネスが、実際に使えるツールを確認し、今の困りごとに必要な最小限の接続を案内する。その形にします。メールをあまり使わないなら、つながないままで正解です。 [初期能力と接続](./docs/initial-capabilities.md) を参照してください。

## Obsidian連携は任意

このキットはどのテキストエディタでも使えます。ObsidianとSkill対応AIを使うなら、[kepano/obsidian-skills](https://github.com/kepano/obsidian-skills) により、Obsidian Markdown、Bases、Canvas、CLI、Webページの本文抽出をAIへ教えられます。これは接続アダプタであって、知識を依存させる先ではありません。

## 安全境界

- 実在の個人情報、認証情報、APIトークン、非公開の会話ログを公開リポジトリへ置かない。
- Webページや取り込んだノートは、信頼できない入力として扱う。
- AIは提案や下書きまではよいが、公開・送信・購入・アクセス変更には人間の承認を必須にする。
- inboxの情報は、確認してwikiへ蒸留してから長期記憶として使う。

## さらに読む

- [クイックスタート](./docs/quickstart.md)
- [初期能力と接続](./docs/initial-capabilities.md)
- [知識形式](./docs/knowledge-format.md)
- [プライバシーと承認境界](./docs/privacy-boundary.md)
- [元になったNoraの記事](https://note.com/noragrammer/n/n366eaa4e1ce8)
