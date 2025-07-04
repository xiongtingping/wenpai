# Authing 配置指南

本文档说明如何在文派AI项目中配置和使用 Authing 身份认证服务。

## 1. 创建 Authing 应用

### 1.1 注册 Authing 账户
1. 访问 [Authing 官网](https://www.authing.cn/)
2. 注册并登录您的账户

### 1.2 创建应用
1. 在 Authing 控制台中，点击"创建应用"
2. 选择"单页应用 (SPA)"
3. 填写应用名称，如"文派AI"
4. 记录下应用的 `AppID`

### 1.3 配置应用
1. 在应用详情页面，找到"应用配置"
2. 配置以下信息：
   - **应用名称**: 文派AI
   - **应用描述**: AI内容适配工具
   - **应用类型**: 单页应用 (SPA)

## 2. 配置回调地址

### 2.1 开发环境
在 Authing 控制台的"应用配置"中，添加以下回调地址：
```
http://localhost:5173/callback
```

### 2.2 生产环境
添加您的生产环境回调地址：
```
https://你的-netlify地址.netlify.app/callback
```

## 3. 更新项目配置

### 3.1 修改配置文件
编辑 `src/config/authing.ts` 文件，替换以下配置：

```typescript
// 开发环境配置
const devConfig: AuthingConfig = {
  appId: '你的实际AppID', // 替换为您的 Authing AppID
  host: 'https://你的-authing-域名.authing.cn', // 替换为您的 Authing 域名
  redirectUri: 'http://localhost:5173/callback',
  mode: 'modal',
  defaultScene: 'login',
};

// 生产环境配置
const prodConfig: AuthingConfig = {
  appId: '你的实际AppID', // 替换为您的 Authing AppID
  host: 'https://你的-authing-域名.authing.cn', // 替换为您的 Authing 域名
  redirectUri: 'https://你的-netlify地址.netlify.app/callback', // 替换为您的实际域名
  mode: 'modal',
  defaultScene: 'login',
};
```

### 3.2 获取配置信息
1. **AppID**: 在 Authing 控制台的应用详情页面获取
2. **域名**: 在 Authing 控制台的"应用配置"中查看
3. **回调地址**: 根据您的部署环境设置

## 4. 功能特性

### 4.1 已实现的功能
- ✅ 用户登录/注册
- ✅ 用户状态管理
- ✅ 受保护路由
- ✅ 用户头像显示
- ✅ 登出功能
- ✅ 认证回调处理

### 4.2 路由保护
以下页面需要登录才能访问：
- `/adapt` - 内容适配工具
- `/invite` - 邀请页面
- `/brand-library` - 品牌库
- `/payment` - 支付页面
- `/profile` - 个人资料
- `/history` - 历史记录

### 4.3 公开页面
以下页面无需登录即可访问：
- `/` - 首页
- `/api-test` - API测试
- `/login-register` - 登录注册
- `/authing-login` - Authing登录
- `/callback` - 认证回调
- `/privacy` - 隐私政策
- `/terms` - 服务条款
- `/changelog` - 更新日志

## 5. 使用方法

### 5.1 访问登录页面
用户可以通过以下方式访问登录页面：
- 直接访问 `/authing-login`
- 点击页面上的"登录"按钮
- 访问需要登录的页面时自动重定向

### 5.2 用户状态
登录后，用户信息会保存在本地存储中，包括：
- 用户ID
- 用户名
- 邮箱
- 昵称
- 头像

### 5.3 登出
用户可以通过以下方式登出：
- 点击用户头像下拉菜单中的"退出登录"
- 清除浏览器本地存储

## 6. 开发调试

### 6.1 本地开发
```bash
npm run dev
```
访问 `http://localhost:5173/authing-login` 测试登录功能。

### 6.2 调试技巧
1. 打开浏览器开发者工具
2. 查看 Console 中的认证相关日志
3. 检查 Network 标签页中的 API 请求
4. 查看 Application 标签页中的本地存储

## 7. 部署注意事项

### 7.1 环境变量
建议将 Authing 配置信息设置为环境变量：

```typescript
const appId = import.meta.env.VITE_AUTHING_APP_ID;
const host = import.meta.env.VITE_AUTHING_HOST;
```

### 7.2 安全考虑
- 不要在客户端代码中暴露敏感信息
- 使用 HTTPS 协议
- 定期更新 Authing SDK 版本

## 8. 故障排除

### 8.1 常见问题
1. **登录失败**: 检查 AppID 和域名配置
2. **回调失败**: 确认回调地址配置正确
3. **跨域问题**: 确保域名在 Authing 白名单中

### 8.2 联系支持
如果遇到问题，可以：
- 查看 Authing 官方文档
- 联系 Authing 技术支持
- 检查项目 GitHub Issues

## 9. 更新日志

- v1.0.0: 初始版本，支持基本的登录/注册功能
- 后续版本将添加更多功能，如：
  - 社交登录
  - 多因素认证
  - 用户权限管理
  - 组织架构支持 