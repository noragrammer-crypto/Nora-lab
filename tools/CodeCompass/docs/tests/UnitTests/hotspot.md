# Unit Test: lib/hotspot.js

テストファイル: `CodeCompass/__tests__/unit/hotspot.unit.test.js`

## テスト対象

`lib/hotspot.js` — 変更頻度データと複雑度データを統合してホットスポットスコアを算出する純粋関数群

## テストケース一覧

### mergeData

| # | テストケース | 種別 |
|---|------------|------|
| 1 | ファイル名で変更頻度データと複雑度データを結合する | 正常系 |
| 2 | 変更頻度データに存在しないファイルは changes=0, linesChanged=0 として扱う | 正常系 |
| 3 | 複雑度データが空の場合は空配列を返す | 異常系 |
| 4 | 両方が空の場合は空配列を返す | 異常系 |

### computeHotspotScores

| # | テストケース | 種別 |
|---|------------|------|
| 5 | (changes × complexity) / loc で hotspotScore を算出しスコア降順でソートする | 正常系 |
| 6 | LOC が 0 のファイルは hotspotScore = 0 とする（ゼロ除算回避） | 異常系 |
| 7 | complexity が 0 のファイルは hotspotScore = 0 とする | 正常系 |
| 8 | changes が 0 のファイルは hotspotScore = 0 とする | 正常系 |
| 9 | 出力に file, hotspotScore, complexity, changes, loc, linesChanged フィールドが含まれる | 正常系 |
| 10 | 空配列に対しては空配列を返す | 異常系 |

## カバレッジサマリー

| 関数 | テスト数 | 状態 |
|------|---------|------|
| `mergeData` | 4 | ✅ |
| `computeHotspotScores` | 6 | ✅ |
| `analyzeHotspots` | — | (git・ファイルシステム依存のため E2E で検証) |

合計: 10件 — 全 GREEN

## 設計メモ

`analyzeHotspots` は `execFileSync`（git）とファイルシステム走査に依存するため、
ユニットテストでは対象外とし、配列の入出力のみで完結する純粋関数
（`mergeData` / `computeHotspotScores`）を検証する。
git・ファイルシステムを含む統合的な検証は機能テスト（CLI）と E2E テスト（`hotspot.e2e.test.js`）が担当する。
