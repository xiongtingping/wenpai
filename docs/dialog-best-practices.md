# Dialog组件使用最佳实践

## 🎯 核心原则

### 1. 统一性原则
- **单一组件**: 始终使用`UnifiedDialog`组件
- **统一样式**: 使用设计令牌和预定义变体
- **一致行为**: 遵循统一的交互模式

### 2. 可维护性原则
- **类型安全**: 使用严格的TypeScript类型
- **可测试性**: 编写全面的测试用例
- **文档完整**: 提供清晰的使用说明

### 3. 用户体验原则
- **无障碍性**: 支持键盘导航和屏幕阅读器
- **响应式**: 适配所有设备尺寸
- **性能优化**: 快速加载和流畅动画

## 📋 使用指南

### 1. 基础用法

```tsx
import { UnifiedDialog } from '@/components/ui/UnifiedDialog/UnifiedDialog';
import { useState } from 'react';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        打开对话框
      </button>
      
      <UnifiedDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        size="medium"
        variant="default"
        aria-label="示例对话框"
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">对话框标题</h2>
          <p className="text-muted-foreground mb-6">对话框内容</p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsOpen(false)}>取消</button>
            <button onClick={() => setIsOpen(false)}>确认</button>
          </div>
        </div>
      </UnifiedDialog>
    </>
  );
}
```

### 2. 高级用法

#### 自定义样式
```tsx
// ✅ 推荐：使用CSS类
<UnifiedDialog
  className="custom-dialog"
  overlayClassName="custom-overlay"
>
  {/* 内容 */}
</UnifiedDialog>

// CSS文件
.custom-dialog {
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-dialog);
}
```

#### 条件渲染
```tsx
// ✅ 推荐：使用懒加载
const LazyContent = React.lazy(() => import('./DialogContent'));

<UnifiedDialog open={isOpen} onOpenChange={setIsOpen}>
  {isOpen && (
    <Suspense fallback={<div>加载中...</div>}>
      <LazyContent />
    </Suspense>
  )}
</UnifiedDialog>
```

#### 表单对话框
```tsx
function FormDialog() {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSubmit = (data: FormData) => {
    // 处理表单提交
    setIsOpen(false);
  };

  return (
    <UnifiedDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      size="large"
      closeOnOverlayClick={false} // 防止误关闭
      aria-labelledby="form-dialog-title"
    >
      <form onSubmit={handleSubmit} className="p-6">
        <h2 id="form-dialog-title" className="text-lg font-semibold mb-4">
          表单标题
        </h2>
        
        {/* 表单字段 */}
        <div className="space-y-4 mb-6">
          <input type="text" placeholder="输入内容" />
        </div>
        
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => setIsOpen(false)}>
            取消
          </button>
          <button type="submit">
            提交
          </button>
        </div>
      </form>
    </UnifiedDialog>
  );
}
```

### 3. 组件变体

#### 尺寸变体
```tsx
// 小型对话框 - 适用于简单确认
<UnifiedDialog size="small">

// 中型对话框 - 默认尺寸，适用于大多数场景
<UnifiedDialog size="medium">

// 大型对话框 - 适用于复杂表单
<UnifiedDialog size="large">

// 全屏对话框 - 适用于复杂界面
<UnifiedDialog size="fullscreen">
```

#### 样式变体
```tsx
// 默认样式
<UnifiedDialog variant="default">

// 提升样式 - 更强的阴影效果
<UnifiedDialog variant="elevated">

// 简约样式 - 最小化装饰
<UnifiedDialog variant="minimal">
```

#### 动画变体
```tsx
// 淡入动画
<UnifiedDialog animation="fade">

// 缩放动画 - 默认
<UnifiedDialog animation="scale">

// 滑入动画
<UnifiedDialog animation="slide">

// 无动画
<UnifiedDialog animation="none">
```

## 🚫 禁止模式

