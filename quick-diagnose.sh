#!/bin/bash

echo "🔍 快速诊断开发环境..."

echo ""
echo "📋 当前进程状态:"
ps aux | grep -E "(vite|netlify)" | grep -v grep

echo ""
echo "🌐 端口监听状态:"
netstat -an | grep LISTEN | grep -E "(5173|5174|5175|5176|5177|8888)" || echo "没有相关端口在监听"

echo ""
echo "🔗 服务可访问性测试:"

# 测试 Vite 服务
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ Vite 服务 (5173): 可访问"
else
    echo "❌ Vite 服务 (5173): 不可访问"
fi

# 测试 Netlify dev 服务
if curl -s http://localhost:8888 > /dev/null 2>&1; then
    echo "✅ Netlify dev 服务 (8888): 可访问"
else
    echo "❌ Netlify dev 服务 (8888): 不可访问"
fi

echo ""
echo "💡 建议:"
echo "1. 如果 Vite 服务可访问，请访问: http://localhost:5173"
echo "2. 如果 Netlify dev 服务可访问，请访问: http://localhost:8888"
echo "3. 如果都不可访问，请重启开发环境"

echo ""
echo "🚀 快速启动选项:"
echo "1. 仅启动 Vite: npm run dev"
echo "2. 启动 Netlify dev: npx netlify dev --port 8888 --target-port 5177"
echo "3. 使用智能脚本: ./check-and-start-dev.sh" 