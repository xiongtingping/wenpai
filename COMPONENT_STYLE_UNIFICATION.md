# 组件样式统一方案

## 🎯 组件样式现状分析

### 发现的问题

#### 1. 按钮组件不一致
```tsx
// ❌ 问题：同一项目中存在多种按钮样式模式

// 模式1：使用 cva 变体系统
const buttonVariants = cva("inline-flex items-center justify-center...", {
  variants: { variant: { default: "bg-primary..." } }
});

// 模式2：直接使用内联样式
<button style={{ background: 'linear-gradient(to right, #ec4899, #ef4444)' }}>

// 模式3：混合使用 Tailwind 类
<button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2">
```

#### 2. 卡片组件样式分散
```tsx
// ❌ 发现多种卡片样式定义

// 样式1：基础卡片
<Card className="rounded-lg border bg-card text-card-foreground shadow-sm">

// 样式2：自定义卡片
<div className="rounded-xl border-2 border-indigo-200/30 shadow-lg backdrop-blur-sm">

// 样式3：硬编码样式卡片
<div style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
```

#### 3. 图标容器不统一
```tsx
// ❌ 图标容器样式不一致

// 样式1：简单容器
<div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">

// 样式2：复杂容器
<div className="icon-container-brand bg-gradient-to-br from-primary to-accent">

// 样式3：内联样式容器
<div style={{ width: '40px', height: '40px', backgroundColor: '#f0f0f0' }}>
```

## 🔧 统一方案设计

### 1. 按钮组件统一系统

#### 1.1 统一变体定义
```tsx
// ✅ 统一的按钮变体系统
const buttonVariants = cva(
  // 基础样式：使用设计令牌
  "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // 主要按钮：使用主色调
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-e1 hover:shadow-e2",
        
        // 次要按钮：使用次要色调
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-e0 hover:shadow-e1",
        
        // 轮廓按钮：透明背景，边框样式
        outline: "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
        
        // 幽灵按钮：完全透明，悬停时显示背景
        ghost: "hover:bg-accent hover:text-accent-foreground",
        
        // 渐变按钮：使用设计令牌渐变
        gradient: "bg-gradient-primary text-primary-foreground hover:shadow-glow",
        
        // 邀请按钮：特殊渐变样式
        invite: "bg-gradient-invite text-primary-foreground hover:bg-gradient-invite-hover shadow-e1 hover:shadow-e2",
        
        // 升级按钮：特殊渐变样式
        upgrade: "bg-gradient-upgrade text-primary-foreground hover:bg-gradient-upgrade-hover shadow-e1 hover:shadow-e2",
        
        // 危险按钮：使用危险色调
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-e1 hover:shadow-e2"
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
        xl: "h-14 px-8 text-xl"
      },
      animation: {
        none: "",
        hover: "hover:-translate-y-0.5",
        bounce: "hover:animate-bounce",
        pulse: "hover:animate-pulse"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      animation: "hover"
    }
  }
);
```

#### 1.2 渐变系统设计令牌
```css
/* 按钮渐变系统 */
:root {
  /* 邀请按钮渐变 */
  --gradient-invite: linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--destructive)) 100%);
  --gradient-invite-hover: linear-gradient(135deg, hsl(var(--accent) / 0.9) 0%, hsl(var(--destructive) / 0.9) 100%);
  
  /* 升级按钮渐变 */
  --gradient-upgrade: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--warning)) 100%);
  --gradient-upgrade-hover: linear-gradient(135deg, hsl(var(--primary) / 0.9) 0%, hsl(var(--warning) / 0.9) 100%);
  
  /* 主要渐变 */
  --gradient-primary: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%);
  --gradient-primary-hover: linear-gradient(135deg, hsl(var(--primary) / 0.9) 0%, hsl(var(--accent) / 0.9) 100%);
}

/* 渐变背景工具类 */
.bg-gradient-invite {
  background: var(--gradient-invite);
}

.bg-gradient-invite-hover {
  background: var(--gradient-invite-hover);
}

.bg-gradient-upgrade {
  background: var(--gradient-upgrade);
}

.bg-gradient-upgrade-hover {
  background: var(--gradient-upgrade-hover);
}

.bg-gradient-primary {
  background: var(--gradient-primary);
}
```

### 2. 卡片组件统一系统

#### 2.1 统一卡片变体
```tsx
// ✅ 统一的卡片变体系统
const cardVariants = cva(
  // 基础样式：使用设计令牌
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300",
  {
    variants: {
      variant: {
        // 默认卡片
        default: "border-border shadow-e0",
        
        // 悬浮卡片：有悬停效果
        elevated: "border-border shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",
        
        // 轮廓卡片：强调边框
        outlined: "border-2 border-border bg-transparent",
        
        // 玻璃卡片：毛玻璃效果
        glass: "border-border bg-card/80 backdrop-blur-lg",
        
        // 渐变卡片：使用渐变背景
        gradient: "border-0 bg-gradient-primary shadow-e1 hover:shadow-e2",
        
        // 软阴影卡片：柔和的新拟态风格
        soft: "border border-border bg-card shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",
        
        // 强调卡片：用于重要内容
        accent: "border-accent bg-accent/5 shadow-e1"
      },
      size: {
        sm: "p-4",
        md: "p-6", 
        lg: "p-8",
        xl: "p-10"
      },
      spacing: {
        tight: "space-y-2",
        normal: "space-y-4",
        relaxed: "space-y-6"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      spacing: "normal"
    }
  }
);
```

