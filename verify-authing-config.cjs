#!/usr/bin/env node

/**
 * Authing 配置验证脚本
 * 用于检查 Authing 后台配置是否正确
 */

const https = require('https');

/**
 * 获取 Authing 应用配置
 */
function getAuthingConfig() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'qutkgzkfaezk-demo.authing.cn',
      port: 443,
      path: '/api/v2/applications/6867fdc88034eb95ae86167d/public-config',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const config = JSON.parse(data);
          resolve(config);
        } catch (error) {
          reject(new Error(`JSON 解析失败: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

/**
 * 验证配置
 */
async function verifyConfig() {
  console.log('🔍 开始验证 Authing 配置...\n');
  
  try {
    const config = await getAuthingConfig();
    
    console.log('✅ Authing 服务连接正常');
    console.log('📋 应用配置信息:');
    console.log(`   - App ID: ${config.appId || '未设置'}`);
    console.log(`   - 应用名称: ${config.name || '未设置'}`);
    console.log(`   - 回调 URL: ${config.redirectUris || '未设置'}`);
    console.log(`   - 登出 URL: ${config.logoutRedirectUris || '未设置'}`);
    
    // 检查回调 URL 配置
    const expectedRedirectUri = 'http://localhost:5173/';
    const hasCorrectRedirect = config.redirectUris && 
      (Array.isArray(config.redirectUris) ? 
        config.redirectUris.includes(expectedRedirectUri) : 
        config.redirectUris === expectedRedirectUri);
    
    if (hasCorrectRedirect) {
      console.log('\n✅ 回调 URL 配置正确');
    } else {
      console.log('\n❌ 回调 URL 配置错误或缺失');
      console.log(`   期望: ${expectedRedirectUri}`);
      console.log(`   实际: ${config.redirectUris || '未设置'}`);
      console.log('\n🔧 请在 Authing 控制台添加以下配置:');
      console.log(`   登录回调 URL: ${expectedRedirectUri}`);
      console.log(`   登出回调 URL: ${expectedRedirectUri}`);
    }
    
    // 检查其他必要配置
    if (!config.appId) {
      console.log('\n❌ App ID 未设置');
    }
    
    if (!config.name) {
      console.log('\n⚠️  应用名称未设置');
    }
    
  } catch (error) {
    console.error('❌ 验证失败:', error.message);
    console.log('\n🔧 可能的原因:');
    console.log('   1. 网络连接问题');
    console.log('   2. Authing 服务不可用');
    console.log('   3. App ID 错误');
  }
}

// 运行验证
verifyConfig(); 