---
model: claude-sonnet-4-6
---

# XP Run Test Suites Skill

## コマンド

### `/xp_RunTestSuites`

Unit テストと Functional テストを順番に実行する。
push 前の継続的インテグレーション確認として使用する。

---

## 動作手順

### 1. 単体テストを実行する

```bash
npm run test:unit / pytest tests/unit / etc.
```

RED がある場合は記録して次へ進む（止めない）。

### 2. プレビュー環境の疎通確認

CLAUDE.md の「疎通確認手順」に従ってプレビュー URL を特定する。
ブランチ名からの URL 手組み立てはVercelの自動短縮・ハッシュ付与で実URLと不一致になるため使用しない。

```bash
# 1. 現在のブランチ名を取得
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# 2. VERCEL_TOKEN が使える場合: Vercel API でブランチに対応するプレビューURLを取得
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

# 3. VERCEL_TOKEN が未設定/取得失敗の場合は BASE_URL → localhost:3000 にフォールバック
PREVIEW_URL=${PREVIEW_URL:-${BASE_URL:-http://localhost:3000}}

# 4. 疎通確認（200が返ればテスト実行可能）
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $PREVIEW_URL)

# 5. 200以外の場合は30秒待ってリトライ（最大2回）
```

疎通確認が取れない場合：デプロイ未完了の可能性があるため、その旨を記録して機能テストはスキップする。

### 3. 機能テストを実行する

```bash
BASE_URL=$PREVIEW_URL npm run test:functional / pytest tests/functional / etc.
```

### 4. 結果をまとめて報告する

```
## /xp_RunTestSuites 結果

実行日時: YYYY-MM-DD HH:MM
ブランチ: <branch名>

### 単体テスト
- 結果: PASS n件 / FAIL n件
- <FAIL詳細>

### 機能テスト
- プレビューURL: <疎通確認済みURL または "未確認（デプロイ待ち）">
- 結果: PASS n件 / FAIL n件 / SKIP n件（デプロイ未完了等）
- <FAIL詳細>

### 総合判定
- ✅ GREEN: push 可能
- ❌ RED あり: 以下を解消してから push すること
  - <対応が必要な項目>
```

---

## 注意事項

- E2E テストは対象外（`/xp_RunE2ETests` を使用）
- RED があっても全スイートを最後まで実行する
- テストの修正・削除は行わない
- push の可否判断は報告するが、push 自体は実行しない
