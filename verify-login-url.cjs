#!/usr/bin/env node

/**
 * 验证真正的登录URL生成
 */

const https = require('https');

// Authing 配置
const AUTHING_CONFIG = {
  appId: '688237f7f9e118de849dc274',
  host: 'ai-wenpai.authing.cn/688237f7f9e118de849dc274',
  redirectUri: 'http://localhost:5173/callback'
};

/**
 * 生成登录URL
 */
function generateLoginUrl() {
  const params = new URLSearchParams({
    client_id: AUTHING_CONFIG.appId,
    redirect_uri: AUTHING_CONFIG.redirectUri,
    response_type: 'code',
    scope: 'openid profile email phone',
    state: 'test-state'
  });
  
  return `https://${AUTHING_CONFIG.host}/oidc/auth?${params.toString()}`;
}

/**
 * 测试登录URL是否有效
 */
function testLoginUrl(loginUrl) {
  console.log('🔗 生成的登录URL:');
  console.log(loginUrl);
  console.log('\n📋 URL参数分析:');
  
  const url = new URL(loginUrl);
  const params = url.searchParams;
  
  console.log(`- client_id: ${params.get('client_id')}`);
  console.log(`- redirect_uri: ${params.get('redirect_uri')}`);
  console.log(`- response_type: ${params.get('response_type')}`);
  console.log(`- scope: ${params.get('scope')}`);
  console.log(`- state: ${params.get('state')}`);
  
  // 验证必要参数
  const requiredParams = ['client_id', 'redirect_uri', 'response_type', 'scope'];
  const missingParams = requiredParams.filter(param => !params.get(param));
  
  if (missingParams.length > 0) {
    console.log(`\n❌ 缺少必要参数: ${missingParams.join(', ')}`);
    return false;
  }
  
  console.log('\n✅ 登录URL参数完整');
  return true;
}

/**
 * 测试Authing服务响应
 */
function testAuthingResponse(loginUrl) {
  return new Promise((resolve, reject) => {
    console.log('\n🔍 测试Authing服务响应...');
    
    const req = https.get(loginUrl, (res) => {
      console.log(`📋 响应状态码: ${res.statusCode}`);
      console.log(`📋 响应头: ${JSON.stringify(res.headers, null, 2)}`);
      
      if (res.statusCode === 200) {
        console.log('✅ Authing服务响应正常');
        resolve(true);
      } else if (res.statusCode === 302 || res.statusCode === 303) {
        console.log('✅ Authing服务重定向正常（这是预期的）');
        resolve(true);
      } else {
        console.log(`❌ Authing服务响应异常: ${res.statusCode}`);
        resolve(false);
      }
    });
    
    req.on('error', (error) => {
      console.error('❌ 请求失败:', error.message);
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      console.error('❌ 请求超时');
      req.destroy();
      reject(new Error('请求超时'));
    });
  });
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始验证真正的登录URL...\n');
  
  try {
    // 生成登录URL
    const loginUrl = generateLoginUrl();
    
    // 验证URL参数
    const isValid = testLoginUrl(loginUrl);
    if (!isValid) {
      console.log('\n❌ 登录URL验证失败');
      return;
    }
    
    // 测试Authing服务响应
    const isResponsive = await testAuthingResponse(loginUrl);
    
    if (isResponsive) {
      console.log('\n✅ 验证完成！');
      console.log('\n💡 使用说明:');
      console.log('1. 在浏览器中打开上述登录URL');
      console.log('2. 完成Authing登录流程');
      console.log('3. 检查是否成功跳转到回调页面');
      console.log('4. 验证用户信息是否正确获取');
      
      console.log('\n🔗 可以直接在浏览器中访问:');
      console.log(loginUrl);
    } else {
      console.log('\n❌ Authing服务响应异常');
    }
    
  } catch (error) {
    console.error('\n❌ 验证失败:', error.message);
  }
}

// 运行验证
main(); 