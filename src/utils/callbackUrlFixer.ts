/**
 * 🚨 紧急修复：回调URL清理工具
 * 处理生产环境中出现的多重URL编码问题
 */

import { logger } from '@/utils/logger';

/**
 * 清理和标准化回调URL
 */
export function cleanCallbackUrl(url: string): string {
  try {
    // 🔧 修复多重URL编码问题
    let cleanUrl = url;
    
    // 移除重复的callback路径
    cleanUrl = cleanUrl.replace(/callback.*callback/g, 'callback');
    
    // 移除多余的空格编码
    cleanUrl = cleanUrl.replace(/%20%20/g, '');
    cleanUrl = cleanUrl.replace(/\s+/g, '');
    
    // 标准化域名
    cleanUrl = cleanUrl.replace(/wenpai\.xyz\/callback.*?wenpai\.xyz/g, 'wenpai.xyz');
    cleanUrl = cleanUrl.replace(/www\.wenpai\.xyz\/callback.*?wenpai\.xyz/g, 'www.wenpai.xyz');
    
    // 确保只有一个callback路径
    const parts = cleanUrl.split('callback');
    if (parts.length > 2) {
      cleanUrl = parts[0] + 'callback' + parts[parts.length - 1];
    }
    
    logger.debug('URL清理结果:', { original: url, cleaned: cleanUrl });
    return cleanUrl;
  } catch (e) {
    logger.error('URL清理失败:', e);
    return url;
  }
}

/**
 * 从URL中提取有效的授权码和状态
 */
export function extractCallbackParams(url: string): { code?: string; state?: string; error?: string } {
  try {
    const cleanUrl = cleanCallbackUrl(url);
    const urlObj = new URL(cleanUrl);
    
    return {
      code: urlObj.searchParams.get('code') || undefined,
      state: urlObj.searchParams.get('state') || undefined,
      error: urlObj.searchParams.get('error') || undefined
    };
  } catch (e) {
    // 降级处理：直接从字符串中提取
    const codeMatch = url.match(/[?&]code=([^&]+)/);
    const stateMatch = url.match(/[?&]state=([^&]+)/);
    const errorMatch = url.match(/[?&]error=([^&]+)/);
    
    return {
      code: codeMatch ? decodeURIComponent(codeMatch[1]) : undefined,
      state: stateMatch ? decodeURIComponent(stateMatch[1]) : undefined,
      error: errorMatch ? decodeURIComponent(errorMatch[1]) : undefined
    };
  }
}

/**
 * 检查并修复当前页面的URL（如果是回调页面）
 */
export function fixCurrentCallbackUrl(): boolean {
  try {
    const currentUrl = window.location.href;
    
    if (!currentUrl.includes('callback')) {
      return false;
    }
    
    const cleanUrl = cleanCallbackUrl(currentUrl);
    
    if (cleanUrl !== currentUrl) {
      logger.info('🔧 修复回调URL:', { from: currentUrl, to: cleanUrl });
      window.history.replaceState({}, '', cleanUrl);
      return true;
    }
    
    return false;
  } catch (e) {
    logger.error('修复当前URL失败:', e);
    return false;
  }
}