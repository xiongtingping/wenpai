# 权限守卫系统实施指南

## 🎯 概述

本指南详细说明了如何正确使用和扩展文派平台的权限守卫系统，确保所有开发人员能够一致地实施权限控制。

---

## 📚 核心概念

### 权限类型层次

```typescript
// 32种标准权限类型
type ExtendedPermissionType = 
  | 'auth:required'           // 基础认证
  | 'tier:trial'              // 订阅等级
  | 'tier:pro'               
  | 'tier:premium'           
  | 'feature:creative-studio' // 功能权限
  | 'feature:brand-library'  
  | 'model:trial'            // 模型权限
  | 'model:pro'              
  | 'theme:basic'            // 主题权限
  // ... 更多权限类型
```

### 权限等级继承

```
trial (体验版)
  ↓ 包含所有trial权限
pro (专业版)  
  ↓ 包含所有trial + pro权限
premium (高级版)
  ↓ 包含所有权限
```

---

## 🛠️ 基础使用

### 1. 组件级权限保护

#### 标准权限守卫
```tsx
import { EnhancedUnifiedPermissionGuard } from '@/components/auth/EnhancedUnifiedPermissionGuard';

function MyFeature() {
  return (
    <EnhancedUnifiedPermissionGuard
      requiredPermission="feature:creative-studio"
      mode="overlay"
      overlayIntensity="medium"
    >
      <div>受保护的功能内容</div>
    </EnhancedUnifiedPermissionGuard>
  );
}
```

#### 预览模式（推荐用于付费功能）
```tsx
<EnhancedUnifiedPermissionGuard
  requiredPermission="feature:brand-library"
  mode="preview"
  previewMessage="品牌库功能仅限专业版及以上用户使用。体验版用户可以查看但无法编辑。"
>
  <BrandLibraryContent />
</EnhancedUnifiedPermissionGuard>
```

### 2. 按钮级权限保护

```tsx
import { PermissionLockedButton } from '@/components/auth/PermissionLockedButton';

function ActionButton() {
  return (
    <PermissionLockedButton
      requiredPermission="feature:advanced-models"
      variant="default"
      size="sm"
      onClick={handleAdvancedAction}
    >
      使用高级模型
    </PermissionLockedButton>
  );
}
```

### 3. 编程式权限检查

#### 基础权限检查
```tsx
import { useUnifiedPermissionCheck } from '@/services/unifiedPermissionService';

function MyComponent() {
  const { user } = useAuth();
  const permissionResult = useUnifiedPermissionCheck(user, 'feature:creative-studio');
  
  if (!permissionResult.hasPermission) {
    return <UpgradePrompt />;
  }
  
  return <FeatureContent />;
}
```

#### 增强权限检查（包含服务器验证）
```tsx
import { useEnhancedPermissionCheck } from '@/services/unifiedPermissionService';

function SecureComponent() {
  const { user } = useAuth();
  const permissionResult = useEnhancedPermissionCheck(
    user, 
    'feature:brand-library',
    true // 启用服务器端验证
  );
  
  if (!permissionResult.hasPermission) {
    return <AccessDenied />;
  }
  
  // serverVerified 为 true 表示已通过服务器验证
  return (
    <div>
      {permissionResult.serverVerified && <TrustedBadge />}
      <FeatureContent />
    </div>
  );
}
```

---

## 🔐 安全最佳实践

### 1. 关键操作必须使用服务器验证

```tsx
import { EnhancedUnifiedPermissionService } from '@/services/unifiedPermissionService';

async function handleCriticalAction() {
  const { user } = useAuth();
  
  // 🔒 关键操作必须通过服务器验证
  const verification = await EnhancedUnifiedPermissionService.checkSecurePermissions(
    user,
    ['feature:brand-library', 'tier:premium']
  );
  
  if (!verification.success) {
    toast.error(verification.error);
    return;
  }
  
  // 执行关键操作
  await performCriticalAction();
}
```

### 2. 避免的错误做法

#### ❌ 错误：仅依赖前端权限检查
```tsx
// 🚫 不安全 - 可以被绕过
function handlePayment() {
  if (user.tier === 'premium') {
    processPayment();
  }
}
```

