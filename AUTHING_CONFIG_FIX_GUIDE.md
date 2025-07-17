# Authing控制台配置修复指南

## 🔍 问题诊断

从日志分析发现，您的Authing配置基本正确，但控制台中的回调URL配置格式有误。

**当前问题**：
- 回调URL被错误地用分号连接：`https://www.wenpai.xyz/callback;https://*.netlify.app/callback;http://localhost:5173/callback`
- 这导致Authing无法正确识别回调地址

## 🎯 解决方案

### 步骤1：登录Authing控制台
1. 访问：https://console.authing.cn
2. 使用您的账号登录

### 步骤2：找到应用配置
1. 进入"应用管理"
2. 找到您的应用（应用ID：`6867fdc88034eb95ae86167d`）
3. 点击"应用配置"

### 步骤3：修复回调URL配置
1. 进入"登录配置"标签页
2. 找到"回调地址"字段
3. **重要**：删除所有现有的回调URL
4. 逐个添加正确的回调URL（每行一个）：

```
http://localhost:5173/callback
https://www.wenpai.xyz/callback
https://*.netlify.app/callback
```

### 步骤4：保存配置
1. 点击"保存"按钮
2. 等待1-2分钟让配置生效

## ✅ 验证配置

### 方法1：测试登录流程
1. 重启开发服务器：
   ```bash
   pkill -f 'vite' && sleep 2 && npm run dev
   ```
2. 访问：http://localhost:5173
3. 点击"开始创作"按钮
4. 应该能正常跳转到Authing登录页面

### 方法2：检查生成的URL
正确的登录URL应该是：
```
https://qutkgzkfaezk-demo.authing.cn/login?app_id=6867fdc88034eb95ae86167d&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fcallback
```

## 🔧 当前配置信息

- **应用ID**: `6867fdc88034eb95ae86167d`
- **域名**: `qutkgzkfaezk-demo.authing.cn`
- **开发环境回调**: `http://localhost:5173/callback`
- **生产环境回调**: `https://www.wenpai.xyz/callback`

## ⚠️ 重要注意事项

1. **URL格式**：确保每个URL独占一行，不要用分号或空格分隔
2. **协议匹配**：开发环境使用`http://`，生产环境使用`https://`
3. **端口号**：确保包含正确的端口号（5173）
4. **路径**：回调路径必须是`/callback`

## 🚀 快速修复命令

```bash
# 重启开发服务器
pkill -f 'vite' && sleep 2 && npm run dev

# 验证配置
node verify-authing-config.js
```

## 📞 如果问题仍然存在

1. **检查应用状态**：确保Authing应用处于"启用"状态
2. **检查域名配置**：确认域名`qutkgzkfaezk-demo.authing.cn`是否正确
3. **清除缓存**：清除浏览器缓存和本地存储
4. **检查网络**：确保能正常访问Authing域名

## ✅ 成功标志

修复成功后，您应该看到：
- 点击按钮正常跳转到Authing登录页面
- 登录成功后正确跳转回应用
- 控制台不再出现404错误
- 回调URL格式正确

---

**最后更新**：2024年12月
**配置状态**：已验证正确 