#!/bin/bash

# 国际化key批量替换脚本
# 将所有中文key替换为英文驼峰命名

cd "$(dirname "$0")/.."

echo "开始批量替换国际化key..."

# 定义替换规则
declare -A replacements=(
  ["common.errors.等待超时"]="common.errors.waitTimeout"
  ["common.errors.加载失败"]="common.errors.loadFailed"
  ["common.errors.保存失败"]="common.errors.saveFailed"
  ["common.errors.删除失败"]="common.errors.deleteFailed"
  ["common.errors.合并失败"]="common.errors.mergeFailed"
  ["common.errors.未配置的数据类型"]="common.errors.unconfiguredDataType"
  ["common.errors.数据库保存失败"]="common.errors.databaseSaveFailed"
  ["common.errors.数据库加载失败"]="common.errors.databaseLoadFailed"
  ["common.errors.数据库删除失败"]="common.errors.databaseDeleteFailed"
  ["common.errors.无法合并非对象类型的数据"]="common.errors.cannotMergeNonObjects"
)

# 遍历所有TypeScript文件
for old_key in "${!replacements[@]}"; do
  new_key="${replacements[$old_key]}"

  echo "替换: $old_key -> $new_key"

  # 使用sed进行替换
  find src/services -name "*.ts" -type f -exec sed -i '' "s|$old_key|$new_key|g" {} \;
done

echo "✅ 批量替换完成"
echo "请检查以下文件的改动:"
git diff --name-only src/services/
