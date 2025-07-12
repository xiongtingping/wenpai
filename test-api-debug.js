#!/usr/bin/env node

/**
 * API调试脚本
 * 测试从Vite代理到开发API服务器的完整流程
 */

import fetch from 'node-fetch';

const VITE_URL = 'http://localhost:3007';
const API_URL = 'http://localhost:8888';

async function testAPI(url, description) {
    console.log(`\n🔍 测试: ${description}`);
    console.log(`📍 URL: ${url}`);
    
    try {
        const startTime = Date.now();
        const response = await fetch(`${url}/.netlify/functions/api`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                provider: 'openai',
                action: 'status'
            })
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        console.log(`📊 状态码: ${response.status}`);
        console.log(`⏱️  响应时间: ${responseTime}ms`);
        
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ 响应数据:`, JSON.stringify(data, null, 2));
        } else {
            console.log(`❌ 错误响应: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.log(`📄 错误详情: ${errorText}`);
        }
    } catch (error) {
        console.log(`💥 请求失败: ${error.message}`);
        console.log(`🔍 错误类型: ${error.name}`);
        console.log(`📋 错误详情:`, error);
    }
}

async function main() {
    console.log('🚀 开始API调试测试...\n');
    
    // 测试直接访问API服务器
    await testAPI(API_URL, '直接访问API服务器');
    
    // 测试通过Vite代理访问
    await testAPI(VITE_URL, '通过Vite代理访问');
    
    console.log('\n🎯 测试完成！');
}

main().catch(console.error); 