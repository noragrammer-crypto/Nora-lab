---
model: claude-sonnet-4-6
---

# XP Run E2E Tests Skill

## コマンド

### `/xp_RunE2ETests`

E2E テストスイートを実行する。
Story 完了時・PR 作成前の受け入れ確認として使用する。

---

## 動作手順

### 0. 実行環境チェック（最初に必ず行う）

Playwright が動作しない環境ではテストを実行できない。
以下の方法で環境を確認し、実行不可の場合は即座にスキップする。

```bash
# Playwright が利用可能か確認
npx playwright --version 2>/dev/null
# または
which playwright 2>/dev/null
```

**実行不可と判断する条件:**
- `npx playwright --version` がエラーになる
- Android 端末上での作業（ブラウザ実行環境なし）

**ClaudeCode Web 環境での実行:**

ClaudeCode Web では Playwright MCP を使ってローカルサーバーでの E2E テストを行う。
セッション開始時に `http://localhost:3000` でローカルサーバーが自動起動している。

ローカルサーバーが起動していない場合は手動で起動する:

```bash
# ローカルサーバーの起動（Vercelルーティングを模倣）
node /home/user/HolyAutomater/scripts/dev-server.js > /tmp/dev-server.log 2>&1 &

# 疎通確認
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
# → 200 が返れば起動成功
```

**実行不可の場合の処理（Androidのみ）:**

作業中のストーリーイシューに以下のコメントを投稿して終了する:

```
## /xp_RunE2ETests スキップ

実行日時: YYYY-MM-DD HH:MM

### スキップ理由
**実行環境の制約により E2E テストをスキップしました。**

現在の環境（Android）では Playwright が利用できないため、
テストの実行が不可能です。

### E2E テスト設計
テストスイートの設計・コードは作成済みです（`/xp_E2Etest` 参照）。
実際の実行は Playwright が利用可能な環境（ローカル PC / CI / ClaudeCode Web）で行ってください。

### 受け入れ判定
⏭️ スキップ: 環境制約のため実行不可。ローカル環境での確認が必要です。
```

コメント投稿後、このスキルの処理を終了する。以降のステップは実行しない。

---

### 1. テストランナーを判定する

実行対象プロジェクトの `package.json` の `test:e2e` スクリプト内容を確認し、Playwright ベースか Jest ベースかを判定する。

```bash
TEST_E2E_SCRIPT=$(node -p "require('./package.json').scripts['test:e2e'] || ''")
echo "$TEST_E2E_SCRIPT"
```

- `playwright` を含む場合 → Playwright ベース。ステップ2（テスト対象 URL の確認）に進み、従来通り Vercel/localhost への疎通チェックを行う
- `jest` を含む（`playwright` を含まない）場合 → Jest ベース。疎通チェックをスキップし、`BASE_URL` を設定せずそのままステップ3で `npm run test:e2e` を実行する

### 2. テスト対象 URL の確認（Playwright ベースの場合のみ）

**ClaudeCode Web 環境の場合:** ローカルサーバーを使用する。

```bash
# ローカルサーバーの疎通確認
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$STATUS" = "200" ]; then
  BASE_URL="http://localhost:3000"
  echo "ローカルサーバー OK: $BASE_URL"
else
  echo "ローカルサーバー未起動。起動してからリトライ。"
  node /home/user/HolyAutomater/scripts/dev-server.js > /tmp/dev-server.log 2>&1 &
  sleep 3
  BASE_URL="http://localhost:3000"
fi
```

**ローカル PC / CI 環境の場合:** Vercel プレビュー URL を使用する。
ブランチ名からの URL 手組み立てはVercelの自動短縮・ハッシュ付与で実URLと不一致になるため使用しない。

```bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# VERCEL_TOKEN が使える場合: Vercel API でブランチに対応するプレビューURLを取得
if [ -n "$VERCEL_TOKEN" ]; then
  PREVIEW_URL=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
    "https://api.vercel.com/v6/deployments?projectId=holyautomater&limit=20" \
    | python3 -c "
import sys, json
deps = json.load(sys.stdin)['deployments']
for d in deps:
    if d['meta'].get('githubCommitRef') == '$BRANCH':
        print('https://' + d['url']); break
")
fi

# VERCEL_TOKEN が未設定/取得失敗の場合は BASE_URL → localhost:3000 にフォールバック
PREVIEW_URL=${PREVIEW_URL:-${BASE_URL:-http://localhost:3000}}
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $PREVIEW_URL)
# 200以外の場合は30秒待ってリトライ（最大2回）
BASE_URL=$PREVIEW_URL
```

疎通確認が取れない場合：その旨を報告して終了する。

### 3. E2E テストを実行する

**Playwright ベースの場合:**

```bash
BASE_URL=$BASE_URL npm run test:e2e
```

**Jest ベースの場合（疎通チェックをスキップ済み）:**

```bash
npm run test:e2e
```

### 4. 結果を報告する

```
## /xp_RunE2ETests 結果

実行日時: YYYY-MM-DD HH:MM
対象URL: <PREVIEW_URL>
対象ストーリー: #<issue番号>

### 結果
- PASS: n件
- FAIL: n件

### FAIL 詳細
- `<テスト名>`: <失敗内容>

### 受け入れ判定
- ✅ 全件 PASS: Story 完了・PR 作成可能
- ❌ FAIL あり: 受け入れ基準を満たしていない
  - 対応が必要な項目: <一覧>
```

---

## 注意事項

- Unit / Functional テストは対象外（`/xp_RunTestSuites` を使用）
- テストの修正・削除は行わない
- 受け入れ判定の結果は対象ストーリーイシューにコメントする
