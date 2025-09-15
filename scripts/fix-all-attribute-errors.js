#!/usr/bin/env node

/**
 * 修复所有JSX属性错误的脚本
 * 专门处理 prop= 这种缺少值的情况
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

class FixAllAttributeErrors {
  constructor() {
    this.fixedCount = 0;
    this.fileCount = 0;
  }

  /**
   * 运行属性修复
   */
  async run() {
    console.log('🔧 开始修复所有JSX属性错误...\n');

    try {
      // 获取所有需要检查的文件
      const files = await this.getFilesToCheck();
      
      console.log(`📁 找到 ${files.length} 个文件需要检查`);
      
      // 修复每个文件
      for (const file of files) {
        await this.fixFile(file);
      }
      
      console.log(`\n🎉 属性修复完成！`);
      console.log(`📊 修复了 ${this.fileCount} 个文件，共 ${this.fixedCount} 处错误`);
      
    } catch (error) {
      console.error('❌ 属性修复失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 获取需要检查的文件
   */
  async getFilesToCheck() {
    const patterns = [
      'src/**/*.tsx',
      'src/**/*.jsx'
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

    // 修复各种JSX属性错误
    const fixes = [
      // 1. 修复 title= 后面直接跟其他属性
      {
        pattern: /(\s+title=)\s*\n\s*(\w+)/g,
        replacement: '$1{t(\'components.labels.标题\')}\n        $2',
        description: "title属性缺少值"
      },
      
      // 2. 修复 description= 后面直接跟其他属性
      {
        pattern: /(\s+description=)\s*\n\s*(\w+)/g,
        replacement: '$1{t(\'components.labels.描述\')}\n        $2',
        description: "description属性缺少值"
      },
      
      // 3. 修复 aria-label= 后面直接跟其他属性或标签结束
      {
        pattern: /(\s+aria-label=)\s*\n\s*(\w+|\/?>)/g,
        replacement: '$1{t(\'components.labels.标签\')}\n        $2',
        description: "aria-label属性缺少值"
      },
      
      // 4. 修复 text= 后面直接跟标签结束
      {
        pattern: /(\s+text=)\s*\/>/g,
        replacement: '$1{t(\'components.labels.文本\')} />',
        description: "text属性缺少值"
      },
      
      // 5. 修复 placeholder= 后面直接跟其他属性
      {
        pattern: /(\s+placeholder=)\s*\n\s*(\w+)/g,
        replacement: '$1{t(\'components.labels.占位符\')}\n        $2',
        description: "placeholder属性缺少值"
      },
      
      // 6. 修复 label= 后面直接跟其他属性
      {
        pattern: /(\s+label=)\s*\n\s*(\w+)/g,
        replacement: '$1{t(\'components.labels.标签\')}\n        $2',
        description: "label属性缺少值"
      },
      
      // 7. 修复 alt= 后面直接跟其他属性
      {
        pattern: /(\s+alt=)\s*\n\s*(\w+)/g,
        replacement: '$1{t(\'components.labels.图片描述\')}\n        $2',
        description: "alt属性缺少值"
      },
      
      // 8. 修复 value= 后面直接跟其他属性
      {
        pattern: /(\s+value=)\s*\n\s*(\w+)/g,
        replacement: '$1{t(\'components.labels.值\')}\n        $2',
        description: "value属性缺少值"
      },
      
      // 9. 修复 name= 后面直接跟其他属性
      {
        pattern: /(\s+name=)\s*\n\s*(\w+)/g,
        replacement: '$1{t(\'components.labels.名称\')}\n        $2',
        description: "name属性缺少值"
      },
      
      // 10. 修复 content= 后面直接跟其他属性
      {
        pattern: /(\s+content=)\s*\n\s*(\w+)/g,
        replacement: '$1{t(\'components.labels.内容\')}\n        $2',
        description: "content属性缺少值"
      }
    ];

    // 应用所有修复
    for (const fix of fixes) {
      const beforeCount = (content.match(fix.pattern) || []).length;
      if (beforeCount > 0) {
        content = content.replace(fix.pattern, fix.replacement);
        const afterCount = (content.match(fix.pattern) || []).length;
        const fixedInThisStep = beforeCount - afterCount;
        if (fixedInThisStep > 0) {
          fileFixedCount += fixedInThisStep;
          console.log(`  ✅ ${fix.description}: ${fixedInThisStep} 处`);
        }
      }
    }

    // 特殊修复：处理复杂的属性错误
    const specialFixes = this.applySpecialFixes(content);
    if (specialFixes.content !== content) {
      content = specialFixes.content;
      fileFixedCount += specialFixes.count;
      if (specialFixes.count > 0) {
        console.log(`  ✅ 特殊属性修复: ${specialFixes.count} 处`);
      }
    }

    // 保存文件
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      this.fileCount++;
      this.fixedCount += fileFixedCount;
      console.log(`🔧 ${filePath} 修复了 ${fileFixedCount} 处属性错误`);
    }
  }

  /**
   * 应用特殊修复
   */
  applySpecialFixes(content) {
    let fixedContent = content;
    let fixCount = 0;

    // 修复特定的已知问题
    const knownFixes = [
      // HomePage 特定修复
      {
        from: /title=\s*\n\s*description=/g,
        to: "title={t('pages.titles.首页')}\n        description={t('pages.descriptions.首页')}",
        count: 1
      },
      
      // AboutPage 特定修复
      {
        from: /title=\{t\('pages\.labels\.关于我们'\)\s*\}\s*\n\s*description=\s*\n\s*showAdaptButton/g,
        to: "title={t('pages.labels.关于我们')}\n        description={t('pages.descriptions.关于我们页面')}\n        showAdaptButton",
        count: 1
      },
      
      // BookmarkPage 特定修复
      {
        from: /title=\s*\n\s*description=\s*\n\s*showAdaptButton=\{false\}/g,
        to: "title={t('pages.titles.书签管理')}\n        description={t('pages.descriptions.书签管理')}\n        showAdaptButton={false}",
        count: 1
      },
      
      // ScrollToTop 特定修复
      {
        from: /aria-label=\s*\n\s*title=/g,
        to: "aria-label={t('components.labels.返回顶部')}\n        title=",
        count: 1
      },
      
      // LoadingSpinner 特定修复
      {
        from: /aria-label=\s*\n\s*\/>/g,
        to: "aria-label={t('components.labels.加载中')}\n      />",
        count: 1
      },
      
      // App.tsx 特定修复
      {
        from: /text=\s*\/>/g,
        to: "text={t('app.common.loading')} />",
        count: 1
      }
    ];

    for (const fix of knownFixes) {
      const matches = fixedContent.match(fix.from);
      if (matches) {
        fixedContent = fixedContent.replace(fix.from, fix.to);
        fixCount += matches.length;
      }
    }

    return { content: fixedContent, count: fixCount };
  }
}

// 运行属性修复
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new FixAllAttributeErrors();
  fixer.run().catch(console.error);
}

export default FixAllAttributeErrors;
