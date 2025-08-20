# Namecheap DNS 配置 + Netlify 部署完整指南

## 🎯 目标
将域名 `wenpai.xyz` 通过 Namecheap DNS 解析绑定到 Netlify 部署的应用

## 📋 当前状态
- ✅ 项目代码已准备就绪
- ✅ Authing 配置已更新
- ✅ 代码已推送到 GitHub
- ⏳ 等待 Netlify 部署
- ⏳ 等待 DNS 配置

## 🔧 Netlify 部署步骤

### 1. 连接 GitHub 仓库
1. 登录 [Netlify](https://app.netlify.com/)
2. 点击 "Add new site" → "Import an existing project"
3. 选择 GitHub，授权访问
4. 选择仓库：`xiongtingping/wenpai`
5. 选择分支：`restore-caa083d`

### 2. 配置构建参数
```
Build command: npm run build
Publish directory: dist
```

### 3. 设置环境变量
在 Netlify 控制台 → Site settings → Environment variables 中添加：

```
VITE_AUTHING_APP_ID=68823897631e1ef8ff3720b2
VITE_AUTHING_HOST=https://qutkgzkfaezk-demo.authing.cn
VITE_AUTHING_REDIRECT_URI_PROD=https://www.wenpai.xyz/callback
```

### 4. 启动部署
点击 "Deploy site"，等待构建完成

## 🌐 Namecheap DNS 配置

### 1. 登录 Namecheap 控制台
访问：[https://ap.www.namecheap.com/domains/domaincontrolpanel/wenpai.xyz/advancedns](https://ap.www.namecheap.com/domains/domaincontrolpanel/wenpai.xyz/advancedns)

### 2. 获取 Netlify 分配的域名
部署完成后，Netlify 会分配一个域名，格式如：`https://random-name-123456.netlify.app`

### 3. 配置 DNS 记录

#### 方法一：使用 Netlify 提供的 DNS 记录
在 Netlify 控制台 → Domain settings → Custom domains 中：
1. 添加自定义域名：`www.wenpai.xyz`
2. Netlify 会提供具体的 DNS 记录

#### 方法二：手动配置（推荐）
在 Namecheap Advanced DNS 中添加：

**A 记录（主域名）：**
```
Type: A Record
Host: @
Value: 75.2.60.5
TTL: Automatic
```

**CNAME 记录（www 子域名）：**
```
Type: CNAME Record
Host: www
Value: [你的-Netlify-域名].netlify.app
TTL: Automatic
```

**CNAME 记录（通配符）：**
```
Type: CNAME Record
Host: *
Value: [你的-Netlify-域名].netlify.app
TTL: Automatic
```

### 4. 验证 DNS 配置
```bash
# 检查 DNS 记录
nslookup www.wenpai.xyz
dig www.wenpai.xyz

# 在线工具验证
# https://www.whatsmydns.net/
# https://dnschecker.org/
```

## 🔐 Authing 配置

### 1. 登录 Authing 控制台
访问：[https://console.authing.cn/](https://console.authing.cn/)

### 2. 配置回调地址
在应用配置中添加：

**登录回调 URL：**
```
https://www.wenpai.xyz/callback
```

**登出回调 URL：**
```
https://www.wenpai.xyz
```

## 🧪 功能测试清单

### 1. 基础功能测试
- [ ] 访问 https://www.wenpai.xyz/
- [ ] 页面加载正常
- [ ] 样式显示正确
- [ ] 路由跳转正常

### 2. Authing 登录测试
- [ ] 访问 https://www.wenpai.xyz/authing-login
- [ ] Authing Guard 组件正常显示
- [ ] 点击登录按钮
- [ ] 跳转到 Authing 登录页面
- [ ] 输入用户名密码登录
- [ ] 成功跳转回 /callback 页面
- [ ] 自动跳转到首页
- [ ] 用户信息正确显示

### 3. 受保护路由测试
- [ ] 未登录时访问 /adapt
- [ ] 自动重定向到登录页面
- [ ] 登录后访问 /adapt
- [ ] 正常显示页面内容
- [ ] 用户头像显示正确
- [ ] 登出功能正常

### 4. 认证测试页面
- [ ] 访问 https://www.wenpai.xyz/auth-test
- [ ] 显示认证状态
- [ ] 显示用户信息
- [ ] 功能测试按钮正常

## ⏱️ 时间线

### 立即执行
1. Netlify 部署项目
2. 获取 Netlify 分配的域名

### 部署完成后
1. 配置 Namecheap DNS 记录
2. 配置 Authing 回调地址

### DNS 传播期间（24-48小时）
1. 监控 DNS 传播状态
2. 准备功能测试

### 传播完成后
1. 全面功能测试
2. 性能优化
3. 监控配置

## 🐛 常见问题解决

### DNS 传播问题
- 使用不同地区的 DNS 检查工具
- 清除本地 DNS 缓存
- 等待 24-48 小时完全传播

### 登录失败
- 检查 Authing 回调地址配置
- 确认域名 HTTPS 协议
- 查看浏览器控制台错误

### 页面显示异常
- 检查 Netlify 构建日志
- 验证环境变量配置
- 清除浏览器缓存

## 📞 技术支持

如果遇到问题：
1. 查看 Netlify 构建日志
2. 检查 Namecheap DNS 记录
3. 验证 Authing 控制台配置
4. 查看浏览器开发者工具

---

**部署完成后，请按照此指南逐步配置 DNS 和测试功能。** 