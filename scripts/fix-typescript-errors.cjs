#!/usr/bin/env node

/**
 * 修复TypeScript编译错误脚本
 * 主要处理缺少的i18n导入和t函数定义
 */

const fs = require('fs');
const path = require('path');

// 需要修复的文件列表（从type-check错误中提取）
const filesToFix = [
  'src/components/ai/AISetupWizard.tsx',
  'src/components/auth/CustomAuthModal.tsx',
  'src/components/auth/DirectLoginForm.tsx',
  'src/components/creative/md2card/ExportControls.tsx',
  'src/components/creative/MD2CardPage.tsx',
  'src/components/creative/md2card/MarkdownParser.ts'
];

function fixFile(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  文件不存在: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // 检查是否为TypeScript文件且使用了t函数
    if (filePath.endsWith('.tsx') && content.includes('t(')) {
      // 检查是否已经导入了useTranslation
      if (!content.includes('useTranslation')) {
        // 添加useTranslation导入
        if (content.includes("from 'react'")) {
          content = content.replace(
            /(import.*from 'react';)/,
            "$1\nimport { useTranslation } from 'react-i18next';"
          );
          modified = true;
        } else {
          // 在文件开头添加导入
          content = "import { useTranslation } from 'react-i18next';\n" + content;
          modified = true;
        }
      }

      // 在组件中添加t函数定义
      if (!content.includes('const { t }') && !content.includes('const t =')) {
        // 查找函数组件定义
        const functionPattern = /export\s+(const|default\s+function)\s+(\w+).*?\s*=\s*\([^)]*\)\s*(?::\s*\w+\s*)?=>\s*{/;
        const classPattern = /export\s+(?:default\s+)?class\s+(\w+).*?{/;
        
        if (functionPattern.test(content)) {
          content = content.replace(
            functionPattern,
            (match) => match + '\n  const { t } = useTranslation();'
          );
          modified = true;
        }
      }
    }

    // 对于.ts文件，只添加i18n导入
    if (filePath.endsWith('.ts') && content.includes('i18n.t(')) {
      if (!content.includes("import i18n from '@/i18n'")) {
        content = "import i18n from '@/i18n';\n" + content;
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(fullPath, content);
      console.log(`✅ 修复成功: ${filePath}`);
    } else {
      console.log(`⏭️  无需修复: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ 修复失败: ${filePath}`, error.message);
  }
}

// 处理特殊的MarkdownParser.ts文件
function fixMarkdownParser() {
  const filePath = 'src/components/creative/md2card/MarkdownParser.ts';
  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  文件不存在: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    
    if (!content.includes("import i18n from '@/i18n'")) {
      content = "import i18n from '@/i18n';\n" + content;
      fs.writeFileSync(fullPath, content);
      console.log(`✅ 修复成功: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ 修复失败: ${filePath}`, error.message);
  }
}

console.log('🔧 开始修复TypeScript编译错误...\n');

// 修复文件列表中的文件
filesToFix.forEach(fixFile);

// 特殊处理MarkdownParser
fixMarkdownParser();

console.log('\n✨ 修复完成！请运行 npm run type-check 验证结果。');