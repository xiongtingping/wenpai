# Authing 回调 URL 格式修复指南

## 问题发现
从您的 Authing 控制台截图中发现，登录回调 URL 配置格式有误：

### 当前配置（错误）
```
https://www.wenpai.xyz/callback;
https://*.netlify.app/callback;
http://localhost:5173/callback;
```

### 问题
- 每个 URL 后面都有分号 `;`
- 这会导致 Authing 无法正确识别回调 URL
- 从而引发 400 Bad Request 错误

## 修复步骤

### 1. 登录 Authing 控制台
访问：https://console.authing.cn/

### 2. 进入应用配置
1. 找到您的应用：`wenpai`
2. 进入 `认证配置` 页面

### 3. 修复登录回调 URL
1. 在 `登录回调 URL` 文本框中
2. **删除所有现有内容**
3. **重新添加以下内容（每行一个，不要分号）：**

```
https://www.wenpai.xyz/callback
https://*.netlify.app/callback
http://localhost:5173/callback
```

### 4. 重要提醒
- ✅ 每行只能有一个 URL
- ✅ **不要添加分号 `;`**
- ✅ 不要使用空格分隔
- ✅ 确保 URL 格式正确

### 5. 保存配置
1. 点击 `保存` 按钮
2. 等待 1-2 分钟让配置生效

## 验证修复

### 1. 检查配置
保存后，确认登录回调 URL 显示为：
```
https://www.wenpai.xyz/callback
https://*.netlify.app/callback
http://localhost:5173/callback
```

### 2. 测试登录
1. 重启开发服务器（如果需要）
2. 访问：http://localhost:5173/
3. 点击登录按钮
4. 应该能正常跳转到 Authing 登录页面

## 常见问题

### Q: 为什么不能有分号？
A: Authing 的回调 URL 配置不支持分号，分号会被当作 URL 的一部分，导致 URL 无效。

### Q: 配置保存后多久生效？
A: 通常 1-2 分钟，如果超过 5 分钟仍有问题，请检查 URL 格式是否正确。

### Q: 如何确认配置已生效？
A: 尝试登录，如果不再出现 400 错误，说明配置已生效。

## 技术说明

### 正确的 URL 格式
- 必须是完整的 URL（包含协议、域名、端口、路径）
- 不能包含特殊字符（如分号）
- 每行一个 URL，用换行符分隔

### 安全考虑
- 回调 URL 是安全白名单
- 只允许配置的 URL 接收认证回调
- 生产环境应使用 HTTPS 