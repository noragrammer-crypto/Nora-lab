# find-stale-issue-archives.sh

## 概要

`<EpicDir>/docs/issues/issue-*.MD`（`xp_issue2md` が生成するIssue Markdownスナップショット）のうち、
front matter が `state: open` のままの候補ファイルのissue番号を列挙する。GitHub APIへの問い合わせは
一切行わない、決定的なファイルシステム走査のみのスクリプト。

`xp_issueArchiveFinalize` スキル（`SoloXP/skills/xp_issueArchiveFinalize/SKILL.md`）から呼び出される。

## 使用例

```bash
SoloXP/scripts/find-stale-issue-archives.sh <EpicDir>
```

`<EpicDir>` は `<EpicName>` のディレクトリパス（例: `SoloXP`）。末尾スラッシュの有無は結果に影響しない。

## パラメータ

| 引数 | 必須 | 説明 |
|---|---|---|
| `$1`（EpicDir） | 必須 | 走査対象のEpicディレクトリ。省略時はUsageを表示して非ゼロ終了する |

## 戻り値・出力

- 標準出力: 候補issue番号（front matter `issue:` の値）を1行1件で出力する
- `<EpicDir>/docs/issues` が存在しない場合、または `state: open` の候補が0件の場合は何も出力せず
  正常終了（exit 0）する
- `issue-*.MD` 以外のファイルは無視する

## 依存関係

- 外部コマンド: `grep`、`sed`（POSIX標準相当。追加インストール不要）
- GitHub API・`gh` CLI への依存なし
