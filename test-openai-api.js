/**
 * OpenAI API测试脚本
 * 用于验证Netlify Functions中的OpenAI API是否正常工作
 */

const testOpenAIAPI = async () => {
  console.log('🔍 测试OpenAI API连接...\n');

  const testData = {
    provider: 'openai',
    action: 'generate',
    messages: [
      {
        role: 'system',
        content: '你是一个专业的品牌分析专家。'
      },
      {
        role: 'user',
        content: '请分析以下品牌资料：我们是一个专注于用户体验的科技公司，致力于为用户提供简单易用的产品。'
      }
    ],
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 1000
  };

  try {
    console.log('📡 发送请求到Netlify Functions...');
    console.log('🌐 URL: https://www.wenpai.xyz/.netlify/functions/api');
    
    const startTime = Date.now();
    
    const response = await fetch('https://www.wenpai.xyz/.netlify/functions/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const duration = Date.now() - startTime;
    
    console.log(`⏱️  响应时间: ${duration}ms`);
    console.log(`📊 响应状态: ${response.status}`);
    console.log(`📋 响应头:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API调用失败:', errorText);
      return false;
    }

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ API调用成功！');
      console.log('🤖 模型:', data.data?.model || '未知');
      console.log('📝 响应内容:', data.data?.choices?.[0]?.message?.content || '无内容');
      console.log('📊 使用情况:', data.data?.usage || '无数据');
      return true;
    } else {
      console.error('❌ API返回错误:', data);
      return false;
    }

  } catch (error) {
    console.error('❌ 网络错误:', error.message);
    return false;
  }
};

const runFullTest = async () => {
  console.log('🚀 开始完整API测试...\n');
  
  // 测试1: 基本连接
  console.log('📋 测试1: 基本API连接');
  const test1Result = await testOpenAIAPI();
  
  if (test1Result) {
    console.log('\n✅ 所有测试通过！OpenAI API配置正确。');
    console.log('\n🎉 现在你可以：');
    console.log('1. 访问 https://www.wenpai.xyz/ai-test 测试AI功能');
    console.log('2. 在品牌资料库页面测试文件上传和分析');
    console.log('3. 使用AI内容适配器生成内容');
  } else {
    console.log('\n❌ 测试失败，请检查：');
    console.log('1. OpenAI API密钥是否正确');
    console.log('2. 账户余额是否充足');
    console.log('3. 网络连接是否正常');
  }
};

// 如果在Node.js环境中运行
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testOpenAIAPI, runFullTest };
}

// 如果在浏览器环境中运行
if (typeof window !== 'undefined') {
  window.testOpenAIAPI = testOpenAIAPI;
  window.runFullTest = runFullTest;
  console.log('💡 在浏览器控制台运行: runFullTest()');
}

// 自动运行测试（如果在Node.js中）
if (typeof process !== 'undefined' && process.argv.includes('--run')) {
  runFullTest();
} 