# Unit Test: issue-3484 find-stale-issue-archives

対象ファイル: `SoloXP/tests/unit/issue-3484-find-stale-issue-archives.unit.test.js`
検証対象: `SoloXP/scripts/find-stale-issue-archives.sh`

## 背景

`<EpicName>/docs/issues/issue-*.MD`（`xp_issue2md` が生成するIssue Markdownスナップショット）は
取得時点の状態を保存するだけで、GitHub上で後からcloseされてもfront matterの `state` は自動更新
されない（#2971）。finalize処理の第一段階として、`state: open` のまま再確認が必要な候補issue番号を
決定的に抽出するスクリプト `find-stale-issue-archives.sh` を新規作成した（#3484）。GitHub APIへの
問い合わせ（実際のclosed判定・再生成）はスクリプトの責務外とし、`xp_issueArchiveFinalize` スキル側
（LLM駆動、gh/MCPフォールバック）に委ねる。

## テストケース

1. スクリプトファイルが存在し実行可能（実行権限付き）である
2. `state: open` のファイルのissue番号のみを抽出する（`state: closed` は除外）
3. `docs/issues` ディレクトリが存在しない場合は空を返す（エラーにしない）
4. 候補が1件も無い場合（全て `state: closed`）は空を返す
5. `issue-*.MD` 以外のファイル（`README.md` 等）が混在していても無視する
6. 末尾スラッシュ付きのEpicDirを渡しても同じ結果になる（`SampleEpic` と `SampleEpic/` が同一結果）
7. EpicDir引数省略時はUsageを表示して非ゼロ終了する

## 実行結果

- 実装前（バグ再現時点）: PASS 0件 / FAIL 6件（スクリプト不在によりコマンド実行自体が失敗。1件のみ
  ファイル存在チェックのFAILとして事前に検出）
- 実装後: PASS 7件 / FAIL 0件（GREEN）
- 関連回帰確認: `SoloXP/tests/unit` 全体41スイート（PASS 318件）
