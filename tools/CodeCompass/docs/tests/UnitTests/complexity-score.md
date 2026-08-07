# Unit Test: lib/complexity-score.js

テストファイル: `CodeCompass/__tests__/unit/complexity-score.unit.test.js`

## テスト対象

`lib/complexity-score.js` — AST解析・LOC算出を担う純粋関数群（`countLines` / `countJsComplexity`）

## テストケース一覧

### countLines

| # | テストケース | 種別 |
|---|------------|------|
| 1 | 末尾改行ありの文字列は改行区切りの行数として数える | 正常系 |
| 2 | 末尾改行なしの文字列も最終行を含めて数える | 正常系 |
| 3 | 空文字列は 0 行として扱う | 異常系 |

### countJsComplexity

| # | テストケース | 種別 |
|---|------------|------|
| 4 | 制御フロー文を含まないコードは複雑度 0 になる | 正常系 |
| 5 | if/for/while/switch をそれぞれ1個としてカウントする | 正常系 |
| 6 | else 節・case/default 節は派生節のため二重カウントしない（else-if は別の if として数える） | 正常系 |
| 7 | for-in / for-of / do-while も制御フローとしてカウントする | 正常系 |

## カバレッジサマリー

| 関数 | テスト数 | 状態 |
|------|---------|------|
| `countLines` | 3 | ✅ |
| `countJsComplexity` | 4 | ✅ |
| `walkAst` | — | (`countJsComplexity` 経由で間接的に検証) |
| `countPythonComplexities` | — | (`python3` サブプロセス依存のため機能テスト・E2E で検証) |
| `analyzeComplexity` | — | (ファイルI/O・サブプロセス依存のため機能テスト・E2E で検証) |

合計: 7件 — 全 GREEN

## 設計メモ

`countPythonComplexities` / `analyzeComplexity` はファイル I/O・`python3` サブプロセス起動を伴うため、
ユニットテストでは対象外とし、文字列入出力のみで完結する純粋関数（`countLines` / `countJsComplexity`）を検証する。
`walkAst` は ESTree 形式 AST の汎用ウォーカーであり、`countJsComplexity` のテストケースを通じて
網羅的に経路検証される（独立したテストケースは設けない）。
ファイルI/O・サブプロセスを含む統合的な検証は機能テスト（CLI）と E2E テスト（#1184）が担当する。
