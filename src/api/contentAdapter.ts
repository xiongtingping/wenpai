/**
 * 内容适配器 - API调用和内容生成
 * 支持OpenAI、DeepSeek、Gemini三种AI提供商
 */

import { devApiProxy } from './devApiProxy';

// 检查是否为开发环境
const isDevelopment = import.meta.env.DEV;

interface ContentGenerationParams {
  originalContent: string;
  targetPlatforms: string[];
  platformSettings: Record<string, unknown>;
}

// Generation step interface
interface GenerationStep {
  name: string;
  description: string;
  status: "waiting" | "processing" | "completed" | "error";
}

// Platform generation status interface
interface PlatformGenerationStatus {
  platform: string;
  platformName: string;
  steps: GenerationStep[];
}

// API response type
export interface AIApiResponse {
  content: string;
  source: "ai";
  error?: string;
}

// API status type for monitoring
export interface ApiStatus {
  available: boolean;
  lastChecked: Date;
  errorMessage?: string;
  responseTime?: number;
}

// API timeout settings (in milliseconds)
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

// API status monitoring
let currentApiStatus: ApiStatus = {
  available: true,
  lastChecked: new Date()
};

// API provider selection - toggle between 'openai', 'gemini', and 'deepseek'
// Set default to OpenAI with gpt-4o model
let currentApiProvider: 'openai' | 'gemini' | 'deepseek' = 'openai';

// Model selection for each provider
let currentModel: string = 'gpt-4o'; // Default model

// Available models for each provider with detailed descriptions
export const availableModels = {
  openai: {
    free: ['gpt-3.5-turbo', 'gpt-3.5-turbo-16k'],
    pro: ['gpt-3.5-turbo', 'gpt-3.5-turbo-16k', 'gpt-4', 'gpt-4o', 'gpt-4o-mini', 'gpt-4.1-mini']
  },
  gemini: {
    free: ['gemini-pro'],
    pro: ['gemini-pro', 'gemini-pro-vision']
  },
  deepseek: {
    free: ['deepseek-v2.5'],
    pro: ['deepseek-v2.5', 'deepseek-v3']
  }
};

// Model descriptions and use cases
export const modelDescriptions = {
  // OpenAI Models
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    description: '快速、经济实惠的通用模型',
    useCases: ['日常对话', '内容创作', '文本总结', '代码生成'],
    strengths: ['响应速度快', '成本低', '稳定性好'],
    bestFor: '适合大多数日常内容生成任务，性价比最高'
  },
  'gpt-3.5-turbo-16k': {
    name: 'GPT-3.5 Turbo 16K',
    description: '支持更长上下文的GPT-3.5版本',
    useCases: ['长文档处理', '复杂对话', '多轮交互', '详细分析'],
    strengths: ['支持长文本', '上下文理解强', '适合复杂任务'],
    bestFor: '需要处理长文档或复杂上下文的内容生成'
  },
  'gpt-4': {
    name: 'GPT-4',
    description: '强大的推理和创意能力',
    useCases: ['创意写作', '复杂分析', '逻辑推理', '高质量内容'],
    strengths: ['推理能力强', '创意丰富', '理解深度高'],
    bestFor: '需要高质量创意内容或复杂逻辑分析的任务'
  },
  'gpt-4o': {
    name: 'GPT-4o（推荐模型）',
    description: '最新最强大的多模态模型，性能卓越',
    useCases: ['多模态内容', '高级创意', '复杂任务', '专业内容', '高质量生成'],
    strengths: ['多模态能力', '最新知识', '最强性能', '理解深度高', '创意丰富'],
    bestFor: '需要最高质量内容或处理多模态信息的专业任务，推荐作为默认选择'
  },
  'gpt-4o-mini': {
    name: 'GPT-4o Mini',
    description: 'GPT-4o的轻量级版本',
    useCases: ['日常创作', '内容优化', '快速生成', '平衡性能'],
    strengths: ['性能优秀', '成本适中', '响应快速'],
    bestFor: '平衡性能与成本的内容生成任务'
  },
  'gpt-4.1-mini': {
    name: 'GPT-4.1 Mini',
    description: 'GPT-4.1的轻量级版本，性能优秀',
    useCases: ['日常创作', '内容优化', '快速生成', '平衡性能'],
    strengths: ['性能优秀', '成本适中', '响应快速'],
    bestFor: '平衡性能与成本的内容生成任务'
  },

  
  // Google Gemini Models
  'gemini-pro': {
    name: 'Gemini Pro',
    description: 'Google强大的对话模型',
    useCases: ['多语言内容', '创意写作', '技术文档', '教育内容'],
    strengths: ['多语言支持', '创意丰富', '知识广泛'],
    bestFor: '需要多语言支持或Google生态系统的内容生成'
  },
  'gemini-pro-vision': {
    name: 'Gemini Pro Vision',
    description: '支持视觉理解的多模态模型',
    useCases: ['图像描述', '视觉内容创作', '图文结合', '视觉分析'],
    strengths: ['视觉理解', '多模态能力', '创意丰富'],
    bestFor: '需要处理图像或视觉元素的内容生成'
  },
  
  // DeepSeek Models
  'deepseek-v2.5': {
    name: 'DeepSeek V2.5',
    description: 'DeepSeek V2.5，适合日常内容生成和对话',
    useCases: ['对话生成', '内容创作', '文本优化', '创意写作'],
    strengths: ['对话自然', '创意丰富', '理解准确'],
    bestFor: '免费用户推荐，适合日常内容生成'
  },
  'deepseek-v3': {
    name: 'DeepSeek V3',
    description: 'DeepSeek V3，最新一代模型，性能更强',
    useCases: ['高质量内容', '复杂分析', '专业内容'],
    strengths: ['性能更强', '理解更深', '输出更优'],
    bestFor: '专业用户推荐，适合高质量内容生成'
  }
};

