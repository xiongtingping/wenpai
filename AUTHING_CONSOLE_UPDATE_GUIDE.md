# 🔐 Authing 控制台配置更新指南

## 📋 重要提醒

根据您的Authing控制台截图和当前开发环境，**您需要在Authing控制台中更新回调URL配置**，以确保Authing Guard弹窗功能正常工作。

## 🎯 当前状态

### 开发环境
- ✅ 开发服务器运行在: `http://localhost:5174`
- ✅ 本地环境变量已更新
- ✅ 代码配置已更新
- ✅ 所有验证通过

### Authing控制台配置 (需要更新)
- ❌ 登录回调URL: `http://localhost:5173/callback` (需要更新)
- ❌ 登出回调URL: `http://localhost:5173/` (需要更新)

## 🔧 必须更新的配置

### 1. 登录回调URL更新

**当前配置**: `http://localhost:5173/callback`  
**需要更新为**: `http://localhost:5174/callback`

### 2. 登出回调URL更新

**当前配置**: `http://localhost:5173/`  
**需要更新为**: `http://localhost:5174/`

## 📝 详细更新步骤

### 步骤1: 登录Authing控制台
1. 打开浏览器，访问: https://console.authing.cn
2. 使用您的账号登录

### 步骤2: 进入应用配置
1. 在左侧导航栏中，点击"应用" → "自建应用"
2. 找到名为"wenpai"的应用
3. 点击应用名称进入详情页面

### 步骤3: 更新认证配置
1. 在应用详情页面，找到"认证配置"部分
2. 找到"登录回调 URL"字段
3. 将值从 `http://localhost:5173/callback` 更新为 `http://localhost:5174/callback`
4. 找到"登出回调 URL"字段
5. 将值从 `http://localhost:5173/` 更新为 `http://localhost:5174/`

### 步骤4: 保存配置
1. 点击"保存"按钮
2. 确认配置已保存成功

## ✅ 配置验证

### 验证方法1: 控制台检查
更新后，您的Authing控制台配置应该显示：
- **登录回调 URL**: `http://localhost:5174/callback`
- **登出回调 URL**: `http://localhost:5174/`

### 验证方法2: 功能测试
1. 访问: `http://localhost:5174/authing-guard-test`
2. 点击"测试登录"按钮
3. 点击"测试注册"按钮
4. 检查是否正常显示Authing Guard弹窗

### 验证方法3: 运行验证脚本
```bash
./verify-authing-fix.sh
```

## 🔍 常见问题

### 问题1: 更新后仍然报错
**可能原因**: 浏览器缓存
**解决方案**: 
1. 清除浏览器缓存
2. 刷新页面
3. 重新测试

### 问题2: 回调URL不匹配错误
**错误信息**: "redirect_uri_mismatch"
**解决方案**: 
1. 确认Authing控制台中的回调URL已保存
2. 确认URL格式完全一致（包括端口号）
3. 重启开发服务器

### 问题3: 应用ID错误
**错误信息**: "invalid_client"
**解决方案**: 
1. 确认使用正确的App ID: `687bc631c105de597b993202`
2. 检查环境变量配置

## 📊 配置对比表

| 配置项 | 当前控制台配置 | 需要更新为 | 状态 |
|--------|----------------|------------|------|
| 应用ID | `687bc631c105de597b993202` | `687bc631c105de597b993202` | ✅ 正确 |
| 域名 | `wenpaiai.authing.cn` | `wenpaiai.authing.cn` | ✅ 正确 |
| 登录回调URL | `http://localhost:5173/callback` | `http://localhost:5174/callback` | ❌ 需要更新 |
| 登出回调URL | `http://localhost:5173/` | `http://localhost:5174/` | ❌ 需要更新 |

## 🎯 更新后的完整配置

更新完成后，您的Authing控制台配置应该是：

### 端点信息
- **App ID**: `687bc631c105de597b993202`
- **Token Endpoint**: `https://wenpaiai.authing.cn/oidc/token`
- **User Info Endpoint**: `https://wenpaiai.authing.cn/oidc/me`
- **Authentication Endpoint**: `https://wenpaiai.authing.cn/oidc/auth`

### 认证配置
- **认证地址**: `https://wenpaiai.authing.cn`
- **登录回调 URL**: `http://localhost:5174/callback` ✅
- **登出回调 URL**: `http://localhost:5174/` ✅

## 📋 检查清单

更新完成后，请确认以下项目：

- [ ] Authing控制台登录回调URL已更新为: `http://localhost:5174/callback`
- [ ] Authing控制台登出回调URL已更新为: `http://localhost:5174/`
- [ ] 配置已保存成功
- [ ] 开发服务器运行在5174端口
- [ ] 测试页面可正常访问: `http://localhost:5174/authing-guard-test`
- [ ] 登录弹窗正常显示
- [ ] 注册弹窗正常显示
- [ ] 没有回调URL不匹配错误

## ✅ 完成标志

当您看到以下情况时，说明配置更新成功：

1. ✅ Authing控制台显示正确的回调URL
2. ✅ 测试页面可以正常访问
3. ✅ 点击登录/注册按钮显示Authing Guard弹窗
4. ✅ 浏览器控制台没有错误信息
5. ✅ 验证脚本显示所有检查通过

## 🆘 如果仍有问题

如果更新配置后仍有问题，请：

1. 检查网络连接是否正常
2. 确认Authing控制台配置已保存
3. 重启开发服务器
4. 清除浏览器缓存
5. 查看浏览器控制台错误信息
6. 运行诊断脚本: `node comprehensive-authing-diagnosis.cjs`

---

**重要**: 请务必完成Authing控制台的配置更新，否则Authing Guard弹窗功能将无法正常工作。 