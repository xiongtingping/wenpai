# 订阅权限系统部署指南

> 📅 **创建日期**: 2025-10-02
> ✅ **数据库状态**: 已完成
> 🚀 **下一步**: 环境配置和代码部署

---

## 📋 目录

1. [完成情况总览](#完成情况总览)
2. [环境变量配置](#环境变量配置)
3. [代码部署](#代码部署)
4. [验证测试](#验证测试)
5. [使用示例](#使用示例)
6. [常见问题](#常见问题)

---

## 完成情况总览

### ✅ 已完成

#### 1. 数据库迁移 (100%)

- ✅ **脚本1**: 表结构创建
  - `user_subscriptions` - 用户订阅主表
  - `subscription_history` - 订阅变更历史
  - `payment_records` - 支付记录
  - 触发器: 自动更新时间戳、记录订阅变更
  - 测试数据: 5个测试用户

- ✅ **脚本2**: RLS安全策略
  - 10条RLS策略 (用户只能访问自己的数据)
  - 权限授予 (service_role, authenticated)
  - 性能索引 (user_id, status, expires_at等)

#### 2. 前端组件 (100%)

| 文件 | 路径 | 状态 |
|------|------|------|
| CompactPermissionCard | `/src/components/auth/CompactPermissionCard.tsx` | ✅ 已创建 |
| OptimizedPermissionGuard | `/src/components/auth/OptimizedPermissionGuard.tsx` | ✅ 已创建 |
| Permission Guard样式 | `/src/styles/permission-guard.css` | ✅ 已创建 |

#### 3. 后端API (100%)

| 文件 | 路径 | 状态 |
|------|------|------|
| 权限验证 | `/src/api/permissions/verify.ts` | ✅ 已创建 |
| 支付回调 | `/src/api/webhooks/payment-callback.ts` | ✅ 已修复 |
| 缓存管理 | `/src/api/permissions/clear-cache.ts` | ✅ 已创建 |
| 定时任务1 | `/src/api/cron/check-expired-subscriptions.ts` | ✅ 已创建 |
| 定时任务2 | `/src/api/cron/process-auto-renewals.ts` | ✅ 已创建 |

#### 4. 服务层 (100%)

| 文件 | 路径 | 状态 |
|------|------|------|
| 权限缓存服务 | `/src/services/permissionCacheService.ts` | ✅ 已创建 |
| 订阅过期服务 | `/src/services/subscriptionExpiryService.ts` | ✅ 已创建 |

---

## 环境变量配置

### 1. 检查现有环境变量

确保你的 `.env` 文件中包含以下Supabase配置：

```bash
# Supabase配置
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # ⚠️ 重要: 用于支付回调
```

### 2. 添加权限系统配置

在 `.env` 中添加（可选）：

```bash
# 权限缓存配置
PERMISSION_CACHE_TTL=300000        # 5分钟
PERMISSION_CACHE_MAX_SIZE=200      # 最大200条

# Cron任务密钥 (Vercel Cron)
CRON_SECRET=your_random_secret_key  # 用于保护定时任务端点
```

### 3. 获取 Service Role Key

⚠️ **关键步骤**：

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **Settings** → **API**
4. 找到 **Service Role Key** (secret)
5. 复制并添加到 `.env` 文件

**为什么需要 Service Role Key？**
- 支付回调需要绕过RLS直接写入数据库
- 定时任务需要批量更新订阅状态

---

## 代码部署

### 方式1: 本地开发测试

```bash
# 1. 安装依赖（如果还没安装）
npm install

# 2. 启动开发服务器
npm run dev

# 3. 访问应用
open http://localhost:5173
```

### 方式2: 部署到Vercel

```bash
# 1. 安装Vercel CLI（如果还没安装）
npm install -g vercel

# 2. 登录Vercel
vercel login

# 3. 部署（首次）
vercel

# 4. 部署到生产环境
vercel --prod
```

#### 配置Vercel环境变量

在Vercel Dashboard中设置：

1. 进入项目设置
2. **Environment Variables**
3. 添加：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CRON_SECRET`

#### 配置Vercel Cron

在 `vercel.json` 中已配置（确认存在）：

```json
{
  "crons": [
    {
      "path": "/api/cron/check-expired-subscriptions",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/process-auto-renewals",
      "schedule": "0 3 * * *"
    }
  ]
}
```

---

## 验证测试

### 1. 测试数据库连接

在浏览器访问：

```
GET https://your-domain.com/api/webhooks/payment-callback
```

预期响应：
```json
{
  "status": "ok",
  "service": "payment-callback",
  "version": "1.0.0",
  "timestamp": "2025-10-02T..."
}
```

### 2. 测试权限验证API

使用测试用户ID（来自脚本1的测试数据）：

```bash
curl -X POST https://your-domain.com/api/permissions/verify \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "00000000-0000-0000-0000-000000000001",
    "permission": "tier:pro"
  }'
```

预期响应：
```json
{
  "success": true,
  "hasPermission": false,
  "userTier": "trial",
  "requiredTier": "pro",
  "reason": "需要 pro 或更高等级"
}
```

### 3. 测试前端组件

在任何React组件中使用：

```tsx
import { OptimizedPermissionGuard } from '@/components/auth/OptimizedPermissionGuard';

function MyFeature() {
  return (
    <OptimizedPermissionGuard
      requiredPermission="tier:pro"
      featureName="高级功能"
    >
      <div>这是一个Pro功能</div>
    </OptimizedPermissionGuard>
  );
}
```

**预期效果**：
- 免费用户看到模糊内容 + 升级卡片
- Pro用户正常显示内容

---

## 使用示例

### 示例1: 保护按钮

```tsx
import { OptimizedPermissionGuard } from '@/components/auth/OptimizedPermissionGuard';

<OptimizedPermissionGuard
  requiredPermission="feature:creative-studio"
  featureName="创意工作室"
  showOverlay={false}
>
  <button className="pro-button">
    打开创意工作室
  </button>
</OptimizedPermissionGuard>
```

### 示例2: 保护整个功能区

```tsx
<OptimizedPermissionGuard
  requiredPermission="tier:premium"
  featureName="品牌资源库"
  showOverlay={true}
>
  <div className="brand-library">
    <h2>品牌资源库</h2>
    <p>管理您的品牌素材...</p>
  </div>
</OptimizedPermissionGuard>
```

### 示例3: 后端权限验证

```typescript
// 在API路由中验证权限
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const { userId } = await request.json();

  // 调用权限验证API
  const response = await fetch('/api/permissions/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      permission: 'tier:pro'
    })
  });

  const { hasPermission } = await response.json();

  if (!hasPermission) {
    return Response.json({ error: '需要Pro版本' }, { status: 403 });
  }

  // 执行受保护的操作
  // ...
}
```

---

## 常见问题

### Q1: 用户升级后权限没有立即生效？

**原因**: 权限缓存（5分钟TTL）

**解决方案**:
1. 调用清除缓存API（支付回调已自动调用）：
   ```bash
   curl -X POST /api/permissions/clear-cache \
     -d '{"userId": "user-id"}'
   ```
2. 或等待5分钟自动过期

### Q2: 支付回调失败，订阅未更新？

**检查清单**:
1. ✅ `SUPABASE_SERVICE_ROLE_KEY` 是否正确配置
2. ✅ RLS策略中 `service_role` 是否有完整权限
3. ✅ 支付平台回调URL是否正确
4. ✅ 查看服务器日志中的 `[Payment Callback]` 信息

### Q3: 定时任务没有运行？

**Vercel部署检查**:
1. 确保 `vercel.json` 中配置了crons
2. 检查Vercel Dashboard → Settings → Crons
3. 定时任务需要 **生产环境** 才会执行（本地开发不会自动运行）

**手动触发测试**:
```bash
curl https://your-domain.com/api/cron/check-expired-subscriptions
```

### Q4: 前端组件无法导入？

**检查**:
1. 确认文件路径正确：
   - `/src/components/auth/OptimizedPermissionGuard.tsx`
   - `/src/components/auth/CompactPermissionCard.tsx`
2. 确认样式文件已导入：
   ```tsx
   import '@/styles/permission-guard.css';
   ```
3. 检查TypeScript类型定义：
   ```tsx
   import type { ExtendedPermissionType } from '@/types/permissions';
   import type { SubscriptionTier } from '@/types/subscription';
   ```

### Q5: 如何添加新的权限类型？

**步骤**:

1. 更新 `src/types/permissions.ts`：
   ```typescript
   export type ExtendedPermissionType =
     | 'auth:required'
     | 'tier:trial'
     | 'tier:pro'
     | 'tier:premium'
     | 'feature:your-new-feature'  // 新增
     | ...
   ```

2. 更新 `src/api/permissions/verify.ts` 中的权限映射：
   ```typescript
   const PERMISSION_TIER_MAP: Record<ExtendedPermissionType, SubscriptionTier> = {
     'feature:your-new-feature': 'pro',  // 新增
     ...
   }
   ```

3. 在组件中使用：
   ```tsx
   <OptimizedPermissionGuard
     requiredPermission="feature:your-new-feature"
     featureName="新功能名称"
   >
     <YourNewFeature />
   </OptimizedPermissionGuard>
   ```

---

## 🎉 部署完成检查清单

- [ ] 数据库迁移脚本1执行成功
- [ ] 数据库迁移脚本2执行成功
- [ ] 环境变量配置完整（包括SERVICE_ROLE_KEY）
- [ ] 代码部署到Vercel/本地
- [ ] 权限验证API测试通过
- [ ] 支付回调API端点可访问
- [ ] 前端组件正常显示
- [ ] 定时任务配置正确（生产环境）
- [ ] 支付平台回调URL已配置

---

## 📚 相关文档

- [订阅权限系统优化指南](./SUBSCRIPTION_PERMISSION_OPTIMIZATION_GUIDE.md) - 系统设计和架构
- [权限守卫使用示例](./docs/PERMISSION_GUARD_USAGE_EXAMPLES.md) - 组件详细用法
- [权限系统快速开始](./PERMISSION_SYSTEM_QUICK_START.md) - 3分钟快速上手
- [权限实施检查清单](./PERMISSION_IMPLEMENTATION_CHECKLIST.md) - 实施步骤清单

---

## 🆘 需要帮助？

遇到问题？按照以下步骤：

1. **查看服务器日志**:
   - Vercel: Dashboard → Deployments → 选择部署 → Logs
   - 本地: 终端输出

2. **检查Supabase日志**:
   - Dashboard → Logs → 选择对应的表/函数

3. **验证测试数据**:
   ```sql
   -- 在Supabase SQL编辑器中运行
   SELECT * FROM user_subscriptions;
   SELECT * FROM payment_records;
   ```

4. **清除所有缓存后重试**:
   ```bash
   curl -X DELETE /api/permissions/clear-cache
   ```

---

**最后更新**: 2025-10-02
**文档版本**: 1.0.0
