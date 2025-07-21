/**
 * 全面Authing诊断脚本
 * 检查所有可能的Authing配置和状态
 */

const https = require('https');

console.log('🔍 全面Authing诊断...\n');

// 所有可能的配置
const allConfigs = [
  {
    name: '新应用配置',
    appId: '687bc631c105de597b993202',
    host: 'ai-wenpai.authing.cn/687e0aafee2b84f86685b644',
    redirectUri: 'http://localhost:5173/callback'
  },
  {
    name: '旧应用配置',
    appId: '687e0aafee2b84f86685b644',
    host: 'ai-wenpai.authing.cn/687e0aafee2b84f86685b644',
    redirectUri: 'http://localhost:5173/callback'
  },
  {
    name: '备用配置1',
    appId: '687e0aafee2b84f86685b644',
    host: 'wenpai.authing.cn',
    redirectUri: 'http://localhost:5173/callback'
  }
];

// 测试函数
async function testEndpoint(url, description) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`✅ ${description}: ${res.statusCode} ${res.statusMessage}`);
        if (res.statusCode === 200 && data.length < 1000) {
          try {
            const jsonData = JSON.parse(data);
            console.log(`   📄 响应数据:`, JSON.stringify(jsonData, null, 2));
          } catch (e) {
            console.log(`   📄 响应数据: ${data.substring(0, 200)}...`);
          }
        }
        resolve({ success: true, status: res.statusCode });
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${description}: ${err.message}`);
      resolve({ success: false, error: err.message });
    });
    
    req.setTimeout(5000, () => {
      console.log(`⏰ ${description}: 请求超时`);
      resolve({ success: false, error: 'timeout' });
    });
  });
}

// 测试单个配置
async function testConfig(config) {
  console.log(`\n🧪 测试 ${config.name}:`);
  console.log(`- App ID: ${config.appId}`);
  console.log(`- 域名: ${config.host}`);
  console.log(`- 回调地址: ${config.redirectUri}`);
  console.log('');
  
  const results = [];
  
  // 测试1: 域名访问
  results.push(await testEndpoint(
    `https://${config.host}`,
    `${config.name} - 域名访问`
  ));
  
  // 测试2: 应用公共配置
  results.push(await testEndpoint(
    `https://${config.host}/api/v3/applications/${config.appId}/public-config`,
    `${config.name} - 应用公共配置`
  ));
  
  // 测试3: 登录页面
  results.push(await testEndpoint(
    `https://${config.host}/login?app_id=${config.appId}`,
    `${config.name} - 登录页面`
  ));
  
  // 测试4: 注册页面
  results.push(await testEndpoint(
    `https://${config.host}/register?app_id=${config.appId}`,
    `${config.name} - 注册页面`
  ));
  
  // 计算成功率
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  const successRate = (successCount / totalCount * 100).toFixed(1);
  
  console.log(`\n📊 ${config.name} 测试结果: ${successCount}/${totalCount} (${successRate}%)`);
  
  return {
    config,
    results,
    successRate: parseFloat(successRate)
  };
}

// 运行所有测试
async function runAllTests() {
  console.log('🚀 开始全面诊断...\n');
  
  const allResults = [];
  
  for (const config of allConfigs) {
    const result = await testConfig(config);
    allResults.push(result);
  }
  
  // 分析结果
  console.log('\n📋 诊断结果分析:');
  console.log('================================');
  
  allResults.forEach(result => {
    const status = result.successRate >= 75 ? '✅' : result.successRate >= 50 ? '⚠️' : '❌';
    console.log(`${status} ${result.config.name}: ${result.successRate}% 成功率`);
  });
  
  // 找出最佳配置
  const bestConfig = allResults.reduce((best, current) => {
    return current.successRate > best.successRate ? current : best;
  });
  
  console.log('\n🎯 推荐配置:');
  console.log('================================');
  if (bestConfig.successRate > 0) {
    console.log(`✅ 最佳配置: ${bestConfig.config.name}`);
    console.log(`- App ID: ${bestConfig.config.appId}`);
    console.log(`- 域名: ${bestConfig.config.host}`);
    console.log(`- 成功率: ${bestConfig.successRate}%`);
    
    console.log('\n🔧 建议操作:');
    console.log('================================');
    console.log('1. 使用最佳配置更新环境变量');
    console.log('2. 重启开发服务器');
    console.log('3. 测试登录功能');
    console.log('4. 如果仍有问题，检查Authing控制台配置');
  } else {
    console.log('❌ 所有配置都有问题');
    console.log('建议:');
    console.log('1. 检查Authing控制台');
    console.log('2. 重新创建应用');
    console.log('3. 确保用户池配置正确');
  }
  
  console.log('\n✅ 诊断完成！');
}

runAllTests().catch(console.error); 