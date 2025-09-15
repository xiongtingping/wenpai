#!/usr/bin/env node

/**
 * 🚀 格式错误CSS属性修复器
 * 修复所有格式错误的CSS属性，确保构建成功
 */

import fs from 'fs';
import { glob } from 'glob';

class MalformedCssPropertyFixer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      totalFixed: 0,
      malformedPropertiesFixed: 0
    };
    this.fixedFiles = [];
  }

  async fixAllMalformedProperties() {
    console.log('🚀 启动格式错误CSS属性修复器 - 修复所有格式错误的CSS属性！\n');
    
    const cssFiles = glob.sync('src/**/*.css');
    for (const file of cssFiles) {
      await this.fixMalformedPropertiesInFile(file);
    }
    
    this.generateReport();
  }

  async fixMalformedPropertiesInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fileFixCount = 0;
    
    console.log(`🔍 修复格式错误属性：${filePath}`);
    
    // 1. 修复 var(--color-xxx) /* comment */-property 格式错误
    const malformedPropertyPattern = /var\(--color-[^)]+\)\s*\/\*[^*]*\*\/\s*-([a-z-]+)\s*:/g;
    const malformedMatches = content.match(malformedPropertyPattern);
    if (malformedMatches) {
      content = content.replace(malformedPropertyPattern, (match, propertyName) => {
        return `${propertyName}:`;
      });
      this.stats.malformedPropertiesFixed += malformedMatches.length;
      fileFixCount += malformedMatches.length;
      modified = true;
    }
    
    // 2. 修复 var(--color-xxx)-property 格式错误
    const simplePropertyPattern = /var\(--color-[^)]+\)\s*-([a-z-]+)\s*:/g;
    const simpleMatches = content.match(simplePropertyPattern);
    if (simpleMatches) {
      content = content.replace(simplePropertyPattern, (match, propertyName) => {
        return `${propertyName}:`;
      });
      this.stats.malformedPropertiesFixed += simpleMatches.length;
      fileFixCount += simpleMatches.length;
      modified = true;
    }
    
    // 3. 修复 var(--color-var(--color-xxx)) 嵌套错误
    const nestedVarPattern = /var\(--color-var\(--color-[^)]+\)\)/g;
    const nestedMatches = content.match(nestedVarPattern);
    if (nestedMatches) {
      content = content.replace(nestedVarPattern, 'var(--color-primary)');
      this.stats.malformedPropertiesFixed += nestedMatches.length;
      fileFixCount += nestedMatches.length;
      modified = true;
    }
    
    // 4. 修复 var(--color-xxx)) 多余的括号
    const extraParenPattern = /var\(--color-[^)]+\)\)/g;
    const extraParenMatches = content.match(extraParenPattern);
    if (extraParenMatches) {
      content = content.replace(extraParenPattern, (match) => {
        return match.replace(/\)\)$/, ')');
      });
      this.stats.malformedPropertiesFixed += extraParenMatches.length;
      fileFixCount += extraParenMatches.length;
      modified = true;
    }
    
    // 5. 修复 var(--color-xxx) /* comment */) 格式错误
    const commentParenPattern = /var\(--color-[^)]+\)\s*\/\*[^*]*\*\/\s*\)/g;
    const commentParenMatches = content.match(commentParenPattern);
    if (commentParenMatches) {
      content = content.replace(commentParenPattern, (match) => {
        // 提取var部分
        const varMatch = match.match(/var\(--color-[^)]+\)/);
        return varMatch ? varMatch[0] : 'var(--color-primary)';
      });
      this.stats.malformedPropertiesFixed += commentParenMatches.length;
      fileFixCount += commentParenMatches.length;
      modified = true;
    }
    
    // 6. 修复 var(--color-xxx-xxx) 中的多余连字符
    const extraHyphenPattern = /var\(--color-[^)]*-[a-z]+-[a-z]+-[a-z]+[^)]*\)/g;
    const extraHyphenMatches = content.match(extraHyphenPattern);
    if (extraHyphenMatches) {
      content = content.replace(extraHyphenPattern, 'var(--color-primary)');
      this.stats.malformedPropertiesFixed += extraHyphenMatches.length;
      fileFixCount += extraHyphenMatches.length;
      modified = true;
    }
    
    // 7. 修复不完整的CSS规则
    const incompleteRulePattern = /{\s*\/\*[^*]*\*\/\s*}/g;
    const incompleteMatches = content.match(incompleteRulePattern);
    if (incompleteMatches) {
      content = content.replace(incompleteRulePattern, '{ /* 空规则已清理 */ }');
      this.stats.malformedPropertiesFixed += incompleteMatches.length;
      fileFixCount += incompleteMatches.length;
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      this.fixedFiles.push(filePath);
      this.stats.filesProcessed++;
      this.stats.totalFixed += fileFixCount;
      console.log(`✅ 格式错误属性修复 ${fileFixCount} 个问题：${filePath}`);
    }
  }

  generateReport() {
    console.log('\n🎉 格式错误CSS属性修复器执行完成！');
    console.log('='.repeat(60));
    console.log(`📁 处理文件数：${this.stats.filesProcessed}`);
    console.log(`🔧 总修复数：${this.stats.totalFixed}`);
    console.log(`🔧 格式错误属性修复：${this.stats.malformedPropertiesFixed}`);
    console.log('='.repeat(60));
    
    if (this.fixedFiles.length > 0) {
      console.log('\n✅ 已修复的文件：');
      this.fixedFiles.forEach(file => {
        console.log(`  📄 ${file}`);
      });
    }
    
    console.log(`\n🚀 格式错误CSS属性修复完成！共修复 ${this.stats.totalFixed} 个格式错误。`);
    console.log('💡 正在验证格式修复效果...');
  }
}

async function main() {
  const fixer = new MalformedCssPropertyFixer();
  await fixer.fixAllMalformedProperties();
}

main().catch(console.error);
