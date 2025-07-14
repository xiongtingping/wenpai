/**
 * 邮箱验证码测试脚本
 * 测试 Authing 邮箱验证码发送功能
 */

const { AuthenticationClient } = require('authing-js-sdk');

// Authing 配置
const config = {
  appId: '6867fdc88034eb95ae86167d',
  host: 'https://qutkgzkfaezk-demo.authing.cn',
  redirectUri: 'https://www.wenpai.xyz/callback',
};

// 创建 Authing 实例
const authing = new AuthenticationClient({
  appId: config.appId,
  appHost: config.host,
});

/**
 * 测试发送邮箱验证码
 */
async function testEmailVerification(email) {
  console.log('📧 邮箱验证码测试');
  console.log('================');
  console.log('');
  
  try {
    console.log(`📋 测试配置:`);
    console.log(`   App ID: ${config.appId}`);
    console.log(`   Host: ${config.host}`);
    console.log(`   目标邮箱: ${email}`);
    console.log('');

    // 1. 测试发送邮箱验证码
    console.log('1. 📤 发送邮箱验证码...');
    try {
      await authing.sendEmail(email, {
        scene: 'VERIFY_EMAIL'  // 验证邮箱场景
      });
      console.log('   ✅ 验证码发送成功');
      console.log('   📧 请检查邮箱收件箱和垃圾邮件文件夹');
    } catch (error) {
      console.log(`   ❌ 验证码发送失败: ${error.message}`);
      console.log(`   错误代码: ${error.code || '未知'}`);
      console.log(`   错误详情: ${error.data || '无详细信息'}`);
    }
    console.log('');

    // 2. 测试发送注册验证码
    console.log('2. 📝 发送注册验证码...');
    try {
      await authing.sendEmail(email, {
        scene: 'REGISTER'  // 注册场景
      });
      console.log('   ✅ 注册验证码发送成功');
    } catch (error) {
      console.log(`   ❌ 注册验证码发送失败: ${error.message}`);
      console.log(`   错误代码: ${error.code || '未知'}`);
    }
    console.log('');

    // 3. 测试发送登录验证码
    console.log('3. 🔐 发送登录验证码...');
    try {
      await authing.sendEmail(email, {
        scene: 'LOGIN'  // 登录场景
      });
      console.log('   ✅ 登录验证码发送成功');
    } catch (error) {
      console.log(`   ❌ 登录验证码发送失败: ${error.message}`);
      console.log(`   错误代码: ${error.code || '未知'}`);
    }
    console.log('');

    // 4. 测试发送重置密码验证码
    console.log('4. 🔑 发送重置密码验证码...');
    try {
      await authing.sendEmail(email, {
        scene: 'RESET_PASSWORD'  // 重置密码场景
      });
      console.log('   ✅ 重置密码验证码发送成功');
    } catch (error) {
      console.log(`   ❌ 重置密码验证码发送失败: ${error.message}`);
      console.log(`   错误代码: ${error.code || '未知'}`);
    }
    console.log('');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

/**
 * 测试邮箱验证码登录
 */
async function testEmailLogin(email, code) {
  console.log('🔐 测试邮箱验证码登录');
  console.log('==================');
  console.log('');
  
  try {
    console.log(`📧 邮箱: ${email}`);
    console.log(`🔢 验证码: ${code}`);
    console.log('');

    // 尝试使用验证码登录
    console.log('🔄 尝试登录...');
    try {
      const user = await authing.loginByEmailCode(email, code);
      console.log('   ✅ 登录成功');
      console.log(`   用户ID: ${user.id}`);
      console.log(`   用户名: ${user.username || user.nickname || '未设置'}`);
      console.log(`   邮箱: ${user.email}`);
    } catch (error) {
      console.log(`   ❌ 登录失败: ${error.message}`);
      console.log(`   错误代码: ${error.code || '未知'}`);
    }
  } catch (error) {
    console.error('❌ 登录测试过程中发生错误:', error);
  }
}

/**
 * 检查 Authing 应用配置
 */
async function checkAuthingConfig() {
  console.log('🔧 Authing 应用配置检查');
  console.log('======================');
  console.log('');
  
  console.log('📋 当前配置:');
  console.log(`   App ID: ${config.appId}`);
  console.log(`   Host: ${config.host}`);
  console.log(`   重定向 URI: ${config.redirectUri}`);
  console.log('');
  
  console.log('🔍 配置检查建议:');
  console.log('1. 确认 App ID 是否正确');
  console.log('2. 确认 Host 是否可访问');
  console.log('3. 检查 Authing 控制台中的邮箱配置');
  console.log('4. 确认应用是否启用了邮箱验证码功能');
  console.log('5. 检查邮箱模板是否配置正确');
  console.log('');
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📧 邮箱验证码测试工具');
    console.log('==================');
    console.log('');
    console.log('使用方法:');
    console.log('  node test-email-verification.cjs <邮箱地址>');
    console.log('  node test-email-verification.cjs <邮箱地址> <验证码>');
    console.log('');
    console.log('示例:');
    console.log('  node test-email-verification.cjs test@example.com');
    console.log('  node test-email-verification.cjs test@example.com 123456');
    console.log('');
    return;
  }
  
  const email = args[0];
  const code = args[1];
  
  // 检查邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log('❌ 邮箱格式不正确');
    return;
  }
  
  if (code) {
    // 测试登录
    await testEmailLogin(email, code);
  } else {
    // 测试发送验证码
    await checkAuthingConfig();
    await testEmailVerification(email);
  }
}

// 运行测试
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testEmailVerification,
  testEmailLogin,
  checkAuthingConfig,
  authing,
  config,
}; 