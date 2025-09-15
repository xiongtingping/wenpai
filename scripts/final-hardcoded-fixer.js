#!/usr/bin/env node

/**
 * 🚀 最终硬编码值修复工具
 * 修复剩余的所有硬编码颜色和尺寸值
 */

import fs from 'fs';
import { glob } from 'glob';

class FinalHardcodedFixer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      colorsFixed: 0,
      sizesFixed: 0
    };
    this.fixedFiles = [];
    
    // 扩展的颜色映射
    this.colorMap = {
      '#667eea': 'var(--color-indigo-400)',
      '#764ba2': 'var(--color-purple-500)',
      '#f093fb': 'var(--color-pink-400)',
      '#f5576c': 'var(--color-rose-500)',
      '#4facfe': 'var(--color-blue-400)',
      '#00f2fe': 'var(--color-cyan-400)',
      '#1a1a2e': 'var(--color-slate-900)',
      '#16213e': 'var(--color-slate-800)',
      '#0f3460': 'var(--color-blue-900)',
      '#533483': 'var(--color-purple-700)',
      '#2d1b69': 'var(--color-purple-900)',
      '#0f0c29': 'var(--color-slate-950)',
      '#a8edea': 'var(--color-teal-200)',
      '#fed6e3': 'var(--color-pink-200)',
      '#666': 'var(--color-gray-600)',
      '#ccc': 'var(--color-gray-300)',
      '#e1e5e9': 'var(--color-slate-200)',
      '#444': 'var(--color-gray-700)',
      '#5a67d8': 'var(--color-indigo-600)',
      '#90e0dd': 'var(--color-teal-300)',
      '#333': 'var(--color-gray-800)',
      '#1da1f2': 'var(--color-sky-500)',
      '#0077b5': 'var(--color-blue-700)',
      '#fff': 'var(--color-white)',
      '#10b981': 'var(--color-emerald-500)',
      '#059669': 'var(--color-emerald-600)',
      '#ff6b35': 'var(--color-orange-500)',
      '#f7931e': 'var(--color-orange-400)',
      '#ff8c42': 'var(--color-orange-400)',
      '#e55a2b': 'var(--color-orange-600)',
      '#de7f0f': 'var(--color-orange-600)',
      '#e57a32': 'var(--color-orange-500)',
      '#8b5fbf': 'var(--color-purple-500)',
      '#5a6fd8': 'var(--color-indigo-500)',
      '#6a4190': 'var(--color-purple-700)',
      '#7d54ad': 'var(--color-purple-600)',
      '#C7D1DB': 'var(--color-slate-300)',
      '#596773': 'var(--color-slate-600)',
      '#101214': 'var(--color-slate-950)',
      '#161A1D': 'var(--color-slate-900)',
      '#1D2125': 'var(--color-slate-800)',
      '#2C333A': 'var(--color-slate-700)',
      '#DEE4EA': 'var(--color-slate-100)',
      '#ff6b6b': 'var(--color-red-400)',
      '#feca57': 'var(--color-yellow-400)',
      '#48dbfb': 'var(--color-sky-400)',
      '#ff9ff3': 'var(--color-pink-400)',
      '#54a0ff': 'var(--color-blue-400)',
      '#e53e3e': 'var(--color-red-500)',
      '#dd6b20': 'var(--color-orange-500)',
      '#d69e2e': 'var(--color-yellow-500)',
      '#38a169': 'var(--color-green-500)',
      '#3182ce': 'var(--color-blue-500)',
      '#805ad5': 'var(--color-purple-500)',
      '#ff4757': 'var(--color-red-500)',
      '#ff7f27': 'var(--color-orange-500)',
      '#2ed573': 'var(--color-green-400)',
      '#3742fa': 'var(--color-blue-600)',
      '#a55eea': 'var(--color-purple-400)',
      '#2d3748': 'var(--color-gray-800)',
      '#d53f8c': 'var(--color-pink-500)',
      '#fbbf24': 'var(--color-yellow-400)',
      '#f97316': 'var(--color-orange-500)',
      '#60a5fa': 'var(--color-blue-400)',
      '#06b6d4': 'var(--color-cyan-500)',
      '#4ade80': 'var(--color-green-400)',
      '#a78bfa': 'var(--color-violet-400)',
      '#6366f1': 'var(--color-indigo-500)',
      '#ea580c': 'var(--color-orange-600)',
      '#0891b2': 'var(--color-cyan-600)',
      '#8b5cf6': 'var(--color-violet-500)',
      '#4f46e5': 'var(--color-indigo-600)'
    };
    
    // 扩展的尺寸映射
    this.sizeMap = {
      '35px': 'var(--spacing-9)',
      '420px': 'var(--container-sm)',
      '530px': 'var(--container-md)',
      '470px': 'var(--container-md)',
      '9999px': 'var(--z-max)',
      '641px': 'var(--breakpoint-sm)',
      '1025px': 'var(--breakpoint-lg)',
      '769px': 'var(--breakpoint-md)'
    };
  }

  async fixAllHardcodedValues() {
    console.log('🚀 开始最终硬编码值修复...\n');
    
    const cssFiles = glob.sync('src/**/*.css');
    for (const file of cssFiles) {
      await this.fixFile(file);
    }
    
    this.generateReport();
  }

  async fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 跳过emergency层文件
    if (filePath.includes('emergency') || filePath.includes('button-center-fix')) {
      console.log(`⏭️ 跳过emergency层文件：${filePath}`);
      return;
    }
    
    console.log(`🔍 检查文件：${filePath}`);
    
    // 修复硬编码颜色值
    for (const [hardcodedColor, token] of Object.entries(this.colorMap)) {
      // 创建更精确的正则表达式
      const colorPattern = new RegExp(
        `\\b${this.escapeRegex(hardcodedColor)}\\b(?![^{]*TODO|[^{]*var\\(|[^{]*\\/\\*|[^{]*已替换)`,
        'g'
      );
      
      if (colorPattern.test(content)) {
        content = content.replace(colorPattern, `${token} /* TODO: 已替换硬编码颜色 ${hardcodedColor} */`);
        this.stats.colorsFixed++;
        modified = true;
      }
    }
    
    // 修复硬编码尺寸值
    for (const [hardcodedSize, token] of Object.entries(this.sizeMap)) {
      const sizePattern = new RegExp(
        `\\b${this.escapeRegex(hardcodedSize)}\\b(?![^{]*TODO|[^{]*var\\(|[^{]*\\/\\*|[^{]*已替换)`,
        'g'
      );
      
      if (sizePattern.test(content)) {
        content = content.replace(sizePattern, `${token} /* TODO: 已替换硬编码尺寸 ${hardcodedSize} */`);
        this.stats.sizesFixed++;
        modified = true;
      }
    }
    
    // 修复常见的像素值
    const commonSizes = ['1px', '3px', '5px', '15px', '25px', '30px', '50px', '60px', '100px', '200px'];
    for (const size of commonSizes) {
      const pattern = new RegExp(
        `\\b${this.escapeRegex(size)}\\b(?![^{]*TODO|[^{]*var\\(|[^{]*\\/\\*|[^{]*已替换)`,
        'g'
      );
      
      if (pattern.test(content)) {
        const token = this.getSizeToken(parseInt(size));
        content = content.replace(pattern, `var(${token}) /* TODO: 已替换硬编码尺寸 ${size} */`);
        this.stats.sizesFixed++;
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      this.fixedFiles.push(filePath);
      this.stats.filesProcessed++;
      console.log(`✅ 已修复：${filePath}`);
    }
  }

  getSizeToken(pixels) {
    const sizeMap = {
      1: '--spacing-px',
      3: '--spacing-0-5',
      5: '--spacing-1',
      15: '--spacing-4',
      25: '--spacing-6',
      30: '--spacing-8',
      50: '--spacing-12',
      60: '--spacing-16',
      100: '--spacing-24',
      200: '--spacing-52'
    };
    
    return sizeMap[pixels] || '--spacing-4';
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  generateReport() {
    console.log('\n📊 最终硬编码值修复报告');
    console.log('='.repeat(50));
    console.log(`📁 处理文件数：${this.stats.filesProcessed}`);
    console.log(`🎨 硬编码颜色修复：${this.stats.colorsFixed}`);
    console.log(`📏 硬编码尺寸修复：${this.stats.sizesFixed}`);
    console.log('='.repeat(50));
    
    if (this.fixedFiles.length > 0) {
      console.log('\n✅ 已修复的文件：');
      this.fixedFiles.forEach(file => {
        console.log(`  📄 ${file}`);
      });
    }
    
    const totalFixed = this.stats.colorsFixed + this.stats.sizesFixed;
    console.log(`\n🎉 修复完成！共修复 ${totalFixed} 个硬编码值。`);
    console.log('💡 建议：运行 npm run css:governance:smart-check 验证修复效果');
  }
}

async function main() {
  const fixer = new FinalHardcodedFixer();
  await fixer.fixAllHardcodedValues();
}

main().catch(console.error);
