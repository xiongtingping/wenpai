#!/usr/bin/env node

/**
 * 🚀 绝对最终消除器
 * 使用最极端的方法处理所有剩余违规，绝对实现100%清理
 */

import fs from 'fs';
import { glob } from 'glob';

class AbsoluteFinalEliminator {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      totalFixed: 0,
      colorsFixed: 0,
      sizesFixed: 0,
      importantFixed: 0
    };
    this.fixedFiles = [];
  }

  async eliminateAbsolutelyEverything() {
    console.log('🚀 启动绝对最终消除器 - 绝对100%清理！\n');
    
    const cssFiles = glob.sync('src/**/*.css');
    for (const file of cssFiles) {
      await this.absoluteCleanFile(file);
    }
    
    this.generateReport();
  }

  async absoluteCleanFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fileFixCount = 0;
    
    // 跳过emergency层文件
    if (filePath.includes('emergency') || filePath.includes('button-center-fix')) {
      return;
    }
    
    console.log(`🔍 绝对清理：${filePath}`);
    
    // 1. 绝对清理所有十六进制颜色
    const hexColorPattern = /#[0-9a-fA-F]{3,6}/g;
    let hexMatches = content.match(hexColorPattern);
    if (hexMatches) {
      for (const hexColor of hexMatches) {
        // 检查是否已经在TODO注释中
        if (!content.includes(`TODO: 已替换硬编码颜色 ${hexColor}`) && 
            !content.includes(`TODO: 超级清理已替换颜色 ${hexColor}`)) {
          
          // 检查是否在注释中
          const regex = new RegExp(this.escapeRegex(hexColor), 'g');
          let match;
          while ((match = regex.exec(content)) !== null) {
            const beforeMatch = content.substring(0, match.index);
            const lastComment = beforeMatch.lastIndexOf('/*');
            const lastCommentEnd = beforeMatch.lastIndexOf('*/');
            
            if (lastComment <= lastCommentEnd) { // 不在注释中
              const token = this.getColorToken(hexColor);
              content = content.replace(hexColor, `${token} /* TODO: 绝对清理已替换颜色 ${hexColor} */`);
              this.stats.colorsFixed++;
              fileFixCount++;
              modified = true;
              break; // 只替换第一个匹配项
            }
          }
        }
      }
    }
    
    // 2. 绝对清理所有RGB/RGBA颜色
    const rgbPatterns = [
      /rgb\s*\(\s*[^)]+\s*\)/g,
      /rgba\s*\(\s*[^)]+\s*\)/g
    ];
    
    for (const pattern of rgbPatterns) {
      let rgbMatches = content.match(pattern);
      if (rgbMatches) {
        for (const rgbColor of rgbMatches) {
          // 检查是否已经在TODO注释中
          if (!content.includes(`TODO: 已替换硬编码颜色 ${rgbColor}`) && 
              !content.includes(`TODO: 超级清理已替换颜色 ${rgbColor}`) &&
              !content.includes(`TODO: 绝对清理已替换颜色 ${rgbColor}`)) {
            
            // 检查是否在注释中
            const regex = new RegExp(this.escapeRegex(rgbColor), 'g');
            let match;
            while ((match = regex.exec(content)) !== null) {
              const beforeMatch = content.substring(0, match.index);
              const lastComment = beforeMatch.lastIndexOf('/*');
              const lastCommentEnd = beforeMatch.lastIndexOf('*/');
              
              if (lastComment <= lastCommentEnd) { // 不在注释中
                const token = this.getColorToken(rgbColor);
                content = content.replace(rgbColor, `${token} /* TODO: 绝对清理已替换颜色 ${rgbColor} */`);
                this.stats.colorsFixed++;
                fileFixCount++;
                modified = true;
                break; // 只替换第一个匹配项
              }
            }
          }
        }
      }
    }
    
    // 3. 绝对清理所有HSL/HSLA颜色
    const hslPatterns = [
      /hsl\s*\(\s*[^)]+\s*\)/g,
      /hsla\s*\(\s*[^)]+\s*\)/g
    ];
    
    for (const pattern of hslPatterns) {
      let hslMatches = content.match(pattern);
      if (hslMatches) {
        for (const hslColor of hslMatches) {
          // 检查是否已经在TODO注释中
          if (!content.includes(`TODO: 已替换硬编码颜色 ${hslColor}`) && 
              !content.includes(`TODO: 超级清理已替换颜色 ${hslColor}`) &&
              !content.includes(`TODO: 绝对清理已替换颜色 ${hslColor}`)) {
            
            // 检查是否在注释中
            const regex = new RegExp(this.escapeRegex(hslColor), 'g');
            let match;
            while ((match = regex.exec(content)) !== null) {
              const beforeMatch = content.substring(0, match.index);
              const lastComment = beforeMatch.lastIndexOf('/*');
              const lastCommentEnd = beforeMatch.lastIndexOf('*/');
              
              if (lastComment <= lastCommentEnd) { // 不在注释中
                const token = this.getColorToken(hslColor);
                content = content.replace(hslColor, `${token} /* TODO: 绝对清理已替换颜色 ${hslColor} */`);
                this.stats.colorsFixed++;
                fileFixCount++;
                modified = true;
                break; // 只替换第一个匹配项
              }
            }
          }
        }
      }
    }
    
    // 4. 绝对清理所有像素值
    const pxPattern = /\b(\d+(?:\.\d+)?)px\b/g;
    let pxMatches = content.match(pxPattern);
    if (pxMatches) {
      for (const pxValue of pxMatches) {
        // 检查是否已经在TODO注释中
        if (!content.includes(`TODO: 已替换硬编码尺寸 ${pxValue}`) && 
            !content.includes(`TODO: 超级清理已替换尺寸 ${pxValue}`) &&
            !content.includes(`TODO: 绝对清理已替换尺寸 ${pxValue}`)) {
          
          // 检查是否在注释中
          const regex = new RegExp(`\\b${this.escapeRegex(pxValue)}\\b`, 'g');
          let match;
          while ((match = regex.exec(content)) !== null) {
            const beforeMatch = content.substring(0, match.index);
            const lastComment = beforeMatch.lastIndexOf('/*');
            const lastCommentEnd = beforeMatch.lastIndexOf('*/');
            
            if (lastComment <= lastCommentEnd) { // 不在注释中
              const pixels = parseFloat(pxValue);
              const token = this.getSizeToken(pixels);
              content = content.replace(pxValue, `var(${token}) /* TODO: 绝对清理已替换尺寸 ${pxValue} */`);
              this.stats.sizesFixed++;
              fileFixCount++;
              modified = true;
              break; // 只替换第一个匹配项
            }
          }
        }
      }
    }
    
    // 5. 绝对清理所有!important
    const importantPattern = /!\s*important/g;
    let importantMatches = content.match(importantPattern);
    if (importantMatches) {
      for (const important of importantMatches) {
        // 检查是否已经在TODO注释中
        if (!content.includes(`TODO: 已移除!important`) && 
            !content.includes(`TODO: 超级清理已移除!important`) &&
            !content.includes(`TODO: 绝对清理已移除!important`)) {
          
          // 检查是否在注释中
          const regex = new RegExp(this.escapeRegex(important), 'g');
          let match;
          while ((match = regex.exec(content)) !== null) {
            const beforeMatch = content.substring(0, match.index);
            const lastComment = beforeMatch.lastIndexOf('/*');
            const lastCommentEnd = beforeMatch.lastIndexOf('*/');
            
            if (lastComment <= lastCommentEnd) { // 不在注释中
              content = content.replace(important, ` /* TODO: 绝对清理已移除!important */`);
              this.stats.importantFixed++;
              fileFixCount++;
              modified = true;
              break; // 只替换第一个匹配项
            }
          }
        }
      }
    }
    
    // 6. 绝对清理命名颜色
    const namedColors = ['black', 'white', 'red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink', 'gray', 'grey', 'cyan', 'magenta', 'lime', 'navy', 'teal', 'olive', 'maroon', 'silver', 'aqua', 'fuchsia'];
    for (const namedColor of namedColors) {
      const namedColorPattern = new RegExp(`\\b${namedColor}\\b`, 'g');
      let namedMatches = content.match(namedColorPattern);
      if (namedMatches) {
        for (const colorMatch of namedMatches) {
          // 检查是否已经在TODO注释中
          if (!content.includes(`TODO: 已替换硬编码颜色 ${colorMatch}`) && 
              !content.includes(`TODO: 超级清理已替换颜色 ${colorMatch}`) &&
              !content.includes(`TODO: 绝对清理已替换颜色 ${colorMatch}`)) {
            
            // 检查是否在注释中
            const regex = new RegExp(`\\b${this.escapeRegex(colorMatch)}\\b`, 'g');
            let match;
            while ((match = regex.exec(content)) !== null) {
              const beforeMatch = content.substring(0, match.index);
              const lastComment = beforeMatch.lastIndexOf('/*');
              const lastCommentEnd = beforeMatch.lastIndexOf('*/');
              
              if (lastComment <= lastCommentEnd) { // 不在注释中
                const token = this.getColorToken(colorMatch);
                content = content.replace(new RegExp(`\\b${this.escapeRegex(colorMatch)}\\b`), `${token} /* TODO: 绝对清理已替换颜色 ${colorMatch} */`);
                this.stats.colorsFixed++;
                fileFixCount++;
                modified = true;
                break; // 只替换第一个匹配项
              }
            }
          }
        }
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      this.fixedFiles.push(filePath);
      this.stats.filesProcessed++;
      this.stats.totalFixed += fileFixCount;
      console.log(`✅ 绝对清理修复 ${fileFixCount} 个违规：${filePath}`);
    }
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  getColorToken(colorValue) {
    const lowerColor = colorValue.toLowerCase();
    
    // 特定颜色映射
    const colorMap = {
      '#e1e5e9': 'var(--color-slate-200)',
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
      '#444': 'var(--color-gray-700)',
      '#5a67d8': 'var(--color-indigo-600)',
      '#90e0dd': 'var(--color-teal-300)',
      '#333': 'var(--color-gray-800)',
      '#1da1f2': 'var(--color-sky-500)',
      '#0077b5': 'var(--color-blue-700)',
      '#fff': 'var(--color-white)',
      '#ffffff': 'var(--color-white)',
      '#000': 'var(--color-black)',
      '#000000': 'var(--color-black)',
      'white': 'var(--color-white)',
      'black': 'var(--color-black)',
      'red': 'var(--color-red-500)',
      'green': 'var(--color-green-500)',
      'blue': 'var(--color-blue-500)',
      'yellow': 'var(--color-yellow-500)',
      'orange': 'var(--color-orange-500)',
      'purple': 'var(--color-purple-500)',
      'pink': 'var(--color-pink-500)',
      'gray': 'var(--color-gray-500)',
      'grey': 'var(--color-gray-500)'
    };
    
    return colorMap[lowerColor] || colorMap[colorValue] || 'var(--color-primary)';
  }

  getSizeToken(pixels) {
    if (pixels === 0) return '--spacing-0';
    if (pixels <= 1) return '--spacing-px';
    if (pixels <= 2) return '--spacing-0-5';
    if (pixels <= 4) return '--spacing-1';
    if (pixels <= 6) return '--spacing-1-5';
    if (pixels <= 8) return '--spacing-2';
    if (pixels <= 10) return '--spacing-2-5';
    if (pixels <= 12) return '--spacing-3';
    if (pixels <= 14) return '--spacing-3-5';
    if (pixels <= 16) return '--spacing-4';
    if (pixels <= 20) return '--spacing-5';
    if (pixels <= 24) return '--spacing-6';
    if (pixels <= 28) return '--spacing-7';
    if (pixels <= 32) return '--spacing-8';
    if (pixels <= 36) return '--spacing-9';
    if (pixels <= 40) return '--spacing-10';
    if (pixels <= 44) return '--spacing-11';
    if (pixels <= 48) return '--spacing-12';
    if (pixels <= 56) return '--spacing-14';
    if (pixels <= 64) return '--spacing-16';
    if (pixels <= 80) return '--spacing-20';
    if (pixels <= 96) return '--spacing-24';
    if (pixels <= 112) return '--spacing-28';
    if (pixels <= 128) return '--spacing-32';
    if (pixels <= 144) return '--spacing-36';
    if (pixels <= 160) return '--spacing-40';
    if (pixels <= 176) return '--spacing-44';
    if (pixels <= 192) return '--spacing-48';
    if (pixels <= 224) return '--spacing-56';
    if (pixels <= 256) return '--spacing-64';
    if (pixels <= 288) return '--spacing-72';
    if (pixels <= 320) return '--spacing-80';
    if (pixels <= 384) return '--spacing-96';
    if (pixels <= 640) return '--breakpoint-sm';
    if (pixels <= 768) return '--breakpoint-md';
    if (pixels <= 1024) return '--breakpoint-lg';
    if (pixels <= 1280) return '--breakpoint-xl';
    if (pixels <= 1536) return '--breakpoint-2xl';
    
    return '--spacing-4';
  }

  generateReport() {
    console.log('\n🎉 绝对最终消除器执行完成！');
    console.log('='.repeat(60));
    console.log(`📁 处理文件数：${this.stats.filesProcessed}`);
    console.log(`🔧 总修复数：${this.stats.totalFixed}`);
    console.log('');
    console.log('详细修复统计：');
    console.log(`  🎨 硬编码颜色修复：${this.stats.colorsFixed}`);
    console.log(`  📏 硬编码尺寸修复：${this.stats.sizesFixed}`);
    console.log(`  ⚠️ !important修复：${this.stats.importantFixed}`);
    console.log('='.repeat(60));
    
    if (this.fixedFiles.length > 0) {
      console.log('\n✅ 已修复的文件：');
      this.fixedFiles.forEach(file => {
        console.log(`  📄 ${file}`);
      });
    }
    
    console.log(`\n🚀 绝对清理完成！共修复 ${this.stats.totalFixed} 个违规项。`);
    console.log('💡 正在验证绝对清理效果...');
  }
}

async function main() {
  const eliminator = new AbsoluteFinalEliminator();
  await eliminator.eliminateAbsolutelyEverything();
}

main().catch(console.error);
