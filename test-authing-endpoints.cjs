#!/usr/bin/env node

/**
 * 测试不同Authing端点的可用性
 */

const https = require('https');

console.log('🔍 测试Authing端点可用性');
console.log('================================\n');

// 测试不同的端点配置
const endpoints = [
  {
    name: '当前配置 (rzcswqs4sq0f)',
    host: 'rzcswqs4sq0f.authing.cn',
    appId: '68823897631e1ef8ff3720b2'
  },
  {
    name: '历史配置1 (ai-wenpai)',
    host: 'ai-wenpai.authing.cn',
    appId: '688237f7f9e118de849dc274'
  },
  {
    name: '历史配置2 (wenpaiai)',
    host: 'wenpaiai.authing.cn',
    appId: '687bc631c105de597b993202'
  }
];

function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    console.log(`🧪 测试: ${endpoint.name}`);
    console.log(`   Host: ${endpoint.host}`);
    console.log(`   App ID: ${endpoint.appId.substring(0, 8)}...`);

    // 测试OIDC配置端点
    const req = https.request({
      hostname: endpoint.host,
      path: '/oidc/.well-known/openid_configuration',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      console.log(`   📊 OIDC配置端点状态: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const config = JSON.parse(data);
            console.log(`   ✅ OIDC配置有效`);
            console.log(`   🔗 授权端点: ${config.authorization_endpoint}`);
            console.log(`   🔗 Token端点: ${config.token_endpoint}`);
            resolve({ ...endpoint, status: 'success', config });
          } catch (e) {
            console.log(`   ❌ OIDC配置解析失败`);
            resolve({ ...endpoint, status: 'invalid_json' });
          }
        });
      } else {
        console.log(`   ❌ OIDC配置端点不可用`);
        resolve({ ...endpoint, status: 'not_found' });
      }
    });

    req.on('error', (err) => {
      console.log(`   ❌ 连接失败: ${err.message}`);
      resolve({ ...endpoint, status: 'connection_error', error: err.message });
    });

    req.on('timeout', () => {
      console.log(`   ❌ 连接超时`);
      req.destroy();
      resolve({ ...endpoint, status: 'timeout' });
    });

    req.end();
  });
}

async function testAllEndpoints() {
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    console.log(''); // 空行分隔
  }

  console.log('📋 测试结果总结:');
  console.log('================================');
  
  const workingEndpoints = results.filter(r => r.status === 'success');
  const failedEndpoints = results.filter(r => r.status !== 'success');

  if (workingEndpoints.length > 0) {
    console.log('\n✅ 可用的端点:');
    workingEndpoints.forEach(endpoint => {
      console.log(`   ${endpoint.name}`);
      console.log(`   Host: ${endpoint.host}`);
      console.log(`   App ID: ${endpoint.appId}`);
    });
  }

  if (failedEndpoints.length > 0) {
    console.log('\n❌ 不可用的端点:');
    failedEndpoints.forEach(endpoint => {
      console.log(`   ${endpoint.name}: ${endpoint.status}`);
    });
  }

  // 生成修复建议
  console.log('\n🔧 修复建议:');
  if (workingEndpoints.length > 0) {
    const recommended = workingEndpoints[0];
    console.log(`   推荐使用: ${recommended.name}`);
    console.log(`   更新配置为:`);
    console.log(`   AUTHING_APP_ID="${recommended.appId}"`);
    console.log(`   AUTHING_HOST="https://${recommended.host}"`);
    console.log(`   AUTHING_REDIRECT_URI="https://www.wenpai.xyz/callback"`);
  } else {
    console.log('   ⚠️  所有端点都不可用，可能需要检查网络或Authing服务状态');
  }
}

testAllEndpoints().catch(console.error);
