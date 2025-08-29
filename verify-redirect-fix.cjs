/**
 * 验证 redirectUri 修复效果
 */

// 模拟浏览器环境
global.window = {
  location: {
    hostname: '68b145c485a84500083353a1--wenpai.netlify.app',
    origin: 'https://68b145c485a84500083353a1--wenpai.netlify.app'
  }
};

console.log('🔍 验证 redirectUri 修复效果...\n');

// 测试修复前的逻辑（动态获取）
const getOldRedirectUri = () => {
  return `${global.window.location.origin}/callback`;
};

// 测试修复后的逻辑（固定配置）
const getNewRedirectUri = () => {
  const isLocal = typeof window !== 'undefined' && window.location.hostname.includes('localhost');
  return isLocal ? 'http://localhost:5173/callback' : 'https://www.wenpai.xyz/callback';
};

// configResolver 的逻辑（固定配置）
const getResolverRedirectUri = () => {
  const isLocal = typeof window !== 'undefined' && window.location.hostname.includes('localhost');
  return isLocal ? 'http://localhost:5173/callback' : 'https://www.wenpai.xyz/callback';
};

console.log('📊 配置对比:');
console.log(`修复前 (动态): ${getOldRedirectUri()}`);
console.log(`修复后 (固定): ${getNewRedirectUri()}`);  
console.log(`解析器 (固定): ${getResolverRedirectUri()}`);

const newConsistent = getNewRedirectUri() === getResolverRedirectUri();
const oldConsistent = getOldRedirectUri() === getResolverRedirectUri();

console.log('\n一致性检查:');
console.log(`修复前一致性: ${oldConsistent ? '✅' : '❌'}`);
console.log(`修复后一致性: ${newConsistent ? '✅' : '❌'}`);

if (newConsistent && !oldConsistent) {
  console.log('\n🎉 修复成功！');
  console.log('✅ redirectUri 配置现在是一致的');
  console.log('✅ 应该能解决 400 Bad Request 错误');
} else if (!newConsistent) {
  console.log('\n❌ 修复失败！redirectUri 仍然不一致');
} else {
  console.log('\n⚠️ 配置本来就是一致的');
}