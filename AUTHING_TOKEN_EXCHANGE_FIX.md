# 🔐 Authing Token交换修复指南

## 📋 问题诊断

根据控制台错误信息，问题很明确：

```
{"error":"invalid_client","error_description":"应用 token_endpoint_auth_method 配置不为 none, 请在 body 或者请求头中传递 client_id 和 client_secret。"}
```

**根本原因**：Authing应用的Token端点认证方法配置需要调整

## 🔧 解决方案

### 方案1：修改Authing应用配置（推荐）

#### 步骤1：登录Authing控制台
1. 打开浏览器，访问：https://console.authing.cn
2. 使用您的Authing账号登录

#### 步骤2：进入应用配置
1. 在左侧导航栏中，点击"应用"
2. 点击"自建应用"
3. 找到名为"wenpai"的应用
4. 点击应用名称进入详情页面

#### 步骤3：更新Token端点认证方法
1. 在应用详情页面，找到"高级配置"或"安全配置"部分
2. 找到"Token端点认证方法"或"token_endpoint_auth_method"设置
3. 将值从当前设置改为：`none`
4. 保存配置

#### 步骤4：更新回调URL（如果还没更新）
同时确保回调URL已更新：
- **登录回调URL**: `http://localhost:5174/callback`
- **登出回调URL**: `http://localhost:5174/`

### 方案2：在代码中提供client_secret

如果方案1不可行，我们可以在代码中添加client_secret：

#### 步骤1：获取client_secret
1. 在Authing控制台的应用详情页面
2. 找到"App Secret"字段
3. 复制完整的secret值

#### 步骤2：更新环境变量
在`.env.local`文件中添加：
```bash
VITE_AUTHING_CLIENT_SECRET=your_client_secret_here
```

#### 步骤3：更新代码
修改Token交换逻辑，添加client_secret参数。

## 🧪 验证修复

### 修复后测试步骤
1. **更新Authing控制台配置**
2. **重启开发服务器**
3. **访问测试页面**: http://localhost:5174/authing-complete-test
4. **点击"跳转登录测试"**
5. **完成Authing认证流程**
6. **检查是否成功回调到应用**

### 成功标志
修复成功后，您应该看到：
- ✅ 不再出现400错误
- ✅ Token交换成功
- ✅ 用户信息正确获取
- ✅ 登录状态正常显示

## 📊 配置对比表

| 配置项 | 当前状态 | 需要更新为 | 优先级 |
|--------|----------|------------|--------|
| Token端点认证方法 | 需要client_secret | none | 高 |
| 登录回调URL | 5173端口 | 5174端口 | 高 |
| 登出回调URL | 5173端口 | 5174端口 | 高 |

## 🔍 故障排除

### 如果方案1不可行
1. **检查Authing应用类型**：确保是"自建应用"
2. **检查应用权限**：确保有修改配置的权限
3. **联系Authing支持**：如果找不到相关配置选项

### 如果方案2不可行
1. **检查client_secret格式**：确保完整复制
2. **检查环境变量**：确保正确设置
3. **检查代码逻辑**：确保正确传递参数

## ⚡ 快速修复命令

如果您已经更新了Authing控制台配置，可以运行以下命令验证：

```bash
# 验证配置
./verify-authing-fix.sh

# 测试功能
curl -s http://localhost:5174/authing-complete-test
```

## 📞 技术支持

如果按照上述步骤操作后仍有问题：

1. **检查Authing服务状态**：https://status.authing.cn
2. **查看Authing官方文档**：https://docs.authing.cn
3. **联系Authing技术支持**
4. **运行诊断脚本**：`./verify-authing-fix.sh`

## 🎉 完成标志

当您看到以下情况时，说明修复成功：

1. ✅ 不再出现"invalid_client"错误
2. ✅ Token交换成功
3. ✅ 用户信息正确获取和显示
4. ✅ 登录状态正常保持
5. ✅ 登出功能正常工作

---

**重要提醒**：请优先尝试方案1（修改Authing应用配置），这是最安全和推荐的方法！ 