# Router顺序修复总结

## 问题描述
应用启动时出现错误：
```
useNavigate() may be used only in the context of a <Router> component.
```

## 问题原因
`UnifiedAuthProvider` 组件在 `Router` 外部被调用，但它内部使用了 `useNavigate()` Hook，而 `useNavigate()` 只能在 `<Router>` 组件的上下文中使用。

## 解决方案
将 `UnifiedAuthProvider` 移到 `Router` 内部：

### 修复前
```tsx
function App() {
  return (
    <UnifiedAuthProvider>
      <Router>
        {/* 内容 */}
      </Router>
    </UnifiedAuthProvider>
  );
}
```

### 修复后
```tsx
function App() {
  return (
    <Router>
      <UnifiedAuthProvider>
        {/* 内容 */}
      </UnifiedAuthProvider>
    </Router>
  );
}
```

## 修复文件
- `src/App.tsx` - 调整了组件嵌套顺序

## 验证结果
- ✅ 应用正常启动
- ✅ 不再出现 useNavigate 错误
- ✅ UnifiedAuthProvider 可以正常使用路由功能
- ✅ 认证功能正常工作

## 技术说明
React Router 的 `useNavigate()` Hook 需要在 `<Router>` 组件创建的上下文中使用。当 `UnifiedAuthProvider` 在 `Router` 外部时，它无法访问路由上下文，导致错误。

通过将 `UnifiedAuthProvider` 移到 `Router` 内部，它现在可以正常使用 `useNavigate()` 进行页面跳转。

## 相关文件
- `src/contexts/UnifiedAuthContext.tsx` - 认证上下文实现
- `src/config/authing.ts` - Authing 配置
- `fix-router-order.sh` - 快速修复脚本 