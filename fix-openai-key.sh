#!/bin/bash

echo "🔍 检查OpenAI API密钥配置..."

# 检查本地环境变量
echo "📋 本地环境变量检查:"
if [ -f ".env" ]; then
    echo "✅ 找到 .env 文件"
    if grep -q "OPENAI_API_KEY" .env; then
        echo "✅ 本地 .env 文件包含 OPENAI_API_KEY"
        OPENAI_KEY=$(grep "OPENAI_API_KEY" .env | cut -d'=' -f2)
        if [[ $OPENAI_KEY == sk-* ]]; then
            echo "✅ 本地API密钥格式正确"
        else
            echo "❌ 本地API密钥格式不正确"
        fi
    else
        echo "❌ 本地 .env 文件不包含 OPENAI_API_KEY"
    fi
else
    echo "❌ 未找到 .env 文件"
fi

echo ""
echo "🌐 Netlify环境变量检查:"
echo "请检查Netlify后台的环境变量配置:"
echo "1. 登录 Netlify 控制台"
echo "2. 进入项目设置"
echo "3. 点击 'Environment variables'"
echo "4. 检查 OPENAI_API_KEY 是否正确设置"
echo ""

echo "🔧 修复建议:"
echo "1. 确保API密钥以 'sk-' 开头"
echo "2. 检查API密钥是否有效（可以在OpenAI平台测试）"
echo "3. 如果使用免费额度，确保账户有余额"
echo ""

echo "📝 临时解决方案:"
echo "当前系统已配置本地模拟响应，即使Netlify Functions失败，"
echo "AI分析功能仍可正常工作（使用模拟数据）。"
echo ""

echo "🚀 测试命令:"
echo "访问 http://localhost:3000/ai-test 测试AI功能"
echo ""

# 检查Netlify CLI是否安装
if command -v netlify &> /dev/null; then
    echo "📡 Netlify CLI 已安装"
    echo "运行以下命令查看环境变量:"
    echo "netlify env:list"
    echo ""
    echo "运行以下命令设置环境变量:"
    echo "netlify env:set OPENAI_API_KEY your-api-key-here"
else
    echo "📡 Netlify CLI 未安装"
    echo "安装命令: npm install -g netlify-cli"
fi

echo "✅ 检查完成" 