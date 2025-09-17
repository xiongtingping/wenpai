# 📚 CSS类名和React组件命名规范

## 🎯 总体原则

遵循CLAUDE.md规定的统一命名规范，建立可维护、一致、符合最佳实践的命名体系。

## 🏗️ CSS类名命名规范

### 1. BEM方法论 (Block-Element-Modifier)

```css
/* 基础结构 */
.block {}
.block__element {}
.block--modifier {}
.block__element--modifier {}
```

### 2. Dialog组件命名规范

```css
/* 基础Dialog类 */
.dialog {}                              /* 所有Dialog的基础类 */
.dialog--quick-reference {}             /* 快速引用Dialog修饰符 */
.dialog--history {}                     /* 历史记录Dialog修饰符 */
.dialog--confirmation {}                /* 确认Dialog修饰符 */

/* Dialog元素 */
.dialog__header {}                      /* Dialog头部 */
.dialog__content {}                     /* Dialog内容区 */
.dialog__footer {}                      /* Dialog底部 */
.dialog__title {}                       /* Dialog标题 */
.dialog__description {}                 /* Dialog描述 */

/* Dialog状态修饰符 */
.dialog--open {}                        /* 打开状态 */
.dialog--closed {}                      /* 关闭状态 */
.dialog--loading {}                     /* 加载状态 */
.dialog--error {}                       /* 错误状态 */

/* Dialog尺寸修饰符 */
.dialog--small {}                       /* 小尺寸 */
.dialog--medium {}                      /* 中等尺寸 */
.dialog--large {}                       /* 大尺寸 */
.dialog--fullscreen {}                  /* 全屏 */
```

### 3. 功能性类名

```css
/* 布局类 */
.layout-flex {}                         /* Flex布局 */
.layout-grid {}                         /* Grid布局 */
.layout-stack {}                        /* 垂直堆叠布局 */

/* 状态类 */
.state-visible {}                       /* 可见状态 */
.state-hidden {}                        /* 隐藏状态 */
.state-loading {}                       /* 加载状态 */
.state-disabled {}                      /* 禁用状态 */

/* 交互类 */
.interactive-clickable {}               /* 可点击 */
.interactive-hoverable {}               /* 可悬停 */
.interactive-draggable {}               /* 可拖拽 */

/* 主题类 */
.theme-light {}                         /* 亮色主题 */
.theme-dark {}                          /* 暗色主题 */
.theme-high-contrast {}                 /* 高对比度主题 */
```

### 4. 组件特定类名

```css
/* 快速引用组件 */
.quick-reference {}                     /* 快速引用基础类 */
.quick-reference__search {}             /* 搜索框 */
.quick-reference__tabs {}               /* 标签页 */
.quick-reference__list {}               /* 列表容器 */
.quick-reference__item {}               /* 列表项 */
.quick-reference__item--selected {}     /* 选中的列表项 */

/* 按钮组件 */
.btn {}                                 /* 基础按钮 */
.btn--primary {}                        /* 主要按钮 */
.btn--secondary {}                      /* 次要按钮 */
.btn--ghost {}                          /* 幽灵按钮 */
.btn--small {}                          /* 小按钮 */
.btn--large {}                          /* 大按钮 */
```

## 🧩 React组件命名规范

### 1. 组件文件命名

```
PascalCase + 描述性名称
QuickReferenceDialog.tsx               ✅ 正确
quickReferenceDialog.tsx               ❌ 错误
quick-reference-dialog.tsx             ❌ 错误
```

### 2. 组件导出命名

```typescript
// 默认导出
export default function QuickReferenceDialog() {}

// 命名导出
export function QuickReferenceDialog() {}
export { QuickReferenceDialog } from './QuickReferenceDialog';
```

### 3. Hook命名

```typescript
// 通用Hook
useDialogPositioning()                  ✅ 正确
useDialog()                            ❌ 太泛泛
useDialogPos()                         ❌ 缩写不清晰

// 特定Hook
useQuickReferenceDialogPositioning()   ✅ 正确
useHistoryDialogPositioning()          ✅ 正确
useQRDialogPos()                       ❌ 缩写不清晰
```

### 4. 接口命名

