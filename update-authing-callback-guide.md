# 🔧 Authing 回调URL配置更新指南

## 📋 当前配置状态

根据测试结果，新的Authing应用配置基本正确：

- ✅ **App ID**: `687bc631c105de597b993202`
- ✅ **域名**: `wenpaiai.authing.cn`
- ✅ **配置格式**: 全部正确
- ✅ **端点连接**: 大部分端点可访问

## ⚠️ 需要更新的配置

### 1. 登录回调URL
**当前设置**: `https://console.authing.cn/console/get-started/687bc631c105de597b993202`
**需要改为**: `http://localhost:5173/callback`

### 2. 登出回调URL
**当前设置**: 空
**建议设置**: `http://localhost:5173/`

## 🔧 更新步骤

### 步骤1: 登录Authing控制台
1. 访问: https://console.authing.cn
2. 登录您的账户
3. 进入应用管理页面

### 步骤2: 编辑应用配置
1. 找到应用 "wenpai" (ID: 687bc631c105de597b993202)
2. 点击 "应用详情"
3. 找到 "认证配置" 部分

### 步骤3: 更新回调URL
1. **登录回调URL**: 将 `https://console.authing.cn/console/get-started/687bc631c105de597b993202` 改为 `http://localhost:5173/callback`
2. **登出回调URL**: 设置为 `http://localhost:5173/`
3. 点击 "保存" 按钮

### 步骤4: 验证配置
1. 保存后，确认配置已更新
2. 检查应用状态是否为 "正常"

## 🧪 测试验证

### 1. 启动开发服务器
```bash
npm run dev
```

### 2. 访问测试页面
打开浏览器访问: http://localhost:5173/test-authing-new.html

### 3. 测试登录功能
1. 点击 "测试 Authing 登录" 按钮
2. 在新窗口中完成登录流程
3. 验证是否成功跳转回应用

## 📝 配置说明

### 开发环境配置
- **登录回调URL**: `http://localhost:5173/callback`
- **登出回调URL**: `http://localhost:5173/`
- **域名**: `wenpaiai.authing.cn`

### 生产环境配置（部署时更新）
- **登录回调URL**: `https://www.wenpai.xyz/callback`
- **登出回调URL**: `https://www.wenpai.xyz/`
- **域名**: `wenpaiai.authing.cn`

## 🔍 故障排除

### 常见问题
1. **回调URL不匹配**: 确保Authing控制台中的回调URL与应用中的完全一致
2. **CORS错误**: 确保域名配置正确
3. **认证失败**: 检查App ID和域名是否正确

### 调试方法
1. 打开浏览器开发者工具
2. 查看Network标签页的网络请求
3. 检查Console标签页的错误信息
4. 使用测试页面验证配置

## ✅ 完成检查清单

- [ ] 更新Authing控制台中的登录回调URL
- [ ] 设置登出回调URL
- [ ] 保存配置
- [ ] 启动开发服务器
- [ ] 测试登录功能
- [ ] 验证回调处理
- [ ] 测试注册功能

## 📞 技术支持

如果遇到问题，请检查：
1. Authing控制台配置是否正确
2. 网络连接是否正常
3. 浏览器控制台是否有错误信息
4. 应用日志中的详细错误信息 