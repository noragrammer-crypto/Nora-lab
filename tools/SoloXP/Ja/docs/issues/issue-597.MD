---
issue: 597
title: "[Task] カクヨム接続・ログイン実証"
state: open
labels: [task, epic/kakuyomu-post]
author: noragrammer-crypto
created_at: 2026-04-11T01:58:42Z
epic: kakuyomu-post
---

# #597 [Task] カクヨム接続・ログイン実証

## 本文

## 概要
Playwright MCP を使ってカクヨムへのアクセスとログインを実証する。
環境変数 `KAKUYOMU_EMAIL` / `KAKUYOMU_PASSWORD` を使ったログインフローを確認し、
`/kakuyomu_post` スキルが実際に動作することを確認する。

### 実証手順

1. `browser_navigate` で https://kakuyomu.jp/ にアクセス（ウォームアップ）
2. https://kakuyomu.jp/auth/login へ移動
3. 「メールアドレスで続ける」→「ログイン」の順にクリック
4. メールアドレス・パスワードを入力してログイン
5. ログイン後 https://kakuyomu.jp/my にアクセスし、作品リストが表示されることを確認
6. `/kakuyomu_post` スキルを実行して差分エピソードを1件投稿

### WAF 回避の注意事項

- UA偽装: `--disable-blink-features=AutomationControlled` は wrapper に設定済み
- 直接アクセスは避けてホームページを経由する
- リトライを短時間に繰り返さない

## 見積もり
2pt — 実証テスト・動作確認・問題対応

## 依存関係
このタスクは #596 (userDataDir永続化設定の追加) の完了後に着手すること。
（#596 に [Auditor GREEN] コメントが記録されてから着手する）

## 親ストーリー
#579

## コメント

### noragrammer-crypto — 2026-04-11T06:08:01Z

作業開始 2026-04-11 06:15

[Tester実行中]

---

### noragrammer-crypto — 2026-04-11T06:09:30Z

## テスト命題（Unit）

- [ ] KAKUYOMU_EMAIL 環境変数が設定されていること
- [ ] KAKUYOMU_PASSWORD 環境変数が設定されていること
- [ ] playwright-mcp-wrapper.mjs に userDataDir 設定があること
- [ ] WAF回避設定（--disable-blink-features=AutomationControlled）が含まれること
- [ ] userDataDir パスが /opt/pw-browsers/kakuyomu-session であること
- [ ] kakuyomu_post SKILL.md が存在すること

スキップ: Functional / E2E — このタスク自体がライブ実証テスト。Implementer が Playwright MCP を使って直接実証する。

---

### noragrammer-crypto — 2026-04-11T06:10:17Z

## テスト実行結果

### Unit Test
テストファイル: `SoloXP/__tests__/kakuyomu-login-prerequisites.unit.test.js`
結果: PASS 9件 / FAIL 0件

命題チェック:
- [x] KAKUYOMU_EMAIL 環境変数が設定されていること
- [x] KAKUYOMU_PASSWORD 環境変数が設定されていること
- [x] playwright-mcp-wrapper.mjs が存在すること
- [x] userDataDir 設定があること
- [x] userDataDir パスが /opt/pw-browsers/kakuyomu-session であること
- [x] WAF回避設定（--disable-blink-features=AutomationControlled）が含まれること
- [x] SSL証明書エラー無視設定（--ignore-certificate-errors）が含まれること
- [x] kakuyomu_post SKILL.md が存在すること
- [x] SKILL.md にカクヨムのログインURLが記載されていること

スキップ: Functional / E2E — このタスク自体がライブ実証テスト。Implementer が Playwright MCP を直接操作して実証する。

[Tester完了]
[Implementer実行中]

---

### noragrammer-crypto — 2026-04-11T06:17:28Z

## 実装完了（部分）

### 根本原因の特定と修正

**原因**: `.mcp.json` の playwright 設定がプロキシラッパーを使わず起動していた。
- `dotfiles/.claude/settings.json` には wrapper が設定済みだったが、プロジェクトの `.mcp.json` が優先されていた。

変更ファイル:
- `.mcp.json`: playwright MCP をプロキシラッパー経由に変更
  - 旧: `npx -y @playwright/mcp@latest --no-sandbox`（プロキシ認証なし → `ERR_INVALID_AUTH_CREDENTIALS`）
  - 新: `node /root/dotfiles/bin/playwright-mcp-wrapper.mjs`（JWT プロキシ認証付き）
- `SoloXP/__tests__/kakuyomu-login-prerequisites.unit.test.js`: 新規作成

テスト結果:
- 単体テスト: PASS 9件 / FAIL 0件
- ブラウザ実証: **次セッション以降**（現セッションの MCP はキャッシュ起動のため変更未反映）

---

### noragrammer-crypto — 2026-04-11T06:19:07Z

[Auditor RED]
FAIL: ブラウザ実証手順（実証手順1〜6）が未完了

**原因**: MCP セッションキャッシュにより `.mcp.json` 修正が同一セッション内で反映されなかった。
修正（wrapper 経由）はコミット済み。新セッションでの再実証が必要。

---

### noragrammer-crypto — 2026-04-11T06:22:18Z

作業開始 2026-04-11 06:22

[Implementer実行中]（差し戻し1回目 / 新セッション）

前セッションで `.mcp.json` 修正済み。今セッションでは MCP が wrapper 経由で起動しているため、ブラウザ実証（手順1〜6）を実施する。

---

### noragrammer-crypto — 2026-04-11T06:32:23Z

[Auditor GREEN]
PASS: 9件 / テストコマンド: `cd SoloXP && npm test`

### ブラウザ実証（実証手順1〜6）

| 手順 | 結果 |
|---|---|
| https://kakuyomu.jp/ アクセス（ウォームアップ） | ✅ PASS |
| https://kakuyomu.jp/auth/login 移動 | ✅ PASS |
| 「メールアドレスで続ける」→「ログイン」クリック | ✅ PASS |
| メール・パスワード入力・ログイン | ✅ PASS |
| /my にアクセス「Noraさんのダッシュボード」確認 | ✅ PASS |
| kakuyomu_post フロー実行 → v1c2e2s2 下書き投稿（13話目） | ✅ PASS |

---
