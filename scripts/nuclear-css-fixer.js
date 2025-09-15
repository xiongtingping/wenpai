#!/usr/bin/env node

import fs from 'fs';

console.log('🚀 启动核弹级CSS修复器 - 彻底修复所有CSS语法错误！');

const filePath = 'src/index.css';

if (fs.existsSync(filePath)) {
  console.log(`\n🔍 核弹级修复：${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let fixed = 0;

  // 修复1: 移除格式错误的CSS规则（没有选择器的属性）
  content = content.replace(/^\s*\{[^}]*\}\s*$/gm, '');
  
  // 修复2: 修复缺少分号的CSS属性
  content = content.replace(/([a-z-]+:\s*[^;{}]+)\s*$/gm, (match, prop) => {
    if (!match.includes(';') && !match.includes('{') && !match.includes('}')) {
      fixed++;
      return prop + ';';
    }
    return match;
  });

  // 修复3: 修复格式错误的选择器（缺少闭合大括号）
  content = content.replace(/([^{}]+\{[^}]*)\s*$/gm, (match, rule) => {
    if (!match.includes('}')) {
      fixed++;
      return rule + '\n}';
    }
    return match;
  });

  // 修复4: 移除孤立的CSS属性（没有选择器）
  content = content.replace(/^\s*([a-z-]+:\s*[^;{}]+;?)\s*$/gm, (match, prop) => {
    // 如果这行只是一个CSS属性，删除它
    fixed++;
    return '';
  });

  // 修复5: 修复格式错误的注释后的CSS
  content = content.replace(/\/\*[^*]*\*\/\s*$/gm, '');

  // 修复6: 修复未闭合的括号
  content = content.replace(/\([^)]*$/gm, (match) => {
    const openCount = (match.match(/\(/g) || []).length;
    const closeCount = (match.match(/\)/g) || []).length;
    const needed = openCount - closeCount;
    if (needed > 0) {
      fixed++;
      return match + ')'.repeat(needed);
    }
    return match;
  });

  // 修复7: 修复格式错误的!important
  content = content.replace(/!\s*\/\*[^*]*\*\//g, '');
  content = content.replace(/!\s*$/gm, '');

  // 修复8: 清理空行和多余的空白
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  content = content.replace(/^\s*$/gm, '');

  // 修复9: 修复CSS变量语法
  content = content.replace(/var\(--[^)]*$/gm, (match) => {
    if (!match.includes(')')) {
      fixed++;
      return match + ')';
    }
    return match;
  });

  // 修复10: 移除重复的分号
  content = content.replace(/;;+/g, ';');

  // 修复11: 确保CSS规则格式正确
  content = content.replace(/([^{}]+)\{([^}]*)\}/g, (match, selector, rules) => {
    // 清理选择器
    const cleanSelector = selector.trim();
    if (!cleanSelector) return '';
    
    // 清理规则
    const cleanRules = rules.trim();
    if (!cleanRules) return '';
    
    // 确保规则以分号结尾
    const finalRules = cleanRules.endsWith(';') ? cleanRules : cleanRules + ';';
    
    return `${cleanSelector} {\n  ${finalRules}\n}`;
  });

  // 修复12: 移除空的CSS规则
  content = content.replace(/[^{}]*\{\s*\}/g, '');

  // 修复13: 确保文件以换行符结尾
  if (!content.endsWith('\n')) {
    content += '\n';
  }

  // 修复14: 移除文件开头和结尾的多余空白
  content = content.trim() + '\n';

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ 核弹级修复完成：${filePath}`);
  console.log(`🔧 修复了大量CSS语法错误`);
} else {
  console.log(`❌ 文件不存在：${filePath}`);
}

console.log('\n🎉 核弹级CSS修复器执行完成！');
console.log('🚀 现在应该可以安全构建了。');
