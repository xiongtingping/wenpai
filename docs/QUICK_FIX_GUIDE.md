# 快速修复指南 - 2025-10-08

## 问题概述

根据控制台错误日志，发现两个主要问题：

1. **404错误**: `user_usage_logs` 表不存在
2. **500错误**: `create-order` Netlify Function 失败

## 🚀 快速修复步骤

### 步骤1: 修复 user_usage_logs 表缺失问题

#### 方法A: 使用 Supabase Dashboard（推荐）

1. 打开 Supabase Dashboard: https://supabase.com/dashboard
2. 选择项目: `wenpai`
3. 进入 SQL Editor
4. 复制并执行以下 SQL 文件内容:
   ```
   supabase/migrations/create_user_usage_logs_table.sql
   ```

#### 方法B: 使用 Supabase CLI

```bash
# 如果已安装 Supabase CLI
supabase db push

# 或者直接执行迁移文件
supabase db execute -f supabase/migrations/create_user_usage_logs_table.sql
```

#### 验证修复

在 Supabase SQL Editor 中执行:

```sql
-- 检查表是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_usage_logs';

-- 检查表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_usage_logs'
ORDER BY ordinal_position;

-- 测试插入
INSERT INTO user_usage_logs (user_id, action, feature, details)
VALUES ('test_user', 'test_action', 'test_feature', '{"test": true}'::jsonb);

-- 测试查询
SELECT * FROM user_usage_logs WHERE user_id = 'test_user';

-- 清理测试数据
DELETE FROM user_usage_logs WHERE user_id = 'test_user';
```

### 步骤2: 修复 create-order 500 错误

#### 2.1 检查 Netlify 环境变量

1. 打开 Netlify Dashboard: https://app.netlify.com
2. 选择站点: `wenpai`
3. 进入 Site settings > Environment variables
4. 确认以下变量已正确配置:

```
✅ SUPABASE_URL=https://weizkydylskcwgnaieqy.supabase.co
✅ SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
✅ BUFPAY_SECRET_KEY=<your-bufpay-secret>
```

#### 2.2 查看 Netlify Functions 日志

1. 在 Netlify Dashboard 中进入 Functions
2. 找到 `create-order` 函数
3. 查看最近的错误日志
4. 记录具体错误信息

#### 2.3 本地测试

```bash
# 启动本地开发服务器
npm run dev

# 在另一个终端运行诊断脚本
node scripts/diagnose-errors.mjs

# 或者手动测试 create-order 端点
curl -X POST http://localhost:8888/.netlify/functions/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user",
    "userEmail": "test@example.com",
    "productName": "测试产品",
    "productType": "professional",
    "durationType": "monthly",
    "amount": 0.01,
    "payType": "alipay"
  }'
```

#### 2.4 常见问题排查

**问题A: Supabase 连接失败**
```javascript
// 检查 netlify/functions/create-order.js 第11-12行
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 确保这两个变量都有值
console.log('Supabase URL:', supabaseUrl ? '已配置' : '未配置');
console.log('Service Key:', supabaseServiceKey ? '已配置' : '未配置');
```

**问题B: BufPay API 调用失败**
```javascript
// 检查 netlify/functions/create-order.js 第17行
const BUFPAY_CONFIG = {
  APP_SECRET: process.env.BUFPAY_SECRET_KEY || process.env.BUFPAY_APP_SECRET,
  // ...
};

// 确保密钥已配置
console.log('BufPay Secret:', BUFPAY_CONFIG.APP_SECRET ? '已配置' : '未配置');
```

**问题C: orders 表写入失败**
```sql
-- 检查 orders 表是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'orders';

-- 检查表结构是否正确
\d orders
```

### 步骤3: 部署修复

```bash
# 1. 提交更改
git add .
git commit -m "fix: 修复 user_usage_logs 表缺失和 create-order 错误"

# 2. 推送到远程仓库
git push origin main

# 3. Netlify 会自动部署
# 等待部署完成后测试
```

### 步骤4: 验证修复

#### 4.1 验证 user_usage_logs 表

在浏览器控制台中执行:

```javascript
// 应该不再看到 404 错误
// 如果仍有错误，检查代码中是否有引用该表的地方
```

#### 4.2 验证支付功能

1. 访问支付页面: https://www.wenpai.xyz/payment-center
2. 选择一个套餐
3. 点击"立即订阅"
4. 检查是否能成功创建订单
5. 查看浏览器控制台是否有错误

## 📊 诊断工具

### 运行完整诊断

```bash
# 运行诊断脚本
node scripts/diagnose-errors.mjs

# 脚本会检查:
# ✅ 环境变量配置
# ✅ Supabase 数据库表
# ✅ create-order 端点
# ✅ 生成修复脚本
```

### 手动检查清单

- [ ] Supabase 中 `user_usage_logs` 表已创建
- [ ] Supabase 中 `orders` 表存在且结构正确
- [ ] Netlify 环境变量已正确配置
- [ ] create-order 函数可以正常调用
- [ ] 支付流程可以正常完成
- [ ] 浏览器控制台无 404/500 错误

## 🔍 深入调试

如果快速修复无效，请查看详细诊断报告:

- [错误诊断报告](./ERROR_DIAGNOSIS_2025-10-08.md)

## 📝 相关文件

- SQL 迁移文件: `supabase/migrations/create_user_usage_logs_table.sql`
- 诊断脚本: `scripts/diagnose-errors.mjs`
- create-order 函数: `netlify/functions/create-order.js`
- BufPay 服务: `src/services/bufpayService.ts`

## 🆘 需要帮助?

如果问题仍未解决，请提供以下信息:

1. Netlify Functions 日志截图
2. Supabase 数据库表列表
3. 浏览器控制台完整错误日志
4. 诊断脚本输出结果

