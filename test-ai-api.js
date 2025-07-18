#!/usr/bin/env node

/**
 * AI API 连接测试脚本
 * 用于测试内容生成AI是否能连接上API功能
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// 配置信息
const config = {
  openai: {
    apiKey: process.env.VITE_OPENAI_API_KEY || 'sk-your-openai-api-key-here',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    modelsEndpoint: 'https://api.openai.com/v1/models'
  },
  deepseek: {
    apiKey: process.env.VITE_DEEPSEEK_API_KEY || 'sk-your-deepseek-api-key-here',
    endpoint: 'https://api.deepseek.com/v1/chat/completions'
  },
  gemini: {
    apiKey: process.env.VITE_GEMINI_API_KEY || 'your-gemini-api-key-here',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
  }
};

/**
 * 发送HTTP请求
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

/**
 * 测试OpenAI API连接
 */
async function testOpenAI() {
  console.log('\n🔍 测试 OpenAI API 连接...');
  
  try {
    // 测试模型列表API
    console.log('📋 测试模型列表API...');
    const modelsResponse = await makeRequest(config.openai.modelsEndpoint, {
      headers: {
        'Authorization': `Bearer ${config.openai.apiKey}`
      }
    });
    
    if (modelsResponse.status === 200) {
      console.log('✅ OpenAI 模型列表API连接成功');
      console.log(`📊 可用模型数量: ${modelsResponse.data.data?.length || 0}`);
    } else {
      console.log(`❌ OpenAI 模型列表API连接失败: ${modelsResponse.status}`);
      console.log(`错误信息: ${JSON.stringify(modelsResponse.data, null, 2)}`);
    }
    
    // 测试聊天完成API
    console.log('\n💬 测试聊天完成API...');
    const chatResponse = await makeRequest(config.openai.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.openai.apiKey}`
      },
      body: {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: '请用一句话介绍一下你自己。' }
        ],
        max_tokens: 100,
        temperature: 0.7
      }
    });
    
    if (chatResponse.status === 200) {
      console.log('✅ OpenAI 聊天完成API连接成功');
      const content = chatResponse.data.choices?.[0]?.message?.content;
      console.log(`🤖 AI回复: ${content}`);
    } else {
      console.log(`❌ OpenAI 聊天完成API连接失败: ${chatResponse.status}`);
      console.log(`错误信息: ${JSON.stringify(chatResponse.data, null, 2)}`);
    }
    
  } catch (error) {
    console.log(`❌ OpenAI API 测试异常: ${error.message}`);
  }
}

/**
 * 测试DeepSeek API连接
 */
async function testDeepSeek() {
  console.log('\n🔍 测试 DeepSeek API 连接...');
  
  if (config.deepseek.apiKey === 'sk-your-deepseek-api-key-here') {
    console.log('⚠️  DeepSeek API密钥未配置，跳过测试');
    return;
  }
  
  try {
    const response = await makeRequest(config.deepseek.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.deepseek.apiKey}`
      },
      body: {
        model: 'deepseek-chat',
        messages: [
          { role: 'user', content: '请用一句话介绍一下你自己。' }
        ],
        max_tokens: 100,
        temperature: 0.7
      }
    });
    
    if (response.status === 200) {
      console.log('✅ DeepSeek API连接成功');
      const content = response.data.choices?.[0]?.message?.content;
      console.log(`🤖 AI回复: ${content}`);
    } else {
      console.log(`❌ DeepSeek API连接失败: ${response.status}`);
      console.log(`错误信息: ${JSON.stringify(response.data, null, 2)}`);
    }
    
  } catch (error) {
    console.log(`❌ DeepSeek API 测试异常: ${error.message}`);
  }
}

/**
 * 测试Gemini API连接
 */
async function testGemini() {
  console.log('\n🔍 测试 Gemini API 连接...');
  
  if (config.gemini.apiKey === 'your-gemini-api-key-here') {
    console.log('⚠️  Gemini API密钥未配置，跳过测试');
    return;
  }
  
  try {
    const response = await makeRequest(`${config.gemini.endpoint}?key=${config.gemini.apiKey}`, {
      method: 'POST',
      body: {
        contents: [
          {
            parts: [
              {
                text: '请用一句话介绍一下你自己。'
              }
            ]
          }
        ]
      }
    });
    
    if (response.status === 200) {
      console.log('✅ Gemini API连接成功');
      const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log(`🤖 AI回复: ${content}`);
    } else {
      console.log(`❌ Gemini API连接失败: ${response.status}`);
      console.log(`错误信息: ${JSON.stringify(response.data, null, 2)}`);
    }
    
  } catch (error) {
    console.log(`❌ Gemini API 测试异常: ${error.message}`);
  }
}

/**
 * 测试网络连接
 */
async function testNetworkConnection() {
  console.log('\n🌐 测试网络连接...');
  
  const testUrls = [
    'https://api.openai.com',
    'https://api.deepseek.com',
    'https://generativelanguage.googleapis.com'
  ];
  
  for (const url of testUrls) {
    try {
      const response = await makeRequest(url);
      console.log(`✅ ${url} - 连接正常 (${response.status})`);
    } catch (error) {
      console.log(`❌ ${url} - 连接失败: ${error.message}`);
    }
  }
}

/**
 * 显示配置信息
 */
function showConfigInfo() {
  console.log('📋 AI API 配置信息:');
  console.log('='.repeat(50));
  
  console.log(`OpenAI API Key: ${config.openai.apiKey ? '✅ 已配置' : '❌ 未配置'}`);
  if (config.openai.apiKey && config.openai.apiKey !== 'sk-your-openai-api-key-here') {
    console.log(`  Key格式: ${config.openai.apiKey.substring(0, 10)}...`);
  }
  
  console.log(`DeepSeek API Key: ${config.deepseek.apiKey ? '✅ 已配置' : '❌ 未配置'}`);
  if (config.deepseek.apiKey && config.deepseek.apiKey !== 'sk-your-deepseek-api-key-here') {
    console.log(`  Key格式: ${config.deepseek.apiKey.substring(0, 10)}...`);
  }
  
  console.log(`Gemini API Key: ${config.gemini.apiKey ? '✅ 已配置' : '❌ 未配置'}`);
  if (config.gemini.apiKey && config.gemini.apiKey !== 'your-gemini-api-key-here') {
    console.log(`  Key格式: ${config.gemini.apiKey.substring(0, 10)}...`);
  }
  
  console.log(`当前环境: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(50));
}

/**
 * 主函数
 */
async function main() {
  console.log('🤖 AI API 连接测试工具');
  console.log('='.repeat(50));
  
  showConfigInfo();
  
  // 测试网络连接
  await testNetworkConnection();
  
  // 测试各个AI API
  await testOpenAI();
  await testDeepSeek();
  await testGemini();
  
  console.log('\n🎉 测试完成!');
  console.log('\n💡 提示:');
  console.log('1. 如果API密钥未配置，请设置相应的环境变量');
  console.log('2. 如果网络连接失败，请检查网络设置或配置代理');
  console.log('3. 如果API调用失败，请检查密钥是否有效和账户余额');
}

// 运行测试
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testOpenAI,
  testDeepSeek,
  testGemini,
  testNetworkConnection,
  config
}; 