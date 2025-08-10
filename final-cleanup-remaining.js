#!/usr/bin/env node

/**
 * 修复最后剩余的31个问题
 */

import fs from 'fs';

const REMAINING_FIXES = [
  // UnifiedEmojiManager_backup.tsx - RGB colors
  {
    file: 'src/components/shared/UnifiedEmojiManager_backup.tsx',
    replacements: [
      ['rgba(0,0,0,0.3)', 'hsl(var(--foreground) / 0.3)'],
      ['rgba(0,0,0,0.2)', 'hsl(var(--foreground) / 0.2)'],
      ['rgba(0,0,0,0.1)', 'hsl(var(--foreground) / 0.1)']
    ]
  },
  
  // index.css - remaining hex colors
  {
    file: 'src/index.css',
    replacements: [
      ['#f9fafb', 'hsl(var(--muted))'],
      ['#111827', 'hsl(var(--foreground))'],
      ['#6b7280', 'hsl(var(--muted-foreground))'],
      ['#374151', 'hsl(var(--foreground))'],
      ['#9ca3af', 'hsl(var(--muted-foreground))'],
      ['#d1d5db', 'hsl(var(--border))'],
      ['#e5e7eb', 'hsl(var(--border))'],
      ['#f3f4f6', 'hsl(var(--muted))'],
      ['#1f2937', 'hsl(var(--foreground))'],
      ['#4b5563', 'hsl(var(--muted-foreground))']
    ]
  },
  
  // SimpleAuthTestPage.tsx - remaining colors
  {
    file: 'src/pages/SimpleAuthTestPage.tsx',
    replacements: [
      ['#0066cc', 'hsl(var(--primary))'],
      ['#e8f5e8', 'hsl(var(--success) / 0.1)'],
      ['#007bff', 'hsl(var(--primary))'],
      ['#28a745', 'hsl(var(--success))'],
      ['#17a2b8', 'hsl(var(--primary))'],
      ['#dc3545', 'hsl(var(--destructive))']
    ]
  }
];

function applyRemainingFixes() {
  console.log('🔧 开始修复最后剩余的设计系统问题...');
  
  let totalReplacements = 0;
  let processedFiles = 0;
  
  REMAINING_FIXES.forEach(({ file, replacements }) => {
    try {
      if (!fs.existsSync(file)) {
        console.log(`  ⚠️ 文件不存在: ${file}`);
        return;
      }
      
      let content = fs.readFileSync(file, 'utf8');
      let fileReplacements = 0;
      
      replacements.forEach(([oldColor, newColor]) => {
        const regex = new RegExp(oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const matches = content.match(regex);
        if (matches) {
          content = content.replace(regex, newColor);
          fileReplacements += matches.length;
          console.log(`    ✅ 替换 "${oldColor}" → "${newColor}" (${matches.length} 次)`);
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
  
  console.log(`🎉 最后剩余问题修复完成！`);
  console.log(`  处理文件: ${processedFiles} 个`);
  console.log(`  总替换数: ${totalReplacements} 个`);
}

// 运行修复
applyRemainingFixes();
