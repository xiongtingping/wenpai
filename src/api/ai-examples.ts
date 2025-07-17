/**
 * AI API 使用示例
 * 
 * 本文件展示了如何在项目中使用统一的 AI API 调用函数。
 * 所有示例都使用 callAI() 函数，确保项目中的 AI 调用统一管理。
 */

import { callAI, callAIBatch, callAIWithRetry, checkAIStatus, estimateAICost } from './ai';

/**
 * 基础AI调用示例
 */
export async function basicAIExample() {
  const result = await callAI({
    prompt: "请帮我写一个React函数组件，用于显示用户信息",
    model: "gpt-4",
    maxTokens: 500
  });

  if (result.success) {
    console.log('AI响应:', result.content);
    console.log('响应时间:', result.responseTime + 'ms');
    console.log('Token使用:', result.usage);
  } else {
    console.error('AI调用失败:', result.error);
  }
}

/**
 * 带系统提示的AI调用示例
 */
export async function systemPromptExample() {
  const result = await callAI({
    prompt: "分析这段代码的性能问题：\n```javascript\nfor (let i = 0; i < array.length; i++) {\n  console.log(array[i]);\n}\n```",
    systemPrompt: "你是一个专业的代码审查专家，擅长发现性能问题和优化建议。请用中文回答。",
    model: "gpt-4",
    temperature: 0.3
  });

  return result;
}

/**
 * 流式AI调用示例
 */
export async function streamingAIExample() {
  const result = await callAI({
    prompt: "请详细解释React Hooks的工作原理",
    model: "gpt-4",
    stream: true,
    maxTokens: 1000
  });

  return result;
}

/**
 * 批量AI调用示例
 */
export async function batchAIExample() {
  const prompts = [
    "写一个JavaScript函数来反转字符串",
    "写一个CSS样式来创建渐变背景",
    "写一个TypeScript接口定义用户对象"
  ];

  const results = await callAIBatch(prompts, {
    model: "gpt-3.5-turbo",
    maxTokens: 300
  });

  return results;
}

/**
 * 带重试的AI调用示例
 */
export async function retryAIExample() {
  const result = await callAIWithRetry({
    prompt: "生成一个复杂的算法实现",
    model: "gpt-4",
    maxTokens: 800
  }, 3);

  return result;
}

/**
 * 内容生成示例
 */
export async function contentGenerationExample() {
  // 生成博客文章
  const blogResult = await callAI({
    prompt: "写一篇关于React 18新特性的技术博客文章",
    systemPrompt: "你是一个技术博主，擅长写深入浅出的技术文章。文章要有结构，包含标题、小标题和代码示例。",
    model: "gpt-4",
    maxTokens: 1500
  });

  // 生成代码注释
  const commentResult = await callAI({
    prompt: "为这个函数生成详细的JSDoc注释：\nfunction calculateTotal(items, taxRate) {\n  return items.reduce((sum, item) => sum + item.price, 0) * (1 + taxRate);\n}",
    systemPrompt: "你是一个代码文档专家，生成清晰、完整的JSDoc注释。",
    model: "gpt-3.5-turbo",
    maxTokens: 200
  });

  return { blogResult, commentResult };
}

/**
 * 代码审查示例
 */
export async function codeReviewExample(code: string) {
  const result = await callAI({
    prompt: `请审查以下代码，指出潜在的问题和改进建议：\n\`\`\`typescript\n${code}\n\`\`\``,
    systemPrompt: "你是一个资深的代码审查专家，请从安全性、性能、可读性、最佳实践等方面进行分析。",
    model: "gpt-4",
    temperature: 0.2
  });

  return result;
}

/**
 * 错误处理示例
 */
export async function errorHandlingExample() {
  try {
    const result = await callAI({
      prompt: "生成一些测试数据",
      model: "gpt-4"
    });

    if (!result.success) {
      console.error('AI调用失败:', result.error);
      // 可以在这里实现降级逻辑
      return {
        content: "由于AI服务暂时不可用，使用默认响应",
        success: false,
        fallback: true
      };
    }

    return result;
  } catch (error) {
    console.error('调用AI时发生异常:', error);
    throw error;
  }
}

/**
 * 成本估算示例
 */
export function costEstimationExample() {
  const prompt = "请详细解释React的虚拟DOM机制，包括其工作原理、优势和使用场景。";
  
  const gpt4Cost = estimateAICost(prompt, "gpt-4");
  const gpt35Cost = estimateAICost(prompt, "gpt-3.5-turbo");
  const geminiCost = estimateAICost(prompt, "gemini-pro");

  console.log('成本估算:');
  console.log(`GPT-4: $${gpt4Cost.toFixed(4)}`);
  console.log(`GPT-3.5: $${gpt35Cost.toFixed(4)}`);
  console.log(`Gemini: $${geminiCost.toFixed(4)}`);

  return { gpt4Cost, gpt35Cost, geminiCost };
}

/**
 * 服务状态检查示例
 */
export async function serviceStatusExample() {
  const status = await checkAIStatus();
  
  console.log('AI服务状态:', status);
  
  if (!status.openai) {
    console.warn('OpenAI服务不可用，可能需要检查API密钥配置');
  }
  
  return status;
}

/**
 * 用户权限控制示例
 */
export async function userPermissionExample(userId: string, userPrompt: string) {
  // 检查用户是否有权限使用AI服务
  const hasPermission = true; // 这里应该从用户权限系统获取
  
  if (!hasPermission) {
    return {
      content: "您没有权限使用AI服务，请升级账户或联系管理员。",
      success: false,
      error: "权限不足"
    };
  }

  const result = await callAI({
    prompt: userPrompt,
    model: "gpt-4",
    userId: userId, // 传递用户ID用于日志记录和计费
    maxTokens: 1000
  });

  return result;
}

/**
 * 多模型对比示例
 */
export async function modelComparisonExample(prompt: string) {
  const models = ["gpt-4", "gpt-3.5-turbo", "gemini-pro"] as const;
  const results: Record<string, any> = {};

  for (const model of models) {
    try {
      const result = await callAI({
        prompt,
        model,
        maxTokens: 500
      });
      
      results[model] = {
        content: result.content,
        responseTime: result.responseTime,
        cost: estimateAICost(prompt, model),
        success: result.success
      };
    } catch (error) {
      results[model] = {
        error: error instanceof Error ? error.message : '未知错误',
        success: false
      };
    }
  }

  return results;
} 