# Dialog代码审查清单

## 🎯 目标
确保所有Dialog相关的代码修改都符合统一标准，防止定位问题复发。

## 📋 审查清单

### 1. 组件使用规范

#### ✅ 必须检查项
- [ ] **使用统一组件**: 是否使用`UnifiedDialog`而非直接使用Radix UI组件？
- [ ] **正确的Props**: 是否使用了正确的Props类型约束？
- [ ] **避免内联样式**: 是否避免了内联定位样式（position, top, left等）？
- [ ] **设计令牌使用**: 是否使用设计令牌而非硬编码值？

```tsx
// ❌ 错误示例
<Dialog.Content 
  style={{ 
    position: 'fixed', 
    top: '50%', 
    left: '50%',
    backgroundColor: '#ffffff'
  }}
>

// ✅ 正确示例
<UnifiedDialog 
  size="medium" 
  variant="default"
  className="custom-dialog"
>
```

#### ⚠️ 警告项
- [ ] **混合样式系统**: 是否同时使用了className和style？
- [ ] **重复样式定义**: 是否定义了重复的CSS类？
- [ ] **硬编码尺寸**: 是否使用了硬编码的px/rem值？

### 2. CSS样式规范

#### ✅ 必须检查项
- [ ] **CSS选择器**: 是否使用了正确的CSS选择器（.unified-dialog）？
- [ ] **!important使用**: 是否合理使用了!important声明？
- [ ] **z-index管理**: 是否使用了统一的z-index系统？
- [ ] **响应式设计**: 是否考虑了移动端适配？

```css
/* ❌ 错误示例 */
.my-dialog {
  position: absolute;
  top: 100px;
  left: 200px;
  background: #fff;
}

/* ✅ 正确示例 */
.unified-dialog--custom {
  background: var(--color-background);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-dialog);
}
```

#### ⚠️ 警告项
- [ ] **CSS层级**: 是否正确使用了@layer指令？
- [ ] **主题兼容**: 是否在所有主题下都正常显示？
- [ ] **动画性能**: 是否使用了高性能的CSS动画？

### 3. TypeScript类型安全

#### ✅ 必须检查项
- [ ] **严格类型**: 是否使用了`StrictDialogProps`类型？
- [ ] **禁止类型**: 是否避免了`ProhibitedStyleProps`？
- [ ] **类型守卫**: 是否使用了类型守卫函数验证Props？
- [ ] **泛型约束**: 是否正确使用了泛型约束？

```tsx
// ❌ 错误示例
interface MyDialogProps {
  style?: CSSProperties; // 允许所有CSS属性
}

// ✅ 正确示例
interface MyDialogProps extends StrictDialogProps {
  customProp?: string;
}
```

### 4. 无障碍性检查

#### ✅ 必须检查项
- [ ] **ARIA属性**: 是否包含必要的ARIA属性？
- [ ] **键盘导航**: 是否支持Escape键关闭？
- [ ] **焦点管理**: 是否正确管理焦点？
- [ ] **屏幕阅读器**: 是否提供了适当的标签？

```tsx
// ✅ 正确示例
<UnifiedDialog
  aria-label="快速引用对话框"
  aria-describedby="dialog-description"
  closeOnEscape={true}
>
  <div id="dialog-description">
    这是一个快速引用对话框
  </div>
</UnifiedDialog>
```

### 5. 性能优化检查

#### ✅ 必须检查项
- [ ] **懒加载**: 大型Dialog是否使用了懒加载？
- [ ] **Portal优化**: 是否正确使用了Portal？
- [ ] **重渲染优化**: 是否避免了不必要的重渲染？
- [ ] **内存泄漏**: 是否正确清理了事件监听器？

```tsx
// ✅ 正确示例
const LazyDialogContent = React.lazy(() => import('./DialogContent'));

function MyDialog({ open }: Props) {
  return (
    <UnifiedDialog open={open}>
      {open && (
        <Suspense fallback={<div>Loading...</div>}>
          <LazyDialogContent />
        </Suspense>
      )}
    </UnifiedDialog>
  );
}
```

