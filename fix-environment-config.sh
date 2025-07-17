#!/bin/bash

echo "🔧 环境配置诊断和修复脚本"
echo "=================================="

echo ""
echo "📋 当前问题分析："
echo "1. Authing控制台回调URL配置格式错误"
echo "2. 开发环境 vs 生产环境配置差异"
echo "3. 代码模块缺失问题"
echo ""

echo "🔍 环境变量检查："
echo ""

# 检查环境变量文件
if [ -f ".env.local" ]; then
    echo "✅ 找到 .env.local 文件"
    echo "📄 当前配置："
    grep -E "VITE_AUTHING_|VITE_OPENAI_|VITE_DEEPSEEK_" .env.local | while read line; do
        if [[ $line == *"KEY"* ]]; then
            # 隐藏敏感信息
            echo "   ${line%=*}=***"
        else
            echo "   $line"
        fi
    done
else
    echo "❌ 未找到 .env.local 文件"
    echo "📝 建议从 env.example 复制并配置"
fi

echo ""
echo "🌐 网络连接测试："
echo ""

# 测试Authing连接
echo "测试 Authing 服务连接..."
if curl -s --connect-timeout 5 "https://qutkgzkfaezk-demo.authing.cn" > /dev/null; then
    echo "✅ Authing 服务连接正常"
else
    echo "❌ Authing 服务连接失败"
fi

# 测试OpenAI连接
echo "测试 OpenAI API 连接..."
if curl -s --connect-timeout 5 "https://api.openai.com" > /dev/null; then
    echo "✅ OpenAI API 连接正常"
else
    echo "❌ OpenAI API 连接失败"
fi

echo ""
echo "🔧 修复步骤："
echo ""

echo "1️⃣ Authing控制台配置修复"
echo "   当前问题：回调URL格式错误"
echo "   解决方案："
echo "   - 登录 Authing 控制台"
echo "   - 进入应用配置页面"
echo "   - 清除'登录回调 URL'字段内容"
echo "   - 逐个添加以下URL（每行一个）："
echo "     * https://www.wenpai.xyz/callback"
echo "     * https://*.netlify.app/callback"
echo "     * http://localhost:5173/callback"
echo "   - 点击'保存'按钮"
echo "   - 等待1-2分钟配置生效"
echo ""

echo "2️⃣ 环境变量配置"
echo "   确保 .env.local 文件包含以下配置："
echo "   VITE_AUTHING_APP_ID=6867fdc88034eb95ae86167d"
echo "   VITE_AUTHING_HOST=https://qutkgzkfaezk-demo.authing.cn"
echo "   VITE_AUTHING_REDIRECT_URI_DEV=http://localhost:5173/callback"
echo "   VITE_AUTHING_REDIRECT_URI_PROD=https://www.wenpai.xyz/callback"
echo ""

echo "3️⃣ 开发环境配置"
echo "   当前开发服务器：http://localhost:5173/"
echo "   确保开发服务器正在运行"
echo ""

echo "4️⃣ 代码问题修复"
echo "   已修复的问题："
echo "   ✅ 移除了缺失文件的引用"
echo "   ✅ 修复了组件导出问题"
echo "   ✅ 清理了缓存并重启服务器"
echo ""

echo "🧪 测试验证："
echo ""

echo "1. 访问应用：http://localhost:5173/"
echo "2. 点击登录按钮"
echo "3. 应该跳转到 Authing 登录页面"
echo "4. 登录成功后应该正确跳转回应用"
echo ""

echo "⚠️  重要提醒："
echo ""

echo "🔐 环境差异说明："
echo "   - 开发环境：使用 localhost:5173"
echo "   - 生产环境：使用 wenpai.xyz"
echo "   - Netlify部署：使用 *.netlify.app"
echo ""

echo "🌍 网络要求："
echo "   - 需要能够访问 Authing 服务器"
echo "   - 需要能够访问 OpenAI API"
echo "   - 如果网络受限，可能需要配置代理"
echo ""

echo "⏱️  配置生效时间："
echo "   - Authing 配置：1-2分钟"
echo "   - 环境变量：重启开发服务器后生效"
echo "   - 代码修改：热重载立即生效"
echo ""

echo "🚀 快速测试命令："
echo "   # 重启开发服务器"
echo "   pkill -f 'vite' && npm run dev"
echo "   "
echo "   # 打开应用"
echo "   open http://localhost:5173/"
echo ""

echo "📖 详细文档："
echo "   - Authing配置指南：AUTHING_CONSOLE_SETUP_GUIDE.md"
echo "   - 环境变量说明：env.example"
echo ""

echo "✅ 配置完成后，您的应用应该能够正常工作！" 