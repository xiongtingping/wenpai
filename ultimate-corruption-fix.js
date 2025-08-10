#!/usr/bin/env node

/**
 * 终极修复所有剩余的变量名损坏
 * 使用更全面的模式匹配和替换
 */

import fs from 'fs';
import path from 'path';

// 终极修复模式 - 涵盖所有可能的损坏情况
const ULTIMATE_FIXES = [
  // 存储相关的所有变体
  ['const stohsl(var(--destructive))', 'const stored'],
  ['let stohsl(var(--destructive))', 'let stored'],
  ['stohsl(var(--destructive))', 'stored'],
  
  // 过滤相关的所有变体
  ['filtehsl(var(--destructive))', 'filtered'],
  ['let filtehsl(var(--destructive))', 'let filtered'],
  ['const filtehsl(var(--destructive))', 'const filtered'],
  
  // 偏好相关的所有变体
  ['preferhsl(var(--destructive))', 'preferred'],
  ['isPreferhsl(var(--destructive))', 'isPreferred'],
  ['const preferhsl(var(--destructive))', 'const preferred'],
  ['const isPreferhsl(var(--destructive))', 'const isPreferred'],
  
  // 过期相关的所有变体
  ['isExpihsl(var(--destructive))', 'isExpired'],
  ['expihsl(var(--destructive))', 'expired'],
  
  // 结构相关的所有变体
  ['structuhsl(var(--destructive))', 'structured'],
  ['const structuhsl(var(--destructive))', 'const structured'],
  
  // 覆盖相关的所有变体
  ['covehsl(var(--destructive))', 'covered'],
  
  // 必需相关的所有变体
  ['isRequihsl(var(--destructive))', 'isRequired'],
  ['requihsl(var(--destructive))', 'required'],
  
  // 共享相关的所有变体
  ['shahsl(var(--destructive))', 'shared'],
  ['@/components/shahsl(var(--destructive))', '@/components/shared'],
  
  // 信用卡相关的所有变体
  ['Chsl(var(--destructive))itCard', 'CreditCard'],
  ['hsl(var(--destructive))itCard', 'reditCard'],
  
  // 重定向相关的所有变体
  ['hsl(var(--destructive))irectTo', 'redirectTo'],
  ['hsl(var(--destructive))irectUri', 'redirectUri'],
  ['hsl(var(--destructive))irectToCheckout', 'redirectToCheckout'],
  ['hsl(var(--destructive))irect', 'redirect'],
  
  // 减少相关的所有变体
  ['hsl(var(--destructive))uce', 'reduce'],
  ['stats.hsl(var(--destructive))uce', 'stats.reduce'],
  
  // 黑名单相关的所有变体
  ['hsl(var(--foreground))', 'blacklisted'],
  ['some(hsl(var(--foreground))', 'some(blacklisted'],
  ['includes(hsl(var(--foreground)))', 'includes(blacklisted)'],
  ['blacklist.some(hsl(var(--foreground))', 'blacklist.some(blacklisted'],
  
  // CSS 类名问题
  ['bg-hsl(var(--success))-600', 'bg-green-600'],
  ['text-hsl(var(--background))', 'text-white'],
  ['bg-hsl(var(--warning))-50', 'bg-yellow-50'],
  ['border-hsl(var(--warning))-200', 'border-yellow-200'],
  
  // 其他常见问题
  ['hsl(var(--primary))ook', 'blueook'],
  ['hsl(var(--warning))tures', 'yellowtures'],
  ['hsl(var(--warning))h', 'yellowh'],
  ['hsl(var(--foreground))berry', 'blackberry'],
  
  // 函数参数中的问题
  ['(hsl(var(--destructive))irectTo?: string)', '(redirectTo?: string)'],
  ['login: (hsl(var(--destructive))irectTo?: string)', 'login: (redirectTo?: string)'],
  ['register: (hsl(var(--destructive))irectTo?: string)', 'register: (redirectTo?: string)'],
  
  // 导入路径中的问题
  ['@/components/shahsl(var(--destructive))', '@/components/shared'],
  
  // 对象属性中的问题
  ['.hsl(var(--destructive))uce', '.reduce'],
  ['.hsl(var(--destructive))irectTo', '.redirectTo'],
  ['.hsl(var(--destructive))irectUri', '.redirectUri'],
  
  // 数组方法中的问题
  ['preferredPlatforms: isPreferhsl(var(--destructive))', 'preferredPlatforms: isPreferred'],
  
  // 接口定义中的问题
  ['isExpihsl(var(--destructive)): boolean', 'isExpired: boolean'],
  ['expihsl(var(--destructive)): number', 'expired: number'],
  
  // 变量声明中的问题
  ['const isExpihsl(var(--destructive))', 'const isExpired'],
  ['let isExpihsl(var(--destructive))', 'let isExpired'],
];

function fixCorruptedFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let totalReplacements = 0;
    let hasChanges = false;
    
    // 执行所有终极修复
    ULTIMATE_FIXES.forEach(([corrupted, fixed]) => {
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

function ultimateCorruptionFix() {
  console.log('🚀 开始终极修复所有剩余的变量名损坏...');
  
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
  
  console.log(`🎉 终极修复完成！`);
  console.log(`  处理文件: ${processedFiles} 个`);
  console.log(`  总修复数: ${totalReplacements} 个`);
  
  if (totalReplacements > 0) {
    console.log('\n✅ 建议重启开发服务器以应用修复！');
  } else {
    console.log('\n🎉 没有发现更多的变量名损坏！');
  }
}

// 运行终极修复
ultimateCorruptionFix();
