# 🔐 Authing 控制台配置最终指南

## 🎯 当前配置状态

根据环境变量检查，当前使用的配置为：

### 应用信息
- **应用ID**: `687cc2a82e907f6e8aea5848`
- **域名**: `aiwenpai.authing.cn`
- **应用类型**: OIDC

### 回调地址配置
- **开发环境登录回调**: `http://localhost:5173/callback`
- **开发环境登出回调**: `http://localhost:5173/`
- **生产环境登录回调**: `https://wenpai.netlify.app/callback`
- **生产环境登出回调**: `https://wenpai.netlify.app/`

## 🔧 Authing 控制台配置步骤

### 第1步：登录 Authing 控制台
1. 访问：https://console.authing.cn/
2. 使用您的账号登录

### 第2步：找到对应应用
1. 在左侧菜单中点击"应用管理"
2. 找到应用ID为 `687cc2a82e907f6e8aea5848` 的应用
3. 点击应用名称进入详情页面

### 第3步：配置登录回调 URL
1. 在应用详情页面，找到"应用配置"标签
2. 向下滚动找到"登录回调 URL"配置项
3. **清除所有现有的回调 URL**
4. **添加以下 URL（每行一个）**：

```
http://localhost:5173/callback
https://wenpai.netlify.app/callback
```

### 第4步：配置登出回调 URL
1. 在同一个配置页面，找到"登出回调 URL"配置项
2. **清除所有现有的回调 URL**
3. **添加以下 URL（每行一个）**：

```
http://localhost:5173/
https://wenpai.netlify.app/
```

### 第5步：保存配置
1. 点击"保存"按钮
2. 等待配置生效（通常需要 1-2 分钟）

## 🧪 测试配置

### 测试URL
使用以下URL测试认证流程：
```
https://aiwenpai.authing.cn/oidc/auth?client_id=687cc2a82e907f6e8aea5848&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fcallback&response_type=code&scope=openid+profile+email&state=test
```

### 本地测试步骤
1. 确保开发服务器运行在端口 5173
2. 访问：http://localhost:5173
3. 点击登录按钮
4. 应该能正常跳转到 Authing 登录页面
5. 登录成功后应该正确回调到应用

## ⚠️ 重要注意事项

### 1. URL 格式要求
- ✅ 每行只能有一个 URL
- ✅ 不能使用空格或分号分隔多个 URL
- ✅ 必须包含协议（http:// 或 https://）
- ✅ 端口号必须正确（localhost:5173）
- ✅ 路径必须正确（/callback）

### 2. 配置优先级
- `.env.local` 文件优先级高于 `.env` 文件
- 当前生效的配置来自 `.env.local`

### 3. 常见错误
- **redirect_uri_mismatch**: 回调URL未在Authing控制台配置
- **invalid_client**: 应用ID错误或应用未启用
- **400 Bad Request**: 应用配置不完整

## 🔍 故障排除

### 如果仍然出现 redirect_uri_mismatch 错误
1. **检查Authing控制台配置**：确保回调URL完全匹配
2. **清除浏览器缓存**：按 Ctrl+Shift+R 强制刷新
3. **检查端口**：确保开发服务器运行在 5173 端口
4. **等待配置生效**：Authing配置可能需要几分钟生效

### 如果出现其他错误
1. **检查应用状态**：确保应用在Authing控制台中为"已启用"状态
2. **检查域名**：确保域名 `aiwenpai.authing.cn` 可正常访问
3. **检查网络**：确保可以访问Authing服务

## 📞 技术支持

如果问题仍然存在，请：
1. 提供具体的错误信息
2. 提供Authing控制台的配置截图
3. 提供浏览器控制台的错误日志

---

**配置时间**: 2025年1月19日  
**当前端口**: 5173  
**状态**: �� 等待Authing控制台配置更新 