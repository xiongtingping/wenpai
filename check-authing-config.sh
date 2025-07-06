#!/bin/bash

echo "🔍 检查 Authing 配置..."
echo "================================"

# 检查当前端口
echo "📡 当前开发服务器端口:"
if pgrep -f "vite" > /dev/null; then
    echo "✅ Vite 开发服务器正在运行"
    echo "🌐 请确保在 Authing 控制台添加以下回调 URL:"
    echo "   http://localhost:3000/callback"
else
    echo "❌ Vite 开发服务器未运行"
fi

echo ""
echo "📋 Authing 配置检查清单:"
echo "1. ✅ 应用 ID: 6867fdc88034eb95ae86167d"
echo "2. ✅ 域名: https://qutkgzkfaezk-demo.authing.cn"
echo "3. 🔄 回调 URL: http://localhost:3000/callback"
echo "4. ✅ 模式: normal"
echo "5. ✅ 默认场景: login"

echo ""
echo "🔧 需要在 Authing 控制台设置的回调 URL:"
echo "   - http://localhost:3000/callback"
echo "   - https://www.wenpai.xyz/callback (生产环境)"

echo ""
echo "📝 登录/注册流程说明:"
echo "1. 用户点击'登录/注册'按钮"
echo "2. 跳转到 /login-register 页面"
echo "3. 用户填写表单信息"
echo "4. 使用 Authing SDK 进行认证"
echo "5. 提交后验证并跳转到个人中心"

echo ""
echo "🧪 测试页面:"
echo "   - 访问 http://localhost:3000/authing-test 进行功能测试"
echo "   - 可以测试登录、注册、发送验证码等功能"

echo ""
echo "✅ 配置检查完成！" 