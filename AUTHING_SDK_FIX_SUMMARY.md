# Authing SDK 修复总结

## 问题描述
应用启动时出现两个主要错误：
1. `authing.handleRedirectCallback is not a function` - Authing SDK API 使用错误
2. `HeroSection` 组件导出问题

## 问题原因

### 1. Authing SDK API 错误
- 使用了错误的 API 方法 `handleRedirectCallback()`
- 使用了错误的 API 方法 `buildAuthorizeUrl()`
- 使用了错误的 API 方法 `getUserInfo()` 无参数调用

### 2. 组件导出问题
- HomePage 使用命名导入 `{ HeroSection }`
- HeroSection 组件使用默认导出 `export default`

## 解决方案

### 1. 修复 Authing SDK API 使用

#### 修复前
```tsx
// 错误的API使用
await authing.handleRedirectCallback();
const userInfo = await authing.getUserInfo();
const loginUrl = authing.buildAuthorizeUrl({...});
```

#### 修复后
```tsx
// 正确的API使用
const tokenSet = await authing.getAccessTokenByCode(code, {
  redirectUri: config.redirectUri
});
const userInfo = await authing.getUserInfo(tokenSet.access_token);

// 手动构建授权URL
const authUrl = `https://${config.host}/oidc/auth?` + new URLSearchParams({
  client_id: config.appId,
  redirect_uri: config.redirectUri,
  scope: 'openid profile email phone',
  response_type: 'code',
  state: redirectTo || '/',
}).toString();
```

### 2. 修复组件导入问题

#### 修复前
```tsx
import { HeroSection } from "@/components/landing/HeroSection"
```

#### 修复后
```tsx
import HeroSection from "@/components/landing/HeroSection"
```

## 修复文件
- `src/contexts/UnifiedAuthContext.tsx` - 修复 Authing SDK API 使用
- `src/pages/HomePage.tsx` - 修复组件导入

## 技术说明

### Authing SDK v4 API 变化
- `handleRedirectCallback()` → 手动处理授权码
- `buildAuthorizeUrl()` → 手动构建授权URL
- `getUserInfo()` → 需要传入 access_token 参数

### 认证流程优化
1. 检查URL中的授权码
2. 使用授权码获取访问令牌
3. 使用访问令牌获取用户信息
4. 保存用户信息和令牌到本地存储
5. 清除URL参数并跳转到目标页面

## 验证结果
- ✅ 应用正常启动
- ✅ 不再出现 Authing SDK API 错误
- ✅ HeroSection 组件正常加载
- ✅ 认证流程正常工作
- ✅ 登录跳转功能正常

## 相关文件
- `fix-authing-sdk-issues.sh` - 快速修复脚本
- `src/config/authing.ts` - Authing 配置
- `src/components/landing/HeroSection.tsx` - Hero 组件 