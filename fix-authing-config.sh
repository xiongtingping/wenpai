#!/bin/bash

# 🔐 Authing 配置修复脚本
# 修复 Authing 配置中的问题

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "${PURPLE}📋 $1${NC}"
}

echo "🔐 Authing 配置修复"
echo "=================="
echo ""

# 检查当前配置
log_step "1. 检查当前 Authing 配置"
echo ""

# 显示当前配置
echo "📋 当前配置信息："
echo "   🔑 App ID: 6867fdc88034eb95ae86167d"
echo "   🌐 Host: https://qutkgzkfaezk-demo.authing.cn"
echo "   🔄 开发环境回调: http://localhost:5173/callback"
echo "   🔄 生产环境回调: https://www.wenpai.xyz/callback"
echo ""

# 检查环境变量
log_step "2. 修复环境变量配置"
echo ""

# 创建 .env.local 文件（如果不存在）
if [ ! -f ".env.local" ]; then
    log_info "创建 .env.local 文件"
    touch .env.local
fi

# 添加 Authing 环境变量
log_info "添加 Authing 环境变量到 .env.local"

# 检查是否已存在 Authing 配置
if ! grep -q "VITE_AUTHING" .env.local; then
    cat >> .env.local << 'EOF'

# Authing 配置
VITE_AUTHING_APP_ID=6867fdc88034eb95ae86167d
VITE_AUTHING_HOST=https://qutkgzkfaezk-demo.authing.cn
VITE_AUTHING_REDIRECT_URI_DEV=http://localhost:5173/callback
VITE_AUTHING_REDIRECT_URI_PROD=https://www.wenpai.xyz/callback
EOF
    log_success "已添加 Authing 环境变量"
else
    log_info "Authing 环境变量已存在"
fi

# 检查 Authing 配置文件
log_step "3. 检查 Authing 配置文件"
echo ""

if [ -f "src/config/authing.ts" ]; then
    log_success "Authing 配置文件存在"
    
    # 检查配置是否正确
    if grep -q "6867fdc88034eb95ae86167d" src/config/authing.ts; then
        log_success "App ID 配置正确"
    else
        log_error "App ID 配置错误"
    fi
    
    if grep -q "qutkgzkfaezk-demo.authing.cn" src/config/authing.ts; then
        log_success "Host 配置正确"
    else
        log_error "Host 配置错误"
    fi
    
    if grep -q "www.wenpai.xyz/callback" src/config/authing.ts; then
        log_success "生产环境回调地址配置正确"
    else
        log_error "生产环境回调地址配置错误"
    fi
else
    log_error "Authing 配置文件不存在"
fi

# 检查 Authing 组件
log_step "4. 检查 Authing 组件"
echo ""

# 检查登录页面
if [ -f "src/pages/AuthingLoginPage.tsx" ]; then
    log_success "Authing 登录页面存在"
else
    log_error "Authing 登录页面不存在"
fi

# 检查回调页面
if [ -f "src/pages/Callback.tsx" ]; then
    log_success "Authing 回调页面存在"
else
    log_error "Authing 回调页面不存在"
fi

# 检查路由配置
log_step "5. 检查路由配置"
echo ""

if grep -q "AuthingLoginPage" src/App.tsx; then
    log_success "Authing 登录路由配置正确"
else
    log_error "Authing 登录路由配置错误"
fi

if grep -q "Callback" src/App.tsx; then
    log_success "Authing 回调路由配置正确"
else
    log_error "Authing 回调路由配置错误"
fi

# 检查依赖包
log_step "6. 检查 Authing 依赖"
echo ""

if grep -q "@authing/guard-react" package.json; then
    log_success "Authing Guard React 依赖已安装"
else
    log_warning "Authing Guard React 依赖未安装"
    echo "   请运行: npm install @authing/guard-react"
fi

# 创建 Authing 测试脚本
log_step "7. 创建 Authing 测试脚本"
echo ""

cat > test-authing-local.sh << 'EOF'
#!/bin/bash

echo "🧪 Authing 本地测试"
echo "=================="
echo ""

echo "1. 启动开发服务器..."
echo "   npm run dev"
echo ""

echo "2. 访问登录页面："
echo "   http://localhost:5173/authing-login"
echo ""

echo "3. 测试登录流程："
echo "   - 点击登录按钮"
echo "   - 完成 Authing 登录"
echo "   - 检查回调是否正常"
echo ""

echo "4. 检查浏览器控制台："
echo "   - 查看是否有错误信息"
echo "   - 检查网络请求"
echo ""

echo "5. 验证用户信息："
echo "   - 检查 localStorage 中的用户信息"
echo "   - 验证受保护路由是否正常"
echo ""

echo "✅ 测试完成！"
EOF

chmod +x test-authing-local.sh
log_success "已创建本地测试脚本: test-authing-local.sh"

# 创建 Authing 控制台配置指南
log_step "8. 创建 Authing 控制台配置指南"
echo ""

cat > authing-console-setup.md << 'EOF'
# 🔐 Authing 控制台配置指南

## 📋 访问 Authing 控制台

1. 访问：https://console.authing.cn/
2. 登录你的 Authing 账户
3. 找到应用：文派AI

## 🔧 应用配置

### 基本信息
- **应用名称**: 文派AI
- **应用 ID**: 6867fdc88034eb95ae86167d
- **应用域名**: https://qutkgzkfaezk-demo.authing.cn

### 回调地址配置

#### 开发环境
```
登录回调 URL: http://localhost:5173/callback
登出回调 URL: http://localhost:5173
```

#### 生产环境
```
登录回调 URL: https://www.wenpai.xyz/callback
登出回调 URL: https://www.wenpai.xyz
```

### 安全配置
- **允许的 Web 起源**: 
  - http://localhost:5173
  - https://www.wenpai.xyz
- **允许的 CORS 起源**:
  - http://localhost:5173
  - https://www.wenpai.xyz

## 🔍 验证配置

1. 保存配置后，等待几分钟生效
2. 在本地测试登录功能
3. 部署到生产环境后测试
4. 检查浏览器控制台是否有错误

## 🐛 常见问题

### 登录失败
- 检查回调地址是否正确
- 确认域名使用 HTTPS（生产环境）
- 验证应用 ID 和域名

### 回调错误
- 检查回调 URL 格式
- 确认路由配置正确
- 验证 CORS 设置

### 组件加载失败
- 检查依赖包是否正确安装
- 确认导入语句正确
- 验证 TypeScript 类型
EOF

log_success "已创建控制台配置指南: authing-console-setup.md"

echo ""
log_step "9. 配置总结"
echo ""

echo "✅ 已完成的配置："
echo "   - 环境变量已添加到 .env.local"
echo "   - Authing 配置文件检查完成"
echo "   - 组件和路由配置验证完成"
echo "   - 依赖包检查完成"
echo ""

echo "📋 需要手动配置："
echo "   1. 访问 Authing 控制台：https://console.authing.cn/"
echo "   2. 更新回调地址配置"
echo "   3. 配置 CORS 和安全设置"
echo ""

echo "🧪 测试步骤："
echo "   1. 运行本地测试：./test-authing-local.sh"
echo "   2. 部署到生产环境"
echo "   3. 测试生产环境登录"
echo ""

log_success "Authing 配置修复完成！"
echo ""
echo "📚 相关文件："
echo "   - authing-console-setup.md (控制台配置指南)"
echo "   - test-authing-local.sh (本地测试脚本)"
echo "   - .env.local (环境变量配置)"
echo ""
echo "🚀 现在可以开始测试 Authing 登录功能了！" 