#### 2.2 卡片头部和内容组件
```tsx
// 卡片头部组件
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
);

// 卡片标题组件
const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
);

// 卡片内容组件
const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn("p-6 pt-0", className)} 
      {...props} 
    />
  )
);
```

### 3. 图标容器统一系统

#### 3.1 图标容器变体
```tsx
// ✅ 统一的图标容器系统
const iconContainerVariants = cva(
  // 基础样式
  "inline-flex items-center justify-center rounded-full transition-all duration-200",
  {
    variants: {
      variant: {
        // 默认容器
        default: "bg-accent text-accent-foreground",
        
        // 主色调容器
        primary: "bg-primary text-primary-foreground",
        
        // 次要色调容器
        secondary: "bg-secondary text-secondary-foreground",
        
        // 柔和容器
        soft: "bg-muted text-muted-foreground",
        
        // 渐变容器
        gradient: "bg-gradient-primary text-primary-foreground",
        
        // 品牌容器：特殊效果
        brand: "bg-gradient-primary text-primary-foreground border-2 border-primary/20 shadow-e1 hover:shadow-e2 hover:scale-105",
        
        // 玻璃容器
        glass: "bg-card/20 backdrop-blur-lg border border-border/50",
        
        // 轮廓容器
        outline: "border-2 border-border bg-transparent hover:bg-accent"
      },
      size: {
        xs: "w-6 h-6 text-xs",
        sm: "w-8 h-8 text-sm", 
        md: "w-10 h-10 text-base",
        lg: "w-12 h-12 text-lg",
        xl: "w-16 h-16 text-xl"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);
```

### 4. 表单组件统一系统

#### 4.1 输入框变体
```tsx
// ✅ 统一的输入框系统
const inputVariants = cva(
  // 基础样式
  "flex w-full rounded-md border text-base shadow-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        // 默认输入框
        default: "border-input bg-background hover:bg-muted/50 focus:bg-background",
        
        // 填充输入框
        filled: "border-border bg-muted hover:bg-muted/80 focus:bg-muted",
        
        // 轮廓输入框
        outlined: "border-2 border-border bg-transparent hover:border-border-strong focus:border-primary",
        
        // 幽灵输入框
        ghost: "border-transparent bg-transparent hover:bg-muted/30 focus:bg-background focus:border-border"
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-3 text-base",
        lg: "h-12 px-4 text-lg"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);
```

## 📋 迁移实施计划

### Phase 1: 核心组件重构 (第1-2周)

#### 1.1 按钮组件迁移
```tsx
// 迁移步骤
1. 更新 src/components/ui/button.tsx
2. 添加新的渐变变体
3. 更新所有使用内联样式的按钮
4. 测试所有按钮变体在不同主题下的表现
```

#### 1.2 卡片组件迁移
```tsx
// 迁移步骤
1. 更新 src/components/ui/card.tsx
2. 统一所有卡片样式使用
3. 移除硬编码的卡片样式
4. 验证响应式表现
```

### Phase 2: 页面组件更新 (第3周)

#### 2.1 ProfilePage 更新
```tsx
// 修复前
<button 
  style={{
    background: 'linear-gradient(to right, #ec4899, #ef4444)',
  }}
>

// 修复后  
<Button variant="invite" size="lg">
  立即邀请好友
</Button>
```

#### 2.2 PaymentSuccessPage 更新
```tsx
// 统一支付成功页面的所有组件样式
<Card variant="elevated" size="lg">
  <CardHeader>
    <CardTitle>支付成功</CardTitle>
  </CardHeader>
  <CardContent>
    <Button variant="primary" size="lg">
      继续使用
    </Button>
  </CardContent>
</Card>
```

### Phase 3: 创意组件更新 (第4周)

#### 3.1 MD2Card 组件
```tsx
// 统一卡片预览组件样式
<Card variant="glass" className="preview-container">
  <div className="preview-content" data-preview-theme={selectedTheme}>
    {/* 预览内容 */}
  </div>
</Card>
```

#### 3.2 ContentFormSelector 组件
```tsx
// 统一内容形式选择器样式
<Card variant="soft">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <IconContainer variant="brand" size="sm">
        <Settings className="h-4 w-4" />
      </IconContainer>
      请选择表达风格
    </CardTitle>
  </CardHeader>
  <CardContent>
    {/* 选择器内容 */}
  </CardContent>
</Card>
```

## 🎯 质量保证

### 自动化测试
```typescript
// 组件样式一致性测试
describe('Component Style Consistency', () => {
  test('all buttons use unified variant system', () => {
    // 测试所有按钮都使用统一的变体系统
  });
  
  test('all cards use unified variant system', () => {
    // 测试所有卡片都使用统一的变体系统
  });
  
  test('no hardcoded styles in components', () => {
    // 测试组件中没有硬编码样式
  });
});
```

### 视觉回归测试
```javascript
// 视觉一致性检查
const themes = ['light', 'dark', 'beige', 'gold', 'rainbow', 'green'];
themes.forEach(theme => {
  test(`components render consistently in ${theme} theme`, () => {
    // 测试组件在各主题下的视觉一致性
  });
});
```

## 📊 预期收益

### 开发效率提升
- **组件复用**: 统一的变体系统提高组件复用率
- **开发速度**: 减少样式决策时间
- **维护成本**: 集中的样式管理降低维护成本

### 用户体验改善
- **视觉一致性**: 整个应用的视觉体验更加统一
- **交互一致性**: 相同类型组件的交互行为一致
- **主题适配**: 所有组件在所有主题下都有良好表现

### 代码质量提升
- **类型安全**: TypeScript支持的变体系统
- **可测试性**: 统一的组件API便于测试
- **可扩展性**: 新变体和主题更容易添加
