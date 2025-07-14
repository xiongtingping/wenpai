/**
 * 检查 Authing SDK 可用方法
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

console.log('🔍 Authing SDK 方法检查');
console.log('=====================');
console.log('');

console.log('📋 可用的方法:');
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(authing)).filter(name => 
  typeof authing[name] === 'function' && !name.startsWith('_')
).join(', '));

console.log('');
console.log('📧 邮箱相关方法:');
const emailMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(authing)).filter(name => 
  typeof authing[name] === 'function' && name.toLowerCase().includes('email')
);
console.log(emailMethods.join(', '));

console.log('');
console.log('📱 短信相关方法:');
const smsMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(authing)).filter(name => 
  typeof authing[name] === 'function' && name.toLowerCase().includes('sms')
);
console.log(smsMethods.join(', '));

console.log('');
console.log('🔐 登录相关方法:');
const loginMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(authing)).filter(name => 
  typeof authing[name] === 'function' && name.toLowerCase().includes('login')
);
console.log(loginMethods.join(', ')); 