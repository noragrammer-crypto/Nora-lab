# workflow-integration E2E Tests

テストファイル: `CodeCompass/__tests__/e2e/workflow-integration.e2e.test.js`

Story: #1396 コードコンパスのワークフロー統合

---

## ユーザーシナリオ概要

CodeCompass のパイプライン全体（除外フィルタ → issues 発行）が正しく動作することを検証する。

---

## 受け入れ条件一覧

| # | 条件 | 対応タスク | 状態 |
|---|------|---------|------|
| 1 | hotspot.js のデフォルト除外: dist/.obsidian/node_modules 等がランキングに出ない | #1440 | ✅ GREEN |
| 2 | hotspot.js の --ignore オプション: カスタム除外パターンを追加できる | #1440 / #1525 | ✅ GREEN |
| 3 | codecompass-to-issues.js スクリプトが存在する | #1441 | ✅ GREEN |
| 4 | codecompass-to-issues.js が --dry-run で対象一覧を stdout に出力できる | #1441 | ✅ GREEN |
| 5 | --limit オプションで発行件数を制限できる | #1441 | ✅ GREEN |
| 6 | SKILL.md に Step 4（イシュー自動発行）セクションが存在する | #1442 | 🔴 RED（#1442 完了待ち） |

---

## シナリオ詳細

### AC1-2: hotspot.js 除外フィルタ

**前提条件**
- フィクスチャリポジトリに `src/app.js`（除外対象外）と `dist/bundle.js`（除外対象）等が存在する

**Given** `src/app.js` と `dist/bundle.js` を含むリポジトリ  
**When** `node hotspot.js <repo>` を実行する  
**Then** `dist/bundle.js` はランキングに含まれず、`src/app.js` は含まれる

### AC3-5: codecompass-to-issues.js CLI 動作

**前提条件**
- `CodeCompass/scripts/codecompass-to-issues.js` が存在する
- テスト用 actions.md（フィクスチャ）が準備されている

**Given** フィクスチャの actions.md（3件の提案を含む）  
**When** `--dry-run --limit=2` で実行する  
**Then** 標準出力に2件の候補一覧が表示され、`gh issue create` は呼ばれない

### AC6: SKILL.md Step 4（#1442 完了後に GREEN）

**Given** `CodeCompass/SKILL.md`  
**When** ファイルを読む  
**Then** `Step 4`・`イシュー自動発行`・`codecompass-to-issues` のいずれかを含む

---

## 前提条件

- Node.js が使用可能であること
- テスト用の一時ディレクトリが作成できること
- SKILL.md が存在すること（AC6）