// Platform style definitions and prompts
export const platformStyles = {
  zhihu: {
    name: "知乎",
    style: "理性分析型",
    description: "注重逻辑分析和专业观点，使用丰富的事实和专业术语。",
    tone: "专业正式",
    uniqueFeatures: ["问答形式", "分段论述", "引用数据支持"],
    prompt: "将以下内容改写为适合知乎平台的分析型文章，要求：明确提出一个问题或观点；结构上包含引言、背景、核心分析、对比、总结五部分；用理性语言表达，适度引用数据或研究支持论点；文风正式，避免口语化表达。"
  },
  douyin: {
    name: "抖音脚本",
    style: "短视频脚本型",
    description: "镜头分镜提示，简短有力的表达，注重视觉冲击和情绪共鸣。",
    tone: "活泼直接",
    uniqueFeatures: ["镜头描述", "快节奏", "吸引眼球的开场"],
    prompt: "请根据内容，编写一段适合抖音的短视频脚本，要求：内容时长控制在60秒内、用分镜头或三段式结构（引子 → 转折 → 反转/爆点）、支持加入字幕提示词，如「BGM渐强」、「画面切换」、适当使用口语、网络流行语，增强传播力。"
  },
  wechat: {
    name: "公众号",
    style: "干货教程型",
    description: "系统化知识输出，结构清晰，内容全面且深入。",
    tone: "专业权威",
    uniqueFeatures: ["清晰分级标题", "详尽内容", "图文结合描述"],
    prompt: "将内容改写为公众号文章，要求：主题聚焦、信息密度高，避免空洞陈述、使用结构清晰的小标题（如：一、二、三）、每一段落最好以行动指引/实操技巧收尾、最后总结整体框架并给予行动建议。"
  },
  weibo: {
    name: "微博",
    style: "情绪共鸣型",
    description: "简短有力，情感丰富，使用大量感叹词和流行语。",
    tone: "轻松随意",
    uniqueFeatures: ["话题标签", "情感表达", "互动性强"],
    prompt: "将内容改写成微博格式，以第一人称叙述，营造代入感、语言富有情绪表达和生活细节，引发共鸣、可加入emoji、段落断句、感叹号等增强可读性、最后引导用户评论或点赞。"
  },
  video: {
    name: "视频号",
    style: "短视频脚本型",
    description: "类似抖音但更侧重叙事和内容深度，适合稍长视频。",
    tone: "生动叙事",
    uniqueFeatures: ["时间轴提示", "叙事结构", "互动引导"],
    prompt: "请根据内容，编写一段适合短视频的脚本，要求：内容时长控制在60秒内、用分镜头或三段式结构（引子 → 转折 → 反转/爆点）、支持加入字幕提示词，如「BGM渐强」、「画面切换」、适当使用口语、网络流行语，增强传播力。"
  },
  bilibili: {
    name: "B站",
    style: "教程+故事混合型",
    description: "兼具专业性和趣味性，适合知识分享和娱乐内容。",
    tone: "轻松专业",
    uniqueFeatures: ["分P描述", "时间节点", "二次元文化元素"],
    prompt: "请根据内容，编写一段适合B站的短视频脚本，要求：内容时长控制在60秒内、用分镜头或三段式结构（引子 → 转折 → 反转/爆点）、支持加入字幕提示词，如「BGM渐强」、「画面切换」、适当使用口语、网络流行语，增强传播力。"
  },
  xiaohongshu: {
    name: "小红书",
    style: "情绪共鸣+干货混合型",
    description: "视觉优先，亲切随意，注重个人体验和实用建议。",
    tone: "亲密随意",
    uniqueFeatures: ["emoji使用", "清单格式", "个人化表达"],
    prompt: "将内容改写成小红书格式，以第一人称叙述，营造代入感、语言富有情绪表达和生活细节，引发共鸣、可加入emoji、段落断句、感叹号等增强可读性、最后引导用户评论或点赞。"
  },
  twitter: {
    name: "X（推特）",
    style: "简洁直接型",
    description: "简短精炼，直接表达观点，支持多语言。",
    tone: "简洁直接",
    uniqueFeatures: ["字符限制", "话题标签", "国际化"],
    prompt: "将内容改写为适合X（推特）的推文，要求：内容简洁直接，符合280字符限制、使用相关话题标签（#hashtag）、语言国际化，适合全球用户、表达观点明确，引发讨论和转发。"
  }
};

