#!/bin/bash

# 🌐 Netlify 部署脚本
# 作者: AI Assistant
# 日期: 2025-01-05

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

echo "🚀 Netlify 部署助手"
echo "=================="
echo ""

# 检查 Git 状态
log_step "步骤 1: 检查 Git 状态"
if [ ! -d ".git" ]; then
    log_error "当前目录不是 Git 仓库"
    exit 1
fi

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    log_warning "发现未提交的更改"
    echo "请先提交所有更改："
    echo "  git add ."
    echo "  git commit -m '准备部署到 Netlify'"
    echo ""
    read -p "是否现在提交更改？(y/n): " commit_changes
    if [ "$commit_changes" = "y" ]; then
        git add .
        git commit -m "准备部署到 Netlify"
        log_success "更改已提交"
    else
        log_error "请先提交更改再继续"
        exit 1
    fi
fi

# 检查远程仓库
log_step "步骤 2: 检查远程仓库"
if ! git remote get-url origin > /dev/null 2>&1; then
    log_error "未找到远程仓库"
    echo "请先添加远程仓库："
    echo "  git remote add origin https://github.com/yourusername/wenpaiai626.git"
    exit 1
fi

log_success "远程仓库已配置"

# 推送代码
log_step "步骤 3: 推送代码到 GitHub"
echo "正在推送代码..."
git push origin main || git push origin master

if [ $? -eq 0 ]; then
    log_success "代码已推送到 GitHub"
else
    log_error "推送失败，请检查网络连接和权限"
    exit 1
fi

echo ""
log_step "步骤 4: Netlify 部署指南"
echo ""
echo "现在请按照以下步骤在 Netlify 上部署："
echo ""
echo "1. 🌐 访问 Netlify 控制台"
echo "   https://app.netlify.com/"
echo ""
echo "2. 🔗 连接 GitHub 仓库"
echo "   - 点击 'New site from Git'"
echo "   - 选择 'GitHub'"
echo "   - 授权访问你的 GitHub 账户"
echo "   - 选择仓库: wenpaiai626"
echo ""
echo "3. ⚙️ 配置构建设置"
echo "   - Build command: npm run build"
echo "   - Publish directory: dist"
echo "   - 点击 'Deploy site'"
echo ""
echo "4. 🌍 配置自定义域名"
echo "   - 部署完成后，进入 'Domain settings'"
echo "   - 点击 'Add custom domain'"
echo "   - 输入: www.wenpai.xyz"
echo "   - 按照提示配置 DNS 记录"
echo ""

# 创建 DNS 配置指南
cat > netlify-dns-setup.md << 'EOF'
# 🌐 Netlify DNS 配置指南

## 📋 获取 DNS 记录

1. 在 Netlify 控制台 → Domain settings → Custom domains
2. 添加域名：www.wenpai.xyz
3. Netlify 会提供具体的 DNS 记录

## 🔧 Namecheap DNS 配置

访问：https://ap.www.namecheap.com/domains/domaincontrolpanel/wenpai.xyz/advancedns

### 添加以下记录：

**A 记录（主域名）：**
```
Type: A Record
Host: @
Value: [Netlify 提供的 IP 地址]
TTL: Automatic
```

**CNAME 记录（www 子域名）：**
```
Type: CNAME Record
Host: www
Value: [你的-Netlify-域名].netlify.app
TTL: Automatic
```

**CNAME 记录（通配符）：**
```
Type: CNAME Record
Host: *
Value: [你的-Netlify-域名].netlify.app
TTL: Automatic
```

## 🔍 验证配置

配置完成后，运行：
```bash
./dns-verify.sh
```

## ⏱️ DNS 传播时间
- 本地：几分钟到几小时
- 全球：24-48 小时
EOF

log_success "已创建 DNS 配置指南: netlify-dns-setup.md"

# 创建验证脚本
cat > dns-verify.sh << 'EOF'
#!/bin/bash

echo "🔍 DNS 配置验证脚本"
echo "=================="
echo ""

DOMAIN="wenpai.xyz"
WWW_DOMAIN="www.wenpai.xyz"

echo "正在检查 DNS 记录..."
echo ""

# 检查主域名
echo "🌍 检查主域名: $DOMAIN"
if command -v nslookup &> /dev/null; then
    nslookup $DOMAIN
else
    echo "nslookup 命令不可用"
fi
echo ""

# 检查 www 子域名
echo "🌐 检查 www 子域名: $WWW_DOMAIN"
if command -v nslookup &> /dev/null; then
    nslookup $WWW_DOMAIN
else
    echo "nslookup 命令不可用"
fi
echo ""

# 检查 HTTP 状态
echo "🌐 检查网站可访问性..."
if command -v curl &> /dev/null; then
    echo "检查 https://$WWW_DOMAIN"
    curl -I -s https://$WWW_DOMAIN | head -5
else
    echo "curl 命令不可用"
fi

echo ""
echo "✅ DNS 验证完成！"
echo ""
echo "如果 DNS 记录正确配置，你应该能够："
echo "1. 通过 nslookup 看到正确的 IP 地址"
echo "2. 通过浏览器访问 https://$WWW_DOMAIN"
echo ""
echo "注意：DNS 传播可能需要 24-48 小时"
EOF

chmod +x dns-verify.sh

log_success "已创建 DNS 验证脚本: dns-verify.sh"

echo ""
log_step "步骤 5: 后续操作"
echo ""
echo "部署完成后，请："
echo ""
echo "1. 🔐 配置 Authing 回调地址"
echo "   - 访问：https://console.authing.cn/"
echo "   - 更新回调地址：https://www.wenpai.xyz/callback"
echo "   - 更新登出地址：https://www.wenpai.xyz"
echo ""
echo "2. 🧪 测试功能"
echo "   - 访问：https://www.wenpai.xyz"
echo "   - 测试登录功能"
echo "   - 测试内容适配功能"
echo ""
echo "3. 📊 监控部署状态"
echo "   - 在 Netlify 控制台查看部署日志"
echo "   - 检查域名解析状态"
echo ""

log_success "部署指南已生成完成！"
echo ""
echo "📁 生成的文件："
echo "   - netlify-dns-setup.md (DNS 配置指南)"
echo "   - dns-verify.sh (DNS 验证脚本)"
echo ""
echo "🚀 现在请按照上述步骤在 Netlify 上部署你的应用！" 