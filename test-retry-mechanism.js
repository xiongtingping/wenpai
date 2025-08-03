// 测试重试机制的脚本
const { callAIWithRetry } = require('./src/api/ai.ts');

async function testRetryMechanism() {
  console.log('🧪 开始测试重试机制...');
  
  try {
    const result = await callAIWithRetry({
      prompt: 'Hello, this is a test for retry mechanism',
      model: 'gpt-4',
      maxTokens: 50
    }, 3);
    
    console.log('✅ 测试成功:', result);
  } catch (error) {
    console.log('❌ 测试失败:', error.message);
  }
}

testRetryMechanism(); 