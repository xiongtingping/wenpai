#!/usr/bin/env node

/**
 * 直接测试OpenAI API
 */

const https = require('https');
const fs = require('fs');

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
 * 读取环境变量
 */
function loadEnvVars() {
  logSection('环境变量检查');
  
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('VITE_OPENAI_API_KEY=')) {
        const apiKey = line.replace('VITE_OPENAI_API_KEY=', '').trim();
        if (apiKey && apiKey !== 'sk-your-openai-api-key-here') {
          log(`✅ 找到OpenAI API密钥: ${apiKey.substring(0, 20)}...`, 'green');
          return apiKey;
        }
      }
    }
    
    log('❌ 未找到有效的OpenAI API密钥', 'red');
    return null;
  } catch (error) {
    log(`❌ 读取环境变量文件失败: ${error.message}`, 'red');
    return null;
  }
}

/**
 * 测试OpenAI API
 */
async function testOpenAI(apiKey) {
  logSection('OpenAI API 测试');
  
  if (!apiKey) {
    log('❌ 没有API密钥，跳过测试', 'red');
    return false;
  }

  try {
    log('发送API请求...', 'blue');
    
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
      log(`   模型: ${result.data.model || '未知'}`, 'green');
      return true;
    } else {
      log(`❌ OpenAI API调用失败: ${result.status}`, 'red');
      log(`   错误信息: ${JSON.stringify(result.data)}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ OpenAI API调用异常: ${error.message}`, 'red');
    return false;
  }
}

/**
 * 测试网络连接
 */
async function testNetwork() {
  logSection('网络连接测试');
  
  try {
    const result = await new Promise((resolve, reject) => {
      const req = https.get('https://api.openai.com', (res) => {
        resolve({ status: res.statusCode });
      });
      
      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('请求超时'));
      });
    });
    
    log(`✅ OpenAI API网络连接正常 (状态码: ${result.status})`, 'green');
    return true;
  } catch (error) {
    log(`❌ OpenAI API网络连接失败: ${error.message}`, 'red');
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  log(`${colors.bold}🤖 OpenAI API 直接测试${colors.reset}`, 'blue');
  
  try {
    // 加载环境变量
    const apiKey = loadEnvVars();
    
    // 测试网络连接
    const networkOk = await testNetwork();
    
    // 测试API调用
    const apiOk = await testOpenAI(apiKey);
    
    // 生成报告
    logSection('测试报告');
    
    if (networkOk && apiOk) {
      log('🎉 恭喜！OpenAI API连接成功', 'green');
      log('您的AI服务已成功连接真实的OpenAI API', 'green');
      log('所有AI功能将使用真实的AI服务生成内容', 'green');
    } else {
      log('⚠️  发现问题', 'yellow');
      
      if (!networkOk) {
        log('建议: 检查网络连接，可能需要配置代理或VPN', 'yellow');
      }
      
      if (!apiOk) {
        log('建议: 检查API密钥是否正确', 'yellow');
      }
    }
    
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
  loadEnvVars,
  testOpenAI,
  testNetwork
}; 