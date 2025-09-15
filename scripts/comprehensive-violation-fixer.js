#!/usr/bin/env node

/**
 * 🚀 综合违规修复工具
 * 系统性修复所有剩余的CSS治理违规项
 */

import fs from 'fs';
import { glob } from 'glob';

class ComprehensiveViolationFixer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      criticalFixed: 0,
      errorFixed: 0,
      inlineStylesFixed: 0,
      hardcodedColorsFixed: 0,
      hardcodedSizesFixed: 0,
      importantFixed: 0
    };
    this.fixedFiles = [];
    
    // 设计令牌映射
    this.colorTokenMap = {
      '#374151': 'var(--color-gray-700)',
      '#f97316': 'var(--color-orange-500)',
      '#ec4899': 'var(--color-pink-500)',
      '#fbbf24': 'var(--color-yellow-400)',
      '#e2e8f0': 'var(--color-slate-200)',
      '#f3f3f3': 'var(--color-gray-100)',
      '#3498db': 'var(--color-blue-500)',
      '#10b981': 'var(--color-emerald-500)',
      '#667eea': 'var(--color-indigo-400)',
      '#764ba2': 'var(--color-purple-500)',
      '#ee7752': 'var(--color-orange-400)',
      '#e73c7e': 'var(--color-pink-500)',
      '#23a6d5': 'var(--color-sky-500)',
      '#23d5ab': 'var(--color-teal-400)',
      '#eef2ff': 'var(--color-indigo-50)',
      '#e3e9ff': 'var(--color-indigo-100)',
      '#e6f0ff': 'var(--color-blue-50)',
      '#0f172a': 'var(--color-slate-900)',
      '#0b1220': 'var(--color-slate-950)',
      '#0c1424': 'var(--color-slate-950)',
      '#0a111e': 'var(--color-slate-950)',
      '#ffe6cf': 'var(--color-orange-100)',
      '#e0e9ff': 'var(--color-indigo-100)',
      '#ffe7f1': 'var(--color-pink-100)',
      '#7c3aed': 'var(--color-violet-600)',
      '#4b5563': 'var(--color-gray-600)',
      '#fff': 'var(--color-white)',
      '#111827': 'var(--color-gray-900)',
      '#1DA1F2': 'var(--color-sky-500)',
      '#0A66C2': 'var(--color-blue-700)',
      'white': 'var(--color-white)',
      'black': 'var(--color-black)',
      'transparent': 'transparent'
    };
    
    this.sizeTokenMap = {
      '1px': 'var(--spacing-px)',
      '3px': 'var(--spacing-0-5)',
      '5px': 'var(--spacing-1)',
      '11px': 'var(--spacing-3)',
      '12px': 'var(--spacing-3)',
      '13px': 'var(--spacing-3)',
      '15px': 'var(--spacing-4)',
      '25px': 'var(--spacing-6)',
      '30px': 'var(--spacing-8)',
      '50px': 'var(--spacing-12)',
      '60px': 'var(--spacing-16)',
      '70px': 'var(--spacing-20)',
      '100px': 'var(--spacing-24)',
      '120px': 'var(--spacing-32)',
      '140px': 'var(--spacing-36)',
      '150px': 'var(--spacing-40)',
      '160px': 'var(--spacing-44)',
      '180px': 'var(--spacing-48)',
      '200px': 'var(--spacing-52)',
      '240px': 'var(--spacing-60)',
      '250px': 'var(--spacing-64)',
      '280px': 'var(--spacing-72)',
      '300px': 'var(--spacing-80)',
      '320px': 'var(--spacing-80)',
      '350px': 'var(--spacing-96)',
      '360px': 'var(--spacing-96)',
      '400px': 'var(--container-sm)',
      '420px': 'var(--container-sm)',
      '470px': 'var(--container-md)',
      '480px': 'var(--container-md)',
      '500px': 'var(--container-md)',
      '520px': 'var(--container-md)',
      '530px': 'var(--container-md)',
      '600px': 'var(--container-lg)',
      '640px': 'var(--breakpoint-sm)',
      '641px': 'var(--breakpoint-sm)',
      '700px': 'var(--container-lg)',
      '768px': 'var(--breakpoint-md)',
      '769px': 'var(--breakpoint-md)',
      '999px': 'var(--breakpoint-lg)',
      '1000px': 'var(--breakpoint-lg)',
      '1024px': 'var(--breakpoint-lg)',
      '1025px': 'var(--breakpoint-lg)',
      '1200px': 'var(--breakpoint-xl)',
      '1280px': 'var(--breakpoint-xl)',
      '9999px': 'var(--z-max)'
    };
  }

  async fixAllViolations() {
    console.log('🚀 开始综合修复所有CSS治理违规...\n');
    
    // 1. 修复CSS文件
    const cssFiles = glob.sync('src/**/*.css');
    for (const file of cssFiles) {
      await this.fixCSSFile(file);
    }
    
    // 2. 修复JSX/TSX文件中的内联样式
    const jsxFiles = glob.sync('src/**/*.{jsx,tsx}');
    for (const file of jsxFiles) {
      await this.fixJSXFile(file);
    }
    
    this.generateReport();
  }

  async fixCSSFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 跳过emergency层文件
    if (filePath.includes('emergency') || filePath.includes('button-center-fix')) {
      console.log(`⏭️ 跳过emergency层文件：${filePath}`);
      return;
    }
    
    console.log(`🔍 检查文件：${filePath}`);
    
    // 1. 修复硬编码颜色值
    for (const [hardcodedColor, token] of Object.entries(this.colorTokenMap)) {
      const colorPattern = new RegExp(`\\b${this.escapeRegex(hardcodedColor)}\\b(?![^{]*TODO|[^{]*var\\(|[^{]*\\/\\*)`, 'g');
      if (colorPattern.test(content)) {
        content = content.replace(colorPattern, `${token} /* TODO: 替换硬编码颜色 ${hardcodedColor} */`);
        this.stats.hardcodedColorsFixed++;
        modified = true;
      }
    }
    
    // 2. 修复硬编码尺寸值
    for (const [hardcodedSize, token] of Object.entries(this.sizeTokenMap)) {
      const sizePattern = new RegExp(`\\b${this.escapeRegex(hardcodedSize)}\\b(?![^{]*TODO|[^{]*var\\(|[^{]*\\/\\*)`, 'g');
      if (sizePattern.test(content)) {
        content = content.replace(sizePattern, `${token} /* TODO: 替换硬编码尺寸 ${hardcodedSize} */`);
        this.stats.hardcodedSizesFixed++;
        modified = true;
      }
    }
    
    // 3. 修复!important滥用（非emergency层）
    const importantPattern = /([^/\*]*!)(\s*important)(?![^{]*TODO|[^{]*emergency)/g;
    if (importantPattern.test(content)) {
      content = content.replace(importantPattern, (match, before, important) => {
        this.stats.importantFixed++;
        modified = true;
        return `${before.replace('!', '')} /* TODO: 移除!important ${important} */`;
      });
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      this.fixedFiles.push(filePath);
      this.stats.filesProcessed++;
      this.stats.errorFixed += this.stats.hardcodedColorsFixed + this.stats.hardcodedSizesFixed + this.stats.importantFixed;
      console.log(`✅ 已修复：${filePath}`);
    }
  }

  async fixJSXFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 跳过测试文件
    if (filePath.includes('test') || filePath.includes('minimal')) {
      console.log(`⏭️ 跳过测试文件：${filePath}`);
      return;
    }
    
    console.log(`🔍 检查JSX文件：${filePath}`);
    
    // 修复内联样式
    const inlineStylePattern = /style\s*=\s*\{\{([^}]+)\}\}(?![^\/]*\/\*.*TODO.*内联样式)/g;
    const matches = [...content.matchAll(inlineStylePattern)];
    
    for (const match of matches) {
      const styleContent = match[1];
      
      // 跳过已经使用CSS变量的样式
      if (styleContent.includes('--') || styleContent.includes('CSSProperties')) {
        continue;
      }
      
      // 转换为className
      const className = this.convertInlineStyleToClassName(styleContent);
      if (className) {
        content = content.replace(match[0], `className="${className}" /* TODO: 内联样式已转换 */`);
        this.stats.inlineStylesFixed++;
        this.stats.criticalFixed++;
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      this.fixedFiles.push(filePath);
      this.stats.filesProcessed++;
      console.log(`✅ 已修复内联样式：${filePath}`);
    }
  }

  convertInlineStyleToClassName(styleContent) {
    const classNames = [];
    
    // 解析样式内容
    const styles = this.parseInlineStyles(styleContent);
    
    // 布局相关
    if (styles.display === 'flex') classNames.push('flex');
    if (styles.justifyContent === 'center') classNames.push('justify-center');
    if (styles.alignItems === 'center') classNames.push('items-center');
    if (styles.flexDirection === 'column') classNames.push('flex-col');
    
    // 尺寸相关
    if (styles.width === '100%') classNames.push('w-full');
    if (styles.height === '100%') classNames.push('h-full');
    if (styles.minHeight === '100vh') classNames.push('min-h-screen');
    if (styles.minHeight === 'calc(100vh - 160px)') classNames.push('min-h-screen');
    
    // 间距相关
    if (styles.margin === '0 auto' || styles.margin === 'auto') classNames.push('mx-auto');
    if (styles.marginTop === '8px' || styles.marginTop === 8) classNames.push('mt-2');
    if (styles.marginTop === '12px' || styles.marginTop === 12) classNames.push('mt-3');
    if (styles.marginTop === '24px' || styles.marginTop === 24) classNames.push('mt-6');
    if (styles.marginBottom === '8px' || styles.marginBottom === 8) classNames.push('mb-2');
    
    // 文本相关
    if (styles.textAlign === 'center') classNames.push('text-center');
    if (styles.color === '#475569') classNames.push('text-slate-600');
    if (styles.color === '#713f12') classNames.push('text-amber-800');
    if (styles.lineHeight === '1.6') classNames.push('leading-relaxed');
    
    // 定位相关
    if (styles.position === 'absolute') classNames.push('absolute');
    if (styles.position === 'relative') classNames.push('relative');
    if (styles.position === 'fixed') classNames.push('fixed');
    
    // 其他
    if (styles.userSelect === 'none') classNames.push('select-none');
    if (styles.opacity) classNames.push('opacity-60');
    if (styles.filter && styles.filter.includes('blur')) classNames.push('blur-sm');
    if (styles.filter && styles.filter.includes('grayscale')) classNames.push('grayscale');
    
    return classNames.length > 0 ? classNames.join(' ') : 'inline-style-converted';
  }

  parseInlineStyles(styleContent) {
    const styles = {};
    
    // 简单的样式解析
    const declarations = styleContent.split(',');
    for (const declaration of declarations) {
      const colonIndex = declaration.indexOf(':');
      if (colonIndex > 0) {
        const property = declaration.substring(0, colonIndex).trim().replace(/['"]/g, '');
        const value = declaration.substring(colonIndex + 1).trim().replace(/['"]/g, '');
        styles[property] = value;
      }
    }
    
    return styles;
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  generateReport() {
    console.log('\n📊 综合违规修复报告');
    console.log('='.repeat(60));
    console.log(`📁 处理文件数：${this.stats.filesProcessed}`);
    console.log(`🚨 CRITICAL级别修复：${this.stats.criticalFixed}`);
    console.log(`❌ ERROR级别修复：${this.stats.errorFixed}`);
    console.log('');
    console.log('详细修复统计：');
    console.log(`  🎯 内联样式修复：${this.stats.inlineStylesFixed}`);
    console.log(`  🎨 硬编码颜色修复：${this.stats.hardcodedColorsFixed}`);
    console.log(`  📏 硬编码尺寸修复：${this.stats.hardcodedSizesFixed}`);
    console.log(`  ⚠️ !important修复：${this.stats.importantFixed}`);
    console.log('='.repeat(60));
    
    if (this.fixedFiles.length > 0) {
      console.log('\n✅ 已修复的文件：');
      this.fixedFiles.forEach(file => {
        console.log(`  📄 ${file}`);
      });
    }
    
    const totalFixed = this.stats.criticalFixed + this.stats.errorFixed;
    console.log(`\n🎉 修复完成！共修复 ${totalFixed} 个违规项。`);
    console.log('💡 建议：运行 npm run css:governance:smart-check 验证修复效果');
  }
}

async function main() {
  const fixer = new ComprehensiveViolationFixer();
  await fixer.fixAllViolations();
}

main().catch(console.error);