```typescript
// Props接口
interface QuickReferenceDialogProps {}  ✅ 正确
interface QuickRefProps {}              ❌ 缩写不清晰
interface IQuickReferenceDialog {}      ❌ 不推荐I前缀

// 数据接口
interface QuickReferenceItem {}         ✅ 正确
interface DialogOptions {}              ✅ 正确
interface DialogPositioningResult {}    ✅ 正确
```

### 5. 变量和函数命名

```typescript
// 函数
const handleDialogOpen = () => {}       ✅ 正确
const openDialog = () => {}             ✅ 正确
const dlgOpen = () => {}                ❌ 缩写不清晰

// 变量
const isDialogOpen = true;              ✅ 正确
const dialogElement = document.querySelector(); ✅ 正确
const dlg = document.querySelector();   ❌ 缩写不清晰

// 状态
const [isOpen, setIsOpen] = useState(); ✅ 正确
const [open, setOpen] = useState();     ✅ 正确（简短但清晰）
const [o, setO] = useState();           ❌ 过于简短
```

## 📁 文件组织结构

```
src/
├── components/
│   ├── ui/                             # 基础UI组件
│   │   ├── dialog.tsx
│   │   ├── button.tsx
│   │   └── input.tsx
│   ├── creative/                       # 业务组件
│   │   └── QuickReference/
│   │       ├── QuickReferenceDialog.tsx
│   │       ├── QuickReferenceItem.tsx
│   │       └── index.ts
│   └── layout/                         # 布局组件
├── hooks/                              # 自定义Hooks
│   ├── useDialogPositioning.ts
│   └── useQuickReference.ts
├── styles/                             # 样式文件
│   ├── components/                     # 组件样式
│   │   ├── dialog.css
│   │   └── quick-reference.css
│   ├── base/                           # 基础样式
│   └── utilities/                      # 工具类样式
└── types/                              # 类型定义
    ├── dialog-types.ts
    └── component-types.ts
```

## 🎨 设计令牌集成

### 1. CSS变量命名

```css
/* 颜色令牌 */
--color-primary
--color-secondary
--color-accent
--color-error
--color-warning
--color-success

/* 间距令牌 */
--spacing-xs          /* 4px */
--spacing-sm          /* 8px */
--spacing-md          /* 16px */
--spacing-lg          /* 24px */
--spacing-xl          /* 32px */

/* Dialog特定令牌 */
--dialog-z-index      /* 1055 */
--dialog-max-width    /* min(95vw, 1200px) */
--dialog-border-radius /* 8px */
--dialog-shadow       /* 0 25px 50px -12px rgba(0, 0, 0, 0.25) */
```

### 2. 令牌使用规范

```css
/* ✅ 正确 - 使用设计令牌 */
.dialog {
  z-index: var(--dialog-z-index);
  max-width: var(--dialog-max-width);
  border-radius: var(--dialog-border-radius);
  box-shadow: var(--dialog-shadow);
}

/* ❌ 错误 - 硬编码值 */
.dialog {
  z-index: 1055;
  max-width: 1200px;
  border-radius: 8px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
```

## 🔍 命名检查清单

### CSS类名检查

- [ ] 使用BEM方法论？
- [ ] 避免缩写？
- [ ] 语义化命名？
- [ ] 一致的分隔符（kebab-case）？
- [ ] 避免硬编码值？

### React组件检查

- [ ] PascalCase命名？
- [ ] 描述性且准确？
- [ ] Props接口命名正确？
- [ ] Hook命名遵循use前缀？
- [ ] 文件名与组件名一致？

### 导入导出检查

- [ ] 一致的导入顺序？
- [ ] 明确的默认导出？
- [ ] 避免循环依赖？
- [ ] 正确的路径别名使用？

## 🚀 最佳实践

### 1. 保持一致性

所有团队成员必须遵循相同的命名规范，确保代码库的一致性。

### 2. 语义化优先

类名和组件名应该反映其功能和用途，而不是外观。

### 3. 避免缩写

除非是广泛认知的缩写（如btn、nav），否则使用完整单词。

### 4. 层级结构清晰

通过BEM方法论和文件组织结构体现组件间的关系。

### 5. 可扩展性

命名应该考虑未来的扩展需求，避免过于具体的命名。

---

**⚠️ 重要提醒：所有新代码必须严格遵循此命名规范。现有代码应逐步重构以符合规范。**