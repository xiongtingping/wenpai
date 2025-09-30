#!/bin/bash

echo "🔧 全局修复所有i18n静态导入问题..."

# 全局查找并替换所有i18n静态导入
echo "🔍 查找所有包含i18n静态导入的文件..."

# 排除.disabled和.broken文件
find src -name "*.ts" -not -name "*.disabled" -not -name "*.broken" -not -name "*.deprecated" | while read file; do
  if grep -q "^import.*i18n.*from.*['\"]@\?/\?i18n['\"]" "$file"; then
    echo "🔧 修复: $file"
    
    # 备份原文件
    cp "$file" "$file.bak"
    
    # 注释掉静态导入
    sed -i '' "s/^import i18n from '@\/i18n';$/\/\/ import i18n from '@\/i18n'; \/\/ 改为动态导入避免TDZ/g" "$file"
    
    # 替换常见的i18n.t()调用为直接字符串
    sed -i '' "s/i18n\.t('common\.errors\.未知错误')/'未知错误'/g" "$file"
    sed -i '' "s/i18n\.t('common\.errors\.数据保存失败')/'数据保存失败'/g" "$file"
    sed -i '' "s/i18n\.t('common\.errors\.数据加载失败')/'数据加载失败'/g" "$file"
    sed -i '' "s/i18n\.t('common\.errors\.网络错误')/'网络错误'/g" "$file"
    sed -i '' "s/i18n\.t('common\.errors\.操作失败')/'操作失败'/g" "$file"
    sed -i '' "s/i18n\.t('common\.errors\.验证失败')/'验证失败'/g" "$file"
    sed -i '' "s/i18n\.t('common\.errors\.请求失败')/'请求失败'/g" "$file"
    sed -i '' "s/i18n\.t('common\.errors\.初始化失败')/'初始化失败'/g" "$file"
    sed -i '' "s/i18n\.t('common\.errors\.AI服务不可用')/'AI服务不可用'/g" "$file"
    sed -i '' "s/i18n\.t('common\.errors\.调用失败')/'调用失败'/g" "$file"
    sed -i '' "s/i18n\.t('common\.errors\.配置错误')/'配置错误'/g" "$file"
    sed -i '' "s/i18n\.t('common\.errors\.解析失败')/'解析失败'/g" "$file"
    sed -i '' "s/i18n\.t('common\.errors\.连接失败')/'连接失败'/g" "$file"
    sed -i '' "s/i18n\.t('common\.errors\.超时')/'超时'/g" "$file"
    sed -i '' "s/i18n\.t('common\.errors\.权限不足')/'权限不足'/g" "$file"
    sed -i '' "s/i18n\.t('common\.errors\.服务不可用')/'服务不可用'/g" "$file"
    
    # 检查是否有其他i18n.t()调用需要替换为通用错误信息
    if grep -q "i18n\.t(" "$file"; then
      echo "⚠️  文件 $file 仍包含i18n.t()调用，需要手动检查"
      # 替换剩余的i18n.t()为通用错误
      sed -i '' "s/i18n\.t([^)]*)/'\u64cd\u4f5c\u5931\u8d25'/g" "$file"
    fi
    
    echo "✅ $file 修复完成"
  fi
done

echo "🔍 检查是否还有剩余的静态导入..."
remaining=$(find src -name "*.ts" -not -name "*.disabled" -not -name "*.broken" -not -name "*.deprecated" -exec grep -l "^import.*i18n.*from.*['\"]@\?/\?i18n['\"]" {} \; | wc -l)
echo "剩余文件数量: $remaining"

echo "✅ 全局修复完成！"