#!/bin/bash

# 🚨 批量修复支付组件的语义矛盾问题
# 将所有 "w-full max-w-*" 替换为 "max-w-* mx-auto"

echo "🚀 开始批量修复支付组件的语义矛盾问题..."

# 支付组件文件列表
PAYMENT_FILES=(
  "src/components/payment/PaymentSuccessHandler.tsx"
  "src/components/payment/PaymentStatusRecovery.tsx"
  "src/components/payment/PaymentStatusMonitor.tsx"
  "src/components/payment/PaymentQRCode.tsx"
  "src/components/payment/EnhancedPaymentStatusMonitor.tsx"
  "src/components/payment/DirectLinkQRCode.tsx"
  "src/components/payment/AlipayQRCode.tsx"
)

# 定义替换规则
declare -A REPLACEMENTS=(
  ["w-full max-w-md mx-auto"]="max-w-md mx-auto"
  ["w-full max-w-sm mx-auto"]="max-w-sm mx-auto"
  ["w-full max-w-lg mx-auto"]="max-w-lg mx-auto"
  ["w-full max-w-xl mx-auto"]="max-w-xl mx-auto"
  ["w-full max-w-2xl mx-auto"]="max-w-2xl mx-auto"
  ["w-full max-w-md"]="max-w-md mx-auto"
  ["w-full max-w-sm"]="max-w-sm mx-auto"
  ["w-full max-w-lg"]="max-w-lg mx-auto"
  ["w-full max-w-xl"]="max-w-xl mx-auto"
  ["w-full max-w-2xl"]="max-w-2xl mx-auto"
)

# 修复函数
fix_file() {
  local file=$1
  echo "🔧 修复文件: $file"
  
  if [ ! -f "$file" ]; then
    echo "   ❌ 文件不存在"
    return
  fi
  
  local changes=0
  
  # 应用所有替换规则
  for old_pattern in "${!REPLACEMENTS[@]}"; do
    new_pattern="${REPLACEMENTS[$old_pattern]}"
    
    if grep -q "$old_pattern" "$file"; then
      echo "   🎯 发现模式: $old_pattern"
      echo "   ✅ 替换为: $new_pattern"
      sed -i '' "s/$old_pattern/$new_pattern/g" "$file"
      changes=$((changes + 1))
    fi
  done
  
  if [ $changes -eq 0 ]; then
    echo "   ✅ 无需修复"
  else
    echo "   🎊 完成 $changes 项修复"
  fi
}

# 执行修复
total_files=0
fixed_files=0

for file in "${PAYMENT_FILES[@]}"; do
  if [ -f "$file" ]; then
    total_files=$((total_files + 1))
    fix_file "$file"
    fixed_files=$((fixed_files + 1))
  else
    echo "⚠️  文件不存在: $file"
  fi
done

echo ""
echo "🏆 批量修复完成！"
echo "=========================================="
echo "📁 检查的文件: $total_files"
echo "🔧 修复的文件: $fixed_files"
echo "=========================================="
echo ""
echo "💡 建议运行以下命令验证修复效果："
echo "   node scripts/component-design-linter.js"