/**
 * 验证Authing后台配置状态
 */

const https = require('https');

async function checkAuthingConfig() {
  console.log('🔍 检查Authing后台配置状态...\n');
  
  const appId = '68a68a29d0c3341ae7a3df23';
  const configUrl = `https://core.authing.cn/api/v2/applications/${appId}/public-config`;
  
  return new Promise((resolve) => {
    const req = https.request(configUrl, {
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    }, (res) => {
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const config = JSON.parse(data);
          
          console.log('📊 Authing应用配置:');
          console.log(`  App ID: ${config.id || 'N/A'}`);
          console.log(`  名称: ${config.name || 'N/A'}`);
          console.log(`  域名: ${config.domain || 'N/A'}`);
          
          const redirectUris = config?.oidc?.redirect_uris || config?.redirectUris || [];
          console.log(`  redirect_uris: [${redirectUris.length}] ${JSON.stringify(redirectUris)}`);
          
          const hasWwwCallback = redirectUris.includes('https://www.wenpai.xyz/callback');
          const hasLocalhostCallback = redirectUris.includes('http://localhost:5173/callback');
          
          console.log('\n🎯 回调URL检查:');
          console.log(`  ✅ www.wenpai.xyz: ${hasWwwCallback ? '已配置' : '❌ 缺失'}`);
          console.log(`  🛠️ localhost:5173: ${hasLocalhostCallback ? '已配置' : '❌ 缺失'}`);
          
          if (!hasWwwCallback) {
            console.log('\n🔧 需要在Authing控制台添加:');
            console.log('  https://www.wenpai.xyz/callback');
            console.log('  http://localhost:5173/callback');
          }
          
          resolve({
            success: true,
            redirectUris,
            hasRequired: hasWwwCallback && hasLocalhostCallback
          });
          
        } catch (e) {
          console.error('❌ 解析失败:', e.message);
          resolve({ success: false, error: e.message });
        }
      });
    });
    
    req.on('error', (err) => {
      console.error('❌ 请求失败:', err.message);
      resolve({ success: false, error: err.message });
    });
    
    req.end();
  });
}

async function monitorConfigChanges(intervalMs = 30000) {
  console.log('🔄 开始监控Authing配置变化...');
  console.log(`📍 检查间隔: ${intervalMs/1000}秒\n`);
  
  let lastConfig = null;
  let attempts = 0;
  const maxAttempts = 10; // 最多检查10次 (5分钟)
  
  while (attempts < maxAttempts) {
    attempts++;
    console.log(`🔍 第 ${attempts}/${maxAttempts} 次检查...`);
    
    const config = await checkAuthingConfig();
    
    if (config.success && config.hasRequired) {
      console.log('\n🎉 检测到配置已更新！');
      console.log('✅ 所需的回调URL已添加到白名单');
      return true;
    }
    
    if (attempts < maxAttempts) {
      console.log(`⏱️ 等待 ${intervalMs/1000} 秒后重试...\n`);
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }
  
  console.log('\n⚠️ 监控超时，配置可能需要手动更新');
  return false;
}

// 立即检查一次，然后开始监控
checkAuthingConfig().then(result => {
  if (result.success && result.hasRequired) {
    console.log('\n🎉 配置已正确！可以开始测试认证流程');
  } else {
    console.log('\n📝 等待后台配置更新...');
    // 不启动监控，让用户手动配置后再测试
  }
});