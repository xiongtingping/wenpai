/**
 * API密钥测试脚本
 * 验证配置的API密钥是否正常工作
 */

// 从环境变量获取API密钥，避免硬编码
const API_KEYS = {
  OPENAI: process.env.VITE_OPENAI_API_KEY || '',
  DEEPSEEK: process.env.VITE_DEEPSEEK_API_KEY || '',
  GEMINI: process.env.VITE_GEMINI_API_KEY || ''
};

/**
 * 测试OpenAI API
 */
async function testOpenAI() {
  console.log('🧪 测试OpenAI API...');
  
  if (!API_KEYS.OPENAI) {
    console.log('❌ OpenAI API密钥未设置');
    return;
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEYS.OPENAI}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Hello, this is a test message.' }],
        max_tokens: 50
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ OpenAI API测试成功');
      console.log('响应:', data.choices[0].message.content);
    } else {
      console.log('❌ OpenAI API测试失败');
      console.log('错误:', data.error);
    }
  } catch (error) {
    console.log('❌ OpenAI API网络错误:', error.message);
  }
}

/**
 * 测试DeepSeek API
 */
async function testDeepSeek() {
  console.log('🧪 测试DeepSeek API...');
  
  if (!API_KEYS.DEEPSEEK) {
    console.log('❌ DeepSeek API密钥未设置');
    return;
  }
  
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEYS.DEEPSEEK}`
      },
      body: JSON.stringify({
        model: 'deepseek-v2.5',
        messages: [{ role: 'user', content: 'Hello, this is a test message.' }],
        max_tokens: 50
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ DeepSeek API测试成功');
      console.log('响应:', data.choices[0].message.content);
    } else {
      console.log('❌ DeepSeek API测试失败');
      console.log('错误:', data.error);
    }
  } catch (error) {
    console.log('❌ DeepSeek API网络错误:', error.message);
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🧪 开始API密钥测试...\n');
  
  await testOpenAI();
  console.log('');
  await testDeepSeek();
  
  console.log('\n✅ API密钥测试完成');
}

// 如果在浏览器中运行
if (typeof window !== 'undefined') {
  runAllTests();
} else {
  console.log('请在浏览器控制台中运行此脚本');
} 