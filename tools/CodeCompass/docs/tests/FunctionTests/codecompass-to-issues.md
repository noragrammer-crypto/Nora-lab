# codecompass-to-issues Functional Tests

テストファイル: `CodeCompass/__tests__/functional/codecompass-to-issues.functional.test.js`

対象機能: `createIssues` (GitHub Issue 自動発行フロー)

---

## テストシナリオ

| # | シナリオ | 検証ポイント |
|---|---------|------------|
| 1 | dry-run モードで proposals 一覧を返し、Issue を発行しない | `gh issue create` が呼ばれないこと・返り値が配列であること |
| 2 | `--limit=3` で上位3件のみ対象にする | 返り値の長さが 3 件であること |
| 3 | `gh issue create` 呼び出し時にラベル `refactoring,codecompass-detected` を渡す | `execSync` に渡されるコマンド文字列を検証 |
| 4 | actions.md が存在しない場合に空配列を返す | `parseActionsMd('')` が `[]` を返すこと |

---

## テストデータ

`SAMPLE_PROPOSALS`: 6件のリファクタリング候補（`DiscordAIbot/lib/persona.js` 他）

`child_process.execSync` を `jest.spyOn` でモック化し、`ghCalls` 配列に記録する。

---

## 依存関係

- `child_process.execSync` — `gh issue create` の発行コマンドを検証するためモック化
