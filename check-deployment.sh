#!/bin/bash

echo "🚀 部署前检查脚本"
echo "================"

# 检查构建
echo "📦 检查构建..."
if npm run build; then
    echo "✅ 构建成功"
else
    echo "❌ 构建失败"
    exit 1
fi

# 检查 dist 目录
echo "📁 检查构建文件..."
if [ -d "dist" ]; then
    echo "✅ dist 目录存在"
    ls -la dist/
else
    echo "❌ dist 目录不存在"
    exit 1
fi

# 检查环境变量
echo "🔧 检查环境变量..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local 文件存在"
    grep -E "VITE_AUTHING" .env.local
else
    echo "❌ .env.local 文件不存在"
fi

# 检查 Authing 配置
echo "🔐 检查 Authing 配置..."
if grep -q "6867fdc88034eb95ae86167d" src/config/authing.ts; then
    echo "✅ Authing App ID 配置正确"
else
    echo "❌ Authing App ID 配置错误"
fi

echo ""
echo "✅ 部署检查完成"
echo ""
echo "📋 部署步骤："
echo "1. 推送代码到 GitHub"
echo "2. 在 Netlify 中导入项目"
echo "3. 配置环境变量"
echo "4. 配置 DNS 记录"
echo "5. 测试登录功能"
