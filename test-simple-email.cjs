/**
 * 简单邮箱发送测试
 */

const { AuthenticationClient } = require('authing-js-sdk');

// Authing 配置
const config = {
  appId: '6867fdc88034eb95ae86167d',
  host: 'https://qutkgzkfaezk-demo.authing.cn',
};

// 创建 Authing 实例
const authing = new AuthenticationClient({
  appId: config.appId,
  appHost: config.host,
});

async function testSimpleEmail() {
  const email = process.argv[2] || 'xiongtingping@gmail.com';
  
  console.log('📧 简单邮箱发送测试');
  console.log('==================');
  console.log('');
  console.log(`📧 目标邮箱: ${email}`);
  console.log('');

  try {
    // 测试1: 不带任何参数
    console.log('1. 测试 sendEmail(email)');
    try {
      await authing.sendEmail(email);
      console.log('   ✅ 发送成功');
    } catch (error) {
      console.log(`   ❌ 发送失败: ${error.message}`);
    }
    console.log('');

    // 测试2: 带场景参数
    console.log('2. 测试 sendEmail(email, { scene: "LOGIN" })');
    try {
      await authing.sendEmail(email, { scene: 'LOGIN' });
      console.log('   ✅ 发送成功');
    } catch (error) {
      console.log(`   ❌ 发送失败: ${error.message}`);
    }
    console.log('');

    // 测试3: 带完整参数
    console.log('3. 测试 sendEmail(email, { scene: "LOGIN", channel: "EMAIL" })');
    try {
      await authing.sendEmail(email, { scene: 'LOGIN', channel: 'EMAIL' });
      console.log('   ✅ 发送成功');
    } catch (error) {
      console.log(`   ❌ 发送失败: ${error.message}`);
    }
    console.log('');

    // 测试4: 使用不同的场景
    console.log('4. 测试 sendEmail(email, { scene: "REGISTER" })');
    try {
      await authing.sendEmail(email, { scene: 'REGISTER' });
      console.log('   ✅ 发送成功');
    } catch (error) {
      console.log(`   ❌ 发送失败: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

testSimpleEmail(); 