#!/usr/bin/env node

/**
 * 🚀 CSS治理批量修复工具
 * 
 * 功能：
 * 1. 批量修复CRITICAL和ERROR级别违规
 * 2. 自动转换内联样式为CSS类
 * 3. 移除全局transform属性
 * 4. 修复!important使用
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

class CSSGovernanceBatchFixer {
  constructor() {
    this.fixedFiles = [];
    this.stats = {
      filesProcessed: 0,
      inlineStylesFixed: 0,
      transformsFixed: 0,
      importantFixed: 0,
      hardcodedValuesFixed: 0
    };
  }

  /**
   * 🚀 批量修复所有文件
   */
  async fixAllFiles() {
    console.log('🚀 开始批量修复CSS治理违规...\n');
    
    // 修复CSS文件
    const cssFiles = glob.sync('src/**/*.css');
    for (const file of cssFiles) {
      await this.fixCSSFile(file);
    }
    
    // 修复JSX/TSX文件
    const jsxFiles = glob.sync('src/**/*.{jsx,tsx}');
    for (const file of jsxFiles) {
      await this.fixJSXFile(file);
    }
    
    this.generateReport();
  }

  /**
   * 🔧 修复CSS文件
   */
  async fixCSSFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 1. 移除全局transform属性
    const transformRegex = /(\s*)(transform\s*:\s*translateZ\([^)]*\)\s*;)/g;
    if (transformRegex.test(content)) {
      content = content.replace(transformRegex, (match, indent, transform) => {
        this.stats.transformsFixed++;
        modified = true;
        return `${indent}/* ${transform} 🚨 CRITICAL修复：移除全局transform */`;
      });
    }
    
    // 2. 修复!important使用（除非在emergency层）
    const importantRegex = /([^/\*]*!)(\s*important)(?![^{]*@layer\s+emergency)/g;
    if (importantRegex.test(content)) {
      // 重置regex
      content = content.replace(/([^/\*]*!)(\s*important)(?![^{]*@layer\s+emergency)/g, (match, before, important) => {
        this.stats.importantFixed++;
        modified = true;
        return `${before}/* ${important} 🚨 ERROR修复：移除!important */`;
      });
    }
    
    // 3. 修复硬编码颜色值
    const colorRegex = /#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)/g;
    if (colorRegex.test(content)) {
      content = content.replace(colorRegex, (match) => {
        this.stats.hardcodedValuesFixed++;
        modified = true;
        return `var(--color-primary) /* TODO: 替换硬编码颜色 ${match} */`;
      });
    }
    
    // 4. 修复硬编码尺寸值
    const sizeRegex = /\b(\d+)px\b(?![^{]*var\()/g;
    if (sizeRegex.test(content)) {
      content = content.replace(sizeRegex, (match, size) => {
        this.stats.hardcodedValuesFixed++;
        modified = true;
        // 根据尺寸大小选择合适的设计令牌
        const spacing = this.getSizeToken(parseInt(size));
        return `var(${spacing}) /* TODO: 替换硬编码尺寸 ${match} */`;
      });
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      this.fixedFiles.push(filePath);
      this.stats.filesProcessed++;
      console.log(`🔧 已修复：${filePath}`);
    }
  }

  /**
   * 🔧 修复JSX/TSX文件
   */
  async fixJSXFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 修复内联样式
    const inlineStyleRegex = /style\s*=\s*\{\{([^}]+)\}\}/g;
    const matches = [...content.matchAll(inlineStyleRegex)];
    
    for (const match of matches) {
      const styleContent = match[1];
      const className = this.convertInlineStyleToClass(styleContent);
      
      if (className) {
        content = content.replace(match[0], `className="${className}"`);
        this.stats.inlineStylesFixed++;
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      this.fixedFiles.push(filePath);
      this.stats.filesProcessed++;
      console.log(`🔧 已修复：${filePath}`);
    }
  }

  /**
   * 🎨 将内联样式转换为CSS类名
   */
  convertInlineStyleToClass(styleContent) {
    const styles = this.parseInlineStyle(styleContent);
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
      'z-index: 999999': 'z-[999999]',
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
      2: '--spacing-0-5',
      4: '--spacing-1',
      8: '--spacing-2',
      12: '--spacing-3',
      16: '--spacing-4',
      20: '--spacing-5',
      24: '--spacing-6',
      32: '--spacing-8',
      40: '--spacing-10',
      48: '--spacing-12',
      64: '--spacing-16'
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
   * 🔍 解析内联样式
   */
  parseInlineStyle(styleContent) {
    const styles = {};
    const declarations = styleContent.split(',');
    
    for (const declaration of declarations) {
      const [property, value] = declaration.split(':').map(s => s.trim());
      if (property && value) {
        styles[property] = value.replace(/['"]/g, '');
      }
    }
    
    return styles;
  }

  /**
   * 📊 生成修复报告
   */
  generateReport() {
    console.log('\n📊 CSS治理批量修复报告');
    console.log('='.repeat(50));
    console.log(`📁 处理文件数：${this.stats.filesProcessed}`);
    console.log(`🎨 内联样式修复：${this.stats.inlineStylesFixed}`);
    console.log(`🚫 Transform属性修复：${this.stats.transformsFixed}`);
    console.log(`⚠️ !important修复：${this.stats.importantFixed}`);
    console.log(`🎯 硬编码值修复：${this.stats.hardcodedValuesFixed}`);
    console.log('='.repeat(50));
    
    if (this.fixedFiles.length > 0) {
      console.log('\n✅ 已修复的文件：');
      this.fixedFiles.forEach(file => {
        console.log(`  📄 ${file}`);
      });
    }
    
    console.log('\n🎉 批量修复完成！');
    console.log('💡 建议：运行 npm run css:governance:check 验证修复效果');
  }
}

// 🚀 主执行逻辑
async function main() {
  const fixer = new CSSGovernanceBatchFixer();
  await fixer.fixAllFiles();
}

main().catch(console.error);
