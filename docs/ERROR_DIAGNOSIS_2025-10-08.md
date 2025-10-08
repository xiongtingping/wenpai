# 错误诊断报告 - 2025-10-08

## 错误概述

### 1. user_usage_logs 表404错误
**错误日志:**
```
weizkydylskcwgnaieqy.supabase.co/rest/v1/user_usage_logs?select=*&user_id=eq.6882df3f2f9efaa6e241dce5&timestamp=gte.2025-10-08T00%3A00%3A00.000Z:1  Failed to load resource: the server responded with a status of 404 ()
logger.ts:73 ❌ 旧表名(timestamp)查询失败
logger.ts:73 ❌ 旧表名(created_at)查询失败
```

**根因候选:**
1. **表不存在** (概率: 70%) - `user_usage_logs` 表可能从未创建或已被删除
2. **表名变更** (概率: 20%) - 表可能已重命名但代码未更新
3. **权限问题** (概率: 10%) - RLS策略阻止访问

**验证步骤:**
- [ ] 检查 Supabase 数据库中是否存在 `user_usage_logs` 表
- [ ] 检查是否有类似名称的表（如 `usage_logs`, `user_logs` 等）
- [ ] 检查 RLS 策略配置
- [ ] 搜索代码中所有引用该表的位置

### 2. create-order 500错误
**错误日志:**
```
.netlify/functions/create-order:1  Failed to load resource: the server responded with a status of 500 ()
logger.ts:73 创建支付订单失败: Error: Internal server error
PaymentPage.tsx:424 Payment error: Error: Internal server error
```

**根因候选:**
1. **Supabase配置错误** (概率: 40%) - Service Role Key 或 URL 配置问题
2. **BufPay API调用失败** (概率: 30%) - API密钥、签名或请求参数问题
3. **数据库写入失败** (概率: 20%) - orders表结构或约束问题
4. **环境变量缺失** (概率: 10%) - 必需的环境变量未设置

**验证步骤:**
- [ ] 检查 Netlify 环境变量配置
- [ ] 查看 Netlify Functions 日志
- [ ] 验证 Supabase Service Role Key
- [ ] 测试 BufPay API 连接
- [ ] 检查 orders 表结构

## 修复方案

### 方案A: user_usage_logs 表问题修复

#### 步骤1: 确认表是否存在
```sql
-- 在 Supabase SQL Editor 中执行
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%usage%';
```

#### 步骤2: 如果表不存在，创建表
```sql
CREATE TABLE IF NOT EXISTS public.user_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_user_usage_logs_user_id ON public.user_usage_logs(user_id);
CREATE INDEX idx_user_usage_logs_created_at ON public.user_usage_logs(created_at);
CREATE INDEX idx_user_usage_logs_timestamp ON public.user_usage_logs(timestamp);

-- 启用 RLS
ALTER TABLE public.user_usage_logs ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can view their own usage logs"
  ON public.user_usage_logs
  FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own usage logs"
  ON public.user_usage_logs
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);
```

#### 步骤3: 如果表名已变更，更新代码引用
需要搜索并更新所有引用 `user_usage_logs` 的代码。

### 方案B: create-order 500错误修复

#### 步骤1: 检查环境变量
在 Netlify Dashboard 中确认以下环境变量已设置：
- `SUPABASE_URL` 或 `VITE_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `BUFPAY_SECRET_KEY` 或 `BUFPAY_APP_SECRET`

#### 步骤2: 添加详细日志
修改 `netlify/functions/create-order.js` 添加更详细的错误日志：

```javascript
// 在 catch 块中添加
} catch (error) {
  console.error('创建支付订单失败 - 详细信息:', {
    error: error.message,
    stack: error.stack,
    supabaseUrl: supabaseUrl ? '已配置' : '未配置',
    supabaseKey: supabaseServiceKey ? '已配置' : '未配置',
    bufpaySecret: BUFPAY_CONFIG.APP_SECRET ? '已配置' : '未配置'
  });
  return {
    statusCode: 500,
    headers,
    body: JSON.stringify({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  };
}
```

#### 步骤3: 验证 orders 表结构
```sql
-- 检查 orders 表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;
```

#### 步骤4: 测试 BufPay API
创建测试脚本验证 BufPay API 连接。

## 紧急修复优先级

1. **高优先级**: create-order 500错误 - 影响支付功能
2. **中优先级**: user_usage_logs 404错误 - 影响使用统计

## 下一步行动

1. 立即检查 Netlify Functions 日志获取详细错误信息
2. 验证 Supabase 数据库表结构
3. 确认所有环境变量正确配置
4. 根据日志信息进行针对性修复

