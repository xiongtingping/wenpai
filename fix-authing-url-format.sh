#!/bin/bash

echo "🔧 Authing回调URL格式修复详细指南"
echo "=================================="
echo ""

echo "🚨 当前问题："
echo "您的Authing控制台回调URL格式错误，导致多个URL连在一起"
echo ""

echo "❌ 错误格式示例："
echo "https://www.wenpai.xyz/callbackhttps://*.netlify.app/callbackhttp://localhost:5173/callback"
echo ""

echo "✅ 正确格式应该是："
echo ""

echo "方法一：换行符分隔（推荐）"
echo "https://www.wenpai.xyz/callback"
echo "https://*.netlify.app/callback"
echo "http://localhost:5173/callback"
echo ""

echo "方法二：逐个添加"
echo "1. 清空当前内容"
echo "2. 添加第一个URL：https://www.wenpai.xyz/callback"
echo "3. 按回车键或点击'添加'按钮"
echo "4. 添加第二个URL：https://*.netlify.app/callback"
echo "5. 按回车键或点击'添加'按钮"
echo "6. 添加第三个URL：http://localhost:5173/callback"
echo "7. 按回车键或点击'添加'按钮"
echo ""

echo "方法三：分号分隔"
echo "https://www.wenpai.xyz/callback;https://*.netlify.app/callback;http://localhost:5173/callback"
echo ""

echo "🔍 如何验证格式正确："
echo ""

echo "1. 在Authing控制台中，URL应该显示为："
echo "   - 每行一个URL"
echo "   - 或者每个URL单独一行"
echo "   - 或者用分号分隔"
echo ""

echo "2. 保存后，测试登录流程"
echo "   - 点击登录按钮"
echo "   - 完成登录"
echo "   - 检查回调URL格式"
echo ""

echo "3. 正确的回调URL应该是："
echo "   http://localhost:5173/callback?code=xxx&state=xxx"
echo "   而不是："
echo "   https://www.wenpai.xyz/callbackhttps://*.netlify.app/callbackhttp://localhost:5173/callback"
echo ""

echo "⚠️  重要提醒："
echo "- 不要用空格分隔URL"
echo "- 确保每个URL都是完整的"
echo "- 保存后等待1-2分钟生效"
echo "- 测试前清除浏览器缓存"
echo ""

echo "🎯 预期结果："
echo "修复后，登录成功回调应该正确跳转到："
echo "http://localhost:5173/callback?code=xxx&state=xxx"
echo ""

echo "📞 如果仍有问题："
echo "- 检查Authing控制台配置"
echo "- 确认URL格式正确"
echo "- 清除浏览器缓存"
echo "- 重新测试登录流程" 