#### ✅ 正确：双重验证
```tsx
// ✅ 安全 - 双重验证
async function handlePayment() {
  const verification = await EnhancedUnifiedPermissionService.checkSecurePermissions(
    user,
    ['tier:premium']
  );
  
  if (verification.success) {
    await processPayment(); // 后端也会再次验证
  }
}
```

### 3. 权限检查性能优化

#### 使用缓存
```tsx
import { ServerPermissionService } from '@/services/serverPermissionService';

// 权限结果会自动缓存5分钟
const result = await ServerPermissionService.verifyPermission('feature:creative-studio');

// 强制刷新缓存
const freshResult = await ServerPermissionService.verifyPermission(
  'feature:creative-studio',
  true // forceRefresh
);
```

#### 批量权限检查
```tsx
// 一次检查多个权限，减少网络请求
const results = await ServerPermissionService.verifyPermissions([
  'feature:creative-studio',
  'feature:brand-library',
  'model:premium'
]);
```

---

## 🚀 高级用法

### 1. 自定义权限检查逻辑

```tsx
import { UnifiedPermissionService } from '@/services/unifiedPermissionService';

// 扩展权限服务
class CustomPermissionService extends UnifiedPermissionService {
  static checkBusinessLogicPermission(user: SessionUserInfo, context: any): boolean {
    // 自定义业务逻辑
    if (context.isWeekend && user.tier === 'trial') {
      return false; // 周末限制体验版用户
    }
    
    return this.checkPermission(user, 'feature:creative-studio').hasPermission;
  }
}
```

### 2. 动态权限配置

```tsx
// 运行时添加新的权限类型
const newPermissionConfig = {
  'feature:new-ai-model': {
    name: '新AI模型',
    description: '访问最新发布的AI模型',
    requiredTier: 'premium',
    check: (user) => user.tier === 'premium' && user.betaAccess,
    redirectUrl: '/payment',
    category: 'feature',
    priority: 'high'
  }
};

// 注册新权限（如果支持动态扩展）
UnifiedPermissionService.registerPermission(newPermissionConfig);
```

### 3. 权限状态监听

```tsx
import { SecureUserStateService } from '@/services/secureUserStateService';

function usePermissionMonitor() {
  const [permissionStatus, setPermissionStatus] = useState(null);
  
  useEffect(() => {
    const checkPermissionStatus = () => {
      const stats = SecureUserStateService.getStateStats();
      setPermissionStatus(stats);
    };
    
    // 定期检查权限状态
    const interval = setInterval(checkPermissionStatus, 60000);
    checkPermissionStatus();
    
    return () => clearInterval(interval);
  }, []);
  
  return permissionStatus;
}
```

---

## 🛡️ 安全开发规范

### 1. 代码审查清单

在提交涉及权限的代码时，请确认：

- [ ] 🔒 **关键操作使用服务器端验证**
- [ ] 🚫 **没有硬编码权限绕过逻辑**
- [ ] 📱 **前端权限检查仅用于用户体验优化**
- [ ] 🔐 **敏感数据不在客户端存储**
- [ ] 📝 **权限变更有对应的测试用例**

### 2. 环境配置要求

#### 开发环境
```bash
# .env.development
VITE_ENABLE_PERMISSION_DEBUG=true
VITE_PERMISSION_API_ENDPOINT=http://localhost:5173/.netlify/functions
```

#### 生产环境
```bash
# .env.production
VITE_ENABLE_PERMISSION_DEBUG=false
VITE_PERMISSION_API_ENDPOINT=https://app.wenpai.xyz/.netlify/functions
```

### 3. 测试指南

#### 单元测试示例
```tsx
import { UnifiedPermissionService } from '@/services/unifiedPermissionService';

describe('权限检查', () => {
  test('专业版用户可以访问创意工作室', () => {
    const proUser = { tier: 'pro', permissions: ['feature:creative-studio'] };
    const result = UnifiedPermissionService.checkPermission(proUser, 'feature:creative-studio');
    
    expect(result.hasPermission).toBe(true);
  });
  
  test('体验版用户无法访问品牌库', () => {
    const trialUser = { tier: 'trial', permissions: [] };
    const result = UnifiedPermissionService.checkPermission(trialUser, 'feature:brand-library');
    
    expect(result.hasPermission).toBe(false);
    expect(result.suggestedAction).toBe('upgrade');
  });
});
```

