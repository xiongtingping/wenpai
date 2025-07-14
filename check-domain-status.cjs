/**
 * 域名状态检查脚本
 * 检查 wenpai.xyz 和 www.wenpai.xyz 的配置状态
 */

const https = require('https');
const http = require('http');

/**
 * 检查域名状态
 */
async function checkDomain(domain, protocol = 'https') {
  return new Promise((resolve) => {
    const client = protocol === 'https' ? https : http;
    const url = `${protocol}://${domain}`;
    
    const req = client.get(url, { timeout: 10000 }, (res) => {
      resolve({
        domain,
        protocol,
        status: res.statusCode,
        statusText: res.statusMessage,
        headers: res.headers,
        success: true
      });
    });
    
    req.on('error', (error) => {
      resolve({
        domain,
        protocol,
        error: error.message,
        success: false
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        domain,
        protocol,
        error: '请求超时',
        success: false
      });
    });
  });
}

/**
 * 主检查函数
 */
async function checkAllDomains() {
  console.log('🔍 域名状态检查');
  console.log('================');
  console.log('');
  
  const domains = [
    'wenpai.xyz',
    'www.wenpai.xyz',
    'wenpai.netlify.app'
  ];
  
  for (const domain of domains) {
    console.log(`检查 ${domain}...`);
    
    // 检查 HTTPS
    const httpsResult = await checkDomain(domain, 'https');
    console.log(`  HTTPS: ${httpsResult.success ? '✅' : '❌'} ${httpsResult.status || httpsResult.error}`);
    
    // 检查 HTTP
    const httpResult = await checkDomain(domain, 'http');
    console.log(`  HTTP:  ${httpResult.success ? '✅' : '❌'} ${httpResult.status || httpResult.error}`);
    
    if (httpsResult.success) {
      console.log(`  SSL证书: ✅ 有效`);
      console.log(`  服务器: ${httpsResult.headers.server || '未知'}`);
    }
    
    console.log('');
  }
  
  console.log('📋 诊断建议:');
  console.log('');
  
  console.log('1. 如果 wenpai.xyz 无法访问:');
  console.log('   - 检查 DNS 解析是否正确');
  console.log('   - 确认 Netlify 后台已添加域名');
  console.log('   - 等待 DNS 传播（可能需要几分钟到几小时）');
  console.log('');
  
  console.log('2. 如果 www.wenpai.xyz 无法访问:');
  console.log('   - 检查 CNAME 记录是否正确');
  console.log('   - 确认 Netlify 后台域名配置');
  console.log('');
  
  console.log('3. 如果 SSL 证书错误:');
  console.log('   - Netlify 会自动为自定义域名提供 SSL 证书');
  console.log('   - 确保域名已正确添加到 Netlify');
  console.log('   - 等待证书自动签发（通常几分钟内）');
  console.log('');
  
  console.log('4. 推荐的 DNS 配置:');
  console.log('   CNAME: www -> wenpai.netlify.app');
  console.log('   A: @ -> 75.2.60.5 (Netlify IP)');
  console.log('   或使用 Netlify 提供的 DNS 记录');
}

// 运行检查
if (require.main === module) {
  checkAllDomains().catch(console.error);
}

module.exports = { checkDomain, checkAllDomains }; 