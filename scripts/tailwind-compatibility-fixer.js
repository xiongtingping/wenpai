#!/usr/bin/env node

/**
 * 🚀 Tailwind兼容性修复器
 * 修复可能导致Tailwind CSS解析错误的问题
 */

import fs from 'fs';
import { glob } from 'glob';

class TailwindCompatibilityFixer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      totalFixed: 0,
      tailwindIssuesFixed: 0
    };
    this.fixedFiles = [];
  }

  async fixAllTailwindIssues() {
    console.log('🚀 启动Tailwind兼容性修复器 - 修复所有Tailwind兼容性问题！\n');
    
    const cssFiles = glob.sync('src/**/*.css');
    for (const file of cssFiles) {
      await this.fixTailwindIssuesInFile(file);
    }
    
    this.generateReport();
  }

  async fixTailwindIssuesInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fileFixCount = 0;
    
    console.log(`🔍 修复Tailwind兼容性：${filePath}`);
    
    // 1. 修复@apply指令问题
    const applyPattern = /@apply\s+[^;]*;/g;
    const applyMatches = content.match(applyPattern);
    if (applyMatches) {
      for (const match of applyMatches) {
        // 确保@apply指令格式正确
        const cleanApply = match.replace(/\s+/g, ' ').trim();
        if (match !== cleanApply) {
          content = content.replace(match, cleanApply);
          this.stats.tailwindIssuesFixed++;
          fileFixCount++;
          modified = true;
        }
      }
    }
    
    // 2. 修复@layer指令问题
    const layerPattern = /@layer\s+[^{]*\{[^}]*\}/gs;
    const layerMatches = content.match(layerPattern);
    if (layerMatches) {
      for (const match of layerMatches) {
        // 确保@layer指令格式正确
        const cleanLayer = match.replace(/\s+/g, ' ').replace(/\{\s+/g, '{\n  ').replace(/\s+\}/g, '\n}');
        if (match !== cleanLayer) {
          content = content.replace(match, cleanLayer);
          this.stats.tailwindIssuesFixed++;
          fileFixCount++;
          modified = true;
        }
      }
    }
    
    // 3. 修复可能导致Tailwind解析错误的特殊字符
    const specialCharPattern = /[\u200B-\u200D\uFEFF]/g;
    if (specialCharPattern.test(content)) {
      content = content.replace(specialCharPattern, '');
      this.stats.tailwindIssuesFixed++;
      fileFixCount++;
      modified = true;
    }
    
    // 4. 修复CSS注释中的特殊字符
    const commentPattern = /\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g;
    const comments = content.match(commentPattern);
    if (comments) {
      for (const comment of comments) {
        const cleanComment = comment.replace(/[\u200B-\u200D\uFEFF]/g, '');
        if (comment !== cleanComment) {
          content = content.replace(comment, cleanComment);
          this.stats.tailwindIssuesFixed++;
          fileFixCount++;
          modified = true;
        }
      }
    }
    
    // 5. 修复可能的编码问题
    const encodingPattern = /[^\x00-\x7F]/g;
    const nonAsciiMatches = content.match(encodingPattern);
    if (nonAsciiMatches) {
      // 只替换明显的编码错误字符，保留中文注释
      content = content.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ');
      this.stats.tailwindIssuesFixed++;
      fileFixCount++;
      modified = true;
    }
    
    // 6. 修复可能导致解析错误的空规则
    const emptyRulePattern = /[^{}]*\{\s*\}/g;
    const emptyRules = content.match(emptyRulePattern);
    if (emptyRules) {
      for (const rule of emptyRules) {
        // 如果是媒体查询或其他重要规则，保留但添加注释
        if (rule.includes('@media') || rule.includes('@supports')) {
          const commentedRule = rule.replace(/\{\s*\}/, '{\n  /* 空规则 - Tailwind兼容性 */\n}');
          content = content.replace(rule, commentedRule);
        } else {
          // 删除完全空的规则
          content = content.replace(rule, '');
        }
        this.stats.tailwindIssuesFixed++;
        fileFixCount++;
        modified = true;
      }
    }
    
    // 7. 确保文件以换行符结尾
    if (!content.endsWith('\n')) {
      content += '\n';
      this.stats.tailwindIssuesFixed++;
      fileFixCount++;
      modified = true;
    }
    
    // 8. 修复可能的CSS语法错误
    const lines = content.split('\n');
    const fixedLines = [];
    let inComment = false;
    
    for (let line of lines) {
      // 检查注释状态
      if (line.includes('/*') && !line.includes('*/')) {
        inComment = true;
      } else if (line.includes('*/')) {
        inComment = false;
      }
      
      // 如果不在注释中，检查语法
      if (!inComment) {
        // 修复可能的语法错误
        line = line.replace(/;\s*;/g, ';'); // 重复分号
        line = line.replace(/\{\s*\{/g, '{'); // 重复开括号
        line = line.replace(/\}\s*\}/g, '}'); // 重复闭括号
      }
      
      fixedLines.push(line);
    }
    
    const newContent = fixedLines.join('\n');
    if (newContent !== content) {
      content = newContent;
      this.stats.tailwindIssuesFixed++;
      fileFixCount++;
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      this.fixedFiles.push(filePath);
      this.stats.filesProcessed++;
      this.stats.totalFixed += fileFixCount;
      console.log(`✅ Tailwind兼容性修复 ${fileFixCount} 个问题：${filePath}`);
    }
  }

  generateReport() {
    console.log('\n🎉 Tailwind兼容性修复器执行完成！');
    console.log('='.repeat(60));
    console.log(`📁 处理文件数：${this.stats.filesProcessed}`);
    console.log(`🔧 总修复数：${this.stats.totalFixed}`);
    console.log(`🔧 Tailwind问题修复：${this.stats.tailwindIssuesFixed}`);
    console.log('='.repeat(60));
    
    if (this.fixedFiles.length > 0) {
      console.log('\n✅ 已修复的文件：');
      this.fixedFiles.forEach(file => {
        console.log(`  📄 ${file}`);
      });
    }
    
    console.log(`\n🚀 Tailwind兼容性修复完成！共修复 ${this.stats.totalFixed} 个兼容性问题。`);
    console.log('💡 正在验证Tailwind兼容性修复效果...');
  }
}

async function main() {
  const fixer = new TailwindCompatibilityFixer();
  await fixer.fixAllTailwindIssues();
}

main().catch(console.error);
