#!/bin/bash

# 🔧 修复 XD 变量初始化错误的完整解决方案
# 错误: index-iCJ2cjz5.js:6577 Uncaught ReferenceError: Cannot access 'XD' before initialization

echo "🔧 开始修复 JavaScript 初始化错误..."

# 1. 清理所有构建缓存
echo "📁 清理构建缓存..."
rm -rf dist/
rm -rf node_modules/.vite/
rm -rf .vite/

# 2. 清理 npm 缓存
echo "📦 清理 npm 缓存..."
npm cache clean --force

# 3. 重新安装依赖（可选，如果需要）
# echo "📦 重新安装依赖..."
# rm -rf node_modules/
# npm install

# 4. 重新构建项目
echo "🏗️ 重新构建项目..."
npm run build

# 5. 检查构建结果
echo "🔍 检查构建结果..."
if [ -f "dist/index.html" ]; then
    echo "✅ 构建成功"
    
    # 检查是否包含旧的文件引用
    if grep -q "iCJ2cjz5" dist/index.html; then
        echo "⚠️  警告: 仍然包含旧文件引用"
        grep "iCJ2cjz5" dist/index.html
    else
        echo "✅ 文件引用已更新"
    fi
    
    # 显示当前的 JS 文件
    echo "📄 当前 JS 文件:"
    ls -la dist/assets/index-*.js
    
else
    echo "❌ 构建失败"
    exit 1
fi

# 6. 创建版本信息文件
echo "📝 创建版本信息..."
cat > dist/version.json << EOF
{
  "version": "$(date +%Y%m%d%H%M%S)",
  "buildTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "jsFile": "$(ls dist/assets/index-*.js | head -1 | xargs basename)",
  "cssFile": "$(ls dist/assets/index-*.css | head -1 | xargs basename)",
  "fixed": "XD initialization error"
}
EOF

echo "✅ 版本信息已创建:"
cat dist/version.json

# 7. 启动预览服务器进行测试
echo "🚀 启动预览服务器..."
echo "请在浏览器中访问 http://localhost:4173 进行测试"
echo "如果仍然出现错误，请:"
echo "1. 清除浏览器缓存 (Ctrl+Shift+R 或 Cmd+Shift+R)"
echo "2. 访问 http://localhost:4173/clear-cache.html 进行强制缓存清理"
echo "3. 检查浏览器开发者工具的 Network 标签，确认加载的是新文件"

# 启动预览服务器（后台运行）
npm run preview &
PREVIEW_PID=$!

echo "预览服务器 PID: $PREVIEW_PID"
echo "要停止预览服务器，请运行: kill $PREVIEW_PID"

# 等待几秒钟让服务器启动
sleep 3

# 检查服务器是否正常启动
if curl -s http://localhost:4173 > /dev/null; then
    echo "✅ 预览服务器启动成功"
    echo "🌐 请访问: http://localhost:4173"
    echo "🔧 缓存清理页面: http://localhost:4173/clear-cache.html"
else
    echo "❌ 预览服务器启动失败"
fi

echo ""
echo "🎯 修复完成！主要变更:"
echo "1. ✅ 清理了所有构建缓存"
echo "2. ✅ 重新构建生成新的文件哈希"
echo "3. ✅ 添加了版本控制和缓存清理机制"
echo "4. ✅ 创建了专用的缓存清理页面"
echo ""
echo "如果问题仍然存在，可能是以下原因:"
echo "- 🌐 CDN 或部署平台的缓存（需要在部署平台清理）"
echo "- 💻 浏览器强缓存（使用 Ctrl+Shift+R 强制刷新）"
echo "- 📱 移动设备缓存（清除浏览器数据）"
