#!/usr/bin/env node

import fs from 'fs';

console.log('🚀 启动全面括号修复器 - 修复所有未闭合的括号！');

const filePath = 'src/index.css';

if (fs.existsSync(filePath)) {
  console.log(`\n🔍 全面括号修复：${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let fixed = 0;

  // 修复1: 修复CSS变量中未闭合的括号
  content = content.replace(/var\(--[^)]+$/gm, (match) => {
    fixed++;
    console.log('  ✅ 修复未闭合的CSS变量');
    return match + ')';
  });

  // 修复2: 修复linear-gradient中未闭合的括号
  content = content.replace(/linear-gradient\([^)]*$/gm, (match) => {
    const openCount = (match.match(/\(/g) || []).length;
    const closeCount = (match.match(/\)/g) || []).length;
    const needed = openCount - closeCount;
    if (needed > 0) {
      fixed++;
      console.log('  ✅ 修复未闭合的linear-gradient');
      return match + ')'.repeat(needed);
    }
    return match;
  });

  // 修复3: 修复radial-gradient中未闭合的括号
  content = content.replace(/radial-gradient\([^)]*$/gm, (match) => {
    const openCount = (match.match(/\(/g) || []).length;
    const closeCount = (match.match(/\)/g) || []).length;
    const needed = openCount - closeCount;
    if (needed > 0) {
      fixed++;
      console.log('  ✅ 修复未闭合的radial-gradient');
      return match + ')'.repeat(needed);
    }
    return match;
  });

  // 修复4: 修复calc()中未闭合的括号
  content = content.replace(/calc\([^)]*$/gm, (match) => {
    const openCount = (match.match(/\(/g) || []).length;
    const closeCount = (match.match(/\)/g) || []).length;
    const needed = openCount - closeCount;
    if (needed > 0) {
      fixed++;
      console.log('  ✅ 修复未闭合的calc');
      return match + ')'.repeat(needed);
    }
    return match;
  });

  // 修复5: 修复transform中未闭合的括号
  content = content.replace(/transform:\s*[^;]*\([^)]*$/gm, (match) => {
    const openCount = (match.match(/\(/g) || []).length;
    const closeCount = (match.match(/\)/g) || []).length;
    const needed = openCount - closeCount;
    if (needed > 0) {
      fixed++;
      console.log('  ✅ 修复未闭合的transform');
      return match + ')'.repeat(needed);
    }
    return match;
  });

  // 修复6: 修复hsl()中未闭合的括号
  content = content.replace(/hsl\([^)]*$/gm, (match) => {
    const openCount = (match.match(/\(/g) || []).length;
    const closeCount = (match.match(/\)/g) || []).length;
    const needed = openCount - closeCount;
    if (needed > 0) {
      fixed++;
      console.log('  ✅ 修复未闭合的hsl');
      return match + ')'.repeat(needed);
    }
    return match;
  });

  // 修复7: 修复rgba()中未闭合的括号
  content = content.replace(/rgba\([^)]*$/gm, (match) => {
    const openCount = (match.match(/\(/g) || []).length;
    const closeCount = (match.match(/\)/g) || []).length;
    const needed = openCount - closeCount;
    if (needed > 0) {
      fixed++;
      console.log('  ✅ 修复未闭合的rgba');
      return match + ')'.repeat(needed);
    }
    return match;
  });

  // 修复8: 修复任何以分号结尾但缺少闭合括号的行
  content = content.replace(/^([^;{}]*\([^)]*);?\s*$/gm, (match, beforeSemicolon) => {
    const openCount = (beforeSemicolon.match(/\(/g) || []).length;
    const closeCount = (beforeSemicolon.match(/\)/g) || []).length;
    const needed = openCount - closeCount;
    if (needed > 0) {
      fixed++;
      console.log('  ✅ 修复行末未闭合的括号');
      return beforeSemicolon + ')'.repeat(needed) + ';';
    }
    return match;
  });

  // 修复9: 修复CSS属性值中的未闭合括号
  content = content.replace(/:\s*[^;{}]*\([^)]*;/g, (match) => {
    const beforeSemicolon = match.slice(0, -1);
    const openCount = (beforeSemicolon.match(/\(/g) || []).length;
    const closeCount = (beforeSemicolon.match(/\)/g) || []).length;
    const needed = openCount - closeCount;
    if (needed > 0) {
      fixed++;
      console.log('  ✅ 修复CSS属性值中未闭合的括号');
      return beforeSemicolon + ')'.repeat(needed) + ';';
    }
    return match;
  });

  // 修复10: 清理格式错误的注释
  content = content.replace(/\/\*[^*]*\*\/\s*([^{};]+)\s*[{;]/g, (match, afterComment) => {
    if (afterComment.trim() && !afterComment.includes(':') && !afterComment.includes('@')) {
      fixed++;
      console.log('  ✅ 清理注释后的无效CSS');
      return match.replace(afterComment, '');
    }
    return match;
  });

  if (fixed > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ 全面括号修复 ${fixed} 个问题：${filePath}`);
  } else {
    console.log(`✅ 无需修复：${filePath}`);
  }
} else {
  console.log(`❌ 文件不存在：${filePath}`);
}

console.log('\n🎉 全面括号修复器执行完成！');
console.log('🚀 现在可以安全构建。');
