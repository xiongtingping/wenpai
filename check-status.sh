#!/bin/bash

echo "🔍 文派环境状态检查"
echo "=================="

# 检查项目结构
echo "📁 项目结构检查..."
if [ -f "package.json" ]; then
    echo "✅ package.json 存在"
else
    echo "❌ package.json 不存在"
    exit 1
fi

if [ -d "src" ]; then
    echo "✅ src 目录存在"
else
    echo "❌ src 目录不存在"
fi

if [ -d "netlify/functions" ]; then
    echo "✅ netlify/functions 目录存在"
else
    echo "❌ netlify/functions 目录不存在"
fi

# 检查依赖安装
echo ""
echo "📦 依赖安装检查..."
if [ -d "node_modules" ]; then
    echo "✅ 主项目依赖已安装"
else
    echo "❌ 主项目依赖未安装"
fi

if [ -d "netlify/functions/node_modules" ]; then
    echo "✅ Netlify Functions 依赖已安装"
else
    echo "❌ Netlify Functions 依赖未安装"
fi

# 检查环境变量
echo ""
echo "🔑 环境变量检查..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local 文件存在"
    
    # 检查关键环境变量
    if grep -q "VITE_OPENAI_API_KEY=sk-" .env.local; then
        echo "✅ OpenAI API 密钥已配置"
    else
        echo "❌ OpenAI API 密钥未正确配置"
    fi
    
    if grep -q "VITE_CREEM_API_KEY=" .env.local; then
        CREEM_KEY=$(grep "VITE_CREEM_API_KEY=" .env.local | cut -d'=' -f2)
        if [ "$CREEM_KEY" != "your-creem-api-key-here" ] && [ -n "$CREEM_KEY" ]; then
            echo "✅ Creem API 密钥已配置"
        else
            echo "❌ Creem API 密钥未正确配置"
        fi
    else
        echo "❌ Creem API 密钥未配置"
    fi
    
    if grep -q "VITE_AUTHING_APP_ID=" .env.local; then
        echo "✅ Authing 应用 ID 已配置"
    else
        echo "❌ Authing 应用 ID 未配置"
    fi
else
    echo "❌ .env.local 文件不存在"
fi

# 检查端口占用
echo ""
echo "🌐 端口检查..."
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口 5173 被占用"
elif lsof -Pi :5174 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口 5174 被占用"
elif lsof -Pi :5175 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口 5175 被占用"
else
    echo "✅ 开发端口可用"
fi

if lsof -Pi :8888 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Netlify Dev 端口 8888 被占用"
else
    echo "✅ Netlify Dev 端口可用"
fi

# 检查网络连接
echo ""
echo "🌍 网络连接检查..."
if curl -s --max-time 5 https://api.openai.com > /dev/null; then
    echo "✅ OpenAI API 可访问"
else
    echo "❌ OpenAI API 无法访问"
fi

if curl -s --max-time 5 https://creem.io > /dev/null; then
    echo "✅ Creem 官网可访问"
else
    echo "❌ Creem 官网无法访问"
fi

# 总结
echo ""
echo "📊 检查总结"
echo "=========="

if [ -f ".env.local" ] && [ -d "node_modules" ] && [ -d "netlify/functions/node_modules" ]; then
    echo "✅ 基本环境配置完成"
    echo ""
    echo "🚀 可以启动开发服务器："
    echo "   npm run dev"
    echo ""
    echo "⚠️  请确保已配置有效的 API 密钥："
    echo "   - OpenAI API 密钥"
    echo "   - Creem 支付 API 密钥"
else
    echo "❌ 环境配置不完整"
    echo ""
    echo "🔧 请运行修复脚本："
    echo "   ./fix-environment.sh"
fi

echo ""
echo "📚 详细配置指南：ENVIRONMENT_SETUP_GUIDE.md" 