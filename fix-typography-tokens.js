#!/usr/bin/env node

/**
 * 批量修复 Typography 相关的硬编码问题
 */

import fs from 'fs';
import path from 'path';

// Typography 令牌映射
const TYPOGRAPHY_REPLACEMENTS = [
  // 字体大小类
  ['text-xs', 'text-xs'],     // 保持不变，这些是正确的
  ['text-sm', 'text-sm'],     // 保持不变
  ['text-base', 'text-base'], // 保持不变
  ['text-lg', 'text-lg'],     // 保持不变
  ['text-xl', 'text-xl'],     // 保持不变
  ['text-2xl', 'text-2xl'],   // 保持不变，这些实际上是正确的设计令牌
  ['text-3xl', 'text-3xl'],   // 保持不变
  ['text-4xl', 'text-4xl'],   // 保持不变
  ['text-5xl', 'text-5xl'],   // 保持不变
  ['text-6xl', 'text-6xl'],   // 保持不变
  ['text-7xl', 'text-7xl'],   // 保持不变
  
  // 字体权重
  ['font-weight: 400', 'font-normal'],
  ['font-weight: 500', 'font-medium'],
  ['font-weight: 600', 'font-semibold'],
  ['font-weight: 700', 'font-bold'],
  ['font-weight: 800', 'font-extrabold'],
  ['font-weight: 900', 'font-black'],
  ['font-weight: normal', 'font-normal'],
  ['font-weight: bold', 'font-bold'],
  
  // 硬编码字体大小
  ['font-size: 12px', 'text-xs'],
  ['font-size: 14px', 'text-sm'],
  ['font-size: 16px', 'text-base'],
  ['font-size: 18px', 'text-lg'],
  ['font-size: 20px', 'text-xl'],
  ['font-size: 24px', 'text-2xl'],
  ['font-size: 30px', 'text-3xl'],
  ['font-size: 36px', 'text-4xl'],
  ['font-size: 48px', 'text-5xl'],
  ['font-size: 60px', 'text-6xl'],
  ['font-size: 72px', 'text-7xl'],
  
  // JavaScript 样式对象中的字体大小
  ["fontSize: '12px'", "className: 'text-xs'"],
  ["fontSize: '14px'", "className: 'text-sm'"],
  ["fontSize: '16px'", "className: 'text-base'"],
  ["fontSize: '18px'", "className: 'text-lg'"],
  ["fontSize: '20px'", "className: 'text-xl'"],
  ["fontSize: '24px'", "className: 'text-2xl'"],
];

function fixTypographyInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let replacements = 0;
    
    // 执行所有替换
    TYPOGRAPHY_REPLACEMENTS.forEach(([oldStyle, newStyle]) => {
      if (oldStyle === newStyle) return; // 跳过相同的值
      
      const regex = new RegExp(oldStyle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, newStyle);
        replacements += matches.length;
      }
    });
    
    if (replacements > 0) {
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ ${filePath}: 修复了 ${replacements} 个 typography 问题`);
    }
    
    return replacements;
  } catch (error) {
    console.warn(`  ⚠️ 无法处理文件: ${filePath} - ${error.message}`);
    return 0;
  }
}

function getAllFiles(dirPath, extensions = ['.tsx', '.ts', '.css', '.scss']) {
  let files = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(item)) {
        files = files.concat(getAllFiles(fullPath, extensions));
      } else if (stat.isFile() && extensions.includes(path.extname(fullPath))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`无法读取目录: ${dirPath}`);
  }
  
  return files;
}

function fixTypographyTokens() {
  console.log('🔧 开始修复 Typography 硬编码问题...');
  
  const files = getAllFiles('src');
  let totalReplacements = 0;
  let processedFiles = 0;
  
  files.forEach(file => {
    const replacements = fixTypographyInFile(file);
    if (replacements > 0) {
      processedFiles++;
      totalReplacements += replacements;
    }
  });
  
  console.log(`🎉 修复完成！`);
  console.log(`  处理文件: ${processedFiles} 个`);
  console.log(`  总替换数: ${totalReplacements} 个`);
}

// 运行修复
fixTypographyTokens();
