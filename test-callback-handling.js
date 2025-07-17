#!/usr/bin/env node

/**
 * 测试回调URL处理逻辑
 */

console.log('🧪 测试回调URL处理逻辑...\n');

// 模拟包含多个URL的回调URL
const testCallbackUrl = 'https://www.wenpai.xyz/callback;https://*.netlify.app/callback;http://localhost:5173/callback;?code=tsxKXiDl65O2ylE01p9qa-YkHPOm1gsvGf33aUWP2VJ&state=Dw_IomJNh';

console.log('📝 测试回调URL:');
console.log(testCallbackUrl);
console.log('');

// 解析URL参数
function parseCallbackUrl(url) {
  try {
    // 处理多个URL的情况
    const urlParts = url.split(';');
    const lastUrlPart = urlParts[urlParts.length - 1];
    
    // 分离URL和查询参数
    const [baseUrl, queryString] = lastUrlPart.split('?');
    
    console.log('🔍 解析结果:');
    console.log('- 基础URL:', baseUrl);
    console.log('- 查询参数:', queryString);
    
    if (queryString) {
      const params = new URLSearchParams(queryString);
      console.log('- 授权码:', params.get('code'));
      console.log('- 状态:', params.get('state'));
    }
    
    return {
      baseUrl,
      queryString,
      params: queryString ? new URLSearchParams(queryString) : null
    };
  } catch (error) {
    console.error('❌ 解析失败:', error.message);
    return null;
  }
}

// 测试解析
const result = parseCallbackUrl(testCallbackUrl);

if (result && result.params) {
  console.log('\n✅ 回调URL处理正常');
  console.log('📋 提取的参数:');
  console.log('- code:', result.params.get('code'));
  console.log('- state:', result.params.get('state'));
  
  // 验证授权码格式
  const code = result.params.get('code');
  if (code && code.length > 20) {
    console.log('✅ 授权码格式正确');
  } else {
    console.log('⚠️  授权码格式可能有问题');
  }
} else {
  console.log('\n❌ 回调URL处理失败');
}

console.log('\n🎯 测试完成！'); 