/**
 * 🌐 自动化国际化替换工具
 * 自动替换ContentAdapterPage中的硬编码中文文本为国际化调用
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 需要替换的文本映射
const textReplacements = [
  // 基础文本
  { original: '"输入原始内容"', key: 'adapt.inputOriginalContent', line: 117 },
  { original: '"剩余使用次数"', key: 'adapt.remainingUsage', line: 118 },
  { original: '"选择目标平台"', key: 'adapt.selectPlatforms', line: 119 },
  { original: '"请输入要适配的原始内容..."', key: 'adapt.contentPlaceholder', line: 120 },
  { original: '"历史记录"', key: 'adapt.history', line: 121 },
  
  // 错误消息
  { original: '"请输入原始内容"', key: 'adapt.errors.noContent', line: 492 },
  { original: '"请选择至少一个目标平台"', key: 'adapt.errors.noPlatforms', line: 493 },
  { original: '"使用次数已用完"', key: 'adapt.errors.usageExhausted', line: 503 },
  { original: '"请升级套餐以继续使用"', key: 'adapt.messages.upgradeRequired', line: 504 },
  { original: '"使用次数较少"', key: 'adapt.errors.usageLow', line: 514 },
  { original: '"无法开始生成"', key: 'adapt.errors.cannotStart', line: 529 },
  { original: '"无法启动自动化"', key: 'adapt.errors.cannotStartAutomation', line: 602 },
  
  // 成功消息
  { original: '"批量生成完成"', key: 'adapt.messages.batchGenerateCompleted', line: 322 },
  { original: '"所有平台内容已生成完毕"', key: 'adapt.messages.allPlatformsGenerated', line: 323 },
  { original: '"请先登录"', key: 'adapt.errors.loginRequired', line: 630 },
  { original: '"登录后才能收藏内容"', key: 'adapt.messages.loginToFavorite', line: 631 },
  { original: '"无法收藏"', key: 'adapt.errors.cannotFavorite', line: 639 },
  { original: '"没有可收藏的内容"', key: 'adapt.errors.noContentToFavorite', line: 640 },
  { original: '"取消收藏"', key: 'adapt.messages.favoriteRemoved', line: 677 },
  { original: '"已取消收藏该内容"', key: 'adapt.messages.favoriteRemovedDescription', line: 678 },
  { original: '"收藏成功 ❤️"', key: 'adapt.messages.favoriteSuccess', line: 743 },
  { original: '"内容已添加到我的资料库 > 收藏夹"', key: 'adapt.messages.favoriteAdded', line: 744 },
  { original: '"收藏失败"', key: 'adapt.errors.favoriteFailed', line: 750 },
  { original: '"收藏操作出现错误，请重试"', key: 'adapt.messages.favoriteError', line: 751 },
  
  // 历史记录相关
  { original: '"已清空"', key: 'adapt.messages.historyCleared', line: 763 },
  { original: '"转发历史已清空"', key: 'adapt.messages.historyDescription', line: 764 },
  
  // 转发相关
  { original: '"内容已复制，正在跳转"', key: 'adapt.messages.contentCopiedAndRedirecting', line: 796 },
  { original: '"内容已复制"', key: 'adapt.messages.contentCopied', line: 801 },
  { original: '"复制失败"', key: 'adapt.errors.copyFailed', line: 807 },
  { original: '"无法复制内容到剪贴板，请手动复制"', key: 'adapt.messages.copyToClipboardFailed', line: 808 },
  { original: '"转发失败"', key: 'adapt.errors.forwardFailed', line: 815 },
  { original: '"一键转发功能出现错误"', key: 'adapt.messages.oneClickForwardFailed', line: 816 },
  
  // 批量转发
  { original: '"没有可转发的内容"', key: 'adapt.errors.noContentToForward', line: 848 },
  { original: '"请先生成内容后再进行批量转发"', key: 'adapt.messages.generateContentFirst', line: 849 },
  { original: '"没有有效的转发平台"', key: 'adapt.errors.noValidPlatforms', line: 902 },
  { original: '"请检查平台配置"', key: 'adapt.messages.checkPlatformConfig', line: 903 },
  { original: '"批量转发工作台已启动"', key: 'adapt.messages.batchForwardStarted', line: 914 },
  
  // 自动化转发
  { original: '"启动自动化转发"', key: 'adapt.messages.startingAutomation', line: 932 },
  { original: '"自动化转发完成"', key: 'adapt.messages.automationCompleted', line: 978 },
  { original: '"自动化转发失败"', key: 'adapt.errors.automationFailed', line: 983 },
  { original: '"所有平台转发都失败了，请检查网络连接和平台状态"', key: 'adapt.messages.automationAllFailed', line: 984 },
  { original: '"已取消自动化转发"', key: 'adapt.messages.automationCancelled', line: 1015 },
  { original: '"自动化转发操作已被用户取消"', key: 'adapt.messages.automationCancelledByUser', line: 1016 },
  
  // 重试相关
  { original: '"重试成功"', key: 'adapt.messages.retrySuccess', line: 1034 },
  { original: '"重试失败"', key: 'adapt.errors.retryFailed', line: 1039 },
  
  // 发布相关
  { original: '"转发成功"', key: 'adapt.messages.forwardSuccess', line: 1084 },
  { original: '"复制内容或打开页面时出现错误"', key: 'adapt.messages.copyContentAndOpenPage', line: 1092 },
  { original: '"批量发布进行中"', key: 'adapt.messages.batchPublishStarted', line: 1131 },
  { original: '"批量发布完成"', key: 'adapt.messages.batchPublishCompleted', line: 1145 },
  { original: '"所有平台的内容都已处理完成"', key: 'adapt.messages.allTasksCompleted', line: 1146 },
  { original: '"批量发布失败"', key: 'adapt.errors.batchPublishFailed', line: 1153 },
  { original: '"处理过程中出现错误"', key: 'adapt.messages.batchPublishProcessError', line: 1154 },
  { original: '"批量发布已取消"', key: 'adapt.messages.batchPublishCancelled', line: 1167 },
  { original: '"批量发布操作已取消"', key: 'adapt.messages.batchPublishOperationCancelled', line: 1168 },
  
  // UI文本
  { original: '"AI内容适配器"', key: 'adapt.title', line: 1180 },
  { original: '"智能适配多平台内容，一键生成符合各平台特色的优质内容"', key: 'adapt.description', line: 1181 },
  { original: '"多平台内容适配引擎运行中..."', key: 'adapt.messages.generationEngineRunning', line: 1296 },
  
  // Dialog相关
  { original: '"一键转发确认"', key: 'adapt.dialogs.oneClickForwardTitle', line: 1358 },
  { original: '"确认转发内容到选择的平台"', key: 'adapt.dialogs.oneClickForwardDescription', line: 1360 },
  { original: '"取消"', key: 'adapt.dialogs.cancel', line: 1376 },
  { original: '"跳转并发布"', key: 'adapt.dialogs.confirmPublish', line: 1379 },
  { original: '"批量发布到平台"', key: 'adapt.dialogs.batchPublishTitle', line: 1392 },
  { original: '"开始批量发布"', key: 'adapt.dialogs.startBatchPublish', line: 1442 },
];

// 特殊处理的模板字符串
const templateReplacements = [
  {
    original: '`剩余${cachedUsageRemaining}次使用机会，建议及时升级`',
    replacement: 't("adapt.messages.usageReminder", { count: cachedUsageRemaining })',
    line: 515
  },
  {
    original: '`准备自动转发到 ${selectedPlatforms.length} 个平台`',
    replacement: 't("adapt.messages.preparingAutomation", { count: selectedPlatforms.length })',
    line: 933
  },
  {
    original: '`成功: ${successCount}个, 失败: ${failureCount}个`',
    replacement: 't("adapt.messages.automationSuccess", { success: successCount, failure: failureCount })',
    line: 979
  },
  {
    original: '`正在处理${getPlatformName(firstTask.platformId, availablePlatforms)}，还剩${batchQueue.length}个平台`',
    replacement: 't("adapt.messages.processingPlatform", { platform: getPlatformName(firstTask.platformId, availablePlatforms), remaining: batchQueue.length })',
    line: 1132
  },
  {
    original: '`将内容发布到${batchSelectedPlatforms.length}个平台`',
    replacement: 't("adapt.dialogs.batchPublishDescription", { count: batchSelectedPlatforms.length })',
    line: 1396
  },
  {
    original: '`正在处理：${getPlatformName(batchCurrent.platformId, availablePlatforms)}`',
    replacement: 't("adapt.dialogs.batchPublishProcessing", { platform: getPlatformName(batchCurrent.platformId, availablePlatforms) })',
    line: 1405
  },
  {
    original: '`还有 ${batchQueue.length} 个平台等待处理`',
    replacement: 't("adapt.messages.platformsRemaining", { count: batchQueue.length })',
    line: 1408
  },
  {
    original: '`将为以下平台复制内容并打开发布页面：`',
    replacement: 't("adapt.messages.willCopyAndOpen")',
    line: 1421
  },
  {
    original: '`已为${validPlatforms.length}个平台准备好内容`',
    replacement: 't("adapt.messages.platformPrepared", { count: validPlatforms.length })',
    line: 915
  }
];

/**
 * 执行文本替换
 */
