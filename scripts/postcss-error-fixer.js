#!/usr/bin/env node

/**
 * PostCSS Error Fixer
 * 修复导致PostCSS "Cannot read properties of undefined (reading 'insertAfter')" 错误的问题
 */

import fs from 'fs';
import path from 'path';

console.log('🔧 开始修复PostCSS错误...\n');

const cssFiles = [
  'src/index.css',
  'src/styles/design-tokens.css',
  'src/styles/typography-system.css',
  'src/styles/unified-css-system.css',
  'src/styles/utility-classes.css',
  'src/styles/component-layer.css',
  'src/styles/base-layer.css'
];

let totalFixed = 0;

function fixPostCSSIssues(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  文件不存在: ${filePath}`);
    return 0;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fixCount = 0;

  console.log(`📄 处理文件: ${filePath}`);

  // 1. 修复@apply规则问题
  const applyRules = content.match(/@apply\s+[^;]+/g);
  if (applyRules) {
    applyRules.forEach(rule => {
      // 检查是否引用了不存在的类名
      const className = rule.replace('@apply', '').trim().replace(/;$/, '');
      
      // 常见的问题类名
      const problematicClasses = [
        'border-border',
        'bg-background', 
        'text-foreground',
        'text-primary',
        'font-base',
        'font-emoji',
        'unified-tabs-list',
        'unified-tab-trigger'
      ];

      if (problematicClasses.some(cls => className.includes(cls))) {
        console.log(`  🔧 修复@apply规则: ${rule}`);
        
        // 替换为具体的CSS属性
        let replacement = '';
        if (className.includes('border-border')) {
          replacement = 'border: 1px solid var(--color-border)';
        } else if (className.includes('bg-background')) {
          replacement = 'background-color: var(--color-background)';
        } else if (className.includes('text-foreground')) {
          replacement = 'color: var(--color-foreground)';
        } else if (className.includes('text-primary')) {
          replacement = 'color: var(--color-primary)';
        } else if (className.includes('font-base')) {
          replacement = 'font-family: var(--font-family-base)';
        } else if (className.includes('font-emoji')) {
          replacement = 'font-family: var(--font-family-emoji)';
        } else if (className.includes('unified-tabs-list')) {
          replacement = 'display: flex; align-items: center; gap: var(--spacing-2)';
        } else if (className.includes('unified-tab-trigger')) {
          replacement = 'padding: var(--spacing-2) var(--spacing-4); border-radius: var(--radius-md); transition: var(--transition-smooth)';
        }

        if (replacement) {
          content = content.replace(rule, replacement);
          fixCount++;
        }
      }
    });
  }

  // 2. 修复@layer规则问题
  // 检查重复的@layer base规则
  const layerBaseMatches = content.match(/@layer\s+base\s*\{[^}]*\}/g);
  if (layerBaseMatches && layerBaseMatches.length > 1) {
    console.log(`  🔧 发现${layerBaseMatches.length}个重复的@layer base规则，保留第一个`);
    
    // 保留第一个，删除其他的
    for (let i = 1; i < layerBaseMatches.length; i++) {
      content = content.replace(layerBaseMatches[i], '');
      fixCount++;
    }
  }

  // 3. 修复CSS语法错误
  // 修复未闭合的大括号
  const openBraces = (content.match(/\{/g) || []).length;
  const closeBraces = (content.match(/\}/g) || []).length;
  
  if (openBraces !== closeBraces) {
    console.log(`  🔧 修复大括号不匹配: 开括号${openBraces}个，闭括号${closeBraces}个`);
    
    if (openBraces > closeBraces) {
      // 添加缺失的闭括号
      const missing = openBraces - closeBraces;
      content += '\n' + '}'.repeat(missing);
      fixCount += missing;
    } else {
      // 移除多余的闭括号
      const extra = closeBraces - openBraces;
      for (let i = 0; i < extra; i++) {
        const lastBraceIndex = content.lastIndexOf('}');
        if (lastBraceIndex !== -1) {
          content = content.substring(0, lastBraceIndex) + content.substring(lastBraceIndex + 1);
          fixCount++;
        }
      }
    }
  }

  // 4. 修复CSS注释问题
  // 移除可能导致解析问题的注释
  content = content.replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\/\s*(?=\{)/g, '');
  
  // 5. 修复CSS属性语法
  // 修复缺少分号的问题
  content = content.replace(/([^;{}])\s*\n\s*([a-zA-Z-]+\s*:)/g, '$1;\n  $2');
  
  // 6. 修复@import语句
  // 确保@import在文件开头
  const imports = content.match(/@import[^;]+;/g) || [];
  const nonImportContent = content.replace(/@import[^;]+;/g, '').trim();
  
  if (imports.length > 0) {
    content = imports.join('\n') + '\n\n' + nonImportContent;
  }

  // 7. 清理多余的空行和空格
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  content = content.replace(/\s+$/gm, '');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ 修复了 ${fixCount} 个问题`);
  } else {
    console.log(`  ✅ 文件无需修复`);
  }

  return fixCount;
}

// 处理所有CSS文件
cssFiles.forEach(file => {
  const fixed = fixPostCSSIssues(file);
  totalFixed += fixed;
});

console.log(`\n🎉 PostCSS错误修复完成！`);
console.log(`📊 总计修复: ${totalFixed} 个问题`);
console.log(`📁 处理文件: ${cssFiles.length} 个`);

if (totalFixed > 0) {
  console.log(`\n✅ 建议现在运行: npm run build`);
} else {
  console.log(`\n💡 所有文件都没有PostCSS相关问题`);
}
