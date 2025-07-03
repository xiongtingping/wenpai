import { checkGeminiAvailability } from './apiProxy';

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
  source: "ai" | "simulation";
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

// API provider selection - toggle between 'openai' and 'gemini'
// Set default to Gemini since we want to implement Gemini API
let currentApiProvider: 'openai' | 'gemini' = 'gemini';

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
  }
};

/**
 * Get the current API status
 * @returns Current API status
 */
export function getApiStatus(): ApiStatus {
  return {...currentApiStatus};
}

/**
 * Set the current API provider
 * @param provider The API provider to use ('openai' or 'gemini')
 */
export function setApiProvider(provider: 'openai' | 'gemini'): void {
  currentApiProvider = provider;
  console.log(`API provider set to: ${provider}`);
}

/**
 * Get the current API provider
 * @returns Current API provider
 */
export function getApiProvider(): 'openai' | 'gemini' {
  return currentApiProvider;
}

/**
 * Check if the selected API is available
 * Updates the currentApiStatus
 */
export async function checkApiAvailability(): Promise<boolean> {
  // Use the appropriate API check based on provider
  if (currentApiProvider === 'gemini') {
    const startTime = Date.now();
    try {
      console.log('Checking Gemini API availability');
      
      // Use our proxy service to check Gemini API availability
      const proxyResponse = await checkGeminiAvailability();
      
      const responseTime = Date.now() - startTime;
      
      if (proxyResponse.success) {
        const data = proxyResponse.data as { available: boolean };
        currentApiStatus = {
          available: data.available,
          lastChecked: new Date(),
          responseTime
        };
        return data.available;
      } else {
        currentApiStatus = {
          available: false,
          lastChecked: new Date(),
          errorMessage: proxyResponse.error || 'Unknown error checking Gemini API',
          responseTime
        };
        return false;
      }
    } catch (error) {
      currentApiStatus = {
        available: false,
        lastChecked: new Date(),
        errorMessage: (error instanceof Error) ? error.message : 'Unknown error checking API availability',
        responseTime: Date.now() - startTime
      };
      return false;
    }
  } else {
    const startTime = Date.now();
    try {
      // Use our proxy service to check OpenAI API availability
      const response = await fetch('/api/status/openai');
      
      const responseTime = Date.now() - startTime;
      
      // Check if we get a JSON response
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textBody = await response.text();
        console.error('Non-JSON response from OpenAI status check:', textBody.substring(0, 500));
        
        currentApiStatus = {
          available: false,
          lastChecked: new Date(),
          errorMessage: `Unexpected non-JSON response: ${textBody.substring(0, 100)}...`,
          responseTime
        };
        return false;
      }
      
      const data = await response.json();
      
      if (response.ok) {
        currentApiStatus = {
          available: data.available,
          lastChecked: new Date(),
          responseTime
        };
        return data.available;
      } else {
        currentApiStatus = {
          available: false,
          lastChecked: new Date(),
          errorMessage: data.error || `API error: ${response.status}`,
          responseTime
        };
        return false;
      }
    } catch (error) {
      currentApiStatus = {
        available: false,
        lastChecked: new Date(),
        errorMessage: (error instanceof Error) ? error.message : 'Unknown error checking API availability',
        responseTime: Date.now() - startTime
      };
      return false;
    }
  }
}

/**
 * Main function to generate adapted content for different platforms
 * 
 * @param params Parameters for content generation
 * @returns Promise with generated content for each platform and source information
 */
export async function generateAdaptedContent(params: ContentGenerationParams): Promise<Record<string, AIApiResponse>> {
  try {
    // Log which API provider is being used
    console.log(`Using API provider: ${currentApiProvider}`);
    
    // Generate the steps for visualization (currently unused but kept for future UI integration)
    getGenerationSteps(params);
    
    // Process each platform in sequence, calling the selected API for each
    const results: Record<string, AIApiResponse> = {};
    
    for (const platformId of params.targetPlatforms) {
      const useBrandLibrary = (params.platformSettings[`${platformId}-brandLibrary`] as boolean) || false;
      const adaptedContent = await adaptContentForPlatform(params.originalContent, platformId, useBrandLibrary);
      results[platformId] = adaptedContent;
    }
    
    return results;
  } catch (error) {
    console.error('Content generation failed:', error);
    throw error;
  }
}

/**
 * Regenerate content for a single platform
 * 
 * @param params Parameters for content generation
 * @param platformId The specific platform to regenerate
 * @returns Promise with generated content for the specific platform and source information
 */
