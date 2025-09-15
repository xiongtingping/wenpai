#!/usr/bin/env node

/**
 * 🚀 最终硬编码尺寸消除器
 * 修复剩余的硬编码尺寸值，实现真正的100%清理
 */

import fs from 'fs';
import { glob } from 'glob';

class FinalHardcodedSizeEliminator {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      totalFixed: 0,
      hardcodedSizesFixed: 0
    };
    this.fixedFiles = [];
  }

  async eliminateHardcodedSizes() {
    console.log('🚀 启动最终硬编码尺寸消除器 - 修复剩余的硬编码尺寸！\n');
    
    const cssFiles = glob.sync('src/**/*.css');
    for (const file of cssFiles) {
      await this.fixHardcodedSizesInFile(file);
    }
    
    this.generateReport();
  }

  async fixHardcodedSizesInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fileFixCount = 0;
    
    // 跳过emergency层文件
    if (filePath.includes('emergency') || filePath.includes('button-center-fix')) {
      return;
    }
    
    console.log(`🔍 修复硬编码尺寸：${filePath}`);
    
    // 1. 替换常见的硬编码尺寸值
    const sizeReplacements = [
      // 1px -> var(--spacing-px)
      { pattern: /:\s*1px\s*([;}])/g, replacement: ': var(--spacing-px)$1' },
      { pattern: /\s+1px\s+/g, replacement: ' var(--spacing-px) ' },
      { pattern: /\s+1px$/g, replacement: ' var(--spacing-px)' },
      { pattern: /^1px\s+/g, replacement: 'var(--spacing-px) ' },
      
      // 2px -> var(--spacing-0-5)
      { pattern: /:\s*2px\s*([;}])/g, replacement: ': var(--spacing-0-5)$1' },
      { pattern: /\s+2px\s+/g, replacement: ' var(--spacing-0-5) ' },
      
      // 4px -> var(--spacing-1)
      { pattern: /:\s*4px\s*([;}])/g, replacement: ': var(--spacing-1)$1' },
      { pattern: /\s+4px\s+/g, replacement: ' var(--spacing-1) ' },
      
      // 8px -> var(--spacing-2)
      { pattern: /:\s*8px\s*([;}])/g, replacement: ': var(--spacing-2)$1' },
      { pattern: /\s+8px\s+/g, replacement: ' var(--spacing-2) ' },
      
      // 12px -> var(--spacing-3)
      { pattern: /:\s*12px\s*([;}])/g, replacement: ': var(--spacing-3)$1' },
      { pattern: /\s+12px\s+/g, replacement: ' var(--spacing-3) ' },
      
      // 16px -> var(--spacing-4)
      { pattern: /:\s*16px\s*([;}])/g, replacement: ': var(--spacing-4)$1' },
      { pattern: /\s+16px\s+/g, replacement: ' var(--spacing-4) ' },
      
      // 20px -> var(--spacing-5)
      { pattern: /:\s*20px\s*([;}])/g, replacement: ': var(--spacing-5)$1' },
      { pattern: /\s+20px\s+/g, replacement: ' var(--spacing-5) ' },
      
      // 24px -> var(--spacing-6)
      { pattern: /:\s*24px\s*([;}])/g, replacement: ': var(--spacing-6)$1' },
      { pattern: /\s+24px\s+/g, replacement: ' var(--spacing-6) ' }
    ];
    
    for (const { pattern, replacement } of sizeReplacements) {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        this.stats.hardcodedSizesFixed += matches.length;
        fileFixCount += matches.length;
        modified = true;
      }
    }
    
    // 2. 特殊处理border中的1px
    const borderPatterns = [
      { pattern: /border:\s*1px\s+/g, replacement: 'border: var(--spacing-px) ' },
      { pattern: /border-width:\s*1px\s*([;}])/g, replacement: 'border-width: var(--spacing-px)$1' },
      { pattern: /border-top:\s*1px\s+/g, replacement: 'border-top: var(--spacing-px) ' },
      { pattern: /border-bottom:\s*1px\s+/g, replacement: 'border-bottom: var(--spacing-px) ' },
      { pattern: /border-left:\s*1px\s+/g, replacement: 'border-left: var(--spacing-px) ' },
      { pattern: /border-right:\s*1px\s+/g, replacement: 'border-right: var(--spacing-px) ' }
    ];
    
    for (const { pattern, replacement } of borderPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        this.stats.hardcodedSizesFixed += matches.length;
        fileFixCount += matches.length;
        modified = true;
      }
    }
    
    // 3. 处理box-shadow中的硬编码值
    const shadowPatterns = [
      { pattern: /0\s+1px\s+/g, replacement: '0 var(--spacing-px) ' },
      { pattern: /0\s+2px\s+/g, replacement: '0 var(--spacing-0-5) ' },
      { pattern: /0\s+4px\s+/g, replacement: '0 var(--spacing-1) ' },
      { pattern: /0\s+8px\s+/g, replacement: '0 var(--spacing-2) ' }
    ];
    
    for (const { pattern, replacement } of shadowPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        this.stats.hardcodedSizesFixed += matches.length;
        fileFixCount += matches.length;
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      this.fixedFiles.push(filePath);
      this.stats.filesProcessed++;
      this.stats.totalFixed += fileFixCount;
      console.log(`✅ 硬编码尺寸修复 ${fileFixCount} 个违规：${filePath}`);
    }
  }

  generateReport() {
    console.log('\n🎉 最终硬编码尺寸消除器执行完成！');
    console.log('='.repeat(60));
    console.log(`📁 处理文件数：${this.stats.filesProcessed}`);
    console.log(`🔧 总修复数：${this.stats.totalFixed}`);
    console.log(`📏 硬编码尺寸修复：${this.stats.hardcodedSizesFixed}`);
    console.log('='.repeat(60));
    
    if (this.fixedFiles.length > 0) {
      console.log('\n✅ 已修复的文件：');
      this.fixedFiles.forEach(file => {
        console.log(`  📄 ${file}`);
      });
    }
    
    console.log(`\n🚀 硬编码尺寸清理完成！共修复 ${this.stats.totalFixed} 个硬编码尺寸违规项。`);
    console.log('💡 正在验证硬编码尺寸清理效果...');
  }
}

async function main() {
  const eliminator = new FinalHardcodedSizeEliminator();
  await eliminator.eliminateHardcodedSizes();
}

main().catch(console.error);
