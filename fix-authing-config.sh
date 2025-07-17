#!/bin/bash

echo "🔧 Authing控制台配置修复指南"
echo "=================================="
echo ""

echo "📋 问题诊断："
echo "从日志可以看到回调URL格式错误，多个URL被连在一起"
echo ""

echo "🎯 解决方案："
echo "1. 登录Authing控制台：https://console.authing.cn"
echo "2. 进入应用管理 -> 找到您的应用"
echo "3. 点击'应用配置' -> '登录配置'"
echo "4. 找到'回调地址'字段"
echo ""

echo "⚠️  重要：清除错误的回调URL配置"
echo "当前错误的配置可能是："
echo "https://www.wenpai.xyz/callback;https://*.netlify.app/callback;http://localhost:5173/callback"
echo ""

echo "✅ 正确的配置方法："
echo "1. 删除所有现有的回调URL"
echo "2. 逐个添加正确的回调URL（每行一个）："
echo ""
echo "   http://localhost:5173/callback"
echo "   https://www.wenpai.xyz/callback"
echo "   https://*.netlify.app/callback"
echo ""

echo "📝 操作步骤："
echo "1. 在回调地址输入框中，确保每个URL独占一行"
echo "2. 不要用分号(;)或空格分隔"
echo "3. 点击'保存'按钮"
echo "4. 等待配置生效（通常需要1-2分钟）"
echo ""

echo "🔍 验证方法："
echo "1. 保存配置后，等待1-2分钟"
echo "2. 重新测试登录功能"
echo "3. 检查回调URL是否正确"
echo ""

echo "💡 提示："
echo "- 开发环境使用：http://localhost:5173/callback"
echo "- 生产环境使用：https://www.wenpai.xyz/callback"
echo "- 确保URL格式完全正确，包括协议、域名和路径"
echo ""

echo "🚀 快速修复命令："
echo "运行以下命令重启开发服务器："
echo "pkill -f 'vite' && sleep 2 && npm run dev"
echo ""

echo "📞 如果问题仍然存在："
echo "1. 检查Authing应用ID和密钥是否正确"
echo "2. 确认域名配置是否匹配"
echo "3. 清除浏览器缓存和本地存储"
echo ""

echo "✅ 配置完成后，重新测试登录功能"
echo "==================================" 