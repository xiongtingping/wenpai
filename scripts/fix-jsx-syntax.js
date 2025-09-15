#!/usr/bin/env node

/**
 * 修复JSX语法错误脚本
 * 修复 prop=t('key') 为 prop={t('key')} 的语法错误
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

class JSXSyntaxFixer {
  constructor() {
    this.fixedCount = 0;
    this.fileCount = 0;
  }

  /**
   * 运行修复
   */
  async run() {
    console.log('🔧 开始修复JSX语法错误...\n');

    try {
      // 查找所有TSX文件
      const tsxFiles = await glob('src/**/*.tsx', { cwd: process.cwd() });
      
      console.log(`📁 找到 ${tsxFiles.length} 个TSX文件`);
      
      for (const filePath of tsxFiles) {
        await this.fixFile(filePath);
      }
      
      console.log(`\n✅ JSX语法修复完成！`);
      console.log(`📊 处理了 ${this.fileCount} 个文件，修复了 ${this.fixedCount} 处语法错误`);
      
    } catch (error) {
      console.error('❌ JSX语法修复失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 修复单个文件
   */
  async fixFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fileFixedCount = 0;

    // 修复 prop=t('key') 为 prop={t('key')}
    const patterns = [
      // 匹配 prop=t('key') 或 prop=t("key")
      {
        regex: /(\w+)=t\((['"][^'"]*['"])\)/g,
        replacement: '$1={t($2)}'
      },
      // 匹配 prop=i18n.t('key') 或 prop=i18n.t("key")
      {
        regex: /(\w+)=i18n\.t\((['"][^'"]*['"])\)/g,
        replacement: '$1={i18n.t($2)}'
      },
      // 修复其他常见的JSX属性语法错误
      {
        regex: /(\w+)=\{t\((['"][^'"]*['"])\)\}/g,
        replacement: '$1={t($2)}' // 已经正确的语法，保持不变
      }
    ];

    for (const pattern of patterns) {
      const matches = content.match(pattern.regex);
      if (matches) {
        content = content.replace(pattern.regex, pattern.replacement);
        fileFixedCount += matches.length;
      }
    }

    // 如果有修改，保存文件
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      this.fileCount++;
      this.fixedCount += fileFixedCount;
      console.log(`✅ ${filePath} 修复了 ${fileFixedCount} 处语法错误`);
    }
  }
}

// 运行修复
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new JSXSyntaxFixer();
  fixer.run().catch(console.error);
}

export default JSXSyntaxFixer;
