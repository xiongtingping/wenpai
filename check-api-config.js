#!/usr/bin/env node

/**
 * API配置检查脚本
 * 检查开发环境的API配置状态
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始检查API配置...\n');

// 检查.env.local文件
const envLocalPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), 'env.example');

console.log('📁 检查环境配置文件:');
console.log(`   .env.local: ${fs.existsSync(envLocalPath) ? '✅ 存在' : '❌ 不存在'}`);
console.log(`   env.example: ${fs.existsSync(envExamplePath) ? '✅ 存在' : '❌ 不存在'}`);

if (!fs.existsSync(envLocalPath)) {
    console.log('\n⚠️  未找到.env.local文件');
    console.log('📝 建议操作:');
    console.log('   1. 复制env.example为.env.local');
    console.log('   2. 在.env.local中设置真实的API密钥');
    console.log('   3. 重启开发服务器');
    
    // 尝试复制env.example
    if (fs.existsSync(envExamplePath)) {
        try {
            fs.copyFileSync(envExamplePath, envLocalPath);
            console.log('\n✅ 已自动复制env.example为.env.local');
            console.log('📝 请编辑.env.local文件，设置真实的API密钥');
        } catch (error) {
            console.log('\n❌ 复制文件失败:', error.message);
        }
    }
} else {
    console.log('\n📄 .env.local文件内容检查:');
    const envContent = fs.readFileSync(envLocalPath, 'utf8');
    
    const requiredKeys = [
        'VITE_OPENAI_API_KEY',
        'VITE_CREEM_API_KEY',
        'VITE_AUTHING_APP_ID',
        'VITE_AUTHING_HOST'
    ];
    
    requiredKeys.forEach(key => {
        const hasKey = envContent.includes(key);
        const isDefault = envContent.includes(`${key}=sk-your-`) || 
                         envContent.includes(`${key}=your-`) ||
                         envContent.includes(`${key}=未设置`);
        
        if (!hasKey) {
            console.log(`   ${key}: ❌ 未配置`);
        } else if (isDefault) {
            console.log(`   ${key}: ⚠️  使用默认值（需要设置真实密钥）`);
        } else {
            console.log(`   ${key}: ✅ 已配置`);
        }
    });
}

// 检查网络连接
console.log('\n🌐 检查网络连接:');
const https = require('https');

const testUrls = [
    'https://api.openai.com',
    'https://qutkgzkfaezk-demo.authing.cn',
    'https://www.wenpai.xyz'
];

testUrls.forEach(url => {
    const req = https.get(url, (res) => {
        console.log(`   ${url}: ✅ 连接正常 (${res.statusCode})`);
    }).on('error', (err) => {
        console.log(`   ${url}: ❌ 连接失败 (${err.message})`);
    });
    
    req.setTimeout(5000, () => {
        console.log(`   ${url}: ⏰ 连接超时`);
        req.destroy();
    });
});

console.log('\n📋 配置建议:');
console.log('1. 设置真实的OpenAI API密钥');
console.log('2. 设置真实的Creem API密钥');
console.log('3. 检查网络连接和代理设置');
console.log('4. 重启开发服务器以应用新配置'); 