#### 集成测试
```tsx
import { ServerPermissionService } from '@/services/serverPermissionService';

describe('服务器端权限验证', () => {
  test('API返回正确的权限状态', async () => {
    const mockToken = 'valid-token';
    const result = await ServerPermissionService.verifyPermission('feature:brand-library');
    
    expect(result).toBeTruthy();
    expect(result.hasPermission).toBeDefined();
    expect(result.userTier).toBeDefined();
  });
});
```

---

## 📊 监控和调试

### 1. 权限检查日志

```tsx
// 开发环境下启用详细日志
if (import.meta.env.VITE_ENABLE_PERMISSION_DEBUG) {
  console.log('🔍 权限检查:', {
    user: user.id,
    permission: permissionType,
    result: hasPermission,
    reason: checkResult.reason
  });
}
```

### 2. 性能监控

```tsx
import { performance } from 'perf_hooks';

async function monitoredPermissionCheck(permission: string) {
  const start = performance.now();
  
  const result = await ServerPermissionService.verifyPermission(permission);
  
  const duration = performance.now() - start;
  
  // 记录性能指标
  analytics.track('permission_check_performance', {
    permission,
    duration,
    cache_hit: result.fromCache
  });
  
  return result;
}
```

### 3. 错误处理

```tsx
async function safePermissionCheck(permission: string) {
  try {
    return await ServerPermissionService.verifyPermission(permission);
  } catch (error) {
    // 记录错误但不阻断用户体验
    console.error('权限检查失败:', error);
    
    // 降级为前端检查
    return UnifiedPermissionService.checkPermission(user, permission);
  }
}
```

---

## 🔄 迁移指南

### 从旧权限系统迁移

#### 1. 识别现有权限检查
```bash
# 查找所有权限检查代码
grep -r "hasPermission\|checkPermission" src/
```

#### 2. 替换为新API
```tsx
// 旧方式
if (user.hasPermission('premium_feature')) {
  // ...
}

// 新方式
const result = UnifiedPermissionService.checkPermission(user, 'feature:brand-library');
if (result.hasPermission) {
  // ...
}
```

#### 3. 添加权限守卫组件
```tsx
// 包装现有组件
<EnhancedUnifiedPermissionGuard requiredPermission="feature:creative-studio">
  <ExistingPremiumFeature />
</EnhancedUnifiedPermissionGuard>
```

---

## 📋 常见问题

### Q: 如何添加新的权限类型？

A: 在 `unifiedPermissionService.ts` 中的 `UNIFIED_PERMISSION_CONFIGS` 添加配置：

```typescript
export const UNIFIED_PERMISSION_CONFIGS = {
  // ... 现有配置
  'feature:new-feature': {
    name: '新功能',
    description: '新功能描述',
    requiredTier: 'pro',
    check: (user) => getUserTier(user) >= 'pro',
    redirectUrl: '/payment',
    category: 'feature',
    priority: 'medium'
  }
};
```

### Q: 如何处理权限检查失败？

A: 根据 `suggestedAction` 字段处理：

```tsx
const result = UnifiedPermissionService.checkPermission(user, permission);

switch (result.suggestedAction) {
  case 'login':
    redirectToLogin();
    break;
  case 'upgrade':
    showUpgradeDialog(result.upgradeTarget);
    break;
  default:
    // 其他处理逻辑
}
```

### Q: 如何优化权限检查性能？

A: 使用以下策略：

1. **启用缓存**: 服务器验证结果自动缓存5分钟
2. **批量检查**: 一次检查多个权限
3. **智能预加载**: 在用户可能需要时提前检查权限
4. **降级策略**: 网络错误时使用前端检查

---

## 📞 支持和帮助

- **技术文档**: [内部文档链接]
- **API参考**: [API文档链接]  
- **问题反馈**: tech@wenpai.xyz
- **安全报告**: security@wenpai.xyz

---

*本指南持续更新，如有任何问题或改进建议，请联系开发团队。*