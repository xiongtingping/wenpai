#!/bin/bash

echo "🚀 启动完整的开发环境（Vite + Netlify Functions）..."

# 1. 清理所有可能的端口占用
echo "📡 清理端口占用..."
lsof -ti:5173 | xargs kill -9 2>/dev/null || echo "端口5173无进程占用"
lsof -ti:5174 | xargs kill -9 2>/dev/null || echo "端口5174无进程占用"
lsof -ti:5175 | xargs kill -9 2>/dev/null || echo "端口5175无进程占用"
lsof -ti:5176 | xargs kill -9 2>/dev/null || echo "端口5176无进程占用"
lsof -ti:5177 | xargs kill -9 2>/dev/null || echo "端口5177无进程占用"
lsof -ti:5178 | xargs kill -9 2>/dev/null || echo "端口5178无进程占用"
lsof -ti:5179 | xargs kill -9 2>/dev/null || echo "端口5179无进程占用"
lsof -ti:5180 | xargs kill -9 2>/dev/null || echo "端口5180无进程占用"
lsof -ti:5181 | xargs kill -9 2>/dev/null || echo "端口5181无进程占用"
lsof -ti:5182 | xargs kill -9 2>/dev/null || echo "端口5182无进程占用"
lsof -ti:5183 | xargs kill -9 2>/dev/null || echo "端口5183无进程占用"
lsof -ti:8888 | xargs kill -9 2>/dev/null || echo "端口8888无进程占用"

# 2. 检查环境变量
echo "🔍 检查环境变量..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local 文件存在"
    grep -q "VITE_OPENAI_API_KEY" .env.local && echo "✅ OpenAI API Key 已配置" || echo "❌ OpenAI API Key 未配置"
    grep -q "VITE_CREEM_API_KEY" .env.local && echo "✅ Creem API Key 已配置" || echo "❌ Creem API Key 未配置"
    grep -q "VITE_AUTHING_APP_ID" .env.local && echo "✅ Authing App ID 已配置" || echo "❌ Authing App ID 未配置"
else
    echo "❌ .env.local 文件不存在"
fi

# 3. 确保依赖已安装
echo "📦 检查依赖..."
if [ ! -d "node_modules" ]; then
    echo "安装主项目依赖..."
    npm install
fi

if [ ! -d "netlify/functions/node_modules" ]; then
    echo "安装 Netlify Functions 依赖..."
    cd netlify/functions && npm install && cd ../..
fi

# 4. 启动 Netlify Dev（包含 Vite 和 Functions）
echo "🌐 启动 Netlify Dev 服务器..."
echo "📝 注意：这将同时启动 Vite 开发服务器和 Netlify Functions"
echo "📝 前端地址：http://localhost:8888"
echo "📝 函数地址：http://localhost:8888/.netlify/functions/*"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

# 启动 Netlify Dev
npx netlify dev 