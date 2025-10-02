# 订阅权限系统架构说明

> 📅 **创建日期**: 2025-10-02
> ⚠️ **重要**: 本项目为Vite + React前端应用，API需要独立部署

---

## 🏗️ 系统架构

### 当前项目类型
```
技术栈: Vite + React + TypeScript
类型: 纯前端单页应用 (SPA)
部署方式: 静态文件托管 (Vercel/Netlify/CDN)
```

### ⚠️ 关键发现

**本项目不支持服务器端API路由（如Next.js那样的 `/api/*` 路由）**

因此，我们创建的API文件需要通过以下方式之一部署：

---

## 📋 部署方案

### 方案1: Vercel Serverless Functions (推荐)

将API文件部署为Vercel Functions：

#### 1. 创建 `api/` 目录结构

```bash
项目根目录/
├── src/                 # 前端React代码
├── api/                 # 后端API Functions (新建)
│   ├── permissions/
│   │   └── verify.ts
│   ├── webhooks/
│   │   └── payment-callback.ts
│   └── cron/
│       ├── check-expired-subscriptions.ts
│       └── process-auto-renewals.ts
└── vercel.json
```

#### 2. 移动API文件

```bash
# 创建API目录
mkdir -p api/permissions api/webhooks api/cron

# 移动文件 (需要调整import路径)
mv src/api/permissions/verify.ts api/permissions/
mv src/api/webhooks/payment-callback.ts api/webhooks/
mv src/api/cron/*.ts api/cron/
```

#### 3. 调整 `vercel.json`

```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node@latest",
      "memory": 1024,
      "maxDuration": 10
    }
  },
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

#### 4. 部署

```bash
vercel --prod
```

API将可在以下地址访问：
- `https://your-domain.com/api/permissions/verify`
- `https://your-domain.com/api/webhooks/payment-callback`

---

### 方案2: 独立Node.js后端

创建独立的Express/Fastify服务器：

#### 1. 创建独立项目

```bash
mkdir wenpai-backend
cd wenpai-backend
npm init -y
npm install express @supabase/supabase-js cors dotenv
```

#### 2. 创建服务器

```javascript
// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 导入路由
const permissionsRouter = require('./routes/permissions');
const webhooksRouter = require('./routes/webhooks');

app.use('/api/permissions', permissionsRouter);
app.use('/api/webhooks', webhooksRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
```

#### 3. 部署到云服务

- Railway
- Render
- Fly.io
- Heroku

---

### 方案3: 直接使用Supabase Edge Functions

将API逻辑部署为Supabase Edge Functions：

```bash
# 安装Supabase CLI
npm install -g supabase

# 初始化函数
supabase functions new verify-permission
supabase functions new payment-callback

# 部署
supabase functions deploy verify-permission
supabase functions deploy payment-callback
```

---

## 🎯 当前可用功能

### ✅ 完全可用（前端组件）

1. **OptimizedPermissionGuard** - 权限守卫组件
2. **CompactPermissionCard** - 升级卡片
3. **PermissionDemo** - 演示页面
4. **CSS样式系统** - 完整视觉效果

**访问方式**:
```bash
http://localhost:5174/permission-demo
```

### ⚠️ 需要后端部署（API）

1. `/api/permissions/verify` - 权限验证
2. `/api/webhooks/payment-callback` - 支付回调
3. `/api/cron/*` - 定时任务

**当前状态**: 代码已完成，需要选择上述部署方案之一

---

## 📝 快速实施指南

### 选项A: 仅使用前端权限（最简单）

如果暂不需要后端验证，可以：

1. 使用前端组件进行UX控制
2. 依赖Supabase RLS进行数据库级安全
3. 跳过API层，直接从前端查询Supabase

**优点**:
- 立即可用
- 无需额外部署

**缺点**:
- 前端可被绕过（但RLS仍然保护数据）
- 无法处理支付回调
- 无自动化任务

### 选项B: 完整后端部署（推荐）

按**方案1**部署Vercel Functions：

1. 重组项目结构
2. 移动API文件到 `api/` 目录
3. 调整import路径
4. 部署到Vercel

**时间估算**: 30-60分钟

---

## 🧪 当前测试结果

运行 `./test-subscription-system.sh`：

```
✓ PASS: 支付回调健康检查 (前端显示，非实际API)
✗ FAIL: 权限验证API (404 - 需要后端部署)
✓ PASS: 演示页面
✓ PASS: 首页
```

**结论**: 前端组件完全正常，API需要独立部署。

---

## 📚 下一步建议

### 立即可做

1. **测试前端组件**
   ```bash
   open http://localhost:5174/permission-demo
   ```
   查看权限守卫、升级卡片等UI效果

2. **验证数据库**
   - 所有表和RLS策略已配置完成
   - 可以直接从Supabase Dashboard查询

### 准备生产部署

1. **选择部署方案**（推荐方案1: Vercel Functions）

2. **重组项目结构**
   ```bash
   # 执行重组脚本（需要创建）
   ./scripts/prepare-vercel-deploy.sh
   ```

3. **部署**
   ```bash
   vercel --prod
   ```

4. **配置回调URL**
   在支付平台设置：
   ```
   https://your-domain.com/api/webhooks/payment-callback
   ```

---

## 🔧 临时解决方案：前端直连Supabase

如果需要立即测试权限系统，可以修改前端组件直接查询Supabase：

```typescript
// src/hooks/usePermissionCheck.ts
import { createClient } from '@supabase/supabase-js';

export const usePermissionCheck = (permission: ExtendedPermissionType) => {
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  const checkPermission = async (userId: string) => {
    const { data } = await supabase
      .from('user_subscriptions')
      .select('tier, status, expires_at')
      .eq('user_id', userId)
      .single();

    // 权限检查逻辑...
  };

  return { checkPermission };
};
```

---

## 📊 文件清单

### ✅ 已创建并可用
- [x] 前端组件 (3个)
- [x] CSS样式
- [x] TypeScript类型
- [x] 演示页面
- [x] 数据库表和策略

### ⚠️ 已创建但需重新部署
- [ ] API路由 (当前在 `src/api/`，需移至 `api/`)
- [ ] 服务类 (可能需要重构为Edge Functions)
- [ ] Vercel配置 (需更新)

---

## 🆘 需要帮助？

1. **选择部署方案**
   如果不确定选哪个，推荐 **方案1: Vercel Functions**

2. **重组项目结构**
   我可以帮你创建迁移脚本

3. **调整import路径**
   API文件移动后需要更新导入

---

**最后更新**: 2025-10-02
**文档版本**: 1.0.0
