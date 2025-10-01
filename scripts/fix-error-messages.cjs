#!/usr/bin/env node

/**
 * 修复 throw new Error 中的中文错误消息
 * 将硬编码的中文错误消息转换为使用i18n的t()函数
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 读取翻译映射
const translationsPath = path.join(__dirname, 'i18n-translations.json');
const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));

// 错误消息的英文映射
const errorTranslations = {
  'prompt参数不能为空且必须是字符串': 'Prompt parameter cannot be empty and must be a string',
  'API密钥未正确配置': 'API key not properly configured',
  'API密钥格式不正确': 'API key format is incorrect',
  'API密钥长度过短': 'API key is too short',
  '请在.env.local文件中设置': 'Please set in .env.local file',
  'OpenAI API密钥未正确配置，请在.env.local文件中设置VITE_OPENAI_API_KEY': 'OpenAI API key not configured, please set VITE_OPENAI_API_KEY in .env.local',
  'OpenAI API密钥格式不正确，应以sk-开头': 'OpenAI API key format is incorrect, should start with sk-',
  'OpenAI API密钥长度过短，请检查密钥格式': 'OpenAI API key is too short, please check the key format',
  'DeepSeek API密钥未正确配置，请在.env.local文件中设置VITE_DEEPSEEK_API_KEY': 'DeepSeek API key not configured, please set VITE_DEEPSEEK_API_KEY in .env.local',
  'Gemini API密钥未正确配置，请在.env.local文件中设置VITE_GEMINI_API_KEY': 'Gemini API key not configured, please set VITE_GEMINI_API_KEY in .env.local',
  ...Object.fromEntries(
    Object.entries(translations).map(([cn, en]) => [cn, en])
  )
};

function translateErrorMessage(message) {
  // 尝试完全匹配
  if (errorTranslations[message]) {
    return { text: errorTranslations[message], changed: true };
  }

  // 尝试部分匹配
  let translated = message;
  let hasChanges = false;

  const sortedKeys = Object.keys(errorTranslations).sort((a, b) => b.length - a.length);

  for (const cn of sortedKeys) {
    if (translated.includes(cn)) {
      const en = errorTranslations[cn];
      const regex = new RegExp(cn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      translated = translated.replace(regex, en);
      hasChanges = true;
    }
  }

  // 如果还有中文，说明没有完全翻译
  if (/[\u4e00-\u9fa5]/.test(translated)) {
    return { text: message, changed: false };
  }

  return { text: translated, changed: hasChanges };
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let totalChanges = 0;
    const untranslated = [];

    // 匹配 throw new Error('message')
    const throwPattern = /(throw\s+new\s+Error\s*\(\s*)([`'"])(.*?)(\2\s*\))/g;

    const newContent = content.replace(throwPattern, (match, prefix, quote, message, suffix) => {
      // 如果没有中文,跳过
      if (!/[\u4e00-\u9fa5]/.test(message)) {
        return match;
      }

      const { text: translatedMessage, changed } = translateErrorMessage(message);

      if (changed) {
        totalChanges++;
        return prefix + quote + translatedMessage + suffix;
      } else {
        untranslated.push({ file: filePath, message });
      }

      return match;
    });

    if (totalChanges > 0) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ ${filePath}: ${totalChanges} changes`);
    }

    if (untranslated.length > 0) {
      console.log(`⚠️  ${filePath}: ${untranslated.length} untranslated errors`);
    }

    return { changes: totalChanges, untranslated };
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return { changes: 0, untranslated: [] };
  }
}

function main() {
  console.log(`读取翻译映射表: ${Object.keys(errorTranslations).length} 条\n`);

  // 找到所有TS/TSX文件
  const files = glob.sync('src/**/*.{ts,tsx}', {
    ignore: ['**/node_modules/**', '**/dist/**', '**/*.d.ts']
  });

  console.log(`找到 ${files.length} 个文件\n`);

  let totalChanges = 0;
  let filesModified = 0;
  const allUntranslated = [];

  files.forEach(file => {
    const { changes, untranslated } = processFile(file);
    if (changes > 0) {
      filesModified++;
      totalChanges += changes;
    }
    if (untranslated.length > 0) {
      allUntranslated.push(...untranslated);
    }
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log(`处理完成!`);
  console.log(`文件总数: ${files.length}`);
  console.log(`修改文件: ${filesModified}`);
  console.log(`总变更数: ${totalChanges}`);
  console.log(`未翻译错误: ${allUntranslated.length}`);
  console.log('='.repeat(60));

  if (allUntranslated.length > 0 && allUntranslated.length < 50) {
    console.log('\n未翻译的错误消息(前50条):');
    allUntranslated.slice(0, 50).forEach((item, i) => {
      console.log(`${i + 1}. ${item.file}`);
      console.log(`   "${item.message}"`);
    });
  }
}

if (require.main === module) {
  main();
}
