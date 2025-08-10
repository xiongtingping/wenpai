#!/usr/bin/env node

/**
 * 最终清理所有剩余的硬编码颜色
 */

import fs from 'fs';

const FINAL_FIXES = [
  // TrustSection.tsx
  {
    file: 'src/components/landing.backup/TrustSection.tsx',
    replacements: [
      ['#f9f9f9', 'hsl(var(--muted))']
    ]
  },
  
  // UnifiedEmojiManager_backup.tsx
  {
    file: 'src/components/shared/UnifiedEmojiManager_backup.tsx',
    replacements: [
      ['#6C5CE7', 'hsl(var(--accent))'],
      ['#667eea', 'hsl(var(--primary))'],
      ['#764ba2', 'hsl(var(--accent))']
    ]
  },
  
  // platforms.tsx
  {
    file: 'src/constants/platforms.tsx',
    replacements: [
      ['#Faceb', 'hsl(var(--primary))'] // 这看起来像是截断的Facebook颜色
    ]
  },
  
  // HomePage.old.tsx
  {
    file: 'src/pages/HomePage.old.tsx',
    replacements: [
      ['#fea', 'hsl(var(--warning))']
    ]
  },
  
  // SimpleAuthTestPage.tsx
  {
    file: 'src/pages/SimpleAuthTestPage.tsx',
    replacements: [
      ['#fee', 'hsl(var(--warning))'],
      ['#c33', 'hsl(var(--destructive))'],
      ['#e8f4fd', 'hsl(var(--primary) / 0.1)'],
      ['#d1ecf1', 'hsl(var(--primary) / 0.2)'],
      ['#bee5eb', 'hsl(var(--primary) / 0.3)'],
      ['#5bc0de', 'hsl(var(--primary))']
    ]
  },
  
  // PromptSystem.ts
  {
    file: 'src/prompts/PromptSystem.ts',
    replacements: [
      ['#eac', 'hsl(var(--warning))']
    ]
  },
  
  // emojiService.ts
  {
    file: 'src/services/emojiService.ts',
    replacements: [
      ['#1f2937', 'hsl(var(--foreground))'],
      ['#7c3aed', 'hsl(var(--accent))'],
      ['#ea580c', 'hsl(var(--warning))']
    ]
  },
  
  // unifiedEmojiSystem.ts
  {
    file: 'src/services/unifiedEmojiSystem.ts',
    replacements: [
      ['#2C3E50', 'hsl(var(--foreground))'],
      ['#F5DEB3', 'hsl(var(--muted))'],
      ['#F0E68C', 'hsl(var(--warning))']
    ]
  },
  
  // pricing-fix.css
  {
    file: 'src/styles/pricing-fix.css',
    replacements: [
      ['font-weight: 800', 'font-weight: 800'] // 保持不变，这是有效的CSS
    ]
  }
];

function applyFinalFixes() {
  console.log('🔧 开始最终清理剩余的硬编码颜色...');
  
  let totalReplacements = 0;
  let processedFiles = 0;
  
  FINAL_FIXES.forEach(({ file, replacements }) => {
    try {
      if (!fs.existsSync(file)) {
        console.log(`  ⚠️ 文件不存在: ${file}`);
        return;
      }
      
      let content = fs.readFileSync(file, 'utf8');
      let fileReplacements = 0;
      
      replacements.forEach(([oldColor, newColor]) => {
        if (oldColor === newColor) return; // 跳过相同的值
        
        const regex = new RegExp(oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const matches = content.match(regex);
        if (matches) {
          content = content.replace(regex, newColor);
          fileReplacements += matches.length;
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
  
  console.log(`🎉 最终清理完成！`);
  console.log(`  处理文件: ${processedFiles} 个`);
  console.log(`  总替换数: ${totalReplacements} 个`);
}

// 运行修复
applyFinalFixes();
