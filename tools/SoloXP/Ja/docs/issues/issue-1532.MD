---
issue: 1532
title: "[Enhancement] xp_doc_spec/UnitTests/FunctionTests/E2ETests が api/<EpicName>/ 固定パスのみ対応で非apiエピックのspec/testドキュメント生成が機能しない"
state: open
labels: [enhancement]
author: noragrammer-crypto
created_at: 2026-06-20T03:20:22Z
epic: SoloXP
---

# #1532 [Enhancement] xp_doc_spec/UnitTests/FunctionTests/E2ETests が api/<EpicName>/ 固定パスのみ対応で非apiエピックのspec/testドキュメント生成が機能しない

## 本文

## 発見経緯

#1528（CodeCompass テストディレクトリ統一）の Documenter ステップで `xp_doc_spec` の対象を確認したところ、「`spec/` ディレクトリが存在しないため対象外」と誤判定した。実際には `CodeCompass/docs/spec/` が存在しており、誤判定の原因はスキル側のパス前提にあった。

## 問題

`dotfiles/.claude/skills/` 配下の以下4スキルが、ドキュメント出力先・スキャン対象を `api/<EpicName>/...` に固定している：

| スキル | 該当箇所 |
|---|---|
| `xp_doc_spec` | `api/<EpicName>/docs/spec/README.md` 等 |
| `xp_doc_UnitTests` | `api/<EpicName>/tests/unit/`、`api/<EpicName>/docs/tests/UnitTests/` |
| `xp_doc_FunctionTests` | `api/<EpicName>/tests/functional/`、`api/<EpicName>/docs/tests/FunctionTests/` |
| `xp_doc_E2ETests` | `api/<EpicName>/tests/e2e/`、`api/<EpicName>/docs/tests/E2ETests/` |

しかし HolyAutomater は `api/` 配下が Vercel Function のエントリポイントのみを置くモノレポ構成（CLAUDE.md 参照）であり、ソース・テスト・ドキュメントは各エピックのルート直下（例: `CodeCompass/docs/spec/`、`CodeCompass/__tests__/`）に置かれる。`api/<EpicName>/` が存在しないエピック（CodeCompass・SocialMediaAgent・workflow 等の大半）では、これら4スキルが対象ディレクトリを誤検出し、ドキュメントが存在するにも関わらず「存在しない」と誤判定したり、本来更新すべきドキュメントを生成しないまま完了してしまう。

## 参考: 既に対応済みのスキル

`xp_doc_reference` は同じ問題に対して優先順位付きフォールバックで対応している：

```
1（優先）: api/<EpicName>/ が存在する場合 → api/<EpicName>/docs/reference/
2: <EpicName>/scripts/ が存在する場合 → <EpicName>/docs/reference/
3（フォールバック）: <EpicName>/ 直下の *.js/*.py → <EpicName>/docs/reference/
```

## 修正方針

`xp_doc_spec` / `xp_doc_UnitTests` / `xp_doc_FunctionTests` / `xp_doc_E2ETests` の4スキルに、`xp_doc_reference` と同様の優先順位付きパス解決ロジックを追加する。

## 影響範囲

- `dotfiles/.claude/skills/xp_doc_spec/SKILL.md`
- `dotfiles/.claude/skills/xp_doc_UnitTests/SKILL.md`
- `dotfiles/.claude/skills/xp_doc_FunctionTests/SKILL.md`
- `dotfiles/.claude/skills/xp_doc_E2ETests/SKILL.md`

## 関連イシュー

#1528（発見元タスク）
#1531（このスキル不備が直接の実害につながった具体的バグ）

## コメント

### noragrammer-crypto — 2026-07-28T22:51:21Z

## 既存実装との競合チェック（手動トレース）

対象: #1532

フォールバック発動: あり
発動理由: 対象がアプリケーションコードではなく Claude Skill 定義ファイル（`dotfiles/.claude/skills/*/SKILL.md`）であり、`code-architect` サブエージェントが通常想定する codebase 構造探索の対象外と判断したため、手動トレースを直接実施した。

