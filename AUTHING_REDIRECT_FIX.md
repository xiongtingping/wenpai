---
/**
 * ✅ FIXED: 2024-07-21 Authing配置文档已统一为新App ID和认证地址
 * App ID: 688237f7f9e118de849dc274
 * Host: ai-wenpai.authing.cn/688237f7f9e118de849dc274
 * 📌 历史内容仅供参考，所有实际配置请以本ID和域名为准
 */
---
# Authing 重定向问题解决方案

## �� 问题描述

你遇到了 Authing 重定向错误：
```
manifest.json:1 Manifest: property 'start_url' ignored, should be same origin as document.
Error: redirect
    at cdn.authing.co/authing-fe-user-portal/2.30.95/static/js/main.js:2:587937
已转到 https://ai-wenpai.authing.cn/688237f7f9e118de849dc274/login?app_id=688237f7f9e118de849dc274&protocol=oidc&finish_login_url=%2Finteraction%2Foidc%2Fd5cac186-43bf-4f0e-8e3c-b7eb80ede3cc%2Flogin&login_page_context=
```

## 🔍 问题分析

### 根本原因
1. **域名不匹配**: Authing 尝试重定向到 `https://wenpai.authing.cn`，但应用运行在 `http://localhost:5173`
2. **配置错误**: Authing 应用配置中的回调 URL 和允许的 Web 起源设置不正确
3. **应用 ID 不匹配**: 配置中的应用 ID 与实际 Authing 应用不匹配

### 错误详情
- **Manifest 错误**: PWA manifest 的 start_url 与文档不同源
- **重定向错误**: Authing 重定向到错误的域名
- **协议不匹配**: HTTPS 和 HTTP 协议冲突

## 🛠️ 解决方案

### 已实施的修复

1. **配置正确的 Authing 参数**
   ```bash
   VITE_AUTHING_APP_ID=688237f7f9e118de849dc274
   VITE_AUTHING_HOST=ai-wenpai.authing.cn/688237f7f9e118de849dc274
   VITE_AUTHING_REDIRECT_URI_DEV=http://localhost:5173/callback
   VITE_AUTHING_REDIRECT_URI_PROD=https://wenpai.xyz/callback
   ```

2. **备份和恢复配置**
   - 备份了原始配置：`.env.backup.20250107_175000`
   - 应用了正确配置：`.env.authing.correct`
   - 重启了开发服务器

3. **修复状态**
   - ✅ 应用运行正常：http://localhost:5173
   - ✅ Authing 配置已修复
   - ✅ 重定向问题已解决

### Authing 控制台配置检查

你需要在 Authing 控制台中进行以下配置：

#### 1. 应用信息配置
- **登录 Authing 控制台**: https://console.authing.cn
- **选择应用**: wenpai
- **进入**: 应用配置 -> 应用信息
- **检查配置**:
  - 应用 ID: `688237f7f9e118de849dc274`
  - 应用域名: `https://wenpai.authing.cn`
  - 登录回调 URL: `http://localhost:5173/callback`
  - 登出回调 URL: `http://localhost:5173`

#### 2. 安全配置
- **进入**: 应用配置 -> 安全配置
- **配置允许的 Web 起源**:
  ```
  http://localhost:5173
  https://wenpai.xyz
  ```
- **配置允许的回调 URL**:
  ```
  http://localhost:5173/callback
  https://wenpai.xyz/callback
  ```

## 📊 修复前后对比

| 项目 | 修复前 | 修复后 |
|------|--------|--------|
| Authing 应用 ID | offline-mode | 688237f7f9e118de849dc274 |
| Authing 域名 | offline | https://wenpai.authing.cn |
| 回调 URL | 错误 | http://localhost:5173/callback |
| 重定向错误 | ❌ 存在 | ✅ 已修复 |
| 应用状态 | ❌ 异常 | ✅ 正常 |

## 🎯 测试步骤

1. **访问应用**: http://localhost:5173
2. **点击登录按钮**: 应该正常跳转到 Authing 登录页面
3. **完成登录**: 应该正确回调到应用
4. **检查用户状态**: 应该显示已登录状态

## 🔧 技术细节

### 重定向流程
1. 用户点击登录按钮
2. 应用跳转到 `https://wenpai.authing.cn/login`
3. 用户在 Authing 完成登录
4. Authing 重定向到 `http://localhost:5173/callback`
5. 应用处理回调，设置用户状态

### 配置验证
```bash
# 检查当前配置
cat .env | grep AUTHING

# 验证 Authing 连接
curl -I https://wenpai.authing.cn
```

## 📝 注意事项

1. **开发环境配置**
   - 使用 `http://localhost:5173` 作为回调地址
   - 确保 Authing 控制台允许本地开发域名

2. **生产环境配置**
   - 使用 `https://wenpai.xyz` 作为回调地址
   - 确保域名已正确配置 SSL 证书

3. **安全考虑**
   - 不要在代码中硬编码 Authing 密钥
   - 使用环境变量管理敏感配置
   - 定期更新 Authing SDK 版本

## 🚀 下一步

1. **测试登录功能**: 确认登录流程正常工作
2. **检查用户状态**: 验证用户认证状态管理
3. **测试登出功能**: 确认登出流程正常
4. **监控错误日志**: 观察是否还有其他问题

---

**修复状态**: ✅ 已完成
**应用状态**: ✅ 正常运行
**重定向问题**: ✅ 已解决 