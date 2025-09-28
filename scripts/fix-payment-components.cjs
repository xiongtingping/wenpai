#!/usr/bin/env node

/**
 * 修复支付组件中的TypeScript错误
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 获取所有支付相关的错误文件
function getPaymentErrorFiles() {
  try {
    const output = execSync('npm run type-check 2>&1', { encoding: 'utf8' });
    const lines = output.split('\n');
    const errorFiles = new Set();
    
    lines.forEach(line => {
      if (line.includes('Cannot find name \'t\'') && line.includes('src/components/payment/')) {
        const match = line.match(/src\/components\/payment\/([^:]+)/);
        if (match) {
          errorFiles.add(`src/components/payment/${match[1]}`);
        }
      }
    });
    
    return Array.from(errorFiles);
  } catch (error) {
    console.log('⚠️  获取错误文件列表失败，使用预定义列表');
    return [
      'src/components/payment/AlipayQRCode.tsx',
      'src/components/payment/CheckoutButton.tsx',
      'src/components/payment/PaymentQRCode.tsx',
      'src/components/payment/DirectLinkQRCode.tsx'
    ];
  }
}

function fixPaymentComponent(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  文件不存在: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // 检查是否已经有useTranslation导入
    if (!content.includes('useTranslation')) {
      // 在React导入后添加useTranslation导入
      if (content.includes("from 'react'")) {
        content = content.replace(
          /(import.*from 'react';)/,
          "$1\nimport { useTranslation } from 'react-i18next';"
        );
        modified = true;
      }
    }

    // 检查组件中是否有t函数定义
    if (content.includes('t(') && !content.includes('const { t }') && !content.includes('const t =')) {
      // 查找组件函数定义
      const patterns = [
        // export const Component = () => {
        /export\s+const\s+(\w+).*?\s*=\s*\([^)]*\)\s*(?::\s*[^=]*)?\s*=>\s*{/,
        // export function Component() {
        /export\s+function\s+(\w+)\s*\([^)]*\)\s*(?::\s*[^{]*)?\s*{/,
        // export default function Component() {
        /export\s+default\s+function\s+(\w+)\s*\([^)]*\)\s*(?::\s*[^{]*)?\s*{/
      ];

      for (const pattern of patterns) {
        if (pattern.test(content)) {
          content = content.replace(pattern, (match) => {
            return match + '\n  const { t } = useTranslation();';
          });
          modified = true;
          break;
        }
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

console.log('🔧 开始修复支付组件TypeScript错误...\n');

const errorFiles = getPaymentErrorFiles();
console.log(`发现 ${errorFiles.length} 个需要修复的文件:`);
errorFiles.forEach(file => console.log(`  - ${file}`));
console.log('');

errorFiles.forEach(fixPaymentComponent);

console.log('\n✨ 修复完成！');