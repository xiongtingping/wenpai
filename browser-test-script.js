// 在浏览器控制台中运行此脚本来测试注册URL修复
// 复制粘贴到 https://www.wenpai.xyz 的控制台中

console.log('🧪 开始测试注册URL修复...');

// 正确和错误的App ID
const CORRECT_APP_ID = '68823897631e1ef8ff3720b2';
const WRONG_APP_ID = '688237f8f58e454393add99e';
const CORRECT_HOST = 'https://rzcswqs4sq0f.authing.cn';

// 修复函数
function fixUrlAppId(url) {
  if (!url) return url;
  
  if (url.includes(WRONG_APP_ID)) {
    console.log('🔧 修复URL中的错误App ID:', url);
    const fixedUrl = url.replace(new RegExp(WRONG_APP_ID, 'g'), CORRECT_APP_ID);
    console.log('✅ 修复后的URL:', fixedUrl);
    return fixedUrl;
  }
  
  return url;
}

// 拦截window.location.href设置
const originalLocationSetter = Object.getOwnPropertyDescriptor(window.location, 'href')?.set;
if (originalLocationSetter) {
  Object.defineProperty(window.location, 'href', {
    set: function(url) {
      console.log('🔍 检测到location.href设置:', url);
      const fixedUrl = fixUrlAppId(url);
      if (fixedUrl !== url) {
        console.log('🔧 拦截并修复location.href:', { original: url, fixed: fixedUrl });
        alert('🔧 检测到错误的注册URL，已自动修复！\n\n原URL: ' + url + '\n\n修复后: ' + fixedUrl);
      }
      originalLocationSetter.call(this, fixedUrl);
    },
    get: function() {
      return window.location.toString();
    }
  });
  console.log('✅ 已安装location.href拦截器');
} else {
  console.log('❌ 无法安装location.href拦截器');
}

// 拦截fetch请求
const originalFetch = window.fetch;
window.fetch = function(input, init) {
  if (typeof input === 'string') {
    const fixedInput = fixUrlAppId(input);
    if (fixedInput !== input) {
      console.log('🔧 修复fetch URL:', { original: input, fixed: fixedInput });
      return originalFetch(fixedInput, init);
    }
  }
  return originalFetch(input, init);
};
console.log('✅ 已安装fetch拦截器');

// 测试当前配置
console.log('🔍 当前环境变量:');
console.log('VITE_AUTHING_APP_ID:', window.import?.meta?.env?.VITE_AUTHING_APP_ID || '未知');
console.log('VITE_AUTHING_HOST:', window.import?.meta?.env?.VITE_AUTHING_HOST || '未知');

// 模拟注册URL生成测试
function testRegisterUrlGeneration() {
  console.log('🧪 测试注册URL生成...');
  
  const testConfig = {
    appId: WRONG_APP_ID, // 故意使用错误的ID来测试修复
    host: 'https://rzcswqs4sq0f.authing.cn/' + WRONG_APP_ID, // 故意使用错误的host
    redirectUri: 'https://www.wenpai.xyz/callback',
    state: encodeURIComponent(JSON.stringify({ ts: Date.now(), mode: 'register', redirectTo: '/' })),
    codeChallenge: 'test_challenge',
    nonce: 'test_nonce'
  };
  
  // 模拟URL生成
  const params = new URLSearchParams({
    client_id: testConfig.appId,
    redirect_uri: testConfig.redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
    state: testConfig.state,
    code_challenge: testConfig.codeChallenge,
    code_challenge_method: 'S256',
    nonce: testConfig.nonce,
    response_mode: 'query',
    register: 'true',
    mode: 'register',
    action: 'register',
    ui_locales: 'zh-CN'
  });
  
  const testUrl = `${testConfig.host}/register?${params.toString()}`;
  console.log('🔍 生成的测试URL:', testUrl);
  
  const fixedUrl = fixUrlAppId(testUrl);
  console.log('🔧 修复后的URL:', fixedUrl);
  
  if (fixedUrl.includes(WRONG_APP_ID)) {
    console.error('❌ 修复失败，URL仍包含错误的App ID');
  } else if (fixedUrl.includes(CORRECT_APP_ID)) {
    console.log('✅ 修复成功，URL包含正确的App ID');
  } else {
    console.warn('⚠️ URL不包含任何App ID');
  }
  
  return fixedUrl;
}

// 运行测试
testRegisterUrlGeneration();

console.log('✅ 修复脚本已安装完成！');
console.log('📝 现在点击注册按钮，如果检测到错误URL会自动修复并显示提示。');

// 添加一个全局函数供手动测试
window.testRegisterFix = function() {
  console.log('🧪 手动测试注册修复...');
  const testUrl = 'https://rzcswqs4sq0f.authing.cn/' + WRONG_APP_ID + '/login?app_id=' + WRONG_APP_ID;
  console.log('🔍 测试URL:', testUrl);
  
  // 模拟设置location.href
  try {
    window.location.href = testUrl;
  } catch (e) {
    console.log('🔧 测试完成，检查是否有修复提示');
  }
};

console.log('💡 提示：运行 testRegisterFix() 来手动测试修复功能');
