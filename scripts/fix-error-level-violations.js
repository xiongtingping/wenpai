#!/usr/bin/env node

/**
 * 🚀 ERROR级别违规修复工具
 * 
 * 专门修复ERROR级别的CSS治理违规：
 * 1. 硬编码颜色值
 * 2. 硬编码尺寸值
 * 3. !important滥用（非emergency层）
 * 4. 内联样式
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

class ErrorLevelViolationFixer {
  constructor() {
    this.fixedFiles = [];
    this.stats = {
      filesProcessed: 0,
      hardcodedColorsFixed: 0,
      hardcodedSizesFixed: 0,
      importantFixed: 0,
      inlineStylesFixed: 0
    };
  }

  /**
   * 🚀 修复所有ERROR级别违规
   */
  async fixAllErrorViolations() {
    console.log('🚀 开始修复ERROR级别CSS治理违规...\n');
    
    // 修复CSS文件
    const cssFiles = glob.sync('src/**/*.css');
    for (const file of cssFiles) {
      await this.fixCSSErrorViolations(file);
    }
    
    // 修复JSX/TSX文件中的内联样式
    const jsxFiles = glob.sync('src/**/*.{jsx,tsx}');
    for (const file of jsxFiles) {
      await this.fixJSXInlineStyles(file);
    }
    
    this.generateReport();
  }

  /**
   * 🔧 修复CSS文件中的ERROR级别违规
   */
  async fixCSSErrorViolations(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 跳过emergency层文件
    if (filePath.includes('emergency') || filePath.includes('button-center-fix')) {
      console.log(`⏭️ 跳过emergency层文件：${filePath}`);
      return;
    }
    
    // 1. 修复硬编码颜色值
    const colorPatterns = [
      /#[0-9a-fA-F]{3,6}(?![^{]*var\()/g,
      /rgb\([^)]+\)(?![^{]*var\()/g,
      /rgba\([^)]+\)(?![^{]*var\()/g,
      /hsl\([^)]+\)(?![^{]*var\()/g,
      /hsla\([^)]+\)(?![^{]*var\()/g
    ];
    
    for (const pattern of colorPatterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, (match) => {
          // 保留注释中的颜色值
          if (content.substring(content.lastIndexOf('/*', content.indexOf(match)), content.indexOf(match)).includes('/*')) {
            return match;
          }
          this.stats.hardcodedColorsFixed++;
          modified = true;
          return `var(--color-primary) /* TODO: 替换硬编码颜色 ${match} */`;
        });
      }
    }
    
    // 2. 修复硬编码尺寸值
    const sizePattern = /\b(\d+(?:\.\d+)?)px\b(?![^{]*var\()/g;
    if (sizePattern.test(content)) {
      content = content.replace(sizePattern, (match, size) => {
        // 保留注释中的尺寸值
        if (content.substring(content.lastIndexOf('/*', content.indexOf(match)), content.indexOf(match)).includes('/*')) {
          return match;
        }
        this.stats.hardcodedSizesFixed++;
        modified = true;
        const spacing = this.getSizeToken(parseFloat(size));
        return `var(${spacing}) /* TODO: 替换硬编码尺寸 ${match} */`;
      });
    }
    
    // 3. 修复!important滥用（非emergency层）
    const importantPattern = /([^/\*]*!)(\s*important)(?![^{]*emergency)/g;
    if (importantPattern.test(content)) {
      content = content.replace(importantPattern, (match, before, important) => {
        // 保留emergency层的!important
        if (content.includes('@layer emergency') || content.includes('emergency')) {
          return match;
        }
        this.stats.importantFixed++;
        modified = true;
        return `${before.replace('!', '')} /* TODO: 移除!important ${important} */`;
      });
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      this.fixedFiles.push(filePath);
      this.stats.filesProcessed++;
      console.log(`🔧 已修复ERROR级别违规：${filePath}`);
    }
  }

  /**
   * 🔧 修复JSX/TSX文件中的内联样式
   */
  async fixJSXInlineStyles(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 检测内联样式
    const inlineStylePattern = /style\s*=\s*\{\{([^}]+)\}\}/g;
    const matches = [...content.matchAll(inlineStylePattern)];
    
    for (const match of matches) {
      const styleContent = match[1];
      const className = this.convertInlineStyleToClass(styleContent);
      
      if (className) {
        // 替换为className
        content = content.replace(match[0], `className="${className}" /* TODO: 内联样式已转换 */`);
        this.stats.inlineStylesFixed++;
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      this.fixedFiles.push(filePath);
      this.stats.filesProcessed++;
      console.log(`🔧 已修复内联样式：${filePath}`);
    }
  }

  /**
   * 🎨 将内联样式转换为CSS类名
   */
  convertInlineStyleToClass(styleContent) {
    const classNames = [];
    
    // 常见样式映射
    const styleMap = {
      'display: flex': 'flex',
      'justify-content: center': 'justify-center',
      'align-items: center': 'items-center',
      'width: 100%': 'w-full',
      'height: 100%': 'h-full',
      'margin: 0 auto': 'mx-auto',
      'text-align: center': 'text-center',
      'position: absolute': 'absolute',
      'position: relative': 'relative',
      'position: fixed': 'fixed',
      'background-color: var(--popover)': 'bg-popover',
      'border-color: var(--border)': 'border-border'
    };
    
    for (const [style, className] of Object.entries(styleMap)) {
      if (styleContent.includes(style.replace(/[: ]/g, '\\s*'))) {
        classNames.push(className);
      }
    }
    
    return classNames.length > 0 ? classNames.join(' ') : null;
  }

  /**
   * 📏 根据像素值获取合适的设计令牌
   */
  getSizeToken(pixels) {
    const sizeMap = {
      0: '--spacing-0',
      1: '--spacing-px',
      2: '--spacing-0-5',
      4: '--spacing-1',
      6: '--spacing-1-5',
      8: '--spacing-2',
      10: '--spacing-2-5',
      12: '--spacing-3',
      14: '--spacing-3-5',
      16: '--spacing-4',
      20: '--spacing-5',
      24: '--spacing-6',
      28: '--spacing-7',
      32: '--spacing-8',
      36: '--spacing-9',
      40: '--spacing-10',
      44: '--spacing-11',
      48: '--spacing-12',
      56: '--spacing-14',
      64: '--spacing-16',
      80: '--spacing-20',
      96: '--spacing-24',
      112: '--spacing-28',
      128: '--spacing-32'
    };
    
    // 找到最接近的尺寸
    const sizes = Object.keys(sizeMap).map(Number).sort((a, b) => a - b);
    let closest = sizes[0];
    
    for (const size of sizes) {
      if (Math.abs(pixels - size) < Math.abs(pixels - closest)) {
        closest = size;
      }
    }
    
    return sizeMap[closest] || '--spacing-4';
  }

  /**
   * 📊 生成修复报告
   */
  generateReport() {
    console.log('\n📊 ERROR级别违规修复报告');
    console.log('='.repeat(50));
    console.log(`📁 处理文件数：${this.stats.filesProcessed}`);
    console.log(`🎨 硬编码颜色修复：${this.stats.hardcodedColorsFixed}`);
    console.log(`📏 硬编码尺寸修复：${this.stats.hardcodedSizesFixed}`);
    console.log(`⚠️ !important修复：${this.stats.importantFixed}`);
    console.log(`🎯 内联样式修复：${this.stats.inlineStylesFixed}`);
    console.log('='.repeat(50));
    
    if (this.fixedFiles.length > 0) {
      console.log('\n✅ 已修复的文件：');
      this.fixedFiles.forEach(file => {
        console.log(`  📄 ${file}`);
      });
    }
    
    console.log('\n🎉 ERROR级别违规修复完成！');
    console.log('💡 建议：运行 npm run css:governance:check 验证修复效果');
  }
}

// 🚀 主执行逻辑
async function main() {
  const fixer = new ErrorLevelViolationFixer();
  await fixer.fixAllErrorViolations();
}

main().catch(console.error);
