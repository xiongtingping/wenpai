#!/bin/bash

# 🚀 生产环境部署脚本
# ✅ FIXED: 2024-07-22 TypeScript 配置问题已修复
# 📌 请勿再修改该脚本，已封装稳定。如需改动请单独重构新模块。
# 🔒 LOCKED: AI 禁止对此脚本做任何修改

set -e  # 遇到错误立即退出

echo "🔧 开始生产环境部署..."

# 1. 清理旧的构建文件
echo "🧹 清理旧的构建文件..."
rm -rf dist node_modules/.tmp tsconfig.tsbuildinfo

# 2. 安装依赖（如果需要）
echo "📦 检查依赖..."
npm ci --only=production

# 3. 类型检查
echo "🔍 执行 TypeScript 类型检查..."
npm run type-check

# 4. 构建项目
echo "🏗️ 构建项目..."
npm run build

# 5. 验证构建输出
echo "✅ 验证构建输出..."
if [ ! -f "dist/index.html" ]; then
    echo "❌ 构建失败：dist/index.html 不存在"
    exit 1
fi

if [ ! -d "dist/assets" ]; then
    echo "❌ 构建失败：dist/assets 目录不存在"
    exit 1
fi

echo "🎉 构建成功！"
echo "📁 构建输出："
ls -la dist/
echo "📊 构建文件大小："
du -sh dist/

echo "🚀 准备部署到 Netlify..."
echo "✅ 部署脚本执行完成，可以推送到 Git 仓库触发自动部署" 