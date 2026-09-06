---
title: 'Android版Claude CodeでもGitHub CLI（gh）は使える'
emoji: 📲
type: tech
topics:
  - claudecode
  - android
  - github
  - cli
published: false
---

---

**課題**

GitHub連携をちゃんと組んでおくと、イシューに課題やバグを書いておけば、そこからClaude Codeが直接作業できる。スクショ等も渡せる（渡し方は別途要調査）。

ただしAndroid版Claude CodeのWebアプリには環境変数設定UIが見当たらず、GitHub CLI（gh）の認証が通らない状態が続いていた。

**暫定対応（しっくりこない期間）**

- 毎回認証トークンを手動で渡す
- イシューの内容をコピペして作業させる

動くっちゃ動く。でもしっくりこない。「やれ、ハイ」にならない微妙なストレス。

**解決**

雑談中のClaudeが指摘。

「Claude Code **Web版**（ブラウザ）経由なら環境変数の設定があります」

Web版で一度設定しておくと、Androidアプリからのアクセスでも同じ環境が使えるようになった。

**結論**

Claude Code WebでもghによるGitHub連携は使える。Web版で環境変数を設定しておくこと。

---
