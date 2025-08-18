#!/usr/bin/env node

/**
 * 测试正确的Authing端点格式
 * 根据Authing官方文档，OIDC端点可能有不同的路径格式
 */

const https = require('https');

console.log('🔍 测试正确的Authing端点格式');
console.log('================================\n');

// 根据历史配置，测试不同的端点路径格式
const testConfigs = [
  {
    name: '标准OIDC路径',
    host: 'rzcswqs4sq0f.authing.cn',
    paths: [
      '/oidc/.well-known/openid_configuration',
      '/.well-known/openid_configuration',
      '/api/v2/oidc/.well-known/openid_configuration'
    ]
  },
  {
    name: '带App ID的路径',
    host: 'rzcswqs4sq0f.authing.cn',
    appId: '68823897631e1ef8ff3720b2',
    paths: [
      '/68823897631e1ef8ff3720b2/oidc/.well-known/openid_configuration',
      '/68823897631e1ef8ff3720b2/.well-known/openid_configuration'
    ]
  }
];

function testPath(host, path) {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: host,
      path: path,
      method: 'GET',
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AuthingTest/1.0)'
      }
    }, (res) => {
      console.log(`   📡 ${path}`);
      console.log(`   📊 状态码: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const config = JSON.parse(data);
            console.log(`   ✅ 有效的OIDC配置`);
            console.log(`   🔗 授权端点: ${config.authorization_endpoint || 'N/A'}`);
            console.log(`   🔗 Token端点: ${config.token_endpoint || 'N/A'}`);
            resolve({ status: 'success', path, config });
          } catch (e) {
            console.log(`   ❌ JSON解析失败`);
            resolve({ status: 'invalid_json', path });
          }
        });
      } else if (res.statusCode === 301 || res.statusCode === 302) {
        console.log(`   🔄 重定向到: ${res.headers.location}`);
        resolve({ status: 'redirect', path, location: res.headers.location });
      } else {
        console.log(`   ❌ 端点不可用`);
        resolve({ status: 'not_found', path });
      }
    });

    req.on('error', (err) => {
      console.log(`   ❌ 连接失败: ${err.message}`);
      resolve({ status: 'error', path, error: err.message });
    });

    req.on('timeout', () => {
      console.log(`   ❌ 连接超时`);
      req.destroy();
      resolve({ status: 'timeout', path });
    });

    req.end();
  });
}

async function testAllConfigs() {
  const allResults = [];

  for (const config of testConfigs) {
    console.log(`🧪 测试: ${config.name}`);
    console.log(`   Host: ${config.host}`);
    if (config.appId) {
      console.log(`   App ID: ${config.appId.substring(0, 8)}...`);
    }
    console.log('');

    const results = [];
    for (const path of config.paths) {
      const result = await testPath(config.host, path);
      results.push(result);
      console.log('');
    }

    allResults.push({ config, results });
  }

  // 分析结果
  console.log('📋 测试结果分析:');
  console.log('================================');

  const workingEndpoints = [];
  const redirects = [];

  allResults.forEach(({ config, results }) => {
    results.forEach(result => {
      if (result.status === 'success') {
        workingEndpoints.push({ config, result });
      } else if (result.status === 'redirect') {
        redirects.push({ config, result });
      }
    });
  });

  if (workingEndpoints.length > 0) {
    console.log('\n✅ 发现可用的OIDC端点:');
    workingEndpoints.forEach(({ config, result }) => {
      console.log(`   ${config.name}: ${result.path}`);
      console.log(`   完整URL: https://${config.host}${result.path}`);
    });
  }

  if (redirects.length > 0) {
    console.log('\n🔄 发现重定向:');
    redirects.forEach(({ config, result }) => {
      console.log(`   ${config.name}: ${result.path} -> ${result.location}`);
    });
  }

  if (workingEndpoints.length === 0 && redirects.length === 0) {
    console.log('\n❌ 未发现可用的OIDC端点');
    console.log('\n🔧 可能的原因:');
    console.log('   1. Authing应用未正确配置');
    console.log('   2. 域名配置错误');
    console.log('   3. 网络连接问题');
    console.log('   4. Authing服务暂时不可用');
    
    console.log('\n💡 建议操作:');
    console.log('   1. 检查Authing控制台中的应用配置');
    console.log('   2. 确认App ID和域名是否正确');
    console.log('   3. 尝试直接访问Authing登录页面');
  }

  return { workingEndpoints, redirects };
}

// 额外测试：尝试访问登录页面
async function testLoginPage() {
  console.log('\n🔐 测试登录页面可用性:');
  console.log('================================');

  const loginUrls = [
    'https://rzcswqs4sq0f.authing.cn/68823897631e1ef8ff3720b2/login',
    'https://rzcswqs4sq0f.authing.cn/login?app_id=68823897631e1ef8ff3720b2'
  ];

  for (const url of loginUrls) {
    console.log(`🧪 测试登录页面: ${url}`);
    
    try {
      const urlObj = new URL(url);
      const result = await testPath(urlObj.hostname, urlObj.pathname + urlObj.search);
      
      if (result.status === 'success' || result.status === 'redirect') {
        console.log(`   ✅ 登录页面可访问`);
      } else {
        console.log(`   ❌ 登录页面不可访问`);
      }
    } catch (e) {
      console.log(`   ❌ URL格式错误: ${e.message}`);
    }
    console.log('');
  }
}

async function main() {
  const { workingEndpoints } = await testAllConfigs();
  await testLoginPage();

  if (workingEndpoints.length > 0) {
    console.log('\n🎯 推荐配置:');
    const recommended = workingEndpoints[0];
    console.log(`   使用: ${recommended.config.name}`);
    console.log(`   OIDC端点: https://${recommended.config.host}${recommended.result.path}`);
    
    if (recommended.result.config) {
      console.log(`   授权端点: ${recommended.result.config.authorization_endpoint}`);
      console.log(`   Token端点: ${recommended.result.config.token_endpoint}`);
    }
  }
}

main().catch(console.error);
