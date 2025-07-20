#!/bin/bash

# 🔐 Authing Guard 弹窗修复脚本
# 用于验证和修复Authing Guard弹窗功能

set -e

echo "🔐 Authing Guard 弹窗修复脚本"
echo "=================================="

# 检查当前目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

echo "✅ 当前目录：$(pwd)"

# 检查依赖
echo ""
echo "📦 检查依赖..."
if npm list @authing/guard-react > /dev/null 2>&1; then
    echo "✅ @authing/guard-react 已安装"
else
    echo "❌ @authing/guard-react 未安装，正在安装..."
    npm install @authing/guard-react
fi

# 检查环境变量
echo ""
echo "🔧 检查环境变量..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local 文件存在"
    echo "📋 当前Authing配置："
    grep -E "VITE_AUTHING_" .env.local || echo "⚠️ 未找到Authing环境变量"
else
    echo "⚠️ .env.local 文件不存在，使用默认配置"
fi

# 检查配置文件
echo ""
echo "🔧 检查配置文件..."
if [ -f "src/config/authing.ts" ]; then
    echo "✅ authing.ts 配置文件存在"
else
    echo "❌ authing.ts 配置文件不存在"
    exit 1
fi

# 检查组件文件
echo ""
echo "🔧 检查组件文件..."
if [ -f "src/components/auth/AuthingGuardModal.tsx" ]; then
    echo "✅ AuthingGuardModal.tsx 组件存在"
else
    echo "❌ AuthingGuardModal.tsx 组件不存在"
    exit 1
fi

if [ -f "src/components/auth/AuthModal.tsx" ]; then
    echo "✅ AuthModal.tsx 组件存在"
else
    echo "❌ AuthModal.tsx 组件不存在"
    exit 1
fi

# 检查测试页面
echo ""
echo "🔧 检查测试页面..."
if [ -f "src/pages/AuthingGuardTestPage.tsx" ]; then
    echo "✅ AuthingGuardTestPage.tsx 测试页面存在"
else
    echo "❌ AuthingGuardTestPage.tsx 测试页面不存在"
    exit 1
fi

# 运行诊断脚本
echo ""
echo "🔍 运行Authing诊断..."
if [ -f "comprehensive-authing-diagnosis.cjs" ]; then
    node comprehensive-authing-diagnosis.cjs
else
    echo "⚠️ 诊断脚本不存在，跳过诊断"
fi

# 检查开发服务器状态
echo ""
echo "🚀 检查开发服务器状态..."
if pgrep -f "vite.*--port.*5173" > /dev/null; then
    echo "✅ 开发服务器正在运行 (端口 5173)"
    DEV_SERVER_RUNNING=true
else
    echo "⚠️ 开发服务器未运行"
    DEV_SERVER_RUNNING=false
fi

# 提供测试指导
echo ""
echo "🧪 测试指导："
echo "=================================="
echo "1. 如果开发服务器未运行，请运行：npm run dev"
echo "2. 访问测试页面：http://localhost:5173/authing-guard-test"
echo "3. 点击'测试登录'按钮，应该会打开Authing Guard登录弹窗"
echo "4. 点击'测试注册'按钮，应该会打开Authing Guard注册弹窗"
echo "5. 检查浏览器控制台是否有错误信息"
echo ""
echo "🔧 如果遇到问题："
echo "- 检查网络连接"
echo "- 检查Authing控制台配置"
echo "- 检查环境变量设置"
echo "- 查看浏览器控制台错误信息"

# 如果开发服务器未运行，询问是否启动
if [ "$DEV_SERVER_RUNNING" = false ]; then
    echo ""
    read -p "是否启动开发服务器？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 启动开发服务器..."
        npm run dev &
        echo "✅ 开发服务器已启动"
        echo "📋 请访问：http://localhost:5173/authing-guard-test"
    fi
fi

echo ""
echo "✅ Authing Guard 弹窗修复脚本完成！"
echo "📋 请按照上述指导进行测试" 