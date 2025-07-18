#!/bin/bash

# 验证API配置脚本
# 检查环境变量配置是否正确

echo "🔍 验证API配置..."

# 检查.env.local文件是否存在
if [ ! -f .env.local ]; then
    echo "❌ .env.local文件不存在"
    echo "请运行: cp env.example .env.local"
    exit 1
fi

echo "✅ .env.local文件存在"

# 检查必需的API密钥是否已配置
echo ""
echo "📋 检查API密钥配置："

# OpenAI API密钥
if grep -q "VITE_OPENAI_API_KEY=" .env.local; then
    OPENAI_KEY=$(grep "VITE_OPENAI_API_KEY=" .env.local | cut -d'=' -f2)
    if [[ "$OPENAI_KEY" == "sk-your-actual-openai-api-key-here" || "$OPENAI_KEY" == "sk-your-openai-api-key-here" ]]; then
        echo "❌ OpenAI API密钥未配置（仍为占位符）"
    else
        echo "✅ OpenAI API密钥已配置"
    fi
else
    echo "❌ OpenAI API密钥未设置"
fi

# DeepSeek API密钥
if grep -q "VITE_DEEPSEEK_API_KEY=" .env.local; then
    DEEPSEEK_KEY=$(grep "VITE_DEEPSEEK_API_KEY=" .env.local | cut -d'=' -f2)
    if [[ "$DEEPSEEK_KEY" == "sk-your-actual-deepseek-api-key-here" || "$DEEPSEEK_KEY" == "sk-your-deepseek-api-key-here" ]]; then
        echo "⚠️  DeepSeek API密钥未配置（可选）"
    else
        echo "✅ DeepSeek API密钥已配置"
    fi
else
    echo "⚠️  DeepSeek API密钥未设置（可选）"
fi

# Authing配置
if grep -q "VITE_AUTHING_APP_ID=" .env.local; then
    AUTHING_APP_ID=$(grep "VITE_AUTHING_APP_ID=" .env.local | cut -d'=' -f2)
    if [[ "$AUTHING_APP_ID" == "your-actual-authing-app-id" || "$AUTHING_APP_ID" == "6867fdc88034eb95ae86167d" ]]; then
        echo "❌ Authing App ID未配置"
    else
        echo "✅ Authing App ID已配置"
    fi
else
    echo "❌ Authing App ID未设置"
fi

echo ""
echo "🔧 配置建议："
echo "1. 编辑 .env.local 文件"
echo "2. 将占位符替换为真实的API密钥"
echo "3. 重启开发服务器" 