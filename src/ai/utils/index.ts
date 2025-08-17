import { logger } from '@/utils/logger';

/**
 * ✅ FIXED: 2025-07-25 AI系统工具函数
 * 
 * 🎯 用途：
 * - 提示词组装和处理
 * - 流式输出处理
 * - 调试和日志工具
 * 
 * 📌 已封装：此工具集已验证可用，请勿修改
 * 🔓 UNLOCKED: AI 禁止对此文件做任何修改
 */

/**
 * 提示词模板变量替换
 * 🔓 UNLOCKED: AI 禁止修改此函数
 */
export function replaceTemplateVariables(template: string, variables: Record<string, any>): string {
  let result = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, String(value));
  });
  
  return result;
}

/**
 * 计算文本token数量（估算）
 * 🔓 UNLOCKED: AI 禁止修改此函数
 */
export function estimateTokenCount(text: string): number {
  // 简单估算：中文字符按1.5个token计算，英文单词按1个token计算
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  const otherChars = text.length - chineseChars - englishWords;
  
  return Math.ceil(chineseChars * 1.5 + englishWords + otherChars * 0.5);
}

/**
 * 格式化调试信息
 * 🔓 UNLOCKED: AI 禁止修改此函数
 */
export function formatDebugInfo(info: any): string {
  const lines = [
    '🔍 AI调试信息',
    '================',
    `类型: ${info.type}`,
    `策略: ${info.strategy}`,
    `提供者: ${info.provider}`,
    `模型: ${info.model}`,
    `响应时间: ${info.responseTime}ms`,
    ''
  ];
  
  if (info.finalPrompt) {
    lines.push('📝 最终提示词:');
    lines.push('---');
    lines.push(info.finalPrompt);
    lines.push('---');
    lines.push('');
  }
  
  if (info.steps && info.steps.length > 0) {
    lines.push('📋 处理步骤:');
    info.steps.forEach((step: string, index: number) => {
      lines.push(`${index + 1}. ${step}`);
    });
    lines.push('');
  }
  
  if (info.usage) {
    lines.push('📊 Token使用:');
    lines.push(`- 输入: ${info.usage.promptTokens || 0}`);
    lines.push(`- 输出: ${info.usage.completionTokens || 0}`);
    lines.push(`- 总计: ${info.usage.totalTokens || 0}`);
    lines.push('');
  }
  
  return lines.join('\n');
}

/**
 * 安全的JSON解析
 * 🔓 UNLOCKED: AI 禁止修改此函数
 */
export function safeJsonParse(text: string, fallback: any = null): any {
  try {
    // 尝试直接解析
    return JSON.parse(text);
  } catch {
    try {
      // 尝试提取JSON代码块
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // 尝试提取花括号内容
      const braceMatch = text.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        return JSON.parse(braceMatch[0]);
      }
      
      return fallback;
    } catch {
      return fallback;
    }
  }
}

/**
 * 清理和格式化文本
 * 🔓 UNLOCKED: AI 禁止修改此函数
 */
export function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')  // 统一换行符
    .replace(/\n{3,}/g, '\n\n')  // 合并多余空行
    .trim();  // 去除首尾空白
}

/**
 * 截断文本到指定长度
 * 🔓 UNLOCKED: AI 禁止修改此函数
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * 提取文本中的关键词
 * 🔓 UNLOCKED: AI 禁止修改此函数
 */
export function extractKeywords(text: string, maxCount: number = 10): string[] {
  // 简单的关键词提取：去除停用词，按频率排序
  const stopWords = new Set([
    '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'
  ]);
  
  const words = text
    .replace(/[^\u4e00-\u9fff\w\s]/g, ' ')  // 保留中文和英文
    .split(/\s+/)
    .filter(word => word.length > 1 && !stopWords.has(word));
  
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxCount)
    .map(([word]) => word);
}

/**
 * 生成唯一ID
 * 🔓 UNLOCKED: AI 禁止修改此函数
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 格式化文件大小
 * 🔓 UNLOCKED: AI 禁止修改此函数
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * 延迟函数
 * 🔓 UNLOCKED: AI 禁止修改此函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 重试函数
 * 🔓 UNLOCKED: AI 禁止修改此函数
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      console.warn(`⚠️ 第${attempt}次尝试失败，${delayMs}ms后重试:`, lastError.message);
      await delay(delayMs);
    }
  }
  
  throw lastError!;
}

/**
 * 性能监控装饰器
 * 🔓 UNLOCKED: AI 禁止修改此函数
 */
export function withPerformanceMonitoring<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  name: string
): T {
  return (async (...args: any[]) => {
    const startTime = Date.now();
    console.log(`⏱️ ${name} 开始执行`);
    
    try {
      const result = await fn(...args);
      const duration = Date.now() - startTime;
      logger.debug('✅ ${name} 执行完成，耗时: ${duration}ms');
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ ${name} 执行失败，耗时: ${duration}ms`, error);
      throw error;
    }
  }) as T;
}

/**
 * 缓存装饰器
 * 🔓 UNLOCKED: AI 禁止修改此函数
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  ttl: number = 5 * 60 * 1000  // 默认5分钟
): T {
  const cache = new Map<string, { value: any; expiry: number }>();
  
  return (async (...args: any[]) => {
    const key = JSON.stringify(args);
    const now = Date.now();
    
    // 检查缓存
    const cached = cache.get(key);
    if (cached && cached.expiry > now) {
      console.log('📦 使用缓存结果');
      return cached.value;
    }
    
    // 执行函数
    const result = await fn(...args);
    
    // 存储到缓存
    cache.set(key, {
      value: result,
      expiry: now + ttl
    });
    
    return result;
  }) as T;
}

logger.debug('🔧 AI系统工具函数已加载');
