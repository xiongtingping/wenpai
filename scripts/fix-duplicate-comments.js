#!/usr/bin/env node

/**
 * 🚀 修复重复注释问题
 */

import fs from 'fs';
import { glob } from 'glob';

function fixDuplicateComments(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // 修复重复注释：/* /* ... */ ... */
  const duplicateCommentRegex = /\/\*\s*\/\*([^*]+)\*\/([^*]*)\*\//g;
  if (duplicateCommentRegex.test(content)) {
    content = content.replace(duplicateCommentRegex, (match, inner, outer) => {
      modified = true;
      return `/*${inner}*/`;
    });
  }
  
  // 修复重复的CRITICAL修复注释
  const duplicateCriticalRegex = /(🚨 CRITICAL修复：[^*]+)\*\/\s*🚨 CRITICAL修复：[^*]+\*\//g;
  if (duplicateCriticalRegex.test(content)) {
    content = content.replace(duplicateCriticalRegex, (match, first) => {
      modified = true;
      return `${first}*/`;
    });
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`🔧 已修复重复注释：${filePath}`);
    return true;
  }
  
  return false;
}

async function main() {
  console.log('🚀 开始修复重复注释...\n');
  
  const cssFiles = glob.sync('src/**/*.css');
  let fixedCount = 0;
  
  for (const file of cssFiles) {
    if (fixDuplicateComments(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n✅ 修复完成！共修复 ${fixedCount} 个文件的重复注释。`);
}

main().catch(console.error);
