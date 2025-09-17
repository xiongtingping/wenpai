# 🎯 项目命名规范统一方案

## 📋 当前问题分析

### CSS文件命名混乱
- ❌ `enhanced-history-dialog-fix.css`
- ❌ `quick-reference-dialog-emergency-fix.css`
- ❌ `dialog-basic-fix.css`
- ❌ `final-dialog-position-fix.css`
- ❌ `ultimate-dialog-position-fix.css`

### 重复和冗余文件
- 存在多个功能重复的Dialog修复文件
- 命名前缀不统一（fix-, emergency-, final-, ultimate-）
- 缺乏清晰的文件用途标识

## 🎯 统一命名规范

### CSS命名规范

#### 1. 文件命名模式
```
[prefix]-[component]-[purpose].css
```

#### 2. 前缀规范
- `fix-` : 修复类CSS文件
- `unified-` : 统一系统类文件
- `design-` : 设计系统文件
- `component-` : 组件样式文件

#### 3. 组件命名
- 使用kebab-case
- 保持简洁明确
- 避免冗余词汇

#### 4. 用途标识
- `positioning` : 定位修复
- `styling` : 样式修复
- `layout` : 布局修复
- `interaction` : 交互修复

### React组件命名规范

#### 1. 组件命名（已规范）
- ✅ `QuickReferenceDialog`
- ✅ `EnhancedHistoryDialog`
- ✅ PascalCase命名法

#### 2. Hook命名
- `useDialogPositioning`
- `useErrorHandler`
- `useDialogState`

#### 3. 类型定义
- `DialogProps`
- `HistoryItem`
- `DialogState`

## 🔧 具体重命名方案

### Dialog相关文件统一

#### CSS文件重命名
1. `enhanced-history-dialog-fix.css` → `fix-history-dialog-positioning.css`
2. `quick-reference-dialog-emergency-fix.css` → `fix-quick-reference-dialog-positioning.css`
3. `unified-dialog-positioning.css` → `unified-dialog-positioning.css` (保持)
4. 删除重复文件：
   - `dialog-basic-fix.css`
   - `final-dialog-position-fix.css`
   - `ultimate-dialog-position-fix.css`
   - `emergency-dialog-fix.css`

#### 组件文件（保持现有）
- ✅ `QuickReferenceDialog.tsx`
- ✅ `EnhancedHistoryDialog.tsx`

### BEM方法论应用

#### CSS类名规范
```css
/* 块 */
.dialog-container { }

/* 块__元素 */
.dialog-container__content { }
.dialog-container__header { }
.dialog-container__footer { }

/* 块__元素--修饰符 */
.dialog-container__content--centered { }
.dialog-container__header--fixed { }
```

#### Dialog特定类名
```css
/* 快速引用Dialog */
.quick-reference-dialog { }
.quick-reference-dialog__content { }
.quick-reference-dialog__content--positioned { }

/* 历史记录Dialog */
.history-dialog { }
.history-dialog__content { }
.history-dialog__content--positioned { }
```

## 🎯 CSS变量和设计令牌

### 设计令牌命名
```css
:root {
  /* Dialog定位 */
  --dialog-position-top: 50vh;
  --dialog-position-left: 50vw;
  --dialog-transform: translate(-50%, -50%);
  --dialog-z-index: 1055;
  
  /* Dialog尺寸 */
  --dialog-max-width: min(95vw, 1024px);
  --dialog-max-height: 85vh;
  
  /* Dialog动画 */
  --dialog-transition-duration: 200ms;
  --dialog-transition-easing: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### 避免硬编码值
```css
/* ❌ 错误 */
.dialog {
  top: 50vh;
  left: 50vw;
  z-index: 1055;
}

/* ✅ 正确 */
.dialog {
  top: var(--dialog-position-top);
  left: var(--dialog-position-left);
  z-index: var(--dialog-z-index);
}
```

## 📁 文件组织结构

### 建议的目录结构
```
src/
├── components/
│   └── dialogs/
│       ├── QuickReferenceDialog/
│       │   ├── QuickReferenceDialog.tsx
│       │   ├── QuickReferenceDialog.module.css
│       │   └── index.ts
│       └── HistoryDialog/
│           ├── EnhancedHistoryDialog.tsx
│           ├── EnhancedHistoryDialog.module.css
│           └── index.ts
├── styles/
│   ├── design-tokens.css
│   ├── unified-dialog-positioning.css
│   ├── fix-dialog-positioning.css
│   └── component-dialog-styles.css
└── hooks/
    ├── useDialogPositioning.ts
    └── useDialogState.ts
```

## 🚀 实施计划

### 阶段1：清理重复文件
1. 识别并删除重复的Dialog修复文件
2. 保留核心功能文件
3. 更新import引用

### 阶段2：重命名核心文件
1. 重命名CSS文件遵循新规范
2. 更新所有引用路径
3. 验证功能完整性

### 阶段3：应用BEM方法论
1. 更新CSS类名使用BEM规范
2. 更新组件中的className引用
3. 确保样式正确应用

### 阶段4：引入设计令牌
1. 定义Dialog相关的设计令牌
2. 替换硬编码值
3. 验证视觉一致性

### 阶段5：验证和测试
1. 运行自动化测试
2. 验证Dialog功能正常
3. 确认样式正确应用

## ✅ 成功标准

- [ ] 所有CSS文件遵循统一命名规范
- [ ] 删除所有重复和冗余文件
- [ ] CSS类名遵循BEM方法论
- [ ] 使用设计令牌替代硬编码值
- [ ] 所有Dialog功能正常工作
- [ ] 构建和测试通过
- [ ] 代码库整洁一致

## 🎯 预期收益

1. **提高可维护性**：统一的命名规范便于理解和维护
2. **减少冗余**：清理重复文件，减少代码库体积
3. **增强一致性**：BEM方法论确保CSS结构清晰
4. **提升扩展性**：设计令牌系统便于主题定制
5. **改善开发体验**：清晰的文件组织提高开发效率
