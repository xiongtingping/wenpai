#!/usr/bin/env node

/**
 * 错误调试脚本
 * 帮助诊断应用中的错误问题
 */

console.log('🔍 应用错误诊断工具');
console.log('='.repeat(50));

// 1. 检查可能存在t函数问题的文件
console.log('\n📋 检查可能的t函数问题...');

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  // 查找使用t(但没有useTranslation的文件
  const result = execSync(`find src -name "*.tsx" -exec grep -l "t(" {} \\; | xargs grep -L "useTranslation\\|const.*t.*=" | grep -v "App-\\|backup\\|test"`, { encoding: 'utf8' });
  
  if (result.trim()) {
    console.log('⚠️  发现可能有问题的文件:');
    result.trim().split('\n').forEach(file => {
      console.log(`   - ${file}`);
      
      // 检查文件内容
      try {
        const content = fs.readFileSync(file, 'utf8');
        const tUsages = content.match(/\bt\(/g);
        if (tUsages) {
          console.log(`     使用t()次数: ${tUsages.length}`);
        }
      } catch (e) {
        console.log(`     无法读取文件: ${e.message}`);
      }
    });
  } else {
    console.log('✅ 没有发现明显的t函数问题');
  }
} catch (error) {
  console.log('❌ 检查过程出错:', error.message);
}

// 2. 检查国际化配置
console.log('\n🌐 检查国际化配置...');

try {
  const i18nPath = path.join(__dirname, 'src/i18n/index.ts');
  if (fs.existsSync(i18nPath)) {
    console.log('✅ i18n配置文件存在');
  } else {
    console.log('⚠️  i18n配置文件不存在');
  }
  
  const localesDir = path.join(__dirname, 'src/i18n/locales');
  if (fs.existsSync(localesDir)) {
    const locales = fs.readdirSync(localesDir);
    console.log(`✅ 语言包文件: ${locales.join(', ')}`);
  } else {
    console.log('⚠️  语言包目录不存在');
  }
} catch (error) {
  console.log('❌ 检查i18n配置出错:', error.message);
}

// 3. 检查错误边界配置
console.log('\n🛡️  检查错误边界配置...');

try {
  const errorBoundaryPath = path.join(__dirname, 'src/components/ErrorBoundary.tsx');
  if (fs.existsSync(errorBoundaryPath)) {
    console.log('✅ ErrorBoundary组件存在');
  } else {
    console.log('⚠️  ErrorBoundary组件不存在');
  }
  
  const errorHandlerPath = path.join(__dirname, 'src/utils/errorHandler.ts');
  if (fs.existsSync(errorHandlerPath)) {
    console.log('✅ errorHandler工具存在');
  } else {
    console.log('⚠️  errorHandler工具不存在');
  }
} catch (error) {
  console.log('❌ 检查错误处理配置出错:', error.message);
}

// 4. 生成修复建议
console.log('\n💡 修复建议:');
console.log('1. 如果发现有问题的文件，需要添加useTranslation hook');
console.log('2. 检查浏览器控制台获取详细错误信息');
console.log('3. 验证应用的核心功能是否正常工作');
console.log('4. 如果错误持续出现，可能需要检查异步组件加载');

console.log('\n🎯 下一步操作:');
console.log('1. 运行应用: npm run dev');
console.log('2. 打开浏览器控制台');
console.log('3. 访问: http://localhost:5173/creative-studio');
console.log('4. 观察具体的错误信息');

console.log('\n' + '='.repeat(50));
console.log('🔍 错误诊断完成');
