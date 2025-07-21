#!/usr/bin/env node

/**
 * Authing OIDC端点测试脚本
 * 测试OIDC端点的可用性和配置正确性
 */

const https = require('https');
const { URL } = require('url');

/**
 * 发送HTTPS请求
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Authing-OIDC-Test/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

/**
 * 测试OIDC配置端点
 */
async function testOIDCConfiguration() {
  console.log('🔍 测试Authing OIDC配置端点');
  console.log('=====================================');

  const configUrl = 'ai-wenpai.authing.cn/687e0aafee2b84f86685b644/oidc/.well-known/openid-configuration';
  
  try {
    console.log(`📡 请求: ${configUrl}`);
    const response = await makeRequest(configUrl);
    
    console.log(`✅ 状态码: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      const config = JSON.parse(response.data);
      console.log('📋 OIDC配置信息:');
      console.log(`   - Issuer: ${config.issuer}`);
      console.log(`   - Authorization Endpoint: ${config.authorization_endpoint}`);
      console.log(`   - Token Endpoint: ${config.token_endpoint}`);
      console.log(`   - Userinfo Endpoint: ${config.userinfo_endpoint}`);
      console.log(`   - JWKS URI: ${config.jwks_uri}`);
      
      return config;
    } else {
      console.log(`❌ 配置端点返回错误: ${response.statusCode}`);
      console.log(`响应内容: ${response.data}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ 请求失败: ${error.message}`);
    return null;
  }
}

/**
 * 测试授权端点
 */
async function testAuthorizationEndpoint(config) {
  console.log('\n🔍 测试授权端点');
  console.log('=====================================');

  if (!config) {
    console.log('❌ 无法获取OIDC配置，跳过授权端点测试');
    return;
  }

  const authUrl = new URL(config.authorization_endpoint);
  authUrl.searchParams.set('client_id', '687c5c7f4e778a6485a4f0e0');
  authUrl.searchParams.set('redirect_uri', 'https://wenpai.netlify.app/callback');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid profile email');
  authUrl.searchParams.set('state', 'test-123');
  authUrl.searchParams.set('nonce', 'test-nonce');

  console.log(`📡 测试授权URL: ${authUrl.toString()}`);
  
  try {
    const response = await makeRequest(authUrl.toString());
    
    console.log(`📊 响应状态: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log('✅ 授权端点正常响应');
      console.log('📄 响应内容预览:');
      console.log(response.data.substring(0, 500) + '...');
    } else if (response.statusCode === 302) {
      console.log('✅ 授权端点重定向（正常行为）');
      console.log(`📍 重定向到: ${response.headers.location}`);
    } else if (response.statusCode === 400) {
      console.log('❌ 授权端点返回400错误');
      console.log('📄 错误详情:');
      console.log(response.data);
      
      // 尝试解析错误信息
      try {
        const errorData = JSON.parse(response.data);
        console.log('🔍 错误分析:');
        console.log(`   - 错误类型: ${errorData.error || 'unknown'}`);
        console.log(`   - 错误描述: ${errorData.error_description || 'no description'}`);
      } catch (e) {
        console.log('   - 无法解析错误详情');
      }
    } else {
      console.log(`❌ 意外状态码: ${response.statusCode}`);
      console.log(`响应内容: ${response.data}`);
    }
  } catch (error) {
    console.log(`❌ 请求失败: ${error.message}`);
  }
}

/**
 * 测试JWKS端点
 */
async function testJWKSEndpoint(config) {
  console.log('\n🔍 测试JWKS端点');
  console.log('=====================================');

  if (!config) {
    console.log('❌ 无法获取OIDC配置，跳过JWKS测试');
    return;
  }

  try {
    console.log(`📡 请求: ${config.jwks_uri}`);
    const response = await makeRequest(config.jwks_uri);
    
    console.log(`✅ 状态码: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      const jwks = JSON.parse(response.data);
      console.log('🔑 JWKS信息:');
      console.log(`   - 密钥数量: ${jwks.keys ? jwks.keys.length : 0}`);
      if (jwks.keys && jwks.keys.length > 0) {
        console.log(`   - 第一个密钥类型: ${jwks.keys[0].kty}`);
        console.log(`   - 第一个密钥算法: ${jwks.keys[0].alg}`);
      }
    } else {
      console.log(`❌ JWKS端点返回错误: ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`❌ 请求失败: ${error.message}`);
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('🚀 开始Authing OIDC端点测试');
  console.log('=====================================');
  console.log(`⏰ 测试时间: ${new Date().toLocaleString()}`);
  console.log(`🌐 测试域名: ai-wenpai.authing.cn/687e0aafee2b84f86685b644`);
  console.log(`🆔 应用ID: 687c5c7f4e778a6485a4f0e0`);
  console.log(`📍 回调URL: https://wenpai.netlify.app/callback`);
  console.log('');

  // 测试OIDC配置端点
  const config = await testOIDCConfiguration();
  
  // 测试授权端点
  await testAuthorizationEndpoint(config);
  
  // 测试JWKS端点
  await testJWKSEndpoint(config);

  console.log('\n📋 测试总结');
  console.log('=====================================');
  console.log('✅ 如果OIDC配置端点返回200，说明OIDC服务正常');
  console.log('✅ 如果授权端点返回302重定向，说明授权流程正常');
  console.log('❌ 如果授权端点返回400，说明配置有问题');
  console.log('✅ 如果JWKS端点返回200，说明密钥服务正常');
  
  console.log('\n🔧 下一步建议:');
  console.log('1. 检查Authing控制台中的应用类型');
  console.log('2. 确认回调URL配置正确');
  console.log('3. 检查域名白名单设置');
  console.log('4. 等待配置生效（可能需要几分钟）');
}

// 运行测试
runTests().catch(console.error); 