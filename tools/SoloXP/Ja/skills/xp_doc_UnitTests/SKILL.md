---
model: claude-sonnet-4-6
---

# XP Doc UnitTests Skill

## コマンド

### `xp_doc_UnitTests <epic_name>`

UnitTestドキュメントを生成・更新する。

---

## 処理フロー

### 1. 対象ディレクトリを決定する

以下の優先順位でスキャン対象を決定する（複数該当する場合は先に見つかった優先度を採用しつつ、
他の層で実在するテストファイルも取りこぼさないよう全パターンを確認する）：

| 優先度 | スキャン対象 |
|--------|------------|
| 1（優先・後方互換） | `api/<EpicName>/tests/unit/` |
| 2 | `<EpicName>/tests/unit/` |
| 3 | `<EpicName>/__tests__/unit/` |
| 4（フラット配置） | `<EpicName>/__tests__/` 直下のうち、ファイル名に `.unit.test.*` または `_unit.py`（`_unit_test.py` 等の慣習も含む）を含むファイル |

ドキュメント出力先は常に `<EpicName>/docs/tests/UnitTests/`（`api/<EpicName>/` を使った場合は `api/<EpicName>/docs/tests/UnitTests/`）とする。

### 2. テストコードを走査

決定したスキャン対象のテストコードを全件読む。

### 3. ドキュメントを生成・更新

- 決定したドキュメント出力先の既存ドキュメントと比較する
- 変更があったモジュールのドキュメントを更新する

---

## アウトプット

決定したドキュメント出力先に `<モジュール名>.md` を生成する。

ドキュメントの内容：
- テスト対象モジュール・関数
- テストケース一覧（正常系/異常系）
- カバレッジサマリー

---

## 注意事項

- テストコードが正。テストドキュメントを元にテストを変更しない
- HolyAutomater 内には `<Epic>/__tests__/unit/`（CodeCompass 等）、`<Epic>/tests/unit/`（SoloXP）、
  `<Epic>/__tests__/` 直下フラット配置（m4a2md・modal・hermes 等）の3系統が混在するため、
  該当エピックで実際に使われている配置を確認してから走査する
