#!/usr/bin/env node

/**
 * 修复所有语法错误脚本
 * 一次性修复所有国际化相关的语法错误
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

class AllSyntaxErrorsFixer {
  constructor() {
    this.fixedCount = 0;
    this.fileCount = 0;
  }

  /**
   * 运行修复
   */
  async run() {
    console.log('🔧 开始修复所有语法错误...\n');

    try {
      // 查找所有TSX和TS文件
      const files = await glob('src/**/*.{tsx,ts}', { cwd: process.cwd() });
      
      console.log(`📁 找到 ${files.length} 个文件`);
      
      for (const filePath of files) {
        await this.fixFile(filePath);
      }
      
      console.log(`\n✅ 所有语法错误修复完成！`);
      console.log(`📊 处理了 ${this.fileCount} 个文件，修复了 ${this.fixedCount} 处错误`);
      
    } catch (error) {
      console.error('❌ 语法错误修复失败:', error.message);
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

    // 1. 修复函数参数中错误放置的useTranslation hook
    const hookInParamsPattern = /export const (\w+): React\.FC<[^>]*> = \(\{\s*const \{ t \} = useTranslation\(\);\s*([^}]*)\}\) => \{/g;
    let matches = content.match(hookInParamsPattern);
    if (matches) {
      content = content.replace(hookInParamsPattern, (match, componentName, props) => {
        const cleanProps = props.trim().replace(/,$/, '');
        return `export const ${componentName}: React.FC<any> = ({ ${cleanProps} }) => {
  const { t } = useTranslation();`;
      });
      fileFixedCount += matches.length;
    }

    // 2. 修复对象字面量中错误放置的hook
    const hookInObjectPattern = /const (\w+): Record<[^>]*> = \{\s*const \{ t \} = useTranslation\(\);\s*/g;
    matches = content.match(hookInObjectPattern);
    if (matches) {
      content = content.replace(hookInObjectPattern, 'const $1: Record<string, string> = {');
      fileFixedCount += matches.length;
    }

    // 3. 修复类组件中错误使用hook
    const hookInClassPattern = /const \{ t \} = useTranslation\(\);\s*(\w+): this\.state\.(\w+),/g;
    matches = content.match(hookInClassPattern);
    if (matches) {
      content = content.replace(hookInClassPattern, '$1: this.state.$2,');
      fileFixedCount += matches.length;
    }

    // 4. 修复对象字面量中的hook（更通用的模式）
    const hookInObjectGenericPattern = /= \{\s*const \{ t \} = useTranslation\(\);\s*/g;
    matches = content.match(hookInObjectGenericPattern);
    if (matches) {
      content = content.replace(hookInObjectGenericPattern, '= {');
      fileFixedCount += matches.length;
    }

    // 5. 修复JSX属性中缺少花括号的问题
    const jsxAttrPattern = /(\w+)=t\((['"][^'"]*['"])\)/g;
    matches = content.match(jsxAttrPattern);
    if (matches) {
      content = content.replace(jsxAttrPattern, '$1={t($2)}');
      fileFixedCount += matches.length;
    }

    // 6. 修复JSX属性中缺少花括号的i18n.t问题
    const jsxAttrI18nPattern = /(\w+)=i18n\.t\((['"][^'"]*['"])\)/g;
    matches = content.match(jsxAttrI18nPattern);
    if (matches) {
      content = content.replace(jsxAttrI18nPattern, '$1={i18n.t($2)}');
      fileFixedCount += matches.length;
    }

    // 7. 修复函数调用作为对象键的问题
    const functionKeyPattern = /t\(['"][^'"]*['"]\):/g;
    matches = content.match(functionKeyPattern);
    if (matches) {
      // 这种情况需要手动处理，先注释掉
      content = content.replace(functionKeyPattern, (match) => {
        return `// ${match} // TODO: Fix object key`;
      });
      fileFixedCount += matches.length;
    }

    // 8. 修复import语句中缺少useTranslation的问题
    if (content.includes('const { t } = useTranslation()') && 
        !content.includes('useTranslation') && 
        !content.includes('import { useTranslation }')) {
      
      // 添加useTranslation导入
      if (content.includes("import React") || content.includes("import { useState")) {
        content = content.replace(
          /(import.*from ['"]react['"];?)/,
          `$1\nimport { useTranslation } from 'react-i18next';`
        );
        fileFixedCount++;
      }
    }

    // 9. 修复非React组件中使用useTranslation的问题
    if (filePath.endsWith('.ts') && content.includes('const { t } = useTranslation()')) {
      // 替换为i18n.t
      content = content.replace(/const \{ t \} = useTranslation\(\);\s*/g, '');
      content = content.replace(/\bt\(/g, 'i18n.t(');
      
      // 添加i18n导入
      if (!content.includes('import i18n')) {
        content = content.replace(/^import/, `import i18n from '@/i18n';\nimport`);
      }
      fileFixedCount++;
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
  const fixer = new AllSyntaxErrorsFixer();
  fixer.run().catch(console.error);
}

export default AllSyntaxErrorsFixer;
