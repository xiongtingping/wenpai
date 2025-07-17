# Authing 回调 URL 配置修复指南

## 问题描述
登录时出现错误：
```
error: redirect_uri_mismatch
error_description: redirect_uri 不在白名单内，请前往控制台『应用配置』-『登录回调 URL』进行配置
```

## 问题原因
1. Authing 域名配置错误：使用了 `wenpai.authing.cn` 而不是 `qutkgzkfaezk-demo.authing.cn`
2. 回调 URL 未在 Authing 控制台白名单中配置

## 已修复的配置

### 环境变量配置
```bash
# 正确的Authing配置
VITE_AUTHING_APP_ID=6867fdc88034eb95ae86167d
VITE_AUTHING_HOST=qutkgzkfaezk-demo.authing.cn
VITE_AUTHING_REDIRECT_URI_DEV=http://localhost:5173/callback
VITE_AUTHING_REDIRECT_URI_PROD=https://www.wenpai.xyz/callback
```

## Authing 控制台配置步骤

### 1. 登录 Authing 控制台
- 访问：https://console.authing.cn/
- 使用您的账号登录

### 2. 进入应用配置
- 找到您的应用：`文派` 或 `wenpai`
- 点击进入应用详情

### 3. 配置登录回调 URL
- 在左侧菜单中找到 `应用配置`
- 点击 `登录回调 URL` 设置
- **清除所有现有的回调 URL**
- **添加以下两个 URL（每行一个）：**

```
http://localhost:5173/callback
https://www.wenpai.xyz/callback
```

### 4. 重要注意事项
- ✅ 每行只能有一个 URL
- ✅ 不能使用空格分隔多个 URL
- ✅ 必须包含协议（http:// 或 https://）
- ✅ 端口号必须正确（localhost:5173）
- ✅ 路径必须正确（/callback）

### 5. 保存配置
- 点击 `保存` 按钮
- 等待配置生效（通常 1-2 分钟）

## 验证配置

### 1. 检查环境变量
```bash
grep "VITE_AUTHING" .env
```

### 2. 测试登录流程
1. 重启开发服务器
2. 访问 http://localhost:5173/
3. 点击登录按钮
4. 应该能正常跳转到 Authing 登录页面
5. 登录后应该能正确回调到应用

## 常见问题

### Q: 为什么需要两个回调 URL？
A: 
- `http://localhost:5173/callback` - 开发环境使用
- `https://www.wenpai.xyz/callback` - 生产环境使用

### Q: 配置保存后多久生效？
A: 通常 1-2 分钟，如果超过 5 分钟仍有问题，请检查 URL 格式是否正确。

### Q: 如何确认配置已生效？
A: 尝试登录，如果不再出现 `redirect_uri_mismatch` 错误，说明配置已生效。

## 技术说明

### 回调 URL 格式要求
- 必须是完整的 URL（包含协议、域名、端口、路径）
- 域名必须与应用的域名配置一致
- 路径必须与应用中的路由配置一致

### 安全考虑
- 回调 URL 是安全白名单，防止恶意重定向
- 只允许配置的 URL 接收认证回调
- 生产环境应使用 HTTPS

## 修复脚本
已创建 `fix-authing-domain.sh` 脚本，可以自动修复域名配置问题。 