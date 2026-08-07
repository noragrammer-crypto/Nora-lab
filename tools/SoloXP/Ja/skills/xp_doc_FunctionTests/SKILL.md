---
model: claude-sonnet-4-6
---

# XP Doc FunctionTests Skill

## コマンド

### `xp_doc_FunctionTests <epic_name>`

FunctionalTestドキュメントを生成・更新する。

---

## 処理フロー

### 1. 対象ディレクトリを決定する

以下の優先順位でスキャン対象を決定する（複数該当する場合は先に見つかった優先度を採用しつつ、
他の層で実在するテストファイルも取りこぼさないよう全パターンを確認する）：

| 優先度 | スキャン対象 |
|--------|------------|
| 1（優先・後方互換） | `api/<EpicName>/tests/functional/` |
| 2 | `<EpicName>/tests/functional/` |
| 3 | `<EpicName>/__tests__/functional/` |
| 4（フラット配置） | `<EpicName>/__tests__/` 直下のうち、ファイル名に `.functional.test.*` または `_functional.py`（`_functional_test.py` 等の慣習も含む）を含むファイル |

ドキュメント出力先は常に `<EpicName>/docs/tests/FunctionTests/`（`api/<EpicName>/` を使った場合は `api/<EpicName>/docs/tests/FunctionTests/`）とする。

### 2. テストコードを走査

決定したスキャン対象のテストコードを全件読む。

### 3. ドキュメントを生成・更新

- 決定したドキュメント出力先の既存ドキュメントと比較する
- 変更があった機能のドキュメントを更新する

---

## アウトプット

決定したドキュメント出力先に `<機能名>.md` を生成する。

ドキュメントの内容：
- テスト対象機能
- シナリオ一覧
- テストデータ説明

---

## 注意事項

- テストコードが正。テストドキュメントを元にテストを変更しない
- HolyAutomater 内には `<Epic>/__tests__/functional/`（CodeCompass 等）、`<Epic>/tests/functional/`（SoloXP）、
  `<Epic>/__tests__/` 直下フラット配置（m4a2md・modal・hermes 等）の3系統が混在するため、
  該当エピックで実際に使われている配置を確認してから走査する
