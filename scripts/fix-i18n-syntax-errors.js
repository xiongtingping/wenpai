#!/usr/bin/env node

/**
 * 修复国际化语法错误脚本
 * 修复 {t('key')} 为 t('key') 的语法错误
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

class I18nSyntaxErrorsFixer {
  constructor() {
    this.fixedCount = 0;
    this.fileCount = 0;
  }

  /**
   * 运行修复
   */
  async run() {
    console.log('🔧 开始修复国际化语法错误...\n');

    try {
      // 查找所有TSX和TS文件
      const files = await glob('src/**/*.{tsx,ts}', { cwd: process.cwd() });
      
      console.log(`📁 找到 ${files.length} 个文件`);
      
      for (const filePath of files) {
        await this.fixFile(filePath);
      }
      
      console.log(`\n✅ 国际化语法错误修复完成！`);
      console.log(`📊 处理了 ${this.fileCount} 个文件，修复了 ${this.fixedCount} 处错误`);
      
    } catch (error) {
      console.error('❌ 国际化语法错误修复失败:', error.message);
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

    // 1. 修复 {t('key')} 为 t('key') 在JSX表达式中
    const jsxExpressionPattern = /\{\{t\((['"][^'"]*['"])\)\}\}/g;
    let matches = content.match(jsxExpressionPattern);
    if (matches) {
      content = content.replace(jsxExpressionPattern, '{t($1)}');
      fileFixedCount += matches.length;
    }

    // 2. 修复 console.log({t('key')}) 为 console.log(t('key'))
    const consoleLogPattern = /console\.log\(\{t\((['"][^'"]*['"])\)\}/g;
    matches = content.match(consoleLogPattern);
    if (matches) {
      content = content.replace(consoleLogPattern, 'console.log(t($1)');
      fileFixedCount += matches.length;
    }

    // 3. 修复函数调用中的 {t('key')} 为 t('key')
    const functionCallPattern = /(\w+)\(\{t\((['"][^'"]*['"])\)\}/g;
    matches = content.match(functionCallPattern);
    if (matches) {
      content = content.replace(functionCallPattern, '$1(t($2)');
      fileFixedCount += matches.length;
    }

    // 4. 修复对象字面量中的 {t('key')} 为 t('key')
    const objectLiteralPattern = /:\s*\{t\((['"][^'"]*['"])\)\}/g;
    matches = content.match(objectLiteralPattern);
    if (matches) {
      content = content.replace(objectLiteralPattern, ': t($1)');
      fileFixedCount += matches.length;
    }

    // 5. 修复数组中的 {t('key')} 为 t('key')
    const arrayPattern = /\[\{t\((['"][^'"]*['"])\)\}/g;
    matches = content.match(arrayPattern);
    if (matches) {
      content = content.replace(arrayPattern, '[t($1)');
      fileFixedCount += matches.length;
    }

    // 6. 修复赋值中的 {t('key')} 为 t('key')
    const assignmentPattern = /=\s*\{t\((['"][^'"]*['"])\)\}/g;
    matches = content.match(assignmentPattern);
    if (matches) {
      content = content.replace(assignmentPattern, '= t($1)');
      fileFixedCount += matches.length;
    }

    // 7. 修复条件表达式中的 {t('key')} 为 t('key')
    const ternaryPattern = /\?\s*\{t\((['"][^'"]*['"])\)\}/g;
    matches = content.match(ternaryPattern);
    if (matches) {
      content = content.replace(ternaryPattern, '? t($1)');
      fileFixedCount += matches.length;
    }

    // 8. 修复逻辑运算符中的 {t('key')} 为 t('key')
    const logicalPattern = /(&&|\|\|)\s*\{t\((['"][^'"]*['"])\)\}/g;
    matches = content.match(logicalPattern);
    if (matches) {
      content = content.replace(logicalPattern, '$1 t($2)');
      fileFixedCount += matches.length;
    }

    // 9. 修复return语句中的 {t('key')} 为 t('key')
    const returnPattern = /return\s*\{t\((['"][^'"]*['"])\)\}/g;
    matches = content.match(returnPattern);
    if (matches) {
      content = content.replace(returnPattern, 'return t($1)');
      fileFixedCount += matches.length;
    }

    // 10. 修复括号中的 {t('key')} 为 t('key')
    const parenthesesPattern = /\(\{t\((['"][^'"]*['"])\)\}/g;
    matches = content.match(parenthesesPattern);
    if (matches) {
      content = content.replace(parenthesesPattern, '(t($1)');
      fileFixedCount += matches.length;
    }

    // 11. 修复模板字符串中的 {t('key')} 为 t('key')
    const templateStringPattern = /\$\{\{t\((['"][^'"]*['"])\)\}\}/g;
    matches = content.match(templateStringPattern);
    if (matches) {
      content = content.replace(templateStringPattern, '${t($1)}');
      fileFixedCount += matches.length;
    }

    // 12. 修复逗号后的 {t('key')} 为 t('key')
    const commaPattern = /,\s*\{t\((['"][^'"]*['"])\)\}/g;
    matches = content.match(commaPattern);
    if (matches) {
      content = content.replace(commaPattern, ', t($1)');
      fileFixedCount += matches.length;
    }

    // 13. 修复JSX属性中的 prop= t('key') 为 prop={t('key')}
    const jsxPropPattern = /(\w+)=\s*t\((['"][^'"]*['"])\)/g;
    matches = content.match(jsxPropPattern);
    if (matches) {
      content = content.replace(jsxPropPattern, '$1={t($2)}');
      fileFixedCount += matches.length;
    }

    // 14. 修复JSX属性中的 prop= i18n.t('key') 为 prop={i18n.t('key')}
    const jsxPropI18nPattern = /(\w+)=\s*i18n\.t\((['"][^'"]*['"])\)/g;
    matches = content.match(jsxPropI18nPattern);
    if (matches) {
      content = content.replace(jsxPropI18nPattern, '$1={i18n.t($2)}');
      fileFixedCount += matches.length;
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
  const fixer = new I18nSyntaxErrorsFixer();
  fixer.run().catch(console.error);
}

export default I18nSyntaxErrorsFixer;
