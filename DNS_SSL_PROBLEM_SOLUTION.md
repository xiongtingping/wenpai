# DNS和SSL问题详细解决方案

## 🔍 问题分析

**错误信息**: `ERR_SSL_PROTOCOL_ERROR`
**根本原因**: DNS解析不一致导致SSL证书验证失败

## 📊 诊断发现

### DNS解析不一致问题

**本地DNS解析**:
```
wenpai.xyz → 13.215.239.219, 52.74.6.109 (Netlify IP)
```

**Google DNS解析**:
```
wenpai.xyz → 75.2.60.5, 99.83.190.102 (不同的IP)
```

**问题**: 不同DNS服务器返回不同的IP地址，导致SSL证书验证失败

### SSL证书状态
- ✅ **证书有效**: Let's Encrypt证书，有效期至2025年10月12日
- ✅ **证书匹配**: 证书CN为wenpai.xyz
- ❌ **IP不匹配**: 证书不包含75.2.60.5这个IP地址

## 🛠️ 解决方案

### 方案1: 修复DNS配置（推荐）

**问题**: 根域名wenpai.xyz的A记录配置错误

**解决步骤**:

1. **登录NS1控制台**: https://portal.nsone.net/
2. **找到wenpai.xyz域名**
3. **检查A记录配置**:
   - 当前可能有错误的A记录指向75.2.60.5
   - 需要删除或修改这些记录

4. **正确的A记录配置**:
   ```
   主机名: @ (或留空)
   记录类型: A
   目标: 52.74.6.109
   TTL: 3600
   ```

5. **或者使用CNAME记录**:
   ```
   主机名: @ (或留空)
   记录类型: CNAME
   目标: 68735af653fbc7000871a882--wenpai.netlify.app
   TTL: 3600
   ```

### 方案2: 强制使用正确的IP

**临时解决方案**: 在hosts文件中强制解析

```bash
# 编辑hosts文件
sudo nano /etc/hosts

# 添加以下行
52.74.6.109 wenpai.xyz
13.215.239.219 wenpai.xyz
```

### 方案3: 使用www子域名

**临时解决方案**: 使用www.wenpai.xyz访问

- ✅ www.wenpai.xyz 配置正确
- ✅ SSL证书正常
- ✅ 可以正常访问

## 🔧 验证步骤

### 1. 检查DNS传播
```bash
# 使用不同DNS服务器检查
dig wenpai.xyz @8.8.8.8
dig wenpai.xyz @1.1.1.1
dig wenpai.xyz @dns1.p01.nsone.net
```

### 2. 检查SSL证书
```bash
# 检查证书详情
openssl s_client -connect wenpai.xyz:443 -servername wenpai.xyz

# 检查证书IP
openssl s_client -connect wenpai.xyz:443 -servername wenpai.xyz | grep -i "subject alternative name"
```

### 3. 测试连接
```bash
# 测试HTTP连接
curl -I http://wenpai.xyz

# 测试HTTPS连接
curl -I https://wenpai.xyz

# 强制使用特定IP
curl -I https://wenpai.xyz --resolve wenpai.xyz:443:52.74.6.109
```

## 📋 当前状态

### 正确的配置
```
www.wenpai.xyz → 68735af653fbc7000871a882--wenpai.netlify.app ✅
wenpai.xyz → 52.74.6.109, 13.215.239.219 ✅ (本地)
wenpai.xyz → 75.2.60.5, 99.83.190.102 ❌ (Google DNS)
```

### 问题根源
- NS1中的根域名A记录配置错误
- 可能有多条冲突的A记录
- DNS传播不一致

## 🚀 立即行动

### 1. 检查NS1配置
- 登录NS1控制台
- 检查wenpai.xyz的所有A记录
- 删除指向75.2.60.5的记录
- 确保只保留正确的Netlify IP

### 2. 临时解决方案
- 使用www.wenpai.xyz访问网站
- 或者等待DNS传播完成（可能需要24小时）

### 3. 验证修复
- 等待DNS传播后测试
- 使用不同DNS服务器验证
- 检查SSL证书验证

## 🔗 相关链接

- **NS1控制台**: https://portal.nsone.net/
- **Netlify控制台**: https://app.netlify.com/
- **DNS检查工具**: https://dnschecker.org/
- **SSL检查工具**: https://www.ssllabs.com/ssltest/

## 📞 技术支持

### 常见问题
1. **DNS传播延迟**: 可能需要24小时
2. **缓存问题**: 清除浏览器和系统缓存
3. **证书问题**: 确保证书包含正确的域名

### 联系支持
- **NS1支持**: 检查DNS记录配置
- **Netlify支持**: 确认域名绑定状态
- **Let's Encrypt**: SSL证书问题

---

## ✅ 解决确认

**主要问题**: DNS解析不一致导致SSL证书验证失败

**解决优先级**:
1. 修复NS1中的A记录配置
2. 等待DNS传播完成
3. 验证SSL证书正常工作

**临时解决方案**: 使用www.wenpai.xyz访问

---

*诊断时间: 2025-07-14*  
*问题类型: DNS配置错误*  
*建议操作: 修复NS1 A记录* 