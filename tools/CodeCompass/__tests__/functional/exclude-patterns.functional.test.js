'use strict';

/**
 * Functional Tests: CodeCompass 除外フィルタ統合（#1405）
 *
 * 除外パターンが complexity-score / change-frequency の各エンジンと
 * hotspot.js CLI（デフォルト除外・.codecompassignore・--ignore オプション）に
 * 正しく反映されることを検証する。
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const { analyzeComplexity } = require('../../lib/complexity-score');
const { analyzeChangeFrequency } = require('../../lib/change-frequency');

const ROOT = path.resolve(__dirname, '..', '..');
const HOTSPOT_SCRIPT_PATH = path.join(ROOT, 'scripts', 'hotspot.js');

function git(repoDir, args) {
  return execFileSync('git', args, { cwd: repoDir, stdio: 'pipe' }).toString();
}

function runHotspotCli(args) {
  return execFileSync('node', [HOTSPOT_SCRIPT_PATH, ...args], { cwd: ROOT, stdio: 'pipe' });
}

describe('analyzeComplexity with excludePatterns', () => {
  let repoDir;

  beforeEach(() => {
    repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codecompass-complexity-exclude-'));
    fs.mkdirSync(path.join(repoDir, 'dist'));
    fs.writeFileSync(path.join(repoDir, 'dist', 'bundle.js'), 'if (true) { console.log(1); }\n');
    fs.writeFileSync(path.join(repoDir, 'app.js'), 'if (true) { console.log(1); }\n');
  });

  afterEach(() => {
    fs.rmSync(repoDir, { recursive: true, force: true });
  });

  it('excludePatterns を渡さない場合は除外なしで全ファイルを解析する', () => {
    const result = analyzeComplexity({ repoPath: repoDir });

    expect(result.map((e) => e.file).sort()).toEqual(['app.js', 'dist/bundle.js']);
  });

  it('excludePatterns に dist/ を渡すと dist 配下のファイルが解析対象から除外される', () => {
    const result = analyzeComplexity({ repoPath: repoDir, excludePatterns: ['dist/'] });

    expect(result.map((e) => e.file)).toEqual(['app.js']);
  });
});

describe('analyzeChangeFrequency with excludePatterns', () => {
  let repoDir;

  beforeEach(() => {
    repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codecompass-changefreq-exclude-'));
    git(repoDir, ['init', '-q', '-b', 'main']);
    git(repoDir, ['config', 'user.email', 'test@example.com']);
    git(repoDir, ['config', 'user.name', 'CodeCompass Exclude']);

    fs.mkdirSync(path.join(repoDir, 'dist'));
    fs.writeFileSync(path.join(repoDir, 'dist', 'bundle.js'), 'console.log(1);\n');
    fs.writeFileSync(path.join(repoDir, 'app.js'), 'console.log(1);\n');
    git(repoDir, ['add', '.']);
    git(repoDir, ['commit', '-q', '-m', 'feat: initial']);
  });

  afterEach(() => {
    fs.rmSync(repoDir, { recursive: true, force: true });
  });

  it('excludePatterns に dist/ を渡すと dist 配下のファイルが集計対象から除外される', () => {
    const result = analyzeChangeFrequency({ repoPath: repoDir, excludePatterns: ['dist/'] });

    expect(result.find((e) => e.file === 'dist/bundle.js')).toBeUndefined();
    expect(result.find((e) => e.file === 'app.js')).toBeDefined();
  });
});

describe('hotspot.js CLI 除外フィルタ', () => {
  let repoDir;

  beforeEach(() => {
    repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codecompass-hotspot-exclude-'));
    git(repoDir, ['init', '-q', '-b', 'main']);
    git(repoDir, ['config', 'user.email', 'test@example.com']);
    git(repoDir, ['config', 'user.name', 'CodeCompass Hotspot Exclude']);

    fs.mkdirSync(path.join(repoDir, 'dist'));
    fs.writeFileSync(path.join(repoDir, 'dist', 'bundle.js'), 'if (true) { console.log(1); }\n');
    fs.writeFileSync(path.join(repoDir, 'app.js'), 'if (true) { console.log(1); }\n');
    fs.writeFileSync(path.join(repoDir, 'vendor.tmp.js'), 'if (true) { console.log(1); }\n');
    git(repoDir, ['add', '.']);
    git(repoDir, ['commit', '-q', '-m', 'feat: initial']);
  });

  afterEach(() => {
    fs.rmSync(repoDir, { recursive: true, force: true });
  });

  it('デフォルト除外パターンにより dist/ 配下のファイルが結果に出ない', () => {
    const result = JSON.parse(runHotspotCli([repoDir]).toString());

    expect(result.find((e) => e.file === 'dist/bundle.js')).toBeUndefined();
    expect(result.find((e) => e.file === 'app.js')).toBeDefined();
  });

  it('.codecompassignore に記載したパターンも除外される', () => {
    fs.writeFileSync(path.join(repoDir, '.codecompassignore'), '*.tmp.js\n');

    const result = JSON.parse(runHotspotCli([repoDir]).toString());

    expect(result.find((e) => e.file === 'vendor.tmp.js')).toBeUndefined();
    expect(result.find((e) => e.file === 'app.js')).toBeDefined();
  });

  it('--ignore オプションで指定した追加パターンも除外される', () => {
    const result = JSON.parse(runHotspotCli([repoDir, '--ignore=vendor.tmp.js']).toString());

    expect(result.find((e) => e.file === 'vendor.tmp.js')).toBeUndefined();
    expect(result.find((e) => e.file === 'app.js')).toBeDefined();
  });

  it('--ignore は複数パターンをカンマ区切りで指定できる', () => {
    const result = JSON.parse(runHotspotCli([repoDir, '--ignore=vendor.tmp.js,app.js']).toString());

    expect(result.find((e) => e.file === 'vendor.tmp.js')).toBeUndefined();
    expect(result.find((e) => e.file === 'app.js')).toBeUndefined();
  });
});
