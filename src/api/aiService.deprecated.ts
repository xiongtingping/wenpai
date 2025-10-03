/**
 * ⚠️ DEPRECATED: 此文件已废弃
 * 
 * 📌 迁移指南:
 * - 请使用 @/api/unifiedAIService 替代此文件
 * - 新代码禁止引用此文件
 * - 旧代码将在3个月后(2025-12-31)删除此文件时报错
 * 
 * 📚 迁移文档: docs/migration/ai-service-deprecation.md
 * 
 * @deprecated 使用 @/api/unifiedAIService 替代
 */

// 保留枚举类型和类型定义,这些会被继续使用
export { AITaskType, PromptType } from './aiService.legacy';

// 所有函数调用转发到新系统
export { callAI } from '@/api/unifiedAIService';

/**
 * @deprecated 使用 unifiedAIService.callAI 替代
 */
export async function callPDFChat(params: any) {
  console.warn('⚠️ callPDFChat已废弃,请使用 unifiedAIService.callAI');
  const { callAI } = await import('@/api/unifiedAIService');
  return callAI(params);
}

/**
 * @deprecated 使用 unifiedAIService.callAI 替代
 */
export async function callContentAdapter(params: any) {
  console.warn('⚠️ callContentAdapter已废弃,请使用 unifiedAIService.callAI');
  const { callAI } = await import('@/api/unifiedAIService');
  return callAI(params);
}

/**
 * @deprecated 使用 unifiedAIService.callAI 替代
 */
export async function callCreativeGeneration(params: any) {
  console.warn('⚠️ callCreativeGeneration已废弃,请使用 unifiedAIService.callAI');
  const { callAI } = await import('@/api/unifiedAIService');
  return callAI(params);
}

/**
 * @deprecated 使用 unifiedAIService.callAI 替代
 */
export async function callEmojiGenerator(params: any) {
  console.warn('⚠️ callEmojiGenerator已废弃,请使用 unifiedAIService.callAI');
  const { callAI } = await import('@/api/unifiedAIService');
  return callAI(params);
}

// ... 其他废弃函数同样处理
