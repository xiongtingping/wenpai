#!/bin/bash

echo "🔧 修复最后一批i18n静态导入..."

# 最后一批需要修复的文件
files=(
  "src/ai/providers/openai.ts"
  "src/ai/providers/deepseek.ts"
  "src/api/devApiProxy.ts"
  "src/ai/prompts/titleGeneration.ts"
  "src/hooks/useSubscriptionStatus.ts"
  "src/services/dataPreloadService.ts"
  "src/features/content-adapter/services/contentAdapterService.ts"
  "src/services/enhancedInviteService.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "🔧 修复: $file"
    
    # 注释掉静态导入
    sed -i.bak "s/import i18n from '@\/i18n';/\/\/ import i18n from '@\/i18n'; \/\/ 改为动态导入避免TDZ/g" "$file"
    
    # 替换i18n.t调用为直接字符串
    sed -i.bak "s/i18n\.t('common\.errors\.未知错误')/'未知错误'/g" "$file"
    sed -i.bak "s/i18n\.t('common\.errors\.数据保存失败')/'数据保存失败'/g" "$file"
    sed -i.bak "s/i18n\.t('common\.errors\.数据加载失败')/'数据加载失败'/g" "$file"
    sed -i.bak "s/i18n\.t('common\.errors\.网络错误')/'网络错误'/g" "$file"
    sed -i.bak "s/i18n\.t('common\.errors\.操作失败')/'操作失败'/g" "$file"
    sed -i.bak "s/i18n\.t('common\.errors\.验证失败')/'验证失败'/g" "$file"
    sed -i.bak "s/i18n\.t('common\.errors\.请求失败')/'请求失败'/g" "$file"
    sed -i.bak "s/i18n\.t('common\.errors\.初始化失败')/'初始化失败'/g" "$file"
    sed -i.bak "s/i18n\.t('common\.errors\.AI服务不可用')/'AI服务不可用'/g" "$file"
    sed -i.bak "s/i18n\.t('common\.errors\.调用失败')/'调用失败'/g" "$file"
    
    rm -f "$file.bak"
    echo "✅ $file 完成"
  else
    echo "⚠️ 文件不存在: $file"
  fi
done

echo "✅ 最后一批修复完成！"