#!/usr/bin/env node

/**
 * 自动国际化修复脚本
 *
 * 功能:
 * 1. 读取i18n-scan-report.json中的硬编码文本
 * 2. 自动将硬编码中文替换为t()函数调用
 * 3. 自动添加缺失的useTranslation import
 * 4. 自动添加翻译到语言文件
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, '..');
const reportPath = path.join(projectRoot, 'i18n-scan-report.json');
const zhCNPath = path.join(projectRoot, 'src/i18n/locales/zh-CN.json');
const enUSPath = path.join(projectRoot, 'src/i18n/locales/en-US.json');

// 由于报告文件太大,我们需要流式读取或分块处理
console.log('正在读取国际化扫描报告...');

// 读取语言文件
let zhCN, enUS;
try {
  zhCN = JSON.parse(fs.readFileSync(zhCNPath, 'utf8'));
  enUS = JSON.parse(fs.readFileSync(enUSPath, 'utf8'));
  console.log('✓ 语言文件加载成功');
} catch (error) {
  console.error('❌ 读取语言文件失败:', error.message);
  process.exit(1);
}

// 检测是否包含中文字符
function hasChinese(str) {
  return /[\u4e00-\u9fa5]/.test(str);
}

// 生成i18n键名
function generateI18nKey(text, context = {}) {
  const { type = 'text', namespace = 'common', file = '' } = context;

  // 基于文件路径确定命名空间
  let ns = namespace;
  if (file.includes('/pages/')) {
    ns = 'pages';
  } else if (file.includes('/components/')) {
    ns = 'components';
  } else if (file.includes('/api/')) {
    ns = 'api';
  } else if (file.includes('/services/')) {
    ns = 'services';
  } else if (file.includes('/prompts/')) {
    ns = 'prompts';
  } else if (file.includes('/utils/')) {
    ns = 'utils';
  }

  // 基于类型确定子命名空间
  let subNs = type;
  if (type === 'error') {
    subNs = 'errors';
  } else if (type === 'button') {
    subNs = 'buttons';
  } else if (type === 'label') {
    subNs = 'labels';
  } else if (type === 'placeholder') {
    subNs = 'placeholders';
  } else if (type === 'message') {
    subNs = 'messages';
  } else if (type === 'title') {
    subNs = 'titles';
  }

  // 截取前30个字符用于生成键名
  const shortText = text.substring(0, 30);

  // 生成hash作为唯一标识
  const hash = shortText.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0) | 0;
  }, 0);

  const hashStr = Math.abs(hash).toString(36).substring(0, 6);

  // 返回键名
  return `${ns}.${subNs}.text_${hashStr}`;
}

// 添加翻译到语言文件
function addTranslation(key, zhText, enText = null) {
  const parts = key.split('.');
  let zhObj = zhCN;
  let enObj = enUS;

  // 创建嵌套结构
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!zhObj[part]) zhObj[part] = {};
    if (!enObj[part]) enObj[part] = {};
    zhObj = zhObj[part];
    enObj = enObj[part];
  }

  // 设置值
  const lastKey = parts[parts.length - 1];
  zhObj[lastKey] = zhText;
  enObj[lastKey] = enText || `[TO BE TRANSLATED] ${zhText}`;
}

// 保存语言文件
function saveLanguageFiles() {
  fs.writeFileSync(zhCNPath, JSON.stringify(zhCN, null, 2), 'utf8');
  fs.writeFileSync(enUSPath, JSON.stringify(enUS, null, 2), 'utf8');
  console.log('✓ 语言文件已更新');
}

// 处理单个文件
function processFile(filePath, hardcodedTexts) {
  console.log(`\n处理文件: ${filePath}`);
  console.log(`  硬编码文本数量: ${hardcodedTexts.length}`);

  // 读取文件内容
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`  ❌ 读取失败: ${error.message}`);
    return { success: false, count: 0 };
  }

  // 检查文件类型
  const isTsx = filePath.endsWith('.tsx');
  const isTs = filePath.endsWith('.ts');
  const isJsx = filePath.endsWith('.jsx');

  // 检查是否已有useTranslation
  const hasUseTranslation = content.includes('useTranslation');
  const hasImportReact = content.includes("from 'react'") || content.includes('from "react"');

  let modifiedContent = content;
  let replacedCount = 0;
  const addedKeys = new Set();

  // 对硬编码文本按长度排序(从长到短),避免短文本误替换长文本的一部分
  const sortedTexts = [...hardcodedTexts].sort((a, b) => {
    const textA = a.text || '';
    const textB = b.text || '';
    return textB.length - textA.length;
  });

  // 替换每个硬编码文本
  for (const item of sortedTexts) {
    const text = item.text;
    if (!text || !hasChinese(text)) continue;

    // 跳过注释中的文本
    if (item.context && item.context.includes('//')) continue;
    if (item.context && item.context.includes('/*')) continue;

    // 生成i18n键名
    const key = generateI18nKey(text, {
      type: item.type,
      file: filePath
    });

    // 添加到语言文件
    if (!addedKeys.has(key)) {
      addTranslation(key, text);
      addedKeys.add(key);
    }

    // 构建替换模式
    // 1. 直接字符串字面量: "文本" 或 '文本'
    const pattern1 = new RegExp(`['"]${escapeRegex(text)}['"]`, 'g');
    // 2. JSX文本: >文本<
    const pattern2 = new RegExp(`>\\s*${escapeRegex(text)}\\s*<`, 'g');
    // 3. 模板字符串中的文本: \`...$文本...\`
    const pattern3 = new RegExp(`\\$\\{.*${escapeRegex(text)}.*\\}`, 'g');

    // 对于TSX/JSX文件
    if (isTsx || isJsx) {
      // 替换JSX文本节点
      const beforeLength = modifiedContent.length;
      modifiedContent = modifiedContent.replace(pattern2, `>{t('${key}')}<`);

      // 替换字符串字面量(但要避免替换已经在t()中的)
      modifiedContent = modifiedContent.replace(pattern1, (match) => {
        // 检查是否已经在t()调用中
        const index = modifiedContent.indexOf(match);
        const before = modifiedContent.substring(Math.max(0, index - 10), index);
        if (before.includes("t('") || before.includes('t("')) {
          return match; // 已经被替换,跳过
        }
        return `{t('${key}')}`;
      });

      if (modifiedContent.length !== beforeLength) {
        replacedCount++;
      }
    } else if (isTs) {
      // 对于纯TS文件,只替换字符串字面量
      const beforeLength = modifiedContent.length;
      modifiedContent = modifiedContent.replace(pattern1, (match) => {
        // 检查是否已经在t()调用中
        const index = modifiedContent.indexOf(match);
        const before = modifiedContent.substring(Math.max(0, index - 10), index);
        if (before.includes("t('") || before.includes('t("')) {
          return match;
        }
        return `t('${key}')`;
      });

      if (modifiedContent.length !== beforeLength) {
        replacedCount++;
      }
    }
  }

  // 如果有替换,添加useTranslation import
  if (replacedCount > 0 && !hasUseTranslation) {
    // 找到第一个import语句的位置
    const importMatch = modifiedContent.match(/^import\s/m);
    if (importMatch) {
      const insertPos = importMatch.index;
      const importStatement = "import { useTranslation } from 'react-i18next';\n";
      modifiedContent = modifiedContent.substring(0, insertPos) +
                       importStatement +
                       modifiedContent.substring(insertPos);

      // 如果是组件文件,还需要在组件内添加const { t } = useTranslation()
      if (isTsx || isJsx) {
        // 查找函数组件或类组件
        const funcCompMatch = modifiedContent.match(/(?:const|function)\s+\w+[^{]*\{/);
        if (funcCompMatch) {
          const insertPos = funcCompMatch.index + funcCompMatch[0].length;
          const hookStatement = "\n  const { t } = useTranslation();";
          modifiedContent = modifiedContent.substring(0, insertPos) +
                           hookStatement +
                           modifiedContent.substring(insertPos);
        }
      }
    }
  }

  // 保存修改后的文件
  if (replacedCount > 0) {
    fs.writeFileSync(filePath, modifiedContent, 'utf8');
    console.log(`  ✓ 已替换 ${replacedCount} 处硬编码文本`);
    console.log(`  ✓ 添加了 ${addedKeys.size} 个翻译键`);
  } else {
    console.log(`  - 未找到可替换的文本`);
  }

  return { success: true, count: replacedCount };
}

// 转义正则表达式特殊字符
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 主函数
async function main() {
  console.log('='.repeat(80));
  console.log('国际化自动修复工具');
  console.log('='.repeat(80));

  // 由于报告文件太大,我们直接处理Top 10文件
  const topFiles = [
    '/src/App.tsx',
    '/src/services/unifiedEmojiSystem.ts',
    '/src/prompts/PromptSystem.ts',
    '/src/components/creative/CreativeCube.tsx',
    '/src/config/contentSchemes.ts',
    '/src/pages/BrandLibraryPage.tsx',
    '/src/utils/hashtagGenerator.ts',
    '/src/components/hot-topics/TopicCategories.tsx',
    '/src/ai/prompts/titleGeneration.ts',
    '/src/api/aiService.ts'
  ];

  let totalProcessed = 0;
  let totalReplaced = 0;

  for (const relPath of topFiles) {
    const absPath = path.join(projectRoot, relPath);

    // 读取该文件的硬编码文本
    // 注意:这里我们简化处理,直接扫描文件中的中文
    try {
      const content = fs.readFileSync(absPath, 'utf8');
      const chineseMatches = content.match(/[\u4e00-\u9fa5]+/g) || [];

      // 构建硬编码文本列表
      const hardcodedTexts = Array.from(new Set(chineseMatches)).map(text => ({
        text,
        type: 'text'
      }));

      if (hardcodedTexts.length > 0) {
        const result = processFile(absPath, hardcodedTexts);
        if (result.success) {
          totalProcessed++;
          totalReplaced += result.count;
        }
      }
    } catch (error) {
      console.error(`处理文件失败 ${relPath}:`, error.message);
    }
  }

  // 保存语言文件
  saveLanguageFiles();

  console.log('\n' + '='.repeat(80));
  console.log('修复完成');
  console.log('='.repeat(80));
  console.log(`处理文件数: ${totalProcessed}`);
  console.log(`替换数量: ${totalReplaced}`);
  console.log(`\n请检查修改并测试应用!`);
}

// 运行
main().catch(error => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});
