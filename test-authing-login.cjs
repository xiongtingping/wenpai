#!/usr/bin/env node

/**
 * ✅ FIXED: 2024-07-21 Authing测试脚本已切换为新App ID 688237f7f9e118de849dc274
 * 📌 请勿改动，后续如需更换请单独审批
 */

/**
 * 详细测试Authing登录URL生成
 */

const https = require('https');

/**
 * 测试Authing登录URL
 */
function testAuthingLogin() {
  const appId = '688237f7f9e118de849dc274';
  const redirectUri = 'http://localhost:5173/callback';
  
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile email phone',
    state: 'test-state-' + Date.now()
  });
  
  const loginUrl = `ai-wenpai.authing.cn/688237f7f9e118de849dc274/oidc/auth?${params.toString()}`;
  
  console.log('🔍 测试Authing登录URL:');
  console.log('📋 App ID:', appId);
  console.log('📋 回调URL:', redirectUri);
  console.log('📋 完整URL:', loginUrl);
  console.log('');
  
  return new Promise((resolve) => {
    const req = https.get(loginUrl, (res) => {
      console.log(`📋 响应状态码: ${res.statusCode}`);
      console.log(`📋 响应头:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📋 响应内容长度: ${data.length} 字符`);
        
        if (res.statusCode === 200) {
          console.log('✅ 成功 - 返回登录页面');
          if (data.includes('login') || data.includes('authing')) {
            console.log('✅ 确认是Authing登录页面');
          }
        } else if (res.statusCode === 302 || res.statusCode === 303) {
          console.log('✅ 成功 - 重定向到登录页面');
          console.log('📋 重定向地址:', res.headers.location);
        } else if (res.statusCode === 400) {
          console.log('❌ 400错误 - 检查响应内容:');
          if (data.includes('redirect_uri_mismatch')) {
            console.log('❌ 错误: redirect_uri_mismatch - 回调URL不匹配');
          } else if (data.includes('invalid_client')) {
            console.log('❌ 错误: invalid_client - 客户端ID无效');
          } else {
            console.log('❌ 其他400错误，响应内容:', data.substring(0, 500));
          }
        } else {
          console.log(`❌ 其他错误 - 状态码: ${res.statusCode}`);
          console.log('📋 响应内容:', data.substring(0, 500));
        }
        
        resolve({ statusCode: res.statusCode, data: data.substring(0, 1000) });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ 请求失败: ${error.message}`);
      resolve({ statusCode: 'error', data: error.message });
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ 请求超时');
      req.destroy();
      resolve({ statusCode: 'timeout', data: 'timeout' });
    });
  });
}

/**
 * 测试不同的参数组合
 */
async function testDifferentParams() {
  console.log('🚀 开始测试不同的Authing登录参数...\n');
  
  const tests = [
    {
      name: '标准OIDC参数',
      params: {
        client_id: '688237f7f9e118de849dc274',
        redirect_uri: 'http://localhost:5173/callback',
        response_type: 'code',
        scope: 'openid profile email phone',
        state: 'test-state'
      }
    },
    {
      name: '简化scope',
      params: {
        client_id: '688237f7f9e118de849dc274',
        redirect_uri: 'http://localhost:5173/callback',
        response_type: 'code',
        scope: 'openid',
        state: 'test-state'
      }
    },
    {
      name: '使用5174端口',
      params: {
        client_id: '688237f7f9e118de849dc274',
        redirect_uri: 'http://localhost:5174/callback',
        response_type: 'code',
        scope: 'openid profile email phone',
        state: 'test-state'
      }
    }
  ];
  
  for (const test of tests) {
    console.log(`\n🔍 测试: ${test.name}`);
    const params = new URLSearchParams(test.params);
    const loginUrl = `ai-wenpai.authing.cn/688237f7f9e118de849dc274/oidc/auth?${params.toString()}`;
    
    const result = await new Promise((resolve) => {
      const req = https.get(loginUrl, (res) => {
        resolve({ statusCode: res.statusCode });
      });
      
      req.on('error', () => {
        resolve({ statusCode: 'error' });
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        resolve({ statusCode: 'timeout' });
      });
    });
    
    const status = result.statusCode === 200 || result.statusCode === 302 ? '✅' : '❌';
    console.log(`${status} 状态码: ${result.statusCode}`);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始详细测试Authing登录功能...\n');
  
  // 测试基本登录URL
  await testAuthingLogin();
  
  // 测试不同参数组合
  await testDifferentParams();
  
  console.log('\n📊 测试完成');
  console.log('\n💡 如果仍然返回400错误，可能的原因:');
  console.log('1. Authing控制台配置需要时间生效');
  console.log('2. 应用类型配置不正确');
  console.log('3. 需要检查应用的其他配置');
}

// 运行测试
main(); 