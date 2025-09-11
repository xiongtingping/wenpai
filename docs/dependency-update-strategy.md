# 依赖更新策略 - Dialog定位保护

## 🎯 目标

确保UI组件库（Radix UI、Tailwind CSS等）更新时，Dialog定位功能不会出现回归问题。

## 📋 更新前检查清单

### 1. 关键依赖识别
在更新以下依赖前必须进行Dialog定位测试：

#### 🔴 高风险依赖
- `@radix-ui/react-dialog` - Dialog组件核心
- `@radix-ui/react-portal` - Portal渲染机制
- `tailwindcss` - CSS框架
- `class-variance-authority` - 组件变体系统

#### 🟡 中风险依赖
- `@radix-ui/react-primitive` - 基础组件
- `tailwindcss-animate` - 动画系统
- `framer-motion` - 动画库（如使用）
- `react` / `react-dom` - React核心

#### 🟢 低风险依赖
- `typescript` - 类型系统
- `vite` - 构建工具
- `eslint` - 代码检查

### 2. 更新前测试流程

#### Step 1: 基线测试
```bash
# 运行Dialog定位测试套件
npm run test:dialog-positioning

# 运行视觉回归测试
npm run test:visual-regression

# 手动测试关键场景
npm run dev
# 访问 http://localhost:5175/dialog-test
```

#### Step 2: 依赖更新
```bash
# 创建更新分支
git checkout -b update/dependency-name

# 更新单个依赖
npm update package-name

# 或批量更新（谨慎使用）
npm update
```

#### Step 3: 回归测试
```bash
# 重新运行所有Dialog相关测试
npm run test:dialog-positioning
npm run test:visual-regression
npm run test:e2e:dialog

# 检查构建是否成功
npm run build

# 检查类型是否正确
npm run type-check
```

#### Step 4: 手动验证
1. 启动开发服务器：`npm run dev`
2. 访问测试页面：`http://localhost:5175/dialog-test`
3. 测试所有Dialog变体：
   - 快速引用Dialog
   - 确认对话框
   - 设置面板
   - 表单弹窗
4. 验证响应式行为
5. 测试不同主题下的表现

### 3. 问题检测与修复

#### 常见回归问题
1. **定位偏移**
   - 症状：Dialog不在屏幕中央
   - 检查：CSS选择器是否仍然匹配
   - 修复：更新CSS选择器或增强JavaScript修复器

2. **样式冲突**
   - 症状：Dialog样式异常
   - 检查：新版本是否引入冲突的CSS类
   - 修复：调整CSS优先级或更新样式覆盖

3. **动画异常**
   - 症状：Dialog打开/关闭动画不正常
   - 检查：动画类名是否变更
   - 修复：更新动画配置或CSS类

4. **类型错误**
   - 症状：TypeScript编译失败
   - 检查：组件Props类型是否变更
   - 修复：更新类型定义或组件实现

#### 修复优先级
1. **Critical**: Dialog无法显示或完全错位
2. **High**: Dialog显示但位置不正确
3. **Medium**: 动画或样式异常
4. **Low**: 类型警告或性能问题

## 🔧 自动化检查脚本

### 依赖更新检查脚本
```bash
#!/bin/bash
# scripts/check-dependency-update.sh

echo "🔍 开始依赖更新检查..."

# 1. 运行基础测试
echo "📋 运行基础测试..."
npm run test:dialog-positioning
if [ $? -ne 0 ]; then
  echo "❌ Dialog定位测试失败"
  exit 1
fi

# 2. 检查构建
echo "🏗️ 检查构建..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ 构建失败"
  exit 1
fi

# 3. 类型检查
echo "🔍 类型检查..."
npm run type-check
if [ $? -ne 0 ]; then
  echo "❌ 类型检查失败"
  exit 1
fi

# 4. 启动开发服务器进行手动测试
echo "🚀 启动开发服务器..."
echo "请访问 http://localhost:5175/dialog-test 进行手动验证"
npm run dev
```

### 视觉回归检测
```javascript
// scripts/visual-regression-check.js
const puppeteer = require('puppeteer');
const pixelmatch = require('pixelmatch');
const PNG = require('pngjs').PNG;
const fs = require('fs');

async function checkDialogVisualRegression() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // 设置视口大小
  await page.setViewport({ width: 1440, height: 900 });
  
  // 访问测试页面
  await page.goto('http://localhost:5175/dialog-test');
  
  // 打开Dialog
  await page.click('[data-testid="open-dialog"]');
  await page.waitForSelector('[role="dialog"]');
  
  // 截图
  const screenshot = await page.screenshot();
  
  // 与基线图片对比
  const baseline = fs.readFileSync('tests/visual/dialog-baseline.png');
  const diff = pixelmatch(
    PNG.sync.read(baseline).data,
    PNG.sync.read(screenshot).data,
    null,
    1440,
    900,
    { threshold: 0.1 }
  );
  
  await browser.close();
  
  if (diff > 100) { // 允许100像素差异
    throw new Error(`视觉回归检测失败: ${diff} 像素差异`);
  }
  
  console.log('✅ 视觉回归检测通过');
}
```

## 📊 监控指标

### 关键指标
1. **定位准确性**: Dialog中心点与视口中心点的偏差
2. **渲染性能**: Dialog打开时间
3. **样式一致性**: CSS属性是否符合预期
4. **无障碍性**: ARIA属性是否正确

### 监控脚本
```javascript
// 在Dialog组件中添加监控
useEffect(() => {
  if (open && dialogRef.current) {
    const rect = dialogRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const expectedCenterX = window.innerWidth / 2;
    const expectedCenterY = window.innerHeight / 2;
    
    const deviation = {
      x: Math.abs(centerX - expectedCenterX),
      y: Math.abs(centerY - expectedCenterY)
    };
    
    // 记录监控数据
    if (deviation.x > 5 || deviation.y > 5) {
      console.warn('⚠️ Dialog定位偏差:', deviation);
      // 发送监控数据到分析系统
    }
  }
}, [open]);
```

## 🚨 应急响应

### 发现问题时的处理流程
1. **立即回滚**: 如果问题严重，立即回滚到上一个稳定版本
2. **问题隔离**: 确定是哪个依赖更新导致的问题
3. **快速修复**: 应用临时修复方案
4. **根本修复**: 分析根本原因并实施永久修复
5. **测试验证**: 确保修复有效且不引入新问题
6. **文档更新**: 更新相关文档和检查清单

### 回滚命令
```bash
# 回滚到上一个commit
git reset --hard HEAD~1

# 回滚特定依赖
npm install package-name@previous-version

# 重新构建和测试
npm run build
npm run test:dialog-positioning
```

## 📝 更新记录模板

```markdown
## 依赖更新记录 - [日期]

### 更新的依赖
- package-name: v1.0.0 → v1.1.0

### 测试结果
- [ ] Dialog定位测试通过
- [ ] 视觉回归测试通过
- [ ] 构建成功
- [ ] 类型检查通过
- [ ] 手动测试通过

### 发现的问题
- 无 / [描述问题]

### 修复措施
- 无 / [描述修复方案]

### 影响评估
- 无影响 / [描述影响范围]
```
