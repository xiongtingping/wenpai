#!/bin/bash

# 🚀 生产环境构建和测试脚本
# 确保生产环境下 Authing 登录功能正常工作

set -e  # 遇到错误立即退出

echo "🚀 开始生产环境构建和测试..."
echo "=================================="

# 1. 清理旧的构建文件
echo "🧹 清理旧的构建文件..."
rm -rf dist
rm -rf node_modules/.vite
rm -f tsconfig.tsbuildinfo

# 2. 检查 Authing 配置
echo "🔧 检查 Authing 配置..."
node check-production-authing.cjs

# 3. 安装依赖
echo "📦 安装依赖..."
npm ci

# 4. 类型检查
echo "🔍 执行 TypeScript 类型检查..."
npm run type-check

# 5. 构建项目
echo "🏗️ 构建生产环境版本..."
npm run build

# 6. 验证构建输出
echo "✅ 验证构建输出..."
if [ ! -f "dist/index.html" ]; then
    echo "❌ 构建失败：dist/index.html 不存在"
    exit 1
fi

if [ ! -d "dist/assets" ]; then
    echo "❌ 构建失败：dist/assets 目录不存在"
    exit 1
fi

echo "📁 构建输出："
ls -la dist/

echo "📊 构建文件大小："
du -sh dist/

# 7. 检查构建后的 Authing 配置
echo "🔍 检查构建后的 Authing 配置..."
if grep -q "68823897631e1ef8ff3720b2" dist/assets/*.js; then
    echo "✅ 构建文件包含正确的 Authing APP_ID"
else
    echo "⚠️ 构建文件中未找到 Authing APP_ID，可能被环境变量覆盖"
fi

if grep -q "rzcswqd4sq0f.authing.cn" dist/assets/*.js; then
    echo "✅ 构建文件包含正确的 Authing 域名"
else
    echo "⚠️ 构建文件中未找到 Authing 域名"
fi

# 8. 启动预览服务器
echo "🌐 启动生产环境预览服务器..."
echo "请在浏览器中访问以下地址进行测试："
echo "- 主页: http://localhost:4173/"
echo "- 生产环境测试页面: http://localhost:4173/production-auth-test"
echo "- Authing Guard 测试页面: http://localhost:4173/authing-guard-test"
echo ""
echo "测试要点："
echo "1. 检查环境信息是否显示为生产环境"
echo "2. 测试 Authing Guard 登录弹窗是否正常显示"
echo "3. 完成登录流程，验证用户信息是否正确"
echo "4. 检查控制台是否有错误信息"
echo "5. 验证是否还有 undefinedundefined 问题"
echo ""
echo "按 Ctrl+C 停止预览服务器"

npm run preview
