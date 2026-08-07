# Unit Tests: xp_RunE2ETests のテストランナー自動判定ロジック

**テストファイル**: `SoloXP/tests/unit/issue-1680-rune2etests-runner-autodetect.unit.test.js`
**対応イシュー**: #1680（バグ再現テスト追加）/ #1681（修正実装）/ 親バグ: #1293

## テスト対象

`xp_RunE2ETests` SKILL.md（3箇所: `.claude/skills/`, `SoloXP/skills/`, `dotfiles/.claude/skills/`）に、
`package.json` の `test:e2e` スクリプトが Jest ベース（Playwright を含まない）の場合に
Vercel/localhost への疎通チェックをスキップする分岐ロジックが記載されていることを検証する。

`SoloXP/tests/e2e/` は Jest ベースで HTTP 通信を行わないにもかかわらず、
#1680 時点の SKILL.md は Playwright 前提の疎通チェックフローのみで分岐ロジックが存在せず RED だった。
#1681 で3箇所の SKILL.md に「テストランナーを判定する」ステップ（playwright/jest 判定 → jest の場合は疎通チェックをスキップ）が追加され、GREEN化した。

## テストケース一覧

`describe.each` で3箇所の SKILL.md それぞれに対して以下を検証する：

| テスト名 | 種別 | 検証内容 |
|---|---|---|
| `package.json の test:e2e スクリプト内容を確認する記述がある` | 既存記述確認 | `test:e2e` という文字列が SKILL.md に存在すること（PASS） |
| `test:e2e が playwright を含む場合は従来の疎通チェックフローを使うと記載されている` | 既存記述確認 | `playwright` という文字列が存在すること（PASS） |
| `test:e2e が jest を含む（playwright を含まない）場合は疎通チェックをスキップすると記載されている` | 正常系（修正確認） | `jest` および `疎通チェックをスキップ` の記述が存在すること（PASS） |

## カバレッジサマリー

- 9件 PASS（3 SKILL.md × 3件）／FAIL 0件

## 実行方法

```bash
cd SoloXP && npm test -- --testPathPattern="issue-1680"
```

## 備考

このテストは `bug_reproduction_test` タスク (#1680) で作成され、#1680 完了時点では意図的に RED（3件 FAIL）だった。
修正タスク #1681（`xp_RunE2ETests` への分岐ロジック追加）の実装により、3箇所すべての SKILL.md に
jestランナー判定・疎通チェックスキップの記述が追加され、本テストは全件GREENになった（#1681 で確認済み）。
