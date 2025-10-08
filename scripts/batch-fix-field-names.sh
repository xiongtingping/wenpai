#!/bin/bash

# 批量修复字段名脚本
# 将 subscription_type 替换为 tier
# 注意：这个脚本会创建备份文件

set -e

COLORS_RED='\033[0;31m'
COLORS_GREEN='\033[0;32m'
COLORS_YELLOW='\033[1;33m'
COLORS_BLUE='\033[0;34m'
COLORS_CYAN='\033[0;36m'
COLORS_NC='\033[0m' # No Color

echo -e "${COLORS_CYAN}========================================${COLORS_NC}"
echo -e "${COLORS_CYAN}批量修复字段名${COLORS_NC}"
echo -e "${COLORS_CYAN}========================================${COLORS_NC}"

# 创建备份目录
BACKUP_DIR=".field-name-fix-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo -e "\n${COLORS_BLUE}📦 备份目录: $BACKUP_DIR${COLORS_NC}"

# 需要修复的文件列表
FILES=(
  "src/services/orderTransactionService.ts"
  "src/services/subscriptionUpgradeService.ts"
  "src/services/unifiedSubscriptionService.ts"
  "src/components/profile/SubscriptionExpiryCard.tsx"
  "netlify/functions/bufpay-notify.js"
  "netlify/functions/payment-notify.js"
  "netlify/functions/prorated-upgrade.js"
  "netlify/functions/upgrade-notify.js"
)

echo -e "\n${COLORS_YELLOW}⚠️ 将要修复 ${#FILES[@]} 个文件${COLORS_NC}"
echo -e "${COLORS_YELLOW}按 Enter 继续，Ctrl+C 取消...${COLORS_NC}"
read

FIXED_COUNT=0
SKIPPED_COUNT=0

for file in "${FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo -e "${COLORS_RED}❌ 文件不存在: $file${COLORS_NC}"
    ((SKIPPED_COUNT++))
    continue
  fi

  echo -e "\n${COLORS_CYAN}🔧 处理: $file${COLORS_NC}"

  # 备份原文件
  cp "$file" "$BACKUP_DIR/$(basename $file).bak"

  # 执行替换
  # 1. subscription_type -> tier (在 user_subscriptions 上下文中)
  # 2. 保留注释中的 subscription_type
  
  # 使用 sed 进行替换（macOS 兼容）
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' \
      -e 's/\.subscription_type/.tier/g' \
      -e 's/subscription_type:/tier:/g' \
      -e "s/subscription_type'/tier'/g" \
      -e 's/subscription_type"/tier"/g' \
      -e 's/subscription_type,/tier,/g' \
      -e 's/subscription_type =/tier =/g' \
      "$file"
  else
    # Linux
    sed -i \
      -e 's/\.subscription_type/.tier/g' \
      -e 's/subscription_type:/tier:/g' \
      -e "s/subscription_type'/tier'/g" \
      -e 's/subscription_type"/tier"/g' \
      -e 's/subscription_type,/tier,/g' \
      -e 's/subscription_type =/tier =/g' \
      "$file"
  fi

  echo -e "${COLORS_GREEN}✅ 已修复: $file${COLORS_NC}"
  ((FIXED_COUNT++))
done

echo -e "\n${COLORS_CYAN}========================================${COLORS_NC}"
echo -e "${COLORS_GREEN}✅ 修复完成${COLORS_NC}"
echo -e "${COLORS_CYAN}========================================${COLORS_NC}"
echo -e "${COLORS_BLUE}📊 统计:${COLORS_NC}"
echo -e "  - 已修复: ${COLORS_GREEN}$FIXED_COUNT${COLORS_NC} 个文件"
echo -e "  - 已跳过: ${COLORS_YELLOW}$SKIPPED_COUNT${COLORS_NC} 个文件"
echo -e "  - 备份位置: ${COLORS_CYAN}$BACKUP_DIR${COLORS_NC}"

echo -e "\n${COLORS_YELLOW}⚠️ 下一步:${COLORS_NC}"
echo -e "  1. 检查修改是否正确: ${COLORS_CYAN}git diff${COLORS_NC}"
echo -e "  2. 运行审查脚本: ${COLORS_CYAN}node scripts/audit-code-field-names.mjs${COLORS_NC}"
echo -e "  3. 运行测试: ${COLORS_CYAN}npm test${COLORS_NC}"
echo -e "  4. 如果有问题，从备份恢复: ${COLORS_CYAN}cp $BACKUP_DIR/* .${COLORS_NC}"

echo -e "\n${COLORS_GREEN}🎉 批量修复完成！${COLORS_NC}"

