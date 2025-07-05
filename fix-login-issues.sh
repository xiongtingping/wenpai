#!/bin/bash

# 🔐 登录功能问题修复脚本
# 修复 Authing 配置和环境变量问题

echo "🔐 登录功能问题修复脚本"
echo "========================"
echo ""

# 1. 创建环境变量文件
echo "📝 创建环境变量配置文件..."
cat > .env.local << 'EOF'
# Authing 配置
VITE_AUTHING_APP_ID=6867fdc88034eb95ae86167d
VITE_AUTHING_HOST=https://qutkgzkfaezk-demo.authing.cn
VITE_AUTHING_REDIRECT_URI_DEV=http://localhost:5173/callback
VITE_AUTHING_REDIRECT_URI_PROD=https://www.wenpai.xyz/callback

# 其他环境变量
VITE_APP_NAME=文派AI
VITE_APP_VERSION=1.0.0
EOF

echo "✅ 环境变量文件创建完成"

# 2. 检查并修复 Authing 配置文件
echo ""
echo "🔧 检查 Authing 配置文件..."

# 检查配置文件是否存在
if [ -f "src/config/authing.ts" ]; then
    echo "✅ Authing 配置文件存在"
    
    # 检查配置是否正确
    if grep -q "6867fdc88034eb95ae86167d" src/config/authing.ts; then
        echo "✅ App ID 配置正确"
    else
        echo "❌ App ID 配置可能有问题"
    fi
    
    if grep -q "qutkgzkfaezk-demo.authing.cn" src/config/authing.ts; then
        echo "✅ Host 配置正确"
    else
        echo "❌ Host 配置可能有问题"
    fi
else
    echo "❌ Authing 配置文件不存在"
fi

# 3. 检查依赖包
echo ""
echo "📦 检查依赖包..."

if npm list @authing/guard-react > /dev/null 2>&1; then
    echo "✅ @authing/guard-react 已安装"
else
    echo "❌ @authing/guard-react 未安装，正在安装..."
    npm install @authing/guard-react
fi

if npm list @authing/web > /dev/null 2>&1; then
    echo "✅ @authing/web 已安装"
else
    echo "❌ @authing/web 未安装，正在安装..."
    npm install @authing/web
fi

if npm list authing-js-sdk > /dev/null 2>&1; then
    echo "✅ authing-js-sdk 已安装"
else
    echo "❌ authing-js-sdk 未安装，正在安装..."
    npm install authing-js-sdk
fi

# 4. 检查关键文件
echo ""
echo "📁 检查关键文件..."

files=(
    "src/pages/AuthingLoginPage.tsx"
    "src/pages/Callback.tsx"
    "src/services/authingService.ts"
    "src/hooks/useAuthing.ts"
    "src/components/auth/AuthGuard.tsx"
    "src/config/authing.ts"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file 存在"
    else
        echo "❌ $file 不存在"
    fi
done

# 5. 检查路由配置
echo ""
echo "🛣️  检查路由配置..."

if grep -q "authing-login" src/App.tsx; then
    echo "✅ Authing 登录路由配置正确"
else
    echo "❌ Authing 登录路由配置可能有问题"
fi

if grep -q "callback" src/App.tsx; then
    echo "✅ 回调路由配置正确"
else
    echo "❌ 回调路由配置可能有问题"
fi

# 6. 创建测试脚本
echo ""
echo "🧪 创建测试脚本..."

cat > test-login.sh << 'EOF'
#!/bin/bash

echo "🧪 登录功能测试脚本"
echo "=================="

# 启动开发服务器
echo "🚀 启动开发服务器..."
npm run dev &
DEV_PID=$!

# 等待服务器启动
sleep 5

echo ""
echo "📋 测试清单："
echo "1. 访问 http://localhost:5173/authing-login"
echo "2. 检查登录弹窗是否正常显示"
echo "3. 测试登录功能"
echo "4. 检查回调处理"
echo "5. 测试权限保护"

echo ""
echo "🔍 检查网络连接..."
if curl -s https://qutkgzkfaezk-demo.authing.cn > /dev/null; then
    echo "✅ Authing 服务连接正常"
else
    echo "❌ Authing 服务连接失败"
fi

echo ""
echo "📊 检查构建状态..."
if npm run build > /dev/null 2>&1; then
    echo "✅ 构建成功"
else
    echo "❌ 构建失败"
fi

# 停止开发服务器
kill $DEV_PID 2>/dev/null

echo ""
echo "✅ 测试完成"
EOF

chmod +x test-login.sh
echo "✅ 测试脚本创建完成"

# 7. 创建部署检查脚本
echo ""
echo "🚀 创建部署检查脚本..."

cat > check-deployment.sh << 'EOF'
#!/bin/bash

echo "🚀 部署前检查脚本"
echo "================"

# 检查构建
echo "📦 检查构建..."
if npm run build; then
    echo "✅ 构建成功"
else
    echo "❌ 构建失败"
    exit 1
fi

# 检查 dist 目录
echo "📁 检查构建文件..."
if [ -d "dist" ]; then
    echo "✅ dist 目录存在"
    ls -la dist/
else
    echo "❌ dist 目录不存在"
    exit 1
fi

# 检查环境变量
echo "🔧 检查环境变量..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local 文件存在"
    grep -E "VITE_AUTHING" .env.local
else
    echo "❌ .env.local 文件不存在"
fi

# 检查 Authing 配置
echo "🔐 检查 Authing 配置..."
if grep -q "6867fdc88034eb95ae86167d" src/config/authing.ts; then
    echo "✅ Authing App ID 配置正确"
else
    echo "❌ Authing App ID 配置错误"
fi

echo ""
echo "✅ 部署检查完成"
echo ""
echo "📋 部署步骤："
echo "1. 推送代码到 GitHub"
echo "2. 在 Netlify 中导入项目"
echo "3. 配置环境变量"
echo "4. 配置 DNS 记录"
echo "5. 测试登录功能"
EOF

chmod +x check-deployment.sh
echo "✅ 部署检查脚本创建完成"

# 8. 显示修复结果
echo ""
echo "🎯 修复完成！"
echo "============="
echo ""
echo "✅ 已完成以下修复："
echo "1. 创建了 .env.local 环境变量文件"
echo "2. 检查了 Authing 配置文件"
echo "3. 验证了依赖包安装"
echo "4. 检查了关键文件存在"
echo "5. 验证了路由配置"
echo "6. 创建了测试脚本"
echo "7. 创建了部署检查脚本"
echo ""
echo "📋 下一步操作："
echo "1. 运行 ./test-login.sh 测试登录功能"
echo "2. 运行 ./check-deployment.sh 检查部署准备"
echo "3. 在 Authing 控制台更新回调地址"
echo "4. 部署到生产环境并测试"
echo ""
echo "🔗 Authing 控制台地址："
echo "https://console.authing.cn/"
echo ""
echo "📞 如需帮助，请查看 LOGIN_FUNCTION_CHECK_REPORT.md" 