/**
 * 获取API状态
 */
export function getApiStatus(): ApiStatus {
  return currentApiStatus;
}

/**
 * 设置API提供商
 */
export function setApiProvider(provider: 'openai' | 'gemini' | 'deepseek'): void {
  currentApiProvider = provider;
  console.log(`API提供商已切换到: ${provider}`);
}

/**
 * 获取当前API提供商
 */
export function getApiProvider(): 'openai' | 'gemini' | 'deepseek' {
  return currentApiProvider;
}

/**
 * 设置模型
 */
export function setModel(model: string): void {
  currentModel = model;
  console.log(`模型已切换到: ${model}`);
}

/**
 * 获取当前模型
 */
export function getModel(): string {
  return currentModel;
}

/**
 * 获取可用模型列表
 */
export function getAvailableModels(userPlan: 'free' | 'pro' = 'free'): string[] {
  const provider = getApiProvider();
  const models = availableModels[provider];
  return models ? models[userPlan] || models.free : [];
}

/**
 * 检查模型是否可用
 */
export function isModelAvailable(model: string, userPlan: 'free' | 'pro' = 'free'): boolean {
  const available = getAvailableModels(userPlan);
  return available.includes(model);
}

/**
 * 检查API可用性
 */
export async function checkApiAvailability(): Promise<boolean> {
  try {
    const provider = getApiProvider();
    const response = await fetch(`/api/status/${provider}`);
    
    if (!response.ok) {
      throw new Error(`API状态检查失败: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      currentApiStatus = {
        available: false,
        lastChecked: new Date(),
        errorMessage: data.error || 'API不可用'
      };
      return false;
    }
    
    currentApiStatus = {
      available: data.available,
      lastChecked: new Date(),
      responseTime: data.responseTime
    };
    
    return data.available;
  } catch (error) {
    console.error('API可用性检查失败:', error);
    currentApiStatus = {
      available: false,
      lastChecked: new Date(),
      errorMessage: error instanceof Error ? error.message : '未知错误'
    };
    return false;
  }
}

/**
 * 生成适配内容
 */
export async function generateAdaptedContent(params: ContentGenerationParams): Promise<Record<string, AIApiResponse>> {
  const results: Record<string, AIApiResponse> = {};
  
  for (const platformId of params.targetPlatforms) {
    try {
      const result = await adaptContentForPlatform(
        params.originalContent,
        platformId
      );
      results[platformId] = result;
    } catch (error) {
      console.error(`生成${platformId}平台内容失败:`, error);
      throw error;
    }
  }
  
  return results;
}

/**
 * 重新生成特定平台内容
 */
export async function regeneratePlatformContent(
  params: ContentGenerationParams,
  platformId: string
): Promise<Record<string, AIApiResponse>> {
  try {
    const result = await adaptContentForPlatform(
      params.originalContent,
      platformId
    );
    return { [platformId]: result };
  } catch (error) {
    console.error(`重新生成${platformId}平台内容失败:`, error);
    throw error;
  }
}

/**
 * 获取生成步骤
 */
export function getGenerationSteps(params: ContentGenerationParams): PlatformGenerationStatus[] {
  return params.targetPlatforms.map(platformId => ({
    platform: platformId,
    platformName: platformStyles[platformId as keyof typeof platformStyles]?.name || platformId,
    steps: [
      { name: '分析内容', description: '分析原始内容...', status: 'waiting' },
      { name: '提取信息', description: '提取核心信息...', status: 'waiting' },
      { name: '平台适配', description: '进行平台适配...', status: 'waiting' },
      { name: '优化输出', description: '优化输出结果...', status: 'waiting' }
    ]
  }));
}

/**
 * 为特定平台适配内容
 */
export async function adaptContentForPlatform(
  content: string, 
  platformId: string
): Promise<AIApiResponse> {
  try {
    const systemPrompt = getPlatformPrompt(platformId);
    const userPrompt = content;
    
    let result: AIApiResponse;
    
    if (currentApiProvider === 'gemini') {
      result = await callGeminiAPI(systemPrompt, userPrompt, platformId);
    } else if (currentApiProvider === 'deepseek') {
      result = await callDeepSeekAPI(systemPrompt, userPrompt, platformId);
    } else {
      result = await callOpenAIAPI(systemPrompt, userPrompt, platformId);
    }
    
    return result;
  } catch (error) {
    console.error(`Error adapting content for ${platformId}:`, error);
    throw error;
  }
}

/**
 * 调用OpenAI API
 */
async function callOpenAIAPI(
  systemPrompt: string, 
  userPrompt: string, 
  platformId: string
): Promise<AIApiResponse> {
  const messages = [
    {
      role: "system",
      content: systemPrompt
    },
    {
      role: "user",
      content: userPrompt
    }
  ];
  
  // Retry loop implementation
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`API call attempt ${attempt + 1}/${MAX_RETRIES + 1} for ${platformId}`);
      
      try {
        console.log('Sending request to OpenAI API via proxy...');
        
        // 在开发环境中使用模拟API
        if (isDevelopment) {
          console.log('使用开发环境模拟API');
          const mockResponse = await devApiProxy('/api/proxy/openai', {
            messages,
            model: currentModel, 
            temperature: 0.7
          });
          
          if (!mockResponse.success) {
            throw new Error(mockResponse.error || '模拟API调用失败');
          }
          
          return {
            content: mockResponse.data.choices[0].message.content,
            source: "ai"
          };
        }
        
        // 生产环境使用真实API
        const response = await fetch('/api/proxy/openai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-plan': 'pro' // 暂时设置为专业版，后续可以从用户状态获取
          },
          body: JSON.stringify({
            messages,
            model: currentModel, 
            temperature: 0.7
          })
        });
        
        console.log(`API response status: ${response.status}`);
        
        // Check if we have a JSON response
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const textBody = await response.text();
          console.error('Non-JSON response from OpenAI API:', textBody.substring(0, 500));
          
          // Update API status
          currentApiStatus = {
            available: false,
            lastChecked: new Date(),
            errorMessage: `Unexpected non-JSON response: ${textBody.substring(0, 100)}...`
          };
          
          if (attempt < MAX_RETRIES) {
            console.log(`Will retry after error: Non-JSON response`);
            // Wait before retrying (with exponential backoff)
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt)));
            continue; // Try again
          }
          
          // All retries failed
          throw new Error(`非JSON响应: ${textBody.substring(0, 100)}...`);
        }
        
        // Now safe to parse JSON
        const data = await response.json();
        
        // Handle non-200 responses
        if (!response.ok) {
          // Get response body for more error details
          console.error('Error response body:', JSON.stringify(data));
          
          const errorMessage = data.error || `API error: ${response.status}`;
          
          // Update API status
          currentApiStatus = {
            available: false,
            lastChecked: new Date(),
            errorMessage: errorMessage
          };
          
          if (attempt < MAX_RETRIES) {
            console.log(`Will retry after error: ${errorMessage}`);
            // Wait before retrying (with exponential backoff)
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt)));
            continue; // Try again
          }
          
          console.error(`API error after ${attempt + 1} attempts:`, errorMessage);
          
          // All retries failed
          throw new Error(errorMessage);
        }
        
        // Update API status to available
        currentApiStatus = {
          available: true,
          lastChecked: new Date()
        };
        
        // Process successful response
        console.log('Processing successful API response');
        
        if (!data.success) {
          throw new Error(data.error || 'API proxy returned an unsuccessful response');
        }
        
        return {
          content: data.data.choices[0].message.content,
          source: "ai"
        };
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        
        // Re-throw other fetch errors
        throw fetchError;
      }
    } catch (error) {
      console.error(`API call error on attempt ${attempt + 1}:`, error);
      
      // Update API status
      currentApiStatus = {
        available: false,
        lastChecked: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
      
      // For the last attempt, throw the error
      if (attempt >= MAX_RETRIES) {
        throw error;
      }
      
      // Wait before next retry (with exponential backoff)
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt)));
    }
  }
  
  // This should never be reached due to the throw in the final attempt, but TypeScript requires it
  throw new Error("所有 API 重试尝试失败");
}

/**
 * 调用DeepSeek API
 */
async function callDeepSeekAPI(
  systemPrompt: string, 
  userPrompt: string, 
  platformId: string
): Promise<AIApiResponse> {
  const messages = [
    {
      role: "system",
      content: systemPrompt
    },
    {
      role: "user",
      content: userPrompt
    }
  ];
  
  // Retry loop implementation
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`DeepSeek API call attempt ${attempt + 1}/${MAX_RETRIES + 1} for ${platformId}`);
      
      try {
        console.log('Sending request to DeepSeek API via proxy...');
        
        // 在开发环境中使用模拟API
        if (isDevelopment) {
          console.log('使用开发环境模拟API');
          const mockResponse = await devApiProxy('/api/proxy/deepseek', {
            messages,
            model: currentModel, 
            temperature: 0.7
          });
          
          if (!mockResponse.success) {
            throw new Error(mockResponse.error || '模拟API调用失败');
          }
          
          return {
            content: mockResponse.data.choices[0].message.content,
            source: "ai"
          };
        }
        
        // 生产环境使用真实API
        const response = await fetch('/api/proxy/deepseek', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages,
            model: currentModel, 
            temperature: 0.7
          })
        });
        
        console.log(`DeepSeek API response status: ${response.status}`);
        
        // Check if we have a JSON response
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const textBody = await response.text();
          console.error('Non-JSON response from DeepSeek API:', textBody.substring(0, 500));
          
          // Update API status
          currentApiStatus = {
            available: false,
            lastChecked: new Date(),
            errorMessage: `Unexpected non-JSON response: ${textBody.substring(0, 100)}...`
          };
          
          if (attempt < MAX_RETRIES) {
            console.log(`Will retry after error: Non-JSON response`);
            // Wait before retrying (with exponential backoff)
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt)));
            continue; // Try again
          }
          
          // All retries failed
          throw new Error(`非JSON响应: ${textBody.substring(0, 100)}...`);
        }
        
        // Now safe to parse JSON
        const data = await response.json();
        
        // Handle non-200 responses
        if (!response.ok) {
          // Get response body for more error details
          console.error('Error response body:', JSON.stringify(data));
          
          const errorMessage = data.error || `API error: ${response.status}`;
          
          // Update API status
          currentApiStatus = {
            available: false,
            lastChecked: new Date(),
            errorMessage: errorMessage
          };
          
          if (attempt < MAX_RETRIES) {
            console.log(`Will retry after error: ${errorMessage}`);
            // Wait before retrying (with exponential backoff)
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt)));
            continue; // Try again
          }
          
          console.error(`API error after ${attempt + 1} attempts:`, errorMessage);
          
          // All retries failed
          throw new Error(errorMessage);
        }
        
        // Update API status to available
        currentApiStatus = {
          available: true,
          lastChecked: new Date()
        };
        
        // Process successful response
        console.log('Processing successful DeepSeek API response');
        
        if (!data.success) {
          throw new Error(data.error || 'API proxy returned an unsuccessful response');
        }
        
        return {
          content: data.data.choices[0].message.content,
          source: "ai"
        };
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        
        // Re-throw other fetch errors
        throw fetchError;
      }
    } catch (error) {
      console.error(`DeepSeek API call error on attempt ${attempt + 1}:`, error);
      
      // Update API status
      currentApiStatus = {
        available: false,
        lastChecked: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
      
      // For the last attempt, throw the error
      if (attempt >= MAX_RETRIES) {
        throw error;
      }
      
      // Wait before next retry (with exponential backoff)
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt)));
    }
  }
  
  // This should never be reached due to the throw in the final attempt, but TypeScript requires it
  throw new Error("所有 DeepSeek API 重试尝试失败");
}

/**
 * 调用Gemini API
 */
async function callGeminiAPI(
  systemPrompt: string, 
  userPrompt: string, 
  platformId: string
): Promise<AIApiResponse> {
  const messages = [
    {
      role: "system",
      content: systemPrompt
    },
    {
      role: "user",
      content: userPrompt
    }
  ];
  
  // Retry loop implementation
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Gemini API call attempt ${attempt + 1}/${MAX_RETRIES + 1} for ${platformId}`);
      
      try {
        console.log('Sending request to Gemini API via proxy...');
        
        // 在开发环境中使用模拟API
        if (isDevelopment) {
          console.log('使用开发环境模拟API');
          const mockResponse = await devApiProxy('/api/proxy/gemini', {
            messages,
            model: currentModel, 
            temperature: 0.7
          });
          
          if (!mockResponse.success) {
            throw new Error(mockResponse.error || '模拟API调用失败');
          }
          
          return {
            content: mockResponse.data.choices[0].message.content,
            source: "ai"
          };
        }
        
        // 生产环境使用真实API
        const response = await fetch('/api/proxy/gemini', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages,
            model: currentModel, 
            temperature: 0.7
          })
        });
        
        console.log(`Gemini API response status: ${response.status}`);
        
        // Check if we have a JSON response
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const textBody = await response.text();
          console.error('Non-JSON response from Gemini API:', textBody.substring(0, 500));
          
          // Update API status
          currentApiStatus = {
            available: false,
            lastChecked: new Date(),
            errorMessage: `Unexpected non-JSON response: ${textBody.substring(0, 100)}...`
          };
          
          if (attempt < MAX_RETRIES) {
            console.log(`Will retry after error: Non-JSON response`);
            // Wait before retrying (with exponential backoff)
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt)));
            continue; // Try again
          }
          
          // All retries failed
          throw new Error(`非JSON响应: ${textBody.substring(0, 100)}...`);
        }
        
        // Now safe to parse JSON
        const data = await response.json();
        
        // Handle non-200 responses
        if (!response.ok) {
          // Get response body for more error details
          console.error('Error response body:', JSON.stringify(data));
          
          const errorMessage = data.error || `API error: ${response.status}`;
          
          // Update API status
          currentApiStatus = {
            available: false,
            lastChecked: new Date(),
            errorMessage: errorMessage
          };
          
          if (attempt < MAX_RETRIES) {
            console.log(`Will retry after error: ${errorMessage}`);
            // Wait before retrying (with exponential backoff)
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt)));
            continue; // Try again
          }
          
          console.error(`API error after ${attempt + 1} attempts:`, errorMessage);
          
          // All retries failed
          throw new Error(errorMessage);
        }
        
        // Update API status to available
        currentApiStatus = {
          available: true,
          lastChecked: new Date()
        };
        
        // Process successful response
        console.log('Processing successful Gemini API response');
        
        if (!data.success) {
          throw new Error(data.error || 'API proxy returned an unsuccessful response');
        }
        
        const content = data.data.choices[0].message.content;
        if (!content) {
          throw new Error('Gemini API返回空内容');
        }
        
        return {
          content: content,
          source: "ai"
        };
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        
        // Re-throw other fetch errors
        throw fetchError;
      }
    } catch (error) {
      console.error(`Gemini API call error on attempt ${attempt + 1}:`, error);
      
      // Update API status
      currentApiStatus = {
        available: false,
        lastChecked: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
      
      // For the last attempt, throw the error
      if (attempt >= MAX_RETRIES) {
        throw error;
      }
      
      // Wait before next retry (with exponential backoff)
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt)));
    }
  }
  
  // This should never be reached due to the throw in the final attempt, but TypeScript requires it
  throw new Error("所有 API 重试尝试失败");
}

/**
 * 获取平台提示词
 */
function getPlatformPrompt(platformId: string): string {
  const platformStyle = platformStyles[platformId as keyof typeof platformStyles];
  if (!platformStyle) {
    return `请将以下内容适配到${platformId}平台：`;
  }
  
  return platformStyle.prompt;
}