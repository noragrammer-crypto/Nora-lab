# Issue #2741: [Bug] issue-2168 Story E2E AC4: docs/skill-files-sync.md の「dotfiles」→「生成物」の記載距離が正規表現の許容範囲(40文字)を超えている

- URL: https://github.com/noragrammer-crypto/HolyAutomater/issues/2741
- 親ストーリー: #2168
- 親ブランチ: feature/issue-2168

## 概要

Story #2168 の受け入れテスト `SoloXP/tests/e2e/issue-2168-soloxp-canonicalization-nora-lab-pipeline.test.js` のAC4セクション、以下のテストがRED:

```
dotfiles/.claude・.claude/skills がバイナリ（生成物）であると明記されている
expect(syncDoc).toMatch(/dotfiles.{0,40}(バイナリ|生成物)/);
```

`docs/skill-files-sync.md` 17行目:
```
`dotfiles/.claude/skills/` と `.claude/skills/` はいずれも**正本からの生成物であり、直接編集しない**
```

「dotfiles」から「生成物」までの距離が50文字あり、テストの許容範囲（40文字）を超えているためマッチしない。

## 対応内容

`docs/skill-files-sync.md` 17行目を、意味を変えずに「dotfiles」から「生成物」までの距離が40文字以内に収まるよう書き換えた：

```diff
-`dotfiles/.claude/skills/` と `.claude/skills/` はいずれも**正本からの生成物であり、直接編集しない**
+`dotfiles/.claude/skills/`・`.claude/skills/` は**生成物（正本のコピー）であり、直接編集しない**
```

回帰防止として `SoloXP/tests/unit/issue-2741-skill-files-sync-doc-regex-distance.unit.test.js` を追加した。

## テスト結果

- Story E2E（`issue-2168-soloxp-canonicalization-nora-lab-pipeline.test.js`）: 20 passed / 1 skipped / 0 failed（RED → GREEN）
- `SoloXP/tests/unit` 全体: PASS 142件 / FAIL 0件（新規2件含む）
- `SoloXP/tests/functional` 全体: PASS 37件 / FAIL 0件
- `SoloXP/tests/e2e` 全体: 11 passed / 3 failed（issue-1461・issue-1410・issue-254は本タスク無関係の既存デグレード、先行タスク群のコメントで既知）
