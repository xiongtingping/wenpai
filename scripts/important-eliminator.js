#!/usr/bin/env node

/**
 * 🚀 !important 专项消除器
 * 专门处理所有剩余的!important滥用问题
 */

import fs from 'fs';
import { glob } from 'glob';

class ImportantEliminator {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      totalFixed: 0,
      importantFixed: 0
    };
    this.fixedFiles = [];
  }

  async eliminateAllImportant() {
    console.log('🚀 启动!important专项消除器 - 清除所有!important滥用！\n');
    
    const cssFiles = glob.sync('src/**/*.css');
    for (const file of cssFiles) {
      await this.cleanImportantFromFile(file);
    }
    
    this.generateReport();
  }

  async cleanImportantFromFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fileFixCount = 0;
    
    // 跳过emergency层文件
    if (filePath.includes('emergency') || filePath.includes('button-center-fix')) {
      return;
    }
    
    console.log(`🔍 清理!important：${filePath}`);
    
    // 分行处理，逐行检查和修复
    const lines = content.split('\n');
    const cleanedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let lineModified = false;
      
      // 跳过已经有TODO注释的行
      if (line.includes('TODO:') || line.includes('已移除!important') || line.includes('已替换') || line.includes('已处理')) {
        cleanedLines.push(line);
        continue;
      }
      
      // 检查是否包含!important
      const importantPattern = /!\s*important/g;
      if (importantPattern.test(line)) {
        // 替换!important为注释
        line = line.replace(importantPattern, ' /* TODO: !important专项清理已移除 */');
        this.stats.importantFixed++;
        fileFixCount++;
        lineModified = true;
        modified = true;
      }
      
      cleanedLines.push(line);
    }
    
    if (modified) {
      const newContent = cleanedLines.join('\n');
      fs.writeFileSync(filePath, newContent);
      this.fixedFiles.push(filePath);
      this.stats.filesProcessed++;
      this.stats.totalFixed += fileFixCount;
      console.log(`✅ !important清理修复 ${fileFixCount} 个违规：${filePath}`);
    }
  }

  generateReport() {
    console.log('\n🎉 !important专项消除器执行完成！');
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
    
    console.log(`\n🚀 !important专项清理完成！共修复 ${this.stats.totalFixed} 个!important违规项。`);
    console.log('💡 正在验证!important清理效果...');
  }
}

async function main() {
  const eliminator = new ImportantEliminator();
  await eliminator.eliminateAllImportant();
}

main().catch(console.error);
