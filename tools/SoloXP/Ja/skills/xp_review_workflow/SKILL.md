---
model: claude-sonnet-4-6
---

# XP Review Workflow Skill

## コマンド

### `/xp_review_workflow`

直近1週間分のイシュー・PRログを読み込み、
「あるべきワークフロー（期待達成条件）」と**一番乖離したログ**を1件だけ特定し、
改善項目として報告する。
改善案も一言で添える。

---

## 制約

- Noraの方針や判断とコンフリクトする提案はしない
- あくまで「Claude が働きやすくなる書き方の改善」にとどめる
- 指摘は**1つだけ**。複数列挙しない

---

## ワークフロー期待達成条件（正常完了条件）

各スキルの正常完了条件（期待達成条件）を以下に定義する。
これを「あるべきワークフロー」の基準とし、満たされていないログを「逸脱ログ」として扱う。

| スキル | 期待達成条件（正常完了コメントパターン） |
|---|---|
| xp_Architect | `[Architect完了]` または サブイシュー発行コメントあり |
| xp_Tester | `[Tester完了]` |
| xp_Implementer | `[Implementer完了]` |
| xp_Auditor (test) | `[Auditor GREEN]` |
| xp_Auditor (doc) | `[PR発行済み #\d+]` |
| xp_Documenter | `[Documenter完了]` |

---

## 動作手順

### 1. 直近1週間のイシュー・PRログを取得

```bash
SINCE=$(date -d '7 days ago' +%Y-%m-%d)

# イシュー一覧（全件取得してから日付フィルタする）
gh issue list --repo noragrammer-crypto/HolyAutomater \
  --state all --limit 200 \
  --json number,title,labels,comments,body,createdAt,closedAt,updatedAt \
  > /tmp/xp_review_issues.json

# PR一覧
gh pr list --repo noragrammer-crypto/HolyAutomater \
  --state all --limit 200 \
  --json number,title,labels,comments,body,createdAt,closedAt,updatedAt,mergedAt \
  > /tmp/xp_review_prs.json

python3 -c "
import sys, json, datetime
since = datetime.datetime.fromisoformat('${SINCE}T00:00:00+00:00')

def in_range(item):
    for k in ('createdAt', 'updatedAt', 'closedAt'):
        v = item.get(k)
        if v and datetime.datetime.fromisoformat(v.replace('Z', '+00:00')) >= since:
            return True
    return False

issues = json.load(open('/tmp/xp_review_issues.json'))
prs = json.load(open('/tmp/xp_review_prs.json'))

xp_issues = [i for i in issues if in_range(i) and (
    '[Story]' in i['title'] or '[Task]' in i['title'] or '[Bug]' in i['title'] or
    any(l['name'].startswith('epic/') for l in i['labels'])
)]
xp_prs = [p for p in prs if in_range(p)]

print(json.dumps({'issues': xp_issues, 'prs': xp_prs}, ensure_ascii=False, indent=2))
"
```

### 2. 実際の進行をワークフローにマッピング

取得したイシュー・PRのコメント／本文（`Closes #N` 等）から、各イシューが
期待達成条件の表に沿って Architect → Tester → Implementer → Auditor → PR発行 → クローズ
の順に進行したかを確認する。

確認observationの例：
- `[Tester完了]` の後に `[Implementer完了]` が記録されていないイシュー
- `[Implementer完了]` の後に `[Auditor GREEN]` が記録されていないイシュー
- 同じフェーズが3回以上繰り返されているイシュー（差し戻しループ）
- `[Auditor GREEN]` なしにPRが発行（mergedAt あり、または`[PR発行済み]`）されているイシュー
- PRが存在するのに紐づくイシューに完了コメントが記録されていない
- Claude がコメントで「判断に迷った」「確認が必要だった」と記録している箇所
- 同じ処理を複数のスキルが重複して行っている箇所

### 3. 一番乖離したログを1件特定

複数の逸脱が見つかっても、**あるべきワークフローとの乖離が最も大きい1件**だけを選ぶ。

選定基準（優先順）:
1. 期待達成条件からの逸脱度が大きい（フェーズ丸ごと欠落・繰り返しループ等）
2. 再現性が高い（同種の乖離が複数ログで起きている）
3. 定義ファイルへの小さな修正で解決できる
4. Noraの意図・方針に反しない改善である

### 4. 原因SKILLの特定

選んだ1件について、どの SKILL.md の定義が問題だったかを特定する（原因SKILL特定）。

確認手順:
1. 乖離が発生したフェーズ（どのスキルのコメントの後で問題が起きたか）を特定する
2. そのフェーズを担当するスキル（原因SKILL）の SKILL.md を確認する
3. 曖昧な指示・欠如している前提・矛盾する記述がないかを探す

```
原因SKILL候補の例:
- xp_Director: ルーティング・フロー制御の問題
- xp_Tester: テスト作成・スキップ判定の問題
- xp_Implementer: 実装範囲・着手条件の問題
- xp_Auditor: GREEN/RED判定・PR発行の問題
```

### 5. 報告する

以下のフォーマットで出力する:

```
## ワークフロー振り返り（直近1週間）

### 一番乖離したログ
#<番号> <タイトル>（Issue / PR）

### あるべきワークフローとの乖離内容
<期待達成条件のどこから外れたか / 何が起きたか>

### 原因SKILL
<スキル名>の「<セクション名>」

### 改善案（一言）
<どう書き直せばよいか>
```

---

## 注意事項

- 指摘は事実ベースで。ログに記録がない推測は含めない
- 対象は直近1週間分のログに限定する（古いログは対象外）
- 改善案はスキル定義の「書き方」の修正であること（実装変更・方針変更を提案しない）
- このスキルはファイルを変更しない。報告のみで終了する
