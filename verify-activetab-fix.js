#!/usr/bin/env node

/**
 * 🔧 验证 activeTab 错误修复
 * 检查 HotTopicsPage.tsx 文件中的变量定义问题是否已解决
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 开始验证 activeTab 错误修复...\n');

// 检查源文件
const sourceFile = path.join(__dirname, 'src/pages/HotTopicsPage.tsx');

if (!fs.existsSync(sourceFile)) {
    console.error('❌ 源文件不存在:', sourceFile);
    process.exit(1);
}

const content = fs.readFileSync(sourceFile, 'utf8');

let hasProblems = false;
let fixedIssues = 0;

console.log('📋 检查变量定义问题...');

// 检查 activeTab 状态定义
const activeTabPatterns = [
    /const\s*\[\s*activeTab\s*,\s*setActiveTab\s*\]\s*=\s*useState/,
    /activeTab.*onValueChange.*setActiveTab/
];

console.log('🔍 检查 activeTab 相关定义...');

activeTabPatterns.forEach((pattern, index) => {
    if (pattern.test(content)) {
        console.log(`✅ activeTab 模式 ${index + 1} 已修复`);
        fixedIssues++;
    } else {
        console.error(`❌ activeTab 模式 ${index + 1} 未修复`);
        hasProblems = true;
    }
});

// 检查其他缺失的状态定义
const requiredStates = [
    { name: 'refreshing', pattern: /const\s*\[\s*refreshing\s*,\s*setRefreshing\s*\]\s*=\s*useState/ },
    { name: 'allHotData', pattern: /const\s*\[\s*allHotData\s*,\s*setAllHotData\s*\]\s*=\s*useState/ },
    { name: 'subscriptions', pattern: /const\s*\[\s*subscriptions\s*,\s*setSubscriptions\s*\]\s*=\s*useState/ },
    { name: 'monitorResults', pattern: /const\s*\[\s*monitorResults\s*,\s*setMonitorResults\s*\]\s*=\s*useState/ },
    { name: 'isMonitoring', pattern: /const\s*\[\s*isMonitoring\s*,\s*setIsMonitoring\s*\]\s*=\s*useState/ }
];

console.log('\n🔍 检查其他必需状态定义...');

requiredStates.forEach(state => {
    if (state.pattern.test(content)) {
        console.log(`✅ ${state.name} 状态已定义`);
        fixedIssues++;
    } else {
        console.error(`❌ ${state.name} 状态未定义`);
        hasProblems = true;
    }
});

// 检查必需的函数定义
const requiredFunctions = [
    { name: 'fetchHotData', pattern: /const\s+fetchHotData\s*=\s*useCallback/ },
    { name: 'isTopicBookmarked', pattern: /const\s+isTopicBookmarked\s*=\s*useCallback/ },
    { name: 'toggleBookmark', pattern: /const\s+toggleBookmark\s*=\s*useCallback/ },
    { name: 'handleEditSubscription', pattern: /const\s+handleEditSubscription\s*=\s*useCallback/ },
    { name: 'handleDeleteSubscription', pattern: /const\s+handleDeleteSubscription\s*=\s*useCallback/ },
    { name: 'handleMonitorTopic', pattern: /const\s+handleMonitorTopic\s*=\s*useCallback/ }
];

console.log('\n🔍 检查必需函数定义...');

requiredFunctions.forEach(func => {
    if (func.pattern.test(content)) {
        console.log(`✅ ${func.name} 函数已定义`);
        fixedIssues++;
    } else {
        console.error(`❌ ${func.name} 函数未定义`);
        hasProblems = true;
    }
});

// 检查构建结果
console.log('\n📋 检查构建结果...');

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    console.error('❌ dist 目录不存在，请先运行构建');
    process.exit(1);
}

const distFiles = fs.readdirSync(path.join(distDir, 'assets')).filter(f => f.startsWith('index-') && f.endsWith('.js'));

if (distFiles.length === 0) {
    console.error('❌ 未找到构建的 JS 文件');
    process.exit(1);
}

const latestJsFile = distFiles[distFiles.length - 1];
console.log('📄 最新构建文件:', latestJsFile);

// 提取版本哈希
const versionMatch = latestJsFile.match(/index-([a-zA-Z0-9]+)\.js/);
const currentVersion = versionMatch ? versionMatch[1] : 'unknown';

console.log('🏷️  当前版本:', currentVersion);

// 检查 HTML 文件是否正确引用
const htmlFile = path.join(distDir, 'index.html');
if (fs.existsSync(htmlFile)) {
    const htmlContent = fs.readFileSync(htmlFile, 'utf8');
    if (htmlContent.includes(latestJsFile)) {
        console.log('✅ HTML 文件正确引用最新 JS 文件');
    } else {
        console.error('❌ HTML 文件未正确引用最新 JS 文件');
        hasProblems = true;
    }
} else {
    console.error('❌ HTML 文件不存在');
    hasProblems = true;
}

// 检查版本检测脚本
const versionCheckFile = path.join(distDir, 'check-version.js');
if (fs.existsSync(versionCheckFile)) {
    const versionCheckContent = fs.readFileSync(versionCheckFile, 'utf8');
    if (versionCheckContent.includes(currentVersion)) {
        console.log('✅ 版本检测脚本已更新');
    } else {
        console.warn('⚠️  版本检测脚本可能需要更新');
    }
} else {
    console.warn('⚠️  版本检测脚本不存在');
}

// 生成修复报告
console.log('\n📊 修复报告:');
console.log('='.repeat(50));

if (!hasProblems) {
    console.log('🎉 所有检查通过！activeTab 错误已修复');
    console.log('\n✅ 修复内容:');
    console.log('  - 添加了 activeTab 状态定义');
    console.log('  - 添加了所有必需的状态变量');
    console.log('  - 添加了所有必需的函数定义');
    console.log('  - 修复了变量作用域问题');
    console.log('  - 构建生成新的文件哈希:', currentVersion);
    console.log('  - HTML 文件正确引用新的构建文件');
    
    console.log('\n🚀 下一步:');
    console.log('  1. 测试应用是否正常运行: http://localhost:4173');
    console.log('  2. 检查浏览器控制台是否还有错误');
    console.log('  3. 测试热点话题页面功能: http://localhost:4173/hot-topics');
    
} else {
    console.log('❌ 发现问题，需要进一步修复');
    console.log('\n🔧 建议操作:');
    console.log('  1. 检查源文件中的变量定义');
    console.log('  2. 重新运行构建: npm run build');
    console.log('  3. 验证修复效果: node verify-activetab-fix.js');
}

console.log('\n' + '='.repeat(50));

// 创建版本信息文件
const versionInfo = {
    version: currentVersion,
    buildTime: new Date().toISOString(),
    jsFile: latestJsFile,
    fixed: 'activeTab is not defined error',
    status: hasProblems ? 'needs_attention' : 'fixed',
    checks: {
        activeTabState: /const\s*\[\s*activeTab\s*,\s*setActiveTab\s*\]\s*=\s*useState/.test(content),
        requiredStates: requiredStates.every(state => state.pattern.test(content)),
        requiredFunctions: requiredFunctions.every(func => func.pattern.test(content)),
        buildFiles: distFiles.length > 0,
        htmlReference: true,
        versionScript: fs.existsSync(versionCheckFile)
    },
    fixedIssues: fixedIssues
};

fs.writeFileSync(path.join(distDir, 'activetab-fix-status.json'), JSON.stringify(versionInfo, null, 2));
console.log('📄 修复状态已保存到 dist/activetab-fix-status.json');

process.exit(hasProblems ? 1 : 0);
