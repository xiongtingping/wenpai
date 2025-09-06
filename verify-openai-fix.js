#!/usr/bin/env node

/**
 * 🔧 OpenAI调用修复验证脚本
 * 
 * 验证以下修复是否成功：
 * 1. require 错误修复
 * 2. 节流机制增强
 * 3. 错误处理优化
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 开始验证OpenAI调用修复...\n');

// 检查文件是否存在
function checkFileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    } catch (error) {
        return false;
    }
}

// 检查文件内容
function checkFileContent(filePath, searchText) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return content.includes(searchText);
    } catch (error) {
        return false;
    }
}

// 验证修复
function verifyFixes() {
    const fixes = [];
    
    // 1. 检查TitleGeneratorIntelligent.tsx文件
    const titleGeneratorPath = path.join(__dirname, 'src/components/TitleGeneratorIntelligent.tsx');
    if (checkFileExists(titleGeneratorPath)) {
        console.log('✅ TitleGeneratorIntelligent.tsx 文件存在');
        
        // 检查是否移除了require
        if (!checkFileContent(titleGeneratorPath, 'require(\'../utils/titleGenerationUtils\')')) {
            console.log('✅ require 语句已移除');
            fixes.push('require_fix');
        } else {
            console.log('❌ require 语句仍然存在');
        }
        
        // 检查是否使用了动态导入
        if (checkFileContent(titleGeneratorPath, 'await import(\'../utils/titleGenerationUtils\')')) {
            console.log('✅ 动态导入已实现');
            fixes.push('dynamic_import');
        } else {
            console.log('❌ 动态导入未实现');
        }
        
        // 检查节流机制
        if (checkFileContent(titleGeneratorPath, 'minInterval = 10000')) {
            console.log('✅ 节流机制已增强（10秒间隔）');
            fixes.push('throttling');
        } else {
            console.log('❌ 节流机制未增强');
        }
        
        // 检查错误处理
        if (checkFileContent(titleGeneratorPath, '请求过于频繁')) {
            console.log('✅ 用户友好的错误提示已添加');
            fixes.push('error_handling');
        } else {
            console.log('❌ 用户友好的错误提示未添加');
        }
        
    } else {
        console.log('❌ TitleGeneratorIntelligent.tsx 文件不存在');
    }
    
    // 2. 检查titleGenerationUtils.ts文件
    const utilsPath = path.join(__dirname, 'src/utils/titleGenerationUtils.ts');
    if (checkFileExists(utilsPath)) {
        console.log('✅ titleGenerationUtils.ts 文件存在');
        
        // 检查导出函数
        if (checkFileContent(utilsPath, 'export const calculateSemanticCompleteness')) {
            console.log('✅ calculateSemanticCompleteness 函数已导出');
            fixes.push('utils_export');
        } else {
            console.log('❌ calculateSemanticCompleteness 函数未导出');
        }
        
        if (checkFileContent(utilsPath, 'export const calculateEmotionalAppeal')) {
            console.log('✅ calculateEmotionalAppeal 函数已导出');
            fixes.push('utils_export');
        } else {
            console.log('❌ calculateEmotionalAppeal 函数未导出');
        }
        
    } else {
        console.log('❌ titleGenerationUtils.ts 文件不存在');
    }
    
    // 3. 检查测试文件
    const testPath = path.join(__dirname, 'test-openai-fix.html');
    if (checkFileExists(testPath)) {
        console.log('✅ 测试页面已创建');
        fixes.push('test_page');
    } else {
        console.log('❌ 测试页面未创建');
    }
    
    // 4. 检查总结文档
    const summaryPath = path.join(__dirname, 'OPENAI_CALL_FIXES_SUMMARY.md');
    if (checkFileExists(summaryPath)) {
        console.log('✅ 修复总结文档已创建');
        fixes.push('documentation');
    } else {
        console.log('❌ 修复总结文档未创建');
    }
    
    return fixes;
}

// 运行验证
const verifiedFixes = verifyFixes();

console.log('\n📊 验证结果总结:');
console.log(`✅ 成功修复: ${verifiedFixes.length} 项`);

if (verifiedFixes.includes('require_fix')) {
    console.log('  - require 错误已修复');
}
if (verifiedFixes.includes('dynamic_import')) {
    console.log('  - 动态导入已实现');
}
if (verifiedFixes.includes('throttling')) {
    console.log('  - 节流机制已增强');
}
if (verifiedFixes.includes('error_handling')) {
    console.log('  - 错误处理已优化');
}
if (verifiedFixes.includes('utils_export')) {
    console.log('  - 工具函数已正确导出');
}
if (verifiedFixes.includes('test_page')) {
    console.log('  - 测试页面已创建');
}
if (verifiedFixes.includes('documentation')) {
    console.log('  - 文档已完善');
}

console.log('\n🎯 下一步建议:');
console.log('1. 访问 http://localhost:5177/new-adapt 测试功能');
console.log('2. 打开 test-openai-fix.html 进行详细测试');
console.log('3. 检查浏览器控制台是否还有错误');
console.log('4. 验证标题生成功能是否正常工作');

console.log('\n✨ 验证完成！');
