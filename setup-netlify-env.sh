#!/bin/bash

# Netlify环境变量设置脚本
echo "🔧 设置Netlify环境变量..."

# 检查是否已登录
if ! npx netlify status > /dev/null 2>&1; then
    echo "❌ 请先登录Netlify: npx netlify login"
    exit 1
fi

echo "📋 当前环境变量:"
npx netlify env:list --context production

echo ""
echo "🔑 设置API密钥环境变量..."

# 设置OpenAI API密钥
echo "请输入OpenAI API密钥 (或按回车跳过):"
read -s OPENAI_KEY
if [ ! -z "$OPENAI_KEY" ]; then
    npx netlify env:set OPENAI_API_KEY "$OPENAI_KEY" --context production
    echo "✅ OpenAI API密钥已设置"
else
    echo "⏭️  跳过OpenAI API密钥设置"
fi

# 设置DeepSeek API密钥
echo "请输入DeepSeek API密钥 (或按回车跳过):"
read -s DEEPSEEK_KEY
if [ ! -z "$DEEPSEEK_KEY" ]; then
    npx netlify env:set DEEPSEEK_API_KEY "$DEEPSEEK_KEY" --context production
    echo "✅ DeepSeek API密钥已设置"
else
    echo "⏭️  跳过DeepSeek API密钥设置"
fi

# 设置Gemini API密钥
echo "请输入Gemini API密钥 (或按回车跳过):"
read -s GEMINI_KEY
if [ ! -z "$GEMINI_KEY" ]; then
    npx netlify env:set GEMINI_API_KEY "$GEMINI_KEY" --context production
    echo "✅ Gemini API密钥已设置"
else
    echo "⏭️  跳过Gemini API密钥设置"
fi

# 设置Authing配置
echo "请输入Authing App ID (或按回车跳过):"
read AUTHING_APP_ID
if [ ! -z "$AUTHING_APP_ID" ]; then
    npx netlify env:set VITE_AUTHING_APP_ID "$AUTHING_APP_ID" --context production
    echo "✅ Authing App ID已设置"
else
    echo "⏭️  跳过Authing App ID设置"
fi

echo "请输入Authing Host (或按回车跳过):"
read AUTHING_HOST
if [ ! -z "$AUTHING_HOST" ]; then
    npx netlify env:set VITE_AUTHING_HOST "$AUTHING_HOST" --context production
    echo "✅ Authing Host已设置"
else
    echo "⏭️  跳过Authing Host设置"
fi

echo ""
echo "📋 更新后的环境变量:"
npx netlify env:list --context production

echo ""
echo "🚀 重新部署以应用环境变量..."
npx netlify deploy --prod

echo ""
echo "✅ 环境变量设置完成！"
echo "🌐 网站地址: https://www.wenpai.xyz" 