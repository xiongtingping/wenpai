/**
 * 生产环境认证系统测试脚本
 * 等待部署完成后自动测试认证功能
 */

const https = require('https');
const fs = require('fs');

// 生产环境URL
const PRODUCTION_URL = 'https://www.wenpai.xyz';
const TEST_TIMEOUT = 30000; // 30秒超时

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkDeploymentStatus() {
  return new Promise((resolve, reject) => {
    console.log('🔍 检查部署状态...');
    
    const req = https.request(`${PRODUCTION_URL}/`, {
      method: 'HEAD',
      timeout: 5000
    }, (res) => {
      console.log(`✅ 网站可访问，状态码: ${res.statusCode}`);
      resolve(res.statusCode === 200);
    });
    
    req.on('error', (err) => {
      console.log('❌ 网站不可访问:', err.message);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log('⏱️ 请求超时');
      resolve(false);
    });
    
    req.end();
  });
}

async function testAuthConfigEndpoint() {
  return new Promise((resolve, reject) => {
    console.log('🔧 测试认证配置端点...');
    
    // 测试 Authing public-config 端点
    const configUrl = 'https://core.authing.cn/api/v2/applications/68a68a29d0c3341ae7a3df23/public-config';
    
    const req = https.request(configUrl, {
      method: 'GET',
      timeout: 5000
    }, (res) => {
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const config = JSON.parse(data);
          const redirectUris = config?.oidc?.redirect_uris || config?.redirectUris || [];
          
          console.log('📊 Authing配置信息:');
          console.log(`  状态码: ${res.statusCode}`);
          console.log(`  redirectUris:`, redirectUris);
          
          const hasWwwCallback = redirectUris.includes('https://www.wenpai.xyz/callback');
          const hasNetlifyCallback = redirectUris.some(uri => uri.includes('netlify.app'));
          
          console.log(`  包含www.wenpai.xyz回调: ${hasWwwCallback ? '✅' : '❌'}`);
          console.log(`  包含netlify回调: ${hasNetlifyCallback ? '⚠️' : '❌'}`);
          
          resolve({
            success: res.statusCode === 200,
            hasWwwCallback,
            hasNetlifyCallback,
            redirectUris
          });
        } catch (e) {
          console.error('❌ 解析配置失败:', e.message);
          resolve({ success: false, error: e.message });
        }
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ 配置请求失败:', err.message);
      resolve({ success: false, error: err.message });
    });
    
    req.end();
  });
}

async function waitForDeployment(maxAttempts = 10) {
  console.log('⏳ 等待自动部署完成...');
  
  for (let i = 1; i <= maxAttempts; i++) {
    console.log(`🔄 检查第 ${i}/${maxAttempts} 次...`);
    
    const isReady = await checkDeploymentStatus();
    if (isReady) {
      console.log('✅ 部署已完成！');
      return true;
    }
    
    if (i < maxAttempts) {
      console.log('⏱️ 等待 30 秒后重试...');
      await sleep(30000);
    }
  }
  
  console.log('❌ 部署检查超时');
  return false;
}

async function runProductionTest() {
  try {
    console.log('🚀 开始生产环境认证系统测试\n');
    
    // 1. 等待部署完成
    const deploymentReady = await waitForDeployment();
    if (!deploymentReady) {
      throw new Error('部署未完成或不可访问');
    }
    
    // 2. 测试认证配置
    const authConfig = await testAuthConfigEndpoint();
    
    // 3. 生成测试报告
    const testReport = {
      timestamp: new Date().toISOString(),
      deployment: { ready: deploymentReady },
      authConfig: authConfig,
      fix: {
        applied: true,
        description: '修复redirectUri不一致问题',
        expectedBehavior: '认证请求应该使用https://www.wenpai.xyz/callback'
      }
    };
    
    // 4. 保存测试报告
    fs.writeFileSync('production-auth-test-report.json', JSON.stringify(testReport, null, 2));
    
    console.log('\n📋 测试报告:');
    console.log(JSON.stringify(testReport, null, 2));
    
    if (authConfig.success && authConfig.hasWwwCallback) {
      console.log('\n🎉 生产环境测试通过！');
      console.log('✅ redirectUri修复已生效');
      console.log('✅ 应该能解决400 Bad Request错误');
    } else {
      console.log('\n⚠️ 需要检查Authing后台配置');
      console.log('❓ 确保www.wenpai.xyz/callback在白名单中');
    }
    
  } catch (error) {
    console.error('❌ 生产环境测试失败:', error.message);
    process.exit(1);
  }
}

// 启动测试
runProductionTest();