**Patterns & Conventions Found:**
- `xp_doc_reference` が既に優先順位付きフォールバックを実装済み
- `xp_doc_E2ETests` は本イシュー報告時点から既に別修正で `api/<EpicName>/` 固定パスを脱しており、`<EpicName>/tests/e2e/` または `<EpicName>/__tests__/e2e/` の実在する方を使う2択フォールバックに変わっている（未着手なのは `xp_doc_spec` / `xp_doc_UnitTests` / `xp_doc_FunctionTests` の3ファイルのみ）
- 実リポジトリの実態調査（CodeCompass / SocialMediaAgent / workflow / DiscordAIbot / DiscordBotDashboard）: `api/<EpicName>/tests/...` や `api/<EpicName>/docs/spec/` は現存するどのエピックにも存在しない

**Architecture Decision:**
`xp_doc_spec` / `xp_doc_UnitTests` / `xp_doc_FunctionTests` の3スキルに、`xp_doc_reference` と同型の優先順位付きフォールバックを追加する。
`xp_doc_E2ETests` は対応済みのためスコープ外（変更不要）。

競合の有無: なし（既存パターンの延長線上の変更）

---

### noragrammer-crypto — 2026-07-28T22:51:31Z

## E2E/spec 要否判定（Task）

対象: #1532
イシュー種別: Task（単一の実装パターンを3ファイルに機械的に適用する単発修正のため、Storyへの分解は不要と判断）
観測可能な振る舞いの変更: あり
追加タスク: なし

理由: 変更対象は Claude Skill の指示書（`SKILL.md`）自体であり、アプリケーションコードのような自動テスト（jest等）インフラが存在しない領域。かつ `xp_doc_reference` に既に同型の実装パターンが存在し、`xp_doc_E2ETests` も別修正で同種のフォールバックへ移行済み。新規の設計判断を要さない機械的な横展開のため、独立した E2Eテストスイート作成タスク・機能仕様書更新タスクは発行せず、本イシュー（#1532）を単一のTaskとしてそのまま直接実装する。受け入れ判定は `xp_Auditor doc` で行う。

親ブランチ: なし（ルートタスクとして `--base main` でPRを発行する）

---

### noragrammer-crypto — 2026-07-28T22:51:42Z

作業開始 2026-07-29 07:51 JST
[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-07-28T22:51:53Z

[Tester実行中]

## テスト実行結果

対象: `dotfiles/.claude/skills/xp_doc_spec/SKILL.md`, `dotfiles/.claude/skills/xp_doc_UnitTests/SKILL.md`, `dotfiles/.claude/skills/xp_doc_FunctionTests/SKILL.md`（および `SoloXP/skills/` 配下の同名ミラー）

判定: ドキュメントのみの変更（Claude Skill 指示書=Markdown。実行可能なアプリケーションコードを含まない）
処理: 全層スキップ（テスト対象コードなし）

[Tester完了]

---

### noragrammer-crypto — 2026-07-28T22:52:00Z

[Implementer実行中]

---

### noragrammer-crypto — 2026-07-28T22:53:06Z

## 実装完了

`xp_doc_reference` / 修正済み `xp_doc_E2ETests` と同型の優先順位付きフォールバック（1. `api/<EpicName>/` 優先＝後方互換 → 2. `<EpicName>/` 直下）を、以下3スキル × 3コピー（計9ファイル）に追加した：

- `SoloXP/skills/xp_doc_spec/SKILL.md`, `xp_doc_UnitTests/SKILL.md`, `xp_doc_FunctionTests/SKILL.md`
- `.claude/skills/` 配下同名3ファイル
- `dotfiles/.claude/skills/` 配下同名3ファイル

テスト結果: 単体・機能テストとも対象外（ドキュメントのみの変更）

[Implementer完了]

---

### noragrammer-crypto — 2026-07-28T22:53:31Z

[Auditor テスト実行中]

差分レビュー結果:
- `api/<EpicName>/` 優先 → `<EpicName>/` 直下フォールバックの2段階ロジックが3スキル共通で正しく追加されている
- フォールバック先パスは既存の `xp_doc_reference` の設計思想および実リポジトリの実態調査結果と一致している
- 3コピーがバイト単位で一致していることを確認済み
- 既存の `api/<EpicName>/` 優先パスは維持されており後方互換性あり

[Auditor GREEN]
根拠: ドキュメントのみの変更のため自動テストは対象外。差分レビューにより意図通りの実装であることを確認した。

---

### noragrammer-crypto — 2026-07-28T22:53:40Z

作業完了 2026-07-29 07:53 JST / 所要時間: 2分

---
