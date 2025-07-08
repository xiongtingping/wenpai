# 🌐 Netlify DNS 配置指南

## 📋 获取 DNS 记录

1. 在 Netlify 控制台 → Domain settings → Custom domains
2. 添加域名：www.wenpai.xyz
3. Netlify 会提供具体的 DNS 记录

## 🔧 Namecheap DNS 配置

访问：https://ap.www.namecheap.com/domains/domaincontrolpanel/wenpai.xyz/advancedns

### 添加以下记录：

**A 记录（主域名）：**
```
Type: A Record
Host: @
Value: [Netlify 提供的 IP 地址]
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

## 🔍 验证配置

配置完成后，运行：
```bash
./dns-verify.sh
```

## ⏱️ DNS 传播时间
- 本地：几分钟到几小时
- 全球：24-48 小时
