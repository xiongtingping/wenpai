#!/usr/bin/env node

/**
 * 🚀 修复!important语法错误
 * 修复ERROR级别修复工具引入的语法错误
 */

import fs from 'fs';
import { glob } from 'glob';

function fixImportantSyntaxErrors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // 修复语法错误：/* TODO: 移除!important important */
  const importantSyntaxError = /\/\*\s*TODO:\s*移除!important\s+important\s*\*\//g;
  if (importantSyntaxError.test(content)) {
    content = content.replace(importantSyntaxError, () => {
      modified = true;
      return '/* TODO: 已移除!important */';
    });
  }
  
  // 修复语法错误：property /* TODO: 移除!important important */;
  const propertyImportantError = /([a-zA-Z-]+):\s*([^;]+?)\s*\/\*\s*TODO:\s*移除!important\s+important\s*\*\//g;
  if (propertyImportantError.test(content)) {
    content = content.replace(propertyImportantError, (match, property, value) => {
      modified = true;
      return `${property}: ${value.trim()}; /* TODO: 已移除!important */`;
    });
  }
  
  // 修复其他可能的语法错误
  const otherSyntaxErrors = [
    // 修复：property value /* TODO: 移除!important  */;
    {
      pattern: /([a-zA-Z-]+):\s*([^;]+?)\s*\/\*\s*TODO:\s*移除!important\s*[^*]*\*\//g,
      replacement: (match, property, value) => `${property}: ${value.trim()}; /* TODO: 已移除!important */`
    }
  ];
  
  for (const { pattern, replacement } of otherSyntaxErrors) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`🔧 已修复!important语法错误：${filePath}`);
    return true;
  }
  
  return false;
}

async function main() {
  console.log('🚀 开始修复!important语法错误...\n');
  
  const cssFiles = glob.sync('src/**/*.css');
  let fixedCount = 0;
  
  for (const file of cssFiles) {
    if (fixImportantSyntaxErrors(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n✅ 修复完成！共修复 ${fixedCount} 个文件的!important语法错误。`);
}

main().catch(console.error);
