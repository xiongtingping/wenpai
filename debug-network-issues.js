#!/usr/bin/env node

/**
 * 网络问题诊断脚本
 * 检查Authing连接、API配置和网络状态
 */

const https = require('https');
const http = require('http');
const { execSync } = require('child_process');

console.log('🔍 开始网络问题诊断...\n');

// 检查网络连接
function checkNetworkConnection() {
  console.log('=== 网络连接检查 ===');
  
  const testUrls = [
    'https://www.google.com',
    'https://api.openai.com',
    'rzcswqs4sq0f.authing.cn/68823897631e1ef8ff3720b2',
    'https://www.baidu.com'
  ];

  testUrls.forEach(url => {
    try {
      const protocol = url.startsWith('https:') ? https : http;
      const req = protocol.get(url, { timeout: 5000 }, (res) => {
        console.log(`✅ ${url} - 状态码: ${res.statusCode}`);
      });
      
      req.on('error', (err) => {
        console.log(`❌ ${url} - 错误: ${err.message}`);
      });
      
      req.on('timeout', () => {
        console.log(`⏰ ${url} - 超时`);
        req.destroy();
      });
    } catch (error) {
      console.log(`❌ ${url} - 异常: ${error.message}`);
    }
  });
}

// 检查DNS解析
function checkDNSResolution() {
  console.log('\n=== DNS解析检查 ===');
  
  const domains = [
    'rzcswqs4sq0f.authing.cn/68823897631e1ef8ff3720b2',
    'api.openai.com',
    'www.google.com'
  ];

  domains.forEach(domain => {
    try {
      const result = execSync(`nslookup ${domain}`, { encoding: 'utf8' });
      console.log(`✅ ${domain} - DNS解析成功`);
    } catch (error) {
      console.log(`❌ ${domain} - DNS解析失败: ${error.message}`);
    }
  });
}

// 检查环境变量
function checkEnvironmentVariables() {
  console.log('\n=== 环境变量检查 ===');
  
  const requiredVars = [
    'VITE_AUTHING_APP_ID',
    'VITE_AUTHING_HOST',
    'VITE_OPENAI_API_KEY',
    'VITE_CREEM_API_KEY'
  ];

  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value && value !== 'sk-your-op...' && value !== '未设置') {
      console.log(`✅ ${varName}: 已配置`);
    } else {
      console.log(`❌ ${varName}: 未配置或使用示例值`);
    }
  });
}

// 检查防火墙和代理
function checkFirewallAndProxy() {
  console.log('\n=== 防火墙和代理检查 ===');
  
  try {
    // 检查系统代理设置
    const proxyEnvVars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy'];
    const hasProxy = proxyEnvVars.some(varName => process.env[varName]);
    
    if (hasProxy) {
      console.log('⚠️  检测到代理设置，可能影响网络连接');
      proxyEnvVars.forEach(varName => {
        if (process.env[varName]) {
          console.log(`   ${varName}: ${process.env[varName]}`);
        }
      });
    } else {
      console.log('✅ 未检测到代理设置');
    }
  } catch (error) {
    console.log(`❌ 代理检查失败: ${error.message}`);
  }
}

// 生成修复建议
function generateFixSuggestions() {
  console.log('\n=== 修复建议 ===');
  
  console.log('1. 网络连接问题:');
  console.log('   - 检查网络连接是否正常');
  console.log('   - 尝试使用VPN或代理');
  console.log('   - 检查防火墙设置');
  
  console.log('\n2. API配置问题:');
  console.log('   - 配置真实的OpenAI API密钥');
  console.log('   - 配置真实的Creem API密钥');
  console.log('   - 检查.env.local文件配置');
  
  console.log('\n3. Authing配置问题:');
  console.log('   - 检查Authing应用配置');
  console.log('   - 确认Authing域名可访问');
  console.log('   - 检查Authing Guard SDK加载');
  
  console.log('\n4. 开发环境优化:');
  console.log('   - 清除浏览器缓存');
  console.log('   - 重启开发服务器');
  console.log('   - 检查浏览器网络面板');
}

// 主函数
async function main() {
  try {
    checkNetworkConnection();
    await new Promise(resolve => setTimeout(resolve, 2000)); // 等待网络检查完成
    
    checkDNSResolution();
    checkEnvironmentVariables();
    checkFirewallAndProxy();
    generateFixSuggestions();
    
    console.log('\n✅ 诊断完成');
  } catch (error) {
    console.error('❌ 诊断过程中出现错误:', error.message);
  }
}

// 运行诊断
main(); 