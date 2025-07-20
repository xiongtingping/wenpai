#!/bin/bash

# 简化的开发环境启动脚本
# 直接使用 Vite 开发服务器，避免 Netlify Dev 的复杂性

echo "🚀 启动简化开发环境..."

# 检查环境变量文件
if [ ! -f ".env.local" ]; then
    echo "⚠️  警告: 未找到 .env.local 文件"
    echo "💡 建议创建 .env.local 文件并添加必要的环境变量"
fi

# 清除 Vite 缓存
echo "🧹 清除 Vite 缓存..."
rm -rf node_modules/.vite

# 启动 Vite 开发服务器
echo "🔥 启动 Vite 开发服务器..."
npm run dev

echo "✅ 开发服务器已启动在 http://localhost:5173" 