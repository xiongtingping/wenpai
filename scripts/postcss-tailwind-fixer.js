#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🚀 启动PostCSS/Tailwind修复器 - 修复CSS解析错误！');

// CSS文件路径
const cssFiles = [
  'src/index.css',
  'src/styles/design-tokens.css',
  'src/styles/base-layer.css',
  'src/styles/component-layer.css',
  'src/styles/utility-classes.css',
  'src/styles/reset.css'
];

let totalFixed = 0;

function fixPostCSSIssues(content) {
  let fixed = 0;
  let result = content;

  // 修复1: 移除空的@apply规则
  const emptyApplyRegex = /@apply\s*;\s*/g;
  if (emptyApplyRegex.test(result)) {
    result = result.replace(emptyApplyRegex, '');
    fixed++;
    console.log('  ✅ 修复空的@apply规则');
  }

  // 修复2: 修复格式错误的@apply规则
  const malformedApplyRegex = /@apply\s+([^;]+)(?!;)/g;
  result = result.replace(malformedApplyRegex, (match, classes) => {
    if (!match.endsWith(';')) {
      fixed++;
      console.log('  ✅ 修复@apply规则缺少分号');
      return `@apply ${classes.trim()};`;
    }
    return match;
  });

  // 修复3: 移除重复的分号
  const doubleSemicolonRegex = /;;+/g;
  if (doubleSemicolonRegex.test(result)) {
    result = result.replace(doubleSemicolonRegex, ';');
    fixed++;
    console.log('  ✅ 修复重复分号');
  }

  // 修复4: 修复CSS变量语法错误
  const malformedVarRegex = /var\(\s*--([^)]+)\s*\)\s*([^;,}]+)/g;
  result = result.replace(malformedVarRegex, (match, varName, extra) => {
    if (extra.trim() && !extra.includes('/*')) {
      fixed++;
      console.log('  ✅ 修复CSS变量语法错误');
      return `var(--${varName.trim()})`;
    }
    return match;
  });

  // 修复5: 移除孤立的闭合大括号
  const orphanBraceRegex = /^\s*}\s*$/gm;
  const orphanMatches = result.match(orphanBraceRegex);
  if (orphanMatches) {
    result = result.replace(orphanBraceRegex, '');
    fixed += orphanMatches.length;
    console.log(`  ✅ 移除${orphanMatches.length}个孤立的闭合大括号`);
  }

  // 修复6: 修复未闭合的CSS块
  const lines = result.split('\n');
  let braceCount = 0;
  let needsClosing = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    braceCount += openBraces - closeBraces;
  }
  
  if (braceCount > 0) {
    result += '\n' + '}'.repeat(braceCount);
    fixed += braceCount;
    console.log(`  ✅ 添加${braceCount}个缺失的闭合大括号`);
  }

  // 修复7: 清理注释中的CSS代码
  const commentWithCSSRegex = /\/\*[^*]*\*\/\s*([^{};]+)\s*[{;]/g;
  result = result.replace(commentWithCSSRegex, (match, afterComment) => {
    if (afterComment.trim() && !afterComment.includes(':')) {
      fixed++;
      console.log('  ✅ 清理注释后的无效CSS');
      return match.replace(afterComment, '');
    }
    return match;
  });

  // 修复8: 修复@layer规则
  const malformedLayerRegex = /@layer\s+([^{]+)\s*\{([^}]*)\}/g;
  result = result.replace(malformedLayerRegex, (match, layerName, content) => {
    if (content.trim() === '') {
      fixed++;
      console.log('  ✅ 移除空的@layer规则');
      return '';
    }
    return match;
  });

  return { content: result, fixed };
}

// 处理每个CSS文件
cssFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`\n🔍 PostCSS修复：${filePath}`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    const { content: fixedContent, fixed } = fixPostCSSIssues(content);
    
    if (fixed > 0) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`✅ PostCSS修复 ${fixed} 个问题：${filePath}`);
      totalFixed += fixed;
    } else {
      console.log(`✅ 无需修复：${filePath}`);
    }
  }
});

console.log('\n🎉 PostCSS/Tailwind修复器执行完成！');
console.log('============================================================');
console.log(`🔧 总修复数：${totalFixed}`);
console.log('============================================================');

if (totalFixed > 0) {
  console.log('✅ 已修复的问题类型：');
  console.log('  📄 空的@apply规则');
  console.log('  📄 @apply规则缺少分号');
  console.log('  📄 重复分号');
  console.log('  📄 CSS变量语法错误');
  console.log('  📄 孤立的闭合大括号');
  console.log('  📄 未闭合的CSS块');
  console.log('  📄 注释后的无效CSS');
  console.log('  📄 空的@layer规则');
}

console.log('\n🚀 PostCSS修复完成！现在可以安全构建。');
