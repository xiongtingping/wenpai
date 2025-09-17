#!/bin/bash

# 安全文件清理脚本
# 生成时间: 2025-09-17T14:42:56.914Z
# ⚠️ 请在执行前仔细检查每个文件

echo "🚀 开始安全文件清理..."

# 创建备份目录
BACKUP_DIR="deleted-files-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📁 备份目录: $BACKUP_DIR"

# 删除函数
safe_delete() {
  local file="$1"
  local reason="$2"
  
  if [ -f "$file" ]; then
    echo "🗑️ 删除: $file ($reason)"
    # 先备份
    local backup_file="$BACKUP_DIR/$(dirname "$file")"
    mkdir -p "$backup_file"
    cp "$file" "$backup_file/"
    # 然后删除
    rm "$file"
  else
    echo "⚠️ 文件不存在: $file"
  fi
}


# 删除备份文件
echo "📁 删除备份文件..."
safe_delete "src/components/landing.backup/CTASection.tsx" "备份文件"
safe_delete "src/components/landing.backup/FeaturesSection.tsx" "备份文件"
safe_delete "src/components/landing.backup/Footer.tsx" "备份文件"
safe_delete "src/components/landing.backup/Header.tsx" "备份文件"
safe_delete "src/components/landing.backup/HeroSection.tsx" "备份文件"
safe_delete "src/components/landing.backup/HowItWorks.tsx" "备份文件"
safe_delete "src/components/landing.backup/PricingSection.tsx" "备份文件"
safe_delete "src/components/landing.backup/ScrollAnimation.tsx" "备份文件"
safe_delete "src/components/landing.backup/TrustSection.tsx" "备份文件"
safe_delete "src/api/creemClientService.ts.backup.20250803-234623" "备份文件"
safe_delete "src/api/hotTopicsService_backup.ts" "备份文件"
safe_delete "src/automation/batchForward.ts.backup.20250803-234623" "备份文件"
safe_delete "src/components/landing.backup/CTASection.tsx" "备份文件"
safe_delete "src/components/landing.backup/FeaturesSection.tsx" "备份文件"
safe_delete "src/components/landing.backup/Footer.tsx" "备份文件"
safe_delete "src/components/landing.backup/Header.tsx" "备份文件"
safe_delete "src/components/landing.backup/HeroSection.tsx" "备份文件"
safe_delete "src/components/landing.backup/HowItWorks.tsx" "备份文件"
safe_delete "src/components/landing.backup/PricingSection.tsx" "备份文件"
safe_delete "src/components/landing.backup/ScrollAnimation.tsx" "备份文件"
safe_delete "src/components/landing.backup/TrustSection.tsx" "备份文件"
safe_delete "src/components/layout/TopNavigation.tsx.backup" "备份文件"
safe_delete "src/components/shared/UnifiedEmojiManager_backup.tsx" "备份文件"
safe_delete "src/components/shared/UnifiedEmojiManager_old.tsx" "备份文件"
safe_delete "src/contexts/UnifiedAuthContext.tsx.backup" "备份文件"
safe_delete "src/services/tokenUsageService.backup.ts" "备份文件"
safe_delete "src/styles/authing-dialog-conflict-fix.css.backup" "备份文件"
safe_delete "src/styles/dialog-basic-fix.css.backup" "备份文件"
safe_delete "src/styles/dialog-overlay-fix.css.backup" "备份文件"
safe_delete "src/styles/dialog-position-fix-final.css.backup" "备份文件"
safe_delete "src/styles/dialog-ultimate-override.css.backup" "备份文件"
safe_delete "src/styles/dialog-viewport-fix.css.backup" "备份文件"
safe_delete "src/styles/emergency-dialog-fix.css.backup" "备份文件"
safe_delete "src/styles/final-dialog-position-fix.css.backup" "备份文件"
safe_delete "src/styles/profile-page-optimization.css.backup" "备份文件"
safe_delete "src/styles/quick-reference-dialog-only.css.backup" "备份文件"
safe_delete "src/styles/quick-reference-dialog-targeted-fix.css.backup" "备份文件"
safe_delete "src/styles/quick-reference-dialog-visible-fix.css.backup" "备份文件"
safe_delete "src/styles/ultimate-dialog-position-fix.css.backup" "备份文件"
safe_delete "src/styles/unified-dialog-system.css.backup" "备份文件"

# 删除重复文件
echo "👥 删除重复文件..."
safe_delete "src/components/PerformanceMonitor.tsx" "重复文件，保留src/components/ErrorBoundary/PerformanceMonitor.tsx"
safe_delete "src/components/creative/md2card/PerformanceMonitor.tsx" "重复文件，保留src/components/ErrorBoundary/PerformanceMonitor.tsx"
safe_delete "src/features/titleGeneration/components/PerformanceMonitor.tsx" "重复文件，保留src/components/ErrorBoundary/PerformanceMonitor.tsx"
safe_delete "src/components/landing.backup/CTASection.tsx" "重复文件，保留src/components/landing/CTASection.tsx"
safe_delete "src/components/landing.backup/FeaturesSection.tsx" "重复文件，保留src/components/landing/FeaturesSection.tsx"
safe_delete "src/components/landing.backup/Footer.tsx" "重复文件，保留src/components/landing/Footer.tsx"
safe_delete "src/components/landing.backup/Header.tsx" "重复文件，保留src/components/landing/Header.tsx"
safe_delete "src/components/landing.backup/HeroSection.tsx" "重复文件，保留src/components/landing/HeroSection.tsx"
safe_delete "src/components/landing.backup/HowItWorks.tsx" "重复文件，保留src/components/landing/HowItWorks.tsx"
safe_delete "src/components/landing.backup/PricingSection.tsx" "重复文件，保留src/components/landing/PricingSection.tsx"
safe_delete "src/components/landing.backup/ScrollAnimation.tsx" "重复文件，保留src/components/landing/ScrollAnimation.tsx"
safe_delete "src/components/landing.backup/TrustSection.tsx" "重复文件，保留src/components/landing/TrustSection.tsx"
safe_delete "src/components/ui/ScrollToTop.tsx" "重复文件，保留src/components/layout/ScrollToTop.tsx"
safe_delete "src/components/ui/DataAwareComponents.tsx" "重复文件，保留src/components/data/DataAwareComponents.tsx"
safe_delete "src/components/creative/md2wechat/ExportControls.tsx" "重复文件，保留src/components/creative/md2card/ExportControls.tsx"

# 删除已废弃文件
echo "❌ 删除已废弃文件..."
safe_delete "src/components/shared/UnifiedEmojiManager_backup.tsx" "已废弃文件"
safe_delete "src/components/shared/UnifiedEmojiManager_old.tsx" "已废弃文件"
safe_delete "src/App-minimal.tsx" "已废弃文件"
safe_delete "src/App-safe.tsx" "已废弃文件"
safe_delete "src/App-ultra-simple.tsx" "已废弃文件"
safe_delete "src/services/tokenUsageService.backup.ts" "已废弃文件"
safe_delete "src/api/hotTopicsService_backup.ts" "已废弃文件"

echo "✅ 清理完成！"
echo "📁 备份位置: $BACKUP_DIR"
