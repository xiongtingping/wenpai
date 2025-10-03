# 层级化字体系统使用指南

## 📖 概述

为了统一各组件间的字体大小层级关系,我们在 `unified-design-system.css` 中定义了6个层级的字体大小令牌。

## 🎯 字体层级定义

| 层级 | CSS变量 | Tailwind类名 | 大小 | 使用场景 | 示例 |
|------|---------|--------------|------|----------|------|
| **L1** | `--font-size-heading-primary` | `.text-heading-primary` | 18px | 主卡片/页面标题 | 创意魔方、营销日历卡片标题 |
| **L2** | `--font-size-heading-secondary` | `.text-heading-secondary` | 16px | 组件/区块标题 | 九宫格维度标题、任务标题 |
| **L3** | `--font-size-heading-tertiary` | `.text-heading-tertiary` | 14px | 小节标题 | 子项目标题、列表标题 |
| **L4** | `--font-size-body` | `.text-body` | 14px | 正文内容 | 主要内容文本、描述 |
| **L5** | `--font-size-caption` | `.text-caption` | 12px | 辅助信息 | 时间戳、标签、提示文本 |
| **L6** | `--font-size-micro` | `.text-micro` | 11px | 微小文本 | 角标、徽章数字(按需使用) |

## ✅ 使用方法

### 方法1: 使用CSS变量
```css
.my-title {
  font-size: var(--font-size-heading-primary);
}
```

### 方法2: 使用Tailwind类名
```tsx
<h2 className="text-heading-primary font-semibold">创意魔方</h2>
<h3 className="text-heading-secondary">目标客群</h3>
<p className="text-body">这是正文内容</p>
<span className="text-caption text-muted-foreground">2025-01-15</span>
```

## 🔧 迁移指南

### 创意魔方组件
- **卡片标题**: `text-lg` → `text-heading-primary`
- **九宫格维度名称**: `text-xs` → `text-heading-secondary`
- **选项文本**: `text-xs` → `text-body`
- **辅助信息**: `text-xs` → `text-caption`

### 营销日历组件
- **卡片标题**: `text-lg` → `text-heading-primary`
- **任务标题**: `text-sm` → `text-heading-secondary`
- **任务描述**: `text-xs` → `text-body`
- **日期/标签**: `text-xs` → `text-caption`

## 📊 视觉层级示例

```
┌─────────────────────────────────────┐
│ 创意魔方 (18px L1)                    │  ← 主标题
├─────────────────────────────────────┤
│ 目标客群 (16px L2)                    │  ← 组件标题
│ ┌─────────────────────────────────┐ │
│ │ 年轻人 (14px L4)                  │ │  ← 正文内容
│ │ 上班族 (14px L4)                  │ │
│ │ 2025-01-15 (12px L5)             │ │  ← 辅助信息
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## ⚠️ 注意事项

1. **优先使用层级类名**: 使用 `.text-heading-primary` 而不是直接的 `.text-lg`,以保持语义化
2. **保持一致性**: 同层级的元素应使用相同的字体大小
3. **避免跳级**: 不要从L1直接跳到L4,保持视觉层级的连续性
4. **特殊场景**: 只有在确实需要更小字体时才使用 `text-micro` (11px)

## 🎨 配合字重使用

```tsx
{/* 主标题 - 加粗 */}
<h1 className="text-heading-primary font-bold">

{/* 次要标题 - 半粗 */}
<h2 className="text-heading-secondary font-semibold">

{/* 正文 - 中等 */}
<p className="text-body font-medium">

{/* 辅助信息 - 正常 */}
<span className="text-caption font-normal text-muted-foreground">
```

## 📝 最佳实践

1. **卡片标题**: 始终使用 `text-heading-primary` (18px)
2. **卡片内主要区块标题**: 使用 `text-heading-secondary` (16px)
3. **列表项标题/内容**: 使用 `text-body` (14px)
4. **元数据/时间戳**: 使用 `text-caption` (12px)
5. **微小角标**: 使用 `text-micro` (11px)

这样可以确保整个应用的字体层级统一,提升用户体验的一致性。
