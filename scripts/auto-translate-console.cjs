#!/usr/bin/env node

/**
 * 自动翻译console中的中文为英文
 * 使用translations.json中的映射表
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 读取翻译映射表
const translationsPath = path.join(__dirname, 'i18n-translations.json');
const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));

function translateText(text) {
  let translated = text;
  let hasChanges = false;

  // 按照从长到短的顺序排序,优先匹配长词组
  const sortedKeys = Object.keys(translations).sort((a, b) => b.length - a.length);

  for (const cn of sortedKeys) {
    if (translated.includes(cn)) {
      const en = translations[cn];
      // 使用正则全局替换
      const regex = new RegExp(cn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      translated = translated.replace(regex, en);
      hasChanges = true;
    }
  }

  return { text: translated, changed: hasChanges };
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let totalChanges = 0;

    // 匹配console.log/error/warn/info/debug
    const consolePattern = /(console\.(log|error|warn|info|debug)\s*\(\s*)([`'"])(.*?)(\3)/g;

    const newContent = content.replace(consolePattern, (match, prefix, method, quote, message, closeQuote) => {
      // 如果没有中文,跳过
      if (!/[\u4e00-\u9fa5]/.test(message)) {
        return match;
      }

      const { text: translatedMessage, changed } = translateText(message);

      if (changed) {
        totalChanges++;
        return prefix + quote + translatedMessage + closeQuote;
      }

      return match;
    });

    if (totalChanges > 0) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ ${filePath}: ${totalChanges} changes`);
    }

    return totalChanges;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

function main() {
  console.log(`读取翻译映射表: ${Object.keys(translations).length} 条\n`);

  // 找到所有TS/TSX文件
  const files = glob.sync('src/**/*.{ts,tsx}', {
    ignore: ['**/node_modules/**', '**/dist/**', '**/*.d.ts']
  });

  console.log(`找到 ${files.length} 个文件\n`);

  let totalChanges = 0;
  let filesModified = 0;

  files.forEach(file => {
    const changes = processFile(file);
    if (changes > 0) {
      filesModified++;
      totalChanges += changes;
    }
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log(`处理完成!`);
  console.log(`文件总数: ${files.length}`);
  console.log(`修改文件: ${filesModified}`);
  console.log(`总变更数: ${totalChanges}`);
  console.log('='.repeat(60));

  // 检查还有多少未翻译的中文
  console.log('\n检查剩余中文console...');
  let remainingChinese = 0;

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.match(/console\.(log|error|warn|info|debug)\s*\([^)]*[\u4e00-\u9fa5][^)]*\)/g);
    if (matches) {
      remainingChinese += matches.length;
    }
  });

  console.log(`剩余中文console: ${remainingChinese} 处\n`);
}

if (require.main === module) {
  main();
}