export async function regeneratePlatformContent(
  params: ContentGenerationParams,
  platformId: string
): Promise<Record<string, AIApiResponse>> {
  try {
    // Create a new params object with just the single platform
    const singlePlatformParams = {
      ...params,
      targetPlatforms: [platformId]
    };
    
    // Log which API provider is being used
    console.log(`Using API provider for regeneration: ${currentApiProvider}`);
    
    // Generate the steps for visualization (currently unused but kept for future UI integration)
    getGenerationSteps(singlePlatformParams);
    
    // Get platform-specific settings
    const useBrandLibrary = (params.platformSettings[`${platformId}-brandLibrary`] as boolean) || false;
    
    // Call the selected AI API to generate the content
    const adaptedContent = await adaptContentForPlatform(params.originalContent, platformId, useBrandLibrary);
    
    return { [platformId]: adaptedContent };
  } catch (error) {
    console.error(`Regeneration for ${platformId} failed:`, error);
    throw error;
  }
}

/**
 * Creates generation steps for visualization
 */
export function getGenerationSteps(params: ContentGenerationParams): PlatformGenerationStatus[] {
  // Generate steps for each platform
  const steps = params.targetPlatforms.map(platformId => {
    const platformStyle = platformStyles[platformId as keyof typeof platformStyles];
    
    return {
      platform: platformId,
      platformName: platformStyle?.name || platformId,
      steps: [
        {
          name: "内容分析",
          description: "分析原始内容的主题、结构和关键点",
          status: "waiting" as const
        },
        {
          name: "平台适配",
          description: `应用${platformStyle?.name || platformId}的内容风格: ${platformStyle?.style || "标准"}`,
          status: "waiting" as const
        },
        {
          name: "格式优化",
          description: "基于平台特性优化排版和呈现方式",
          status: "waiting" as const
        },
        {
          name: "生成内容",
          description: "根据平台特性生成最终内容",
          status: "waiting" as const
        }
      ]
    };
  });
  
  return steps;
}

/**
 * Adapts content specifically for the target platform
 * @param content Original content
 * @param platformId Target platform
 * @param useBrandLibrary Whether to use brand library resources
 * @returns Platform-adapted content with source information
 */
export async function adaptContentForPlatform(
  content: string, 
  platformId: string, 
  useBrandLibrary: boolean = false
): Promise<AIApiResponse> {
  // Get platform style info and prompt
  const platformPrompt = getPlatformPrompt(platformId);
  
  // Log the prompt being used
  console.log(`Using prompt for ${platformId}: ${platformPrompt}`);
  
  try {
    // Create system prompt
    const systemPrompt = `You are an expert content adapter specializing in creating platform-specific 
                         content optimized for different social media platforms. Your task is to adapt 
                         the user's content to the specified platform's style and format.`;
    
    // Create user prompt with platform requirements
    let userPrompt = `Please adapt the following content for the ${platformId} platform.
                     
                     Original content: ${content}
                     
                     Platform requirements: ${platformPrompt}`;
    
    // Add brand guidelines if requested
    if (useBrandLibrary) {
      userPrompt += `\n\nPlease incorporate brand voice and values in the adaptation. 
                    Ensure consistency in tone, terminology, and messaging across all platforms.
                    Maintain professional language standards and avoid public relations risks.`;
    }
    
    // Make the API call to the selected provider with retries, timeouts and error handling
    let result;
    
    if (currentApiProvider === 'gemini') {
      result = await callGeminiAPI(systemPrompt, userPrompt, platformId);
    } else {
      result = await callOpenAIAPI(systemPrompt, userPrompt, platformId);
    }
    
    return result;
  } catch (error) {
    console.error(`Error adapting content for ${platformId}:`, error);
    // Instead of silently falling back to simulation, we propagate the error
    // This will allow the UI to show the error state
    if (error instanceof Error) {
      return {
        content: "",
        source: "simulation",
        error: `API 调用失败: ${error.message}`
      };
    }
    return {
      content: "",
      source: "simulation",
      error: "API 调用失败，请检查网络连接或 API 密钥有效性"
    };
  }
}

