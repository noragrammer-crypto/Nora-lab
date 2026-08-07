# Unit Tests: E2Eテストファイルにおける process.exit 禁止チェック

**テストファイル**: `SoloXP/__tests__/issue-613-no-process-exit-in-tests.unit.test.js`
**対応イシュー**: #616（バグ再現テスト、親バグ: #613）

## テスト対象

`SoloXP/tests/e2e/` 配下の全テストファイルが Jest と互換性のある失敗メカニズムを使用していることを検証する。
`process.exit()` の使用は Jest ワーカークラッシュ → 他スイートの連鎖失敗を引き起こすため禁止。

## テストケース一覧

### ファイル存在確認

| テスト名 | 種別 | 検証内容 |
|---|---|---|
| `tests/e2e/ ディレクトリにテストファイルが存在する` | 正常系 | E2E テストディレクトリにファイルが1件以上ある |
| `issue-274テストファイルが存在する` | 正常系 | `issue-274-story-close-on-allgreen.test.js` が存在する |

### process.exit 検出（バグ再現）

| テスト名 | 種別 | 検証内容 |
|---|---|---|
| `process.exit を含むファイルのリストが正確に取得できる` | 回帰防止 | E2E テストファイルに `process.exit` が存在しないこと（修正前は RED） |

## カバレッジサマリー

- 正常系: 2件
- 回帰防止: 1件

## 実行方法

```bash
cd SoloXP && npx jest --no-coverage --testPathPatterns="issue-613"
```

## 備考

このテストはバグ #613 の再現テストとして作成された。  
**修正前（バグ存在時）**: `process.exit を含むファイル` テストが RED（6ファイル検出）  
**修正後（#617 完了）**: 全テストが GREEN（3件 PASS）✅

検出対象パターン: `/process\.exit\s*\(/` （1行マッチ）

修正対象ファイル（#617 で対応済み）:
- `issue-243-sub-issue-reporting.test.js` line 136
- `issue-254-workflow-update.test.js` line 175
- `issue-274-story-close-on-allgreen.test.js` line 158
- `issue-397-process-issue-commands.test.js` line 208
- `issue-579-kakuyomu-post-web.test.js` line 219
- `issue-582-label-skip-workflow.test.js` line 184
