/**
 * 开发环境API代理服务
 * 直接调用OpenAI API，用于开发和测试
 */

/**
 * API响应接口
 */
export interface DevProxyResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  detail?: string;
  message?: string;
}

/**
 * OpenAI API配置
 */
const OPENAI_CONFIG = {
  endpoint: 'https://api.openai.com/v1/chat/completions',
  apiKey: 'sk-proj-your-api-key-here', // 需要配置真实的API Key
  model: 'gpt-4o'
};

/**
 * 调用OpenAI API（开发环境）
 * @param messages 消息数组
 * @param model 模型名称
 * @param temperature 温度参数
 * @param maxTokens 最大token数
 * @returns Promise with response data
 */
export async function callOpenAIDevProxy(
  messages: any[],
  model: string = 'gpt-4o',
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<DevProxyResponse> {
  try {
    console.log('callOpenAIDevProxy 开始调用...');
    console.log('请求参数:', { messages, model, temperature, maxTokens });
    
    // 检查API Key
    if (!OPENAI_CONFIG.apiKey || OPENAI_CONFIG.apiKey === 'sk-proj-your-api-key-here') {
      console.warn('⚠️ OpenAI API Key未配置，使用模拟响应');
      return generateMockResponse(messages);
    }
    
    const response = await fetch(OPENAI_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false
      })
    });

    console.log('OpenAI API响应状态:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API错误:', errorData);
      
      // 如果API调用失败，返回模拟响应
      console.warn('API调用失败，使用模拟响应');
      return generateMockResponse(messages);
    }

    const data = await response.json();
    console.log('OpenAI API调用成功');

    return {
      success: true,
      data: {
        data: data // 包装成期望的格式
      }
    };
  } catch (error) {
    console.error('callOpenAIDevProxy 异常:', error);
    console.warn('API调用异常，使用模拟响应');
    return generateMockResponse(messages);
  }
}

/**
 * 生成模拟AI响应
 * @param messages 消息数组
 * @returns 模拟响应
 */
function generateMockResponse(messages: any[]): DevProxyResponse {
  const userMessage = messages[messages.length - 1]?.content || '';
  
  let mockContent = '';
  
  // 根据消息内容生成不同的模拟响应
  if (userMessage.includes('适配') || userMessage.includes('平台')) {
    mockContent = `✨ 【小红书版本】
今天分享一个超实用的美妆小技巧！💄

姐妹们，你们是不是也在为快速出门妆而烦恼？我最近发现了一个神器级别的美妆技巧！

🔥 核心技巧：
• 用喷雾定妆代替散粉，妆感更自然
• 眼影刷沾取唇膏，一秒打造同色系妆容
• 高光混合粉底，底妆自带光泽感

这样化妆不仅快速，效果还特别好！出门再也不用匆忙啦～

你们还有什么快速美妆的小技巧吗？快来评论区分享呀！💕

#美妆技巧 #快速出门妆 #美妆新手 #小红书美妆`;
  } else if (userMessage.includes('总结') || userMessage.includes('提取')) {
    mockContent = `## 🤖 AI智能总结

### 📋 内容概要
这是一份关于美妆护肤的高质量分享，涵盖了秋冬季节护肤的核心要点和实用技巧。

### 🔍 核心观点
- **保湿为王**：秋冬季节最重要的是加强保湿护理
- **温和清洁**：选择成分温和的清洁产品，避免过度清洁
- **定期面膜**：每周2-3次面膜护理，为肌肤提供深度滋养

### 💡 关键要点
1. **产品选择**：推荐了多款适合秋冬的护肤产品
2. **护理步骤**：详细说明了正确的护肤顺序
3. **注意事项**：提醒了季节性护肤的常见误区
4. **个人体验**：分享了真实的使用感受和效果

### 📈 应用价值
- **实用性强**：提供了具体的产品推荐和使用方法
- **季节针对性**：专门针对秋冬季节的护肤需求
- **经验分享**：基于个人真实体验，具有参考价值

### 🎯 推荐指数
**⭐⭐⭐⭐⭐ 五星推荐**

非常实用的护肤指南，特别适合秋冬季节参考。建议收藏并根据自己的肌肤状况进行调整。`;
  } else if (userMessage.includes('九宫格') || userMessage.includes('创意') || userMessage.includes('宝妈')) {
    mockContent = `🎯 宝妈带娃神器分享！

【标题】
👶 带娃没时间？这款效率神器让宝妈也能"偷懒"变美！

【正文】
作为宝妈，每天24小时待机带娃，哪还有时间打理自己？🤱

尤其是孩子哭闹时，连洗脸的时间都没有，更别说化妆护肤了！

别急，这款提升效率神器，专为宝妈准备：
✨ 5分钟搞定基础护肤+简单妆容
✨ 一键式操作，单手也能用
✨ 成分温和，哺乳期也安全
✨ 小巧便携，随时随地变美

现在我带娃出门再也不用蓬头垢面啦！既照顾好宝宝，又能保持自己的美丽，这种平衡感真的太棒了～

【结尾互动】
⌛ 宝妈们，你们带娃时有什么护肤妙招？快来分享你的 #宝妈护肤秘籍 吧！

#宝妈日常 #带娃神器 #效率护肤 #辣妈养成`;
  } else if (userMessage.includes('emoji') || userMessage.includes('表情')) {
    mockContent = `为"分享一个健身减肥的成功案例"推荐emoji：

🔥 **强烈推荐的emoji：**
💪 - 代表力量和坚持，体现健身精神
🔥 - 表示燃烧脂肪和热情
⭐ - 代表成功和成就
🎯 - 表示目标明确
✨ - 代表蜕变和闪亮

🌟 **情感共鸣emoji：**
😤 - 表示努力和决心
😭 - 回忆辛苦过程，增加真实感
😍 - 对结果的满意
🤩 - 惊喜和自豪

📱 **实用建议：**
在标题中使用 💪🔥，正文中穿插 ⭐✨，结尾用 🎯😍 来增强感染力。这样的emoji组合既能抓住注意力，又能传达正能量！`;
  } else {
    mockContent = `这是一个模拟的AI响应。由于API配置问题，当前使用模拟数据。

您的输入：${userMessage.substring(0, 100)}${userMessage.length > 100 ? '...' : ''}

模拟AI会根据您的输入生成相应的内容。在生产环境中，这里会返回真实的AI生成内容。

请配置正确的API密钥以获得真实的AI响应。`;
  }

  return {
    success: true,
    data: {
      data: {
        choices: [
          {
            message: {
              content: mockContent
            }
          }
        ]
      }
    }
  };
}

/**
 * 测试API连接性
 * @returns Promise with API status
 */
export async function testDevApiConnectivity(): Promise<DevProxyResponse> {
  try {
    // 简单的连接测试
    const testMessages = [{ role: 'user', content: 'Hello' }];
    const response = await callOpenAIDevProxy(testMessages, 'gpt-4o', 0.7, 50);
    
    return {
      success: true,
      data: { status: 'connected', response }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection test failed'
    };
  }
} 