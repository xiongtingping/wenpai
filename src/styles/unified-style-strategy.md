# 统一样式系统策略

## 🎯 核心原则

### 1. 单一样式系统策略
- **禁止混用**：严禁在同一组件中混用多种样式系统
- **优先级顺序**：设计令牌 > CSS类 > Tailwind工具类 > 内联样式（仅限动态值）
- **一致性保证**：所有组件必须遵循统一的样式应用模式

### 2. 样式应用层级
```
Layer 1: Design Tokens (设计令牌)
├── 颜色令牌：--color-primary, --color-background
├── 间距令牌：--spacing-xs, --spacing-sm
├── 字体令牌：--font-size-base, --font-weight-medium
└── 阴影令牌：--shadow-sm, --shadow-lg

Layer 2: CSS Classes (CSS类)
├── 组件基础类：.dialog, .button, .card
├── 变体类：.button--primary, .card--elevated
└── 状态类：.is-active, .is-disabled

Layer 3: Tailwind Utilities (工具类)
├── 布局工具：flex, grid, absolute
├── 响应式工具：md:flex, lg:grid
└── 状态工具：hover:bg-primary, focus:ring-2

Layer 4: Inline Styles (内联样式)
└── 仅限动态计算值：transform, width (基于数据)
```

## 🚫 禁止模式

### 1. 硬编码样式
```css
/* ❌ 禁止 */
.component {
  color: #ffffff;
  background: rgb(255, 0, 0);
  padding: 16px;
  border-radius: 8px;
}

/* ✅ 正确 */
.component {
  color: var(--color-foreground);
  background: var(--color-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-sm);
}
```

### 2. 混合样式系统
```jsx
/* ❌ 禁止 */
<div 
  className="flex p-4 bg-white" 
  style={{ backgroundColor: '#ffffff', padding: '16px' }}
>

/* ✅ 正确 */
<div className="dialog-container">
```

### 3. 重复样式定义
```css
/* ❌ 禁止 */
.button-primary { background: var(--color-primary); }
.btn-main { background: var(--color-primary); }
.primary-button { background: var(--color-primary); }

/* ✅ 正确 */
.button--primary { background: var(--color-primary); }
```

## ✅ 推荐模式

### 1. 组件样式结构
```css
/* 基础组件类 */
.dialog {
  /* 使用设计令牌 */
  position: fixed;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-dialog);
  
  /* 布局属性 */
  display: flex;
  flex-direction: column;
  
  /* 定位属性 */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: var(--z-dialog);
}

/* 变体类 */
.dialog--large {
  max-width: var(--size-dialog-large);
  max-height: var(--size-dialog-large-height);
}

.dialog--small {
  max-width: var(--size-dialog-small);
  max-height: var(--size-dialog-small-height);
}

/* 状态类 */
.dialog[data-state="open"] {
  animation: var(--animation-dialog-enter);
}
```

### 2. React组件实现
```tsx
interface DialogProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'elevated' | 'minimal';
  className?: string;
}

export function Dialog({ size = 'medium', variant = 'default', className, ...props }: DialogProps) {
  return (
    <div 
      className={cn(
        'dialog',
        `dialog--${size}`,
        `dialog--${variant}`,
        className
      )}
      {...props}
    />
  );
}
```

## 📋 实施计划

### Phase 1: 设计令牌完善 (第1周)
- [ ] 审查并完善所有设计令牌
- [ ] 建立语义化命名规范
- [ ] 确保所有主题完整覆盖

### Phase 2: 组件样式重构 (第2-3周)
- [ ] 重构所有Dialog相关组件
- [ ] 消除硬编码样式
- [ ] 统一组件变体系统

### Phase 3: 工具类优化 (第4周)
- [ ] 清理重复的工具类
- [ ] 建立工具类使用规范
- [ ] 优化Tailwind配置

### Phase 4: 质量保证 (第5周)
- [ ] 建立自动化检查
- [ ] 创建样式lint规则
- [ ] 进行全面回归测试

## 🔧 工具支持

### 1. ESLint规则
```javascript
// 禁止内联样式中的硬编码值
'no-hardcoded-styles': 'error',
// 禁止混合样式系统
'no-mixed-style-systems': 'error',
// 强制使用设计令牌
'enforce-design-tokens': 'warn'
```

### 2. 自动化检查脚本
```bash
# 检查硬编码样式
npm run check:hardcoded-styles

# 检查样式一致性
npm run check:style-consistency

# 检查设计令牌使用
npm run check:design-tokens
```

## 📊 成功指标

- ✅ 零硬编码颜色值
- ✅ 零内联定位样式
- ✅ 100%设计令牌覆盖率
- ✅ 统一的组件变体系统
- ✅ 完整的主题支持
