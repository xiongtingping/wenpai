/**
 * 图像生成服务
 * 调用Netlify函数API进行AI图像生成
 */

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
export async function generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
  try {
    const response = await fetch('/.netlify/functions/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'openai',
        action: 'generate-image',
        ...request
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('图像生成API调用失败:', error);
    return {
      success: false,
      error: '图像生成失败',
      message: error instanceof Error ? error.message : '未知错误'
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
        error: '批量生成失败',
        message: error instanceof Error ? error.message : '未知错误'
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
    const response = await fetch('/.netlify/functions/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'openai',
        action: 'status'
      })
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.success && data.available;
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
    throw new Error('图像下载失败');
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
    return { valid: false, error: '提示词不能为空' };
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
    return { valid: false, error: '提示词包含不当内容' };
  }
  
  return { valid: true };
} 