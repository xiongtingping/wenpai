#!/usr/bin/env node

/**
 * 回调URL验证脚本
 * 分析用户提供的回调URL，验证修复效果
 */

const url = process.argv[2] || 'https://www.wenpai.xyz/callback?code=h1_l_3r0q5udEVseu2kpWNbQAfSJyQkMnMdiVJ7r7bu&state=%2Fcreative-studio';

console.log('🔍 回调URL验证分析');
console.log('==================');

try {
    const parsedUrl = new URL(url);
    
    console.log('📋 URL解析结果:');
    console.log(`  域名: ${parsedUrl.hostname}`);
    console.log(`  路径: ${parsedUrl.pathname}`);
    console.log(`  完整URL: ${parsedUrl.href}`);
    
    // 检查参数
    const params = new URLSearchParams(parsedUrl.search);
    const code = params.get('code');
    const state = params.get('state');
    
    console.log('\n🔑 认证参数:');
    console.log(`  授权码: ${code ? code.substring(0, 20) + '...' : '❌ 缺失'}`);
    console.log(`  状态参数: ${state ? decodeURIComponent(state) : '❌ 缺失'}`);
    
    // 验证修复效果
    console.log('\n✅ 修复验证:');
    
    // 检查是否有多重URL问题
    const hasMultipleUrls = url.includes('%20%20') || url.includes('callback%20');
    console.log(`  多重URL检查: ${hasMultipleUrls ? '❌ 仍存在' : '✅ 已修复'}`);
    
    // 检查域名是否正确
    const isCorrectDomain = parsedUrl.hostname === 'www.wenpai.xyz';
    console.log(`  域名检查: ${isCorrectDomain ? '✅ 正确' : '❌ 错误'}`);
    
    // 检查路径是否正确
    const isCorrectPath = parsedUrl.pathname === '/callback';
    console.log(`  路径检查: ${isCorrectPath ? '✅ 正确' : '❌ 错误'}`);
    
    // 检查必需参数
    const hasRequiredParams = code && state;
    console.log(`  参数完整性: ${hasRequiredParams ? '✅ 完整' : '❌ 缺失'}`);
    
    console.log('\n🎯 总体评估:');
    if (!hasMultipleUrls && isCorrectDomain && isCorrectPath && hasRequiredParams) {
        console.log('✅ 回调URL格式完全正确！redirectUri修复成功');
        console.log('📝 建议: 继续测试token交换流程');
    } else {
        console.log('⚠️  回调URL存在问题，需要进一步排查');
    }
    
    // 下一步建议
    console.log('\n🔧 下一步验证:');
    console.log('1. 访问这个URL，检查页面是否正常加载');
    console.log('2. 打开浏览器开发者工具，观察网络请求');
    console.log('3. 检查是否有token交换相关的错误');
    console.log('4. 验证认证流程是否完整完成');
    
    console.log('\n📊 性能指标:');
    console.log(`  URL长度: ${url.length} 字符`);
    console.log(`  授权码长度: ${code ? code.length : 0} 字符`);
    console.log(`  参数数量: ${params.size} 个`);

} catch (error) {
    console.error('❌ URL解析失败:', error.message);
    console.log('🔍 请检查URL格式是否正确');
}

console.log('\n==================');