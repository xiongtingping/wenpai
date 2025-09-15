#!/usr/bin/env node

/**
 * 修复剩余语法错误的脚本
 * 专门处理国际化过程中产生的语法错误
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

class FixRemainingSyntaxErrors {
  constructor() {
    this.fixedCount = 0;
    this.fileCount = 0;
  }

  /**
   * 运行语法修复
   */
  async run() {
    console.log('🔧 开始修复剩余语法错误...\n');

    try {
      // 获取所有需要检查的文件
      const files = await this.getFilesToCheck();
      
      console.log(`📁 找到 ${files.length} 个文件需要检查`);
      
      // 修复每个文件
      for (const file of files) {
        await this.fixFile(file);
      }
      
      console.log(`\n🎉 语法修复完成！`);
      console.log(`📊 修复了 ${this.fileCount} 个文件，共 ${this.fixedCount} 处错误`);
      
    } catch (error) {
      console.error('❌ 语法修复失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 获取需要检查的文件
   */
  async getFilesToCheck() {
    const patterns = [
      'src/**/*.tsx',
      'src/**/*.ts',
      'src/**/*.jsx',
      'src/**/*.js'
    ];
    
    const files = [];
    for (const pattern of patterns) {
      const matches = await glob(pattern, { ignore: ['node_modules/**', 'dist/**'] });
      files.push(...matches);
    }
    
    return [...new Set(files)]; // 去重
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

    // 修复各种语法错误
    const fixes = [
      // 1. 修复 console.error({t('key')}, ...) -> console.error(t('key'), ...)
      {
        pattern: /console\.(log|error|warn|info)\(\{t\(([^)]+)\)\}/g,
        replacement: "console.$1(t($2)",
        description: "console语句中的对象包装"
      },
      
      // 2. 修复 setError({t('key')}) -> setError(t('key'))
      {
        pattern: /set\w+\(\{t\(([^)]+)\)\}\)/g,
        replacement: "set$&(t($1))",
        description: "setState中的对象包装"
      },
      
      // 3. 修复 prop={t('key')} 中缺少花括号的情况
      {
        pattern: /(\w+)=t\(([^)]+)\)/g,
        replacement: "$1={t($2)}",
        description: "JSX属性中缺少花括号"
      },
      
      // 4. 修复数组中的函数调用 [{t('key')}, ...] -> ['text', ...]
      {
        pattern: /\[\{t\(([^)]+)\)\}/g,
        replacement: "[t($1)",
        description: "数组中的对象包装"
      },
      
      // 5. 修复对象键中的函数调用 {t('key'): value} -> {'key': value}
      {
        pattern: /\{t\((['"][^'"]*['"])\):/g,
        replacement: "{$1:",
        description: "对象键中的函数调用"
      },
      
      // 6. 修复字符串模板中的函数调用
      {
        pattern: /`([^`]*)\{t\(([^)]+)\)\}([^`]*)`/g,
        replacement: "`$1${t($2)}$3`",
        description: "模板字符串中的函数调用"
      },
      
      // 7. 修复类型定义中的函数调用
      {
        pattern: /:\s*'[^']*\{t\([^)]+\)\}[^']*'/g,
        replacement: (match) => match.replace(/\{t\([^)]+\)\}/g, ''),
        description: "类型定义中的函数调用"
      },
      
      // 8. 修复接口定义中的错误
      {
        pattern: /interface\s+\w+\s*\{[^}]*\{t\([^)]+\)\}[^}]*\}/g,
        replacement: (match) => match.replace(/\{t\([^)]+\)\}/g, ''),
        description: "接口定义中的函数调用"
      },
      
      // 9. 修复枚举类型中的函数调用
      {
        pattern: /'[^']*\{t\([^)]+\)\}[^']*'/g,
        replacement: (match) => match.replace(/\{t\([^)]+\)\}/g, ''),
        description: "枚举类型中的函数调用"
      },
      
      // 10. 修复 volatility 类型定义错误
      {
        pattern: /volatility:\s*'high'\s*\|\s*'medium'\s*\|\s*'low[^']*'/g,
        replacement: "volatility: 'high' | 'medium' | 'low'",
        description: "volatility类型定义"
      }
    ];

    // 应用所有修复
    for (const fix of fixes) {
      const beforeCount = (content.match(fix.pattern) || []).length;
      if (beforeCount > 0) {
        if (typeof fix.replacement === 'function') {
          content = content.replace(fix.pattern, fix.replacement);
        } else {
          content = content.replace(fix.pattern, fix.replacement);
        }
        const afterCount = (content.match(fix.pattern) || []).length;
        const fixedInThisStep = beforeCount - afterCount;
        if (fixedInThisStep > 0) {
          fileFixedCount += fixedInThisStep;
          console.log(`  ✅ ${fix.description}: ${fixedInThisStep} 处`);
        }
      }
    }

    // 特殊修复：处理复杂的语法错误
    content = this.fixComplexSyntaxErrors(content);

    // 保存文件
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      this.fileCount++;
      this.fixedCount += fileFixedCount;
      console.log(`🔧 ${filePath} 修复了 ${fileFixedCount} 处语法错误`);
    }
  }

  /**
   * 修复复杂的语法错误
   */
  fixComplexSyntaxErrors(content) {
    // 修复接口定义中的混乱代码
    content = content.replace(
      /interface\s+(\w+)\s*\{[^}]*const\s+\[[^\]]+\]\s*=\s*useState[^}]*\}/g,
      'interface $1 {\n  // Interface definition\n}'
    );

    // 修复类型定义中的函数调用
    content = content.replace(
      /'[^']*\{t\([^)]+\)\}[^']*'/g,
      (match) => {
        // 提取引号内的纯文本部分
        const cleanText = match.replace(/\{t\([^)]+\)\}/g, '').replace(/'/g, '');
        return `'${cleanText}'`;
      }
    );

    // 修复联合类型中的错误
    content = content.replace(
      /'\w+'\s*\|\s*'[^']*\{t\([^)]+\)\}[^']*'/g,
      (match) => {
        const parts = match.split('|').map(part => {
          const cleaned = part.trim().replace(/\{t\([^)]+\)\}/g, '');
          return cleaned || "'unknown'";
        });
        return parts.join(' | ');
      }
    );

    // 修复函数参数中的错误
    content = content.replace(
      /\(\s*\{t\([^)]+\)\}[^)]*\)/g,
      '()'
    );

    return content;
  }
}

// 运行语法修复
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new FixRemainingSyntaxErrors();
  fixer.run().catch(console.error);
}

export default FixRemainingSyntaxErrors;
