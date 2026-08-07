---
model: claude-sonnet-4-6
---

# XP Run All Unit Tests Skill

## コマンド

### `/xp_RunAllUnitTests`

全単体テストスイートを実行し、結果を報告する。
RED が残っている場合は Issue 番号付きで一覧表示する。

---

## 動作手順

### 1. テスト対象を特定する

リポジトリ内の全単体テストファイルを確認する。

```bash
find . -path "*/node_modules" -prune -o -name "*.unit.test.*" -print
find . -path "*/node_modules" -prune -o -name "*.test.*" -path "*unit*" -print
```

### 2. 全単体テストを実行する

```bash
npm run test:unit / pytest tests/unit / go test ./... / etc.
```

プロジェクトごとに適切なコマンドを使用する。

### 3. 結果を集計して報告する

```
## /xp_RunAllUnitTests 結果

実行日時: YYYY-MM-DD HH:MM

| プロジェクト | PASS | FAIL | SKIP |
|---|---|---|---|
| <name> | n | n | n |

### RED 一覧（要対応）

- [ ] #<issue番号> `<テスト名>` — <失敗理由の要約>
- [ ] #<issue番号> `<テスト名>` — <失敗理由の要約>

### 全テスト GREEN ✅
（RED がない場合）
```

RED が残っている場合は、対応する GitHub Issue 番号を付けて一覧表示する。
Issue が特定できない場合は対象ファイル名・テスト名を記載する。

---

## 注意事項

- 機能テスト・E2E テストは対象外（単体テストのみ）
- テストの修正・削除は行わない
- 実行環境の問題（依存未インストール等）は別途報告する
