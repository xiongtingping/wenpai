#!/usr/bin/env node

/**
 * 全面修复所有被错误替换的变量名
 * 搜索并修复所有 "hsl(var(--*))" 后面跟着字母的情况
 */

import fs from 'fs';
import path from 'path';

// 常见的被错误替换的单词模式
const COMMON_CORRUPTIONS = [
  // "red" 被替换的情况
  ['hsl(var(--destructive))', 'red'],
  
  // "white" 被替换的情况  
  ['hsl(var(--background))', 'white'],
  
  // "black" 被替换的情况
  ['hsl(var(--foreground))', 'black'],
  
  // "blue" 被替换的情况
  ['hsl(var(--primary))', 'blue'],
  
  // "green" 被替换的情况
  ['hsl(var(--success))', 'green'],
  
  // "yellow" 被替换的情况
  ['hsl(var(--warning))', 'yellow'],
  
  // "gray/grey" 被替换的情况
  ['hsl(var(--muted-foreground))', 'gray'],
  ['hsl(var(--muted))', 'gray'],
  
  // "purple" 被替换的情况
  ['hsl(var(--accent))', 'purple'],
];

function findAndFixCorruptions(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let totalReplacements = 0;
    let hasChanges = false;
    
    // 查找所有可能的损坏模式
    // 匹配 hsl(var(--*)) 后面直接跟着字母的情况
    const corruptionPattern = /hsl\(var\(--[^)]+\)\)([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    
    let match;
    const replacements = [];
    
    while ((match = corruptionPattern.exec(content)) !== null) {
      const fullMatch = match[0];
      const suffix = match[1];
      
      // 尝试重建原始单词
      let originalWord = '';
      
      // 检查每个常见的颜色替换
      for (const [colorToken, colorName] of COMMON_CORRUPTIONS) {
        if (fullMatch.startsWith(colorToken)) {
          originalWord = colorName + suffix;
          break;
        }
      }
      
      if (originalWord) {
        replacements.push([fullMatch, originalWord]);
      }
    }
    
    // 执行替换
    replacements.forEach(([corrupted, fixed]) => {
      const regex = new RegExp(corrupted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, fixed);
        totalReplacements += matches.length;
        hasChanges = true;
        console.log(`    🔧 ${corrupted} → ${fixed} (${matches.length} 次)`);
      }
    });
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ ${filePath}: 修复了 ${totalReplacements} 个损坏的变量`);
    }
    
    return totalReplacements;
  } catch (error) {
    console.warn(`  ⚠️ 无法处理文件: ${filePath} - ${error.message}`);
    return 0;
  }
}

function getAllFiles(dirPath, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  let files = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(item)) {
        files = files.concat(getAllFiles(fullPath, extensions));
      } else if (stat.isFile() && extensions.includes(path.extname(fullPath))) {
        // 排除工具文件
        const fileName = path.basename(fullPath);
        if (!fileName.includes('fix-') && 
            !fileName.includes('comprehensive-design-scanner.js') &&
            !fileName.includes('colorTokenMapping.ts')) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.warn(`无法读取目录: ${dirPath}`);
  }
  
  return files;
}

function comprehensiveCorruptionFix() {
  console.log('🔍 开始全面搜索和修复变量名损坏...');
  
  const files = getAllFiles('src');
  let totalReplacements = 0;
  let processedFiles = 0;
  
  files.forEach(file => {
    const replacements = findAndFixCorruptions(file);
    if (replacements > 0) {
      processedFiles++;
      totalReplacements += replacements;
    }
  });
  
  console.log(`🎉 全面修复完成！`);
  console.log(`  处理文件: ${processedFiles} 个`);
  console.log(`  总修复数: ${totalReplacements} 个`);
  
  if (totalReplacements > 0) {
    console.log('\n✅ 建议重启开发服务器以应用修复！');
  } else {
    console.log('\n🎉 没有发现更多的变量名损坏！');
  }
}

// 运行全面修复
comprehensiveCorruptionFix();
