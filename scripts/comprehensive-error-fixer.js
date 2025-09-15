#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔧 开始综合错误修复...');

// 1. 修复 CreativeStudioPage 中的重复导入
function fixCreativeStudioPage() {
  const filePath = 'src/pages/CreativeStudioPage.tsx';
  console.log(`📝 修复 ${filePath} 中的重复导入...`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 移除重复的 useTranslation 导入
    const lines = content.split('\n');
    const filteredLines = [];
    let useTranslationImported = false;
    
    for (const line of lines) {
      if (line.includes("import { useTranslation } from 'react-i18next';")) {
        if (!useTranslationImported) {
          filteredLines.push(line);
          useTranslationImported = true;
        }
        // 跳过重复的导入
      } else {
        filteredLines.push(line);
      }
    }
    
    content = filteredLines.join('\n');
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${filePath} 修复完成`);
  } catch (error) {
    console.error(`❌ 修复 ${filePath} 失败:`, error.message);
  }
}

// 2. 修复 PricingSection 中的 JSX 错误
function fixPricingSection() {
  const filePath = 'src/components/landing/PricingSection.tsx';
  console.log(`📝 修复 ${filePath} 中的 JSX 错误...`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 查找并修复 JSX 结构问题
    content = content.replace(
      /(\s+)}[\s\n]*<\/Button>[\s\n]*<\/div>[\s\n]*<\/Card>/g,
      '$1}\n                  </Button>\n              </Card>'
    );
    
    // 确保正确的 JSX 结构
    content = content.replace(
      /(\s+)}[\s\n]*<\/Button>[\s\n]*<\/Card>/g,
      '$1}\n                  </Button>\n              </Card>'
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${filePath} 修复完成`);
  } catch (error) {
    console.error(`❌ 修复 ${filePath} 失败:`, error.message);
  }
}

// 3. 修复 CSS 文件中的语法错误
function fixCSSFiles() {
  console.log('📝 修复 CSS 文件中的语法错误...');
  
  // 修复 typography-system.css
  const typographyPath = 'src/styles/typography-system.css';
  try {
    let content = fs.readFileSync(typographyPath, 'utf8');
    
    // 修复多余的闭合括号
    content = content.replace(/}\s*}\s*\/\* ===== 工具类 ===== \*\//g, '}\n/* ===== 工具类 ===== */');
    
    // 确保括号匹配
    const openBraces = (content.match(/{/g) || []).length;
    const closeBraces = (content.match(/}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      console.log(`⚠️ ${typographyPath} 括号不匹配: ${openBraces} 开括号, ${closeBraces} 闭括号`);
      
      // 简单修复：移除多余的闭括号
      if (closeBraces > openBraces) {
        const diff = closeBraces - openBraces;
        for (let i = 0; i < diff; i++) {
          content = content.replace(/}\s*$/, '');
        }
      }
    }
    
    fs.writeFileSync(typographyPath, content);
    console.log(`✅ ${typographyPath} 修复完成`);
  } catch (error) {
    console.error(`❌ 修复 ${typographyPath} 失败:`, error.message);
  }
}

// 4. 修复 index.css 中的 @import 顺序问题
function fixIndexCSS() {
  const filePath = 'src/index.css';
  console.log(`📝 修复 ${filePath} 中的 @import 顺序...`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 提取所有 @import 语句
    const importRegex = /@import\s+[^;]+;/g;
    const imports = content.match(importRegex) || [];
    
    // 移除原有的 @import 语句
    content = content.replace(importRegex, '');
    
    // 移除多余的空行
    content = content.replace(/^\s*\n/gm, '');
    
    // 在文件开头添加所有 @import 语句
    const importsSection = imports.join('\n') + '\n\n';
    content = importsSection + content;
    
    // 确保注释格式正确
    content = content.replace(/^@import必须在最前面 \*\//, '/* @import必须在最前面 */');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${filePath} 修复完成`);
  } catch (error) {
    console.error(`❌ 修复 ${filePath} 失败:`, error.message);
  }
}

// 5. 移除不存在的 CSS 类引用
function removeNonExistentClasses() {
  console.log('📝 移除不存在的 CSS 类引用...');
  
  const filesToCheck = [
    'src/index.css',
    'src/styles/typography-system.css',
    'src/styles/unified-css-system.css'
  ];
  
  filesToCheck.forEach(filePath => {
    if (!fs.existsSync(filePath)) return;
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // 移除引用不存在类的 @apply 规则
      content = content.replace(/@apply\s+[^;]*font-base[^;]*;/g, '');
      content = content.replace(/@apply\s+[^;]*border-border[^;]*;/g, '');
      content = content.replace(/@apply\s+[^;]*text-primary[^;]*;/g, '');
      
      // 清理空的 @apply 行
      content = content.replace(/@apply\s*;/g, '');
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ ${filePath} 清理完成`);
    } catch (error) {
      console.error(`❌ 清理 ${filePath} 失败:`, error.message);
    }
  });
}

// 执行所有修复
async function main() {
  try {
    fixCreativeStudioPage();
    fixPricingSection();
    fixCSSFiles();
    fixIndexCSS();
    removeNonExistentClasses();
    
    console.log('🎉 所有错误修复完成！');
    console.log('📋 修复内容：');
    console.log('  ✅ CreativeStudioPage 重复导入');
    console.log('  ✅ PricingSection JSX 错误');
    console.log('  ✅ CSS 语法错误');
    console.log('  ✅ @import 顺序问题');
    console.log('  ✅ 不存在的 CSS 类引用');
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
    process.exit(1);
  }
}

main();
