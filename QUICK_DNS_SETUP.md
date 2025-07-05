# 🌐 Namecheap DNS 快速配置指南

## 🎯 目标
将域名 `wenpai.xyz` 通过 Namecheap DNS 解析绑定到 Netlify 部署的应用

## 📋 前提条件
- ✅ 已部署到 Netlify
- ✅ 已获取 Netlify 分配的域名
- ✅ 已登录 Namecheap 账户

## 🔧 配置步骤

### 1. 访问 Namecheap DNS 管理页面
**链接**: https://ap.www.namecheap.com/domains/domaincontrolpanel/wenpai.xyz/advancedns

### 2. 登录 Namecheap 账户
使用你的 Namecheap 账户登录

### 3. 配置 DNS 记录

#### 方法一：使用 Netlify 提供的 DNS 记录（推荐）

1. 在 Netlify 控制台 → Domain settings → Custom domains
2. 添加自定义域名：`www.wenpai.xyz`
3. Netlify 会自动提供具体的 DNS 记录
4. 复制这些记录到 Namecheap DNS 管理页面

#### 方法二：手动配置

在 Namecheap Advanced DNS 的 "Host Records" 部分添加以下记录：

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

### 4. 保存配置
点击 "Save All Changes" 保存所有更改

## 🔍 验证配置

### 本地验证
```bash
# 检查 DNS 记录
nslookup www.wenpai.xyz
dig www.wenpai.xyz

# 检查网站可访问性
curl -I https://www.wenpai.xyz
```

### 在线验证工具
- https://www.whatsmydns.net/
- https://dnschecker.org/
- https://toolbox.googleapps.com/apps/dig/

输入域名：`www.wenpai.xyz`

## ⏱️ DNS 传播时间
- **本地**: 几分钟到几小时
- **全球**: 24-48 小时
- **完全传播**: 最多 72 小时

## 🔐 Authing 配置
完成 DNS 配置后，请配置 Authing 回调地址：

1. 访问：https://console.authing.cn/
2. 配置回调地址：`https://www.wenpai.xyz/callback`
3. 配置登出地址：`https://www.wenpai.xyz`

## 🧪 功能测试
DNS 配置完成后，测试以下功能：

1. 访问 https://www.wenpai.xyz/
2. 测试 Authing 登录功能
3. 测试受保护路由
4. 检查用户头像显示

## 🐛 常见问题

### DNS 记录不生效
- 检查 TTL 设置（建议使用 Automatic）
- 等待 DNS 传播时间
- 清除本地 DNS 缓存

### 网站无法访问
- 确认 Netlify 部署成功
- 检查 DNS 记录是否正确
- 验证域名是否使用 HTTPS

### 登录失败
- 检查 Authing 回调地址配置
- 确认域名使用 HTTPS 协议
- 查看浏览器控制台错误

## 📞 技术支持

如果遇到问题：
1. 检查 Namecheap DNS 记录
2. 验证 Netlify 部署状态
3. 确认 Authing 配置
4. 查看浏览器开发者工具

---

**💡 提示：配置完成后，运行 `./dns-verify.sh` 验证 DNS 配置状态。** 