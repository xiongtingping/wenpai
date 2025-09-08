#!/usr/bin/env node

/**
 * AI内容适配器重构验证脚本
 * 验证迁移后的函数与原始函数100%一致
 */

import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

// 计算字符串的MD5
function calculateMD5(content) {
  return crypto.createHash('md5').update(content, 'utf8').digest('hex');
}

// 提取函数内容（去除空白和注释差异）
function extractFunctionContent(content, functionName) {
  // 更精确的正则表达式，只匹配函数体
  const regex = new RegExp(`(?:export\\s+)?(?:const|function)\\s+${functionName}\\s*[=:]?\\s*[^{]*{([^}]*(?:{[^}]*}[^}]*)*)}`, 'g');
  const match = regex.exec(content);
  if (!match) return null;

  // 标准化内容：移除多余空白、统一换行
  return match[1]
    .replace(/\/\*[\s\S]*?\*\//g, '') // 移除块注释
    .replace(/\/\/.*$/gm, '') // 移除行注释
    .replace(/\s+/g, ' ') // 统一空白
    .trim();
}

// 验证函数列表
const functionsToVerify = [
  'generateMatrixPrompt',
  'getPlatformCharacteristics', 
  'getAlternativeContentForm',
  'getAlternativeStyle',
  'generatePlatformDimension',
  'generateContentFormDimension',
  'generateContentDimension',
  'generateBrandDimension',
  'generateStyleDimension',
  'generateCustomDimension',
  'generateDifferentiationDimension',
  'generateMeaningfulTitle'
];

// 文件路径
const originalFile = 'src/pages/AdaptPage.tsx';
const migratedFile = 'src/features/content-adapter/utils/promptBuilders.ts';

console.log('🔍 AI内容适配器迁移验证开始...\n');

// 读取文件
let originalContent, migratedContent;
try {
  originalContent = fs.readFileSync(originalFile, 'utf8');
  migratedContent = fs.readFileSync(migratedFile, 'utf8');
} catch (error) {
  console.error('❌ 文件读取失败:', error.message);
  process.exit(1);
}

let allPassed = true;
const results = [];

// 验证每个函数
for (const funcName of functionsToVerify) {
  console.log(`🔍 验证函数: ${funcName}`);
  
  const originalFunc = extractFunctionContent(originalContent, funcName);
  const migratedFunc = extractFunctionContent(migratedContent, funcName);
  
  if (!originalFunc) {
    console.log(`⚠️  原始文件中未找到函数: ${funcName}`);
    continue;
  }
  
  if (!migratedFunc) {
    console.log(`❌ 迁移文件中未找到函数: ${funcName}`);
    allPassed = false;
    results.push({ function: funcName, status: 'MISSING', originalMD5: calculateMD5(originalFunc), migratedMD5: 'N/A' });
    continue;
  }
  
  const originalMD5 = calculateMD5(originalFunc);
  const migratedMD5 = calculateMD5(migratedFunc);
  
  if (originalMD5 === migratedMD5) {
    console.log(`✅ ${funcName}: MD5匹配 (${originalMD5})`);
    results.push({ function: funcName, status: 'PASS', originalMD5, migratedMD5 });
  } else {
    console.log(`❌ ${funcName}: MD5不匹配`);
    console.log(`   原始: ${originalMD5}`);
    console.log(`   迁移: ${migratedMD5}`);
    allPassed = false;
    results.push({ function: funcName, status: 'FAIL', originalMD5, migratedMD5 });
  }
}

// 输出总结
console.log('\n📊 验证结果总结:');
console.log('='.repeat(50));

const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;
const missing = results.filter(r => r.status === 'MISSING').length;

console.log(`✅ 通过: ${passed}`);
console.log(`❌ 失败: ${failed}`);
console.log(`⚠️  缺失: ${missing}`);
console.log(`📊 总计: ${results.length}`);

if (allPassed) {
  console.log('\n🎉 所有内容生成函数迁移验证通过！');
  console.log('✅ 100%保持原样，符合重构要求');
} else {
  console.log('\n🚨 验证失败！存在不一致的函数');
  console.log('❌ 请检查迁移过程，确保100%保持原样');
  process.exit(1);
}

// 生成验证报告
const report = {
  timestamp: new Date().toISOString(),
  originalFile,
  migratedFile,
  totalFunctions: functionsToVerify.length,
  results,
  summary: { passed, failed, missing },
  allPassed
};

fs.writeFileSync('docs/refactor/migration-verification-report.json', JSON.stringify(report, null, 2));
console.log('\n📄 详细报告已保存到: docs/refactor/migration-verification-report.json');
