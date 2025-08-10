#!/usr/bin/env node

/**
 * 自动修复 unifiedEmojiSystem.ts 中的硬编码颜色
 */

import fs from 'fs';
import path from 'path';

// 颜色令牌映射
const COLOR_TOKEN_MAP = {
  // 红色系
  '#FF6B6B': 'hsl(var(--destructive))',
  '#E84393': 'hsl(var(--destructive))',
  '#FD79A8': 'hsl(var(--destructive))',
  '#E17055': 'hsl(var(--destructive))',
  '#FF4500': 'hsl(var(--destructive))',
  '#DC143C': 'hsl(var(--destructive))',
  '#8B0000': 'hsl(var(--destructive))',
  '#FF6347': 'hsl(var(--destructive))',
  
  // 蓝色系
  '#74B9FF': 'hsl(var(--primary))',
  '#0984E3': 'hsl(var(--primary))',
  '#4ECDC4': 'hsl(var(--primary))',
  '#45B7D1': 'hsl(var(--primary))',
  '#00CEC9': 'hsl(var(--primary))',
  '#4682B4': 'hsl(var(--primary))',
  '#20B2AA': 'hsl(var(--primary))',
  '#4169E1': 'hsl(var(--primary))',
  '#87CEEB': 'hsl(var(--primary))',
  '#B0E0E6': 'hsl(var(--primary))',
  '#E0F6FF': 'hsl(var(--primary))',
  
  // 绿色系
  '#00B894': 'hsl(var(--success))',
  '#96CEB4': 'hsl(var(--success))',
  '#32CD32': 'hsl(var(--success))',
  '#228B22': 'hsl(var(--success))',
  '#90EE90': 'hsl(var(--success))',
  
  // 黄色系
  '#FDCB6E': 'hsl(var(--warning))',
  '#FFEAA7': 'hsl(var(--warning))',
  '#DAA520': 'hsl(var(--warning))',
  '#FFFF00': 'hsl(var(--warning))',
  '#FFD700': 'hsl(var(--warning))',
  '#FFA500': 'hsl(var(--warning))',
  '#FF8C00': 'hsl(var(--warning))',
  
  // 紫色系
  '#6C5CE7': 'hsl(var(--accent))',
  '#A29BFE': 'hsl(var(--accent))',
  '#DDA0DD': 'hsl(var(--accent))',
  '#8B008B': 'hsl(var(--accent))',
  '#E6E6FA': 'hsl(var(--accent))',
  
  // 灰色系
  '#636E72': 'hsl(var(--muted-foreground))',
  '#2F4F4F': 'hsl(var(--muted-foreground))',
  '#708090': 'hsl(var(--muted-foreground))',
  '#696969': 'hsl(var(--muted-foreground))',
  '#2F2F2F': 'hsl(var(--muted-foreground))',
  '#C0C0C0': 'hsl(var(--muted))',
  '#D3D3D3': 'hsl(var(--muted))',
  
  // 白色系
  '#F8F9FA': 'hsl(var(--background))',
  '#F5F5DC': 'hsl(var(--background))',
  '#F5F5F5': 'hsl(var(--background))',
  '#F0F8FF': 'hsl(var(--background))',
  '#FFFFFF': 'hsl(var(--background))',
  
  // 棕色系
  '#8B4513': 'hsl(var(--muted-foreground))',
  '#D2B48C': 'hsl(var(--muted))',
  '#DEB887': 'hsl(var(--muted))',
  '#F4A460': 'hsl(var(--muted))',
  '#D2691E': 'hsl(var(--muted))',
  '#CD853F': 'hsl(var(--muted))',
  '#8B7355': 'hsl(var(--muted-foreground))',
  '#8B7D6B': 'hsl(var(--muted-foreground))',
  '#BC8F8F': 'hsl(var(--muted))',
  
  // 粉色系
  '#FFB6C1': 'hsl(var(--accent))',
  '#FF69B4': 'hsl(var(--accent))',
};

// 分类颜色映射
const CATEGORY_COLOR_TOKENS = {
  animals: 'hsl(var(--destructive))',
  food: 'hsl(var(--primary))',
  objects: 'hsl(var(--accent))',
  emotions: 'hsl(var(--success))',
  nature: 'hsl(var(--warning))',
};

function fixEmojiColors() {
  const filePath = 'src/services/unifiedEmojiSystem.ts';
  
  console.log('🔧 开始修复 unifiedEmojiSystem.ts 中的硬编码颜色...');
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let replacements = 0;
    
    // 替换所有硬编码颜色
    for (const [hexColor, token] of Object.entries(COLOR_TOKEN_MAP)) {
      const regex = new RegExp(`'${hexColor}'`, 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, `'${token}'`);
        replacements += matches.length;
        console.log(`  ✅ 替换 ${hexColor} → ${token} (${matches.length} 次)`);
      }
    }
    
    // 替换 CATEGORY_COLORS 对象
    const categoryColorsRegex = /const CATEGORY_COLORS: Record<UnifiedEmojiItem\['category'\], string> = \{[\s\S]*?\};/;
    const newCategoryColors = `const CATEGORY_COLORS: Record<UnifiedEmojiItem['category'], string> = {
  animals: 'hsl(var(--destructive))',
  food: 'hsl(var(--primary))',
  objects: 'hsl(var(--accent))',
  emotions: 'hsl(var(--success))',
  nature: 'hsl(var(--warning))'
};`;
    
    if (categoryColorsRegex.test(content)) {
      content = content.replace(categoryColorsRegex, newCategoryColors);
      console.log('  ✅ 替换 CATEGORY_COLORS 对象');
      replacements += 5;
    }
    
    // 写回文件
    fs.writeFileSync(filePath, content);
    
    console.log(`🎉 修复完成！总共替换了 ${replacements} 个硬编码颜色`);
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
    process.exit(1);
  }
}

// 运行修复
fixEmojiColors();
