# 🔐 统一权限守卫系统

## 📋 概述

本系统提供了一套统一的权限守卫组件，用于简化权限管理和访问控制。所有守卫组件都基于 `UnifiedAuthContext` 进行认证状态管理。

## 🚀 快速开始

### 导入守卫组件

```typescript
import { 
  AuthGuard, 
  ProtectedRoute, 
  PermissionGuard, 
  PreviewGuard, 
  VIPGuard, 
  FeatureGuard 
} from '@/guards';
```

### 基础使用

```typescript
// 基础认证守卫
<AuthGuard>
  <ProtectedComponent />
</AuthGuard>

// 路由保护守卫
<ProtectedRoute>
  <ProtectedComponent />
</ProtectedRoute>

// 权限检查守卫
<PermissionGuard requiredPermissions={['content:read']} requiredRoles={['admin']}>
  <ProtectedComponent />
</PermissionGuard>

// 功能预览守卫
<PreviewGuard 
  featureId="creative-studio" 
  featureName="创意魔方" 
  featureDescription="AI驱动的创意内容生成工具"
>
  <CreativeStudioPage />
</PreviewGuard>

// VIP功能守卫
<VIPGuard requiredLevel="pro">
  <VIPComponent />
</VIPGuard>

// 功能访问守卫
<FeatureGuard feature="creative-studio">
  <CreativeStudioPage />
</FeatureGuard>
```

## 🔧 守卫组件详解

### 1. AuthGuard - 基础认证守卫

**功能**: 检查用户是否已登录，未登录时重定向到登录页

**Props**:
- `requireAuth?: boolean` - 是否需要认证 (默认: true)
- `redirectTo?: string` - 未认证时重定向路径 (默认: '/login')
- `loadingComponent?: ReactNode` - 加载时显示的组件

**使用示例**:
```typescript
<AuthGuard redirectTo="/login">
  <Dashboard />
</AuthGuard>
```

### 2. ProtectedRoute - 路由保护守卫

**功能**: 保护路由，确保只有已登录用户可以访问

**Props**:
- `redirectTo?: string` - 未认证时重定向路径 (默认: '/login')
- `loadingComponent?: ReactNode` - 加载时显示的组件

**使用示例**:
```typescript
<ProtectedRoute>
  <UserProfile />
</ProtectedRoute>
```

### 3. PermissionGuard - 权限检查守卫

**功能**: 检查用户是否具有特定权限或角色

**Props**:
- `requiredPermissions?: string[]` - 需要的权限列表
- `requiredRoles?: string[]` - 需要的角色列表
- `redirectTo?: string` - 无权限时重定向路径
- `loadingComponent?: ReactNode` - 加载时显示的组件
- `noPermissionComponent?: ReactNode` - 无权限时显示的组件

**使用示例**:
```typescript
<PermissionGuard 
  requiredPermissions={['content:read', 'content:write']} 
  requiredRoles={['admin']}
>
  <AdminPanel />
</PermissionGuard>
```

### 4. PreviewGuard - 功能预览守卫

**功能**: 允许低版本用户预览功能界面，但添加透明遮罩层和升级提示

**Props**:
- `featureId: string` - 功能ID
- `featureName: string` - 功能名称
- `featureDescription: string` - 功能描述
- `allowClose?: boolean` - 是否允许关闭预览模式
- `onClose?: () => void` - 关闭回调

**使用示例**:
```typescript
<PreviewGuard 
  featureId="creative-studio" 
  featureName="创意魔方" 
  featureDescription="AI驱动的创意内容生成工具"
  allowClose={true}
>
  <CreativeStudioPage />
</PreviewGuard>
```

### 5. VIPGuard - VIP功能守卫

**功能**: 检查用户是否具有VIP权限

**Props**:
- `requiredLevel?: 'basic' | 'pro' | 'premium'` - 需要的VIP等级
- `fallback?: ReactNode` - 无权限时显示的组件
- `showUpgradePrompt?: boolean` - 是否显示升级提示

**使用示例**:
```typescript
<VIPGuard requiredLevel="pro">
  <ProFeature />
</VIPGuard>
```

### 6. FeatureGuard - 功能访问守卫

**功能**: 检查用户是否有权限使用特定功能

**Props**:
- `feature: string` - 功能标识
- `fallback?: ReactNode` - 无权限时显示的组件
- `showPermissionHint?: boolean` - 是否显示权限提示

**使用示例**:
```typescript
<FeatureGuard feature="creative-studio">
  <CreativeStudioPage />
</FeatureGuard>
```

## 🎯 嵌套使用

守卫组件支持嵌套使用，可以实现更细粒度的权限控制：

```typescript
<AuthGuard>
  <PermissionGuard requiredPermissions={['content:read']}>
    <VIPGuard requiredLevel="pro">
      <FeatureGuard feature="creative-studio">
        <CreativeStudioPage />
      </FeatureGuard>
    </VIPGuard>
  </PermissionGuard>
</AuthGuard>
```

## 📝 权限格式

### 权限格式
权限使用 `resource:action` 格式：
- `content:read` - 内容读取权限
- `content:write` - 内容写入权限
- `user:manage` - 用户管理权限
- `admin:all` - 管理员所有权限

### 角色格式
角色使用字符串标识：
- `admin` - 管理员
- `user` - 普通用户
- `vip` - VIP用户
- `premium` - 高级用户

## 🔄 迁移指南

### 从旧组件迁移

**旧方式**:
```typescript
import AuthGuard from '@/components/auth/AuthGuard';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
```

**新方式**:
```typescript
import { AuthGuard, ProtectedRoute } from '@/guards';
```

### 更新导入路径

在 `App.tsx` 和其他文件中更新导入：

```typescript
// 旧导入
import AuthGuard from '@/components/auth/AuthGuard';

// 新导入
import { AuthGuard } from '@/guards';
```

## 🎨 自定义样式

所有守卫组件都支持自定义样式和组件：

```typescript
<AuthGuard 
  loadingComponent={<CustomLoadingSpinner />}
  redirectTo="/custom-login"
>
  <Component />
</AuthGuard>
```

## 📊 性能优化

- 所有守卫组件都使用 React.memo 进行性能优化
- 权限检查结果会被缓存，避免重复检查
- 支持异步权限检查，不会阻塞UI渲染

## 🔒 安全特性

- 基于统一认证上下文，确保状态一致性
- 支持细粒度权限控制
- 提供完整的权限检查日志
- 支持权限降级和fallback机制 