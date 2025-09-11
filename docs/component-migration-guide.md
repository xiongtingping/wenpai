# 组件迁移指南

## 🎯 目标

将现有组件从混合样式系统迁移到统一的设计令牌驱动系统。

## 📋 迁移检查清单

### 迁移前检查
- [ ] 确认组件当前使用的样式系统
- [ ] 识别所有硬编码样式值
- [ ] 记录组件的变体和状态
- [ ] 确保有足够的测试覆盖

### 迁移过程
- [ ] 使用设计令牌替换硬编码值
- [ ] 实现标准化的变体系统
- [ ] 更新组件API（如需要）
- [ ] 添加TypeScript类型约束

### 迁移后验证
- [ ] 所有变体正常显示
- [ ] 主题切换正常工作
- [ ] 响应式设计保持正常
- [ ] 通过样式系统检查

## 🔄 迁移模式

### 1. Button组件迁移

#### 迁移前
```tsx
// ❌ 混合样式系统
const Button = ({ children, variant = 'primary', ...props }) => {
  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-500 text-white hover:bg-blue-600';
      case 'secondary':
        return 'bg-gray-200 text-gray-800 hover:bg-gray-300';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  return (
    <button 
      className={`px-4 py-2 rounded-lg font-medium ${getButtonStyles()}`}
      style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
      {...props}
    >
      {children}
    </button>
  );
};
```

#### 迁移后
```tsx
// ✅ 统一设计令牌系统
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // 基础样式 - 使用设计令牌
  "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
      radius: {
        default: "rounded-md",
        sm: "rounded-sm",
        lg: "rounded-lg",
        full: "rounded-full",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      radius: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, radius, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, radius, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

### 2. Dialog组件迁移

#### 迁移前
```tsx
// ❌ 混合样式系统
const Dialog = ({ children, open, onOpenChange }) => (
  <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
    <RadixDialog.Portal>
      <RadixDialog.Overlay 
        className="fixed inset-0 bg-black opacity-50 z-50"
      />
      <RadixDialog.Content 
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg z-50"
        style={{ 
          maxWidth: '500px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        }}
      >
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  </RadixDialog.Root>
);
```

#### 迁移后
```tsx
// ✅ 统一设计令牌系统
const Dialog = RadixDialog.Root;

const DialogPortal = RadixDialog.Portal;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Overlay>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Overlay>
>(({ className, ...props }, ref) => (
  <RadixDialog.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-overlay bg-black/50 backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));

const DialogContent = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Content>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <RadixDialog.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-modal grid w-full max-w-lg",
        "translate-x-[-50%] translate-y-[-50%] gap-4 border",
        "bg-background p-6 shadow-dialog duration-200",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
        "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        "rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </RadixDialog.Content>
  </DialogPortal>
));
```

### 3. Card组件迁移

#### 迁移前
```tsx
// ❌ 混合样式系统
const Card = ({ children, elevated = false }) => (
  <div 
    className={`bg-white border border-gray-200 rounded-lg p-6 ${
      elevated ? 'shadow-lg' : 'shadow-sm'
    }`}
    style={{ 
      borderColor: '#e5e7eb',
      backgroundColor: '#ffffff'
    }}
  >
    {children}
  </div>
);
```

#### 迁移后
```tsx
// ✅ 统一设计令牌系统
const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground",
  {
    variants: {
      variant: {
        default: "shadow-sm",
        elevated: "shadow-lg",
        outline: "border-2",
      },
      padding: {
        none: "",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      }
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
);

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, className }))}
      {...props}
    />
  )
);
```

## 🎨 样式令牌映射

### 颜色映射
```tsx
// 迁移映射表
const colorMigrationMap = {
  // 硬编码 → 设计令牌
  '#ffffff': 'hsl(var(--background))',
  '#000000': 'hsl(var(--foreground))',
  '#3b82f6': 'hsl(var(--primary))',
  '#ef4444': 'hsl(var(--destructive))',
  '#22c55e': 'hsl(var(--success))',
  '#f59e0b': 'hsl(var(--warning))',
  
  // Tailwind类 → 语义化类
  'bg-blue-500': 'bg-primary',
  'text-gray-900': 'text-foreground',
  'border-gray-200': 'border-border',
  'bg-red-500': 'bg-destructive',
};
```

### 尺寸映射
```tsx
const sizeMigrationMap = {
  // 硬编码 → 设计令牌
  '4px': 'var(--spacing-1)',
  '8px': 'var(--spacing-2)',
  '12px': 'var(--spacing-3)',
  '16px': 'var(--spacing-4)',
  '24px': 'var(--spacing-6)',
  '32px': 'var(--spacing-8)',
  
  // Tailwind类 → 语义化类
  'p-4': 'p-md',
  'm-2': 'm-sm',
  'gap-6': 'gap-lg',
};
```

## 🔧 迁移工具

### 自动化迁移脚本
```javascript
// scripts/migrate-component.js
const fs = require('fs');
const path = require('path');

