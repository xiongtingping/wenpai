#!/bin/bash

# 🔧 Authing全局问题修复脚本
# 解决400错误和认证系统冲突问题

echo "🔧 开始修复Authing全局问题..."

# 1. 停止开发服务器
echo "📦 停止开发服务器..."
pkill -f "vite" 2>/dev/null || true
sleep 2

# 2. 清理缓存和临时文件
echo "🧹 清理缓存..."
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf .vite 2>/dev/null || true
rm -rf dist 2>/dev/null || true

# 3. 检查Authing应用状态
echo "🔍 检查Authing应用状态..."
echo "请登录Authing控制台检查以下项目："
echo "1. 应用ID: 6867fdc88034eb95ae86167d"
echo "2. 应用状态: 是否已启用"
echo "3. 应用类型: 应该是'单页应用'"
echo "4. 回调URL: 检查格式是否正确"
echo ""

# 4. 统一认证系统
echo "🔄 统一认证系统..."

# 检查是否有冲突的认证上下文
if [ -f "src/contexts/AuthContext.tsx" ] && [ -f "src/contexts/UnifiedAuthContext.tsx" ]; then
    echo "⚠️  发现多个认证上下文文件"
    echo "📋 建议：保留UnifiedAuthContext.tsx，移除或重命名AuthContext.tsx"
    echo "   当前App.tsx使用UnifiedAuthProvider，这是正确的"
fi

# 5. 检查Authing依赖
echo "📦 检查Authing依赖..."
echo "当前Authing相关依赖："
grep -A 5 -B 5 "authing" package.json | grep -E "authing|@authing" || echo "未找到Authing依赖"

# 6. 验证环境变量
echo "🔧 验证环境变量..."
if [ -f ".env" ]; then
    echo "✅ .env文件存在"
    echo "Authing配置："
    grep "AUTHING" .env || echo "未找到Authing配置"
else
    echo "❌ .env文件不存在"
fi

# 7. 检查Authing控制台配置
echo ""
echo "🎯 Authing控制台配置检查清单："
echo "=================================="
echo "1. 登录 https://console.authing.cn/"
echo "2. 找到应用ID: 6867fdc88034eb95ae86167d"
echo "3. 检查应用状态: 确保已启用"
echo "4. 检查应用类型: 应该是'单页应用(SPA)'"
echo "5. 检查登录回调URL:"
echo "   - https://www.wenpai.xyz/callback"
echo "   - https://wenpai.netlify.app/callback"
echo "   - http://localhost:5173/callback"
echo "6. 确保每个URL都在单独的一行，没有分号"
echo "7. 保存配置并等待生效"
echo ""

# 8. 重新安装依赖
echo "📦 重新安装依赖..."
npm install

# 9. 重新启动开发服务器
echo "🚀 重新启动开发服务器..."
npm run dev &

# 等待服务器启动
sleep 5

# 10. 检查服务器状态
echo "🔍 检查服务器状态..."
if curl -s http://localhost:5173/ > /dev/null; then
    echo "✅ 开发服务器启动成功"
else
    echo "❌ 开发服务器启动失败"
fi

echo ""
echo "🎯 修复完成！"
echo ""
echo "📋 下一步操作："
echo "1. 按照上面的清单检查Authing控制台配置"
echo "2. 打开浏览器访问 http://localhost:5173/"
echo "3. 点击登录按钮测试"
echo "4. 检查控制台是否还有400错误"
echo ""
echo "🔧 如果问题仍然存在："
echo "- 检查Authing应用是否已启用"
echo "- 确认应用类型是'单页应用'"
echo "- 验证回调URL格式"
echo "- 等待配置生效（可能需要几分钟）" 