# issue-2818-auditor-closed-parent-ownership ユニットテスト

## テスト対象

`SoloXP/skills/xp_Auditor/SKILL.md`、`SoloXP/docs/spec/xp_auditor.md`

xp_Auditor の Story-level Auditor フェーズにおける所有権ベースの非対称ブロックロジックに、
既存バグイシューの親ストーリーが**クローズ済み**の場合の扱いが明記されていることを検証する
（Issue #2818 のバグ再現・回帰防止）。クローズ済みの親は「親未設定」と同様に扱い、
`replace_parent: true` で現ストーリーが所有権を再取得してブロックする。

## テストファイル

`SoloXP/tests/unit/issue-2818-auditor-closed-parent-ownership.unit.test.js`

## テストケース一覧

### `SKILL.md: Story-level Auditor フェーズセクションの抽出`

| テストケース | 種別 | 内容 |
|---|---|---|
| Story-level Auditor フェーズのセクションが存在する | 正常系 | SKILL.md に `**Story-level Auditor フェーズ` セクションが存在すること |
| 「既に別の親に紐付いている場合」分岐が存在する | 正常系 | 当該分岐のテキストが抽出できること |
| 親ストーリーが「クローズ済み」の場合の扱いが明記されている | バグ再現・回帰防止 | 分岐内に「クローズ済み」の文言があること |
| クローズ済み親の場合、所有権の再取得（`replace_parent: true`）が明記されている | バグ再現・回帰防止 | 「クローズ済み」記述の直後に `replace_parent: true` があること |
| クローズ済み親の場合、現ストーリーは「ブロックする」（＝ストーリー継続・クローズしない）ことが明記されている | バグ再現・回帰防止 | 「クローズ済み」記述の近傍に「ストーリーは継続（クローズしない）」があること |
| オープンな親の場合の既存の「ブロックしない」文言は引き続き残っている | 回帰確認 | 「他のオープンなストーリー」「ブロックしない」の既存文言が変更後も残っていること |

### `docs/spec/xp_auditor.md: 所有権ベースブロックの要約`

| テストケース | 種別 | 内容 |
|---|---|---|
| 親ストーリーがクローズ済みの場合の扱いが要約に明記されている | バグ再現・回帰防止 | 所有権ベース非対称ブロックの要約行に「クローズ済み」「replace_parent: true」が含まれること |

## 実装メモ

- 本Issue（#2818）の修正で `SoloXP/skills/xp_Auditor/SKILL.md` の「既に別の親（他のストーリー等）に
  紐付いている場合」分岐を、親ストーリーの状態確認手順を挟んで「オープン」「クローズ済み」の
  2小分岐に分割した。クローズ済みの場合は「親が未設定の場合」と同様の扱い（所有権再取得・ブロック）
  とし、`replace_parent: true` を明記した
- `docs/spec/xp_auditor.md` の要約1文にも同内容を追記した
- 既存テスト `issue-2807-auditor-story-level-ownership-block.unit.test.js` および
  `issue-2784-xp-auditor-story-level-scope-exemption.unit.test.js` は、本修正で対象セクションの
  文章量が増えたことに伴い、正規表現の窓サイズ（マッチ許容文字数）を拡張した
  （アサーション内容自体は変更していない）

## カバレッジサマリー

- Story-level Auditor フェーズ存在確認: 2件
- クローズ済み親ケースのバグ再現検証: 3件
- 回帰確認（オープン親ケース）: 1件
- spec要約の検証: 1件
- 合計: 7件
