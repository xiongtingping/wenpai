/**
 * 网络连接测试脚本
 * 用于诊断OpenAI API连接问题
 */

import fetch from 'node-fetch';

/**
 * 测试基础网络连接
 */
async function testBasicConnectivity() {
  console.log('🔍 测试基础网络连接...');
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
 * 测试DNS解析
 */
async function testDNSResolution() {
  console.log('🔍 测试DNS解析...');
  try {
    const response = await fetch('https://dns.google/resolve?name=api.openai.com', {
      method: 'GET',
      timeout: 5000
    });
    if (response.ok) {
      const data = await response.json();
      if (data.Answer && data.Answer.length > 0) {
        console.log(`✅ DNS解析成功: ${data.Answer[0].data}`);
        return true;
      } else {
        console.log('❌ DNS解析失败: 无解析结果');
        return false;
      }
    } else {
      console.log(`❌ DNS解析失败: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ DNS解析失败: ${error.message}`);
    return false;
  }
}

/**
 * 测试OpenAI API连接
 */
async function testOpenAIConnection() {
  console.log('🔍 测试OpenAI API连接...');
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ 未设置OPENAI_API_KEY环境变量');
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
      console.log('✅ OpenAI API连接成功');
      return true;
    } else {
      const errorData = await response.json();
      console.log(`❌ OpenAI API连接失败: ${response.status} - ${errorData.error?.message || '未知错误'}`);
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
 * 测试代理设置
 */
function testProxySettings() {
  console.log('🔍 检查代理设置...');
  const proxyVars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy'];
  const hasProxy = proxyVars.some(varName => process.env[varName]);
  
  if (hasProxy) {
    console.log('⚠️  检测到代理设置:');
    proxyVars.forEach(varName => {
      if (process.env[varName]) {
        console.log(`   ${varName}: ${process.env[varName]}`);
      }
    });
  } else {
    console.log('ℹ️  未检测到代理设置');
  }
  
  return hasProxy;
}

/**
 * 主测试函数
 */
async function runNetworkTests() {
  console.log('🚀 开始网络连接诊断...\n');
  
  const results = {
    basicConnectivity: await testBasicConnectivity(),
    dnsResolution: await testDNSResolution(),
    openAIConnection: await testOpenAIConnection(),
    hasProxy: testProxySettings()
  };
  
  console.log('\n📊 测试结果汇总:');
  console.log(`   基础网络连接: ${results.basicConnectivity ? '✅ 正常' : '❌ 异常'}`);
  console.log(`   DNS解析: ${results.dnsResolution ? '✅ 正常' : '❌ 异常'}`);
  console.log(`   OpenAI API连接: ${results.openAIConnection ? '✅ 正常' : '❌ 异常'}`);
  console.log(`   代理设置: ${results.hasProxy ? '⚠️  已配置' : 'ℹ️  未配置'}`);
  
  console.log('\n💡 建议:');
  if (!results.basicConnectivity) {
    console.log('   - 检查网络连接是否正常');
    console.log('   - 检查防火墙设置');
  }
  
  if (!results.dnsResolution) {
    console.log('   - 检查DNS设置');
    console.log('   - 尝试使用公共DNS (8.8.8.8, 1.1.1.1)');
  }
  
  if (!results.openAIConnection && results.basicConnectivity && results.dnsResolution) {
    console.log('   - 网络连接正常但无法访问OpenAI API');
    console.log('   - 可能需要使用VPN或代理');
    console.log('   - 检查API密钥是否有效');
  }
  
  if (!results.hasProxy && !results.openAIConnection) {
    console.log('   - 考虑配置代理服务器');
    console.log('   - 或使用VPN服务');
  }
}

// 运行测试
runNetworkTests().catch(console.error); 