#!/usr/bin/env node

/**
 * 🚀 修复CSS语法错误
 * 修复批量修复工具引入的语法错误
 */

import fs from 'fs';
import { glob } from 'glob';

function fixCSSFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // 修复语法错误：var(--color-primary) /* TODO: 替换硬编码颜色 rgba(...) */
  const colorSyntaxError = /var\(--[^)]+\)\s*\/\*\s*TODO:\s*替换硬编码颜色\s*([^*]+)\s*\*\//g;
  if (colorSyntaxError.test(content)) {
    content = content.replace(colorSyntaxError, (match, color) => {
      modified = true;
      return color.trim();
    });
  }
  
  // 修复语法错误：var(--spacing-X) /* TODO: 替换硬编码尺寸 Xpx */
  const sizeSyntaxError = /var\(--spacing-\d+\)\s*\/\*\s*TODO:\s*替换硬编码尺寸\s*(\d+px)\s*\*\//g;
  if (sizeSyntaxError.test(content)) {
    content = content.replace(sizeSyntaxError, (match, size) => {
      modified = true;
      return size;
    });
  }
  
  // 修复语法错误：-var(--spacing-X) /* TODO: 替换硬编码尺寸 Xpx */
  const negativeSizeSyntaxError = /-var\(--spacing-\d+\)\s*\/\*\s*TODO:\s*替换硬编码尺寸\s*(\d+px)\s*\*\//g;
  if (negativeSizeSyntaxError.test(content)) {
    content = content.replace(negativeSizeSyntaxError, (match, size) => {
      modified = true;
      return `-${size}`;
    });
  }

  // 修复语法错误：!/* important 🚨 ERROR修复：移除!important */
  const importantSyntaxError = /!\s*\/\*\s*important[^*]*\*\//g;
  if (importantSyntaxError.test(content)) {
    content = content.replace(importantSyntaxError, () => {
      modified = true;
      return '';
    });
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`🔧 已修复语法错误：${filePath}`);
    return true;
  }
  
  return false;
}

async function main() {
  console.log('🚀 开始修复CSS语法错误...\n');
  
  const cssFiles = glob.sync('src/**/*.css');
  let fixedCount = 0;
  
  for (const file of cssFiles) {
    if (fixCSSFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n✅ 修复完成！共修复 ${fixedCount} 个文件的语法错误。`);
}

main().catch(console.error);
