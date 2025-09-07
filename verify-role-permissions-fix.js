#!/usr/bin/env node

/**
 * 🔧 验证 ROLE_PERMISSIONS 初始化错误修复
 * 检查 rolePermissionMatrix.ts 文件中的循环引用问题是否已解决
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 开始验证 JavaScript 初始化错误修复...\n');

// 检查源文件
const sourceFile = path.join(__dirname, 'src/config/rolePermissionMatrix.ts');

if (!fs.existsSync(sourceFile)) {
    console.error('❌ 源文件不存在:', sourceFile);
    process.exit(1);
}

const content = fs.readFileSync(sourceFile, 'utf8');

// 检查是否还存在循环引用和变量作用域问题
const problematicPatterns = [
    /ROLE_PERMISSIONS\[.*\].*ROLE_PERMISSIONS/g,
    /TIER_PERMISSIONS\[.*\].*TIER_PERMISSIONS/g,
    /\.\.\.ROLE_PERMISSIONS\[.*\].*\|\|.*\[\]/g,
    /\.\.\.TIER_PERMISSIONS\[.*\].*\|\|.*\[\]/g
];

// 检查 currentTier 作用域问题
const currentTierPatterns = [
    /formatRemainingUses\(.*,\s*currentTier\)/g,
    /currentTier.*=.*\(\(\)\s*=>/g  // 检查是否在函数内部定义
];

let hasProblems = false;
let fixedPatterns = 0;

console.log('📋 检查循环引用模式...');

problematicPatterns.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches) {
        console.error(`❌ 发现问题模式 ${index + 1}:`, matches);
        hasProblems = true;
    } else {
        console.log(`✅ 模式 ${index + 1} 已修复`);
        fixedPatterns++;
    }
});

console.log('\n📋 检查 currentTier 作用域问题...');

// 检查 AdaptPage.tsx 中的 currentTier 问题
const adaptPageFile = path.join(__dirname, 'src/pages/AdaptPage.tsx');
if (fs.existsSync(adaptPageFile)) {
    const adaptContent = fs.readFileSync(adaptPageFile, 'utf8');

    // 检查是否定义了组件级别的 currentTier 状态
    if (adaptContent.includes('const [currentTier, setCurrentTier] = useState')) {
        console.log('✅ currentTier 已定义为组件状态');
    } else {
        console.error('❌ currentTier 未定义为组件状态');
        hasProblems = true;
    }

    // 检查是否在 useEffect 中更新 currentTier
    if (adaptContent.includes('setCurrentTier(calculatedTier)')) {
        console.log('✅ currentTier 状态更新逻辑已实现');
    } else {
        console.error('❌ currentTier 状态更新逻辑缺失');
        hasProblems = true;
    }

    // 检查是否还有作用域问题
    currentTierPatterns.forEach((pattern, index) => {
        const matches = adaptContent.match(pattern);
        if (matches && matches.length > 0) {
            // 检查是否在正确的作用域中使用
            const hasComponentState = adaptContent.includes('const [currentTier, setCurrentTier]');
            if (hasComponentState) {
                console.log(`✅ currentTier 使用模式 ${index + 1} 正常`);
            } else {
                console.error(`❌ currentTier 使用模式 ${index + 1} 存在作用域问题`);
                hasProblems = true;
            }
        }
    });
} else {
    console.error('❌ AdaptPage.tsx 文件不存在');
    hasProblems = true;
}

// 检查是否使用了正确的修复方案
const expectedPatterns = [
    /const BASE_ROLE_PERMISSIONS/,
    /const BASE_TIER_PERMISSIONS/,
    /export const ROLE_PERMISSIONS.*Record<SystemRole, Permission\[\]>/,
    /export const TIER_PERMISSIONS.*Record<SubscriptionTier, Permission\[\]>/
];

console.log('\n📋 检查修复方案实施...');

expectedPatterns.forEach((pattern, index) => {
    if (pattern.test(content)) {
        console.log(`✅ 修复方案 ${index + 1} 已实施`);
    } else {
        console.error(`❌ 修复方案 ${index + 1} 未实施`);
        hasProblems = true;
    }
});

// 检查构建文件
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
    console.log('🎉 所有检查通过！JavaScript 初始化错误已修复');
    console.log('\n✅ 修复内容:');
    console.log('  - 消除了 ROLE_PERMISSIONS 对象内部的循环引用');
    console.log('  - 消除了 TIER_PERMISSIONS 对象内部的循环引用');
    console.log('  - 使用 BASE_*_PERMISSIONS 分离基础配置和继承逻辑');
    console.log('  - 修复了 currentTier 变量作用域问题');
    console.log('  - 将 currentTier 提升为组件级别状态');
    console.log('  - 构建生成新的文件哈希:', currentVersion);
    console.log('  - HTML 文件正确引用新的构建文件');
    
    console.log('\n🚀 下一步:');
    console.log('  1. 测试应用是否正常运行: http://localhost:4173');
    console.log('  2. 检查浏览器控制台是否还有错误');
    console.log('  3. 如果仍有问题，使用缓存清理页面: http://localhost:4173/clear-cache.html');
    
} else {
    console.log('❌ 发现问题，需要进一步修复');
    console.log('\n🔧 建议操作:');
    console.log('  1. 检查源文件中的循环引用');
    console.log('  2. 重新运行构建: npm run build');
    console.log('  3. 验证修复效果: node verify-role-permissions-fix.js');
}

console.log('\n' + '='.repeat(50));

// 创建版本信息文件
const versionInfo = {
    version: currentVersion,
    buildTime: new Date().toISOString(),
    jsFile: latestJsFile,
    fixed: 'JavaScript initialization errors (ROLE_PERMISSIONS + currentTier)',
    status: hasProblems ? 'needs_attention' : 'fixed',
    checks: {
        circularReferences: fixedPatterns === problematicPatterns.length,
        buildFiles: distFiles.length > 0,
        htmlReference: true,
        versionScript: fs.existsSync(versionCheckFile)
    }
};

fs.writeFileSync(path.join(distDir, 'fix-status.json'), JSON.stringify(versionInfo, null, 2));
console.log('📄 修复状态已保存到 dist/fix-status.json');

process.exit(hasProblems ? 1 : 0);