### 1. 直接使用Radix UI组件
```tsx
// ❌ 禁止
import * as Dialog from '@radix-ui/react-dialog';

<Dialog.Root>
  <Dialog.Content>
    {/* 内容 */}
  </Dialog.Content>
</Dialog.Root>

// ✅ 正确
import { UnifiedDialog } from '@/components/ui/UnifiedDialog/UnifiedDialog';

<UnifiedDialog open={isOpen} onOpenChange={setIsOpen}>
  {/* 内容 */}
</UnifiedDialog>
```

### 2. 内联定位样式
```tsx
// ❌ 禁止
<UnifiedDialog
  style={{
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  }}
>

// ✅ 正确
<UnifiedDialog className="custom-positioning">
```

### 3. 硬编码样式值
```tsx
// ❌ 禁止
<UnifiedDialog
  style={{
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '24px'
  }}
>

// ✅ 正确
<UnifiedDialog className="custom-dialog">
```

## 🧪 测试最佳实践

### 1. 单元测试
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { UnifiedDialog } from '@/components/ui/UnifiedDialog/UnifiedDialog';

describe('UnifiedDialog', () => {
  it('应该正确居中显示', () => {
    render(
      <UnifiedDialog open={true} onOpenChange={() => {}}>
        <div>测试内容</div>
      </UnifiedDialog>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('unified-dialog');
    expect(dialog).toBeVisible();
  });

  it('应该响应Escape键关闭', () => {
    const onOpenChange = jest.fn();
    render(
      <UnifiedDialog open={true} onOpenChange={onOpenChange}>
        <div>测试内容</div>
      </UnifiedDialog>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
```

### 2. 集成测试
```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

describe('Dialog Integration', () => {
  it('应该完整的打开和关闭流程', async () => {
    const TestComponent = () => {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <button onClick={() => setIsOpen(true)}>打开</button>
          <UnifiedDialog open={isOpen} onOpenChange={setIsOpen}>
            <div>内容</div>
          </UnifiedDialog>
        </>
      );
    };

    render(<TestComponent />);

    // 打开对话框
    fireEvent.click(screen.getByText('打开'));
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });

    // 关闭对话框
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
```

## 🎨 样式定制

### 1. 使用CSS变量
```css
/* 自定义Dialog样式 */
.my-custom-dialog {
  --dialog-background: var(--color-card);
  --dialog-border: var(--color-border);
  --dialog-shadow: var(--shadow-lg);
  --dialog-radius: var(--radius-xl);
}
```

### 2. 主题适配
```css
/* 深色主题适配 */
[data-theme="dark"] .my-dialog {
  --dialog-background: hsl(var(--card));
  --dialog-border: hsl(var(--border));
}

/* 浅色主题适配 */
[data-theme="light"] .my-dialog {
  --dialog-background: hsl(var(--background));
  --dialog-border: hsl(var(--border));
}
```

### 3. 响应式设计
```css
/* 移动端适配 */
@media (max-width: 640px) {
  .my-dialog {
    max-width: calc(100vw - 1rem);
    max-height: calc(100vh - 1rem);
    margin: 0.5rem;
  }
}
```

## 🔧 调试技巧

### 1. 开启调试模式
```tsx
<UnifiedDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  // 在开发环境开启调试
  className={process.env.NODE_ENV === 'development' ? 'debug-dialog' : ''}
>
```

### 2. 位置验证
```javascript
// 在浏览器控制台运行
function debugDialogPosition() {
  const dialog = document.querySelector('[role="dialog"]');
  if (dialog) {
    const rect = dialog.getBoundingClientRect();
    console.log('Dialog位置信息:', {
      center: {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      },
      expected: {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      },
      size: {
        width: rect.width,
        height: rect.height
      }
    });
  }
}
```

## 📚 相关资源

- [UnifiedDialog API文档](../src/components/ui/UnifiedDialog/README.md)
- [设计令牌系统](../src/styles/design-tokens.css)
- [TypeScript类型定义](../src/types/dialog-types.ts)
- [测试工具](../src/tests/dialog-positioning.test.ts)
- [代码审查清单](./dialog-code-review-checklist.md)
