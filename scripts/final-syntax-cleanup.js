#!/usr/bin/env node

/**
 * 最终语法清理脚本
 * 修复所有剩余的语法错误
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

class FinalSyntaxCleanup {
  constructor() {
    this.fixedCount = 0;
    this.fileCount = 0;
  }

  /**
   * 运行修复
   */
  async run() {
    console.log('🧹 开始最终语法清理...\n');

    try {
      // 查找所有TSX和TS文件
      const files = await glob('src/**/*.{tsx,ts}', { cwd: process.cwd() });
      
      console.log(`📁 找到 ${files.length} 个文件`);
      
      for (const filePath of files) {
        await this.fixFile(filePath);
      }
      
      console.log(`\n✅ 最终语法清理完成！`);
      console.log(`📊 处理了 ${this.fileCount} 个文件，修复了 ${this.fixedCount} 处错误`);
      
    } catch (error) {
      console.error('❌ 最终语法清理失败:', error.message);
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

    // 1. 修复函数参数中的hook（最常见的错误）
    // 模式: function({ const { t } = useTranslation(); param }) {
    const hookInParamsPattern1 = /(\w+)\(\{\s*const \{ t \} = useTranslation\(\);\s*([^}]*)\}\)/g;
    let matches = content.match(hookInParamsPattern1);
    if (matches) {
      content = content.replace(hookInParamsPattern1, (match, funcName, params) => {
        const cleanParams = params.trim().replace(/,$/, '');
        return `${funcName}({ ${cleanParams} })`;
      });
      
      // 在函数体开始处添加hook
      content = content.replace(/\}\) \{(\s*)/g, '}) {\n  const { t } = useTranslation();$1');
      fileFixedCount += matches.length;
    }

    // 2. 修复export function中的hook
    // 模式: export default function Component({ const { t } = useTranslation(); className }) {
    const hookInExportPattern = /export default function (\w+)\(\{\s*const \{ t \} = useTranslation\(\);\s*([^}]*)\}\)/g;
    matches = content.match(hookInExportPattern);
    if (matches) {
      content = content.replace(hookInExportPattern, (match, funcName, params) => {
        const cleanParams = params.trim().replace(/,$/, '');
        return `export default function ${funcName}({ ${cleanParams} })`;
      });
      
      // 在函数体开始处添加hook
      content = content.replace(/\}\) \{(\s*)/g, '}) {\n  const { t } = useTranslation();$1');
      fileFixedCount += matches.length;
    }

    // 3. 修复模板字符串中的hook
    // 模式: `tier:${const { t } = useTranslation();requiredTier}`
    const hookInTemplatePattern = /`([^`]*)\$\{\s*const \{ t \} = useTranslation\(\);\s*([^}]*)\}`/g;
    matches = content.match(hookInTemplatePattern);
    if (matches) {
      content = content.replace(hookInTemplatePattern, '`$1${$2}`');
      fileFixedCount += matches.length;
    }

    // 4. 修复对象字面量中的hook
    // 模式: { const { t } = useTranslation(); key: value }
    const hookInObjectPattern = /\{\s*const \{ t \} = useTranslation\(\);\s*([^}]*)\}/g;
    matches = content.match(hookInObjectPattern);
    if (matches) {
      content = content.replace(hookInObjectPattern, '{ $1 }');
      fileFixedCount += matches.length;
    }

    // 5. 修复数组中的hook
    // 模式: [const { t } = useTranslation(); item1, item2]
    const hookInArrayPattern = /\[\s*const \{ t \} = useTranslation\(\);\s*([^\]]*)\]/g;
    matches = content.match(hookInArrayPattern);
    if (matches) {
      content = content.replace(hookInArrayPattern, '[$1]');
      fileFixedCount += matches.length;
    }

    // 6. 修复条件表达式中的hook
    // 模式: condition ? const { t } = useTranslation(); value : other
    const hookInTernaryPattern = /\?\s*const \{ t \} = useTranslation\(\);\s*([^:]*)/g;
    matches = content.match(hookInTernaryPattern);
    if (matches) {
      content = content.replace(hookInTernaryPattern, '? $1');
      fileFixedCount += matches.length;
    }

    // 7. 修复函数调用中的hook
    // 模式: func(const { t } = useTranslation(); param)
    const hookInCallPattern = /(\w+)\(\s*const \{ t \} = useTranslation\(\);\s*([^)]*)\)/g;
    matches = content.match(hookInCallPattern);
    if (matches) {
      content = content.replace(hookInCallPattern, '$1($2)');
      fileFixedCount += matches.length;
    }

    // 8. 修复赋值表达式中的hook
    // 模式: variable = const { t } = useTranslation(); value
    const hookInAssignPattern = /=\s*const \{ t \} = useTranslation\(\);\s*([^;]*)/g;
    matches = content.match(hookInAssignPattern);
    if (matches) {
      content = content.replace(hookInAssignPattern, '= $1');
      fileFixedCount += matches.length;
    }

    // 9. 修复return语句中的hook
    // 模式: return const { t } = useTranslation(); value
    const hookInReturnPattern = /return\s*const \{ t \} = useTranslation\(\);\s*([^;]*)/g;
    matches = content.match(hookInReturnPattern);
    if (matches) {
      content = content.replace(hookInReturnPattern, 'return $1');
      fileFixedCount += matches.length;
    }

    // 10. 确保每个文件只有一个useTranslation声明
    const hookDeclarations = content.match(/const \{ t \} = useTranslation\(\);/g);
    if (hookDeclarations && hookDeclarations.length > 1) {
      // 保留第一个，删除其他的
      let firstFound = false;
      content = content.replace(/const \{ t \} = useTranslation\(\);/g, (match) => {
        if (!firstFound) {
          firstFound = true;
          return match;
        }
        return '';
      });
      fileFixedCount += hookDeclarations.length - 1;
    }

    // 11. 确保useTranslation导入存在
    if (content.includes('const { t } = useTranslation()') && 
        !content.includes('import { useTranslation }')) {
      
      // 添加导入
      if (content.includes('import React') || content.includes('import {')) {
        content = content.replace(
          /(import.*from ['"]react['"];?)/,
          `$1\nimport { useTranslation } from 'react-i18next';`
        );
        fileFixedCount++;
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
  const fixer = new FinalSyntaxCleanup();
  fixer.run().catch(console.error);
}

export default FinalSyntaxCleanup;
