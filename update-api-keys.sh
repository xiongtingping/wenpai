#!/bin/bash

# 更新API密钥脚本
# 此脚本用于更新环境变量中的API密钥

echo "🔧 更新API密钥配置..."

# 检查.env.local文件是否存在
if [ ! -f .env.local ]; then
    echo "📝 创建 .env.local 文件..."
    cp env.example .env.local
fi

# 更新API密钥（使用占位符，避免硬编码）
echo "🔑 更新API密钥..."

# OpenAI API密钥
if grep -q "VITE_OPENAI_API_KEY=" .env.local; then
    sed -i '' 's/VITE_OPENAI_API_KEY=.*/VITE_OPENAI_API_KEY=sk-your-actual-openai-api-key-here/' .env.local
else
    echo "VITE_OPENAI_API_KEY=sk-your-actual-openai-api-key-here" >> .env.local
fi

# DeepSeek API密钥
if grep -q "VITE_DEEPSEEK_API_KEY=" .env.local; then
    sed -i '' 's/VITE_DEEPSEEK_API_KEY=.*/VITE_DEEPSEEK_API_KEY=sk-your-actual-deepseek-api-key-here/' .env.local
else
    echo "VITE_DEEPSEEK_API_KEY=sk-your-actual-deepseek-api-key-here" >> .env.local
fi

# Gemini API密钥
if grep -q "VITE_GEMINI_API_KEY=" .env.local; then
    sed -i '' 's/VITE_GEMINI_API_KEY=.*/VITE_GEMINI_API_KEY=your-actual-gemini-api-key-here/' .env.local
else
    echo "VITE_GEMINI_API_KEY=your-actual-gemini-api-key-here" >> .env.local
fi

echo "✅ API密钥配置已更新"
echo ""
echo "📋 当前配置的API密钥："
echo "• OpenAI: sk-your-actual-openai-api-key-here"
echo "• DeepSeek: sk-your-actual-deepseek-api-key-here"
echo "• Gemini: your-actual-gemini-api-key-here"
echo ""
echo "⚠️  请将上述占位符替换为您的真实API密钥"
echo "🔗 获取API密钥："
echo "   OpenAI: https://platform.openai.com/api-keys"
echo "   DeepSeek: https://platform.deepseek.com/"
echo "   Gemini: https://makersuite.google.com/app/apikey" 