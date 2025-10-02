# Netlify Functions 部署指南

> 📅 **创建日期**: 2025-10-02
> 🚀 **状态**: 已配置完成，可部署
> ⚡ **平台**: Netlify Functions

---

## 🎯 完成情况

### ✅ 已完成配置

| 项目 | 状态 | 详情 |
|------|------|------|
| Functions目录 | ✅ | `netlify/functions/` |
| 权限验证API | ✅ | `netlify/functions/permissions/verify.ts` |
| 支付回调API | ✅ | `netlify/functions/webhooks/payment-callback.ts` |
| netlify.toml配置 | ✅ | API路由重定向已添加 |
| 环境变量 | ✅ | 生产/预览/开发环境都已配置 |
| Netlify CLI | ✅ | 已安装 |

---

## 📂 项目结构

```
wenpai/
├── netlify/
│   └── functions/
│       ├── permissions/
│       │   └── verify.ts          # 权限验证API
│       └── webhooks/
│           └── payment-callback.ts # 支付回调API
├── src/                            # 前端代码
├── netlify.toml                    # Netlify配置
└── package.json
```

---

## 🚀 本地开发测试

### 1. 启动Netlify Dev环境

```bash
# 使用Netlify CLI启动本地开发
netlify dev
```

这将启动：
- 前端开发服务器（Vite）: `http://localhost:8888`
- Functions本地模拟器

### 2. 测试API端点

```bash
# 测试权限验证
curl -X POST http://localhost:8888/.netlify/functions/permissions/verify \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "00000000-0000-0000-0000-000000000001",
    "permission": "tier:pro"
  }'

# 测试支付回调（健康检查）
curl http://localhost:8888/.netlify/functions/webhooks/payment-callback
```

### 3. 查看Functions日志

```bash
# Netlify Dev会实时显示函数执行日志
# 查看控制台输出了解API调用情况
```

---

## 📦 部署到Netlify

### 方式1: 通过Netlify CLI

```bash
# 1. 登录Netlify
netlify login

# 2. 初始化站点（如果还没有）
netlify init

# 3. 部署到生产环境
netlify deploy --prod

# 或先部署到预览环境测试
netlify deploy
```

### 方式2: 通过Git推送（推荐）

```bash
# 1. 提交代码
git add netlify/functions netlify.toml
git commit -m "feat: 添加订阅权限系统Netlify Functions"

# 2. 推送到GitHub
git push origin main

# Netlify会自动检测推送并开始构建部署
```

---

## 🔧 环境变量配置

### Netlify Dashboard配置

访问: **Site settings** → **Environment variables**

需要配置的变量（如果还未在netlify.toml中配置）：

```bash
# Supabase配置
VITE_SUPABASE_URL=https://weizkydylskcwgnaieqy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc... (你的Anon Key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (你的Service Role Key)

# 权限系统配置
PERMISSION_CACHE_TTL=300000
PERMISSION_CACHE_MAX_SIZE=200
CRON_SECRET=wenpai_subscription_cron_secret_2025_v1_secure_key
```

**注意**: netlify.toml中已经配置了这些变量，无需再次在Dashboard添加（除非需要覆盖）。

---

## 🌐 API端点URL

部署完成后，API可通过以下URL访问：

### 生产环境
```
https://www.wenpai.xyz/api/permissions/verify
https://www.wenpai.xyz/api/webhooks/payment-callback
```

### 预览部署
```
https://deploy-preview-{PR-NUMBER}--wenpai.netlify.app/api/permissions/verify
```

---

## 🧪 部署后验证

### 1. 测试权限验证API

```bash
# Trial用户访问Pro功能
curl -X POST https://www.wenpai.xyz/api/permissions/verify \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "00000000-0000-0000-0000-000000000001",
    "permission": "tier:pro"
  }'

# 预期响应
{
  "success": true,
  "hasPermission": false,
  "userTier": "trial",
  "requiredTier": "pro",
  "reason": "需要 pro 或更高等级"
}
```

### 2. 测试支付回调健康检查

```bash
curl https://www.wenpai.xyz/api/webhooks/payment-callback

# 预期响应
{
  "status": "ok",
  "service": "payment-callback",
  "version": "1.0.0",
  "timestamp": "..."
}
```

### 3. 查看Functions日志

访问: **Netlify Dashboard** → **Functions** → 选择函数 → **Function log**