function migrateComponent(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 替换硬编码颜色
  content = content.replace(/#[0-9a-fA-F]{6}/g, (match) => {
    return colorMigrationMap[match] || match;
  });
  
  // 替换硬编码尺寸
  content = content.replace(/(\d+)px/g, (match, num) => {
    return sizeMigrationMap[match] || match;
  });
  
  // 替换Tailwind类
  Object.entries(tailwindMigrationMap).forEach(([old, new_]) => {
    content = content.replace(new RegExp(old, 'g'), new_);
  });
  
  fs.writeFileSync(filePath, content);
}
```

### 验证脚本
```javascript
// scripts/validate-migration.js
function validateMigration(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // 检查硬编码颜色
  const hardcodedColors = content.match(/#[0-9a-fA-F]{6}/g);
  if (hardcodedColors) {
    issues.push(`发现硬编码颜色: ${hardcodedColors.join(', ')}`);
  }
  
  // 检查硬编码尺寸
  const hardcodedSizes = content.match(/\d+px/g);
  if (hardcodedSizes) {
    issues.push(`发现硬编码尺寸: ${hardcodedSizes.join(', ')}`);
  }
  
  return issues;
}
```

## 📝 迁移步骤

### 1. 准备阶段
```bash
# 1. 创建迁移分支
git checkout -b migrate/component-name

# 2. 运行迁移前检查
npm run style:check

# 3. 备份原始文件
cp src/components/ui/button.tsx src/components/ui/button.tsx.backup
```

### 2. 执行迁移
```bash
# 1. 运行自动化迁移脚本
node scripts/migrate-component.js src/components/ui/button.tsx

# 2. 手动调整复杂样式
# 编辑文件，使用设计令牌

# 3. 更新组件API
# 添加variant、size等标准化属性
```

### 3. 验证迁移
```bash
# 1. 运行验证脚本
node scripts/validate-migration.js src/components/ui/button.tsx

# 2. 运行样式系统检查
npm run style:check

# 3. 运行测试
npm test -- button

# 4. 视觉回归测试
npm run test:visual
```

### 4. 完成迁移
```bash
# 1. 提交更改
git add .
git commit -m "migrate: Button component to unified design tokens"

# 2. 创建PR
gh pr create --title "Migrate Button component to design tokens"

# 3. 清理备份文件
rm src/components/ui/button.tsx.backup
```

## ⚠️ 注意事项

### 常见陷阱
1. **破坏现有功能**：确保所有变体和状态都正确迁移
2. **性能影响**：避免过度使用CSS-in-JS
3. **类型安全**：确保TypeScript类型正确
4. **可访问性**：保持ARIA属性和键盘导航

### 最佳实践
1. **渐进式迁移**：一次迁移一个组件
2. **充分测试**：确保视觉和功能测试通过
3. **文档更新**：同步更新组件文档
4. **团队沟通**：及时通知团队成员API变更

## 📚 相关资源

- [设计令牌文档](../tokens/README.md)
- [样式系统策略](../src/styles/unified-style-strategy.md)
- [组件库规范](./component-library-standards.md)
- [测试指南](./testing-guide.md)
