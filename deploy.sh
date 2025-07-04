#!/bin/bash

echo "🚀 开始部署流程..."

# 清理之前的构建
echo "📦 清理之前的构建..."
rm -rf dist

# 安装依赖
echo "📥 安装依赖..."
npm ci

# 构建项目
echo "🔨 构建项目..."
npm run build

# 检查构建结果
if [ -d "dist" ]; then
    echo "✅ 构建成功！"
    echo "📁 构建文件:"
    ls -la dist/
    echo ""
    echo "🌐 部署说明:"
    echo "1. 访问 https://app.netlify.com/"
    echo "2. 点击 'Add new site' -> 'Deploy manually'"
    echo "3. 拖拽 'dist' 文件夹到部署区域"
    echo "4. 等待部署完成"
    echo ""
    echo "🔧 环境变量设置:"
    echo "在Netlify的Site settings -> Environment variables中添加:"
    echo "- OPENAI_API_KEY: 你的OpenAI API密钥"
    echo "- DEEPSEEK_API_KEY: 你的DeepSeek API密钥"
    echo "- GEMINI_API_KEY: 你的Gemini API密钥"
    echo ""
    echo "📝 函数部署:"
    echo "将 'netlify/functions' 文件夹中的函数文件上传到Netlify Functions"
else
    echo "❌ 构建失败！"
    exit 1
fi 