#!/bin/bash

echo "🔧 快速修复配置问题..."

# 检查并创建.env.local
if [ ! -f ".env.local" ]; then
    echo "📝 创建.env.local文件..."
    cp env.example .env.local
    echo "✅ .env.local文件已创建"
else
    echo "✅ .env.local文件已存在"
fi

# 检查API密钥配置
echo "🔍 检查API密钥配置..."

# 检查OpenAI API密钥
if grep -q "sk-your-openai-api-key-here" .env.local; then
    echo "⚠️  OpenAI API密钥未设置"
    echo "📝 请编辑.env.local文件，将VITE_OPENAI_API_KEY设置为您的真实密钥"
    echo "   获取地址：https://platform.openai.com/api-keys"
fi

# 检查Creem API密钥
if ! grep -q "VITE_CREEM_API_KEY=" .env.local; then
    echo "⚠️  Creem API密钥未配置"
    echo "📝 请在.env.local文件中添加：VITE_CREEM_API_KEY=your-creem-api-key-here"
fi

# 检查网络连接
echo "🌐 检查网络连接..."

# 测试Authing连接
if curl -s --connect-timeout 5 https://qutkgzkfaezk-demo.authing.cn > /dev/null; then
    echo "✅ Authing域名连接正常"
else
    echo "❌ Authing域名连接失败"
fi

# 测试OpenAI连接
if curl -s --connect-timeout 5 https://api.openai.com > /dev/null; then
    echo "✅ OpenAI API连接正常"
else
    echo "❌ OpenAI API连接失败（可能需要代理）"
fi

echo ""
echo "📋 下一步操作："
echo "1. 编辑.env.local文件，设置真实的API密钥"
echo "2. 如果网络连接有问题，请检查代理设置"
echo "3. 重启开发服务器：npm run dev"
echo ""
echo "🔗 有用的链接："
echo "- OpenAI API密钥：https://platform.openai.com/api-keys"
echo "- 项目文档：https://www.wenpai.xyz" 