/**
 * Make an API call to OpenAI through our backend proxy
 * @param systemPrompt The system prompt
 * @param userPrompt The user prompt
 * @param platformId The platform ID for context (used for fallback)
 * @returns Generated content with source information
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
        
        const response = await fetch('/api/proxy/openai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages,
            model: "gpt-3.5-turbo-0125", 
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
          
          // Fall back to simulation when all retries fail
          return {
            content: generateSimulatedAIResponse(userPrompt, platformId),
            source: "simulation",
            error: `非JSON响应: ${textBody.substring(0, 100)}...`
          };
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
          
          // Fall back to simulation when all retries fail
          return {
            content: generateSimulatedAIResponse(userPrompt, platformId),
            source: "simulation",
            error: errorMessage
          };
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
          source: "ai" // Indicate this content came from the AI
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
      
      // For the last attempt, fall back to simulation
      if (attempt >= MAX_RETRIES) {
        return {
          content: generateSimulatedAIResponse(userPrompt, platformId),
          source: "simulation",
          error: error instanceof Error ? error.message : "API 调用失败"
        };
      }
      
      // Wait before next retry (with exponential backoff)
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt)));
    }
  }
  
  // This should never be reached due to the return in the final attempt, but TypeScript requires it
  return {
    content: generateSimulatedAIResponse(userPrompt, platformId),
    source: "simulation",
    error: "所有 API 重试尝试失败，已使用模拟内容"
  };
}

/**
 * Make an API call to Gemini through the backend proxy
 * @param systemPrompt The system prompt
 * @param userPrompt The user prompt
 * @param platformId The platform ID for context (used for fallback)
 * @returns Generated content with source information
 */
