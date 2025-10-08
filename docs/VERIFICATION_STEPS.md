# 修复验证步骤

## ✅ 已完成: user_usage_logs 表创建

您已成功执行 SQL 迁移脚本，`user_usage_logs` 表已创建。

## 🔍 验证步骤

### 1. 验证表结构

在 Supabase SQL Editor 中执行以下查询：

```sql
-- 1. 确认表存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_usage_logs';

-- 2. 查看表结构
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_usage_logs'
ORDER BY ordinal_position;

-- 3. 查看索引
SELECT 
  indexname, 
  indexdef
FROM pg_indexes
WHERE tablename = 'user_usage_logs';

-- 4. 查看 RLS 策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_usage_logs';
```

### 2. 测试表功能

```sql
-- 测试插入
INSERT INTO user_usage_logs (
  user_id, 
  action, 
  feature, 
  details,
  tokens_used,
  credits_used
) VALUES (
  'test_user_' || gen_random_uuid()::text,
  'test_action',
  'test_feature',
  '{"test": true, "timestamp": "' || NOW()::text || '"}'::jsonb,
  100,
  10
);

-- 测试查询
SELECT 
  id,
  user_id,
  action,
  feature,
  tokens_used,
  credits_used,
  created_at,
  timestamp
FROM user_usage_logs
WHERE user_id LIKE 'test_user_%'
ORDER BY created_at DESC
LIMIT 5;

-- 测试辅助函数
SELECT * FROM get_user_daily_usage_stats('test_user_123', CURRENT_DATE);

-- 清理测试数据
DELETE FROM user_usage_logs WHERE user_id LIKE 'test_user_%';
```

### 3. 验证前端不再报错

1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 刷新页面
4. 检查是否还有以下错误：
   ```
   ❌ 旧表名(timestamp)查询失败
   ❌ 旧表名(created_at)查询失败
   ```

**预期结果**: 不应再看到 404 错误

## 🔧 下一步: 修复 create-order 500 错误

### 步骤 1: 检查 Netlify 环境变量

1. 访问: https://app.netlify.com/sites/[your-site-name]/settings/deploys#environment
2. 确认以下变量存在且正确:

```
SUPABASE_URL=https://weizkydylskcwgnaieqy.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
BUFPAY_SECRET_KEY=[your-bufpay-secret]
```

### 步骤 2: 查看 Netlify Functions 日志

1. 访问: https://app.netlify.com/sites/[your-site-name]/functions
2. 找到 `create-order` 函数
3. 点击查看最近的调用日志
4. 记录具体错误信息

### 步骤 3: 重新部署

如果环境变量有更新，需要重新部署：

```bash
# 方法 1: 在 Netlify Dashboard 中手动触发部署
# Site settings > Build & deploy > Trigger deploy

# 方法 2: 推送代码触发自动部署
git commit --allow-empty -m "chore: trigger redeploy"
git push origin main
```

### 步骤 4: 测试支付功能

1. 访问: https://www.wenpai.xyz/payment-center
2. 选择一个套餐
3. 点击"立即订阅"
4. 观察是否能成功创建订单

**预期结果**: 
- ✅ 订单创建成功
- ✅ 显示支付二维码
- ❌ 不应看到 "Internal server error"

## 📊 完整验证清单

- [ ] user_usage_logs 表已创建
- [ ] 表结构正确（包含 timestamp 和 created_at 字段）
- [ ] 索引已创建
- [ ] RLS 策略已启用
- [ ] 前端不再报 404 错误
- [ ] Netlify 环境变量已配置
- [ ] create-order 函数可以正常调用
- [ ] 支付流程可以正常完成

## 🐛 如果仍有问题

### 问题 A: 前端仍报 404 错误

**可能原因**: 代码中可能使用了错误的表名或查询方式

**排查步骤**:
1. 搜索代码中所有引用 `user_usage_logs` 的地方
2. 检查查询语句是否正确
3. 确认 RLS 策略允许当前用户访问

### 问题 B: create-order 仍返回 500

**可能原因**:
1. 环境变量未正确配置
2. Supabase Service Role Key 无效
3. BufPay API 密钥错误
4. orders 表结构问题

**排查步骤**:
1. 查看 Netlify Functions 详细日志
2. 检查 Supabase 连接是否成功
3. 验证 BufPay API 密钥
4. 确认 orders 表存在且结构正确

### 问题 C: 需要更多帮助

请提供以下信息:
1. Netlify Functions 日志截图
2. 浏览器控制台完整错误
3. Supabase 表列表截图
4. 环境变量配置状态（隐藏敏感信息）

## 📞 获取帮助

如果遇到问题，可以：
1. 查看详细诊断报告: `docs/ERROR_DIAGNOSIS_2025-10-08.md`
2. 运行诊断脚本: `node scripts/diagnose-errors.mjs`
3. 查看快速修复指南: `docs/QUICK_FIX_GUIDE.md`

