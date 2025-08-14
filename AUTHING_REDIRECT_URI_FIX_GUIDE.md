# 🔐 Authing redirect_uri_mismatch 错误修复指南

## 🚨 当前问题

**错误信息**: `redirect_uri_mismatch`
**错误描述**: redirect_uri 不在白名单内，请前往控制台『应用配置』-『登录回调 URL』进行配置
**App ID**: `68823897631e1ef8ff3720b2`
**当前使用的redirect_uri**: `https://wenpai.netlify.app/callback`

## 🎯 解决方案

### 步骤1: 登录Authing控制台

1. 访问：https://console.authing.cn/
2. 使用您的管理员账号登录

### 步骤2: 找到对应应用

1. 在左侧菜单中点击"应用管理"
2. 找到应用ID为 `68823897631e1ef8ff3720b2` 的应用
3. 点击应用名称进入详情页面

### 步骤3: 配置登录回调 URL

1. 在应用详情页面，找到"应用配置"标签
2. 向下滚动找到"登录回调 URL"配置项
3. **添加以下 URL（每行一个）**：

```
http://localhost:5173/callback
https://wenpai.netlify.app/callback
```

### 步骤4: 配置登出回调 URL

1. 在同一页面找到"登出回调 URL"配置项
2. **添加以下 URL（每行一个）**：

```
http://localhost:5173/
https://wenpai.netlify.app/
```

### 步骤5: 保存配置

1. 点击页面底部的"保存"按钮
2. 等待配置生效（通常需要1-2分钟）

## 🔧 验证配置

配置完成后，可以通过以下方式验证：

### 方法1: 直接访问认证URL

访问以下URL测试认证流程：
```
https://rzcswqd4sq0f.authing.cn/oidc/auth?redirect_uri=https%3A%2F%2Fwenpai.netlify.app%2Fcallback&response_mode=fragment&response_type=code&client_id=68823897631e1ef8ff3720b2&state=test&nonce=test&scope=openid%20profile%20email%20phone&code_challenge=test&code_challenge_method=S256
```

### 方法2: 在应用中测试登录

1. 访问 https://wenpai.netlify.app
2. 点击登录按钮
3. 检查是否能正常跳转到Authing登录页面

## 📋 配置检查清单

- [ ] Authing控制台应用ID正确: `68823897631e1ef8ff3720b2`
- [ ] 登录回调URL包含: `https://wenpai.netlify.app/callback`
- [ ] 登录回调URL包含: `http://localhost:5173/callback`
- [ ] 登出回调URL包含: `https://wenpai.netlify.app/`
- [ ] 登出回调URL包含: `http://localhost:5173/`
- [ ] 配置已保存并生效
- [ ] 应用状态为"已启用"

## 🚨 注意事项

1. **URL格式要求**：
   - 必须包含完整的协议（http:// 或 https://）
   - 不能有多余的空格
   - 路径必须精确匹配

2. **生产环境优先**：
   - 生产环境必须使用 `https://wenpai.netlify.app/callback`
   - 开发环境使用 `http://localhost:5173/callback`

3. **配置生效时间**：
   - 配置修改后需要1-2分钟生效
   - 建议清除浏览器缓存后重试

## 🔍 故障排除

如果配置后仍有问题：

1. **检查应用状态**：确保应用在Authing控制台中状态为"已启用"
2. **检查域名配置**：确认域名 `rzcswqd4sq0f.authing.cn` 配置正确
3. **清除缓存**：清除浏览器缓存和Cookie
4. **等待生效**：配置修改后等待5分钟再测试

## 📞 技术支持

如果按照以上步骤操作后仍有问题，请：

1. 截图Authing控制台的回调URL配置页面
2. 提供完整的错误信息
3. 检查浏览器控制台的详细错误日志

---

**重要提醒**: 此配置必须在Authing控制台中完成，代码修改无法解决redirect_uri白名单问题。
