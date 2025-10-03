/**
 * Token估算工具
 * @description 估算文本消耗的Token数量
 *
 * 估算规则:
 * - 中文字符: ~1.5 tokens/字
 * - 英文单词: ~1 token/词
 * - 数字/符号: ~0.5 tokens/字符
 * - 代码: ~1.2 tokens/字符 (考虑特殊符号)
 *
 * 注意: 这只是估算,实际Token数量由AI模型决定
 */

/**
 * 估算文本的Token数量
 */
export function estimateTokens(text: string): number {
  if (!text || text.length === 0) {
    return 0;
  }

  // 统计中文字符
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;

  // 统计英文单词 (连续字母组成的单词)
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;

  // 统计数字
  const numbers = (text.match(/\d+/g) || []).length;

  // 其他字符 (符号、空格等)
  const otherChars = text.length - chineseChars - englishWords - numbers;

  // 计算总Token数
  const estimatedTokens = Math.ceil(
    chineseChars * 1.5 + englishWords * 1.0 + numbers * 0.5 + otherChars * 0.5
  );

  return estimatedTokens;
}

/**
 * 估算代码的Token数量
 */
export function estimateCodeTokens(code: string): number {
  if (!code || code.length === 0) {
    return 0;
  }

  // 代码通常包含更多特殊符号,估算系数更高
  return Math.ceil(code.length * 1.2);
}

/**
 * 估算JSON的Token数量
 */
export function estimateJSONTokens(json: string): number {
  if (!json || json.length === 0) {
    return 0;
  }

  try {
    // 尝试解析JSON
    const obj = JSON.parse(json);

    // 计算键值对数量
    const keyValuePairs = JSON.stringify(obj).match(/:/g)?.length || 0;

    // JSON的Token数通常是字符数的0.8倍 + 键值对数量
    return Math.ceil(json.length * 0.8 + keyValuePairs);
  } catch {
    // 解析失败,按普通文本估算
    return estimateTokens(json);
  }
}

/**
 * 估算Markdown的Token数量
 */
export function estimateMarkdownTokens(markdown: string): number {
  if (!markdown || markdown.length === 0) {
    return 0;
  }

  // 统计代码块
  const codeBlocks = markdown.match(/```[\s\S]*?```/g) || [];
  let codeTokens = 0;

  codeBlocks.forEach(block => {
    const codeContent = block.replace(/```[\w]*\n?/g, '').replace(/```/g, '');
    codeTokens += estimateCodeTokens(codeContent);
  });

  // 移除代码块后的文本
  const textWithoutCode = markdown.replace(/```[\s\S]*?```/g, '');

  // 估算普通文本Token
  const textTokens = estimateTokens(textWithoutCode);

  return codeTokens + textTokens;
}

/**
 * 批量估算Token数量
 */
export function estimateBatchTokens(texts: string[]): {
  total: number;
  individual: number[];
  average: number;
  max: number;
  min: number;
} {
  if (texts.length === 0) {
    return { total: 0, individual: [], average: 0, max: 0, min: 0 };
  }

  const individual = texts.map(text => estimateTokens(text));
  const total = individual.reduce((sum, tokens) => sum + tokens, 0);
  const average = total / texts.length;
  const max = Math.max(...individual);
  const min = Math.min(...individual);

  return { total, individual, average, max, min };
}

/**
 * 估算对话的Token数量 (考虑系统提示和历史消息)
 */
export function estimateConversationTokens(params: {
  systemPrompt?: string;
  userMessage: string;
  historyMessages?: Array<{ role: string; content: string }>;
  maxTokens?: number;
}): {
  inputTokens: number;
  estimatedOutputTokens: number;
  totalTokens: number;
  breakdown: {
    systemPrompt: number;
    userMessage: number;
    history: number;
  };
} {
  const systemPromptTokens = estimateTokens(params.systemPrompt || '');
  const userMessageTokens = estimateTokens(params.userMessage);

  let historyTokens = 0;
  if (params.historyMessages) {
    params.historyMessages.forEach(msg => {
      // 每条消息都有角色标记,额外消耗~4 tokens
      historyTokens += estimateTokens(msg.content) + 4;
    });
  }

  const inputTokens = systemPromptTokens + userMessageTokens + historyTokens;

  // 估算输出Token (默认按maxTokens的80%估算)
  const estimatedOutputTokens = params.maxTokens
    ? Math.ceil(params.maxTokens * 0.8)
    : Math.ceil(inputTokens * 0.5); // 如果没有maxTokens,按输入的50%估算

  return {
    inputTokens,
    estimatedOutputTokens,
    totalTokens: inputTokens + estimatedOutputTokens,
    breakdown: {
      systemPrompt: systemPromptTokens,
      userMessage: userMessageTokens,
      history: historyTokens
    }
  };
}

/**
 * 根据Token数量估算文本长度
 */
export function estimateTextLength(tokens: number): {
  minChars: number;
  maxChars: number;
  averageChars: number;
} {
  // 中文: 1.5 tokens/字 → 1字 = 0.67 tokens → tokens/1.5
  // 英文: 1 token/词, 平均5字母/词 → tokens*5

  // 保守估算 (假设全是中文)
  const minChars = Math.floor(tokens / 1.5);

  // 乐观估算 (假设全是英文)
  const maxChars = Math.floor(tokens * 5);

  // 平均估算 (中英文混合)
  const averageChars = Math.floor(tokens * 2);

  return { minChars, maxChars, averageChars };
}

/**
 * 计算Token成本 (基于定价)
 */
export function calculateTokenCost(
  tokens: number,
  model: string
): {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  currency: string;
} {
  // Token定价表 (USD per 1M tokens)
  const pricing: Record<
    string,
    { input: number; output: number }
  > = {
    'gpt-4': { input: 30, output: 60 },
    'gpt-4-turbo': { input: 10, output: 30 },
    'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
    'claude-3-opus': { input: 15, output: 75 },
    'claude-3-sonnet': { input: 3, output: 15 },
    'claude-3-haiku': { input: 0.25, output: 1.25 }
  };

  const modelPricing = pricing[model] || { input: 1, output: 2 }; // 默认定价

  // 计算成本 (USD)
  const inputCost = (tokens * modelPricing.input) / 1000000;
  const outputCost = (tokens * modelPricing.output) / 1000000;
  const totalCost = inputCost + outputCost;

  return {
    inputCost,
    outputCost,
    totalCost,
    currency: 'USD'
  };
}

/**
 * 验证Token估算的准确性 (与实际值对比)
 */
export function validateEstimation(
  estimatedTokens: number,
  actualTokens: number
): {
  accuracy: number; // 准确率 (0-100)
  error: number; // 误差
  errorPercentage: number; // 误差百分比
  status: 'accurate' | 'acceptable' | 'poor';
} {
  const error = Math.abs(estimatedTokens - actualTokens);
  const errorPercentage = (error / actualTokens) * 100;
  const accuracy = 100 - errorPercentage;

  let status: 'accurate' | 'acceptable' | 'poor';
  if (errorPercentage <= 10) {
    status = 'accurate'; // 误差≤10%
  } else if (errorPercentage <= 25) {
    status = 'acceptable'; // 误差≤25%
  } else {
    status = 'poor'; // 误差>25%
  }

  return {
    accuracy,
    error,
    errorPercentage,
    status
  };
}
