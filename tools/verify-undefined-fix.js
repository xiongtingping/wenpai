#!/usr/bin/env node

/**
 * 🔍 验证undefined拼接修复效果
 * 检查所有修复后的文件是否正确使用了安全工具函数
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🔍 开始验证undefined拼接修复效果...\n');

// 需要检查的文件列表
const filesToCheck = [
  'src/components/ui/dev-tools.tsx',
  'src/pages/VIPPage.tsx', 
  'src/pages/PermissionSystemTestPage.tsx',
  'src/pages/FunctionalityTestPage.tsx'
];

// 危险模式检测
const dangerousPatterns = [
  {
    pattern: /user\?\.\w+\s*\|\|\s*user\?\.\w+/g,
    description: '用户属性逻辑或拼接'
  },
  {
    pattern: /user\?\.\w+\s*\|\|\s*['"][^'"]*['"]/g,
    description: '用户属性与字符串逻辑或拼接'
  },
  {
    pattern: /\{user\.\w+\}/g,
    description: 'JSX中直接使用用户属性'
  },
  {
    pattern: /`[^`]*\$\{user\?\.\w+\}[^`]*`/g,
    description: '模板字符串中直接使用用户属性'
  }
];

// 安全模式检测
const safePatterns = [
  'getUserDisplayName',
  'getUserAvatar',
  'getUserEmail',
  'getUserUsername',
  'getUserId',
  'getUserPhone'
];

let totalIssues = 0;
let totalSafeUsages = 0;

filesToCheck.forEach(filePath => {
  console.log(`📁 检查文件: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ 文件不存在`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  let fileIssues = 0;
  let fileSafeUsages = 0;
  
  // 检查危险模式
  dangerousPatterns.forEach(({ pattern, description }) => {
    const matches = content.match(pattern);
    if (matches) {
      console.log(`   🚨 发现危险模式: ${description}`);
      matches.forEach(match => {
        console.log(`      - ${match}`);
        fileIssues++;
      });
    }
  });
  
  // 检查安全模式使用
  safePatterns.forEach(safeFunction => {
    const regex = new RegExp(safeFunction, 'g');
    const matches = content.match(regex);
    if (matches) {
      fileSafeUsages += matches.length;
      console.log(`   ✅ 使用安全函数 ${safeFunction}: ${matches.length} 次`);
    }
  });
  
  if (fileIssues === 0 && fileSafeUsages > 0) {
    console.log(`   🎉 文件修复完成，无危险模式，使用了 ${fileSafeUsages} 个安全函数调用`);
  } else if (fileIssues === 0) {
    console.log(`   ✅ 文件无危险模式`);
  }
  
  totalIssues += fileIssues;
  totalSafeUsages += fileSafeUsages;
  console.log('');
});

// 总结报告
console.log('📊 修复验证总结:');
console.log(`   🚨 剩余危险模式: ${totalIssues} 个`);
console.log(`   ✅ 安全函数使用: ${totalSafeUsages} 次`);

if (totalIssues === 0) {
  console.log('\n🎉 恭喜！所有检查的文件都已正确修复，未发现危险的undefined拼接模式！');
  console.log('✅ 修复验证通过');
} else {
  console.log('\n⚠️  仍有部分文件存在危险模式，需要进一步修复');
  console.log('❌ 修复验证失败');
  process.exit(1);
}

// 额外检查：扫描整个src目录中的危险模式
console.log('\n🔍 执行全项目扫描...');

try {
  const result = execSync('grep -r "user\\?\\.\\w*\\s*||\\s*user\\?\\.\\w*" src/ --include="*.tsx" --include="*.ts" | grep -v "utils/userDisplayUtils\\|utils/safeStringUtils\\|hooks/usePermission"', { encoding: 'utf8' });
  if (result.trim()) {
    console.log('⚠️  发现其他文件中的危险模式:');
    console.log(result);
  }
} catch (error) {
  console.log('✅ 全项目扫描未发现其他危险模式');
}

console.log('\n🔍 验证完成！');
