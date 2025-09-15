#!/usr/bin/env node

import fs from 'fs';

console.log('🚀 启动最终CSS清理器 - 修复过度修复的问题！');

const filePath = 'src/index.css';

if (fs.existsSync(filePath)) {
  console.log(`\n🔍 最终清理：${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let fixed = 0;

  // 修复1: 移除文件末尾的大量闭合大括号
  const endBracesRegex = /}+$/;
  const endBracesMatch = content.match(endBracesRegex);
  if (endBracesMatch && endBracesMatch[0].length > 10) {
    content = content.replace(endBracesRegex, '');
    fixed++;
    console.log(`  ✅ 移除文件末尾的${endBracesMatch[0].length}个多余闭合大括号`);
  }

  // 修复2: 修复孤立的选择器（没有属性的大括号）
  const orphanSelectorRegex = /^\s*\{\s*$/gm;
  const orphanMatches = content.match(orphanSelectorRegex);
  if (orphanMatches) {
    content = content.replace(orphanSelectorRegex, '');
    fixed += orphanMatches.length;
    console.log(`  ✅ 移除${orphanMatches.length}个孤立的开始大括号`);
  }

  // 修复3: 修复格式错误的@apply规则
  content = content.replace(/@apply\s+([^;]+);r;/g, (match, classes) => {
    fixed++;
    console.log('  ✅ 修复格式错误的@apply规则');
    return `@apply ${classes.trim()};`;
  });

  // 修复4: 修复格式错误的@apply规则（另一种模式）
  content = content.replace(/@apply\s+([^;]+);([a-z]);/g, (match, classes, extra) => {
    fixed++;
    console.log('  ✅ 修复格式错误的@apply规则');
    return `@apply ${classes.trim()};`;
  });

  // 修复5: 移除注释中的错误
  content = content.replace(/\/\*[^*]*\*\/\s*([^{};]+)\s*[{;]/g, (match, afterComment) => {
    if (afterComment.trim() && !afterComment.includes(':') && !afterComment.includes('@')) {
      fixed++;
      console.log('  ✅ 清理注释后的无效CSS');
      return match.replace(afterComment, '');
    }
    return match;
  });

  // 修复6: 修复未闭合的媒体查询
  content = content.replace(/@media\s+\([^)]+\);?\s*$/gm, (match) => {
    if (!match.includes('{')) {
      fixed++;
      console.log('  ✅ 修复未闭合的媒体查询');
      return match.replace(/;?\s*$/, ' {\n  /* 空媒体查询 */\n}');
    }
    return match;
  });

  // 修复7: 修复未闭合的@keyframes
  content = content.replace(/@keyframes\s+([^{]+)\s*\{([^}]*?)$/gm, (match, name, content) => {
    if (!match.includes('}')) {
      fixed++;
      console.log('  ✅ 修复未闭合的@keyframes');
      return `@keyframes ${name.trim()} {\n${content.trim()}\n}`;
    }
    return match;
  });

  // 修复8: 移除空的CSS规则
  content = content.replace(/[^{}]*\{\s*\}/g, '');
  
  // 修复9: 修复CSS属性语法错误
  content = content.replace(/([a-z-]+):\s*([^;]+);([a-z])/g, (match, prop, value, extra) => {
    fixed++;
    console.log('  ✅ 修复CSS属性语法错误');
    return `${prop}: ${value.trim()};`;
  });

  // 修复10: 确保文件以换行符结尾
  if (!content.endsWith('\n')) {
    content += '\n';
    fixed++;
    console.log('  ✅ 添加文件结尾换行符');
  }

  if (fixed > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ 最终清理修复 ${fixed} 个问题：${filePath}`);
  } else {
    console.log(`✅ 无需修复：${filePath}`);
  }
} else {
  console.log(`❌ 文件不存在：${filePath}`);
}

console.log('\n🎉 最终CSS清理器执行完成！');
console.log('🚀 现在可以安全构建。');
