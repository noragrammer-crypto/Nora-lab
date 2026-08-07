'use strict';

/**
 * E2E Acceptance Tests: Story #1179
 * CodeCompass: 依存グラフ生成（CodeGraph統合）
 *
 * 受け入れ条件:
 * 1. CodeGraph を使って JS/Python コードの caller/callee 依存関係を解析できる
 * 2. ホットスポット上位ファイルのみを対象に依存グラフを生成できる（全件展開はしない）
 * 3. 依存グラフを Mermaid 形式（codecompass/dependency-graph.mmd）で出力できる
 *
 * スクリプトの想定インターフェース（実装タスク #1206 が満たすべき契約）:
 *   node CodeCompass/scripts/dependency-graph.js <repoPath>
 *     [--hotspots=<path>] [--topN=<n>] [--out=<path>] [--maxDepth=<n>]
 *
 *   - hotspots.json を読み込んでスコア上位 topN（デフォルト20%）のファイルを抽出する
 *   - CodeGraph を使って抽出したファイルの caller/callee 依存関係を解析する
 *   - 依存関係を Mermaid graph LR 形式で出力する
 *   - --out 省略時はカレントディレクトリ配下の codecompass/dependency-graph.mmd に出力する
 *
 *   出力例:
 *     graph LR
 *       A["lib/hotspot.js"] -->|calls| B["lib/change-frequency.js"]
 *       A -->|calls| C["lib/complexity-score.js"]
 *
 * 実装が存在しない現時点では RED が正しい状態。
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const SCRIPT_PATH = path.join(ROOT, 'scripts', 'dependency-graph.js');

/**
 * 関数呼び出し関係が既知の一時リポジトリを構築する。
 *
 * ファイル構成（hotspotScore 降順）:
 *   caller.js:    greet() を使用（score=1.0、最上位）
 *   callee.js:    greet() を定義（score=0.5）
 *   unrelated.js: 独立したファイル（score=0.1）
 *   low1〜5.js:   ダミーファイル（score=0.0）
 *
 * topN=1 指定時は caller.js のみが分析対象になるため、
 * low1-5.js はグラフに含まれないことを検証できる。
 */
function buildFixtureRepo() {
  const repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codecompass-depgraph-'));

  fs.writeFileSync(path.join(repoDir, 'caller.js'), [
    "const { greet } = require('./callee');",
    'function main() {',
    "  return greet('World');",
    '}',
    'module.exports = { main };',
  ].join('\n') + '\n');

  fs.writeFileSync(path.join(repoDir, 'callee.js'), [
    'function greet(name) {',
    '  return `Hello, ${name}!`;',
    '}',
    'module.exports = { greet };',
  ].join('\n') + '\n');

  fs.writeFileSync(path.join(repoDir, 'unrelated.js'), [
    'const X = 42;',
    'module.exports = { X };',
  ].join('\n') + '\n');

  for (let i = 1; i <= 5; i++) {
    fs.writeFileSync(
      path.join(repoDir, `low${i}.js`),
      `const val${i} = ${i};\nmodule.exports = { val${i} };\n`
    );
  }

  return repoDir;
}

function buildHotspotsJson(repoDir) {
  const entries = [
    { file: 'caller.js',    hotspotScore: 1.0, complexity: 3, changes: 10, loc: 5, linesChanged: 30 },
    { file: 'callee.js',    hotspotScore: 0.5, complexity: 2, changes: 5,  loc: 4, linesChanged: 10 },
    { file: 'unrelated.js', hotspotScore: 0.1, complexity: 0, changes: 2,  loc: 2, linesChanged: 4  },
    { file: 'low1.js',      hotspotScore: 0.0, complexity: 0, changes: 1,  loc: 2, linesChanged: 1  },
    { file: 'low2.js',      hotspotScore: 0.0, complexity: 0, changes: 1,  loc: 2, linesChanged: 1  },
    { file: 'low3.js',      hotspotScore: 0.0, complexity: 0, changes: 1,  loc: 2, linesChanged: 1  },
    { file: 'low4.js',      hotspotScore: 0.0, complexity: 0, changes: 1,  loc: 2, linesChanged: 1  },
    { file: 'low5.js',      hotspotScore: 0.0, complexity: 0, changes: 1,  loc: 2, linesChanged: 1  },
  ];
  const hotspotPath = path.join(repoDir, 'hotspots.json');
  fs.writeFileSync(hotspotPath, JSON.stringify(entries, null, 2));
  return hotspotPath;
}

function runScript(args) {
  return execSync(`node "${SCRIPT_PATH}" ${args}`, { cwd: ROOT, stdio: 'pipe' }).toString();
}

const scriptExists = fs.existsSync(SCRIPT_PATH);

describe('Story #1179: 依存グラフ生成（CodeGraph統合）', () => {
  it('scripts/dependency-graph.js が存在する', () => {
    expect(scriptExists).toBe(true);
  });

  if (!scriptExists) {
    // 実装タスク (#1206) 完了前は以降のテストをスキップする（RED状態が正しい）
    return;
  }

  let repoDir;
  let hotspotPath;
  let outPath;
  let mmdContent;

  beforeAll(() => {
    repoDir = buildFixtureRepo();
    hotspotPath = buildHotspotsJson(repoDir);
    outPath = path.join(repoDir, 'dependency-graph.mmd');

    runScript(`"${repoDir}" --hotspots="${hotspotPath}" --out="${outPath}"`);
    mmdContent = fs.readFileSync(outPath, 'utf8');
  });

  afterAll(() => {
    if (repoDir) fs.rmSync(repoDir, { recursive: true, force: true });
  });

  describe('受け入れ条件3: 依存グラフを Mermaid 形式で出力できる', () => {
    it('--out で指定したパスにファイルが出力される', () => {
      expect(fs.existsSync(outPath)).toBe(true);
    });

    it('出力ファイルは空でない', () => {
      expect(mmdContent.trim().length).toBeGreaterThan(0);
    });

    it('出力ファイルは Mermaid ダイアグラムヘッダ（graph LR または graph TD）で始まる', () => {
      expect(mmdContent.trimStart()).toMatch(/^graph (LR|TD)/);
    });
  });

  describe('受け入れ条件1: caller/callee 依存関係を解析できる', () => {
    it('グラフには header 行以外のコンテンツ（ノードまたはエッジ）が含まれる', () => {
      const bodyLines = mmdContent
        .split('\n')
        .filter((l) => l.trim() && !l.trimStart().startsWith('graph '));
      expect(bodyLines.length).toBeGreaterThan(0);
    });

    it('caller.js は分析対象（hotspotScore 最高位）としてグラフに含まれる', () => {
      expect(mmdContent).toContain('caller');
    });
  });

  describe('受け入れ条件2: ホットスポット上位ファイルのみを対象に依存グラフを生成できる', () => {
    it('--topN=1 指定時、ゼロスコアのファイル（low1-5.js）はグラフに含まれない', () => {
      const topNPath = path.join(repoDir, 'dependency-graph-top1.mmd');
      runScript(`"${repoDir}" --hotspots="${hotspotPath}" --topN=1 --out="${topNPath}"`);
      const topNContent = fs.readFileSync(topNPath, 'utf8');

      for (let i = 1; i <= 5; i++) {
        expect(topNContent).not.toContain(`low${i}`);
      }
    });

    it('デフォルト topN（20%）では hotspotScore=0.0 のファイルはグラフに含まれない', () => {
      for (let i = 1; i <= 5; i++) {
        expect(mmdContent).not.toContain(`low${i}`);
      }
    });
  });
});
