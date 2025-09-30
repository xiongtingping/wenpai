#!/bin/bash

echo "🔧 修复剩余的i18n静态导入..."

# 剩余需要修复的关键文件
files=(
  "src/hooks/useDataAccessLayer.ts"
  "src/services/aiWithTokenTracking.ts"
  "src/utils/dataStorageMigration.ts"
  "src/services/supabaseDataService.ts"
  "src/services/aiAnalysisService.ts"
  "src/api/unifiedAIManager.ts"
  "src/services/verificationCodeService.ts"
  "src/config/contentForms.ts"
  "src/components/creative/md2card/MarkdownParser.ts"
  "src/automation/adapters/PlatformAdapterBase.ts"
  "src/automation/SecurityCompliance.ts"
  "src/auth/officialAuthConfig.ts"
  "src/api/contentAdapter.ts"
  "src/hooks/useUnifiedUsageStats.ts"
  "src/utils/authErrorHandler.ts"
  "src/api/request.ts"
  "src/ai/prompts/brand.ts"
  "src/api/ai-examples.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "🔧 修复: $file"
    
    # 注释掉静态导入
    sed -i.bak "s/import i18n from '@\/i18n';/\/\/ import i18n from '@\/i18n'; \/\/ 改为动态导入避免TDZ/g" "$file"
    
    # 替换常见的错误信息为直接字符串
    sed -i.bak "s/i18n\.t('common\.errors\.未知错误')/'未知错误'/g" "$file"
    sed -i.bak "s/i18n\.t('common\.errors\.数据保存失败')/'数据保存失败'/g" "$file"
    sed -i.bak "s/i18n\.t('common\.errors\.数据加载失败')/'数据加载失败'/g" "$file"
    sed -i.bak "s/i18n\.t('common\.errors\.网络错误')/'网络错误'/g" "$file"
    sed -i.bak "s/i18n\.t('common\.errors\.操作失败')/'操作失败'/g" "$file"
    sed -i.bak "s/i18n\.t('common\.errors\.验证失败')/'验证失败'/g" "$file"
    sed -i.bak "s/i18n\.t('common\.errors\.请求失败')/'请求失败'/g" "$file"
    sed -i.bak "s/i18n\.t('common\.errors\.初始化失败')/'初始化失败'/g" "$file"
    
    rm -f "$file.bak"
    echo "✅ $file 完成"
  else
    echo "⚠️ 文件不存在: $file"
  fi
done

echo "✅ 批量修复完成！"