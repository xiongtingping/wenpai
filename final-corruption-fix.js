#!/usr/bin/env node

/**
 * 最终修复所有剩余的变量名损坏
 * 使用更精确的模式匹配
 */

import fs from 'fs';
import path from 'path';

// 精确的损坏模式修复
const PRECISE_FIXES = [
  // main.tsx 中的问题
  ['const stohsl(var(--destructive))', 'const stored'],
  ['const preferhsl(var(--destructive))', 'const preferred'],
  ['stohsl(var(--destructive))', 'stored'],
  ['preferhsl(var(--destructive))', 'preferred'],
  
  // UnifiedAuthContext.tsx 中的问题
  ['login: (hsl(var(--destructive))irectTo?: string)', 'login: (redirectTo?: string)'],
  ['register: (hsl(var(--destructive))irectTo?: string)', 'register: (redirectTo?: string)'],
  ['hsl(var(--destructive))irectTo', 'redirectTo'],
  
  // 支付相关文件中的问题
  ['Chsl(var(--destructive))itCard', 'CreditCard'],
  ['hsl(var(--destructive))itCard', 'reditCard'],
  ['hsl(var(--destructive))irectToCheckout', 'redirectToCheckout'],
  
  // 过滤相关的问题
  ['filtehsl(var(--destructive))Categories', 'filteredCategories'],
  ['filtehsl(var(--destructive))Emojis', 'filteredEmojis'],
  ['setFiltehsl(var(--destructive))Emojis', 'setFilteredEmojis'],
  ['filtehsl(var(--destructive))AndSortedAssets', 'filteredAndSortedAssets'],
  ['getFiltehsl(var(--destructive))Items', 'getFilteredItems'],
  ['filtehsl(var(--destructive))', 'filtered'],
  ['let filtehsl(var(--destructive))', 'let filtered'],
  ['const filtehsl(var(--destructive))', 'const filtered'],
  
  // 偏好相关的问题
  ['preferhsl(var(--destructive))Keywords', 'preferredKeywords'],
  ['preferhsl(var(--destructive))Platforms', 'preferredPlatforms'],
  ['isPreferhsl(var(--destructive))', 'isPreferred'],
  
  // 存储相关的问题
  ['stohsl(var(--destructive))User', 'storedUser'],
  ['stohsl(var(--destructive))History', 'storedHistory'],
  
  // 过期相关的问题
  ['isExpihsl(var(--destructive))', 'isExpired'],
  ['expihsl(var(--destructive))', 'expired'],
  ['expihsl(var(--destructive))Keys', 'expiredKeys'],
  
  // 结构相关的问题
  ['structuhsl(var(--destructive))', 'structured'],
  
  // 覆盖相关的问题
  ['covehsl(var(--destructive))Dimensions', 'coveredDimensions'],
  
  // 减少相关的问题
  ['hsl(var(--destructive))uce', 'reduce'],
  ['stats.hsl(var(--destructive))uce', 'stats.reduce'],
  
  // 黑名单相关的问题
  ['hsl(var(--foreground))', 'blacklisted'],
  ['some(hsl(var(--foreground))', 'some(blacklisted'],
  ['includes(hsl(var(--foreground)))', 'includes(blacklisted)'],
  
  // CSS 类名问题
  ['bg-hsl(var(--success))-600', 'bg-green-600'],
  ['text-hsl(var(--background))', 'text-white'],
  
  // 其他常见问题
  ['hsl(var(--primary))ook', 'blueook'], // 这个看起来是 Facebook 的一部分
  ['hsl(var(--warning))tures', 'yellowtures'], // 这个看起来是 features 的一部分
  ['hsl(var(--warning))h', 'yellowh'], // 这个看起来是 with 的一部分
];

function fixCorruptedFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let totalReplacements = 0;
    let hasChanges = false;
    
    // 执行所有精确修复
    PRECISE_FIXES.forEach(([corrupted, fixed]) => {
      const regex = new RegExp(corrupted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, fixed);
        totalReplacements += matches.length;
        hasChanges = true;
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

function getAllFiles(dirPath, extensions = ['.tsx', '.ts', '.jsx', '.js', '.css']) {
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

function finalCorruptionFix() {
  console.log('🚨 开始最终修复所有剩余的变量名损坏...');
  
  const files = getAllFiles('src');
  let totalReplacements = 0;
  let processedFiles = 0;
  
  files.forEach(file => {
    const replacements = fixCorruptedFile(file);
    if (replacements > 0) {
      processedFiles++;
      totalReplacements += replacements;
    }
  });
  
  console.log(`🎉 最终修复完成！`);
  console.log(`  处理文件: ${processedFiles} 个`);
  console.log(`  总修复数: ${totalReplacements} 个`);
  
  if (totalReplacements > 0) {
    console.log('\n✅ 建议重启开发服务器以应用修复！');
  } else {
    console.log('\n🎉 没有发现更多的变量名损坏！');
  }
}

// 运行最终修复
finalCorruptionFix();
