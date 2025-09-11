# Z-Index层级管理系统迁移计划

## 🎯 目标
彻底解决系统中所有弹窗遮挡问题，统一z-index层级管理。

## ✅ 已完成修复
- [x] **ContentFormSelector组件** - 改为外显式布局，避免下拉菜单遮挡
- [x] **ContentAdapterPage历史记录弹窗** - 应用统一z-index管理器
- [x] **设计令牌系统** - 定义标准z-index层级
- [x] **ZIndexManager工具类** - 统一管理z-index分配

## 🔄 需要迁移的组件

### 高优先级（用户频繁使用）
1. **BatchForwardModal** (`/src/components/BatchForwardModal.tsx`)
   - 当前问题：使用 `z-index: 2147483647` 等极大值
   - 修复方案：使用 `ZIndexLayers.CRITICAL` 层级

2. **QuickReferenceSelector** (`/src/components/creative/QuickReferenceSelector.tsx`)
   - 当前问题：使用 `z-index: 2147483647` 和 `2147483648`
   - 修复方案：使用 `ZIndexLayers.DIALOG_CONTENT` 层级

3. **认证相关弹窗**
   - `EnhancedAuthModal.tsx`
   - `CustomAuthModal.tsx`
   - 当前问题：可能被第三方库遮挡
   - 修复方案：使用 `ZIndexLayers.AUTHING` 层级

### 中优先级（系统功能）
4. **UI组件弹窗**
   - `ThemeUpgradeDialog.tsx`
   - `PermissionUpgradeDialog.tsx`
   - `SubscriptionUpgradeDialog.tsx`
   - `TokenLimitDialog.tsx`
   - 修复方案：使用 `ZIndexLayers.MODAL` 层级

5. **创意工具弹窗**
   - `PDFChatDialog.tsx`
   - `AnalysisResultDialog.tsx`
   - `StyleSelector.tsx`
   - `SchemeSelector.tsx`
   - 修复方案：使用 `ZIndexLayers.DIALOG_CONTENT` 层级

### 低优先级（功能性组件）
6. **其他Dialog组件**
   - `DataSyncConflictResolver.tsx`
   - `NotificationCenter.tsx`
   - `HashtagManager.tsx`
   - 修复方案：根据用途选择合适层级

## 🛠️ 具体修复步骤

### 1. 标准修复模式
```typescript
// 1. 导入z-index管理器
import { zIndexManager, ZIndexLayers } from '@/utils/zIndexManager';

// 2. 应用标准样式
<DialogContent style={zIndexManager.createModalStyles('DIALOG_CONTENT')}>

// 3. 或者使用内联z-index
<div style={{ zIndex: zIndexManager.getZIndexValue('MODAL') }}>
```

### 2. 特殊情况处理
```typescript
// 对于需要覆盖第三方库的弹窗
<DialogContent style={zIndexManager.createModalStyles('AUTHING')}>

// 对于关键系统弹窗
<DialogContent style={zIndexManager.createModalStyles('CRITICAL')}>

// 对于紧急情况
<DialogContent style={zIndexManager.createModalStyles('EMERGENCY')}>
```

### 3. CSS文件修复
```css
/* 旧代码 */
.some-modal {
  z-index: 999999 !important;
}

/* 新代码 */
.some-modal {
  z-index: var(--z-modal) !important;
}
```

## 📋 迁移检查清单

### 每个组件修复后需要验证：
- [ ] z-index使用统一的设计令牌或工具类
- [ ] 弹窗不再被其他元素遮挡
- [ ] 弹窗在正确的层级显示
- [ ] 多个弹窗同时显示时层级正确
- [ ] 构建成功且无TypeScript错误

### 系统整体验证：
- [ ] 所有弹窗组件迁移完成
- [ ] 删除所有硬编码的z-index值
- [ ] 添加开发阶段的z-index冲突检测
- [ ] 文档更新和开发规范制定

## 🚨 重要注意事项

1. **禁止使用的z-index值**：
   - `999999`
   - `2147483647` 
   - 其他随意的大数值

2. **必须使用的方式**：
   - 设计令牌：`var(--z-modal)`
   - 工具类：`zIndexManager.createModalStyles()`
   - 枚举值：`ZIndexLayers.MODAL`

3. **特殊情况处理**：
   - 第三方库干扰：使用 `ZIndexLayers.AUTHING`
   - 紧急覆盖：使用 `ZIndexLayers.EMERGENCY`
   - 关键系统弹窗：使用 `ZIndexLayers.CRITICAL`

## 📈 预期效果

- ✅ 彻底解决所有弹窗遮挡问题
- ✅ 统一的z-index层级管理
- ✅ 可维护的代码架构
- ✅ 防止未来的z-index冲突
- ✅ 开发阶段的自动检测机制

## 🎯 下一步行动

建议按优先级顺序逐个修复组件，每修复一个就测试验证，确保不引入新问题。