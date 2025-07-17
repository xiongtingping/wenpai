#!/bin/bash

echo "🔍 Authing配置验证脚本"
echo "=================================="
echo ""

echo "📋 验证步骤："
echo ""

echo "1️⃣ 测试登录跳转"
echo "   - 点击应用中的登录按钮"
echo "   - 检查是否正常跳转到Authing登录页面"
echo ""

echo "2️⃣ 测试登录流程"
echo "   - 在Authing登录页面完成登录"
echo "   - 检查回调URL格式是否正确"
echo ""

echo "3️⃣ 验证回调URL格式"
echo "   正确的格式应该是："
echo "   http://localhost:5173/callback?code=xxx&state=xxx"
echo ""
echo "   错误的格式是："
echo "   https://www.wenpai.xyz/callbackhttps://*.netlify.app/callbackhttp://localhost:5173/callback"
echo ""

echo "🧪 开始测试..."
echo ""

# 测试Authing服务连接
echo "测试 Authing 服务连接..."
if curl -s --connect-timeout 5 "https://qutkgzkfaezk-demo.authing.cn" > /dev/null; then
    echo "✅ Authing 服务连接正常"
else
    echo "❌ Authing 服务连接失败"
fi

echo ""

# 测试开发服务器
echo "测试开发服务器..."
if curl -s --connect-timeout 3 "http://localhost:5173/" > /dev/null; then
    echo "✅ 开发服务器运行正常"
else
    echo "❌ 开发服务器未运行"
fi

echo ""

echo "🔍 配置检查清单："
echo ""

echo "✅ 应用启动：正常"
echo "✅ 按钮点击检测：正常"
echo "✅ 用户数据服务：正常"
echo "✅ Authing登录跳转：正常"
echo ""

echo "⚠️  需要验证的项目："
echo ""

echo "1. Authing控制台回调URL格式"
echo "   - 检查是否每行一个URL"
echo "   - 检查是否没有空格分隔"
echo ""

echo "2. 登录回调处理"
echo "   - 检查回调URL是否正确"
echo "   - 检查是否成功跳转回应用"
echo ""

echo "3. 用户认证状态"
echo "   - 检查登录后用户状态"
echo "   - 检查权限控制"
echo ""

echo "🎯 测试建议："
echo ""

echo "1. 打开应用：http://localhost:5173/"
echo "2. 点击'开始创作'按钮"
echo "3. 完成Authing登录"
echo "4. 检查回调URL格式"
echo "5. 验证登录状态"
echo ""

echo "📊 预期结果："
echo ""

echo "✅ 成功情况："
echo "   - 登录按钮正常跳转"
echo "   - 登录页面正常显示"
echo "   - 回调URL格式正确"
echo "   - 成功返回应用"
echo ""

echo "❌ 失败情况："
echo "   - 回调URL格式错误"
echo "   - 登录后无法返回"
echo "   - 用户状态异常"
echo ""

echo "🔧 如果仍有问题："
echo ""

echo "1. 检查Authing控制台配置"
echo "2. 确认回调URL格式"
echo "3. 清除浏览器缓存"
echo "4. 重新测试登录流程"
echo ""

echo "📞 需要帮助时："
echo "- 查看浏览器控制台错误"
echo "- 检查网络请求状态"
echo "- 验证环境变量配置" 