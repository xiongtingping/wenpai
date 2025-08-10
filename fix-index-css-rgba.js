#!/usr/bin/env node

/**
 * 修复 index.css 中的 RGBA 颜色值
 */

import fs from 'fs';

const RGBA_REPLACEMENTS = [
  // 黑色 RGBA
  ['rgba(0, 0, 0, 0.12)', 'hsl(var(--foreground) / 0.12)'],
  ['rgba(0, 0, 0, 0.25)', 'hsl(var(--foreground) / 0.25)'],
  ['rgba(0, 0, 0, 0.1)', 'hsl(var(--foreground) / 0.1)'],
  ['rgba(0, 0, 0, 0.15)', 'hsl(var(--foreground) / 0.15)'],
  
  // 白色 RGBA
  ['rgba(255, 255, 255, 0.9)', 'hsl(var(--background) / 0.9)'],
  ['rgba(255, 255, 255, 0.4)', 'hsl(var(--background) / 0.4)'],
  ['rgba(255, 255, 255, 0.25)', 'hsl(var(--background) / 0.25)'],
  ['rgba(255, 255, 255, 0.18)', 'hsl(var(--background) / 0.18)'],
  ['rgba(255, 255, 255, 0.1)', 'hsl(var(--background) / 0.1)'],
  ['rgba(255, 255, 255, 0.2)', 'hsl(var(--background) / 0.2)'],
  ['rgba(255, 255, 255, 0.15)', 'hsl(var(--background) / 0.15)'],
  
  // 蓝色 RGBA (主色调)
  ['rgba(99, 102, 241, 0.3)', 'hsl(var(--primary) / 0.3)'],
  ['rgba(99, 102, 241, 0.2)', 'hsl(var(--primary) / 0.2)'],
  ['rgba(99, 102, 241, 0.03)', 'hsl(var(--primary) / 0.03)'],
  ['rgba(99, 102, 241, 0.02)', 'hsl(var(--primary) / 0.02)'],
  ['rgba(99, 102, 241, 0.05)', 'hsl(var(--primary) / 0.05)'],
  ['rgba(59, 130, 246, 0.5)', 'hsl(var(--primary) / 0.5)'],
  ['rgba(59, 130, 246, 0.8)', 'hsl(var(--primary) / 0.8)'],
  ['rgba(59, 130, 246, 0.6)', 'hsl(var(--primary) / 0.6)'],
  ['rgba(59, 130, 246, 0.05)', 'hsl(var(--primary) / 0.05)'],
  
  // 青色 RGBA
  ['rgba(6, 182, 212, 0.3)', 'hsl(var(--primary) / 0.3)'],
  ['rgba(6, 182, 212, 0.2)', 'hsl(var(--primary) / 0.2)'],
  
  // 黄色 RGBA
  ['rgba(245, 158, 11, 0.3)', 'hsl(var(--warning) / 0.3)'],
  ['rgba(245, 158, 11, 0.2)', 'hsl(var(--warning) / 0.2)'],
  
  // 紫色 RGBA
  ['rgba(139, 92, 246, 0.03)', 'hsl(var(--accent) / 0.03)'],
  ['rgba(139, 92, 246, 0.02)', 'hsl(var(--accent) / 0.02)'],
  ['rgba(168, 85, 247, 0.03)', 'hsl(var(--accent) / 0.03)'],
  ['rgba(168, 85, 247, 0.02)', 'hsl(var(--accent) / 0.02)'],
  
  // 绿色 RGBA
  ['rgba(34, 197, 94, 0.8)', 'hsl(var(--success) / 0.8)'],
  ['rgba(34, 197, 94, 0)', 'hsl(var(--success) / 0)'],
];

function fixIndexCssRgba() {
  const filePath = 'src/index.css';
  
  console.log('🔧 开始修复 index.css 中的 RGBA 颜色值...');
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let totalReplacements = 0;
    
    // 执行所有替换
    RGBA_REPLACEMENTS.forEach(([oldRgba, newHsl]) => {
      const regex = new RegExp(oldRgba.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, newHsl);
        totalReplacements += matches.length;
        console.log(`  ✅ 替换 "${oldRgba}" → "${newHsl}" (${matches.length} 次)`);
      }
    });
    
    // 写回文件
    fs.writeFileSync(filePath, content);
    
    console.log(`🎉 修复完成！总共替换了 ${totalReplacements} 个 RGBA 颜色值`);
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
    process.exit(1);
  }
}

// 运行修复
fixIndexCssRgba();
