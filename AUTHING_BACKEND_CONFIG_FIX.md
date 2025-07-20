# Authing 后台配置修复指南

## 🚨 发现的问题

根据 [Authing 后台设置页面](https://console.authing.cn/console/6867fdc7b4558b8b92d8ea6d/application/self-built-apps/detail/6867fdc88034eb95ae86167d?app_detail_active_tab=quick_start) 的截图，发现了以下配置问题：

### 1. 域名配置错误
- **当前配置**: `https://qutkgzkfaezk-demo.authing.cn`
- **正确配置**: `https://wenpai.authing.cn`

### 2. 端口不匹配
- **后台配置**: `localhost:5177`
- **实际运行**: `localhost:5175`

### 3. 登出端点无法修改
- **说明**: 登出端点通常是根据认证地址自动生成的，无法手动修改
- **解决方案**: 只需要修改认证地址，登出端点会自动更新

## 🔧 需要修复的配置

### 认证配置部分

#### 1. 认证地址 ⭐ **重要**
```
当前: https://qutkgzkfaezk-demo.authing.cn
修改为: https://wenpai.authing.cn
```

#### 2. 登出端点 ⚠️ **自动生成**
```
说明: 此字段无法手动修改，会根据认证地址自动生成
预期: https://wenpai.authing.cn/oidc/session/end
```

#### 3. 登录回调 URL ⭐ **重要**
需要添加以下回调 URL：
```
http://localhost:5173/callback
http://localhost:5174/callback
http://localhost:5175/callback
http://localhost:5176/callback
http://localhost:5177/callback
http://localhost:5178/callback
http://localhost:5179/callback
http://localhost:5180/callback
https://www.wenpai.xyz/callback
https://wenpai.netlify.app/callback
```

#### 4. 登出回调 URL ⭐ **重要**
需要添加以下回调 URL：
```
http://localhost:5173/
http://localhost:5174/
http://localhost:5175/
http://localhost:5176/
http://localhost:5177/
http://localhost:5178/
http://localhost:5179/
http://localhost:5180/
https://www.wenpai.xyz/
```

## 📋 操作步骤

### 步骤 1: 更新认证地址 ⭐ **最重要**
1. 进入 [Authing 应用配置页面](https://console.authing.cn/console/6867fdc7b4558b8b92d8ea6d/application/self-built-apps/detail/6867fdc88034eb95ae86167d?app_detail_active_tab=quick_start)
2. 找到"认证地址"字段
3. 将 `https://qutkgzkfaezk-demo.authing.cn` 修改为 `https://wenpai.authing.cn`
4. 点击"保存"
5. **注意**: 保存后，登出端点会自动更新为 `https://wenpai.authing.cn/oidc/session/end`

### 步骤 2: 更新回调 URL
1. 找到"登录回调 URL"字段
2. 添加所有开发环境的回调 URL（支持多个端口）
3. 确保包含生产环境的回调 URL
4. 点击"保存"

### 步骤 3: 更新登出回调 URL
1. 找到"登出回调 URL"字段
2. 添加所有开发环境的回调 URL
3. 确保包含生产环境的回调 URL
4. 点击"保存"

## 🔍 验证步骤

### 1. 测试认证地址 ✅
```bash
curl -I https://wenpai.authing.cn
# 预期结果: HTTP/2 302 (重定向到登录页面)
```

### 2. 测试登出端点 ✅
```bash
curl -I https://wenpai.authing.cn/oidc/session/end
# 预期结果: HTTP/2 200 (端点可访问)
```

### 3. 测试配置 API ✅
```bash
curl -I https://wenpai.authing.cn/api/v2/applications/6867fdc88034eb95ae86167d/public-config
# 预期结果: HTTP/2 200 (配置可获取)
```

### 4. 测试登录流程
1. 启动开发服务器
2. 访问应用
3. 尝试登录
4. 检查回调是否成功

## ⚠️ 注意事项

1. **登出端点**: 无法手动修改，会根据认证地址自动生成
2. **端口范围**: 建议添加 5173-5180 范围内的所有端口，因为 Vite 会自动选择可用端口
3. **生产环境**: 确保生产环境的回调 URL 正确配置
4. **HTTPS**: 生产环境必须使用 HTTPS
5. **保存配置**: 每次修改后都要点击"保存"按钮

## 🎯 预期结果

修复完成后：
- ✅ 认证地址使用正确的域名
- ✅ 登出端点自动更新为正确地址
- ✅ 支持多个开发端口
- ✅ 登录回调正常工作
- ✅ 登出回调正常工作
- ✅ 生产环境配置正确

## 📞 如果仍有问题

如果修复后仍有问题，请检查：
1. 浏览器控制台的错误信息
2. 网络请求的状态码
3. Authing 后台的日志
4. 环境变量配置
5. 确认认证地址已正确更新 