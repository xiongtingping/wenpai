#!/usr/bin/env node

/**
 * 自动修复 authing-guard.css 中的硬编码颜色
 */

import fs from 'fs';

const COLOR_REPLACEMENTS = [
  // 边框颜色
  ['border-bottom: 1px solid #e5e7eb', 'border-bottom: 1px solid hsl(var(--border))'],
  ['border: 1px solid #d1d5db', 'border: 1px solid hsl(var(--border))'],
  ['border: 1px solid #fecaca', 'border: 1px solid hsl(var(--destructive))'],
  
  // 文字颜色
  ['color: #6b7280', 'color: hsl(var(--muted-foreground))'],
  ['color: #374151', 'color: hsl(var(--foreground))'],
  ['color: #3b82f6', 'color: hsl(var(--primary))'],
  ['color: #dc2626', 'color: hsl(var(--destructive))'],
  ['color: #9ca3af', 'color: hsl(var(--muted-foreground))'],
  ['color: #2563eb', 'color: hsl(var(--primary))'],
  ['color: white', 'color: hsl(var(--primary-foreground))'],
  
  // 背景颜色
  ['background: #f8fafc', 'background: hsl(var(--accent))'],
  ['background: #3b82f6', 'background: hsl(var(--primary))'],
  ['background: #2563eb', 'background: hsl(var(--primary))'],
  ['background: #9ca3af', 'background: hsl(var(--muted))'],
  ['background: #fef2f2', 'background: hsl(var(--destructive) / 0.1)'],
  ['background: white', 'background: hsl(var(--background))'],
  
  // 边框颜色状态
  ['border-color: #3b82f6', 'border-color: hsl(var(--primary))'],
  ['border-bottom-color: #3b82f6', 'border-bottom-color: hsl(var(--primary))'],
  
  // 阴影
  ['box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1)', 'box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1)'],
  ['box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3)', 'box-shadow: 0 4px 12px hsl(var(--primary) / 0.3)'],
  
  // 占位符颜色
  ['color: #9ca3af !important', 'color: hsl(var(--muted-foreground)) !important'],
];

function fixAuthingGuardColors() {
  const filePath = 'src/styles/authing-guard.css';
  
  console.log('🔧 开始修复 authing-guard.css 中的硬编码颜色...');
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let replacements = 0;
    
    // 执行所有替换
    COLOR_REPLACEMENTS.forEach(([oldColor, newColor]) => {
      const regex = new RegExp(oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, newColor);
        replacements += matches.length;
        console.log(`  ✅ 替换 "${oldColor}" → "${newColor}" (${matches.length} 次)`);
      }
    });
    
    // 写回文件
    fs.writeFileSync(filePath, content);
    
    console.log(`🎉 修复完成！总共替换了 ${replacements} 个硬编码颜色`);
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
    process.exit(1);
  }
}

// 运行修复
fixAuthingGuardColors();
