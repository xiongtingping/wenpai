#!/usr/bin/env node

import fs from 'fs';

// 提取函数内容
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

const originalFile = 'src/pages/AdaptPage.tsx';
const migratedFile = 'src/features/content-adapter/utils/promptBuilders.ts';

const originalContent = fs.readFileSync(originalFile, 'utf8');
const migratedContent = fs.readFileSync(migratedFile, 'utf8');

const functionName = 'generateCustomDimension';

console.log('=== 原始函数 ===');
const originalFunc = extractFunctionContent(originalContent, functionName);
console.log(originalFunc);

console.log('\n=== 迁移函数 ===');
const migratedFunc = extractFunctionContent(migratedContent, functionName);
console.log(migratedFunc);

console.log('\n=== 差异分析 ===');
console.log('原始长度:', originalFunc?.length);
console.log('迁移长度:', migratedFunc?.length);
console.log('是否相等:', originalFunc === migratedFunc);

if (originalFunc && migratedFunc && originalFunc !== migratedFunc) {
  console.log('\n=== 字符对比 ===');
  const minLen = Math.min(originalFunc.length, migratedFunc.length);
  for (let i = 0; i < minLen; i++) {
    if (originalFunc[i] !== migratedFunc[i]) {
      console.log(`位置 ${i}: 原始='${originalFunc[i]}' (${originalFunc.charCodeAt(i)}) vs 迁移='${migratedFunc[i]}' (${migratedFunc.charCodeAt(i)})`);
      console.log(`上下文: ...${originalFunc.substring(Math.max(0, i-10), i+10)}...`);
      console.log(`上下文: ...${migratedFunc.substring(Math.max(0, i-10), i+10)}...`);
      break;
    }
  }
}
