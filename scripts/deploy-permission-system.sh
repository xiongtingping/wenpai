#!/bin/bash

# =====================================================
# 订阅权限系统部署脚本
# @description 一键部署权限系统所需的所有组件
# @version 1.0.0
# @created 2025-10-02
# =====================================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
  local color=$1
  local message=$2
  echo -e "${color}${message}${NC}"
}

print_step() {
  print_message "$BLUE" "\n========================================\n$1\n========================================"
}

print_success() {
  print_message "$GREEN" "✅ $1"
}

print_error() {
  print_message "$RED" "❌ $1"
}

print_warning() {
  print_message "$YELLOW" "⚠️  $1"
}

# =====================================================
# 步骤1: 检查环境
# =====================================================

print_step "步骤1: 检查环境"

# 检查必要的命令是否存在
command -v node >/dev/null 2>&1 || { print_error "需要Node.js，请先安装"; exit 1; }
command -v npm >/dev/null 2>&1 || { print_error "需要npm，请先安装"; exit 1; }
command -v psql >/dev/null 2>&1 || print_warning "未安装psql，将跳过数据库检查"

print_success "环境检查完成"

# =====================================================
# 步骤2: 检查环境变量
# =====================================================

print_step "步骤2: 检查环境变量"

if [ ! -f .env ]; then
  print_warning ".env文件不存在"

  if [ -f .env.permissions.example ]; then
    print_message "$YELLOW" "是否从 .env.permissions.example 创建 .env ? (y/n)"
    read -r response
    if [[ "$response" == "y" || "$response" == "Y" ]]; then
      cp .env.permissions.example .env
      print_success "已创建 .env 文件，请编辑并填写实际值"
      print_error "请编辑 .env 文件后重新运行此脚本"
      exit 1
    else
      print_error "部署需要 .env 文件"
      exit 1
    fi
  else
    print_error "未找到 .env.permissions.example 模板"
    exit 1
  fi
fi

# 检查关键环境变量
source .env

if [ -z "$VITE_SUPABASE_URL" ]; then
  print_error "VITE_SUPABASE_URL 未设置"
  exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  print_warning "SUPABASE_SERVICE_ROLE_KEY 未设置，后端API将无法工作"
fi

print_success "环境变量检查完成"

# =====================================================
# 步骤3: 安装依赖
# =====================================================

print_step "步骤3: 安装依赖"

npm install

print_success "依赖安装完成"

# =====================================================
# 步骤4: 运行数据库迁移
# =====================================================

print_step "步骤4: 运行数据库迁移"

if command -v psql >/dev/null 2>&1 && [ -n "$DATABASE_URL" ]; then
  print_message "$BLUE" "运行数据库迁移..."

  # 运行创建表脚本
  if [ -f database/migrations/001_create_user_subscriptions.sql ]; then
    psql "$DATABASE_URL" < database/migrations/001_create_user_subscriptions.sql
    print_success "创建订阅表完成"
  else
    print_warning "未找到 001_create_user_subscriptions.sql"
  fi

  # 运行RLS配置脚本
  if [ -f database/migrations/002_setup_rls.sql ]; then
    psql "$DATABASE_URL" < database/migrations/002_setup_rls.sql
    print_success "RLS配置完成"
  else
    print_warning "未找到 002_setup_rls.sql"
  fi
else
  print_warning "跳过数据库迁移 (psql未安装或DATABASE_URL未设置)"
  print_message "$YELLOW" "请手动运行以下SQL文件:"
  print_message "$YELLOW" "  - database/migrations/001_create_user_subscriptions.sql"
  print_message "$YELLOW" "  - database/migrations/002_setup_rls.sql"
fi

# =====================================================
# 步骤5: 构建项目
# =====================================================

print_step "步骤5: 构建项目"

npm run build

print_success "项目构建完成"

# =====================================================
# 步骤6: 部署到Vercel (可选)
# =====================================================

print_step "步骤6: 部署到Vercel"

print_message "$YELLOW" "是否部署到Vercel? (y/n)"
read -r response

