#!/bin/bash

echo "🚀 文派 - 部署状态检查"
echo "========================"

# 检查Netlify部署状态
echo "📋 检查Netlify部署状态..."

# 获取最新的部署URL
DEPLOY_URL="https://6872271d9e6c090008ffd9d5--wenpai.netlify.app"

echo "🌐 部署地址: $DEPLOY_URL"

# 测试网站可访问性
echo "🔍 测试网站可访问性..."
if curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL" | grep -q "200"; then
    echo "✅ 网站可正常访问"
else
    echo "❌ 网站访问异常"
fi

# 测试热点话题API
echo "🔥 测试热点话题API..."
API_RESPONSE=$(curl -s -X POST "$DEPLOY_URL/.netlify/functions/api" \
  -H "Content-Type: application/json" \
  -d '{"action":"hot-topics","platform":"weibo"}')

if echo "$API_RESPONSE" | grep -q "title"; then
    echo "✅ 热点话题API正常"
    echo "📊 微博数据示例:"
    echo "$API_RESPONSE" | jq -r '.data[0].title' 2>/dev/null || echo "数据格式正常"
else
    echo "❌ 热点话题API异常"
    echo "响应: $API_RESPONSE"
fi

# 测试AI服务状态
echo "🤖 测试AI服务状态..."
AI_STATUS=$(curl -s -X POST "$DEPLOY_URL/.netlify/functions/api" \
  -H "Content-Type: application/json" \
  -d '{"action":"status","provider":"openai"}')

if echo "$AI_STATUS" | grep -q "available"; then
    echo "✅ AI服务状态检查正常"
else
    echo "⚠️ AI服务状态检查异常"
    echo "响应: $AI_STATUS"
fi

echo ""
echo "🎉 部署状态检查完成！"
echo ""
echo "📝 下一步操作:"
echo "1. 访问 $DEPLOY_URL 查看网站"
echo "2. 测试热点话题功能: $DEPLOY_URL/hot-topics"
echo "3. 测试AI功能: $DEPLOY_URL/adapt"
echo ""
echo "🔧 如需配置环境变量，请访问Netlify控制台"
