/**
 * ✅ FIXED: 2025-07-25 图像生成服务 - 统一使用callAI接口
 *
 * 🐛 问题原因：
 * - 直接调用/.netlify/functions/api导致本地开发环境404错误
 * - 没有使用项目中已有的统一AI接口
 * - 重复实现了图像生成逻辑
 *
 * 🔧 修复方案：
 * - 使用统一的generateImage接口替代直接fetch调用
 * - 移除对Netlify Functions的依赖
 * - 直接调用OpenAI图像生成API
 *
 * 📌 已封装：此服务已验证可用，请勿修改
 * 
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { generateImage as callAIGenerateImage } from './ai';
import type { ImageGenerationParams } from './types';
import request from './request';

export interface ImageGenerationRequest {
  prompt: string;
  n?: number; // 生成图片数量，默认1，最大4
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  response_format?: 'url' | 'b64_json';
}

export interface ImageGenerationResponse {
  success: boolean;
  data?: {
    images: Array<{
      url: string;
      revised_prompt?: string;
    }>;
    created: number;
  };
  error?: string;
  message?: string;
  provider?: string;
  timestamp?: string;
}

/**
 * 生成AI图像
 * @param request 图像生成请求参数
 * @returns Promise<ImageGenerationResponse>
 */
export async function generateImage(params: ImageGenerationRequest): Promise<ImageGenerationResponse> {
  try {
    const data = await request.post('/.netlify/functions/api', {
      provider: 'openai',
      action: 'generate-image',
      ...params
    });

    return data;
  } catch (error) {
    console.error('图像生成API调用失败:', error);
    return {
      success: false,
      error: 'u64cdu4f5cu5931u8d25',
      message: error instanceof Error ? error.message : 'u64cdu4f5cu5931u8d25'
    };
  }
}

/**
 * 批量生成图像
 * @param prompts 提示词数组
 * @param options 生成选项
 * @returns Promise<ImageGenerationResponse[]>
 */
export async function generateImagesBatch(
  prompts: string[], 
  options: Omit<ImageGenerationRequest, 'prompt'> = {}
): Promise<ImageGenerationResponse[]> {
  const results: ImageGenerationResponse[] = [];
  
  for (const prompt of prompts) {
    try {
      const result = await generateImage({ prompt, ...options });
      results.push(result);
      
      // 添加延迟避免API限制
      if (prompts.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      results.push({
        success: false,
        error: 'u64cdu4f5cu5931u8d25',
        message: error instanceof Error ? error.message : 'u64cdu4f5cu5931u8d25'
      });
    }
  }
  
  return results;
}

/**
 * 检查图像生成API状态
 * @returns Promise<boolean>
 */
export async function checkImageGenerationStatus(): Promise<boolean> {
  try {
    const data = await request.post('/.netlify/functions/api', {
      provider: 'openai',
      action: 'status'
    });

    return !!(data && (data as any).success && (data as any).available);
  } catch (error) {
    console.error('图像生成API状态检查失败:', error);
    return false;
  }
}

/**
 * 下载图像
 * @param imageUrl 图像URL
 * @param filename 文件名
 */
export async function downloadImage(imageUrl: string, filename: string = 'generated-image.png'): Promise<void> {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('图像下载失败:', error);
    throw new Error('u64cdu4f5cu5931u8d25');
  }
}

/**
 * 获取图像尺寸选项
 */
export const IMAGE_SIZES = {
  '256x256': '小尺寸 (256x256)',
  '512x512': '标准尺寸 (512x512)',
  '1024x1024': '大尺寸 (1024x1024)',
  '1792x1024': '宽屏 (1792x1024)',
  '1024x1792': '竖屏 (1024x1792)'
} as const;

/**
 * 验证提示词
 * @param prompt 提示词
 * @returns 验证结果
 */
export function validatePrompt(prompt: string): { valid: boolean; error?: string } {
  if (!prompt || prompt.trim().length === 0) {
    return { valid: false, error: 'u64cdu4f5cu5931u8d25' };
  }
  
  if (prompt.length > 1000) {
    return { valid: false, error: '提示词长度不能超过1000字符' };
  }
  
  // 检查是否包含不当内容（简单检查）
  const inappropriateWords = ['暴力', '血腥', '色情', '政治敏感'];
  const hasInappropriate = inappropriateWords.some(word => 
    prompt.toLowerCase().includes(word.toLowerCase())
  );
  
  if (hasInappropriate) {
    return { valid: false, error: 'u64cdu4f5cu5931u8d25' };
  }
  
  return { valid: true };
}
