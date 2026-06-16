---
issue: 50
title: "CaudeWeekMeater"
state: closed
labels: []
author: noragrammer-crypto
created_at: 2026-02-01T12:43:45Z
epic: ClaudeWeekMeator
---

# #50 CaudeWeekMeater

## 本文

![Screenshot_20260201-214149.png](https://github.com/user-attachments/assets/02acbcfc-0012-4476-9d83-8411a1f3af90)

結論、いつリセットそれるか少しずつ動くらしい。
なので、リセットの曜日と時刻選択できるようにして

## コメント

### noragrammer-crypto — 2026-02-01T12:49:07Z

リセット曜日と時刻を選択できる機能を実装しました。

## 実装内容
- ✅ リセット曜日（日曜日～土曜日）を選択できるドロップダウンを追加
- ✅ リセット時刻（HH:MM形式）を選択できるタイムピッカーを追加
- ✅ ユーザーが設定した曜日と時刻で次回リセット時刻を動的に計算
- ✅ 設定をローカルストレージに保存して永続化

デフォルトは金曜日19:00ですが、アプリ内で自由にカスタマイズできます。

---
