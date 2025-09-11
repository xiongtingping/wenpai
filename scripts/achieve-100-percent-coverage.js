#!/usr/bin/env node

/**
 * 实现100%设计令牌覆盖率的强化脚本
 * 扫描所有硬编码值并自动替换为设计令牌
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 100%覆盖率配置
const COMPLETE_TOKEN_MAPPING = {
  // 🎨 颜色令牌 - 100%覆盖
  colors: {
    // 基础颜色
    '#ffffff': 'hsl(var(--background))',
    '#000000': 'hsl(var(--foreground))',
    '#f8f9fa': 'hsl(var(--background))',
    '#212529': 'hsl(var(--foreground))',
    
    // 品牌颜色
    '#3b82f6': 'hsl(var(--primary))',
    '#1d4ed8': 'hsl(var(--primary))',
    '#2563eb': 'hsl(var(--primary))',
    '#1e40af': 'hsl(var(--primary))',
    
    // 状态颜色
    '#ef4444': 'hsl(var(--destructive))',
    '#dc2626': 'hsl(var(--destructive))',
    '#b91c1c': 'hsl(var(--destructive))',
    '#22c55e': 'hsl(var(--success))',
    '#16a34a': 'hsl(var(--success))',
    '#15803d': 'hsl(var(--success))',
    '#f59e0b': 'hsl(var(--warning))',
    '#d97706': 'hsl(var(--warning))',
    '#b45309': 'hsl(var(--warning))',
    
    // 灰度颜色
    '#6b7280': 'hsl(var(--muted-foreground))',
    '#9ca3af': 'hsl(var(--muted-foreground))',
    '#d1d5db': 'hsl(var(--border))',
    '#e5e7eb': 'hsl(var(--border))',
    '#f3f4f6': 'hsl(var(--muted))',
    '#f9fafb': 'hsl(var(--muted))',
    
    // RGB/RGBA格式
    'rgb(255, 255, 255)': 'hsl(var(--background))',
    'rgb(0, 0, 0)': 'hsl(var(--foreground))',
    'rgba(0, 0, 0, 0.5)': 'hsl(var(--foreground) / 0.5)',
    'rgba(255, 255, 255, 0.9)': 'hsl(var(--background) / 0.9)',
    
    // HSL格式
    'hsl(0, 0%, 100%)': 'hsl(var(--background))',
    'hsl(0, 0%, 0%)': 'hsl(var(--foreground))',
  },
  
  // 📏 尺寸令牌 - 100%覆盖
  sizes: {
    // 像素值
    '0px': '0',
    '1px': '1px', // 边框保留
    '2px': 'var(--spacing-0-5)',
    '4px': 'var(--spacing-1)',
    '6px': 'var(--spacing-1-5)',
    '8px': 'var(--spacing-2)',
    '10px': 'var(--spacing-2-5)',
    '12px': 'var(--spacing-3)',
    '14px': 'var(--spacing-3-5)',
    '16px': 'var(--spacing-4)',
    '18px': 'var(--spacing-4-5)',
    '20px': 'var(--spacing-5)',
    '24px': 'var(--spacing-6)',
    '28px': 'var(--spacing-7)',
    '32px': 'var(--spacing-8)',
    '36px': 'var(--spacing-9)',
    '40px': 'var(--spacing-10)',
    '44px': 'var(--spacing-11)',
    '48px': 'var(--spacing-12)',
    '56px': 'var(--spacing-14)',
    '64px': 'var(--spacing-16)',
    '80px': 'var(--spacing-20)',
    '96px': 'var(--spacing-24)',
    
    // rem值
    '0.25rem': 'var(--spacing-1)',
    '0.5rem': 'var(--spacing-2)',
    '0.75rem': 'var(--spacing-3)',
    '1rem': 'var(--spacing-4)',
    '1.25rem': 'var(--spacing-5)',
    '1.5rem': 'var(--spacing-6)',
    '2rem': 'var(--spacing-8)',
    '2.5rem': 'var(--spacing-10)',
    '3rem': 'var(--spacing-12)',
    '4rem': 'var(--spacing-16)',
    '5rem': 'var(--spacing-20)',
    '6rem': 'var(--spacing-24)',
  },
  
  // 🔄 圆角令牌 - 100%覆盖
  radius: {
    '0': 'var(--radius-none)',
    '2px': 'var(--radius-sm)',
    '4px': 'var(--radius-sm)',
    '6px': 'var(--radius-md)',
    '8px': 'var(--radius-lg)',
    '12px': 'var(--radius-xl)',
    '16px': 'var(--radius-2xl)',
    '9999px': 'var(--radius-full)',
    '50%': 'var(--radius-full)',
    '0.125rem': 'var(--radius-sm)',
    '0.25rem': 'var(--radius-sm)',
    '0.375rem': 'var(--radius-md)',
    '0.5rem': 'var(--radius-lg)',
    '0.75rem': 'var(--radius-xl)',
    '1rem': 'var(--radius-2xl)',
  },
  
  // 📝 字体令牌 - 100%覆盖
  fonts: {
    // 字体大小
    '12px': 'var(--font-size-xs)',
    '14px': 'var(--font-size-sm)',
    '16px': 'var(--font-size-base)',
    '18px': 'var(--font-size-lg)',
    '20px': 'var(--font-size-xl)',
    '24px': 'var(--font-size-2xl)',
    '30px': 'var(--font-size-3xl)',
    '36px': 'var(--font-size-4xl)',
    '0.75rem': 'var(--font-size-xs)',
    '0.875rem': 'var(--font-size-sm)',
    '1rem': 'var(--font-size-base)',
    '1.125rem': 'var(--font-size-lg)',
    '1.25rem': 'var(--font-size-xl)',
    '1.5rem': 'var(--font-size-2xl)',
    
    // 字体粗细
    '400': 'var(--font-weight-normal)',
    '500': 'var(--font-weight-medium)',
    '600': 'var(--font-weight-semibold)',
    '700': 'var(--font-weight-bold)',
    'normal': 'var(--font-weight-normal)',
    'medium': 'var(--font-weight-medium)',
    'semibold': 'var(--font-weight-semibold)',
    'bold': 'var(--font-weight-bold)',
  },
  
  // 🌫️ 阴影令牌 - 100%覆盖
  shadows: {
    '0 1px 2px 0 rgb(0 0 0 / 0.05)': 'var(--shadow-sm)',
    '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)': 'var(--shadow-sm)',
    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)': 'var(--shadow-md)',
    '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)': 'var(--shadow-lg)',
    '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)': 'var(--shadow-xl)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)': 'var(--shadow-dialog)',
  }
};

// Tailwind类映射 - 100%覆盖
const TAILWIND_CLASS_MAPPING = {
  // 颜色类
  'bg-white': 'bg-background',
  'bg-black': 'bg-foreground',
  'bg-blue-500': 'bg-primary',
  'bg-blue-600': 'bg-primary',
  'bg-red-500': 'bg-destructive',
  'bg-red-600': 'bg-destructive',
  'bg-green-500': 'bg-success',
  'bg-green-600': 'bg-success',
  'bg-yellow-500': 'bg-warning',
  'bg-yellow-600': 'bg-warning',
  'bg-gray-100': 'bg-muted',
  'bg-gray-200': 'bg-muted',
  'bg-gray-500': 'bg-muted-foreground',
  'bg-gray-900': 'bg-foreground',
  
  'text-white': 'text-background',
  'text-black': 'text-foreground',
  'text-blue-500': 'text-primary',
  'text-blue-600': 'text-primary',
  'text-red-500': 'text-destructive',
  'text-red-600': 'text-destructive',
  'text-green-500': 'text-success',
  'text-green-600': 'text-success',
  'text-yellow-500': 'text-warning',
  'text-yellow-600': 'text-warning',
  'text-gray-500': 'text-muted-foreground',
  'text-gray-600': 'text-muted-foreground',
  'text-gray-900': 'text-foreground',
  
  'border-gray-200': 'border-border',
  'border-gray-300': 'border-border',
  'border-blue-500': 'border-primary',
  'border-red-500': 'border-destructive',
};

/**
 * 扫描并替换所有硬编码值
 */
