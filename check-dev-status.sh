#!/bin/bash

echo "🔍 检查开发环境状态..."
echo ""

# 1. 检查端口占用
echo "📡 端口占用检查："
echo "  端口 8888 (Netlify Dev): $(lsof -ti:8888 >/dev/null 2>&1 && echo "✅ 运行中" || echo "❌ 未运行")"
echo "  端口 5173 (Vite): $(lsof -ti:5173 >/dev/null 2>&1 && echo "✅ 运行中" || echo "❌ 未运行")"
echo ""

# 2. 检查前端服务
echo "🌐 前端服务检查："
if curl -s http://localhost:8888 >/dev/null 2>&1; then
    echo "  ✅ 前端服务正常 (http://localhost:8888)"
else
    echo "  ❌ 前端服务异常"
fi
echo ""

# 3. 检查 Netlify Functions
echo "⚡ Netlify Functions 检查："
if curl -s http://localhost:8888/.netlify/functions/checkout -X POST -H "Content-Type: application/json" -d '{"priceId":"test"}' >/dev/null 2>&1; then
    echo "  ✅ Functions 服务正常"
else
    echo "  ❌ Functions 服务异常"
fi
echo ""

# 4. 检查环境变量
echo "🔧 环境变量检查："
if [ -f ".env.local" ]; then
    echo "  ✅ .env.local 文件存在"
    grep -q "VITE_OPENAI_API_KEY" .env.local && echo "  ✅ OpenAI API Key 已配置" || echo "  ❌ OpenAI API Key 未配置"
    grep -q "VITE_CREEM_API_KEY" .env.local && echo "  ✅ Creem API Key 已配置" || echo "  ❌ Creem API Key 未配置"
    grep -q "VITE_AUTHING_APP_ID" .env.local && echo "  ✅ Authing App ID 已配置" || echo "  ❌ Authing App ID 未配置"
else
    echo "  ❌ .env.local 文件不存在"
fi
echo ""

# 5. 检查依赖
echo "📦 依赖检查："
if [ -d "node_modules" ]; then
    echo "  ✅ 主项目依赖已安装"
else
    echo "  ❌ 主项目依赖未安装"
fi

if [ -d "netlify/functions/node_modules" ]; then
    echo "  ✅ Functions 依赖已安装"
else
    echo "  ❌ Functions 依赖未安装"
fi
echo ""

echo "🎯 开发环境状态总结："
echo "  前端地址：http://localhost:8888"
echo "  函数地址：http://localhost:8888/.netlify/functions/*"
echo "  支付测试：http://localhost:8888/payment"
echo "" 