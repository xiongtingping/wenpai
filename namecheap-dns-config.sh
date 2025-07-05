#!/bin/bash

# 🌐 Namecheap DNS 配置脚本
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

log_dns() {
    echo -e "${CYAN}🌐 $1${NC}"
}

echo "🌐 Namecheap DNS 配置助手"
echo "=========================="
echo ""

# 域名配置
DOMAIN="wenpai.xyz"
WWW_DOMAIN="www.wenpai.xyz"
NAMECHEAP_URL="https://ap.www.namecheap.com/domains/domaincontrolpanel/wenpai.xyz/advancedns"

log_info "域名信息:"
echo "   🌍 主域名: $DOMAIN"
echo "   🌐 网站域名: $WWW_DOMAIN"
echo "   📍 DNS 管理: $NAMECHEAP_URL"
echo ""

# 检查是否已部署到 Netlify
log_step "步骤 1: 检查 Netlify 部署状态"
echo ""
echo "请确认你已经完成以下操作："
echo "1. 访问 https://app.netlify.com/"
echo "2. 导入 GitHub 仓库: xiongtingping/wenpaiai626"
echo "3. 选择分支: restore-caa083d"
echo "4. 配置构建参数并部署"
echo "5. 获取 Netlify 分配的域名"
echo ""

read -p "请输入你的 Netlify 域名 (例如: random-name-123456.netlify.app): " NETLIFY_DOMAIN

if [ -z "$NETLIFY_DOMAIN" ]; then
    log_error "未提供 Netlify 域名，无法继续配置"
    exit 1
fi

log_success "Netlify 域名: $NETLIFY_DOMAIN"
echo ""

# 显示 DNS 配置
log_step "步骤 2: DNS 记录配置"
echo ""
echo "请在 Namecheap DNS 管理页面添加以下记录："
echo ""

log_dns "A 记录 (主域名):"
echo "   Type: A Record"
echo "   Host: @"
echo "   Value: 75.2.60.5"
echo "   TTL: Automatic"
echo ""

log_dns "CNAME 记录 (www 子域名):"
echo "   Type: CNAME Record"
echo "   Host: www"
echo "   Value: $NETLIFY_DOMAIN"
echo "   TTL: Automatic"
echo ""

log_dns "CNAME 记录 (通配符):"
echo "   Type: CNAME Record"
echo "   Host: *"
echo "   Value: $NETLIFY_DOMAIN"
echo "   TTL: Automatic"
echo ""

# 提供配置步骤
log_step "步骤 3: 配置操作步骤"
echo ""
echo "1. 访问 Namecheap DNS 管理页面:"
echo "   $NAMECHEAP_URL"
echo ""
echo "2. 登录你的 Namecheap 账户"
echo ""
echo "3. 在 'Host Records' 部分添加上述记录"
echo ""
echo "4. 点击 'Save All Changes' 保存"
echo ""

# 等待用户确认
read -p "按回车键继续，查看 DNS 验证步骤..."

echo ""
log_step "步骤 4: DNS 配置验证"
echo ""

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

# 显示在线验证工具
log_step "步骤 5: 在线验证工具"
echo ""
echo "你也可以使用以下在线工具验证 DNS 配置："
echo ""
echo "🌐 DNS 检查工具:"
echo "   - https://www.whatsmydns.net/"
echo "   - https://dnschecker.org/"
echo "   - https://toolbox.googleapps.com/apps/dig/"
echo ""
echo "🔍 输入域名: $WWW_DOMAIN"
echo ""

# 显示时间线
log_step "步骤 6: DNS 传播时间线"
echo ""
echo "⏱️  DNS 传播时间预估："
echo "   - 本地: 几分钟到几小时"
echo "   - 全球: 24-48 小时"
echo "   - 完全传播: 最多 72 小时"
echo ""

# 显示 Authing 配置提醒
log_step "步骤 7: Authing 配置提醒"
echo ""
echo "🔐 完成 DNS 配置后，请记得："
echo "1. 访问 https://console.authing.cn/"
echo "2. 配置回调地址: https://$WWW_DOMAIN/callback"
echo "3. 配置登出地址: https://$WWW_DOMAIN"
echo ""

# 显示测试步骤
log_step "步骤 8: 功能测试"
echo ""
echo "🧪 DNS 配置完成后，请测试以下功能："
echo "1. 访问 https://$WWW_DOMAIN/"
echo "2. 测试 Authing 登录功能"
echo "3. 测试受保护路由"
echo "4. 检查用户头像显示"
echo ""

# 创建快速访问链接
echo ""
log_info "快速访问链接："
echo "   🌐 Namecheap DNS: $NAMECHEAP_URL"
echo "   🔐 Authing 控制台: https://console.authing.cn/"
echo "   🌍 网站: https://$WWW_DOMAIN"
echo "   📖 部署指南: NAMECHEAP_DNS_SETUP.md"
echo ""

log_success "DNS 配置指南完成！"
echo ""
echo "💡 提示："
echo "- 配置 DNS 记录后，运行 './dns-verify.sh' 验证配置"
echo "- 如果遇到问题，查看 NAMECHEAP_DNS_SETUP.md 详细指南"
echo "- DNS 传播需要时间，请耐心等待"
echo "" 