---

## 📊 性能优化

### 1. 冷启动优化

Netlify Functions使用按需启动，首次调用可能有100-500ms冷启动时间。

**优化措施**:
- 使用轻量级依赖
- 避免大型库导入
- 考虑使用Netlify Edge Functions（更快）

### 2. 并发限制

免费计划:
- 125K 请求/月
- 100小时运行时间

Pro计划:
- 无限请求
- 无限运行时间

---

## 🔒 安全配置

### 1. 环境变量保护

- ✅ `SUPABASE_SERVICE_ROLE_KEY` 仅在服务器端使用
- ✅ 不会暴露到前端代码
- ✅ Netlify自动加密存储

### 2. CORS配置

已在Functions中配置：
```typescript
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};
```

**生产建议**: 将 `'*'` 改为你的域名：
```typescript
'Access-Control-Allow-Origin': 'https://www.wenpai.xyz'
```

### 3. 请求验证

支付回调应添加签名验证：
```typescript
// TODO: 验证支付平台回调签名
const signature = event.headers['x-payment-signature'];
// 验证逻辑...
```

---

## 🐛 故障排查

### 问题1: Functions返回404

**原因**:
- Functions未正确部署
- 路由配置错误

**解决方案**:
```bash
# 检查Functions部署状态
netlify functions:list

# 重新部署
netlify deploy --prod
```

### 问题2: 环境变量未生效

**原因**:
- 变量未在Netlify Dashboard配置
- 变量名拼写错误

**解决方案**:
```bash
# 检查环境变量
netlify env:list

# 设置环境变量
netlify env:set VARIABLE_NAME "value"
```

### 问题3: Supabase连接失败

**检查**:
1. `VITE_SUPABASE_URL` 是否正确
2. `SUPABASE_SERVICE_ROLE_KEY` 是否有效
3. Supabase RLS策略是否允许service_role访问

**验证**:
```bash
# 在本地测试Supabase连接
netlify dev
# 调用API观察日志
```

---

## 📈 监控和日志

### 1. Functions日志

访问: **Netlify Dashboard** → **Functions** → 选择函数 → **Recent invocations**

### 2. 实时日志流

```bash
# 使用Netlify CLI查看实时日志
netlify functions:invoke permissions/verify --identity
```

### 3. 添加日志

在Functions代码中：
```typescript
console.log('[Payment Callback] Processing:', {
  userId: callbackData.userId,
  amount: callbackData.amount
});
```

---

## 🎯 下一步优化

### 1. 添加定时任务

Netlify不直接支持Cron，需要使用外部服务：

**选项A**: 使用Netlify Scheduled Functions (Blobs)
**选项B**: 使用外部Cron服务（cron-job.org、EasyCron）

示例配置:
```bash
# 使用外部Cron调用Functions
# 每天02:00执行
0 2 * * * curl -X POST https://www.wenpai.xyz/api/cron/check-expired
```

### 2. 添加缓存层

使用Netlify Blobs或Redis：
```typescript
import { getStore } from '@netlify/blobs';

const cache = getStore('permission-cache');
await cache.set('user:123', permissionData, { ttl: 300 });
```

### 3. 升级到Edge Functions

更快的响应速度（全球CDN边缘节点）：
```bash
# 迁移到Edge Functions
mv netlify/functions/permissions netlify/edge-functions/permissions
```

---

## 📚 相关文档

- [Netlify Functions文档](https://docs.netlify.com/functions/overview/)
- [Netlify环境变量](https://docs.netlify.com/environment-variables/overview/)
- [Netlify部署指南](https://docs.netlify.com/site-deploys/overview/)
- [订阅系统完成总结](./SUBSCRIPTION_SYSTEM_COMPLETION_SUMMARY.md)

---

## ✅ 部署检查清单

部署前确认：

- [ ] netlify.toml配置正确
- [ ] Functions代码无语法错误
- [ ] 环境变量已配置
- [ ] 本地测试通过 (`netlify dev`)
- [ ] Git仓库已同步

部署后验证：

- [ ] API端点可访问
- [ ] 权限验证返回正确结果
- [ ] 支付回调健康检查通过
- [ ] Functions日志无错误
- [ ] 前端可正常调用API

---

**最后更新**: 2025-10-02
**文档版本**: 1.0.0
