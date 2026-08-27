# 知識形式

`wiki/` はOKF風の知識束です。普通のMarkdown、少量のYAML front matter、移動用の索引ページ、普通のMarkdownリンクで構成します。

## 必須項目

整理済みの概念ページには、必ず `type` を付けます。

```yaml
---
type: project
---
```

## 推奨項目

```yaml
---
type: project
title: AI秘書スターターキット
description: 個人AI秘書のための持ち運べるリポジトリ雛形。
tags: [ai, knowledge-management]
updated: 2026-08-27
source: https://example.com
---
```

人間とツールが探し、理解するのに役立つ項目だけを使います。複雑なスキーマを発明しないでください。

## ファイルとリンクの規則

- 長く残す概念は1ファイル1テーマ。
- ファイルパスは安定したID。改名は意図して行う。
- 数件を超えるフォルダには `index.md` を置く。
- `[プロジェクト](./projects/index.md)` のような相対Markdownリンクを使う。
- 出典を書き、出典の事実と自分の結論を分ける。
- 時系列の生ログは、蒸留するまでwikiの外に置く。

## 推奨するtype

| type | 用途 |
| --- | --- |
| `profile` | 安定した好みと作業上の制約 |
| `project` | 継続中の取り組み |
| `decision` | 採用・不採用の決定と理由 |
| `reference` | 残す価値がある出典 |
| `procedure` | 繰り返せる作業方法 |
| `glossary` | この環境独自の用語 |

形式を小さく保ちます。相互運用性は、大きな分類体系ではなく、Markdown、front matter、索引、リンクから生まれます。
