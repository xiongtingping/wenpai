# Authing 400 错误修复指南

## 问题描述
登录时出现 400 Bad Request 错误：
```
GET https://qutkgzkfaezk-demo.authing.cn/oidc/auth?client_id=688237f7f9e118de849dc274&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fcallback&scope=openid+profile+email+phone&response_type=code&state=%2Fcreative 400 (Bad Request)
```

## 问题原因分析
400 错误通常由以下原因导致：
1. **应用ID不存在或错误**
2. **应用未启用**
3. **回调URL未配置**
4. **应用类型配置错误**
5. **应用配置不完整**

## 当前配置
- 应用ID: `688237f7f9e118de849dc274`
- 域名: `qutkgzkfaezk-demo.authing.cn`
- 回调URL: `http://localhost:5173/callback`

## 修复步骤

### 1. 检查应用是否存在
1. 登录 [Authing 控制台](https://console.authing.cn/)
2. 进入 `应用管理`
3. 查找应用ID为 `688237f7f9e118de849dc274` 的应用
4. 如果不存在，需要创建新应用

### 2. 创建新应用（如果需要）
如果应用不存在，按以下步骤创建：

#### 2.1 创建应用
1. 点击 `创建应用`
2. 选择 `单页应用 (SPA)`
3. 应用名称：`文派`
4. 应用描述：`多平台内容适配工具`

#### 2.2 配置应用
1. **应用类型**: 单页应用 (SPA)
2. **登录回调 URL**: 
   ```
   http://localhost:5173/callback
   https://www.wenpai.xyz/callback
   ```
3. **登出回调 URL**:
   ```
   http://localhost:5173/
   https://www.wenpai.xyz/
   ```

### 3. 修复现有应用（如果存在）

#### 3.1 检查应用状态
1. 进入应用详情
2. 确认应用状态为 `已启用`
3. 如果未启用，点击启用

#### 3.2 配置回调URL
1. 进入 `应用配置` → `登录回调 URL`
2. **清除所有现有配置**
3. **添加以下URL（每行一个）**：
   ```
   http://localhost:5173/callback
   https://www.wenpai.xyz/callback
   ```

#### 3.3 配置登出回调URL
1. 进入 `应用配置` → `登出回调 URL`
2. **添加以下URL（每行一个）**：
   ```
   http://localhost:5173/
   https://www.wenpai.xyz/
   ```

#### 3.4 检查应用类型
1. 确认应用类型为 `单页应用 (SPA)`
2. 如果不是，需要重新创建应用

### 4. 更新环境变量
如果创建了新应用，需要更新 `.env` 文件中的应用ID：

```bash
# 获取新应用ID后更新
VITE_AUTHING_APP_ID=新的应用ID
VITE_AUTHING_HOST=qutkgzkfaezk-demo.authing.cn
```

### 5. 验证配置
1. 保存所有配置
2. 等待 1-2 分钟让配置生效
3. 重启开发服务器
4. 测试登录功能

## 常见问题解决

### Q: 如何获取正确的应用ID？
A: 
1. 在 Authing 控制台的应用列表中查看
2. 或者在应用详情页面的 `应用配置` 中查看

### Q: 为什么需要两个回调URL？
A: 
- `http://localhost:5173/callback` - 开发环境
- `https://www.wenpai.xyz/callback` - 生产环境

### Q: 应用类型为什么必须是单页应用？
A: 
- 我们的应用是 React SPA
- 使用 OAuth 2.0 授权码流程
- 需要支持前端路由

### Q: 配置保存后多久生效？
A: 通常 1-2 分钟，如果超过 5 分钟仍有问题，请检查配置是否正确。

## 测试步骤
1. 完成上述配置后
2. 重启开发服务器：`npm run dev`
3. 访问：`http://localhost:5173/`
4. 点击登录按钮
5. 应该能正常跳转到 Authing 登录页面

## 如果仍有问题
1. 检查浏览器控制台是否有其他错误
2. 确认网络连接正常
3. 尝试清除浏览器缓存
4. 检查 Authing 服务状态 