# Authing 配置指导

## 🎯 当前问题

Authing 后台配置完全缺失，导致登录功能无法正常工作。

## 🔧 配置步骤

### 第1步：访问 Authing 控制台

打开链接：[Authing 控制台](https://console.authing.cn/console/6867fdc7b4558b8b92d8ea6d/application/self-built-apps/detail/6867fdc88034eb95ae86167d?app_detail_active_tab=quick_start)

### 第2步：配置应用基本信息

1. **应用名称**：`文派`
2. **应用描述**：`AI内容创作平台`
3. **应用类型**：`单页应用 (SPA)`

### 第3步：配置回调 URL

#### 登录回调 URL
```
http://localhost:5173/
```

#### 登出回调 URL
```
http://localhost:5173/
```

### 第4步：配置认证地址

#### 认证地址
```
https://qutkgzkfaezk-demo.authing.cn
```

### 第5步：保存配置

点击"保存"按钮，等待配置生效（通常需要1-2分钟）。

## ✅ 验证配置

配置完成后，运行以下命令验证：

```bash
node verify-authing-config.cjs
```

预期输出：
```
✅ Authing 服务连接正常
✅ 回调 URL 配置正确
✅ App ID 已设置
✅ 应用名称已设置
```

## 🚀 测试登录

1. 访问：http://localhost:5173
2. 点击登录按钮
3. 观察 Authing Guard 弹窗是否正常打开
4. 测试登录和注册功能

## 📋 配置清单

- [ ] 应用名称设置
- [ ] 应用描述设置
- [ ] 登录回调 URL 配置
- [ ] 登出回调 URL 配置
- [ ] 认证地址配置
- [ ] 配置保存
- [ ] 功能测试

## 🔍 故障排除

### 如果仍然出现 JSON 解析错误

1. **检查回调 URL 格式**：确保没有多余的斜杠或路径
2. **清除浏览器缓存**：强制刷新页面
3. **等待配置生效**：Authing 配置可能需要几分钟才能生效
4. **检查网络连接**：确保可以访问 `qutkgzkfaezk-demo.authing.cn`

### 如果 Authing Guard 无法打开

1. **检查 App ID**：确保 App ID 正确
2. **检查域名配置**：确保使用正确的域名
3. **检查控制台错误**：查看浏览器控制台是否有错误信息

## 📞 需要帮助

如果配置过程中遇到问题，请：

1. 截图显示当前配置页面
2. 提供具体的错误信息
3. 运行验证脚本并分享输出结果 