# 🚀 Authing 快速修复指南

## 🎯 核心问题
Authing 后台仍使用旧域名，导致登录失败。

## ⚡ 快速修复步骤

### 第1步：修改认证地址 ⭐ **最重要**
1. 进入 [Authing 后台](https://console.authing.cn/console/6867fdc7b4558b8b92d8ea6d/application/self-built-apps/detail/68823897631e1ef8ff3720b2?app_detail_active_tab=quick_start)
2. 找到"认证地址"字段
3. 将 `https://68823897631e1ef8ff3720b2` 改为 `https://68823897631e1ef8ff3720b2`
4. 点击"保存"

### 第2步：添加回调 URL
在"登录回调 URL"中添加：
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

在"登出回调 URL"中添加：
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

### 第3步：测试
1. 保存所有配置
2. 刷新浏览器页面
3. 尝试登录

## ⚠️ 注意事项
- **登出端点**：无法手动修改，会自动更新
- **端口支持**：添加多个端口支持 Vite 自动端口选择
- **保存配置**：每次修改后都要点击保存

## ✅ 验证
修复后应该能看到：
- 认证地址：`https://68823897631e1ef8ff3720b2`
- 登出端点：`https://68823897631e1ef8ff3720b2/oidc/session/end`（自动生成）
- 登录功能正常工作 