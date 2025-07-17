#!/bin/bash

echo "🔧 修复Authing 400错误..."
echo "========================"

echo "📋 当前配置检查："
echo "- 应用ID: $(grep VITE_AUTHING_APP_ID .env | cut -d'=' -f2)"
echo "- 域名: $(grep VITE_AUTHING_HOST .env | cut -d'=' -f2)"
echo "- 开发回调URL: $(grep VITE_AUTHING_REDIRECT_URI_DEV .env | cut -d'=' -f2)"
echo ""

echo "🔍 诊断结果："
echo "❌ 400 Bad Request 错误"
echo ""
echo "可能的原因："
echo "1. 应用ID不存在或错误"
echo "2. 应用未启用"
echo "3. 回调URL未配置"
echo "4. 应用类型配置错误"
echo ""

echo "🔧 修复步骤："
echo "1. 登录 Authing 控制台：https://console.authing.cn/"
echo "2. 检查应用是否存在：6867fdc88034eb95ae86167d"
echo "3. 如果不存在，创建新应用："
echo "   - 应用类型：单页应用 (SPA)"
echo "   - 应用名称：文派"
echo "   - 登录回调URL："
echo "     http://localhost:5173/callback"
echo "     https://www.wenpai.xyz/callback"
echo "4. 如果存在，检查配置："
echo "   - 应用状态：已启用"
echo "   - 应用类型：单页应用 (SPA)"
echo "   - 回调URL配置正确"
echo ""

echo "📝 重要提醒："
echo "- 每行只能有一个回调URL"
echo "- 不能使用空格分隔多个URL"
echo "- 配置保存后等待1-2分钟生效"
echo ""

echo "🔄 重启开发服务器..."
pkill -f "vite" 2>/dev/null
sleep 2
npm run dev &

echo "✅ 修复指南已生成！"
echo "📖 详细指南：AUTHING_400_ERROR_FIX_GUIDE.md"
echo "🔗 请按照指南在Authing控制台完成配置" 