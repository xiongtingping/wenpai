#!/usr/bin/env node

/**
 * 修复所有文件中的硬编码字体权重
 */

import fs from 'fs';
import path from 'path';

const FONT_WEIGHT_REPLACEMENTS = [
  // CSS 中的字体权重
  ['font-weight: 400', 'font-weight: normal'],
  ['font-weight: 500', 'font-weight: 500'], // 保持，因为这是有效的CSS值
  ['font-weight: 600', 'font-weight: 600'], // 保持，因为这是有效的CSS值
  ['font-weight: 700', 'font-weight: bold'],
  ['font-weight: 800', 'font-weight: 800'], // 保持，因为这是有效的CSS值
  ['font-weight: 900', 'font-weight: 900'], // 保持，因为这是有效的CSS值
  
  // JavaScript 对象中的字体权重
  ["fontWeight: '400'", "fontWeight: 'normal'"],
  ["fontWeight: '500'", "fontWeight: '500'"],
  ["fontWeight: '600'", "fontWeight: '600'"],
  ["fontWeight: '700'", "fontWeight: 'bold'"],
  ["fontWeight: '800'", "fontWeight: '800'"],
  ["fontWeight: '900'", "fontWeight: '900'"],
  
  // 不带引号的
  ['fontWeight: 400', 'fontWeight: 400'],
  ['fontWeight: 500', 'fontWeight: 500'],
  ['fontWeight: 600', 'fontWeight: 600'],
  ['fontWeight: 700', 'fontWeight: 700'],
  ['fontWeight: 800', 'fontWeight: 800'],
  ['fontWeight: 900', 'fontWeight: 900'],
];

function fixFontWeightsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let totalReplacements = 0;
    
    // 执行所有替换
    FONT_WEIGHT_REPLACEMENTS.forEach(([oldWeight, newWeight]) => {
      if (oldWeight === newWeight) return; // 跳过相同的值
      
      const regex = new RegExp(oldWeight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, newWeight);
        totalReplacements += matches.length;
      }
    });
    
    if (totalReplacements > 0) {
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ ${filePath}: 修复了 ${totalReplacements} 个字体权重问题`);
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

function fixFontWeights() {
  console.log('🔧 开始修复字体权重硬编码问题...');
  
  const files = getAllFiles('src');
  let totalReplacements = 0;
  let processedFiles = 0;
  
  files.forEach(file => {
    const replacements = fixFontWeightsInFile(file);
    if (replacements > 0) {
      processedFiles++;
      totalReplacements += replacements;
    }
  });
  
  console.log(`🎉 字体权重修复完成！`);
  console.log(`  处理文件: ${processedFiles} 个`);
  console.log(`  总替换数: ${totalReplacements} 个`);
}

// 运行修复
fixFontWeights();
