#!/usr/bin/env node

/**
 * 简单AI服务测试脚本
 * 测试开发环境中的AI服务是否正常工作
 */

const https = require('https');
const http = require('http');

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
 * 测试开发服务器
 */
async function testDevServer() {
  logSection('开发服务器测试');
  
  try {
    const response = await new Promise((resolve, reject) => {
      const req = http.get('http://localhost:5182', (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data }));
      });
      
      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('请求超时'));
      });
    });

    if (response.status === 200) {
      log('✅ 开发服务器运行正常 (端口: 5182)', 'green');
      return true;
    } else {
      log(`❌ 开发服务器响应异常: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ 开发服务器连接失败: ${error.message}`, 'red');
    return false;
  }
}

/**
 * 测试AI配置页面
 */
async function testAIConfigPage() {
  logSection('AI配置页面测试');
  
  try {
    const response = await new Promise((resolve, reject) => {
      const req = http.get('http://localhost:5182/ai-config-test', (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data }));
      });
      
      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('请求超时'));
      });
    });

    if (response.status === 200) {
      log('✅ AI配置页面可访问', 'green');
      return true;
    } else {
      log(`❌ AI配置页面响应异常: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ AI配置页面连接失败: ${error.message}`, 'red');
    return false;
  }
}

/**
 * 测试网络连接
 */
async function testNetwork() {
  logSection('网络连接测试');
  
  const testUrls = [
    'https://api.openai.com',
    'https://api.deepseek.com'
  ];

  let successCount = 0;

  for (const url of testUrls) {
    try {
      const result = await new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
          resolve({ status: res.statusCode, url });
        });
        
        req.on('error', reject);
        req.setTimeout(10000, () => {
          req.destroy();
          reject(new Error('请求超时'));
        });
      });
      
      log(`✅ ${url} - 状态码: ${result.status}`, 'green');
      successCount++;
    } catch (error) {
      log(`❌ ${url} - 连接失败: ${error.message}`, 'red');
    }
  }

  return successCount > 0;
}

/**
 * 测试OpenAI API真实调用
 */
async function testOpenAIApi() {
  logSection('OpenAI API 真实调用测试');
  
  const apiKey = process.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    log('❌ OpenAI API密钥未配置', 'red');
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
 * 检查项目文件
 */
function checkProjectFiles() {
  logSection('项目文件检查');
  
  const fs = require('fs');
  const path = require('path');
  
  const requiredFiles = [
    'src/api/aiService.ts',
    'src/config/apiConfig.ts',
    'src/pages/AIConfigTestPage.tsx'
  ];

  let allExist = true;

  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      log(`✅ ${file} - 存在`, 'green');
    } else {
      log(`❌ ${file} - 不存在`, 'red');
      allExist = false;
    }
  }

  return allExist;
}

/**
 * 生成测试报告
 */
function generateReport(results) {
  logSection('测试报告');
  
  const { devServer, aiPage, network, openai, files } = results;
  
  log(`开发服务器: ${devServer ? '✅ 正常' : '❌ 异常'}`, devServer ? 'green' : 'red');
  log(`AI配置页面: ${aiPage ? '✅ 可访问' : '❌ 不可访问'}`, aiPage ? 'green' : 'red');
  log(`网络连接: ${network ? '✅ 正常' : '❌ 异常'}`, network ? 'green' : 'red');
  log(`OpenAI API: ${openai ? '✅ 连接成功' : '❌ 连接失败'}`, openai ? 'green' : 'red');
  log(`项目文件: ${files ? '✅ 完整' : '❌ 缺失'}`, files ? 'green' : 'red');
  
  console.log('\n');
  
  if (devServer && aiPage && network && openai && files) {
    log('🎉 恭喜！AI服务已成功连接真实API', 'green');
    log('您可以访问 http://localhost:5182/ai-config-test 进行详细测试', 'green');
    log('所有AI功能将使用真实的AI服务生成内容', 'green');
  } else {
    log('⚠️  发现问题，请根据上述提示进行修复', 'yellow');
    
    if (!devServer) {
      log('建议: 运行 npm run dev 启动开发服务器', 'yellow');
    }
    
    if (!aiPage) {
      log('建议: 检查路由配置，确保AI配置页面可访问', 'yellow');
    }
    
    if (!network) {
      log('建议: 检查网络连接，可能需要配置代理', 'yellow');
    }
    
    if (!openai) {
      log('建议: 检查API密钥是否正确，或联系API提供商', 'yellow');
    }
    
    if (!files) {
      log('建议: 检查项目文件是否完整', 'yellow');
    }
  }
}

/**
 * 主函数
 */
async function main() {
  log(`${colors.bold}🤖 AI服务真实API测试${colors.reset}`, 'blue');
  log('正在检查AI服务是否连接了真实的API...', 'blue');
  
  try {
    // 运行所有测试
    const devServerResult = await testDevServer();
    const aiPageResult = await testAIConfigPage();
    const networkResult = await testNetwork();
    const openaiResult = await testOpenAIApi();
    const filesResult = checkProjectFiles();
    
    // 生成报告
    generateReport({
      devServer: devServerResult,
      aiPage: aiPageResult,
      network: networkResult,
      openai: openaiResult,
      files: filesResult
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
  testDevServer,
  testAIConfigPage,
  testNetwork,
  testOpenAIApi,
  checkProjectFiles,
  generateReport
}; 