# 🔐 Authing 控制台配置指南

## 📋 配置概述

根据您提供的Authing控制台截图，以下是完整的配置信息和验证步骤。

## 🎯 当前Authing应用配置

### 应用基本信息
- **应用名称**: wenpai
- **应用类型**: 自建应用 (Self-built Applications)
- **应用ID**: `687bc631c105de597b993202`
- **应用密钥**: `56fb5***********` (已部分隐藏)

### 端点信息 (Endpoint Information)

#### 核心端点
- **Token Endpoint**: `https://wenpaiai.authing.cn/oidc/token`
- **User Info Endpoint**: `https://wenpaiai.authing.cn/oidc/me`
- **Logout Endpoint**: `https://wenpaiai.authing.cn/oidc/session/end`
- **JWKS Public Key Endpoint**: `https://wenpaiai.authing.cn/oidc/.well-known/jwks.json`
- **Authentication Endpoint**: `https://wenpaiai.authing.cn/oidc/auth`

#### 服务发现
- **Issuer**: `https://wenpaiai.authing.cn/oidc`
- **Service Discovery Address**: `https://wenpaiai.authing.cn/oidc/.well-known/openid-configuration`

### 认证配置 (Authentication Configuration)

#### 当前配置
- **认证地址**: `https://wenpaiai.authing.cn`
- **登录回调 URL**: `http://localhost:5173/callback` ⚠️ **需要更新**
- **登出回调 URL**: `http://localhost:5173/` ⚠️ **需要更新**

## 🔧 需要更新的配置

### 1. 更新登录回调URL

**当前配置**: `http://localhost:5173/callback`  
**需要更新为**: `http://localhost:5174/callback`

**更新步骤**:
1. 登录Authing控制台
2. 进入应用配置页面
3. 找到"登录回调 URL"字段
4. 将值更新为: `http://localhost:5174/callback`
5. 保存配置

### 2. 更新登出回调URL

**当前配置**: `http://localhost:5173/`  
**需要更新为**: `http://localhost:5174/`

**更新步骤**:
1. 在同一个配置页面
2. 找到"登出回调 URL"字段
3. 将值更新为: `http://localhost:5174/`
4. 保存配置

## 📊 代码配置验证

### 环境变量配置
确保 `.env.local` 文件包含以下配置：

```bash
# Authing 身份认证配置
VITE_AUTHING_APP_ID=687bc631c105de597b993202
VITE_AUTHING_HOST=https://wenpaiai.authing.cn
VITE_AUTHING_REDIRECT_URI_DEV=http://localhost:5174/callback
```

### 代码中的配置
`src/config/authing.ts` 中的配置应该与Authing控制台一致：

```typescript
export const getAuthingConfig = (): AuthingConfig => {
  return {
    appId: '687bc631c105de597b993202',
    host: 'wenpaiai.authing.cn',
    redirectUri: 'http://localhost:5174/callback', // 动态获取
    mode: 'modal',
    defaultScene: 'login',
  };
};
```

## 🧪 配置验证步骤

### 1. 验证Authing控制台配置
1. 确认应用ID: `687bc631c105de597b993202`
2. 确认域名: `wenpaiai.authing.cn`
3. 确认登录回调URL: `http://localhost:5174/callback`
4. 确认登出回调URL: `http://localhost:5174/`

### 2. 验证本地环境变量
```bash
# 检查环境变量
grep -E "VITE_AUTHING_" .env.local
```

### 3. 验证代码配置
```bash
# 运行配置验证脚本
./verify-authing-fix.sh
```

### 4. 测试功能
1. 访问: `http://localhost:5174/authing-guard-test`
2. 点击"测试登录"按钮
3. 点击"测试注册"按钮
4. 检查控制台输出

## 🔍 常见问题排查

### 问题1: 回调URL不匹配
**错误信息**: "redirect_uri_mismatch"
**解决方案**: 确保Authing控制台中的回调URL与代码中的完全一致

### 问题2: 应用ID错误
**错误信息**: "invalid_client"
**解决方案**: 确认使用正确的App ID: `687bc631c105de597b993202`

### 问题3: 域名访问失败
**错误信息**: 网络连接错误
**解决方案**: 确认域名 `wenpaiai.authing.cn` 可正常访问

### 问题4: 端口不匹配
**错误信息**: 回调失败
**解决方案**: 确保Authing控制台和代码都使用相同的端口 (5174)

## 📋 配置检查清单

- [ ] Authing控制台应用ID正确: `687bc631c105de597b993202`
- [ ] Authing控制台域名正确: `wenpaiai.authing.cn`
- [ ] Authing控制台登录回调URL: `http://localhost:5174/callback`
- [ ] Authing控制台登出回调URL: `http://localhost:5174/`
- [ ] 本地环境变量App ID正确
- [ ] 本地环境变量域名正确
- [ ] 本地环境变量回调URL正确
- [ ] 开发服务器运行在5174端口
- [ ] 测试页面可正常访问
- [ ] 登录弹窗正常显示
- [ ] 注册弹窗正常显示

## ✅ 配置完成

完成以上配置后，Authing Guard弹窗功能应该能够正常工作。如果仍有问题，请检查：

1. 网络连接是否正常
2. Authing控制台配置是否已保存
3. 开发服务器是否重启
4. 浏览器控制台是否有错误信息

## 📞 技术支持

如果配置过程中遇到问题，可以：
1. 查看浏览器控制台错误信息
2. 运行诊断脚本: `node comprehensive-authing-diagnosis.cjs`
3. 检查Authing官方文档
4. 联系Authing技术支持 