function achieveCompleteTokenCoverage() {
  console.log('🚀 开始实现100%设计令牌覆盖率...');
  
  const files = getAllFiles('./src');
  let totalReplacements = 0;
  
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let fileReplacements = 0;
    
    // 替换颜色值
    Object.entries(COMPLETE_TOKEN_MAPPING.colors).forEach(([old, new_]) => {
      const regex = new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, new_);
        fileReplacements += matches.length;
      }
    });
    
    // 替换尺寸值
    Object.entries(COMPLETE_TOKEN_MAPPING.sizes).forEach(([old, new_]) => {
      const regex = new RegExp(`\\b${old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, new_);
        fileReplacements += matches.length;
      }
    });
    
    // 替换圆角值
    Object.entries(COMPLETE_TOKEN_MAPPING.radius).forEach(([old, new_]) => {
      const regex = new RegExp(`border-radius:\\s*${old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, `border-radius: ${new_}`);
        fileReplacements += matches.length;
      }
    });
    
    // 替换字体值
    Object.entries(COMPLETE_TOKEN_MAPPING.fonts).forEach(([old, new_]) => {
      const regex = new RegExp(`font-size:\\s*${old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, `font-size: ${new_}`);
        fileReplacements += matches.length;
      }
    });
    
    // 替换阴影值
    Object.entries(COMPLETE_TOKEN_MAPPING.shadows).forEach(([old, new_]) => {
      const regex = new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, new_);
        fileReplacements += matches.length;
      }
    });
    
    // 替换Tailwind类
    Object.entries(TAILWIND_CLASS_MAPPING).forEach(([old, new_]) => {
      const regex = new RegExp(`\\b${old}\\b`, 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, new_);
        fileReplacements += matches.length;
      }
    });
    
    if (fileReplacements > 0) {
      fs.writeFileSync(file, content);
      console.log(`✅ ${file}: ${fileReplacements} 个替换`);
      totalReplacements += fileReplacements;
    }
  });
  
  console.log(`🎉 完成！总共替换了 ${totalReplacements} 个硬编码值`);
  console.log('📊 正在验证100%覆盖率...');
  
  // 验证覆盖率
  validateCompleteTokenCoverage();
}

/**
 * 验证100%令牌覆盖率
 */
function validateCompleteTokenCoverage() {
  const files = getAllFiles('./src');
  const violations = [];
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // 检查剩余的硬编码颜色
    const colorMatches = content.match(/#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\((?!var\(--)[^)]+\)/g);
    if (colorMatches) {
      violations.push({
        file,
        type: 'hardcoded-color',
        values: colorMatches
      });
    }
    
    // 检查剩余的硬编码尺寸
    const sizeMatches = content.match(/(?:width|height|margin|padding|top|left|right|bottom|font-size|border-radius):\s*\d+(px|rem|em)/g);
    if (sizeMatches) {
      violations.push({
        file,
        type: 'hardcoded-size',
        values: sizeMatches
      });
    }
  });
  
  if (violations.length === 0) {
    console.log('🎯 恭喜！已实现100%设计令牌覆盖率！');
  } else {
    console.log(`⚠️ 发现 ${violations.length} 个文件仍有硬编码值：`);
    violations.forEach(violation => {
      console.log(`  ${violation.file}: ${violation.values.join(', ')}`);
    });
  }
}

/**
 * 获取所有文件
 */
function getAllFiles(dir) {
  const files = [];
  const extensions = ['.tsx', '.ts', '.jsx', '.js', '.css', '.scss'];
  
  function scanDirectory(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(item)) {
          scanDirectory(fullPath);
        } else if (stat.isFile() && extensions.includes(path.extname(fullPath))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`⚠️ 无法扫描目录: ${currentDir}`);
    }
  }
  
  scanDirectory(dir);
  return files;
}

// 运行脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  achieveCompleteTokenCoverage();
}

export { achieveCompleteTokenCoverage, validateCompleteTokenCoverage };
