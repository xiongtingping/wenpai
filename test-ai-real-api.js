#!/usr/bin/env node

/**
 * AI真实API连接测试脚本
 * 用于验证开发环境中的AI服务是否连接了真实的API
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${colors.bold}${colors.blue}=== ${title} ===${colors.reset}`);
}

/**
 * 测试网络连接
 */
async function testNetworkConnection() {
  logSection('网络连接测试');
  
  const testUrls = [
    'https://api.openai.com',
    'https://api.deepseek.com',
    'https://generativelanguage.googleapis.com'
  ];

  for (const url of testUrls) {
    try {
      const result = await new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
          resolve({ status: res.statusCode, url });
        });
        
        req.on('error', (err) => {
          reject(err);
        });
        
        req.setTimeout(10000, () => {
          req.destroy();
          reject(new Error('请求超时'));
        });
      });
      
      log(`✅ ${url} - 状态码: ${result.status}`, 'green');
    } catch (error) {
      log(`❌ ${url} - 连接失败: ${error.message}`, 'red');
    }
  }
}

/**
 * 测试环境变量配置
 */
function testEnvironmentVariables() {
  logSection('环境变量配置检查');
  
  const requiredVars = [
    'VITE_OPENAI_API_KEY',
    'VITE_DEEPSEEK_API_KEY',
    'VITE_GEMINI_API_KEY'
  ];

  let hasAnyKey = false;
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value && value !== 'sk-your-openai-api-key-here' && value !== 'your-api-key-here') {
      log(`✅ ${varName}: 已配置 (${value.substring(0, 10)}...)`, 'green');
      hasAnyKey = true;
    } else {
      log(`❌ ${varName}: 未配置或使用默认值`, 'red');
    }
  }

  if (!hasAnyKey) {
    log('⚠️  警告: 未发现有效的API密钥配置', 'yellow');
    log('请创建 .env.local 文件并配置有效的API密钥', 'yellow');
  }

  return hasAnyKey;
}

/**
 * 测试OpenAI API调用
 */
async function testOpenAIApi() {
  logSection('OpenAI API 真实调用测试');
  
  const apiKey = process.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey || apiKey === 'sk-your-openai-api-key-here') {
    log('❌ OpenAI API密钥未配置，跳过测试', 'red');
    return false;
  }

  try {
    const requestData = JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: '请回复"测试成功"三个字'
        }
      ],
      max_tokens: 50,
      temperature: 0.1
    });

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(requestData)
      }
    };

    const result = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            resolve({ status: res.statusCode, data: response });
          } catch (error) {
            reject(new Error(`JSON解析失败: ${error.message}`));
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('API请求超时'));
      });

      req.write(requestData);
      req.end();
    });

    if (result.status === 200 && result.data.choices && result.data.choices[0]) {
      const content = result.data.choices[0].message.content;
      log(`✅ OpenAI API调用成功`, 'green');
      log(`   响应内容: ${content}`, 'green');
      log(`   使用Token: ${result.data.usage?.total_tokens || '未知'}`, 'green');
      return true;
    } else {
      log(`❌ OpenAI API调用失败: ${JSON.stringify(result.data)}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ OpenAI API调用异常: ${error.message}`, 'red');
    return false;
  }
}

/**
 * 测试项目中的AI服务
 */
async function testProjectAIService() {
  logSection('项目AI服务测试');
  
  try {
    // 检查项目文件是否存在
    const fs = require('fs');
    const path = require('path');
    
    const aiServicePath = path.join(__dirname, 'src', 'api', 'aiService.ts');
    const aiConfigPath = path.join(__dirname, 'src', 'config', 'apiConfig.ts');
    
    if (!fs.existsSync(aiServicePath)) {
      log('❌ AI服务文件不存在', 'red');
      return false;
    }
    
    if (!fs.existsSync(aiConfigPath)) {
      log('❌ AI配置文件不存在', 'red');
      return false;
    }
    
    log('✅ AI服务文件存在', 'green');
    
    // 检查是否使用了模拟数据
    const aiServiceContent = fs.readFileSync(aiServicePath, 'utf8');
    const aiConfigContent = fs.readFileSync(aiConfigPath, 'utf8');
    
    if (aiServiceContent.includes('mock') || aiServiceContent.includes('模拟')) {
      log('⚠️  发现可能的模拟数据配置', 'yellow');
    } else {
      log('✅ 未发现模拟数据配置', 'green');
    }
    
    if (aiConfigContent.includes('VITE_OPENAI_API_KEY')) {
      log('✅ 使用环境变量配置API密钥', 'green');
    } else {
      log('⚠️  可能使用硬编码API密钥', 'yellow');
    }
    
    return true;
  } catch (error) {
    log(`❌ 项目AI服务检查失败: ${error.message}`, 'red');
    return false;
  }
}

/**
 * 生成测试报告
 */
function generateReport(results) {
  logSection('测试报告');
  
  const { network, env, openai, project } = results;
  
  log(`网络连接: ${network ? '✅ 正常' : '❌ 异常'}`, network ? 'green' : 'red');
  log(`环境变量: ${env ? '✅ 已配置' : '❌ 未配置'}`, env ? 'green' : 'red');
  log(`OpenAI API: ${openai ? '✅ 连接成功' : '❌ 连接失败'}`, openai ? 'green' : 'red');
  log(`项目配置: ${project ? '✅ 正常' : '❌ 异常'}`, project ? 'green' : 'red');
  
  console.log('\n');
  
  if (network && env && openai && project) {
    log('🎉 恭喜！AI服务已正确连接真实API', 'green');
    log('所有测试通过，您的AI功能将使用真实的AI服务', 'green');
  } else {
    log('⚠️  发现问题，请根据上述提示进行修复', 'yellow');
    
    if (!network) {
      log('建议: 检查网络连接，可能需要配置代理', 'yellow');
    }
    
    if (!env) {
      log('建议: 创建 .env.local 文件并配置API密钥', 'yellow');
    }
    
    if (!openai) {
      log('建议: 检查API密钥是否正确，或联系API提供商', 'yellow');
    }
    
    if (!project) {
      log('建议: 检查项目配置文件', 'yellow');
    }
  }
}

/**
 * 主函数
 */
async function main() {
  log(`${colors.bold}🤖 AI真实API连接测试${colors.reset}`, 'blue');
  log('正在检查AI服务是否连接了真实的API...', 'blue');
  
  try {
    // 运行所有测试
    const networkResult = await testNetworkConnection();
    const envResult = testEnvironmentVariables();
    const openaiResult = await testOpenAIApi();
    const projectResult = await testProjectAIService();
    
    // 生成报告
    generateReport({
      network: networkResult,
      env: envResult,
      openai: openaiResult,
      project: projectResult
    });
    
  } catch (error) {
    log(`❌ 测试过程中发生错误: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  main();
}

module.exports = {
  testNetworkConnection,
  testEnvironmentVariables,
  testOpenAIApi,
  testProjectAIService,
  generateReport
}; 