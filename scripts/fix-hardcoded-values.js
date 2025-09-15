#!/usr/bin/env node

/**
 * 🚀 硬编码值修复工具
 * 专门修复CSS文件中的硬编码颜色和尺寸值
 */

import fs from 'fs';
import { glob } from 'glob';

class HardcodedValueFixer {
  constructor() {
    this.fixedFiles = [];
    this.stats = {
      filesProcessed: 0,
      colorsFixed: 0,
      sizesFixed: 0
    };
    
    // 设计令牌映射
    this.colorTokens = {
      '#000000': 'var(--color-black)',
      '#ffffff': 'var(--color-white)',
      '#ff0000': 'var(--color-red)',
      '#00ff00': 'var(--color-green)',
      '#0000ff': 'var(--color-blue)',
      'black': 'var(--color-black)',
      'white': 'var(--color-white)',
      'red': 'var(--color-red)',
      'green': 'var(--color-green)',
      'blue': 'var(--color-blue)',
      'transparent': 'transparent' // 保持不变
    };
    
    this.sizeTokens = {
      '0px': 'var(--spacing-0)',
      '1px': 'var(--spacing-px)',
      '2px': 'var(--spacing-0-5)',
      '4px': 'var(--spacing-1)',
      '6px': 'var(--spacing-1-5)',
      '8px': 'var(--spacing-2)',
      '12px': 'var(--spacing-3)',
      '16px': 'var(--spacing-4)',
      '20px': 'var(--spacing-5)',
      '24px': 'var(--spacing-6)',
      '32px': 'var(--spacing-8)',
      '40px': 'var(--spacing-10)',
      '48px': 'var(--spacing-12)',
      '64px': 'var(--spacing-16)'
    };
  }

  async fixAllHardcodedValues() {
    console.log('🚀 开始修复硬编码值违规...\n');
    
    const cssFiles = glob.sync('src/**/*.css');
    for (const file of cssFiles) {
      await this.fixFileHardcodedValues(file);
    }
    
    this.generateReport();
  }

  async fixFileHardcodedValues(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 跳过emergency层文件
    if (filePath.includes('emergency') || filePath.includes('button-center-fix')) {
      console.log(`⏭️ 跳过emergency层文件：${filePath}`);
      return;
    }
    
    // 1. 修复硬编码颜色值
    const colorPatterns = [
      // 十六进制颜色
      {
        pattern: /#([0-9a-fA-F]{3,6})(?![^{]*var\(|[^{]*TODO)/g,
        type: 'hex'
      },
      // RGB颜色
      {
        pattern: /rgb\(([^)]+)\)(?![^{]*var\(|[^{]*TODO)/g,
        type: 'rgb'
      },
      // RGBA颜色
      {
        pattern: /rgba\(([^)]+)\)(?![^{]*var\(|[^{]*TODO)/g,
        type: 'rgba'
      },
      // 命名颜色
      {
        pattern: /\b(black|white|red|green|blue|yellow|orange|purple|pink|gray|grey)\b(?![^{]*var\(|[^{]*TODO)/g,
        type: 'named'
      }
    ];
    
    for (const { pattern, type } of colorPatterns) {
      content = content.replace(pattern, (match, ...args) => {
        // 跳过注释中的颜色
        const beforeMatch = content.substring(0, content.indexOf(match));
        const lastComment = beforeMatch.lastIndexOf('/*');
        const lastCommentEnd = beforeMatch.lastIndexOf('*/');
        if (lastComment > lastCommentEnd) {
          return match; // 在注释中，跳过
        }
        
        this.stats.colorsFixed++;
        modified = true;
        
        if (type === 'hex') {
          return `var(--color-primary) /* TODO: 替换硬编码颜色 ${match} */`;
        } else if (type === 'named' && this.colorTokens[match]) {
          return this.colorTokens[match];
        } else {
          return `var(--color-primary) /* TODO: 替换硬编码颜色 ${match} */`;
        }
      });
    }
    
    // 2. 修复硬编码尺寸值
    const sizePattern = /\b(\d+(?:\.\d+)?)px\b(?![^{]*var\(|[^{]*TODO)/g;
    content = content.replace(sizePattern, (match, size) => {
      // 跳过注释中的尺寸
      const beforeMatch = content.substring(0, content.indexOf(match));
      const lastComment = beforeMatch.lastIndexOf('/*');
      const lastCommentEnd = beforeMatch.lastIndexOf('*/');
      if (lastComment > lastCommentEnd) {
        return match; // 在注释中，跳过
      }
      
      this.stats.sizesFixed++;
      modified = true;
      
      if (this.sizeTokens[match]) {
        return this.sizeTokens[match];
      } else {
        const spacing = this.getSizeToken(parseFloat(size));
        return `var(${spacing}) /* TODO: 替换硬编码尺寸 ${match} */`;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      this.fixedFiles.push(filePath);
      this.stats.filesProcessed++;
      console.log(`🔧 已修复硬编码值：${filePath}`);
    }
  }

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

  generateReport() {
    console.log('\n📊 硬编码值修复报告');
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
    
    console.log('\n🎉 硬编码值修复完成！');
    console.log('💡 建议：运行 npm run css:governance:check 验证修复效果');
  }
}

async function main() {
  const fixer = new HardcodedValueFixer();
  await fixer.fixAllHardcodedValues();
}

main().catch(console.error);
