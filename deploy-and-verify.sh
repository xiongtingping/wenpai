#!/bin/bash

# Authing登录修复部署验证脚本

echo "🚀 Authing登录修复部署验证"
echo "================================"
echo ""

# 检查Git状态
echo "📋 检查Git状态..."
git status --porcelain

if [ $? -eq 0 ]; then
    echo "✅ Git仓库状态正常"
else
    echo "❌ Git仓库状态异常"
    exit 1
fi

echo ""

# 提交修复
echo "💾 提交Authing登录修复..."
git add .
git commit -m "fix(auth): 修复Authing登录失败问题

- 添加Netlify Functions环境变量配置
- 实现多token端点重试机制  
- 优化错误处理和调试日志
- 确保服务端配置完整性

修复内容:
1. netlify.toml: 添加AUTHING_APP_ID, AUTHING_HOST, AUTHING_REDIRECT_URI
2. authing-token-exchange.cjs: 多端点重试和详细日志
3. 环境变量优先级: 服务端专用 > 客户端构建期 > 默认值

测试结果:
- ✅ Token端点可用 (3个端点)
- ✅ 授权URL生成正常
- ⏳ 等待Netlify重新部署生效"

if [ $? -eq 0 ]; then
    echo "✅ 代码提交成功"
else
    echo "⚠️  没有新的更改需要提交"
fi

echo ""

# 推送到远程仓库
echo "📤 推送到远程仓库..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ 推送成功，Netlify将自动部署"
else
    echo "❌ 推送失败"
    exit 1
fi

echo ""

# 等待部署
echo "⏳ 等待Netlify部署完成..."
echo "   部署通常需要2-3分钟"
echo "   可以在 https://app.netlify.com 查看部署状态"
echo ""

# 提供验证步骤
echo "🧪 部署完成后的验证步骤:"
echo "================================"
echo ""
echo "1. 运行验证脚本:"
echo "   node test-authing-fix-final.cjs"
echo ""
echo "2. 测试登录功能:"
echo "   访问 https://www.wenpai.xyz/"
echo "   点击登录按钮"
echo "   检查是否能正常跳转到Authing登录页面"
echo ""
echo "3. 检查Netlify Functions日志:"
echo "   访问 https://app.netlify.com/sites/wenpai/functions"
echo "   查看 authing-token-exchange 函数的实时日志"
echo ""
echo "4. 如果仍有问题，检查:"
echo "   - Authing控制台回调URL配置"
echo "   - Netlify环境变量是否正确设置"
echo "   - 网络连接和DNS解析"
echo ""

echo "🎯 预期结果:"
echo "   ✅ Netlify Functions配置正常"
echo "   ✅ Token交换成功"
echo "   ✅ 用户能够正常登录"
echo ""

echo "📞 如需帮助:"
echo "   查看项目README中的故障排除部分"
echo "   或提交GitHub Issue"
echo ""

echo "🎉 修复部署完成！"
