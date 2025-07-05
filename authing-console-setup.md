# 🔐 Authing 控制台配置指南

## 📋 访问 Authing 控制台

1. 访问：https://console.authing.cn/
2. 登录你的 Authing 账户
3. 找到应用：文派AI

## 🔧 应用配置

### 基本信息
- **应用名称**: 文派AI
- **应用 ID**: 6867fdc88034eb95ae86167d
- **应用域名**: https://qutkgzkfaezk-demo.authing.cn

### 回调地址配置

#### 开发环境
```
登录回调 URL: http://localhost:5173/callback
登出回调 URL: http://localhost:5173
```

#### 生产环境
```
登录回调 URL: https://www.wenpai.xyz/callback
登出回调 URL: https://www.wenpai.xyz
```

### 安全配置
- **允许的 Web 起源**: 
  - http://localhost:5173
  - https://www.wenpai.xyz
- **允许的 CORS 起源**:
  - http://localhost:5173
  - https://www.wenpai.xyz

## 🔍 验证配置

1. 保存配置后，等待几分钟生效
2. 在本地测试登录功能
3. 部署到生产环境后测试
4. 检查浏览器控制台是否有错误

## 🐛 常见问题

### 登录失败
- 检查回调地址是否正确
- 确认域名使用 HTTPS（生产环境）
- 验证应用 ID 和域名

### 回调错误
- 检查回调 URL 格式
- 确认路由配置正确
- 验证 CORS 设置

### 组件加载失败
- 检查依赖包是否正确安装
- 确认导入语句正确
- 验证 TypeScript 类型
