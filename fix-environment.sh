#!/bin/bash

echo "🔧 文派环境修复脚本"
echo "=================="

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

echo "📦 安装主项目依赖..."
npm install

echo "📦 安装 Netlify Functions 依赖..."
cd netlify/functions
npm install
cd ../..

echo "🔍 检查环境变量配置..."
if [ ! -f ".env.local" ]; then
    echo "⚠️  警告: 未找到 .env.local 文件"
    echo "📝 正在创建环境变量配置文件..."
    cp env.example .env.local
    echo "✅ 已创建 .env.local 文件"
    echo ""
    echo "🔑 请编辑 .env.local 文件，配置以下必需的 API 密钥："
    echo "   - VITE_OPENAI_API_KEY: 您的 OpenAI API 密钥"
    echo "   - VITE_CREEM_API_KEY: 您的 Creem 支付 API 密钥"
    echo ""
    echo "📖 获取 API 密钥："
    echo "   - OpenAI: https://platform.openai.com/api-keys"
    echo "   - Creem: https://creem.io/"
    echo ""
else
    echo "✅ 找到 .env.local 文件"
fi

echo "🔍 检查依赖安装状态..."
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

echo ""
echo "🚀 修复完成！"
echo "📋 下一步操作："
echo "   1. 编辑 .env.local 文件，配置 API 密钥"
echo "   2. 运行 'npm run dev' 启动开发服务器"
echo "   3. 检查控制台是否还有错误"
echo ""
echo "📚 详细配置指南请查看 ENVIRONMENT_SETUP_GUIDE.md" 