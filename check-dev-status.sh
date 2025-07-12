#!/bin/bash

# 开发环境状态检查脚本

echo "🔍 检查开发环境状态..."
echo ""

# 检查API服务器
echo "📡 API服务器状态:"
if curl -s http://localhost:8888/.netlify/functions/api > /dev/null; then
    echo "✅ API服务器运行正常 (端口 8888)"
    
    # 测试API功能
    echo "🧪 测试API功能..."
    API_RESPONSE=$(curl -s -X POST http://localhost:8888/.netlify/functions/api \
        -H "Content-Type: application/json" \
        -d '{"provider":"openai","action":"status"}' 2>/dev/null)
    
    if echo "$API_RESPONSE" | grep -q '"success":true'; then
        echo "✅ API功能正常"
    else
        echo "⚠️  API功能异常: $(echo "$API_RESPONSE" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)"
    fi
else
    echo "❌ API服务器未运行"
fi

echo ""

# 检查Vite开发服务器
echo "🌐 Vite开发服务器状态:"
VITE_PORTS=(3000 3001 3002 3003 3004 3005 3006 3007)
VITE_RUNNING=false

for port in "${VITE_PORTS[@]}"; do
    if curl -s http://localhost:$port > /dev/null; then
        echo "✅ Vite开发服务器运行正常 (端口 $port)"
        VITE_RUNNING=true
        VITE_PORT=$port
        break
    fi
done

if [ "$VITE_RUNNING" = false ]; then
    echo "❌ Vite开发服务器未运行"
fi

echo ""

# 检查环境变量
echo "🔑 环境变量状态:"
if [ ! -z "$OPENAI_API_KEY" ]; then
    echo "✅ OPENAI_API_KEY 已设置"
    # 显示API Key的前10个字符
    KEY_PREFIX=$(echo "$OPENAI_API_KEY" | cut -c1-10)
    echo "   Key前缀: $KEY_PREFIX..."
else
    echo "❌ OPENAI_API_KEY 未设置"
fi

echo ""

# 检查代理配置
echo "🔗 代理配置状态:"
if curl -s http://localhost:$VITE_PORT/.netlify/functions/api > /dev/null 2>&1; then
    echo "✅ Vite代理配置正常"
else
    echo "❌ Vite代理配置异常"
fi

echo ""

# 显示访问链接
if [ "$VITE_RUNNING" = true ]; then
    echo "📱 访问链接:"
    echo "   前端地址: http://localhost:$VITE_PORT"
    echo "   测试页面: http://localhost:$VITE_PORT/test-image-generation.html"
    echo "   API地址: http://localhost:8888/.netlify/functions/api"
    echo ""
fi

# 检查进程
echo "🔄 运行中的进程:"
echo "   API服务器: $(ps aux | grep 'node dev-api-server.js' | grep -v grep | wc -l) 个"
echo "   Vite服务器: $(ps aux | grep 'vite' | grep -v grep | wc -l) 个"

echo ""
echo "✅ 状态检查完成" 