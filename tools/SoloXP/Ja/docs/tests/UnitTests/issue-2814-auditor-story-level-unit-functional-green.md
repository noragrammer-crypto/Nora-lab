# issue-2814-auditor-story-level-unit-functional-green ユニットテスト

## テスト対象

`SoloXP/skills/xp_Auditor/SKILL.md`、`SoloXP/docs/spec/xp_auditor.md`

xp_Auditor の Story-level Auditor フェーズ（3節）における GREEN/RED 判定が、E2E の結果のみでなく
2節で実行した Unit + Functional テストの結果も組み込んでいることを検証する（Issue #2814 のバグ再現・
回帰防止）。修正前は E2E さえ通れば Unit/Functional に失敗があっても `[Auditor GREEN]` が記録され
得る構造的ギャップがあった。

## テストファイル

`SoloXP/tests/unit/issue-2814-auditor-story-level-unit-functional-green.unit.test.js`

## テストケース一覧

### `SKILL.md: 2節→3節の接続`

| テストケース | 種別 | 内容 |
|---|---|---|
| 2節が存在する | 正常系 | SKILL.md に `### 2. xp_RunTestSuites を実行する` セクションが存在すること |
| 2節の実行結果が3節（Story-level）の判定に組み込まれる旨が明記されている | バグ再現・回帰防止 | 2節本文に「3節」または「Story-level」への参照と「組み込む/反映/判定」のいずれかの語があること |

### `SKILL.md: Story-level Auditor フェーズセクションの抽出`

| テストケース | 種別 | 内容 |
|---|---|---|
| Story-level Auditor フェーズのセクションが存在する | 正常系 | SKILL.md に `**Story-level Auditor フェーズ` セクションが存在すること |
| GREEN の場合の条件文が Unit と Functional の両方に言及している | バグ再現・回帰防止 | GREEN 条件文に `Unit` `Functional` の両方が含まれること |
| RED の場合の対象が E2E だけでなく Unit/Functional にも言及している | バグ再現・回帰防止 | RED 条件文に `Unit` `Functional` の両方が含まれること |
| Task-level専用の6節スコープ限定注記は変更されず維持されている | 回帰確認 | 「Task-level専用」「適用されない/援用できない」の既存文言が変更後も残っていること |

### `SKILL.md: Unit/Functional合算判定の注記が所有権免除を無視しない（Codexレビュー指摘の回帰防止）`

| テストケース | 種別 | 内容 |
|---|---|---|
| Unit/Functional合算判定の注記が存在する | 正常系 | 3節冒頭の新規注記ブロックが抽出できること |
| 他ストーリー所有の非ブロック対象REDまで無条件にブロックしない旨（所有権判定への言及）が明記されている | バグ再現・回帰防止 | 注記に「所有権」および「自ストーリーが所有するブロック対象」または「他ストーリー所有」への言及があること |

### `docs/spec/xp_auditor.md: Story-level要約にUnit/Functionalへの言及がある`

| テストケース | 種別 | 内容 |
|---|---|---|
| Story-level Auditor フェーズの要約が存在する | 正常系 | 要約セクションが抽出できること |
| GREEN/RED判定がUnit+Functionalも対象に含む旨が要約に明記されている | バグ再現・回帰防止 | 要約に `Unit` `Functional` の両方が含まれること |

## 実装メモ

- 本Issue（#2814）の修正で `SoloXP/skills/xp_Auditor/SKILL.md` の 2節末尾に「結果は3節の判定に
  組み込む」接続文を追加し、3節冒頭に既存の「スコープ限定（#2784）」注記と並列の新規注記
  （Unit/Functional 合算判定）を追加した
- ステップ2（GREENの場合）の条件文を「E2E 全PASS」→「2節の Unit + Functional 総合判定と E2E
  結果の両方が対象」に拡張し、ステップ3（RED の場合）の対象を「E2Eテスト」→「Unit/Functional/E2E
  のいずれか」に拡張した。所有権ベースの非対称ブロックロジック（#2807/#2809/#2818）自体は変更していない
- `docs/spec/xp_auditor.md` の該当要約1文にも同内容を追記した。既存の `RED → バグイシューを起票し`
  という文字列（issue-2818テストが正規表現アンカーとして依存）は維持し、Unit/Functional への言及は
  その直後の括弧書きとして追加した
- 既存テスト `issue-2784-xp-auditor-story-level-scope-exemption.unit.test.js` は、本修正で3節の
  文章量が増えたことに伴い、正規表現の窓サイズを 2500 → 3200 文字に拡張した（アサーション内容自体は
  変更していない）
- 6節（Task-level専用ロジック）・見出し文言・ステップ1（E2E実行）/ステップ4（E2E実行不可）は無変更
- **Codexレビュー指摘（PR #3398, P1バッジ）への追加修正**: 初回実装時の3節冒頭の注記は
  「2節の総合判定にREDがあれば無条件にGREENと判定しない」という文面だったため、E2Eの所有権ベース
  非対称ブロック（#2807/#2809/#2818）が認めている「残存REDが全て他ストーリー所有の非ブロック対象
  ならGREEN」という例外と矛盾し、相互ロック（#2807が解消したはずの問題）を再導入しかねなかった。
  注記を「所有権判定（2./3.）を経由する」旨に修正し、この矛盾の再発を防ぐ回帰テストを追加した

## カバレッジサマリー

- 2節→3節の接続確認: 2件
- Story-level Auditor フェーズ存在確認: 1件
- GREEN/RED判定へのUnit/Functional組み込みのバグ再現検証: 2件
- 回帰確認（6節スコープ限定）: 1件
- Unit/Functional合算判定の注記が所有権免除を無視しないことの検証（Codexレビュー指摘の回帰防止）: 2件
- spec要約の検証: 2件
- 合計: 10件
