/**
 * 🔍 Authing应用状态诊断脚本
 * 从全局角度检查Authing配置和状态
 */

const https = require('https');
const fs = require('fs');

// Authing配置
const AUTHING_CONFIG = {
  appId: '68823897631e1ef8ff3720b2',
  host: 'rzcswqs4sq0f.authing.cn/68823897631e1ef8ff3720b2',
  redirectUri: 'http://localhost:5173/callback'
};

/**
 * 检查Authing应用状态
 */
async function checkAuthingAppStatus() {
  console.log('🔍 开始诊断Authing应用状态...\n');

  // 1. 检查应用基本信息
  console.log('📋 1. 应用基本信息:');
  console.log(`   - 应用ID: ${AUTHING_CONFIG.appId}`);
  console.log(`   - 域名: ${AUTHING_CONFIG.host}`);
  console.log(`   - 回调URI: ${AUTHING_CONFIG.redirectUri}`);
  console.log('');

  // 2. 检查应用是否可访问
  console.log('🌐 2. 检查应用可访问性:');
  try {
    const response = await makeRequest(`https://${AUTHING_CONFIG.host}/oidc/auth`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    console.log('   ✅ Authing服务可访问');
  } catch (error) {
    console.log('   ❌ Authing服务不可访问:', error.message);
  }
  console.log('');

  // 3. 检查授权端点
  console.log('🔐 3. 检查授权端点:');
  const authUrl = `https://${AUTHING_CONFIG.host}/oidc/auth?client_id=${AUTHING_CONFIG.appId}&redirect_uri=${encodeURIComponent(AUTHING_CONFIG.redirectUri)}&scope=openid+profile+email+phone&response_type=code&state=test`;
  
  try {
    const response = await makeRequest(authUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    
    if (response.statusCode === 400) {
      console.log('   ❌ 授权端点返回400错误');
      console.log('   📋 可能的原因:');
      console.log('      - 应用ID不存在或无效');
      console.log('      - 应用未启用');
      console.log('      - 回调URL未正确配置');
      console.log('      - 应用类型配置错误');
    } else if (response.statusCode === 200) {
      console.log('   ✅ 授权端点正常');
    } else {
      console.log(`   ⚠️  授权端点返回状态码: ${response.statusCode}`);
    }
  } catch (error) {
    console.log('   ❌ 授权端点检查失败:', error.message);
  }
  console.log('');

  // 4. 检查项目中的认证系统
  console.log('🏗️  4. 检查项目认证系统:');
  
  // 检查App.tsx中的Provider
  try {
    const appContent = fs.readFileSync('src/App.tsx', 'utf8');
    if (appContent.includes('UnifiedAuthProvider')) {
      console.log('   ✅ App.tsx使用UnifiedAuthProvider');
    } else {
      console.log('   ❌ App.tsx未使用UnifiedAuthProvider');
    }
  } catch (error) {
    console.log('   ❌ 无法读取App.tsx:', error.message);
  }

  // 检查是否有多个认证系统
  try {
    const authContextFiles = fs.readdirSync('src/contexts').filter(file => file.includes('Auth'));
    console.log(`   📁 认证上下文文件: ${authContextFiles.join(', ')}`);
    
    if (authContextFiles.length > 1) {
      console.log('   ⚠️  发现多个认证上下文文件，可能存在冲突');
    }
  } catch (error) {
    console.log('   ❌ 无法检查认证上下文文件:', error.message);
  }
  console.log('');

  // 5. 检查SDK使用情况
  console.log('📦 5. 检查SDK使用情况:');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const authingDeps = Object.keys(packageJson.dependencies || {}).filter(dep => dep.includes('authing'));
    console.log(`   📦 Authing相关依赖: ${authingDeps.join(', ')}`);
  } catch (error) {
    console.log('   ❌ 无法读取package.json:', error.message);
  }
  console.log('');

  // 6. 检查环境变量
  console.log('🔧 6. 检查环境变量:');
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const authingVars = envContent.split('\n').filter(line => line.includes('AUTHING'));
    console.log('   📋 Authing环境变量:');
    authingVars.forEach(var_ => console.log(`      ${var_}`));
  } catch (error) {
    console.log('   ❌ 无法读取.env文件:', error.message);
  }
  console.log('');

  // 7. 生成诊断报告
  console.log('📊 7. 诊断报告:');
  console.log('   🎯 问题分析:');
  console.log('      - 400错误通常表示应用配置问题');
  console.log('      - 可能是应用ID、回调URL或应用状态问题');
  console.log('      - 多个认证系统可能导致冲突');
  console.log('');
  console.log('   🔧 建议解决方案:');
  console.log('      1. 登录Authing控制台检查应用状态');
  console.log('      2. 确认应用ID和域名配置正确');
  console.log('      3. 检查回调URL格式和配置');
  console.log('      4. 统一使用单一认证系统');
  console.log('      5. 清理缓存并重启服务器');
  console.log('');
}

/**
 * 发送HTTP请求
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
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

    req.end();
  });
}

// 运行诊断
checkAuthingAppStatus().catch(console.error);
