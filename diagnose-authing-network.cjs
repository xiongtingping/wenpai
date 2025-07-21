#!/usr/bin/env node

/**
 * 诊断Authing网络连接问题
 */

const https = require('https');
const { URL } = require('url');

console.log('🔧 诊断Authing网络连接问题...\n');

const appId = '687c5c7f4e778a6485a4f0e0';
const host = 'ai-wenpai.authing.cn/687e0aafee2b84f86685b644';

/**
 * 测试URL连接
 */
function testUrl(url, description = '') {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };

    console.log(`🔍 测试: ${description || url}`);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const result = {
          url,
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          success: res.statusCode >= 200 && res.statusCode < 400,
          isRedirect: res.statusCode >= 300 && res.statusCode < 400,
          location: res.headers.location
        };
        
        if (result.success) {
          console.log(`   ✅ 状态: ${result.status} ${result.statusText}`);
        } else if (result.isRedirect) {
          console.log(`   🔄 重定向: ${result.status} ${result.statusText} -> ${result.location}`);
        } else {
          console.log(`   ❌ 错误: ${result.status} ${result.statusText}`);
        }
        
        resolve(result);
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ 连接错误: ${error.message}`);
      resolve({
        url,
        error: error.message,
        success: false
      });
    });

    req.on('timeout', () => {
      req.destroy();
      console.log(`   ⏰ 请求超时`);
      resolve({
        url,
        error: '请求超时',
        success: false
      });
    });

    req.end();
  });
}

/**
 * 主诊断函数
 */
async function runDiagnosis() {
  console.log('📋 当前配置:');
  console.log(`   App ID: ${appId}`);
  console.log(`   Host: ${host}`);
  console.log(`   回调URL: https://wenpai.netlify.app/callback`);
  console.log('');

  console.log('🌐 网络连接诊断...\n');

  // 1. 测试基础连接
  await testUrl(`https://${host}`, 'Authing主域名');
  console.log('');

  // 2. 测试OIDC端点
  await testUrl(`https://${host}/oidc/auth`, 'OIDC认证端点');
  console.log('');

  // 3. 测试完整的OIDC URL
  const oidcUrl = `https://${host}/oidc/auth?client_id=${appId}&redirect_uri=${encodeURIComponent('https://wenpai.netlify.app/callback')}&response_type=code&scope=openid+profile+email&state=test-${Date.now()}`;
  await testUrl(oidcUrl, '完整OIDC登录URL');
  console.log('');

  // 4. 测试控制台
  await testUrl('https://console.authing.cn', 'Authing控制台');
  console.log('');

  // 5. 测试DNS解析
  console.log('🔍 DNS解析测试:');
  const dns = require('dns').promises;
  try {
    const addresses = await dns.resolve4(host);
    console.log(`   ✅ ${host} 解析到: ${addresses.join(', ')}`);
  } catch (error) {
    console.log(`   ❌ DNS解析失败: ${error.message}`);
  }
  console.log('');

  // 6. 提供解决方案
  console.log('📝 如果出现连接问题，请尝试以下解决方案:');
  console.log('');
  console.log('1. 网络连接问题:');
  console.log('   - 检查网络连接是否正常');
  console.log('   - 尝试使用VPN或代理');
  console.log('   - 检查防火墙设置');
  console.log('');
  console.log('2. 浏览器问题:');
  console.log('   - 清除浏览器缓存和Cookie');
  console.log('   - 尝试无痕模式');
  console.log('   - 尝试不同的浏览器');
  console.log('');
  console.log('3. Authing服务问题:');
  console.log('   - 等待几分钟后重试');
  console.log('   - 检查Authing服务状态');
  console.log('   - 联系Authing技术支持');
  console.log('');
  console.log('4. 临时解决方案:');
  console.log('   - 使用移动网络测试');
  console.log('   - 尝试不同的网络环境');
  console.log('   - 检查是否有网络限制');
  console.log('');

  console.log('🔗 直接访问Authing控制台:');
  console.log(`   https://console.authing.cn/console/app/${appId}/detail`);
  console.log('');
  
  console.log('🔗 直接访问Authing登录页面:');
  console.log(`   ${oidcUrl}`);
  console.log('');
}

// 运行诊断
runDiagnosis().catch(console.error); 