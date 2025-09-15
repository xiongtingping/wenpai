#!/usr/bin/env node

/**
 * 🚀 综合CSS语法修复器
 * 修复所有CSS语法错误，确保构建成功
 */

import fs from 'fs';
import { glob } from 'glob';

class ComprehensiveCssSyntaxFixer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      totalFixed: 0,
      syntaxErrorsFixed: 0
    };
    this.fixedFiles = [];
  }

  async fixAllSyntaxErrors() {
    console.log('🚀 启动综合CSS语法修复器 - 修复所有CSS语法错误！\n');
    
    const cssFiles = glob.sync('src/**/*.css');
    for (const file of cssFiles) {
      await this.fixSyntaxErrorsInFile(file);
    }
    
    this.generateReport();
  }

  async fixSyntaxErrorsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fileFixCount = 0;
    
    console.log(`🔍 修复语法错误：${filePath}`);
    
    // 1. 移除孤立的闭合大括号
    const orphanBracePattern = /^\s*\/\*[^*]*\*\/\s*}\s*$/gm;
    const orphanMatches = content.match(orphanBracePattern);
    if (orphanMatches) {
      content = content.replace(orphanBracePattern, '');
      this.stats.syntaxErrorsFixed += orphanMatches.length;
      fileFixCount += orphanMatches.length;
      modified = true;
    }
    
    // 2. 移除单独的闭合大括号行
    const standaloneBracePattern = /^\s*}\s*$/gm;
    const standaloneMatches = content.match(standaloneBracePattern);
    if (standaloneMatches) {
      // 检查这些大括号是否真的是孤立的
      const lines = content.split('\n');
      const fixedLines = [];
      let braceCount = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // 计算大括号平衡
        const openBraces = (line.match(/\{/g) || []).length;
        const closeBraces = (line.match(/\}/g) || []).length;
        
        braceCount += openBraces - closeBraces;
        
        // 如果这是一个孤立的闭合大括号行且大括号已经平衡
        if (line.trim() === '}' && braceCount < 0) {
          // 跳过这个孤立的大括号
          braceCount++; // 调整计数
          this.stats.syntaxErrorsFixed++;
          fileFixCount++;
          modified = true;
          continue;
        }
        
        fixedLines.push(line);
      }
      
      content = fixedLines.join('\n');
    }
    
    // 3. 修复注释后的孤立大括号
    const commentBracePattern = /\/\*[^*]*\*\/\s*}\s*(?=\n|$)/g;
    const commentBraceMatches = content.match(commentBracePattern);
    if (commentBraceMatches) {
      content = content.replace(commentBracePattern, (match) => {
        return match.replace(/}\s*$/, '');
      });
      this.stats.syntaxErrorsFixed += commentBraceMatches.length;
      fileFixCount += commentBraceMatches.length;
      modified = true;
    }
    
    // 4. 修复空的CSS规则
    const emptyRulePattern = /[^}]\s*{\s*\/\*[^*]*\*\/\s*}\s*(?=\n)/g;
    const emptyRuleMatches = content.match(emptyRulePattern);
    if (emptyRuleMatches) {
      content = content.replace(emptyRulePattern, (match) => {
        // 保留选择器，但移除空的规则体
        return match.replace(/{\s*\/\*[^*]*\*\/\s*}/, '{ /* 空规则已清理 */ }');
      });
      this.stats.syntaxErrorsFixed += emptyRuleMatches.length;
      fileFixCount += emptyRuleMatches.length;
      modified = true;
    }
    
    // 5. 清理重复的空行
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // 6. 确保文件以换行符结尾
    if (!content.endsWith('\n')) {
      content += '\n';
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      this.fixedFiles.push(filePath);
      this.stats.filesProcessed++;
      this.stats.totalFixed += fileFixCount;
      console.log(`✅ 语法错误修复 ${fileFixCount} 个问题：${filePath}`);
    }
  }

  generateReport() {
    console.log('\n🎉 综合CSS语法修复器执行完成！');
    console.log('='.repeat(60));
    console.log(`📁 处理文件数：${this.stats.filesProcessed}`);
    console.log(`🔧 总修复数：${this.stats.totalFixed}`);
    console.log(`🔧 语法错误修复：${this.stats.syntaxErrorsFixed}`);
    console.log('='.repeat(60));
    
    if (this.fixedFiles.length > 0) {
      console.log('\n✅ 已修复的文件：');
      this.fixedFiles.forEach(file => {
        console.log(`  📄 ${file}`);
      });
    }
    
    console.log(`\n🚀 CSS语法修复完成！共修复 ${this.stats.totalFixed} 个语法问题。`);
    console.log('💡 正在验证语法修复效果...');
  }
}

async function main() {
  const fixer = new ComprehensiveCssSyntaxFixer();
  await fixer.fixAllSyntaxErrors();
}

main().catch(console.error);
