/**
 * DeepSeek API测试脚本
 * 在浏览器控制台中运行此脚本来测试DeepSeek API调用
 */

console.log('🔍 开始测试DeepSeek API...');

// 测试DeepSeek API调用
async function testDeepSeekAPI() {
  try {
    console.log('📡 准备调用DeepSeek API...');

    // 导入callAI函数
    const { callAI } = await import('/src/api/index.js');

    // 测试多个模型
    const testModels = ['deepseek-v3', 'deepseek-chat'];

    for (const model of testModels) {
      console.log(`\n🔍 测试模型: ${model}`);

      // 测试参数
      const testParams = {
        prompt: '请简单介绍一下人工智能',
        model: model,
        systemPrompt: '你是一个专业的AI助手',
        maxTokens: 100,
        temperature: 0.7
      };

      console.log('📋 测试参数:', testParams);

      try {
        // 调用API
        const result = await callAI(testParams);

        console.log('✅ API调用成功!');
        console.log('📄 返回结果:', result);

        if (result.success) {
          console.log(`🎉 ${model} API工作正常`);
          console.log('📝 生成内容:', result.content);
          console.log('⚡ 响应时间:', result.responseTime, 'ms');
          console.log('📊 Token使用:', result.usage);
          return result; // 成功就返回
        } else {
          console.log(`❌ ${model} API调用失败:`, result.error);
        }
      } catch (modelError) {
        console.error(`🚨 ${model} 测试失败:`, modelError);
        console.log(`💡 ${model} 错误详情:`, modelError.message);
      }
    }

    throw new Error('所有DeepSeek模型测试都失败了');
    
  } catch (error) {
    console.error('🚨 测试过程中发生错误:', error);
    
    // 详细错误分析
    if (error.message.includes('400')) {
      console.log('🔍 400错误分析:');
      console.log('  - 可能是请求参数格式错误');
      console.log('  - 检查模型名称是否正确');
      console.log('  - 检查API密钥是否有效');
    } else if (error.message.includes('401')) {
      console.log('🔍 401错误分析:');
      console.log('  - API密钥无效或过期');
      console.log('  - 检查VITE_DEEPSEEK_API_KEY环境变量');
    } else if (error.message.includes('403')) {
      console.log('🔍 403错误分析:');
      console.log('  - API密钥权限不足');
      console.log('  - 账户余额不足');
    } else if (error.message.includes('429')) {
      console.log('🔍 429错误分析:');
      console.log('  - 请求频率过高');
      console.log('  - 需要等待后重试');
    }
    
    return { success: false, error: error.message };
  }
}

// 测试API配置
async function testAPIConfig() {
  try {
    console.log('🔧 检查API配置...');
    
    // 导入配置函数
    const { getAPIConfig } = await import('/src/api/request.js');
    
    const config = getAPIConfig();
    console.log('📋 当前API配置:', config);
    
    // 检查DeepSeek配置
    const deepseekConfig = config.deepseek;
    console.log('🤖 DeepSeek配置:');
    console.log('  - Base URL:', deepseekConfig.baseURL);
    console.log('  - API Key:', deepseekConfig.apiKey ? `${deepseekConfig.apiKey.substring(0, 10)}...` : '未设置');
    
    if (!deepseekConfig.apiKey || deepseekConfig.apiKey.includes('your-')) {
      console.log('❌ DeepSeek API密钥未正确配置');
      return false;
    }
    
    if (!deepseekConfig.baseURL) {
      console.log('❌ DeepSeek Base URL未配置');
      return false;
    }
    
    console.log('✅ DeepSeek配置检查通过');
    return true;
    
  } catch (error) {
    console.error('🚨 配置检查失败:', error);
    return false;
  }
}

// 运行完整测试
async function runFullTest() {
  console.log('🚀 开始完整的DeepSeek API测试...');
  
  // 1. 检查配置
  const configOK = await testAPIConfig();
  if (!configOK) {
    console.log('❌ 配置检查失败，停止测试');
    return;
  }
  
  // 2. 测试API调用
  const result = await testDeepSeekAPI();
  
  // 3. 总结
  console.log('\n📊 测试总结:');
  if (result.success) {
    console.log('✅ DeepSeek API测试通过');
    console.log('💡 建议: API工作正常，可以正常使用');
  } else {
    console.log('❌ DeepSeek API测试失败');
    console.log('💡 建议: 检查API密钥、网络连接和请求参数');
    console.log('🔧 错误信息:', result.error);
  }
}

// 自动运行测试
runFullTest();

// 导出测试函数供手动调用
window.testDeepSeekAPI = testDeepSeekAPI;
window.testAPIConfig = testAPIConfig;
window.runFullTest = runFullTest;

console.log('💡 提示: 可以手动调用以下函数进行测试:');
console.log('  - testAPIConfig() - 检查API配置');
console.log('  - testDeepSeekAPI() - 测试API调用');
console.log('  - runFullTest() - 运行完整测试');
