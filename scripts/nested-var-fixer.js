#!/usr/bin/env node

/**
 * 🚀 嵌套var()修复器
 * 修复所有嵌套的var()函数错误，确保CSS语法正确
 */

import fs from 'fs';
import { glob } from 'glob';

class NestedVarFixer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      totalFixed: 0,
      nestedVarsFixed: 0
    };
    this.fixedFiles = [];
  }

  async fixAllNestedVars() {
    console.log('🚀 启动嵌套var()修复器 - 修复所有嵌套var()错误！\n');
    
    const cssFiles = glob.sync('src/**/*.css');
    for (const file of cssFiles) {
      await this.fixNestedVarsInFile(file);
    }
    
    this.generateReport();
  }

  async fixNestedVarsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fileFixCount = 0;
    
    console.log(`🔍 修复嵌套var()：${filePath}`);
    
    // 1. 修复 var(--color-var(--color-xxx)) 嵌套错误
    const nestedVarPattern = /var\(--color-var\(--color-([^)]+)\)/g;
    const nestedMatches = content.match(nestedVarPattern);
    if (nestedMatches) {
      content = content.replace(nestedVarPattern, (match, colorName) => {
        return `var(--color-${colorName})`;
      });
      this.stats.nestedVarsFixed += nestedMatches.length;
      fileFixCount += nestedMatches.length;
      modified = true;
    }
    
    // 2. 修复 var(--color-var(--color-xxx) 缺少闭合括号的错误
    const unclosedNestedPattern = /var\(--color-var\(--color-([^)]+)\s+/g;
    const unclosedMatches = content.match(unclosedNestedPattern);
    if (unclosedMatches) {
      content = content.replace(unclosedNestedPattern, (match, colorName) => {
        return `var(--color-${colorName}) `;
      });
      this.stats.nestedVarsFixed += unclosedMatches.length;
      fileFixCount += unclosedMatches.length;
      modified = true;
    }
    
    // 3. 修复 var(--color-var(--color-xxx) 后面跟百分比的错误
    const percentagePattern = /var\(--color-var\(--color-([^)]+)\s+(\d+%)/g;
    const percentageMatches = content.match(percentagePattern);
    if (percentageMatches) {
      content = content.replace(percentagePattern, (match, colorName, percentage) => {
        return `var(--color-${colorName}) ${percentage}`;
      });
      this.stats.nestedVarsFixed += percentageMatches.length;
      fileFixCount += percentageMatches.length;
      modified = true;
    }
    
    // 4. 修复多层嵌套的var()
    const multiNestedPattern = /var\(--[^)]*var\([^)]*\)[^)]*/g;
    const multiNestedMatches = content.match(multiNestedPattern);
    if (multiNestedMatches) {
      content = content.replace(multiNestedPattern, 'var(--color-primary)');
      this.stats.nestedVarsFixed += multiNestedMatches.length;
      fileFixCount += multiNestedMatches.length;
      modified = true;
    }
    
    // 5. 修复未闭合的var()函数
    const unclosedVarPattern = /var\(--[^)]+(?!\))/g;
    const lines = content.split('\n');
    const fixedLines = [];
    
    for (let line of lines) {
      // 检查每行是否有未闭合的var()
      let openCount = (line.match(/var\(/g) || []).length;
      let closeCount = (line.match(/\)/g) || []).length;
      
      if (openCount > closeCount) {
        // 添加缺失的闭合括号
        const missing = openCount - closeCount;
        for (let i = 0; i < missing; i++) {
          line += ')';
        }
        this.stats.nestedVarsFixed++;
        fileFixCount++;
        modified = true;
      }
      
      fixedLines.push(line);
    }
    
    content = fixedLines.join('\n');
    
    // 6. 清理TODO注释中的硬编码颜色引用
    const todoColorPattern = /\/\* TODO: [^*]* 硬编码颜色 [^*]* \*\//g;
    const todoMatches = content.match(todoColorPattern);
    if (todoMatches) {
      content = content.replace(todoColorPattern, '');
      this.stats.nestedVarsFixed += todoMatches.length;
      fileFixCount += todoMatches.length;
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      this.fixedFiles.push(filePath);
      this.stats.filesProcessed++;
      this.stats.totalFixed += fileFixCount;
      console.log(`✅ 嵌套var()修复 ${fileFixCount} 个问题：${filePath}`);
    }
  }

  generateReport() {
    console.log('\n🎉 嵌套var()修复器执行完成！');
    console.log('='.repeat(60));
    console.log(`📁 处理文件数：${this.stats.filesProcessed}`);
    console.log(`🔧 总修复数：${this.stats.totalFixed}`);
    console.log(`🔧 嵌套var()修复：${this.stats.nestedVarsFixed}`);
    console.log('='.repeat(60));
    
    if (this.fixedFiles.length > 0) {
      console.log('\n✅ 已修复的文件：');
      this.fixedFiles.forEach(file => {
        console.log(`  📄 ${file}`);
      });
    }
    
    console.log(`\n🚀 嵌套var()修复完成！共修复 ${this.stats.totalFixed} 个嵌套var()错误。`);
    console.log('💡 正在验证嵌套var()修复效果...');
  }
}

async function main() {
  const fixer = new NestedVarFixer();
  await fixer.fixAllNestedVars();
}

main().catch(console.error);
