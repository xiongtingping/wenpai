/**
 * AI内容清理工具
 * 用于清理AI API响应中的多余元数据和格式字符
 */

/**
 * 清理AI生成的内容，移除多余的元数据和格式字符
 * @param content - 原始AI响应内容
 * @returns 清理后的纯净内容
 */
export function cleanAIContent(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  let cleanedContent = content;

  // 1. 移除前后的多余换行符和空白字符
  cleanedContent = cleanedContent.trim();

  // 2. 移除开头和结尾的多个连续换行符（保留内容中的换行）
  cleanedContent = cleanedContent.replace(/^\n+/, '').replace(/\n+$/, '');

  // 3. 标准化换行符（将多个连续换行符压缩为最多两个）
  cleanedContent = cleanedContent.replace(/\n{3,}/g, '\n\n');

  // 4. 移除可能的JSON包装（如果内容被意外包装在JSON字符串中）
  if (cleanedContent.startsWith('"') && cleanedContent.endsWith('"')) {
    try {
      const unescaped = JSON.parse(cleanedContent);
      if (typeof unescaped === 'string') {
        cleanedContent = unescaped;
      }
    } catch {
      // 如果不是有效的JSON字符串，保持原样
    }
  }

  // 5. 移除可能的Markdown代码块包装（如果AI错误地用代码块包装了内容）
  if (cleanedContent.startsWith('```') && cleanedContent.endsWith('```')) {
    cleanedContent = cleanedContent.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '');
  }

  return cleanedContent;
}

/**
 * 从AI API响应中提取纯净内容
 * @param apiResponse - AI API的完整响应对象
 * @returns 提取并清理后的内容
 */
export function extractCleanContent(apiResponse: any): string {
  let content = '';

  // 尝试从不同的响应格式中提取内容
  if (apiResponse?.choices?.[0]?.message?.content) {
    // OpenAI/DeepSeek标准格式
    content = apiResponse.choices[0].message.content;
  } else if (apiResponse?.content) {
    // 简化格式
    content = apiResponse.content;
  } else if (apiResponse?.text) {
    // 文本格式
    content = apiResponse.text;
  } else if (apiResponse?.response) {
    // 响应格式
    content = apiResponse.response;
  } else if (typeof apiResponse === 'string') {
    // 直接字符串
    content = apiResponse;
  } else if (apiResponse?.data) {
    // 嵌套数据格式，递归提取
    return extractCleanContent(apiResponse.data);
  }

  return cleanAIContent(content);
}

/**
 * 验证内容是否为有效的AI生成内容
 * @param content - 要验证的内容
 * @returns 是否为有效内容
 */
export function isValidAIContent(content: string): boolean {
  if (!content || typeof content !== 'string') {
    return false;
  }

  const cleanContent = content.trim();
  
  // 检查是否为空或过短
  if (cleanContent.length < 5) {
    return false;
  }

  // 检查是否为错误消息
  const errorPatterns = [
    /^error/i,
    /^failed/i,
    /^无法/,
    /^抱歉/,
    /^sorry/i,
    /api.*error/i,
    /请提供/,
    /内容不足/
  ];

  return !errorPatterns.some(pattern => pattern.test(cleanContent));
}

/**
 * 格式化AI内容用于显示
 * @param content - 原始内容
 * @param options - 格式化选项
 * @returns 格式化后的内容
 */
export function formatAIContentForDisplay(
  content: string, 
  options: {
    preserveEmojis?: boolean;
    preserveLineBreaks?: boolean;
    maxLength?: number;
  } = {}
): string {
  const {
    preserveEmojis = true,
    preserveLineBreaks = true,
    maxLength
  } = options;

  let formatted = cleanAIContent(content);

  // 如果不保留换行符，将换行符替换为空格
  if (!preserveLineBreaks) {
    formatted = formatted.replace(/\n/g, ' ').replace(/\s+/g, ' ');
  }

  // 如果不保留emoji，移除emoji字符
  if (!preserveEmojis) {
    formatted = formatted.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
  }

  // 如果设置了最大长度，进行截断
  if (maxLength && formatted.length > maxLength) {
    formatted = formatted.substring(0, maxLength - 3) + '...';
  }

  return formatted.trim();
}
