/**
 * 🔍 浏览器端Authing配置验证脚本
 * 在浏览器控制台运行此脚本来验证配置
 */

console.log('🔍 开始验证Authing配置...\n');

// 预期配置
const EXPECTED_APP_ID = '68823897631e1ef8ff3720b2';
const EXPECTED_DOMAIN = 'rzcswqd4sq0f.authing.cn';

console.log('📋 预期配置:');
console.log('App ID:', EXPECTED_APP_ID);
console.log('Domain:', EXPECTED_DOMAIN);
console.log('');

// 检查环境变量
console.log('🔧 检查环境变量:');
console.log('import.meta.env.VITE_AUTHING_APP_ID:', import.meta?.env?.VITE_AUTHING_APP_ID);
console.log('import.meta.env.VITE_AUTHING_DOMAIN:', import.meta?.env?.VITE_AUTHING_DOMAIN);
console.log('import.meta.env.VITE_AUTHING_HOST:', import.meta?.env?.VITE_AUTHING_HOST);

// 检查window.__ENV__
console.log('');
console.log('🔧 检查window.__ENV__:');
console.log('window.__ENV__:', window.__ENV__);

// 尝试获取Authing配置
console.log('');
console.log('🔧 尝试获取Authing配置:');

try {
  // 动态导入配置模块
  import('/src/config/authing.ts').then(module => {
    console.log('✅ 成功导入authing.ts模块');
    
    try {
      const config = module.getAuthingConfig();
      console.log('✅ 成功获取Authing配置:', config);
      
      // 验证配置
      const appIdCorrect = config.appId === EXPECTED_APP_ID;
      const domainCorrect = config.domain === EXPECTED_DOMAIN;
      
      console.log('');
      console.log('📊 配置验证结果:');
      console.log(`App ID (${config.appId}): ${appIdCorrect ? '✅' : '❌'}`);
      console.log(`Domain (${config.domain}): ${domainCorrect ? '✅' : '❌'}`);
      console.log(`Host: ${config.host}`);
      console.log(`Redirect URI: ${config.redirectUri}`);
      
      if (appIdCorrect && domainCorrect) {
        console.log('');
        console.log('🎉 Authing配置验证成功！');
        console.log('现在可以尝试初始化Guard实例...');
        
        // 尝试初始化Guard
        try {
          // 这里需要实际的Guard初始化代码
          console.log('🔧 准备测试Guard初始化...');
        } catch (guardError) {
          console.error('❌ Guard初始化失败:', guardError);
        }
      } else {
        console.log('');
        console.log('❌ 配置验证失败，请检查环境变量');
      }
      
    } catch (configError) {
      console.error('❌ 获取Authing配置失败:', configError);
    }
    
  }).catch(importError => {
    console.error('❌ 导入authing.ts模块失败:', importError);
  });
  
} catch (error) {
  console.error('❌ 验证过程出错:', error);
}

console.log('');
console.log('📞 请在浏览器控制台查看详细结果');
console.log('如果看到错误，请检查网络面板和控制台日志');
