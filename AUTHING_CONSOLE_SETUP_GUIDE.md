# 🔐 Authing控制台配置指南

## 📋 配置概览

**配置时间**: 2025-01-05  
**应用名称**: 文派AI  
**配置状态**: ✅ **已完成环境变量配置**

## 🔧 环境变量配置

### 已配置的环境变量

```bash
# Authing 应用配置
VITE_AUTHING_APP_ID=6867fdc88034eb95ae86167d
VITE_AUTHING_APP_SECRET=1b367e317a66d623ab35f89a3e853e43
VITE_AUTHING_HOST=https://qutkgzkfaezk-demo.authing.cn

# 回调地址配置
VITE_AUTHING_REDIRECT_URI_DEV=http://localhost:5173/callback
VITE_AUTHING_REDIRECT_URI_PROD=https://www.wenpai.xyz/callback
VITE_AUTHING_REDIRECT_URI_NETLIFY=https://*.netlify.app/callback
```

## 🌐 Authing控制台配置步骤

### 1. 登录Authing控制台
访问: https://console.authing.cn/

### 2. 进入应用管理
1. 在左侧菜单找到"应用管理"
2. 点击进入应用列表
3. 找到应用ID为 `6867fdc88034eb95ae86167d` 的应用

### 3. 配置登录回调URL
在应用详情页面，找到"应用配置"标签，添加以下回调URL：

#### 开发环境
```
http://localhost:5173/callback
```

#### 生产环境
```
https://www.wenpai.xyz/callback
```

#### Netlify部署环境
```
https://*.netlify.app/callback
```

### 4. 配置登出回调URL
添加以下登出回调URL：

#### 开发环境
```
http://localhost:5173
```

#### 生产环境
```
https://www.wenpai.xyz
```

### 5. 配置允许的Web起源
在"安全配置"中添加：

#### 开发环境
```
http://localhost:5173
```

#### 生产环境
```
https://www.wenpai.xyz
```

#### Netlify部署环境
```
https://*.netlify.app
```

### 6. 配置CORS起源
在"跨域配置"中添加：

#### 开发环境
```
http://localhost:5173
```

#### 生产环境
```
https://www.wenpai.xyz
```

#### Netlify部署环境
```
https://*.netlify.app
```

## 🔍 配置验证清单

### 基础配置验证
- [ ] 应用状态：已启用
- [ ] 应用类型：单页应用 (SPA)
- [ ] 应用域名：https://qutkgzkfaezk-demo.authing.cn

### 回调地址验证
- [ ] 登录回调URL：已添加所有环境
- [ ] 登出回调URL：已添加所有环境
- [ ] 回调地址格式：正确（不包含协议前缀）

### 安全配置验证
- [ ] 允许的Web起源：已配置
- [ ] CORS起源：已配置
- [ ] 域名白名单：已包含所有域名

## 🧪 功能测试

### 1. 开发环境测试
1. 访问: http://localhost:5173/authing-login-test
2. 点击"运行所有测试"
3. 验证配置状态
4. 测试登录功能

### 2. 生产环境测试
1. 部署到生产环境
2. 访问: https://www.wenpai.xyz/authing-login-test
3. 验证配置状态
4. 测试登录功能

### 3. Netlify部署测试
1. 部署到Netlify
2. 访问对应的Netlify域名
3. 验证配置状态
4. 测试登录功能

## 🐛 常见问题解决

### 问题1: redirect_uri_mismatch 错误
**原因**: 回调URL配置不正确
**解决**: 
1. 检查Authing控制台的回调URL配置
2. 确保URL格式完全正确（包括协议、端口、路径）
3. 确保没有多余的空格或特殊字符

### 问题2: 登录页面无法加载
**原因**: 网络连接或配置问题
**解决**:
1. 检查网络连接
2. 验证Authing服务状态
3. 检查浏览器控制台错误信息

### 问题3: 回调处理失败
**原因**: 回调页面路由配置问题
**解决**:
1. 检查前端路由配置
2. 验证回调页面组件
3. 检查URL参数处理

## 📝 配置完成确认

### 环境变量配置 ✅
- [x] App ID: 6867fdc88034eb95ae86167d
- [x] App Secret: 1b367e317a66d623ab35f89a3e853e43
- [x] Host: https://qutkgzkfaezk-demo.authing.cn
- [x] 开发环境回调: http://localhost:5173/callback
- [x] 生产环境回调: https://www.wenpai.xyz/callback
- [x] Netlify回调: https://*.netlify.app/callback

### 代码配置 ✅
- [x] 配置文件更新: src/config/authing.ts
- [x] 环境变量支持: 开发和生产环境
- [x] 测试页面: /authing-login-test
- [x] 路由配置: App.tsx

### 下一步操作
1. **Authing控制台配置**: 按照上述步骤配置回调URL
2. **功能测试**: 访问测试页面验证配置
3. **生产部署**: 部署到生产环境并测试
4. **监控设置**: 设置用户行为监控

## 🎯 配置状态

**当前状态**: ✅ **环境变量配置完成**  
**下一步**: 🔧 **需要在Authing控制台配置回调URL**  
**预计完成时间**: 5-10分钟

配置完成后，Authing登录系统将完全正常工作，支持开发、生产和Netlify部署环境。 