async function callGeminiAPI(
  systemPrompt: string, 
  userPrompt: string, 
  platformId: string
): Promise<AIApiResponse> {
  // Combine system and user prompts for Gemini
  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
  
  // Retry loop implementation
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Gemini API call attempt ${attempt + 1}/${MAX_RETRIES + 1} for ${platformId}`);
      
      try {
        console.log('Sending request to Gemini API via proxy...');
        
        const response = await fetch('/api/proxy/gemini', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: fullPrompt
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
          
          // Fall back to simulation when all retries fail
          return {
            content: generateSimulatedAIResponse(userPrompt, platformId),
            source: "simulation",
            error: `非JSON响应: ${textBody.substring(0, 100)}...`
          };
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
          
          console.error(`Gemini API error after ${attempt + 1} attempts:`, errorMessage);
          
          // Fall back to simulation when all retries fail
          return {
            content: generateSimulatedAIResponse(userPrompt, platformId),
            source: "simulation",
            error: errorMessage
          };
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
        
        // Extract content from Gemini API response format via proxy
        const content = data.data.candidates && 
                        data.data.candidates[0] && 
                        data.data.candidates[0].content && 
                        data.data.candidates[0].content.parts &&
                        data.data.candidates[0].content.parts[0] &&
                        data.data.candidates[0].content.parts[0].text || "";
        
        return {
          content: content,
          source: "ai" // Indicate this content came from the AI
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
      
      // For the last attempt, fall back to simulation
      if (attempt >= MAX_RETRIES) {
        return {
          content: generateSimulatedAIResponse(userPrompt, platformId),
          source: "simulation",
          error: error instanceof Error ? error.message : "API 调用失败"
        };
      }
      
      // Wait before next retry (with exponential backoff)
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt)));
    }
  }
  
  // This should never be reached due to the return in the final attempt, but TypeScript requires it
  return {
    content: generateSimulatedAIResponse(userPrompt, platformId),
    source: "simulation",
    error: "所有 API 重试尝试失败，已使用模拟内容"
  };
}

/**
 * Generate a simulated AI response for testing when API is unavailable
 * This is only for development/testing purposes and should be removed in production
 * @param prompt The user prompt
 * @param platformId The platform ID
 * @returns Simulated AI response
 */
function generateSimulatedAIResponse(prompt: string, platformId: string): string {
  // Extract the original content from the prompt
  const contentMatch = prompt.match(/Original content: ([\s\S]+?)(?=Platform requirements:|$)/);
  const originalContent = contentMatch ? contentMatch[1].trim() : "Sample content";
  
  // Get platform style (currently unused but kept for future enhancement)
  // const platformStyle = platformStyles[platformId as keyof typeof platformStyles];
  
  // Generate platform-specific simulated response
  // NOTE: In production this would be completely replaced by the OpenAI response
  
  let adaptedContent = '';
  const contentLines = originalContent.split('\n');
  const title = contentLines[0] || 'Sample Title';
  const body = contentLines.slice(1).join('\n') || 'Sample content for the body of the post.';
  
  switch (platformId) {
    case 'zhihu': {
      adaptedContent = `# ${title}

## 引言

这是一个值得深入探讨的话题。${body.substring(0, 100)}...

## 背景分析

在探讨这个问题之前，我们需要了解一些基本背景。${body.substring(100, 250) || body}

## 核心观点

根据我的分析，这个问题可以从以下几个方面来看待：

1. ${body.substring(0, 50) || "第一个重要观点..."}
2. ${body.substring(50, 100) || "第二个重要观点..."}
3. ${body.substring(100, 150) || "第三个重要观点..."}

## 数据支持

研究表明，${body.substring(150, 250) || "相关数据显示..."}

## 总结

综合以上分析，${body.substring(0, 100) || "我们可以得出结论..."}

希望这个分析对你有所帮助。如果有问题，欢迎在评论区讨论。`;
      break;
    }
    
    case 'xiaohongshu': {
      adaptedContent = `✨ ${title} ✨

大家好！今天想和大家分享一个超棒的心得！😊

【我的体验】
${body.substring(0, 150) || "我最近的体验真的太棒了..."}

🌟 三个要点：

1️⃣ ${body.substring(0, 50) || "第一个重要发现..."}
2️⃣ ${body.substring(50, 100) || "第二个重要经验..."}
3️⃣ ${body.substring(100, 150) || "第三个必须注意的点..."}

【小贴士】
${body.substring(150, 250) || "这里有一些小技巧分享给大家..."}

大家有没有类似的经历呢？欢迎在评论区留言交流！❤️

#好物分享 #经验心得 #日常生活`;
      break;
    }
    
    case 'wechat': {
      adaptedContent = `# ${title}

> 导读：${body.substring(0, 100) || "本文将为您详细介绍..."}

## 一、核心概念

${body.substring(0, 200) || "这部分内容详细介绍了核心概念..."}

实操要点：掌握这些核心概念，将帮助您更好地理解后续内容。

## 二、详细分析

### 1. 背景了解

${body.substring(200, 400) || "了解背景信息对于全面把握很重要..."}

实操要点：收集相关资料，建立知识框架。

### 2. 方法步骤

${body.substring(400, 600) || "具体的操作步骤包括以下几点..."}

实操要点：按照步骤实践，注意细节。

## 三、案例分享

${body.substring(600, 800) || "以下是几个典型案例..."}

实操要点：从案例中获取灵感，应用到自己的实际情况。

## 总结与展望

${body.substring(0, 100) || "通过本文的介绍，相信您已经对这个话题有了深入的了解..."}

如果您觉得本文有帮助，欢迎点赞、分享给更多需要的朋友！`;
      break;
    }
    
    case 'weibo': {
      adaptedContent = `#${title}# 

刚刚体验了一把，真的太赞了！💕 ${body.substring(0, 50) || "我的真实感受..."}

说实话，一开始我也很犹豫，但是尝试后发现真的很简单！

小技巧分享：
1. ${body.substring(50, 100) || "第一个小技巧..."}
2. ${body.substring(100, 150) || "第二个小技巧..."}

${body.substring(150, 200) || "更多感受分享..."}

大家有什么想法？欢迎评论！ 

#热门话题# #分享心得# #每日一探#`;
      break;
    }
    
    case 'douyin':
    case 'video': {
      adaptedContent = `【${title} - 短视频脚本】

【开场】嗨，大家好！今天给大家带来超实用内容！

【场景1】
【镜头描述】特写镜头，展示主题内容
${body.substring(0, 100) || "开场内容描述..."}
【BGM渐强】

【场景2】
【镜头描述】切换到演示画面
${body.substring(100, 200) || "核心内容讲解..."}
【画面切换】

【场景3 - 爆点】
【镜头描述】特写镜头，展示惊喜效果
${body.substring(200, 300) || "惊喜内容或反转..."}
【BGM高潮】

【结束语】
如果觉得有用，记得点赞关注，我们下期再见！
【字幕提示：点赞+关注】

#创作经验 #短视频技巧 #内容分享`;
      break;
    }
    
    case 'bilibili': {
      adaptedContent = `【${title} - B站视频脚本】

0:00 开场白
大家好啊，欢迎来到我的频道！今天我们来聊一聊${title}!
${body.substring(0, 100) || "开场内容..."}

0:30 内容概述
${body.substring(100, 200) || "本视频将会讲解的主要内容..."}

1:15 核心内容第一部分
${body.substring(200, 300) || "详细讲解第一部分..."}

2:45 核心内容第二部分
${body.substring(300, 400) || "详细讲解第二部分..."}

4:30 重点总结
${body.substring(400, 500) || "内容总结..."}

5:15 结束语
感谢观看，别忘了一键三连，我们下期再见！

P.S. 素材和参考资料已在视频简介放出，欢迎查阅～

#哔哩哔哩 #知识分享 #经验总结`;
      break;
    }
    
    default:
      adaptedContent = `平台 ${platformId} 的内容：\n\n${originalContent}`;
  }
  
  return adaptedContent;
}

/**
 * Get platform-specific prompt for adaptation
 * @param platformId The platform ID
 * @returns Prompt for content adaptation
 */
function getPlatformPrompt(platformId: string): string {
  const platformStyle = platformStyles[platformId as keyof typeof platformStyles];
  return platformStyle?.prompt || "将内容适配为适合该平台的格式和风格。";
}