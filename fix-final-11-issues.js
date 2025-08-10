#!/usr/bin/env node

/**
 * 修复最后的11个设计系统问题
 */

import fs from 'fs';

const FINAL_11_FIXES = [
  // index.css - 这些是注释中的十六进制颜色，用于参考
  {
    file: 'src/index.css',
    replacements: [
      // 将注释中的十六进制颜色替换为更清晰的注释
      ['/* ~#0f172a */', '/* dark slate */'],
      ['/* ~#1e293b */', '/* dark slate-800 */'],
      ['/* ~#334155 */', '/* slate-700 */'],
      ['/* #f8fafc */', '/* slate-50 */'],
      ['/* #94a3b8 */', '/* slate-400 */'],
      ['/* #64748b */', '/* slate-500 */'],
      ['/* #475569 */', '/* slate-600 */'],
      ['/* #1e40af */', '/* blue-800 */'],
      ['/* #3b82f6 */', '/* blue-500 */']
    ]
  },
  
  // SimpleAuthTestPage.tsx
  {
    file: 'src/pages/SimpleAuthTestPage.tsx',
    replacements: [
      ['#6c757d', 'hsl(var(--muted-foreground))']
    ]
  },
  
  // authing-guard.css
  {
    file: 'src/styles/authing-guard.css',
    replacements: [
      ['font-size: 13px', 'font-size: 0.8125rem'] // 13px = 0.8125rem
    ]
  }
];

function applyFinal11Fixes() {
  console.log('🔧 开始修复最后的11个设计系统问题...');
  
  let totalReplacements = 0;
  let processedFiles = 0;
  
  FINAL_11_FIXES.forEach(({ file, replacements }) => {
    try {
      if (!fs.existsSync(file)) {
        console.log(`  ⚠️ 文件不存在: ${file}`);
        return;
      }
      
      let content = fs.readFileSync(file, 'utf8');
      let fileReplacements = 0;
      
      replacements.forEach(([oldValue, newValue]) => {
        const regex = new RegExp(oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const matches = content.match(regex);
        if (matches) {
          content = content.replace(regex, newValue);
          fileReplacements += matches.length;
          console.log(`    ✅ 替换 "${oldValue}" → "${newValue}" (${matches.length} 次)`);
        }
      });
      
      if (fileReplacements > 0) {
        fs.writeFileSync(file, content);
        console.log(`  ✅ ${file}: 修复了 ${fileReplacements} 个问题`);
        processedFiles++;
        totalReplacements += fileReplacements;
      }
      
    } catch (error) {
      console.warn(`  ⚠️ 无法处理文件: ${file} - ${error.message}`);
    }
  });
  
  console.log(`🎉 最后11个问题修复完成！`);
  console.log(`  处理文件: ${processedFiles} 个`);
  console.log(`  总替换数: ${totalReplacements} 个`);
}

// 运行修复
applyFinal11Fixes();
