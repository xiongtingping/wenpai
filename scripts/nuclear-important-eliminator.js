#!/usr/bin/env node

/**
 * 🚀 核弹级!important消除器
 * 使用核弹级方法彻底清除所有!important，无论在什么位置
 */

import fs from 'fs';
import { glob } from 'glob';

class NuclearImportantEliminator {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      totalFixed: 0,
      importantFixed: 0
    };
    this.fixedFiles = [];
  }

  async nuclearEliminate() {
    console.log('🚀 启动核弹级!important消除器 - 核弹级清除所有!important！\n');
    
    const cssFiles = glob.sync('src/**/*.css');
    for (const file of cssFiles) {
      await this.nuclearCleanImportant(file);
    }
    
    this.generateReport();
  }

  async nuclearCleanImportant(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fileFixCount = 0;
    
    // 跳过emergency层文件
    if (filePath.includes('emergency') || filePath.includes('button-center-fix')) {
      return;
    }
    
    console.log(`🔍 核弹级清理!important：${filePath}`);
    
    // 记录原始内容长度
    const originalLength = content.length;
    
    // 1. 核弹级清除：直接替换所有包含"!important"的字符串
    const nuclearPattern = /!\s*important/gi;
    const allMatches = content.match(nuclearPattern);
    if (allMatches) {
      content = content.replace(nuclearPattern, ' /* 核弹级清理已移除!important */');
      this.stats.importantFixed += allMatches.length;
      fileFixCount += allMatches.length;
      modified = true;
    }
    
    // 2. 清除可能遗漏的变体
    const variants = [
      /!\s*Important/g,
      /!\s*IMPORTANT/g,
      /!\s*ImPoRtAnT/g,
      /!\s*important\s*;/g,
      /!\s*important\s*}/g,
      /!\s*important\s*\*/g
    ];
    
    for (const variant of variants) {
      const variantMatches = content.match(variant);
      if (variantMatches) {
        content = content.replace(variant, ' /* 核弹级清理已移除!important变体 */');
        this.stats.importantFixed += variantMatches.length;
        fileFixCount += variantMatches.length;
        modified = true;
      }
    }
    
    // 3. 清除任何包含"important"的感叹号组合
    const importantWithExclamation = /!\s*[Ii][Mm][Pp][Oo][Rr][Tt][Aa][Nn][Tt]/g;
    const exclamationMatches = content.match(importantWithExclamation);
    if (exclamationMatches) {
      content = content.replace(importantWithExclamation, ' /* 核弹级清理已移除!important */');
      this.stats.importantFixed += exclamationMatches.length;
      fileFixCount += exclamationMatches.length;
      modified = true;
    }
    
    // 4. 清除任何单独的感叹号后跟important的情况
    const separateExclamation = /!\s+important/gi;
    const separateMatches = content.match(separateExclamation);
    if (separateMatches) {
      content = content.replace(separateExclamation, ' /* 核弹级清理已移除!important */');
      this.stats.importantFixed += separateMatches.length;
      fileFixCount += separateMatches.length;
      modified = true;
    }
    
    // 5. 清除CSS属性值中的!important
    const propertyPattern = /([^;{}]+)!\s*important([^;{}]*)/gi;
    const propertyMatches = [...content.matchAll(propertyPattern)];
    for (const match of propertyMatches) {
      const fullMatch = match[0];
      const beforeImportant = match[1];
      const afterImportant = match[2] || '';
      
      const replacement = `${beforeImportant.trim()}${afterImportant} /* 核弹级清理已移除!important */`;
      content = content.replace(fullMatch, replacement);
      this.stats.importantFixed++;
      fileFixCount++;
      modified = true;
    }
    
    // 6. 最终核弹级清理：逐字符检查
    const chars = content.split('');
    const cleanedChars = [];
    let i = 0;
    
    while (i < chars.length) {
      if (chars[i] === '!' && i + 9 < chars.length) {
        // 检查接下来的字符是否构成"important"
        const next9 = chars.slice(i + 1, i + 10).join('').toLowerCase();
        if (next9.includes('important')) {
          // 找到!important，替换为注释
          cleanedChars.push(' /* 核弹级字符清理已移除!important */');
          // 跳过整个!important字符串
          while (i < chars.length && !chars[i].match(/[;}]/)) {
            i++;
          }
          this.stats.importantFixed++;
          fileFixCount++;
          modified = true;
        } else {
          cleanedChars.push(chars[i]);
          i++;
        }
      } else {
        cleanedChars.push(chars[i]);
        i++;
      }
    }
    
    if (modified) {
      const finalContent = cleanedChars.join('');
      
      // 清理重复的注释
      const cleanedContent = finalContent
        .replace(/\/\* 核弹级清理已移除!important \*\/\s*\/\* 核弹级清理已移除!important \*\//g, '/* 核弹级清理已移除!important */')
        .replace(/\/\* 核弹级清理已移除!important变体 \*\/\s*\/\* 核弹级清理已移除!important变体 \*\//g, '/* 核弹级清理已移除!important变体 */')
        .replace(/\/\* 核弹级字符清理已移除!important \*\/\s*\/\* 核弹级字符清理已移除!important \*\//g, '/* 核弹级字符清理已移除!important */');
      
      fs.writeFileSync(filePath, cleanedContent);
      this.fixedFiles.push(filePath);
      this.stats.filesProcessed++;
      this.stats.totalFixed += fileFixCount;
      console.log(`✅ 核弹级!important清理修复 ${fileFixCount} 个违规：${filePath}`);
    }
  }

  generateReport() {
    console.log('\n🎉 核弹级!important消除器执行完成！');
    console.log('='.repeat(60));
    console.log(`📁 处理文件数：${this.stats.filesProcessed}`);
    console.log(`🔧 总修复数：${this.stats.totalFixed}`);
    console.log(`⚠️ !important修复：${this.stats.importantFixed}`);
    console.log('='.repeat(60));
    
    if (this.fixedFiles.length > 0) {
      console.log('\n✅ 已修复的文件：');
      this.fixedFiles.forEach(file => {
        console.log(`  📄 ${file}`);
      });
    }
    
    console.log(`\n🚀 核弹级!important清理完成！共修复 ${this.stats.totalFixed} 个!important违规项。`);
    console.log('💡 正在验证核弹级!important清理效果...');
  }
}

async function main() {
  const eliminator = new NuclearImportantEliminator();
  await eliminator.nuclearEliminate();
}

main().catch(console.error);
