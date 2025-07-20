#!/bin/bash

# Authing 端口问题快速修复脚本
# 解决端口不匹配导致的 Authing 登录问题

echo "🔧 开始修复 Authing 端口配置问题..."

# 1. 检查当前端口
echo "📋 检查当前运行端口..."
if command -v lsof >/dev/null 2>&1; then
    echo "当前端口使用情况:"
    lsof -i :5173 -i :5174 -i :5175 -i :5176 -i :5177 | grep LISTEN || echo "未找到相关端口"
else
    echo "lsof 命令不可用，无法检查端口"
fi

# 2. 检查环境变量
echo "📋 检查环境变量配置..."
if [ -f ".env.local" ]; then
    echo "找到 .env.local 文件"
    grep -E "VITE_AUTHING|PORT" .env.local || echo "未找到 Authing 相关配置"
else
    echo "未找到 .env.local 文件"
fi

# 3. 检查 package.json 中的端口配置
echo "📋 检查 package.json 端口配置..."
if [ -f "package.json" ]; then
    echo "package.json 中的 dev 脚本:"
    grep -A 1 -B 1 "dev" package.json || echo "未找到 dev 脚本"
fi

# 4. 显示修复建议
echo ""
echo "💡 修复建议:"
echo "1. 确保 Authing 控制台中的回调地址配置为: http://localhost:5177/callback"
echo "2. 或者修改 vite 配置使用固定端口 5173"
echo "3. 检查环境变量 VITE_AUTHING_REDIRECT_URI_DEV 是否正确"
echo ""

# 5. 提供修复命令
echo "🔧 可选的修复命令:"
echo "# 方案1: 修改 vite 配置使用固定端口"
echo "echo 'export default { server: { port: 5173 } }' > vite.config.js"
echo ""
echo "# 方案2: 更新环境变量"
echo "echo 'VITE_AUTHING_REDIRECT_URI_DEV=http://localhost:5177/callback' >> .env.local"
echo ""

# 6. 检查当前配置
echo "📋 当前配置检查:"
echo "当前 URL: $(curl -s http://localhost:5177 2>/dev/null | head -1 || echo '无法访问')"
echo ""

echo "✅ 修复脚本执行完成"
echo "请根据上述建议进行相应修复" 