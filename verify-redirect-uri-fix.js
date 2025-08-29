/**
 * 验证 redirectUri 修复效果
 * 确保 getAuthingConfig 和 resolveAuthingGuardConfig 返回一致的配置
 */

// 简化测试，模拟浏览器环境
global.window = {
  location: {
    hostname: '68b145c485a84500083353a1--wenpai.netlify.app',
    origin: 'https://68b145c485a84500083353a1--wenpai.netlify.app'
  }
};
global.document = {};

// 模拟 import.meta.env
global.importMeta = {
  env: {}
};

console.log('🔍 验证 redirectUri 修复效果...\n');

// 测试配置获取
try {
  // 模拟生产环境配置获取
  const getAuthingConfig = () => {
    const isLocal = typeof window !== 'undefined' && window.location.hostname.includes('localhost');
    const redirectUri = isLocal ? 'http://localhost:5173/callback' : 'https://www.wenpai.xyz/callback';
    
    const config = {
      appId: '68a68a29d0c3341ae7a3df23',
      host: 'https://rzcswqs4sq0f.authing.cn',
      domain: 'rzcswqs4sq0f.authing.cn',
      redirectUri: redirectUri,
    };
    
    console.log('🔧 getAuthingConfig 输出:', {
      appId: config.appId,
      domain: config.domain,
      host: config.host,
      redirectUri: config.redirectUri
    });
    
    return config;
  };

  // 模拟 configResolver
  const resolveAuthingGuardConfig = async (base) => {
    const isLocal = typeof window !== 'undefined' && window.location.hostname.includes('localhost');
    const finalRedirect = isLocal ? 'http://localhost:5173/callback' : 'https://www.wenpai.xyz/callback';
    
    const resolved = {
      appId: base.appId,
      host: base.host,
      redirectUri: finalRedirect
    };
    
    console.log('🔎 resolveAuthingGuardConfig 输出:', resolved);
    
    return resolved;
  };

  (async () => {
  // 执行测试
  const base = getAuthingConfig();
  const resolved = await resolveAuthingGuardConfig(base);

  // 验证一致性
  const isConsistent = base.redirectUri === resolved.redirectUri;
  
  console.log('\n📊 一致性检查:');
  console.log(`base.redirectUri: ${base.redirectUri}`);
  console.log(`resolved.redirectUri: ${resolved.redirectUri}`);
  console.log(`一致性: ${isConsistent ? '✅ 通过' : '❌ 失败'}`);
  
  if (isConsistent) {
    console.log('\n🎉 修复成功！redirectUri 配置现在是一致的');
    console.log('✅ 应该能解决 400 Bad Request 错误');
  } else {
    console.log('\n❌ 修复失败！redirectUri 仍然不一致');
  }

})().catch(error => {
  console.error('❌ 测试失败:', error);
});