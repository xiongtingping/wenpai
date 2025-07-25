# Authing 配置指南

## 问题描述
当前遇到 `redirect_uri_mismatch` 错误，需要在 Authing 控制台正确配置回调 URL。

## 当前配置信息
- **应用 ID**: `688237f7f9e118de849dc274`
- **应用域名**: `https://qutkgzkfaezk-demo.authing.cn`
- **回调 URL**: `http://localhost:3002/callback`

## 解决步骤

### 1. 登录 Authing 控制台
访问: https://console.authing.cn/

### 2. 进入应用管理
1. 在左侧菜单找到"应用管理"
2. 点击进入应用列表

### 3. 选择应用
找到应用 ID 为 `688237f7f9e118de849dc274` 的应用
点击进入应用详情

### 4. 配置登录回调 URL
1. 在应用详情页面，找到"应用配置"标签
2. 向下滚动找到"登录回调 URL"配置项
3. 点击"添加"按钮
4. 输入以下 URL：
   ```
   http://localhost:3002/callback
   ```
5. 点击"保存"按钮

### 5. 验证配置
配置完成后，重新测试登录功能：
1. 访问: http://localhost:3002/auth-test
2. 点击"显示登录窗口"按钮
3. 应该能正常跳转到 Authing 登录页面

## 其他可能需要的回调 URL
如果需要在其他端口测试，也可以添加：
- `http://localhost:3001/callback`
- `http://localhost:3002/callback`
- `http://localhost:5173/callback`

## 常见问题

### Q: 找不到"登录回调 URL"配置项？
A: 确保你在"应用配置"页面，不是"应用信息"页面。

### Q: 添加回调 URL 后仍然报错？
A: 
1. 确保 URL 格式完全正确（包括协议、端口、路径）
2. 确保点击了"保存"按钮
3. 等待几分钟让配置生效
4. 清除浏览器缓存后重试

### Q: 开发服务器端口变化了怎么办？
A: 更新 `src/config/authing.ts` 中的 `redirectUri` 配置，并在 Authing 控制台添加新的回调 URL。

## 调试信息
当前授权 URL 构建成功，参数如下：
- `client_id`: 688237f7f9e118de849dc274
- `redirect_uri`: http://localhost:3000/callback
- `response_type`: code
- `scope`: openid profile email phone

## 联系支持
如果问题仍然存在，请联系 Authing 技术支持。 