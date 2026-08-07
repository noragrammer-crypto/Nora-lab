---
issue: 1412
title: "[Task] ProcessIssue の depends_on チェックを --json comments に修正する（再現テスト含む）"
state: open
labels: [task, epic/SoloXP, Emergency]
author: noragrammer-crypto
created_at: 2026-06-14T13:37:13Z
epic: SoloXP
---

# #1412 [Task] ProcessIssue の depends_on チェックを --json comments に修正する（再現テスト含む）

## 本文

## 概要

ProcessIssue の `depends_on` チェック（SKILL.md ステップ 2-2 B）と Architect 済み Story チェック（ステップ 2-2 C）で `gh issue view --comments` を使用しているが、このオプションはコメント本文を返さず GraphQL Deprecated 警告のみを返す。

その結果、depends_on が解消済みのイシューが常にブロック中と誤判定される。

## 修正内容

### 再現テスト追加

`SoloXP/tests/unit/process-issue-skill.unit.test.js` に以下を追加:
- SKILL.md の depends_on チェックに `--comments` が含まれないことを確認するテスト
- SKILL.md の depends_on チェックに `--json comments` が含まれることを確認するテスト
- SKILL.md の Architect済みStory チェックに `--comments` が含まれないことを確認するテスト
- SKILL.md の Architect済みStory チェックに `--json comments` が含まれることを確認するテスト

### SKILL.md 修正対象（2箇所）

**workflow/skills/ProcessIssue/SKILL.md**

1. **行95: depends_on チェック（ステップ 2-2 B）**
   - 変更前:
     ```bash
     gh issue view  --comments --repo / | grep "\[Auditor GREEN\]"
     ```
   - 変更後:
     ```bash
     gh issue view  --json comments --repo / \
       | python3 -c "import json,sys; cs=json.load(sys.stdin).get('comments',[]); print('GREEN') if any('[Auditor GREEN]' in c.get('body','') for c in cs) else None"
     ```

2. **行107: Architect済みStory チェック（ステップ 2-2 C）**
   - 変更前:
     ```bash
     gh issue view  --comments --repo / | grep -c "\[親ブランチ作成済み\]"
     ```
   - 変更後:
     ```bash
     gh issue view  --json comments --repo / \
       | python3 -c "import json,sys; cs=json.load(sys.stdin).get('comments',[]); print(sum(1 for c in cs if '[親ブランチ作成済み]' in c.get('body','')))"
     ```

## 見積もり

2pt — 再現テスト4件 + SKILL.md 2箇所修正

## 依存関係

なし（即着手可能）

## 親ストーリー（バグ）

#1411

## 親ブランチ

feature/issue-1411

## コメント

### noragrammer-crypto — 2026-06-14T13:55:31Z

作業開始 2026-06-14 13:53
セッションURL: https://claude.ai/code/session_01KSgNBTVH2mQZVxS6VA7iaS
[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-06-14T13:55:40Z

[Tester実行中]

---

### noragrammer-crypto — 2026-06-14T13:58:12Z

## テスト実行結果

### Unit Test
テストファイル: `SoloXP/tests/unit/process-issue-skill.unit.test.js`
結果: PASS 13件 / FAIL 4件

命題チェック:
- [x] depends_on チェックに `--comments` 単独フラグが使われていない（バグ修正確認）→ FAIL（バグ存在を確認）
- [x] depends_on チェックに `--json comments` が使われている → FAIL（バグ存在を確認）
- [x] Architect済みStory チェックに `--comments` 単独フラグが使われていない（バグ修正確認）→ FAIL（バグ存在を確認）
- [x] Architect済みStory チェックに `--json comments` が使われている → FAIL（バグ存在を確認）

### Functional Test
スキップ — SKILL.md 検証テストのみのためFunctional層は対象外

### E2E Test
スキップ — スキル定義ファイルの修正のためE2E対象外

---
4件の再現テストが RED でバグの存在を証明。Implementer で SKILL.md を修正して GREEN にする。

---

### noragrammer-crypto — 2026-06-14T13:58:15Z

[Tester完了]

---

### noragrammer-crypto — 2026-06-14T13:58:20Z

[Implementer実行中]

---

### noragrammer-crypto — 2026-06-14T13:59:22Z

## 実装完了

変更ファイル:
- `workflow/skills/ProcessIssue/SKILL.md`: depends_on チェック（ステップB）と Architect済みStory チェック（ステップC）の `--comments` を `--json comments` + python3 パイプに修正（2箇所）

テスト結果:
- 単体テスト: PASS 17件 / FAIL 0件（再現テスト4件含む全件GREEN）
- 機能テスト: スキップ（SKILL.md検証のみのため対象外）

---

### noragrammer-crypto — 2026-06-14T13:59:27Z

[Implementer完了]

---

### noragrammer-crypto — 2026-06-14T13:59:31Z

[Auditor テスト実行中]

---

### noragrammer-crypto — 2026-06-14T14:00:50Z

[Auditor GREEN]
PASS: 92件（Unit）+ 20件（Functional）= 計112件 / テストコマンド: `node_modules/.bin/jest`

[実環境確認 OK]
- `gh issue view 1255 --json comments --repo ...` → `[Auditor GREEN]` を正常検出（"GREEN" 出力）
- `gh issue view 1411 --json comments --repo ...` → `[親ブランチ作成済み]` カウント = 1（正常）

バグ修正が実環境でも正常動作することを確認。

---

### noragrammer-crypto — 2026-06-14T14:00:55Z

作業完了 2026-06-14 14:05 / 所要時間: 12分

---

### noragrammer-crypto — 2026-06-14T14:01:10Z

[Documenter実行中]

---
