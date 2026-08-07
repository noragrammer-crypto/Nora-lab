# Issue #250: [Task] xp_AuditorスキルにGREEN後の親イシュー完了報告を追加

**Epic**: SoloXP
**Status**: Completed
**Labels**: task, epic/SoloXP
**Parent Story**: #243

## 概要

xp_Auditor SKILL.md を修正し、サブイシューが [Auditor GREEN] になった後に親イシューへ完了報告コメントを書き込む処理を追加する。

コメント例：
```
サブイシュー #42 完了。残り: #43, #45
```

## 変更対象ファイル

- `SoloXP/skills/xp_Auditor/SKILL.md`
- `.claude/skills/xp_Auditor/SKILL.md`

## 追加した処理

1. テスト GREEN 確認後、親ストーリーイシュー番号を特定する（サブイシューの本文「## 親ストーリー」セクションから取得）
2. 残りのサブイシューを特定する（同じ親ストーリーを持つオープンなタスクイシューを列挙）
3. 親イシューに完了報告コメントを書き込む

## 見積もり

1pt — SKILL.md 修正

## 依存関係

なし（即着手可能）

## ワークログ

- 作業開始: 2026-03-18 03:26
- 作業完了: 2026-03-18 03:31
- 所要時間: 20分

## 結果

- [Auditor GREEN] — 受け入れ条件 1 の 4件 PASS
