# E2E受け入れテスト: Issue #1381 xp_Architect の競合チェックを feature-dev に委譲する

## 概要

ストーリー #1381「xp_Architect の競合チェックを feature-dev に委譲する」の受け入れ条件を検証する E2E テストスイート。

- テストファイル: `SoloXP/tests/e2e/issue-1381-xp-architect-feature-dev.test.js`
- テストケース数: 14件
- 実行方法: `cd SoloXP && npx jest tests/e2e/issue-1381-xp-architect-feature-dev.test.js`

---

## 受け入れ条件 1: step 3 が feature-dev または同等のコード探索手段を呼び出す記述になっている

| # | テストケース | 検証パターン | 状態 |
|---|---|---|---|
| 1 | feature-dev または同等のコード探索エージェントへの参照が含まれる | `/feature-dev\|Explore.*エージェント\|Explore subagent\|.../i` | ✅ PASS |
| 2 | 競合チェック手順（step 3 相当）にエージェント呼び出し記述が含まれる | `step3セクション内 /feature-dev\|Explore\|subagent\|エージェント/i` | 🔴 RED（実装待ち） |

---

## 受け入れ条件 2: feature-dev 出力から xp 実行計画への変換ルールが明記されている

| # | テストケース | 検証パターン | 状態 |
|---|---|---|---|
| 3 | depends_on と task_type のマッピングに関する指示が含まれる | `/変換\|マッピング\|mapping\|convert/i` かつ `depends_on` + `task_type` 両方存在 | 🔴 RED（実装待ち） |
| 4 | コード探索結果からタスク計画への変換手順が含まれる | `/変換\|マッピング\|mapping\|出力.*実行計画\|探索.*計画/i` | 🔴 RED（実装待ち） |

---

## 受け入れ条件 3: feature-dev が呼べない場合のフォールバック手順が明記されている

| # | テストケース | 検証パターン | 状態 |
|---|---|---|---|
| 5 | フォールバックへの言及が含まれる | `/フォールバック\|fallback/i` | ✅ PASS |
| 6 | フォールバック手順に代替動作（手動コードトレース等）が記載されている | `/フォールバック[\s\S]{0,400}(手動\|manual\|コードトレース\|既存.*フロー\|従来)/i` | ✅ PASS |
| 12 | フォールバック手順に具体的な発動条件（タイムアウト・見つからない・利用不可・空応答）が明記されている（#2099） | `/発動条件/` かつ `/(タイムアウト\|見つからない\|利用不可\|空応答)/` | ✅ PASS |
| 13 | フォールバック手順に確認手順（手動トレースのステップ・イシューコメント記録フォーマット）が明記されている（#2099） | `/確認手順/` かつ `/フォールバック発動:\s*あり/` | ✅ PASS |

---

## 受け入れ条件 4: 既存 xp フロー（サブイシュー発行・GitHub 連携）が壊れていない

| # | テストケース | 検証パターン | 状態 |
|---|---|---|---|
| 7 | サブイシュー発行の指示が存在する | `/サブイシュー.*発行\|sub.issue.*発行/i` | ✅ PASS |
| 8 | depends_on フィールドの記述が存在する | `/depends_on:/` | ✅ PASS |
| 9 | GitHub Sub-Issues API 連携の記述が存在する | `/sub_issues\|GitHub Sub-Issues\|mcp__github__sub_issue/i` | ✅ PASS |
| 10 | task_type フィールドの記述が存在する | `/task_type:\s*(e2e_test_creation\|spec_update)/` | ✅ PASS |
| 14 | フォールバック追記後も主要な処理フロー節（0・1・2・4〜7）が維持されている（#2099 回帰確認） | 各 `###` 見出しの存在確認 | ✅ PASS |

---

## SKILL.md 存在確認

| # | テストケース | 状態 |
|---|---|---|
| 11 | xp_Architect SKILL.md が存在する | ✅ PASS |

---

## 前提条件

- `/root/.claude/skills/xp_Architect/SKILL.md` が存在すること
- xp_Architect SKILL.md が有効な Markdown として読み込み可能であること

## Given/When/Then

**Given**: xp_Architect SKILL.md が `/root/.claude/skills/xp_Architect/` に存在する

**When**: E2Eテストスクリプトを実行する

**Then**:
- step 3（競合チェック手順）に feature-dev または同等のコード探索エージェント呼び出しが記述されている（AC1）
- コード探索出力から depends_on / task_type への変換ルールが明記されている（AC2）
- feature-dev が呼べない場合のフォールバック手順（発動条件・確認手順を含む、手動コードトレースへの切り替え等）が明記されている（AC3）
- 既存のサブイシュー発行・GitHub 連携フローが損なわれていない（AC4）

## テスト実行状況

実装前（TDD RED 状態、#1381 時点）: 5 RED / 6 GREEN
#2098（SKILL.md step3 改訂）後: 11 GREEN
#2099（フォールバック発動条件・確認手順の定義、回帰確認テスト追加）後: 14 GREEN（全件PASS）