if [[ "$response" == "y" || "$response" == "Y" ]]; then
  if command -v vercel >/dev/null 2>&1; then
    print_message "$BLUE" "开始部署到Vercel..."

    # 设置环境变量
    vercel env add VITE_SUPABASE_URL "$VITE_SUPABASE_URL" production
    vercel env add VITE_SUPABASE_ANON_KEY "$VITE_SUPABASE_ANON_KEY" production
    vercel env add SUPABASE_SERVICE_ROLE_KEY "$SUPABASE_SERVICE_ROLE_KEY" production
    vercel env add PERMISSION_SECRET "$PERMISSION_SECRET" production
    vercel env add CRON_SECRET "$CRON_SECRET" production

    # 部署
    vercel --prod

    print_success "Vercel部署完成"
  else
    print_error "Vercel CLI未安装"
    print_message "$YELLOW" "请运行: npm i -g vercel"
  fi
else
  print_message "$BLUE" "跳过Vercel部署"
fi

# =====================================================
# 步骤7: 验证部署
# =====================================================

print_step "步骤7: 验证部署"

# 检查关键文件是否存在
files_to_check=(
  "src/components/auth/CompactPermissionCard.tsx"
  "src/components/auth/OptimizedPermissionGuard.tsx"
  "src/services/permissionCacheService.ts"
  "src/api/permissions/verify.ts"
  "src/api/webhooks/payment-callback.ts"
  "src/styles/permission-guard.css"
)

all_files_exist=true
for file in "${files_to_check[@]}"; do
  if [ -f "$file" ]; then
    print_success "✓ $file"
  else
    print_error "✗ $file 不存在"
    all_files_exist=false
  fi
done

if [ "$all_files_exist" = true ]; then
  print_success "所有必要文件已就绪"
else
  print_warning "部分文件缺失"
fi

# =====================================================
# 步骤8: 生成部署报告
# =====================================================

print_step "步骤8: 生成部署报告"

REPORT_FILE="deployment-report-$(date +%Y%m%d-%H%M%S).txt"

cat > "$REPORT_FILE" <<EOF
========================================
订阅权限系统部署报告
========================================

部署时间: $(date)
环境: ${NODE_ENV:-development}

已部署组件:
✅ CompactPermissionCard (简洁升级卡片)
✅ OptimizedPermissionGuard (优化权限守卫)
✅ PermissionCacheService (权限缓存)
✅ 权限验证API (/api/permissions/verify)
✅ 支付回调API (/api/webhooks/payment-callback)
✅ 定时任务 (Vercel Cron)
✅ 数据库表 (user_subscriptions, subscription_history, payment_records)

配置信息:
- Supabase URL: ${VITE_SUPABASE_URL}
- 权限缓存TTL: ${PERMISSION_CACHE_TTL:-300000}ms
- 权限缓存大小: ${PERMISSION_CACHE_MAX_SIZE:-200}

定时任务:
- 过期检查: 每天 02:00
- 自动续费: 每天 03:00

下一步:
1. 配置支付平台回调URL
2. 测试支付流程
3. 测试权限验证
4. 监控定时任务执行

文档链接:
- 快速入门: PERMISSION_SYSTEM_QUICK_START.md
- 使用示例: docs/PERMISSION_GUARD_USAGE_EXAMPLES.md
- 实施清单: PERMISSION_IMPLEMENTATION_CHECKLIST.md

========================================
EOF

print_success "部署报告已生成: $REPORT_FILE"

# =====================================================
# 完成
# =====================================================

print_step "部署完成!"

print_message "$GREEN" "
========================================
🎉 订阅权限系统部署成功!
========================================

下一步操作:

1. 📝 配置支付回调
   - 在支付平台配置回调URL
   - URL: https://your-domain.com/api/webhooks/payment-callback

2. 🧪 测试系统
   - 测试权限验证: /api/permissions/verify
   - 测试缓存清理: /api/permissions/clear-cache
   - 测试定时任务: /api/cron/check-expired-subscriptions

3. 📊 监控运行
   - 检查Vercel日志
   - 检查数据库记录
   - 检查缓存命中率

4. 📚 查看文档
   - 快速入门: PERMISSION_SYSTEM_QUICK_START.md
   - 使用示例: docs/PERMISSION_GUARD_USAGE_EXAMPLES.md

========================================
"

# 询问是否打开文档
print_message "$YELLOW" "是否打开快速入门文档? (y/n)"
read -r response

if [[ "$response" == "y" || "$response" == "Y" ]]; then
  if command -v code >/dev/null 2>&1; then
    code PERMISSION_SYSTEM_QUICK_START.md
  elif command -v open >/dev/null 2>&1; then
    open PERMISSION_SYSTEM_QUICK_START.md
  else
    cat PERMISSION_SYSTEM_QUICK_START.md
  fi
fi

exit 0
