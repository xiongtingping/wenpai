# 权限守卫使用示例

## 📚 目录

1. [基础用法](#基础用法)
2. [优化版组件](#优化版组件)
3. [按钮级权限控制](#按钮级权限控制)
4. [输入框权限控制](#输入框权限控制)
5. [Hook使用](#hook使用)
6. [后端API调用](#后端api调用)
7. [最佳实践](#最佳实践)

---

## 基础用法

### 1. 使用 UnifiedPermissionGuard 包裹整个功能区

```tsx
import { UnifiedPermissionGuard } from '@/components/auth/UnifiedPermissionGuard';

function CreativeStudioPage() {
  return (
    <UnifiedPermissionGuard
      requiredPermission="feature:creative-studio"
      featureName="创意魔方"
      description="AI驱动的创意内容生成工具"
      showOverlay={true}
      overlayOpacity={0.7}
    >
      <CreativeStudioContent />
    </UnifiedPermissionGuard>
  );
}
```

**效果**:
- ✅ 免费用户: 看到模糊的功能界面 + 升级提示
- ✅ Pro用户: 正常使用
- ✅ Premium用户: 正常使用

---

### 2. 使用优化版 OptimizedPermissionGuard (推荐)

```tsx
import { OptimizedPermissionGuard } from '@/components/auth/OptimizedPermissionGuard';

function BrandLibraryPage() {
  return (
    <OptimizedPermissionGuard
      requiredPermission="feature:brand-library"
      featureName="品牌库"
      description="企业级品牌资产管理系统"
      showOverlay={true}
    >
      <BrandLibraryContent />
    </OptimizedPermissionGuard>
  );
}
```

**优势**:
- ✨ 简洁的升级卡片 (替代完整定价表)
- ✨ 更强的模糊效果
- ✨ 更好的对比度
- ✨ 更快的加载速度

---

## 优化版组件

### CompactPermissionCard - 简洁升级提示

```tsx
import { CompactPermissionCard } from '@/components/auth/CompactPermissionCard';
import { useState } from 'react';

function CustomPermissionPrompt() {
  const [showCard, setShowCard] = useState(true);

  const handleUpgrade = () => {
    // 跳转到支付页面
    navigate('/payment-center');
  };

  if (!showCard) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      <CompactPermissionCard
        featureName="品牌库"
        description="企业级品牌资产管理系统"
        requiredTier="premium"
        onUpgrade={handleUpgrade}
        showDiscount={true}
        discountCountdown={1800} // 30分钟倒计时
      />
    </div>
  );
}
```

---

## 按钮级权限控制

### 1. 使用 PermissionLockedButton

```tsx
import { PermissionLockedButton } from '@/components/auth/PermissionLockedButton';

function FeaturePanel() {
  const handleGenerateContent = () => {
    // 生成内容逻辑
    console.log('生成中...');
  };

  return (
    <div>
      <PermissionLockedButton
        requiredTier="pro"
        featureName="AI内容生成"
        onClick={handleGenerateContent}
        variant="default"
        size="lg"
      >
        生成创意内容
      </PermissionLockedButton>
    </div>
  );
}
```

**效果**:
- ✅ 试用版用户: 显示锁图标 + 点击跳转升级页
- ✅ Pro/Premium用户: 正常执行操作

---

### 2. 使用 PermissionLockedIconButton

```tsx
import { PermissionLockedIconButton } from '@/components/auth/PermissionLockedButton';
import { Download } from 'lucide-react';

function ExportButton() {
  const handleExport = () => {
    // 导出逻辑
  };

  return (
    <PermissionLockedIconButton
      requiredTier="pro"
      featureName="导出功能"
      onClick={handleExport}
      size="icon"
    >
      <Download className="h-4 w-4" />
    </PermissionLockedIconButton>
  );
}
```

---

## 输入框权限控制

### 1. 使用 PermissionProtectedInput

```tsx
import { PermissionProtectedInput } from '@/components/auth/PermissionProtectedInput';

function BrandForm() {
  const [brandName, setBrandName] = useState('');

  return (
    <PermissionProtectedInput
      requiredTier="premium"
      featureName="品牌名称编辑"
      value={brandName}
      onChange={(e) => setBrandName(e.target.value)}
      placeholder="输入品牌名称"
    />
  );
}
```

---

### 2. 使用 PermissionProtectedSelect

```tsx
import { PermissionProtectedSelect } from '@/components/auth/PermissionProtectedInput';

function ModelSelector() {
  return (
    <PermissionProtectedSelect
      requiredTier="premium"
      featureName="高级AI模型"
      value={selectedModel}
      onValueChange={setSelectedModel}
    >
      <SelectTrigger>
        <SelectValue placeholder="选择AI模型" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="gpt-5">GPT-5 Chat Latest</SelectItem>
        <SelectItem value="claude-sonnet-4">Claude Sonnet 4</SelectItem>
      </SelectContent>
    </PermissionProtectedSelect>
  );
}
```

---

## Hook使用

### 1. useUnifiedPermission - 权限检查

```tsx
import { useUnifiedPermission } from '@/hooks/useUnifiedPermission';

function ConditionalFeature() {
  const { hasPermission, needsUpgrade, upgradeUrl } = useUnifiedPermission('tier:pro');

  if (needsUpgrade) {
    return (
      <div className="text-center">
        <p>此功能需要专业版</p>
        <Button onClick={() => navigate(upgradeUrl)}>
          升级解锁
        </Button>
      </div>
    );
  }

  return <PremiumFeature />;
}
```

---

### 2. useOptimizedPermission - 优化版Hook

```tsx
import { useOptimizedPermission } from '@/components/auth/OptimizedPermissionGuard';

function SmartButton() {
  const {
    hasPermission,
    userTier,
    requiredTier,
    needsUpgrade
  } = useOptimizedPermission('feature:brand-library');

  return (
    <Button
      onClick={hasPermission ? handleAction : handleUpgrade}
      variant={hasPermission ? 'default' : 'outline'}
      disabled={needsUpgrade}
    >
      {!hasPermission && <Lock className="mr-2" />}
      访问品牌库
      {needsUpgrade && <Badge>{requiredTier}专属</Badge>}
    </Button>
  );
}
```

---

### 3. usePermissionCache - 缓存Hook

```tsx
import { usePermissionCache } from '@/services/permissionCacheService';

function PermissionDashboard() {
  const cache = usePermissionCache();
  const stats = cache.getStats();

  return (
    <div>
      <h3>权限缓存统计</h3>
      <p>缓存大小: {stats.size}/{stats.maxSize}</p>
      <p>命中率: {stats.hitRate}</p>
      <p>命中次数: {stats.hitCount}</p>
      <p>未命中次数: {stats.missCount}</p>

      <Button onClick={() => cache.clearAll()}>
        清除缓存
      </Button>
    </div>
  );
}
```

---

## 后端API调用

### 1. 验证单个权限

```typescript
import { verifyPermission } from '@/services/serverPermissionService';

async function checkFeatureAccess() {
  try {
    const result = await verifyPermission('feature:brand-library');

    if (result.hasPermission) {
      console.log('权限验证通过');
      // 执行操作
    } else {
      console.log('权限不足:', result.reason);
      // 显示升级提示
    }
  } catch (error) {
    console.error('权限验证失败:', error);
  }
}
```

---

### 2. 批量验证权限

```typescript
import { verifyBatchPermissions } from '@/api/permissions/verify';

async function checkMultiplePermissions() {
  const permissions = [
    'feature:creative-studio',
    'feature:brand-library',
    'model:premium'
  ];

  const response = await fetch('/api/permissions/verify-batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.id,
      permissions
    })
  });

  const result = await response.json();

  if (result.allGranted) {
    console.log('所有权限验证通过');
  } else {
    console.log('缺少权限:', result.results.filter(r => !r.hasPermission));
  }
}
```

---

### 3. 带缓存的权限检查

```typescript
import { permissionCache } from '@/services/permissionCacheService';
import { UnifiedPermissionService } from '@/services/unifiedPermissionService';

async function checkPermissionWithCache(
  userId: string,
  permission: ExtendedPermissionType
) {
  // 1. 尝试从缓存获取
  const cached = permissionCache.getCached(userId, permission);
  if (cached) {
    console.log('使用缓存结果');
    return cached;
  }

  // 2. 执行实际检查
  const result = await UnifiedPermissionService.checkPermissionSecure(
    user,
    permission
  );

  // 3. 存入缓存
  permissionCache.setCached(userId, permission, result);

  return result;
}
```

---

## 最佳实践

### ✅ DO - 推荐做法

#### 1. 页面级权限控制
```tsx
// ✅ 好: 在页面根部使用权限守卫
function BrandLibraryPage() {
  return (
    <OptimizedPermissionGuard requiredPermission="feature:brand-library">
      <BrandLibraryContent />
    </OptimizedPermissionGuard>
  );
}
```

---

#### 2. 按钮级精细控制
```tsx
// ✅ 好: 对关键操作按钮添加权限
function ActionPanel() {
  return (
    <div>
      <Button onClick={handleView}>查看 (免费)</Button>

      <PermissionLockedButton
        requiredTier="pro"
        onClick={handleEdit}
      >
        编辑 (Pro)
      </PermissionLockedButton>

      <PermissionLockedButton
        requiredTier="premium"
        onClick={handleExport}
      >
        导出 (Premium)
      </PermissionLockedButton>
    </div>
  );
}
```

---

#### 3. 后端二次验证
```tsx
// ✅ 好: 前端+后端双重验证
async function saveData() {
  // 前端检查
  if (!hasPermission) {
    showUpgradePrompt();
    return;
  }

  // 后端验证
  const verified = await verifyPermission('feature:save');
  if (!verified.hasPermission) {
    showError('权限验证失败');
    return;
  }

  // 执行操作
  await api.saveData();
}
```

---

#### 4. 使用缓存减少查询
```tsx
// ✅ 好: 利用缓存提升性能
const { getCached, setCached } = usePermissionCache();

function checkPermission() {
  const cached = getCached(user.id, 'tier:pro');
  if (cached) return cached;

  const result = checkPermissionSync();
  setCached(user.id, 'tier:pro', result);
  return result;
}
```

---

### ❌ DON'T - 避免做法

#### 1. 只依赖前端验证
```tsx
// ❌ 差: 仅前端检查,容易绕过
function SaveButton() {
  if (userTier !== 'premium') {
    return <Button disabled>保存 (需要Premium)</Button>;
  }

  return <Button onClick={handleSave}>保存</Button>;
}
```

---

#### 2. 完全隐藏功能入口
```tsx
// ❌ 差: 免费用户完全看不到功能
function FeatureList() {
  return (
    <div>
      <FeatureCard title="全网雷达" />
      {/* ❌ 品牌库功能对免费用户完全隐藏 */}
      {userTier === 'premium' && <FeatureCard title="品牌库" />}
    </div>
  );
}

// ✅ 好: 显示但加锁
function FeatureList() {
  return (
    <div>
      <FeatureCard title="全网雷达" />
      <OptimizedPermissionGuard requiredPermission="feature:brand-library">
        <FeatureCard title="品牌库" />
      </OptimizedPermissionGuard>
    </div>
  );
}
```

---

#### 3. 每次渲染都查询权限
```tsx
// ❌ 差: 性能浪费
function MyComponent() {
  // 每次渲染都查询
  const hasPermission = checkPermission(user, 'tier:pro');

  return <Button disabled={!hasPermission}>操作</Button>;
}

// ✅ 好: 使用 useMemo 缓存
function MyComponent() {
  const hasPermission = useMemo(
    () => checkPermission(user, 'tier:pro'),
    [user]
  );

  return <Button disabled={!hasPermission}>操作</Button>;
}
```

---

#### 4. 重复的权限逻辑
```tsx
// ❌ 差: 到处重复权限检查代码
function Component1() {
  if (user?.tier === 'pro' || user?.tier === 'premium') {
    // ...
  }
}

function Component2() {
  if (user?.tier === 'pro' || user?.tier === 'premium') {
    // ...
  }
}

// ✅ 好: 使用统一Hook
function Component1() {
  const { hasPermission } = useUnifiedPermission('tier:pro');
  if (hasPermission) {
    // ...
  }
}
```

---

## 完整示例: 创意魔方页面

```tsx
import React from 'react';
import { OptimizedPermissionGuard } from '@/components/auth/OptimizedPermissionGuard';
import { PermissionLockedButton } from '@/components/auth/PermissionLockedButton';
import { useUnifiedPermission } from '@/hooks/useUnifiedPermission';

function CreativeStudioPage() {
  const { hasPermission } = useUnifiedPermission('feature:creative-studio');

  return (
    <div className="container mx-auto p-6">
      {/* 页面标题 - 始终可见 */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold">创意魔方</h1>
        <p className="text-muted-foreground">
          AI驱动的创意内容生成工具
          {!hasPermission && (
            <Badge className="ml-2" variant="secondary">Pro专属</Badge>
          )}
        </p>
      </header>

      {/* 主内容 - 权限守卫 */}
      <OptimizedPermissionGuard
        requiredPermission="feature:creative-studio"
        featureName="创意魔方"
        description="AI驱动的创意内容生成工具"
      >
        <div className="grid grid-cols-3 gap-4">
          {/* 内容生成区 */}
          <Card>
            <CardHeader>
              <CardTitle>内容生成</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea placeholder="输入创意主题..." />

              {/* 生成按钮 - 按钮级权限控制 */}
              <PermissionLockedButton
                requiredTier="pro"
                onClick={handleGenerate}
                className="mt-4"
              >
                生成内容
              </PermissionLockedButton>
            </CardContent>
          </Card>

          {/* 结果展示 */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>生成结果</CardTitle>
            </CardHeader>
            <CardContent>
              {/* 内容展示 */}
            </CardContent>
          </Card>
        </div>
      </OptimizedPermissionGuard>
    </div>
  );
}

export default CreativeStudioPage;
```

---

## 总结

### 核心原则
1. ✅ **可见但不可用**: 所有功能对免费用户可见
2. ✅ **明确的视觉提示**: 锁定图标 + 订阅标签
3. ✅ **顺畅的升级流程**: 一键跳转支付页
4. ✅ **前后端双重验证**: 安全可靠
5. ✅ **性能优化**: 缓存减少重复查询

### 推荐组件优先级
1. **页面级**: `OptimizedPermissionGuard` (简洁UI)
2. **按钮级**: `PermissionLockedButton` (精细控制)
3. **条件渲染**: `useUnifiedPermission` Hook (灵活性)
4. **后端验证**: `verifyPermission` API (安全性)

---

**创建时间**: 2025-10-02
**最后更新**: 2025-10-02
**版本**: 1.0.0
