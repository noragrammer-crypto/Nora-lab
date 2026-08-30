---
title: 'Android×Git運用の最終解｜Claude Codeにモバイル開発を全部任せる'
emoji: 📱
type: tech
topics:
  - claudecode
  - android
  - git
  - モバイル開発
published: false
---

# Android×Git、最終解：Claude Codeに全部任せる

## これまでの試行錯誤

Android環境でGitを使おうとすると、いくつかの選択肢がありました。

**試したこと：**
- **Obsidian Git plugin** → モバイルでは不安定、メモリ不足でクラッシュ
- **GitHub公式アプリ** → コードの閲覧はできるが編集・コミット不可
- **Termuxで直接Gitコマンド** → コマンド覚えるのが大変

どれも一長一短で、「これだ！」という解決策がありませんでした。

## 最終解：Termux + Claude Code

結論から言うと、**Termux上でClaude Codeを動かして、Git操作を自然言語で指示する**のが最適解でした。

**何が変わるか：**
- 「この変更をコミットしてプッシュして」で完結
- Gitコマンドを覚える必要なし
- 音声入力でも操作可能

詳しい活用例は[こちらの記事](https://zenn.dev/kazuph/articles/abb81cf4c844d6)が参考になります。

## 最小限のセットアップ手順

### 1. Termuxのインストール

**重要：Google Play版ではなくF-Droid版を推奨**
- F-Droid版：https://f-droid.org/ja/packages/com.termux/
- Google Play版は更新が止まっている可能性あり

### 2. 基本パッケージのインストール

```bash
pkg update
pkg upgrade
pkg install nodejs
npm install -g @anthropic-ai/claude-code
```

### 3. 【重要】/tmp問題の解決

ここが**つまずきやすいポイント**です。

#### /tmpとは？

`/tmp`は、プログラムが**一時的なファイルを保存する場所**です。Claude Codeも作業中に一時ファイルをここに保存します。

しかしTermuxでは、この`/tmp`ディレクトリへのアクセス権限が制限されているため、Claude Codeが正常に動作せず、途中で止まることがあります。

#### 解決方法

`.bashrc`（Termuxの起動時に実行される設定ファイル）に以下を追加します：

```bash
nano ~/.bashrc
```

以下を最後に追記：

```bash
termux-chroot
chmod 777 /tmp
```

保存して閉じたら（Ctrl+X → Y → Enter）、設定を反映：

```bash
source ~/.bashrc
```

**この設定の意味：**
- `termux-chroot`：Termux内で標準的なLinux環境をエミュレート
- `chmod 777 /tmp`：/tmpディレクトリに誰でも読み書き実行できる権限を付与

これで、Claude Codeが/tmpを自由に使えるようになります。

### 4. Claude Codeへログイン

```bash
claude login
```

ブラウザが開いて認証画面が表示されるので、指示に従ってログインします。

## あとはClaude Codeに聞けばいい

ここからが本当に楽になります。

**SSH設定は？**
→ Claude Codeに「GitHub用のSSH鍵を作って設定して」

**GitHubアカウント連携は？**
→ Claude Codeに「GitHubのリポジトリをクローンしたい」

**前の記事の詳細設定は？**
→ Claude Codeに「[前記事のURL]を見て設定して」

そう、**設定自体もClaude Codeに任せられる**んです。

## 実際の使い方

### 日常的なGit操作

```
あなた：「変更をコミットしてプッシュして」
Claude Code：（自動的にgit add, commit, pushを実行）

あなた：「リモートから最新を取得して」
Claude Code：（git pullを実行）

あなた：「ブランチを作って切り替えて」
Claude Code：（git checkout -b を実行）
```

### 音声入力も使える

Androidのキーボードの音声入力機能を使えば、タイピングすら不要になります。

通勤中でも「今日の執筆分をコミットしてプッシュして」と話しかけるだけ。

## つまずいたら

もしClaude Codeが途中で止まったら、まず疑うのは：

1. `/tmp`の権限設定ができているか
2. ネットワーク接続は安定しているか
3. メモリ不足になっていないか

特に`/tmp`の設定は、**忘れると確実にハマる**ポイントなので、最初に必ず設定しておきましょう。

## まとめ

Android環境でのGit運用、結局こうなりました：

**難しい設定は一度だけ：**
- Termuxインストール
- Node.js + Claude Code
- `/tmp`の権限設定

**あとはずっと楽：**
- Git操作は自然言語で
- 設定もClaude Codeに相談
- 音声入力でどこからでも

これで「働かないために頑張る」の完成です。

最初の数分だけ頑張れば、その後はAIが全部やってくれます。

---

参考記事：
- [あなたもAndroidに機種変してTermuxでClaude CodeでMCPしよ？](https://zenn.dev/kazuph/articles/abb81cf4c844d6)
- [Android + Obsidian + GitHubでノート管理する 実践編](前記事のリンク)