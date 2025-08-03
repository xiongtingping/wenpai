/**
 * AI连接测试脚本
 * 测试智能标题生成功能的AI API连接
 */

const testAIConnection = async () => {
  console.log('🧪 开始AI连接测试...');
  
  try {
    // 测试DeepSeek API连接
    console.log('🔍 测试DeepSeek API连接...');
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-56c02f3de6fe4a04a346cc14f3c5d310'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: '请生成一个关于AI工具的标题，要求：1. 吸引眼球 2. 不超过20字 3. 符合小红书风格'
          }
        ],
        max_tokens: 100,
        temperature: 0.8
      })
    });

    if (deepseekResponse.ok) {
      const data = await deepseekResponse.json();
      console.log('✅ DeepSeek API连接成功');
      console.log('📝 生成的标题:', data.choices?.[0]?.message?.content || '无内容');
    } else {
      console.log('❌ DeepSeek API连接失败:', deepseekResponse.status, deepseekResponse.statusText);
    }
  } catch (error) {
    console.error('❌ AI连接测试失败:', error.message);
  }
};

// 运行测试
testAIConnection(); 