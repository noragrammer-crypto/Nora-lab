---
issue: 1182
title: "[Task] 変更頻度分析エンジン実装（git log --numstat 集計）"
state: open
labels: [task, epic/CodeCompass]
author: noragrammer-crypto
created_at: 2026-06-08T13:33:02Z
epic: CodeCompass
---

# #1182 [Task] 変更頻度分析エンジン実装（git log --numstat 集計）

## 本文

## 概要

`git log --numstat --since=90.days` を実行し、ファイルごとの変更回数・変更行数を集計、
変更頻度降順でランキングした構造化データ（JSON）として出力するエンジンを実装する。
CodeCompass の蒸留エンジン（レイヤー1）の最初の柱で、ホットスポット判定（#1178）の入力データとなる。

## やること

- `git log --numstat --since=<N>.days` を実行しファイルごとの変更回数・変更行数（追加+削除）を集計する
- 集計結果を変更頻度降順でランキングした構造化データ（JSON）として出力する
- 集計期間（デフォルト90日）をオプションで変更可能にする
- 任意のリポジトリパスを対象にできるようにする

## 見積もり

3pt — 集計ロジック実装 + JSON出力 + オプション対応

## 依存関係

なし（即着手可能）

## 親ストーリー

#1176

## 親ブランチ

feature/issue-1176
