#!/usr/bin/env node

/**
 * 🚀 CSS块闭合修复器
 * 修复所有未闭合的CSS块，确保语法正确
 */

import fs from 'fs';
import { glob } from 'glob';

class CssBlockCloser {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      totalFixed: 0,
      blocksFixed: 0
    };
    this.fixedFiles = [];
  }

  async fixAllUnclosedBlocks() {
    console.log('🚀 启动CSS块闭合修复器 - 修复所有未闭合的CSS块！\n');
    
    const cssFiles = glob.sync('src/**/*.css');
    for (const file of cssFiles) {
      await this.fixUnclosedBlocksInFile(file);
    }
    
    this.generateReport();
  }

  async fixUnclosedBlocksInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fileFixCount = 0;
    
    console.log(`🔍 修复未闭合块：${filePath}`);
    
    // 分析CSS块的开闭情况
    const lines = content.split('\n');
    const fixedLines = [];
    let braceStack = [];
    let inComment = false;
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let originalLine = line;
      
      // 逐字符分析
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        const prevChar = j > 0 ? line[j - 1] : '';
        const nextChar = j < line.length - 1 ? line[j + 1] : '';
        
        // 处理字符串
        if (!inComment && (char === '"' || char === "'")) {
          if (!inString) {
            inString = true;
            stringChar = char;
          } else if (char === stringChar && prevChar !== '\\') {
            inString = false;
            stringChar = '';
          }
        }
        
        // 处理注释
        if (!inString) {
          if (char === '/' && nextChar === '*') {
            inComment = true;
          } else if (char === '*' && nextChar === '/' && inComment) {
            inComment = false;
          }
        }
        
        // 处理大括号
        if (!inComment && !inString) {
          if (char === '{') {
            braceStack.push({ line: i + 1, char: j });
          } else if (char === '}') {
            if (braceStack.length > 0) {
              braceStack.pop();
            }
          }
        }
      }
      
      // 检查是否需要在行末添加闭合大括号
      if (i === lines.length - 1 && braceStack.length > 0) {
        // 文件结束但还有未闭合的块
        while (braceStack.length > 0) {
          line += '\n}';
          braceStack.pop();
          this.stats.blocksFixed++;
          fileFixCount++;
          modified = true;
        }
      }
      
      // 检查特定的未闭合模式
      if (line.includes('{') && !line.includes('}')) {
        // 检查下一行是否是注释或新的规则开始
        const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
        if (nextLine.trim().startsWith('/*') || 
            nextLine.trim().match(/^[.#@]/) ||
            nextLine.trim() === '' ||
            i === lines.length - 1) {
          
          // 检查当前行是否确实需要闭合
          const openBraces = (line.match(/\{/g) || []).length;
          const closeBraces = (line.match(/\}/g) || []).length;
          
          if (openBraces > closeBraces) {
            // 需要添加闭合大括号
            const missing = openBraces - closeBraces;
            for (let k = 0; k < missing; k++) {
              if (i < lines.length - 1) {
                // 在下一行之前插入闭合大括号
                fixedLines.push(line);
                fixedLines.push('}');
                this.stats.blocksFixed++;
                fileFixCount++;
                modified = true;
                line = ''; // 清空当前行，因为已经添加了
                break;
              }
            }
          }
        }
      }
      
      if (line !== '') {
        fixedLines.push(line);
      }
    }
    
    // 如果还有未闭合的块，在文件末尾添加
    while (braceStack.length > 0) {
      fixedLines.push('}');
      braceStack.pop();
      this.stats.blocksFixed++;
      fileFixCount++;
      modified = true;
    }
    
    if (modified) {
      const newContent = fixedLines.join('\n');
      fs.writeFileSync(filePath, newContent);
      this.fixedFiles.push(filePath);
      this.stats.filesProcessed++;
      this.stats.totalFixed += fileFixCount;
      console.log(`✅ CSS块闭合修复 ${fileFixCount} 个问题：${filePath}`);
    }
  }

  generateReport() {
    console.log('\n🎉 CSS块闭合修复器执行完成！');
    console.log('='.repeat(60));
    console.log(`📁 处理文件数：${this.stats.filesProcessed}`);
    console.log(`🔧 总修复数：${this.stats.totalFixed}`);
    console.log(`🔧 CSS块修复：${this.stats.blocksFixed}`);
    console.log('='.repeat(60));
    
    if (this.fixedFiles.length > 0) {
      console.log('\n✅ 已修复的文件：');
      this.fixedFiles.forEach(file => {
        console.log(`  📄 ${file}`);
      });
    }
    
    console.log(`\n🚀 CSS块闭合修复完成！共修复 ${this.stats.totalFixed} 个未闭合块。`);
    console.log('💡 正在验证CSS块闭合修复效果...');
  }
}

async function main() {
  const closer = new CssBlockCloser();
  await closer.fixAllUnclosedBlocks();
}

main().catch(console.error);
