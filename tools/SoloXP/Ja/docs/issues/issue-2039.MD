---
issue: 2039
title: "[Task] spec/README.md の dangling link 修正 + novel_generator_run.md 新規作成"
state: open
labels: [task, epic/SoloXP]
author: noragrammer-crypto
created_at: 2026-07-14T00:08:37Z
epic: SoloXP
---

# #2039 [Task] spec/README.md の dangling link 修正 + novel_generator_run.md 新規作成

## 本文

## 概要

バグ #1364 の修正。`SoloXP/docs/spec/README.md` に `novel_generator_run.md` へのリンクが存在するが、ファイルが存在しない（dangling link）。

### 修正内容

1. **再現テスト追加**: `SoloXP/tests/unit/issue-1364-spec-readme-link-integrity.unit.test.js` を作成し、`spec/README.md` に記載された全リンク先ファイルの存在を検証する
2. **ファイル新規作成**: `SoloXP/docs/spec/novel_generator_run.md` を作成して NovelGeneratorRun スキルの仕様を記述する（`.claude/skills/NovelGeneratorRun/SKILL.md` を参照）

### 実装ガイダンス

再現テストのパターン（既存テストを参照）:

```js
// SoloXP/tests/unit/issue-1364-spec-readme-link-integrity.unit.test.js
const fs = require('fs');
const path = require('path');

const SPEC_DIR = path.resolve(__dirname, '../../docs/spec');
const README = path.join(SPEC_DIR, 'README.md');

test('spec/README.md に記載された全 .md ファイルへのリンクが実在する', () => {
  const content = fs.readFileSync(README, 'utf-8');
  const links = [...content.matchAll(/\[.*?\]\((\S+?\.md)\)/g)].map(m => m[1]);
  for (const link of links) {
    const fullPath = path.join(SPEC_DIR, link);
    expect(fs.existsSync(fullPath)).toBe(true); // fails for novel_generator_run.md until fix
  }
});
```

`novel_generator_run.md` の内容は `.claude/skills/NovelGeneratorRun/SKILL.md` を基に SoloXP spec 形式で記述する。

## 見積もり

2pt — 再現テスト作成 + spec ファイル新規作成

## 依存関係

なし（即着手可能）

## 親ストーリー

#1364

## 親ブランチ

feature/issue-1364

## コメント

### noragrammer-crypto — 2026-07-14T12:02:00Z

## 観測可能変更チェック（[Task]スキップ判定）

対象: #2039
観測可能な振る舞いの変更: なし
理由: spec ファイルの新規作成（novel_generator_run.md）と README.md のリンク整合性を確認するユニットテストの追加。API/UI/エンドポイントの変更を伴わない、ドキュメント層のみの変更。Architect スキップ。

---

作業開始 2026-07-14 12:02
セッションURL: https://claude.ai/code/session_01Dz2QBf97v1NfP2E16fBQng
[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-07-14T12:10:00Z

[Auditor GREEN]
PASS: 233件（Unit 183 + Functional 50）

- 単体テスト: PASS 183件 / FAIL 0件（全18スイート GREEN）
- 機能テスト: PASS 50件 / FAIL 0件

novel_generator_run.md の存在を確認。dangling link 解消済み。

作業完了 2026-07-14 12:10 / 所要時間: 8分

---
