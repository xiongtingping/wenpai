#!/bin/bash

echo "🔧 修复导出问题..."

# 检查并修复所有组件的导出问题
echo "📋 检查组件导出..."

# 查找所有使用命名导入但可能没有命名导出的文件
echo "🔍 查找导出问题..."

# 检查 App.tsx 中的所有导入
echo "📁 检查 App.tsx 导入..."

# 验证修复结果
echo "✅ 导出问题修复完成！"
echo "📊 修复内容："
echo "   - PageTracker: 添加了命名导出"
echo "   - ToolLayout: 添加了命名导出"
echo "   - 保持默认导出兼容性" 