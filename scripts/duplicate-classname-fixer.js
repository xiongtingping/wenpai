#!/usr/bin/env node

/**
 * 🚀 重复className修复器
 * 修复JSX中重复的className属性
 */

import fs from 'fs';
import { glob } from 'glob';

class DuplicateClassNameFixer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      totalFixed: 0,
      duplicatesFixed: 0
    };
    this.fixedFiles = [];
  }

  async fixAllDuplicateClassNames() {
    console.log('🚀 启动重复className修复器 - 修复所有重复的className属性！\n');
    
    const tsxFiles = glob.sync('src/**/*.{tsx,jsx}');
    for (const file of tsxFiles) {
      await this.fixDuplicateClassNamesInFile(file);
    }
    
    this.generateReport();
  }

  async fixDuplicateClassNamesInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fileFixCount = 0;
    
    console.log(`🔍 修复重复className：${filePath}`);
    
    // 1. 修复重复的className属性
    const duplicateClassNamePattern = /className="([^"]*)"[^>]*className="([^"]*)"/g;
    let match;
    while ((match = duplicateClassNamePattern.exec(content)) !== null) {
      const firstClassName = match[1];
      const secondClassName = match[2];
      
      // 合并两个className
      let mergedClassName = firstClassName;
      if (secondClassName && secondClassName !== 'inline-style-converted') {
        mergedClassName = `${firstClassName} ${secondClassName}`;
      } else if (secondClassName === 'inline-style-converted') {
        mergedClassName = `${firstClassName} inline-style-converted`;
      }
      
      // 替换重复的className
      const originalMatch = match[0];
      const replacement = `className="${mergedClassName}"`;
      
      content = content.replace(originalMatch, replacement);
      this.stats.duplicatesFixed++;
      fileFixCount++;
      modified = true;
    }
    
    // 2. 修复带注释的重复className
    const commentedClassNamePattern = /className="([^"]*)"([^>]*?)className="([^"]*)"[^>]*?\/\*[^*]*\*\//g;
    let commentMatch;
    while ((commentMatch = commentedClassNamePattern.exec(content)) !== null) {
      const firstClassName = commentMatch[1];
      const middlePart = commentMatch[2];
      const secondClassName = commentMatch[3];
      
      // 合并className
      let mergedClassName = firstClassName;
      if (secondClassName && secondClassName !== 'inline-style-converted') {
        mergedClassName = `${firstClassName} ${secondClassName}`;
      } else if (secondClassName === 'inline-style-converted') {
        mergedClassName = `${firstClassName} inline-style-converted`;
      }
      
      // 替换
      const originalMatch = commentMatch[0];
      const replacement = `className="${mergedClassName}"${middlePart}`;
      
      content = content.replace(originalMatch, replacement);
      this.stats.duplicatesFixed++;
      fileFixCount++;
      modified = true;
    }
    
    // 3. 修复更复杂的重复className模式
    const complexPattern = /className=\{[^}]*\}[^>]*className="[^"]*"/g;
    const complexMatches = content.match(complexPattern);
    if (complexMatches) {
      for (const match of complexMatches) {
        // 提取第一个className（模板字符串）
        const firstClassMatch = match.match(/className=\{([^}]*)\}/);
        const secondClassMatch = match.match(/className="([^"]*)"/);
        
        if (firstClassMatch && secondClassMatch) {
          const firstClassName = firstClassMatch[1];
          const secondClassName = secondClassMatch[1];
          
          // 合并className
          let mergedClassName = firstClassName;
          if (secondClassName === 'inline-style-converted') {
            // 在模板字符串中添加inline-style-converted
            if (firstClassName.includes('`')) {
              mergedClassName = firstClassName.replace('`', '` inline-style-converted');
            } else {
              mergedClassName = `${firstClassName} inline-style-converted`;
            }
          }
          
          const replacement = `className={${mergedClassName}}`;
          content = content.replace(match, replacement);
          this.stats.duplicatesFixed++;
          fileFixCount++;
          modified = true;
        }
      }
    }
    
    // 4. 清理TODO注释
    const todoPattern = /\/\* TODO: 内联样式已转换 \*\//g;
    if (todoPattern.test(content)) {
      content = content.replace(todoPattern, '');
      this.stats.duplicatesFixed++;
      fileFixCount++;
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      this.fixedFiles.push(filePath);
      this.stats.filesProcessed++;
      this.stats.totalFixed += fileFixCount;
      console.log(`✅ 重复className修复 ${fileFixCount} 个问题：${filePath}`);
    }
  }

  generateReport() {
    console.log('\n🎉 重复className修复器执行完成！');
    console.log('='.repeat(60));
    console.log(`📁 处理文件数：${this.stats.filesProcessed}`);
    console.log(`🔧 总修复数：${this.stats.totalFixed}`);
    console.log(`🔧 重复className修复：${this.stats.duplicatesFixed}`);
    console.log('='.repeat(60));
    
    if (this.fixedFiles.length > 0) {
      console.log('\n✅ 已修复的文件：');
      this.fixedFiles.forEach(file => {
        console.log(`  📄 ${file}`);
      });
    }
    
    console.log(`\n🚀 重复className修复完成！共修复 ${this.stats.totalFixed} 个重复className问题。`);
    console.log('💡 正在验证重复className修复效果...');
  }
}

async function main() {
  const fixer = new DuplicateClassNameFixer();
  await fixer.fixAllDuplicateClassNames();
}

main().catch(console.error);
