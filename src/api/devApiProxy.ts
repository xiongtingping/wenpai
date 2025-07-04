/**
 * 开发环境API代理
 * 在本地开发时提供模拟的API响应
 */

/**
 * 模拟API响应接口
 */
interface MockApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  isSimulated?: boolean;
}

/**
 * 模拟OpenAI API响应
 */
function mockOpenAIResponse(prompt: string, model: string = 'gpt-4o'): MockApiResponse {
  const responses = {
    'zhihu': `这是为知乎平台优化的内容：

${prompt}

## 知乎风格特点：
- 专业性强，逻辑清晰
- 包含实际案例和数据支撑
- 语言平实易懂，避免过度营销
- 适合知识分享和深度讨论

## 内容建议：
1. 开头要有吸引力，点出核心问题
2. 中间部分要有逻辑层次，分点论述
3. 结尾要有总结和行动建议
4. 适当使用表情符号增加亲和力

这个内容已经针对知乎用户群体进行了优化，符合平台调性。`,

    'weibo': `这是为微博平台优化的内容：

${prompt}

## 微博风格特点：
- 简洁明了，重点突出
- 使用话题标签 #话题#
- 语言活泼，互动性强
- 适合快速传播和讨论

## 内容建议：
1. 开头要抓眼球，用疑问或感叹
2. 中间用短句，便于阅读
3. 结尾要有互动引导
4. 适当使用表情符号和话题标签

#内容创作 #AI助手 #效率提升

这个内容已经针对微博用户群体进行了优化，符合平台调性。`,

    'xiaohongshu': `这是为小红书平台优化的内容：

${prompt}

## 小红书风格特点：
- 个人化表达，真实感受
- 图文并茂，视觉感强
- 语言亲切，像朋友分享
- 适合种草和生活方式分享

## 内容建议：
1. 开头要有个人体验感
2. 中间要有具体的使用感受
3. 结尾要有推荐和总结
4. 使用emoji增加活力感

✨ 个人体验分享 ✨
💡 实用建议
🎯 总结推荐

这个内容已经针对小红书用户群体进行了优化，符合平台调性。`,

    'default': `这是AI生成的内容：

${prompt}

## 内容特点：
- 结构清晰，逻辑性强
- 语言流畅，易于理解
- 信息丰富，实用性强
- 适合多平台使用

## 优化建议：
1. 根据目标平台调整语言风格
2. 考虑受众特点和使用场景
3. 保持内容的原创性和价值
4. 定期更新和优化内容

这个内容已经通过AI进行了优化，可以进一步提升效果。`
  };

  const platform = prompt.includes('知乎') ? 'zhihu' : 
                   prompt.includes('微博') ? 'weibo' : 
                   prompt.includes('小红书') ? 'xiaohongshu' : 'default';

  return {
    success: true,
    data: {
      choices: [
        {
          message: {
            content: responses[platform]
          }
        }
      ],
      model: model
    },
    isSimulated: true
  };
}

/**
 * 模拟DeepSeek API响应
 */
function mockDeepSeekResponse(prompt: string, model: string = 'deepseek-chat'): MockApiResponse {
  return {
    success: true,
    data: {
      choices: [
        {
          message: {
            content: `这是DeepSeek (${model}) 生成的响应：

${prompt}

## DeepSeek特点：
- 中文理解能力强
- 逻辑推理清晰
- 内容生成准确
- 适合技术类内容

这个响应已经针对您的需求进行了优化。`
          }
        }
      ],
      model: model
    },
    isSimulated: true
  };
}

/**
 * 模拟Gemini API响应
 */
function mockGeminiResponse(prompt: string, model: string = 'gemini-pro'): MockApiResponse {
  return {
    success: true,
    data: {
      choices: [
        {
          message: {
            content: `这是Gemini (${model}) 生成的响应：

${prompt}

## Gemini特点：
- 多模态能力强
- 创意内容丰富
- 语言表达自然
- 适合创意类内容

这个响应已经针对您的需求进行了优化。`
          }
        }
      ],
      model: model
    },
    isSimulated: true
  };
}

/**
 * 开发环境API代理
 */
export async function devApiProxy(endpoint: string, data: any): Promise<MockApiResponse> {
  console.log(`开发环境API调用: ${endpoint}`, data);

  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

  try {
    if (endpoint.includes('/api/proxy/openai')) {
      const prompt = data.messages?.[data.messages.length - 1]?.content || data.prompt || '';
      return mockOpenAIResponse(prompt, data.model);
    }

    if (endpoint.includes('/api/proxy/deepseek')) {
      const prompt = data.messages?.[data.messages.length - 1]?.content || data.prompt || '';
      return mockDeepSeekResponse(prompt, data.model);
    }

    if (endpoint.includes('/api/proxy/gemini')) {
      const prompt = data.messages?.[data.messages.length - 1]?.content || data.prompt || '';
      return mockGeminiResponse(prompt, data.model);
    }

    if (endpoint.includes('/api/status/')) {
      return {
        success: true,
        data: {
          available: true,
          responseTime: 200 + Math.random() * 300,
          lastChecked: new Date().toISOString()
        }
      };
    }

    // 默认响应
    return {
      success: true,
      data: {
        message: '开发环境API代理',
        endpoint: endpoint,
        timestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('开发环境API代理错误:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
} 