# 部署和验证指南

## ✅ 已完成的修复

1. **user_usage_logs 表**: 已成功创建 ✅
2. **create-order 增强日志**: 已添加详细的错误诊断 ✅

## 🚀 部署步骤

### 步骤 1: 提交代码更改

```bash
# 查看更改
git status

# 添加所有更改
git add .

# 提交更改
git commit -m "fix: 修复 user_usage_logs 表缺失和增强 create-order 错误日志"

# 推送到远程仓库
git push origin main
```

### 步骤 2: 等待 Netlify 自动部署

1. 访问 Netlify Dashboard: https://app.netlify.com
2. 选择您的站点
3. 查看 **Deploys** 标签
4. 等待部署完成（通常需要 2-5 分钟）
5. 部署状态变为 **Published** 后继续

### 步骤 3: 验证环境变量（重要！）

在 Netlify Dashboard 中：

1. 进入 **Site settings** > **Environment variables**
2. 确认以下变量存在且正确：

```
✅ SUPABASE_URL
   值: https://weizkydylskcwgnaieqy.supabase.co

✅ SUPABASE_SERVICE_ROLE_KEY
   值: eyJ... (以 eyJ 开头的长字符串)

✅ BUFPAY_SECRET_KEY 或 BUFPAY_APP_SECRET
   值: 您的 BufPay 密钥
```

**如果缺少任何变量**:
1. 点击 **Add a variable**
2. 输入变量名和值
3. 点击 **Save**
4. **重新部署**: Site settings > Build & deploy > Trigger deploy

## 🧪 测试和验证

### 方法 1: 使用测试脚本（推荐）

```bash
# 测试生产环境
node scripts/test-create-order.mjs production

# 测试本地环境（需要先运行 npm run dev）
node scripts/test-create-order.mjs local

# 测试两个环境
node scripts/test-create-order.mjs both
```

### 方法 2: 浏览器手动测试

1. **清除浏览器缓存**:
   - Chrome: Ctrl+Shift+Delete (Windows) 或 Cmd+Shift+Delete (Mac)
   - 选择 "Cached images and files"
   - 点击 "Clear data"

2. **打开开发者工具**:
   - 按 F12 或右键 > 检查
   - 切换到 **Console** 标签

3. **访问支付页面**:
   - 访问: https://www.wenpai.xyz/payment-center
   - 选择一个套餐
   - 点击"立即订阅"

4. **观察控制台输出**:
   - ✅ 应该不再看到 `user_usage_logs` 404 错误
   - ✅ 如果 create-order 仍失败，会看到详细的错误信息

### 方法 3: 查看 Netlify Functions 日志

1. 在 Netlify Dashboard 中进入 **Functions**
2. 找到 `create-order` 函数
3. 点击查看最近的调用
4. 查看详细日志输出

**现在日志会显示**:
```
🔵 收到创建订单请求
📋 配置检查: { supabaseUrl: '✅', supabaseKey: '✅', bufpaySecret: '✅' }
✅ 请求数据解析成功
📝 准备创建订单
💾 开始写入数据库...
✅ 订单记录创建成功
💳 调用 BufPay 接口
📡 BufPay API 响应状态: 200 OK
```

**如果失败，会显示**:
```
❌ 数据库写入失败: { code: '...', message: '...', details: '...' }
或
❌ BufPay API 请求失败: { status: 500, responseBody: '...' }
```

## 🔍 常见问题排查

### 问题 1: user_usage_logs 404 仍然存在

**检查**:
- [ ] SQL 迁移是否成功执行？
- [ ] 表是否真的创建了？

**验证**:
```sql
-- 在 Supabase SQL Editor 中执行
SELECT COUNT(*) FROM user_usage_logs;
```

### 问题 2: create-order 返回 500

**根据日志中的提示检查**:

#### 提示: "BufPay API 连接失败"
```bash
# 检查 BufPay 密钥
# 在 Netlify 环境变量中确认 BUFPAY_SECRET_KEY 存在
```

#### 提示: "数据库连接失败"
```bash
# 检查 Supabase 配置
# 在 Netlify 环境变量中确认:
# - SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY
```

#### 提示: "签名验证失败"
```bash
# BufPay 密钥可能不正确
# 请联系 BufPay 确认密钥
```

### 问题 3: 环境变量更新后仍失败

**解决方案**:
1. 更新环境变量后必须重新部署
2. 在 Netlify Dashboard 中:
   - Site settings > Build & deploy
   - 点击 **Trigger deploy** > **Deploy site**
3. 等待部署完成后再测试

## 📊 验证清单

部署后请确认:

- [ ] Netlify 部署成功（状态为 Published）
- [ ] 环境变量已正确配置
- [ ] user_usage_logs 表已创建
- [ ] 浏览器控制台无 404 错误
- [ ] create-order 函数可以正常调用（或有详细错误日志）
- [ ] 支付流程可以正常完成

## 🎯 预期结果

### 成功场景

1. **user_usage_logs 404 错误消失**:
   - 浏览器控制台不再显示相关错误
   - 使用统计功能正常工作

2. **create-order 正常工作**:
   - 点击"立即订阅"后成功创建订单
   - 显示支付二维码
   - 控制台无错误

### 失败场景（但有详细日志）

如果 create-order 仍然失败，现在会看到:
- 具体的错误类型
- 配置状态检查结果
- 友好的错误提示
- 修复建议

## 📞 获取帮助

如果问题仍未解决，请提供:

1. **Netlify Functions 日志截图**
   - 包含完整的错误信息和配置检查结果

2. **浏览器控制台截图**
   - 包含完整的错误堆栈

3. **环境变量配置状态**
   - 哪些变量已配置（不要暴露实际值）

4. **测试脚本输出**
   - `node scripts/test-create-order.mjs production` 的完整输出

## 📝 相关文档

- [快速修复指南](./QUICK_FIX_GUIDE.md)
- [错误诊断报告](./ERROR_DIAGNOSIS_2025-10-08.md)
- [验证步骤](./VERIFICATION_STEPS.md)

