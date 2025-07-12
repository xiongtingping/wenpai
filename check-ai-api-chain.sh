#!/bin/bash

# 一键检测AI API链路

echo "=============================="
echo "🔍 AI API链路一键检测工具"
echo "=============================="

API_URL="http://localhost:8888/.netlify/functions/api"

# 检查本地API端点可用性
echo -e "\n1️⃣ 检查API端点可用性..."
curl -s -o /dev/null -w "%{http_code}\n" $API_URL | grep -q "200\|400\|401\|405"
if [ $? -eq 0 ]; then
  echo "✅ API端点可访问"
else
  echo "❌ API端点不可访问，请检查Netlify函数是否启动"
  exit 1
fi

# 检查OpenAI状态
echo -e "\n2️⃣ 检查OpenAI状态..."
resp=$(curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"provider":"openai","action":"status"}')
echo "返回: $resp"
echo "$resp" | grep -q '"available":true'
if [ $? -eq 0 ]; then
  echo "✅ OpenAI API连通正常"
else
  echo "⚠️  OpenAI API不可用，详见上方返回"
fi

# 检查OpenAI图片生成
echo -e "\n3️⃣ 检查OpenAI图片生成..."
resp=$(curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"provider":"openai","action":"generate-image","prompt":"一只可爱的猫","n":1}')
echo "返回: $resp"
echo "$resp" | grep -q '"success":true'
if [ $? -eq 0 ]; then
  echo "✅ 图片生成API正常"
else
  echo "⚠️  图片生成API异常，详见上方返回"
fi

# 检查OpenAI文本生成（如有）
echo -e "\n4️⃣ 检查OpenAI文本生成..."
resp=$(curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"provider":"openai","action":"generate-text","prompt":"请用一句话介绍猫"}')
echo "返回: $resp"
echo "$resp" | grep -q '"success":true'
if [ $? -eq 0 ]; then
  echo "✅ 文本生成API正常"
else
  echo "⚠️  文本生成API异常，详见上方返回"
fi

# 检查DeepSeek（如有）
echo -e "\n5️⃣ 检查DeepSeek状态..."
resp=$(curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"provider":"deepseek","action":"status"}')
echo "返回: $resp"
echo "$resp" | grep -q '"available":true'
if [ $? -eq 0 ]; then
  echo "✅ DeepSeek API连通正常"
else
  echo "⚠️  DeepSeek API不可用，详见上方返回"
fi

echo -e "\n=============================="
echo "🔎 检测完成，请根据上方结果排查问题"
echo "==============================" 