### 6. 测试覆盖检查

#### ✅ 必须检查项
- [ ] **单元测试**: 是否包含了组件的单元测试？
- [ ] **定位测试**: 是否包含了定位验证测试？
- [ ] **交互测试**: 是否测试了用户交互？
- [ ] **边界测试**: 是否测试了边界情况？

```tsx
// ✅ 测试示例
describe('MyDialog', () => {
  it('应该正确居中显示', async () => {
    render(<MyDialog open={true} />);
    const dialog = screen.getByRole('dialog');
    
    // 验证定位
    expect(dialog).toHaveClass('unified-dialog');
    
    // 验证居中
    const rect = dialog.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const expectedCenterX = window.innerWidth / 2;
    expect(Math.abs(centerX - expectedCenterX)).toBeLessThan(5);
  });
});
```

## 🔍 审查工具

### 1. 自动化检查脚本
```bash
# 运行ESLint检查
npm run lint:dialog

# 运行类型检查
npm run type-check

# 运行测试
npm run test:dialog-positioning
```

### 2. 手动检查工具
```javascript
// 浏览器控制台检查脚本
function checkDialogPositioning() {
  const dialogs = document.querySelectorAll('[role="dialog"]');
  
  dialogs.forEach((dialog, index) => {
    const rect = dialog.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const expectedCenterX = window.innerWidth / 2;
    const expectedCenterY = window.innerHeight / 2;
    
    console.log(`Dialog ${index + 1}:`, {
      isCorrectlyCentered: 
        Math.abs(centerX - expectedCenterX) < 5 && 
        Math.abs(centerY - expectedCenterY) < 5,
      actualCenter: { x: centerX, y: centerY },
      expectedCenter: { x: expectedCenterX, y: expectedCenterY },
      deviation: { 
        x: Math.abs(centerX - expectedCenterX), 
        y: Math.abs(centerY - expectedCenterY) 
      }
    });
  });
}

// 使用方法：在浏览器控制台运行
checkDialogPositioning();
```

## 📝 审查报告模板

```markdown
## Dialog代码审查报告

### 基本信息
- **PR编号**: #123
- **审查者**: [姓名]
- **审查日期**: [日期]
- **修改文件**: [文件列表]

### 审查结果
#### ✅ 通过项
- [x] 使用统一Dialog组件
- [x] 正确的TypeScript类型
- [x] 无内联定位样式

#### ❌ 需要修改项
- [ ] 存在硬编码颜色值 (文件: xxx.tsx, 行: 25)
- [ ] 缺少ARIA标签 (文件: yyy.tsx, 行: 40)

#### ⚠️ 建议改进项
- 建议使用设计令牌替代硬编码值
- 建议添加单元测试

### 总体评价
- **代码质量**: 良好/需要改进/不合格
- **是否批准**: 是/否
- **附加说明**: [详细说明]
```

## 🚨 常见问题与解决方案

### 1. 定位问题
**问题**: Dialog不在屏幕中央
**检查**: CSS选择器、transform属性、z-index
**解决**: 使用UnifiedDialog组件，确保CSS类正确

### 2. 样式冲突
**问题**: Dialog样式异常
**检查**: CSS优先级、!important使用、主题兼容性
**解决**: 调整CSS层级，使用设计令牌

### 3. 类型错误
**问题**: TypeScript编译失败
**检查**: Props类型、禁止属性使用
**解决**: 使用StrictDialogProps，移除禁止属性

### 4. 性能问题
**问题**: Dialog打开缓慢
**检查**: 组件大小、懒加载、重渲染
**解决**: 实施代码分割，优化渲染逻辑

## 📚 参考资源

- [统一样式系统策略](./unified-style-strategy.md)
- [Dialog组件API文档](../src/components/ui/UnifiedDialog/README.md)
- [设计令牌文档](../src/styles/design-tokens.css)
- [TypeScript类型定义](../src/types/dialog-types.ts)
