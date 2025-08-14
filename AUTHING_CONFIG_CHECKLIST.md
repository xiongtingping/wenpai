# Authing 应用配置检查清单

## 🚨 当前问题
生产环境登录时出现 400 错误，错误 URL：
```
auth?redirect_uri=https%3A%2F%2Fwenpai.netlify.app%2Fcallback&response_mode=web_message&response_ty...
```

## 🔍 需要检查的配置项

### 1. 应用基本信息
- [ ] **应用 ID**: `68823897631e1ef8ff3720b2`
- [ ] **应用域名**: `rzcswqd4sq0f.authing.cn`
- [ ] **应用类型**: 应该设置为 `单页 Web 应用 (SPA)` 或 `传统 Web 应用`

### 2. 回调地址配置 ⚠️ 重要
需要在 Authing 控制台中添加以下回调地址到白名单：

**登录回调地址**:
- `https://wenpai.netlify.app/callback`
- `http://localhost:5173/callback` (开发环境)
- `https://www.wenpai.xyz/callback` (如果使用自定义域名)

**登出回调地址**:
- `https://wenpai.netlify.app`
- `http://localhost:5173`
- `https://www.wenpai.xyz`

### 3. 授权配置
- [ ] **授权模式**: 应该启用 `授权码模式 (Authorization Code)`
- [ ] **响应类型**: 应该包含 `code`
- [ ] **授权范围**: 应该包含 `openid profile email phone`
- [ ] **Token 端点认证方式**: 建议使用 `none` (对于 SPA) 或 `client_secret_post`

### 4. 高级配置
- [ ] **CORS 设置**: 确保允许来自 `wenpai.netlify.app` 和 `localhost:5173` 的请求
- [ ] **ID Token 签名算法**: 建议使用 `RS256`
- [ ] **Access Token 签名算法**: 建议使用 `RS256`
- [ ] **Token 有效期**: 合理设置 Access Token 和 Refresh Token 的有效期

### 5. 安全设置
- [ ] **强制 HTTPS**: 生产环境应该启用
- [ ] **PKCE**: 对于 SPA 应用建议启用
- [ ] **状态参数验证**: 建议启用

## 🔧 当前代码配置

### Guard 配置 (src/authing/guard.ts)
```typescript
guardInstance = new Guard({
  appId: '68823897631e1ef8ff3720b2',
  host: 'https://rzcswqd4sq0f.authing.cn',
  redirectUri: 'https://wenpai.netlify.app/callback', // 动态生成
  mode: 'modal',
  lang: 'zh-CN',
  isSSO: false,
  scope: 'openid profile email phone',
  responseType: 'code',
  responseMode: 'query'  // 🔧 修复：使用 query 而不是 web_message
});
```

### Web SDK 配置 (src/contexts/UnifiedAuthContext.tsx)
```typescript
authingClient = new RealAuthing({
  domain: 'rzcswqd4sq0f.authing.cn',
  appId: '68823897631e1ef8ff3720b2',
  redirectUri: 'https://wenpai.netlify.app/callback',
  scope: 'openid profile email phone',
  responseType: 'code',
  state: `state_${Date.now()}`,
  prompt: 'login'
});
```

## 🚨 可能的问题原因

### 1. 回调地址未在白名单中
最常见的 400 错误原因是回调地址没有在 Authing 控制台中正确配置。

### 2. 应用类型不匹配
如果应用类型设置错误（比如设置为传统 Web 应用但使用 SPA 的配置），会导致授权流程失败。

### 3. 响应模式不支持
某些应用类型可能不支持 `web_message` 响应模式，需要使用 `query` 或 `fragment`。

### 4. CORS 配置问题
如果 CORS 设置不正确，浏览器会阻止跨域请求。

## 🛠️ 修复步骤

### 步骤 1: 检查 Authing 控制台配置
1. 登录 [Authing 控制台](https://console.authing.cn/)
2. 找到应用 ID `68823897631e1ef8ff3720b2`
3. 检查上述配置项

### 步骤 2: 更新回调地址
确保以下地址都在回调地址白名单中：
- `https://wenpai.netlify.app/callback`
- `http://localhost:5173/callback`

### 步骤 3: 验证应用类型
- 如果是 SPA 应用，确保选择了正确的应用类型
- 如果是传统 Web 应用，可能需要调整 SDK 配置

### 步骤 4: 测试修复效果
1. 清除浏览器缓存
2. 访问 `https://wenpai.netlify.app`
3. 点击登录按钮
4. 检查是否还有 400 错误

## 📋 验证清单

完成配置后，请验证：
- [ ] 登录弹窗能正常显示
- [ ] 没有 400 网络错误
- [ ] 登录流程能完整完成
- [ ] 用户信息能正确保存
- [ ] Token 能正确获取和使用

## 🔗 相关文档

- [Authing Guard 文档](https://docs.authing.cn/v2/reference/guard/)
- [Authing Web SDK 文档](https://docs.authing.cn/v2/reference/sdk-for-web/)
- [应用配置指南](https://docs.authing.cn/v2/guides/app-new/create-app/)

## 📞 联系支持

如果问题仍然存在，可以：
1. 查看 Authing 控制台的错误日志
2. 联系 Authing 技术支持
3. 在 Authing 社区提问

---

**最后更新**: 2025-08-14
**状态**: 等待 Authing 控制台配置验证
