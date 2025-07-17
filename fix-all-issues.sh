#!/bin/bash

echo "🔧 开始修复所有已知问题..."

# 1. 杀死所有可能的端口占用进程
echo "📡 清理端口占用..."
lsof -ti:5173 | xargs kill -9 2>/dev/null || echo "端口5173无进程占用"
lsof -ti:5174 | xargs kill -9 2>/dev/null || echo "端口5174无进程占用"
lsof -ti:5175 | xargs kill -9 2>/dev/null || echo "端口5175无进程占用"
lsof -ti:5176 | xargs kill -9 2>/dev/null || echo "端口5176无进程占用"
lsof -ti:5177 | xargs kill -9 2>/dev/null || echo "端口5177无进程占用"
lsof -ti:5178 | xargs kill -9 2>/dev/null || echo "端口5178无进程占用"
lsof -ti:8888 | xargs kill -9 2>/dev/null || echo "端口8888无进程占用"

# 2. 安装缺失的依赖
echo "📦 安装缺失的依赖..."
cd netlify/functions && npm install creem qrcode
cd ../.. && npm install creem qrcode

# 3. 检查环境变量
echo "🔍 检查环境变量配置..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local 文件存在"
    grep -q "VITE_OPENAI_API_KEY" .env.local && echo "✅ OpenAI API Key 已配置" || echo "❌ OpenAI API Key 未配置"
    grep -q "VITE_CREEM_API_KEY" .env.local && echo "✅ Creem API Key 已配置" || echo "❌ Creem API Key 未配置"
    grep -q "VITE_AUTHING_APP_ID" .env.local && echo "✅ Authing App ID 已配置" || echo "❌ Authing App ID 未配置"
else
    echo "❌ .env.local 文件不存在"
fi

# 4. 清理缓存
echo "🧹 清理缓存..."
rm -rf node_modules/.vite
rm -rf dist

# 5. 重新安装依赖
echo "📦 重新安装依赖..."
npm install

echo "✅ 修复完成！"
echo ""
echo "🚀 现在可以启动开发环境："
echo "   npm run dev          # 仅前端开发"
echo "   npx netlify dev      # 完整开发环境（包含函数）"
echo ""
echo "📝 注意事项："
echo "   - 如果仍有 push 报错，请刷新浏览器缓存"
echo "   - 如果函数报错，请确保 .env.local 中配置了正确的 API 密钥"
echo "   - 如果端口冲突，脚本已自动清理，重新启动即可" 