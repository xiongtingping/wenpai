/**
 * Authing 应用诊断脚本
 */

const { AuthenticationClient } = require('authing-js-sdk');

// Authing 配置
const config = {
  appId: '6867fdc88034eb95ae86167d',
  host: 'https://qutkgzkfaezk-demo.authing.cn',
};

console.log('🔍 Authing 应用诊断');
console.log('==================');
console.log('');

console.log('📋 应用信息:');
console.log(`   App ID: ${config.appId}`);
console.log(`   Host: ${config.host}`);
console.log('');

console.log('🔧 诊断步骤:');
console.log('');
console.log('1. 📧 邮箱服务配置检查:');
console.log('   - 登录 Authing 控制台: https://console.authing.cn/');
console.log('   - 进入应用设置 → "登录配置"');
console.log('   - 检查"邮箱验证码登录/注册/找回密码"是否已启用');
console.log('   - 检查"邮箱服务"是否已配置（如 SendGrid、阿里云等）');
console.log('');

console.log('2. 📧 邮箱模板检查:');
console.log('   - 进入"消息服务" → "邮箱模板"');
console.log('   - 确认验证码模板是否已启用');
console.log('   - 检查模板内容是否正确');
console.log('');

console.log('3. 🔒 安全设置检查:');
console.log('   - 进入"安全设置"');
console.log('   - 检查域名白名单是否包含 www.wenpai.xyz');
console.log('   - 检查 IP 白名单设置');
console.log('');

console.log('4. 📊 应用状态检查:');
console.log('   - 确认应用状态为"正常"');
console.log('   - 检查应用是否在免费额度内');
console.log('   - 检查邮箱服务额度是否用完');
console.log('');

console.log('5. 🔗 回调地址检查:');
console.log('   - 确认回调地址包含: https://www.wenpai.xyz/callback');
console.log('   - 检查重定向地址设置');
console.log('');

console.log('6. 📝 常见问题:');
console.log('   - 免费版 Authing 可能限制邮箱验证码功能');
console.log('   - 邮箱服务未配置或配置错误');
console.log('   - 邮箱模板未启用或内容错误');
console.log('   - 域名未加入白名单');
console.log('   - 应用状态异常');
console.log('');

console.log('7. 🛠️ 解决方案:');
console.log('   - 升级到付费版 Authing');
console.log('   - 配置邮箱服务（SendGrid、阿里云、腾讯云等）');
console.log('   - 启用并配置邮箱模板');
console.log('   - 将域名加入白名单');
console.log('   - 联系 Authing 技术支持');
console.log('');

// 尝试获取应用信息
async function checkAppInfo() {
  try {
    const authing = new AuthenticationClient({
      appId: config.appId,
      appHost: config.host,
    });

    console.log('🔍 尝试获取应用信息...');
    
    // 尝试获取当前用户（测试连接）
    try {
      const user = await authing.getCurrentUser();
      console.log('   ✅ 应用连接正常');
      if (user) {
        console.log(`   👤 当前用户: ${user.email || user.username}`);
      } else {
        console.log('   👤 当前无用户登录');
      }
    } catch (error) {
      console.log(`   ⚠️ 应用连接测试: ${error.message}`);
    }

  } catch (error) {
    console.log(`   ❌ 应用连接失败: ${error.message}`);
  }
}

checkAppInfo(); 