function performReplacements() {
  const filePath = path.join(__dirname, '../src/features/content-adapter/components/ContentAdapterPage.tsx');
  
  console.log('🔄 开始替换ContentAdapterPage中的硬编码文本...');
  
  let content = fs.readFileSync(filePath, 'utf8');
  let replacementCount = 0;
  
  // 首先确保导入了useTranslation
  if (!content.includes('import { useTranslation }')) {
    content = content.replace(
      "import { useAuth } from '@/hooks/useAuth';",
      "import { useAuth } from '@/hooks/useAuth';\nimport { useTranslation } from 'react-i18next';"
    );
    console.log('✅ 添加了useTranslation导入');
  }
  
  // 移除模拟的useTranslation Hook
  const mockHookRegex = /\/\/ 国际化Hook \(模拟\)[\s\S]*?};/;
  if (mockHookRegex.test(content)) {
    content = content.replace(mockHookRegex, '');
    console.log('✅ 移除了模拟的useTranslation Hook');
  }
  
  // 确保使用真实的useTranslation
  if (!content.includes('const { t } = useTranslation();')) {
    content = content.replace(
      'const { t } = useTranslation();',
      'const { t } = useTranslation();'
    );
  }
  
  // 执行基础文本替换
  textReplacements.forEach(({ original, key }) => {
    const replacement = `t('${key}')`;
    if (content.includes(original)) {
      content = content.replace(new RegExp(original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
      replacementCount++;
      console.log(`✅ 替换: ${original} -> ${replacement}`);
    }
  });
  
  // 执行模板字符串替换
  templateReplacements.forEach(({ original, replacement }) => {
    if (content.includes(original)) {
      content = content.replace(original, replacement);
      replacementCount++;
      console.log(`✅ 模板替换: ${original.substring(0, 50)}... -> ${replacement.substring(0, 50)}...`);
    }
  });
  
  // 保存文件
  fs.writeFileSync(filePath, content);
  
  console.log(`\n🎉 替换完成！共替换了 ${replacementCount} 处文本`);
  console.log(`📁 文件已更新: ${filePath}`);
  
  return replacementCount;
}

/**
 * 验证替换结果
 */
function validateReplacements() {
  const filePath = path.join(__dirname, '../src/features/content-adapter/components/ContentAdapterPage.tsx');
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 检查是否还有硬编码中文
  const chineseRegex = /[\u4e00-\u9fff]+/g;
  const matches = content.match(chineseRegex);
  
  if (matches) {
    console.log(`\n⚠️  仍有 ${matches.length} 处中文文本需要处理:`);
    matches.slice(0, 10).forEach((match, index) => {
      console.log(`  ${index + 1}. "${match}"`);
    });
    if (matches.length > 10) {
      console.log(`  ... 还有 ${matches.length - 10} 处`);
    }
  } else {
    console.log('\n✅ 所有中文文本已成功替换！');
  }
  
  return matches ? matches.length : 0;
}

/**
 * 主函数
 */
function main() {
  console.log('🌐 ContentAdapterPage 国际化自动替换工具');
  console.log('='.repeat(50));
  
  try {
    const replacedCount = performReplacements();
    const remainingCount = validateReplacements();
    
    console.log('\n📊 替换统计:');
    console.log(`  已替换: ${replacedCount} 处`);
    console.log(`  剩余: ${remainingCount} 处`);
    
    if (remainingCount === 0) {
      console.log('\n🎉 ContentAdapterPage 国际化完成！');
    } else {
      console.log('\n🔧 还需要手动处理剩余的文本');
    }
    
  } catch (error) {
    console.error('❌ 替换过程中出现错误:', error);
  }
}

// 运行工具
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };
