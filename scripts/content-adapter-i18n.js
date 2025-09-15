#!/usr/bin/env node

/**
 * ContentAdapterPage 国际化自动替换脚本
 * 将硬编码的中文文本替换为 i18n 调用
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../src/features/content-adapter/components/ContentAdapterPage.tsx');

// 文本替换映射
const replacements = [
  // 验证错误
  { from: "'请输入原始内容'", to: "t('adapt.validation.enterContent')" },
  { from: "'请选择至少一个目标平台'", to: "t('adapt.validation.selectPlatforms')" },
  
  // Toast 消息
  { from: "title: '已清空',", to: "title: t('adapt.messages.historyCleared')," },
  { from: "description: '转发历史已清空'", to: "description: t('adapt.messages.historyClearedDesc')" },
  { from: "`内容已复制到剪贴板，正在打开${getPlatformName(platformId, availablePlatforms)}官网`", to: "t('adapt.messages.contentCopiedToClipboard', { platform: getPlatformName(platformId, availablePlatforms) })" },
  { from: "`内容已复制到剪贴板，请手动前往${getPlatformName(platformId, availablePlatforms)}发布`", to: "t('adapt.messages.contentCopiedManual', { platform: getPlatformName(platformId, availablePlatforms) })" },
  { from: "`${platformId} 平台内容已重新生成`", to: "t('adapt.messages.retrySuccess', { platform: platformId })" },
  { from: "`内容已复制，${getPlatformName(pendingPublish.platformId, availablePlatforms)}发布页面已打开`", to: "t('adapt.messages.forwardSuccessDesc', { platform: getPlatformName(pendingPublish.platformId, availablePlatforms) })" },
  
  // 错误消息
  { from: "error instanceof Error ? error.message : '未知错误'", to: "error instanceof Error ? error.message : t('common.unknownError')" },
  
  // 按钮文本
  { from: "<span>历史记录</span>", to: "<span>{t('adapt.buttons.history')}</span>" },
  
  // Dialog 标题和描述
  { from: "<DialogTitle>一键转发确认</DialogTitle>", to: "<DialogTitle>{t('adapt.dialogs.forwardConfirm.title')}</DialogTitle>" },
  { from: "确认转发内容到选择的平台", to: "{t('adapt.dialogs.forwardConfirm.description')}" },
  { from: "内容将被复制到剪贴板，然后跳转到{pendingPublish ? getPlatformName(pendingPublish.platformId, availablePlatforms) : ''}平台发布页面。", to: "{t('adapt.dialogs.forwardConfirm.contentWillBeCopied', { platform: pendingPublish ? getPlatformName(pendingPublish.platformId, availablePlatforms) : '' })}" },
  { from: "💡 提示：跳转后请登录对应平台，然后粘贴内容并发布", to: "{t('adapt.dialogs.forwardConfirm.tip')}" },
  { from: "取消", to: "{t('adapt.buttons.cancel')}" },
  { from: "跳转并发布", to: "{t('adapt.buttons.forwardAndPublish')}" },
  
  // 批量发布 Dialog
  { from: "<DialogTitle>批量发布到平台</DialogTitle>", to: "<DialogTitle>{t('adapt.dialogs.batchPublish.title')}</DialogTitle>" },
  { from: "正在处理：{getPlatformName(batchCurrent.platformId, availablePlatforms)}", to: "{t('adapt.dialogs.batchPublish.processing', { platform: getPlatformName(batchCurrent.platformId, availablePlatforms) })}" },
  { from: "还有 {batchQueue.length} 个平台等待处理", to: "{t('adapt.dialogs.batchPublish.remaining', { count: batchQueue.length })}" },
  { from: "💡 内容已复制到剪贴板，平台页面已打开。请在平台上粘贴并发布内容。", to: "{t('adapt.dialogs.batchPublish.contentCopiedTip')}" },
  { from: "将为以下平台复制内容并打开发布页面：", to: "{t('adapt.dialogs.batchPublish.willCopyAndOpen')}" },
  { from: "💡 系统将依次为每个平台复制内容并打开发布页面，请按提示操作。", to: "{t('adapt.dialogs.batchPublish.systemWillProcess')}" },
  { from: "开始批量发布", to: "{t('adapt.buttons.startBatchPublish')}" },
  
  // 注释
  { from: "// 主流社交媒体平台", to: "// Main social media platforms" },
  { from: "// 视频平台", to: "// Video platforms" },
  { from: "// 资讯平台", to: "// News platforms" },
  { from: "// 国际平台", to: "// International platforms" },
  { from: "// 技术社区", to: "// Tech communities" },
  { from: "// 其他平台", to: "// Other platforms" },
  
  // 控制台日志中的中文
  { from: "'任务完成:'", to: "'Task completed:'" },
  { from: "'加载收藏状态失败:'", to: "'Failed to load favorite states:'" },
  { from: "'收藏操作失败:'", to: "'Favorite operation failed:'" },
  { from: "'一键转发失败:'", to: "'One-click forward failed:'" },
  { from: "'自动化转发失败:'", to: "'Automation forward failed:'" },
  { from: "'批量发布失败:'", to: "'Batch publish failed:'" },
  { from: "'转发失败:'", to: "'Forward failed:'" },
  { from: "'同步使用次数失败:'", to: "'Failed to sync usage stats:'" }
];

function processFile() {
  try {
    console.log('🔄 开始处理 ContentAdapterPage.tsx 国际化...');
    
    let content = fs.readFileSync(filePath, 'utf8');
    let changeCount = 0;
    
    // 应用所有替换
    replacements.forEach((replacement, index) => {
      if (content.includes(replacement.from)) {
        content = content.replace(new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement.to);
        changeCount++;
        console.log(`✅ [${index + 1}/${replacements.length}] 替换: ${replacement.from.substring(0, 50)}...`);
      } else {
        console.log(`⚠️ [${index + 1}/${replacements.length}] 未找到: ${replacement.from.substring(0, 50)}...`);
      }
    });
    
    // 写入文件
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log(`\n🎉 ContentAdapterPage 国际化处理完成！`);
    console.log(`📊 总替换数: ${changeCount}/${replacements.length}`);
    console.log(`📁 文件: ${filePath}`);
    
  } catch (error) {
    console.error('❌ 处理失败:', error);
    process.exit(1);
  }
}

// 执行处理
processFile();
