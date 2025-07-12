/**
 * 网络连接诊断脚本
 * 用于检查OpenAI API的连接状态
 */

import fetch from 'node-fetch';
import dns from 'dns';
import { promisify } from 'util';

const lookup = promisify(dns.lookup);

/**
 * 检查DNS解析
 */
async function checkDNS() {
  console.log('🔍 检查DNS解析...');
  try {
    const result = await lookup('api.openai.com');
    console.log(`✅ DNS解析成功: ${result.address}`);
    return true;
  } catch (error) {
    console.log(`❌ DNS解析失败: ${error.message}`);
    return false;
  }
}

/**
 * 检查网络连接
 */
async function checkConnectivity() {
  console.log('🌐 检查网络连接...');
  try {
    const response = await fetch('https://httpbin.org/get', {
      method: 'GET',
      timeout: 5000
    });
    if (response.ok) {
      console.log('✅ 基础网络连接正常');
      return true;
    } else {
      console.log(`❌ 基础网络连接异常: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 基础网络连接失败: ${error.message}`);
    return false;
  }
}

/**
 * 检查OpenAI API连接
 */
async function checkOpenAIAPI() {
  console.log('🤖 检查OpenAI API连接...');
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ OPENAI_API_KEY 未设置');
    return false;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log('✅ OpenAI API连接正常');
      return true;
    } else {
      const errorData = await response.json();
      console.log(`❌ OpenAI API连接异常: ${response.status} - ${errorData.error?.message || '未知错误'}`);
      return false;
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('❌ OpenAI API连接超时');
    } else {
      console.log(`❌ OpenAI API连接失败: ${error.message}`);
    }
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始网络诊断...\n');
  
  const dnsOk = await checkDNS();
  console.log('');
  
  const connectivityOk = await checkConnectivity();
  console.log('');
  
  const openaiOk = await checkOpenAIAPI();
  console.log('');
  
  // 总结
  console.log('📊 诊断结果:');
  console.log(`DNS解析: ${dnsOk ? '✅' : '❌'}`);
  console.log(`网络连接: ${connectivityOk ? '✅' : '❌'}`);
  console.log(`OpenAI API: ${openaiOk ? '✅' : '❌'}`);
  
  if (!openaiOk) {
    console.log('\n💡 建议解决方案:');
    if (!dnsOk) {
      console.log('1. 检查DNS设置，尝试使用8.8.8.8或1.1.1.1');
    }
    if (!connectivityOk) {
      console.log('2. 检查网络连接和防火墙设置');
    }
    console.log('3. 尝试使用VPN或代理服务器');
    console.log('4. 检查OpenAI API密钥是否正确');
    console.log('5. 如果网络问题持续，可以临时启用模拟模式进行开发');
  } else {
    console.log('\n🎉 所有检查通过！可以正常使用OpenAI API');
  }
}

// 运行诊断
main().catch(console.error); 