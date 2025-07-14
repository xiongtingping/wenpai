#!/bin/bash

# 问派全栈应用启动脚本
# 同时启动前端和后端服务

echo "🚀 启动问派全栈应用..."

# 检查Node.js版本
NODE_VERSION=$(node -v)
echo "📦 Node.js版本: $NODE_VERSION"

# 检查是否安装了后端依赖
if [ ! -d "node_modules" ] || [ ! -f "backend-package.json" ]; then
    echo "📥 安装后端依赖..."
    npm install
fi

# 检查环境变量文件
if [ ! -f ".env.local" ]; then
    echo "⚠️  警告: 未找到 .env.local 文件"
    echo "📝 请复制 env.example 为 .env.local 并配置相关参数"
    echo "cp env.example .env.local"
fi

# 启动后端API服务器
echo "🔧 启动后端API服务器 (端口: 3001)..."
node backend-api-server.js &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 检查后端是否启动成功
if curl -s http://localhost:3001/api > /dev/null 2>&1; then
    echo "✅ 后端API服务器启动成功"
else
    echo "❌ 后端API服务器启动失败"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# 启动前端开发服务器
echo "🎨 启动前端开发服务器 (端口: 5173)..."
npm run dev &
FRONTEND_PID=$!

# 等待前端启动
sleep 5

# 检查前端是否启动成功
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ 前端开发服务器启动成功"
else
    echo "❌ 前端开发服务器启动失败"
    kill $FRONTEND_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 问派全栈应用启动完成！"
echo ""
echo "📱 前端地址: http://localhost:5173 (开发环境)"
echo "🌐 生产地址: https://www.wenpai.xyz"
echo "🔧 后端API: http://localhost:3001/api (开发环境)"
echo "🔧 生产API: https://www.wenpai.xyz/api"
echo ""
echo "📋 可用功能:"
echo "   - 用户身份认证 (Authing)"
echo "   - 邀请系统 (链接生成、关系绑定、奖励发放)"
echo "   - 使用次数管理 (查询、发放、消费)"
echo "   - 余额管理 (查询、更新)"
echo "   - 用户行为记录 (记录、查询)"
echo "   - 订阅管理 (查询、升级)"
echo "   - 支付处理 (订单创建、验证)"
echo ""
echo "🛑 按 Ctrl+C 停止所有服务"

# 等待用户中断
trap 'echo ""; echo "🛑 正在停止服务..."; kill $FRONTEND_PID 2>/dev/null; kill $BACKEND_PID 2>/dev/null; echo "✅ 服务已停止"; exit 0' INT

# 保持脚本运行
wait 