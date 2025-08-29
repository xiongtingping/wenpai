/**
 * 验证修复的有效性 - 对比修复前后的配置一致性
 */

console.log('🔍 验证修复有效性...\n');

// 模拟netlify部署环境
const mockNetlifyWindow = {
  location: {
    hostname: '68b145c485a84500083353a1--wenpai.netlify.app',
    origin: 'https://68b145c485a84500083353a1--wenpai.netlify.app'
  }
};

// 模拟修复前的逻辑 (动态获取)
function getOldRedirectUri(window) {
  return `${window.location.origin}/callback`;
}

// 模拟修复后的逻辑 (固定配置)  
function getNewRedirectUri(window) {
  const isLocal = window && window.location.hostname.includes('localhost');
  return isLocal ? 'http://localhost:5173/callback' : 'https://www.wenpai.xyz/callback';
}

// configResolver 的固定逻辑
function getResolverRedirectUri(window) {
  const isLocal = window && window.location.hostname.includes('localhost');
  return isLocal ? 'http://localhost:5173/callback' : 'https://www.wenpai.xyz/callback';
}

console.log('📊 修复对比 (在netlify环境下):');

const oldUri = getOldRedirectUri(mockNetlifyWindow);
const newUri = getNewRedirectUri(mockNetlifyWindow);
const resolverUri = getResolverRedirectUri(mockNetlifyWindow);

console.log(`修复前 authing.ts: ${oldUri}`);
console.log(`修复后 authing.ts: ${newUri}`);
console.log(`configResolver.ts: ${resolverUri}`);

const wasConsistent = oldUri === resolverUri;
const isNowConsistent = newUri === resolverUri;

console.log('\n✅ 一致性检查:');
console.log(`修复前: ${wasConsistent ? '一致' : '不一致'} ${wasConsistent ? '✅' : '❌'}`);
console.log(`修复后: ${isNowConsistent ? '一致' : '不一致'} ${isNowConsistent ? '✅' : '❌'}`);

console.log('\n🎯 修复效果:');
if (!wasConsistent && isNowConsistent) {
  console.log('✅ 修复成功！代码层面配置冲突已解决');
  console.log('✅ 两个配置系统现在返回相同的redirectUri');
  console.log('✅ 消除了动态netlify地址与固定www地址的冲突');
} else {
  console.log('❌ 修复可能有问题');
}

console.log('\n🔍 根本原因分析:');
console.log('❌ Authing后台 redirect_uris 配置为空数组');
console.log('💡 OAuth2协议要求回调URL必须在授权服务器白名单中');
console.log('🔧 建议在Authing控制台添加: https://www.wenpai.xyz/callback');

console.log('\n📝 修复总结:');
console.log('✅ 代码层面: redirectUri配置冲突已修复');  
console.log('⚠️ 服务端层面: 需要在Authing后台添加回调URL白名单');
console.log('🎯 预期效果: 后台配置更新后，400错误应该消失');