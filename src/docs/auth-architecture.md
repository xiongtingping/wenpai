# 🔧 统一认证系统架构文档

## 📋 架构概览

本文档描述了经过系统性优化后的统一认证架构，确保整个应用的认证系统具有清晰的职责分工、统一的入口和配置管理。

## 🏗️ 架构层级

### 1. 配置层 (Config Layer)
```
src/config/authing.ts
├── 环境变量管理
├── Authing SDK配置
├── 开发/生产环境隔离
└── 配置验证和错误处理
```

### 2. 服务层 (Service Layer)
```
src/services/authService.ts
├── OAuth2授权码交换
├── Token管理和刷新
├── 用户信息CRUD
├── 权限验证逻辑
└── 与Authing后端API交互
```

### 3. 上下文层 (Context Layer)
```
src/contexts/UnifiedAuthContext.tsx
├── 前端状态管理
├── Guard和Web SDK集成
├── 认证事件处理
├── 用户状态持久化
└── 错误处理和重试
```

### 4. Hook层 (Hook Layer)
```
src/hooks/
├── useAuth.ts          # 统一认证入口
├── usePermission.ts    # 统一权限管理
├── useAuthStatus.ts    # 认证状态检查
└── useHasRole.ts       # 角色验证
```

### 5. 组件层 (Component Layer)
```
src/components/auth/
├── 核心组件
│   ├── UnifiedPermissionGuard.tsx  # 主要权限控制
│   ├── PermissionGuard.tsx         # 简化权限控制
│   ├── UserAvatar.tsx              # 用户信息展示
│   └── AuthingGuard.tsx            # 登录弹窗
├── 权限组件
│   ├── PermissionLockedButton.tsx
│   ├── PermissionLockedElement.tsx
│   ├── PermissionUpgradeCard.tsx
│   └── PermissionUpgradeDialog.tsx
└── 订阅组件
    ├── SubscriptionGuard.tsx
    ├── FeatureZoneGuard.tsx
    └── UpgradePromptCard.tsx
```

### 6. 页面层 (Page Layer)
```
src/pages/
├── LoginPage.tsx       # 登录页面
├── CallbackPage.tsx    # OAuth2回调处理
├── ProfilePage.tsx     # 个人中心
└── SettingsPage.tsx    # 用户设置
```

## 🎯 职责分工

### SDK分工
- **@authing/guard**: 负责登录弹窗UI和用户交互
- **@authing/web**: 负责OAuth2回调处理和token管理

### 组件分工
- **UnifiedAuthContext**: 核心认证逻辑和状态管理
- **useAuth**: 统一入口和接口标准化
- **usePermission**: 权限检查和角色验证
- **AuthService**: 后端API交互和数据处理

## 🔄 认证流程

### 登录流程
1. 用户点击登录按钮
2. useAuth.login() 调用 UnifiedAuthContext.login()
3. UnifiedAuthContext 显示 @authing/guard 弹窗
4. 用户完成认证后，Guard触发login事件
5. UnifiedAuthContext 使用 @authing/web 处理回调
6. AuthService 交换授权码获取token
7. 更新用户状态并持久化存储

### 权限检查流程
1. 组件使用 usePermission(requiredPermissions)
2. usePermission 调用 UnifiedAuthContext.hasPermission()
3. 检查用户角色、订阅等级、自定义权限
4. 返回权限检查结果和建议操作
5. 组件根据结果显示内容或升级提示

## 📦 统一入口

### 认证入口
```typescript
import { useAuth } from '@/hooks/useAuth';

const { user, isAuthenticated, login, logout } = useAuth();
```

### 权限入口
```typescript
import { usePermission } from '@/hooks/usePermission';

const { hasPermission, needsUpgrade } = usePermission(['feature:premium']);
```

### 组件入口
```typescript
import { 
  UnifiedPermissionGuard, 
  PermissionGuard, 
  UserAvatar 
} from '@/components/auth';
```

## 🔧 配置管理

### 环境变量
```bash
# 生产环境
VITE_AUTHING_APP_ID=68823897631e1ef8ff3720b2
VITE_AUTHING_DOMAIN=rzcswqs4sq0f.authing.cn

# 开发环境
VITE_AUTHING_APP_ID=dev_app_id
VITE_AUTHING_DOMAIN=dev.authing.cn
```

### 配置验证
- 启动时自动验证必需的环境变量
- 开发环境提供配置缺失的友好提示
- 生产环境确保配置完整性

## 🚀 最佳实践

### 1. 组件使用
```typescript
// ✅ 推荐：页面级权限控制
<UnifiedPermissionGuard required="feature:premium">
  <PremiumPage />
</UnifiedPermissionGuard>

// ✅ 推荐：组件级权限控制
<PermissionGuard required="auth:required">
  <UserOnlyComponent />
</PermissionGuard>
```

### 2. Hook使用
```typescript
// ✅ 推荐：统一认证入口
const { user, isAuthenticated, login } = useAuth();

// ✅ 推荐：权限检查
const { hasPermission, needsUpgrade } = usePermission('feature:upload');
```

### 3. 错误处理
```typescript
// ✅ 推荐：优雅的错误处理
const { error, loading } = useAuth();

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
```

## 🔒 安全考虑

1. **Token安全**: 使用httpOnly cookie存储敏感token
2. **权限验证**: 前后端双重权限验证
3. **CSRF防护**: 使用CSRF token防护
4. **XSS防护**: 严格的输入验证和输出编码
5. **会话管理**: 自动token刷新和过期处理

## 📈 性能优化

1. **懒加载**: 认证组件按需加载
2. **缓存策略**: 用户信息和权限缓存
3. **批量请求**: 权限检查批量处理
4. **状态优化**: 使用useMemo和useCallback优化渲染

## 🧪 测试策略

1. **单元测试**: Hook和工具函数测试
2. **集成测试**: 认证流程端到端测试
3. **权限测试**: 各种权限场景的覆盖测试
4. **性能测试**: 认证组件的性能基准测试
