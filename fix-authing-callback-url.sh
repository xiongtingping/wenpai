#!/bin/bash

# 🔐 Authing 回调URL紧急修复脚本
# 解决Authing控制台回调URL与开发服务器端口不匹配的问题

echo "🔐 Authing 回调URL紧急修复"
echo "=================================="

# 检查当前端口
echo "🔍 检查当前开发服务器端口..."
CURRENT_PORT=""
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5174 | grep -q "200"; then
    CURRENT_PORT="5174"
    echo "✅ 检测到开发服务器运行在端口: $CURRENT_PORT"
elif curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 | grep -q "200"; then
    CURRENT_PORT="5173"
    echo "✅ 检测到开发服务器运行在端口: $CURRENT_PORT"
else
    echo "❌ 未检测到开发服务器运行"
    echo "请先运行: npm run dev"
    exit 1
fi

# 检查环境变量
echo ""
echo "🔧 检查环境变量配置..."
if [ -f ".env.local" ]; then
    ENV_CALLBACK=$(grep "VITE_AUTHING_REDIRECT_URI_DEV" .env.local | cut -d'=' -f2)
    echo "当前环境变量回调地址: $ENV_CALLBACK"
    
    EXPECTED_CALLBACK="http://localhost:${CURRENT_PORT}/callback"
    if [ "$ENV_CALLBACK" = "$EXPECTED_CALLBACK" ]; then
        echo "✅ 环境变量配置正确"
    else
        echo "⚠️ 环境变量需要更新"
        echo "当前: $ENV_CALLBACK"
        echo "期望: $EXPECTED_CALLBACK"
        
        # 更新环境变量
        sed -i '' "s|VITE_AUTHING_REDIRECT_URI_DEV=.*|VITE_AUTHING_REDIRECT_URI_DEV=$EXPECTED_CALLBACK|" .env.local
        echo "✅ 已更新环境变量"
    fi
else
    echo "❌ .env.local 文件不存在"
    exit 1
fi

echo ""
echo "🚨 紧急修复说明"
echo "=================================="
echo "检测到Authing回调URL不匹配错误！"
echo ""
echo "问题原因："
echo "- Authing控制台中的回调URL配置为: http://localhost:5173/callback"
echo "- 当前开发服务器运行在端口: $CURRENT_PORT"
echo "- 这导致了回调URL不匹配的400错误"
echo ""
echo "解决方案："
echo "您需要在Authing控制台中更新回调URL配置"
echo ""

echo "📋 需要更新的Authing控制台配置："
echo "=================================="
echo "1. 登录Authing控制台: https://console.authing.cn"
echo "2. 进入应用配置页面"
echo "3. 找到'wenpai'应用"
echo "4. 更新以下配置："
echo ""
echo "   🔧 登录回调URL:"
echo "   当前: http://localhost:5173/callback"
echo "   更新为: http://localhost:${CURRENT_PORT}/callback"
echo ""
echo "   🔧 登出回调URL:"
echo "   当前: http://localhost:5173/"
echo "   更新为: http://localhost:${CURRENT_PORT}/"
echo ""

echo "⚡ 快速修复步骤："
echo "=================================="
echo "1. 打开浏览器，访问: https://console.authing.cn"
echo "2. 登录您的Authing账号"
echo "3. 点击左侧菜单'应用' → '自建应用'"
echo "4. 找到名为'wenpai'的应用，点击进入"
echo "5. 在'认证配置'部分找到："
echo "   - 登录回调 URL"
echo "   - 登出回调 URL"
echo "6. 将端口号从 5173 改为 ${CURRENT_PORT}"
echo "7. 点击'保存'按钮"
echo ""

echo "🧪 修复后测试："
echo "=================================="
echo "1. 重启开发服务器（如果需要）"
echo "2. 访问测试页面: http://localhost:${CURRENT_PORT}/authing-complete-test"
echo "3. 点击'跳转登录测试'或'跳转注册测试'"
echo "4. 完成Authing认证流程"
echo "5. 检查是否成功回调到应用"
echo ""

echo "🔍 验证修复："
echo "=================================="
echo "修复完成后，您应该看到："
echo "- 不再出现400错误"
echo "- 成功完成OAuth2认证流程"
echo "- 用户信息正确获取和存储"
echo "- 登录状态正常显示"
echo ""

echo "📞 如果仍有问题："
echo "=================================="
echo "1. 确认Authing控制台配置已保存"
echo "2. 清除浏览器缓存"
echo "3. 重启开发服务器"
echo "4. 检查网络连接"
echo "5. 查看浏览器控制台错误信息"
echo ""

echo "✅ 修复脚本执行完成！"
echo "请按照上述步骤更新Authing控制台配置。" 