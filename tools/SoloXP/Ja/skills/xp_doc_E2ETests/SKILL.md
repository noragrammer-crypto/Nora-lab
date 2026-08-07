---
model: claude-sonnet-4-6
---

# XP Doc E2ETests Skill

## コマンド

### `xp_doc_E2ETests <epic_name>`

E2ETestドキュメントを生成・更新する。

---

## 処理フロー

### 1. テストコードを走査

エピックのE2Eテストディレクトリを特定して全件読む。`api/` 配下は Vercel Function のエントリポイント専用であり、テスト・ドキュメントはエピックのルートディレクトリに置く（リポジトリ構成規約。`api/<EpicName>/` 固定パスではない）。

- `<EpicName>/tests/e2e/` または `<EpicName>/__tests__/e2e/` のうち実在する方を使う
- どちらも存在しない場合は、xp_E2Etest が実際に作成したディレクトリに合わせる

### 2. ドキュメントを生成・更新

- 既存 `<EpicName>/docs/tests/E2ETests/` と比較する
- 変更があったシナリオのドキュメントを更新する

---

## アウトプット

`<EpicName>/docs/tests/E2ETests/<ユーザーシナリオ名>.md`

ドキュメントの内容：
- ユーザーシナリオ概要
- Given/When/Thenステップ
- 前提条件

---

## 注意事項

- テストコードが正。テストドキュメントを元にテストを変更しない
