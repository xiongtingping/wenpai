#!/usr/bin/env node
/*
 * 🚦 系统级预检脚本（防止再次出现初始化/上下文类错误）
 * 目标：在构建/部署前自动扫描高风险点并输出报告（必要时失败退出）
 */

import fs from 'fs';
import path from 'path';

const SRC = 'src';
let hasErrors = false;
let hasWarnings = false;

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function exists(file) {
  return fs.existsSync(file);
}

function findFiles(dir, exts = ['.ts', '.tsx']) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...findFiles(p, exts));
    else if (exts.includes(path.extname(e.name))) out.push(p);
  }
  return out;
}

function grepAll(files, regex) {
  const matches = [];
  for (const f of files) {
    const content = read(f);
    const lines = content.split(/\r?\n/);
    lines.forEach((line, idx) => {
      if (regex.test(line)) {
        matches.push({ file: f, line: idx + 1, text: line.trim() });
      }
    });
  }
  return matches;
}

function section(title) {
  console.log(`\n=== ${title} ===`);
}

try {
  console.log('🧪 开始系统级预检...\n');

  const files = findFiles(SRC);

  // 1) Router 单例检查
  section('Router 单例检查');
  const mainPath = 'src/main.tsx';
  const appPath = 'src/App.tsx';
  const browserRouterAll = grepAll(files, /BrowserRouter/);
  const routerTagAll = grepAll(files, /<Router>|<Router\s/);

  const mainHas = exists(mainPath) && /BrowserRouter/.test(read(mainPath));
  const appHasRouterImport = exists(appPath) && /BrowserRouter/.test(read(appPath));
  const appHasRouterTag = exists(appPath) && /<Router[>\s]/.test(read(appPath));

  if (!mainHas) {
    hasErrors = true;
    console.log('❌ main.tsx 未检测到 BrowserRouter 包裹');
  } else {
    console.log('✅ main.tsx 已检测到 BrowserRouter');
  }

  if (appHasRouterImport || appHasRouterTag) {
    hasErrors = true;
    console.log('❌ App.tsx 中检测到 Router/BrowserRouter（应移除，避免双重 Router）');
  } else {
    console.log('✅ App.tsx 未检测到 Router/BrowserRouter（正确）');
  }

  const browserRouterInOtherFiles = browserRouterAll.filter(m => m.file !== mainPath);
  if (browserRouterInOtherFiles.length > 0) {
    hasWarnings = true;
    console.log('⚠️  其他文件中存在 BrowserRouter 引用（建议仅在 main.tsx 使用）：');
    browserRouterInOtherFiles.slice(0, 10).forEach(m => console.log(`   - ${m.file}:${m.line}`));
  } else {
    console.log('✅ 未发现额外 BrowserRouter 引用');
  }

  // 2) 认证 Hook 使用位置检查（禁止在模块顶层使用）
  section('认证 Hook 使用位置检查');
  const authHookMatches = grepAll(files, /useAuth\(|useUnifiedAuth\(/);
  const topLevelSuspicious = [];
  for (const m of authHookMatches) {
    const content = read(m.file);
    // 简单启发式：如果文件中该行之前 10 行内没有出现 'function'、'=>' 或 'React.FC'
    const lines = content.split(/\r?\n/);
    const start = Math.max(0, m.line - 11);
    const context = lines.slice(start, m.line).join('\n');
    if (!/(function\s|=>|React\.FC|export\sconst\s[A-Za-z0-9_]+\s*=\s*\()/m.test(context)) {
      topLevelSuspicious.push(m);
    }
  }
  if (topLevelSuspicious.length) {
    hasWarnings = true;
    console.log('⚠️  可能在非组件上下文使用认证 Hook（需人工确认）：');
    topLevelSuspicious.slice(0, 10).forEach(m => console.log(`   - ${m.file}:${m.line} -> ${m.text}`));
  } else {
    console.log('✅ 未发现明显的顶层认证 Hook 使用');
  }

  // 3) 直接 fetch/axios 使用（应通过统一 request 模块）
  section('直接 fetch/axios 使用检查');
  const fetchMatches = grepAll(files, /\bfetch\s*\(/).filter(m => !m.file.includes('src/api/request.ts'));
  const axiosMatches = grepAll(files, /\baxios\./).filter(m => !m.file.includes('src/api/request.ts'));
  const directAPIs = [...fetchMatches, ...axiosMatches].filter(m => !/node_modules|netlify\//.test(m.file));
  if (directAPIs.length) {
    hasWarnings = true;
    console.log('⚠️  检测到直接使用 fetch/axios 的位置（建议统一走 src/api/request.ts）：');
    directAPIs.slice(0, 20).forEach(m => console.log(`   - ${m.file}:${m.line} -> ${m.text}`));
  } else {
    console.log('✅ 未检测到直接 fetch/axios 使用');
  }

  // 4) 顶层 throw new Error 检查（初始化阶段易崩溃）
  section('显式 throw Error 检查');
  const throwMatches = grepAll(files, /throw\s+new\s+Error\(|throw\s+Error\(/);
  if (throwMatches.length) {
    // 仅报告，不直接失败；初始化阶段的顶层 throw 是高风险
    const topLevelThrow = throwMatches.filter(m => m.file.endsWith('App.tsx') || m.file.endsWith('main.tsx'));
    if (topLevelThrow.length) {
      hasErrors = true;
      console.log('❌ 在入口文件检测到显式 throw（请避免在入口/Provider 顶层抛错）：');
      topLevelThrow.forEach(m => console.log(`   - ${m.file}:${m.line}`));
    }
    console.log(`ℹ️  全部 throw 位置：${throwMatches.length} 处（仅供参考）`);
  } else {
    console.log('✅ 未检测到显式 throw Error');
  }

  // 5) 令牌注入健壮性检查（authTokenGetter 定义与导出）
  section('认证令牌注入检查');
  const requestPath = 'src/api/request.ts';
  if (!exists(requestPath)) {
    hasErrors = true;
    console.log('❌ 未发现 src/api/request.ts');
  } else {
    const rt = read(requestPath);
    const hasGetterVar = /let\s+authTokenGetter\s*:\s*\(\(\)\s*=>/.test(rt);
    const hasSetterExport = /export\s+const\s+setAuthTokenGetter\s*=/.test(rt);
    if (!hasGetterVar || !hasSetterExport) {
      hasErrors = true;
      console.log('❌ request.ts 缺少 authTokenGetter 变量或 setAuthTokenGetter 导出');
    } else {
      console.log('✅ request.ts 令牌获取器定义与导出检测通过');
    }
  }

  // 6) App 包裹顺序与 ErrorBoundary 使用检查
  section('App 包裹顺序检查');
  if (exists(appPath)) {
    const ac = read(appPath);
    const hasTheme = /<ThemeProvider>/.test(ac);
    const hasAuth = /<AuthProvider>/.test(ac);
    const hasUnified = /<UnifiedAuthProvider>/.test(ac);
    const hasErrorBoundary = /<ErrorBoundary>/.test(ac);
    if (!hasTheme || !hasAuth || !hasUnified || !hasErrorBoundary) {
      hasWarnings = true;
      console.log('⚠️  App.tsx 包裹顺序（Theme/Auth/UnifiedAuth/ErrorBoundary）需确认');
    } else {
      console.log('✅ App.tsx 包裹组件存在（顺序请按设计保持）');
    }
  }

  console.log('\n—— 总结 ——');
  if (hasErrors) console.log('❌ 预检失败：存在必须修复的问题');
  if (!hasErrors) console.log('✅ 预检通过：未发现阻断问题');
  if (hasWarnings) console.log('⚠️ 存在建议优化项（不阻断）');

  process.exit(hasErrors ? 1 : 0);
} catch (e) {
  console.error('预检脚本执行异常：', e);
  process.exit(1);
}

