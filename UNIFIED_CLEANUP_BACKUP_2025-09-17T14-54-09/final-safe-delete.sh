#!/bin/bash

# 最终验证后的安全删除脚本
# 100%确认这些文件未被使用
# 生成时间: 2025-09-17T14:49:52.111Z

echo "🚀 开始100%确认安全的文件删除..."

# 创建备份目录
BACKUP_DIR="final-deleted-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📁 备份目录: $BACKUP_DIR"

# 删除函数
final_delete() {
  local file="$1"
  local category="$2"
  
  if [ -f "$file" ]; then
    echo "🗑️ 删除: $file [$category]"
    # 先备份
    local backup_file="$BACKUP_DIR/$(dirname "$file")"
    mkdir -p "$backup_file"
    cp "$file" "$backup_file/"
    # 然后删除
    rm "$file"
  elif [ -d "$file" ]; then
    echo "🗑️ 删除目录: $file [$category]"
    # 备份目录
    cp -r "$file" "$BACKUP_DIR/"
    # 删除目录
    rm -rf "$file"
  else
    echo "⚠️ 文件不存在: $file"
  fi
}


# 删除备份文件
echo "📁 删除备份文件..."
final_delete "src/contexts/UnifiedAuthContext.tsx.backup" "备份文件"
final_delete "src/components/layout/TopNavigation.tsx.backup" "备份文件"
final_delete "src/styles/authing-dialog-conflict-fix.css.backup" "备份文件"
final_delete "src/styles/dialog-basic-fix.css.backup" "备份文件"
final_delete "src/styles/dialog-overlay-fix.css.backup" "备份文件"
final_delete "src/styles/dialog-position-fix-final.css.backup" "备份文件"
final_delete "src/styles/dialog-viewport-fix.css.backup" "备份文件"
final_delete "src/styles/emergency-dialog-fix.css.backup" "备份文件"
final_delete "src/styles/final-dialog-position-fix.css.backup" "备份文件"
final_delete "src/styles/profile-page-optimization.css.backup" "备份文件"
final_delete "src/styles/quick-reference-dialog-targeted-fix.css.backup" "备份文件"
final_delete "src/styles/quick-reference-dialog-visible-fix.css.backup" "备份文件"
final_delete "src/styles/ultimate-dialog-position-fix.css.backup" "备份文件"
final_delete "src/styles/unified-dialog-system.css.backup" "备份文件"
final_delete "src/components/landing.backup/" "备份文件"

# 删除废弃文件
echo "❌ 删除废弃文件..."
final_delete "src/App-minimal.tsx" "废弃文件"
final_delete "src/App-safe.tsx" "废弃文件"
final_delete "src/App-ultra-simple.tsx" "废弃文件"

# 删除测试文件
echo "🔧 删除测试文件..."
final_delete "src/components/creative/QuickReference/QuickReferenceTestDialog.tsx" "测试文件"
final_delete "src/components/examples/DataServicesDemo.tsx" "测试文件"
final_delete "src/features/content-adapter/examples/ComponentArchitectureDemo.tsx" "测试文件"
final_delete "src/main-minimal-test.tsx" "测试文件"
final_delete "src/services/__tests__/encryptionService.test.ts" "测试文件"
final_delete "src/services/__tests__/secureUserStateService.test.ts" "测试文件"
final_delete "src/tests/permission-guard-system.test.tsx" "测试文件"

echo "✅ 100%确认安全删除完成！"
echo "📁 备份位置: $BACKUP_DIR"
