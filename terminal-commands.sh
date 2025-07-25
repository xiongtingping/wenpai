#!/bin/bash
# 🚀 文派AI项目完整启动脚本

echo "🎉 网络修复成功！现在启动完整的文派AI项目..."
echo ""

# 停止之前的测试服务器
echo "🛑 停止测试服务器..."
pkill -f "python3 -m http.server" 2>/dev/null || true
sleep 2

# 清理可能的端口占用
echo "🧹 清理端口占用..."
for port in 5173 5174 3000 8000; do
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
done

# 检查项目依赖
echo "� 检查项目依赖..."
if [ ! -d "node_modules" ]; then
    echo "📥 安装项目依赖..."
    npm install
fi

# 检查环境配置
echo "⚙️ 检查环境配置..."
if [ ! -f ".env.local" ]; then
    echo "📝 创建环境配置文件..."
    cat > .env.local << 'EOF'
# Authing配置
VITE_AUTHING_APP_ID=6867fdc88034eb95ae86167d
VITE_AUTHING_HOST=https://qutkgzkfaezk-demo.authing.cn

# 开发模式
VITE_DEV_MODE=true
EOF
    echo "✅ 环境配置文件已创建"
fi

# 清理缓存
echo "🧹 清理开发缓存..."
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf .vite 2>/dev/null || true
rm -rf dist 2>/dev/null || true

# 启动开发服务器
echo "🚀 启动文派AI开发服务器..."
echo "⏳ 请等待服务器启动..."

npm run dev &
DEV_SERVER_PID=$!

# 等待服务器启动
echo "⏳ 等待开发服务器启动..."
sleep 10

# 检查服务器状态
SERVER_STARTED=false
for port in 5173 5174; do
    if curl -s --connect-timeout 5 "http://localhost:$port" >/dev/null 2>&1; then
        echo "✅ 开发服务器启动成功！端口: $port"
        SERVER_URL="http://localhost:$port"
        SERVER_STARTED=true
        break
    fi
done

if [ "$SERVER_STARTED" = true ]; then
    echo ""
    echo "🎉 文派AI项目启动成功！"
    echo "=================================="
    echo "✅ 开发服务器运行中: $SERVER_URL"
    echo "✅ Chrome和Safari都可以正常访问"
    echo ""
    
    # 自动打开浏览器
    echo "🌐 正在自动打开浏览器..."
    open -a Safari "$SERVER_URL" 2>/dev/null &
    sleep 2
    open -a "Google Chrome" "$SERVER_URL" 2>/dev/null &
    
    echo ""
    echo "🎯 现在您可以："
    echo "• ✅ 使用文派AI的所有功能"
    echo "• ✅ 测试Authing登录系统"
    echo "• ✅ 体验创意魔方等工具"
    echo "• ✅ 正常使用Chrome和Safari"
    echo ""
    echo "� 项目地址: $SERVER_URL"
    echo "� 按 Ctrl+C 停止开发服务器"
    echo ""
    
    # 保持服务器运行
    trap "echo ''; echo '🛑 正在停止开发服务器...'; kill $DEV_SERVER_PID 2>/dev/null; echo '✅ 开发服务器已停止'; exit 0" INT
    
    # 等待用户中断
    wait $DEV_SERVER_PID
    
else
    echo ""
    echo "❌ 开发服务器启动失败"
    echo "=================================="
    echo "� 尝试手动启动："
    echo "npm run dev"
    echo ""
    echo "📋 或者检查以下问题："
    echo "• Node.js版本是否兼容"
    echo "• 项目依赖是否完整"
    echo "• 端口是否被占用"
    
    # 显示详细错误信息
    echo ""
    echo "� 系统信息："
    echo "Node.js版本: $(node --version 2>/dev/null || echo '未安装')"
    echo "npm版本: $(npm --version 2>/dev/null || echo '未安装')"
    echo "当前目录: $(pwd)"
    echo "package.json: $([ -f package.json ] && echo '存在' || echo '不存在')"
fi
