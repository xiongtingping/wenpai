#!/usr/bin/env node

/**
 * 批量修复常见的硬编码颜色问题
 */

import fs from 'fs';
import path from 'path';

// 常见颜色替换映射
const COLOR_REPLACEMENTS = [
  // 基础颜色
  ['#000000', 'hsl(var(--foreground))'],
  ['#FFFFFF', 'hsl(var(--background))'],
  ['#ffffff', 'hsl(var(--background))'],
  ['#fff', 'hsl(var(--background))'],
  ['#000', 'hsl(var(--foreground))'],
  
  // 常见灰色
  ['#333333', 'hsl(var(--foreground))'],
  ['#333', 'hsl(var(--foreground))'],
  ['#666666', 'hsl(var(--muted-foreground))'],
  ['#666', 'hsl(var(--muted-foreground))'],
  ['#999999', 'hsl(var(--muted-foreground))'],
  ['#999', 'hsl(var(--muted-foreground))'],
  ['#ccc', 'hsl(var(--muted))'],
  ['#cccccc', 'hsl(var(--muted))'],
  
  // 常见蓝色
  ['#3b82f6', 'hsl(var(--primary))'],
  ['#2563eb', 'hsl(var(--primary))'],
  ['#1e40af', 'hsl(var(--primary))'],
  ['#228be6', 'hsl(var(--primary))'],
  
  // 常见红色
  ['#ef4444', 'hsl(var(--destructive))'],
  ['#dc2626', 'hsl(var(--destructive))'],
  ['#b91c1c', 'hsl(var(--destructive))'],
  
  // 常见绿色
  ['#10b981', 'hsl(var(--success))'],
  ['#059669', 'hsl(var(--success))'],
  ['#047857', 'hsl(var(--success))'],
  
  // 常见黄色
  ['#f59e0b', 'hsl(var(--warning))'],
  ['#d97706', 'hsl(var(--warning))'],
  ['#b45309', 'hsl(var(--warning))'],
  
  // 背景色
  ['#f8f9fa', 'hsl(var(--muted))'],
  ['#f3f4f6', 'hsl(var(--muted))'],
  ['#e5e7eb', 'hsl(var(--border))'],
  ['#d1d5db', 'hsl(var(--border))'],
  ['#9ca3af', 'hsl(var(--muted-foreground))'],
  
  // 命名颜色
  ['white', 'hsl(var(--background))'],
  ['black', 'hsl(var(--foreground))'],
  ['red', 'hsl(var(--destructive))'],
  ['blue', 'hsl(var(--primary))'],
  ['green', 'hsl(var(--success))'],
  ['yellow', 'hsl(var(--warning))'],
  ['gray', 'hsl(var(--muted-foreground))'],
  ['grey', 'hsl(var(--muted-foreground))'],
  ['purple', 'hsl(var(--accent))'],
  ['orange', 'hsl(var(--warning))'],
  ['pink', 'hsl(var(--accent))'],
  
  // RGBA 颜色
  ['rgba(0,0,0,0.5)', 'hsl(var(--foreground) / 0.5)'],
  ['rgba(0, 0, 0, 0.5)', 'hsl(var(--foreground) / 0.5)'],
  ['rgba(0,0,0,0.8)', 'hsl(var(--foreground) / 0.8)'],
  ['rgba(0, 0, 0, 0.8)', 'hsl(var(--foreground) / 0.8)'],
  ['rgba(0,0,0,0.04)', 'hsl(var(--foreground) / 0.04)'],
  ['rgba(0, 0, 0, 0.04)', 'hsl(var(--foreground) / 0.04)'],
  ['rgba(0,0,0,0.06)', 'hsl(var(--foreground) / 0.06)'],
  ['rgba(0, 0, 0, 0.06)', 'hsl(var(--foreground) / 0.06)'],
  ['rgba(0,0,0,0.08)', 'hsl(var(--foreground) / 0.08)'],
  ['rgba(0, 0, 0, 0.08)', 'hsl(var(--foreground) / 0.08)'],
];

// 字体大小替换
const FONT_SIZE_REPLACEMENTS = [
  ['font-size: 12px', 'font-size: 0.75rem'], // text-xs
  ['font-size: 14px', 'font-size: 0.875rem'], // text-sm
  ['font-size: 16px', 'font-size: 1rem'], // text-base
  ['font-size: 18px', 'font-size: 1.125rem'], // text-lg
  ['font-size: 20px', 'font-size: 1.25rem'], // text-xl
  ['font-size: 24px', 'font-size: 1.5rem'], // text-2xl
  
  // JavaScript 样式对象
  ["fontSize: '12px'", "fontSize: '0.75rem'"],
  ["fontSize: '14px'", "fontSize: '0.875rem'"],
  ["fontSize: '16px'", "fontSize: '1rem'"],
  ["fontSize: '18px'", "fontSize: '1.125rem'"],
  ["fontSize: '20px'", "fontSize: '1.25rem'"],
  ["fontSize: '24px'", "fontSize: '1.5rem'"],
];

// 字体权重替换
const FONT_WEIGHT_REPLACEMENTS = [
  ['font-weight: 400', 'font-weight: normal'],
  ['font-weight: 500', 'font-weight: 500'],
  ['font-weight: 600', 'font-weight: 600'],
  ['font-weight: 700', 'font-weight: bold'],
  ['font-weight: 800', 'font-weight: 800'],
  ['font-weight: 900', 'font-weight: 900'],
];

function fixColorsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let totalReplacements = 0;
    
    // 修复颜色
    COLOR_REPLACEMENTS.forEach(([oldColor, newColor]) => {
      // 只在非注释行中替换，并且避免在字符串中误替换
      const regex = new RegExp(
        `(?<!//.*?)(?<!\/\\*[\\s\\S]*?)\\b${oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b(?![\\s\\S]*?\\*\\/)`,
        'g'
      );
      
      const simpleRegex = new RegExp(oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(simpleRegex);
      if (matches) {
        content = content.replace(simpleRegex, newColor);
        totalReplacements += matches.length;
      }
    });
    
    // 修复字体大小
    FONT_SIZE_REPLACEMENTS.forEach(([oldSize, newSize]) => {
      const regex = new RegExp(oldSize.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, newSize);
        totalReplacements += matches.length;
      }
    });
    
    if (totalReplacements > 0) {
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ ${filePath}: 修复了 ${totalReplacements} 个问题`);
    }
    
    return totalReplacements;
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
        // 排除我们的工具文件和映射文件
        if (!fullPath.includes('colorTokenMapping.ts') && 
            !fullPath.includes('fix-') && 
            !fullPath.includes('comprehensive-design-scanner.js')) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.warn(`无法读取目录: ${dirPath}`);
  }
  
  return files;
}

function batchFixColors() {
  console.log('🔧 开始批量修复硬编码颜色和字体问题...');
  
  const files = getAllFiles('src');
  let totalReplacements = 0;
  let processedFiles = 0;
  
  files.forEach(file => {
    const replacements = fixColorsInFile(file);
    if (replacements > 0) {
      processedFiles++;
      totalReplacements += replacements;
    }
  });
  
  console.log(`🎉 批量修复完成！`);
  console.log(`  处理文件: ${processedFiles} 个`);
  console.log(`  总替换数: ${totalReplacements} 个`);
}

// 运行修复
batchFixColors();
