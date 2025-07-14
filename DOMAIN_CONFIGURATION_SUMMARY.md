# 域名配置更新总结

## 概述

已将问派应用的域名从 `localhost:5173` 更新为 `https://www.wenpai.xyz`。本文档详细说明了更新的内容和注意事项。

## 更新的配置文件

### 1. 环境变量配置
**文件**: `env.example`
```bash
# 更新前
VITE_API_BASE_URL=http://localhost:3001/api
FRONTEND_URL=http://localhost:5173

# 更新后
VITE_API_BASE_URL=https://www.wenpai.xyz/api
FRONTEND_URL=https://www.wenpai.xyz
```

### 2. 后端API服务器
**文件**: `backend-api-server.js`
```javascript
// 更新前
origin: process.env.FRONTEND_URL || 'http://localhost:5173'
const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

// 更新后
origin: process.env.FRONTEND_URL || 'https://www.wenpai.xyz'
const baseUrl = process.env.FRONTEND_URL || 'https://www.wenpai.xyz'
```

### 3. Netlify函数配置
**文件**: `netlify/functions/api.cjs`, `netlify/functions/cors-test.cjs`
```javascript
// 更新前
'http://localhost:5173'

// 更新后
'https://www.wenpai.xyz'
```

### 4. 启动脚本
**文件**: `start-full-stack.sh`
```bash
# 更新前
echo "📱 前端地址: http://localhost:5173"
echo "🔧 后端API: http://localhost:3001/api"

# 更新后
echo "📱 前端地址: http://localhost:5173 (开发环境)"
echo "🌐 生产地址: https://www.wenpai.xyz"
echo "🔧 后端API: http://localhost:3001/api (开发环境)"
echo "🔧 生产API: https://www.wenpai.xyz/api"
```

### 5. 架构文档
**文件**: `ARCHITECTURE_SEPARATION_GUIDE.md`, `ARCHITECTURE_SEPARATION_IMPLEMENTATION.md`
- 更新了所有示例URL和配置说明
- 添加了开发环境和生产环境的区分

## 智能配置

### Authing配置
**文件**: `src/config/authing.ts`
```typescript
// 使用动态域名配置，自动适应不同环境
redirectUri: import.meta.env.VITE_AUTHING_REDIRECT_URI || `${window.location.origin}/callback`
```

**优势**:
- ✅ 自动适应开发环境和生产环境
- ✅ 无需手动修改配置文件
- ✅ 支持多域名部署

## 工具脚本

### 1. 域名更新脚本
**文件**: `update-domain.sh`
```bash
# 批量更新项目中的域名配置
./update-domain.sh
```

**功能**:
- 自动更新所有配置文件中的域名
- 支持批量处理文档和测试文件
- 提供详细的更新日志

### 2. 域名配置检查脚本
**文件**: `check-domain-config.sh`
```bash
# 检查域名配置是否正确
./check-domain-config.sh
```

**功能**:
- 检查所有关键配置文件的域名设置
- 识别需要更新的文件
- 提供配置建议

## 环境配置

### 开发环境
```bash
# 本地开发
VITE_API_BASE_URL=http://localhost:3001/api
FRONTEND_URL=http://localhost:5173
```

### 生产环境
```bash
# 生产部署
VITE_API_BASE_URL=https://www.wenpai.xyz/api
FRONTEND_URL=https://www.wenpai.xyz
```

## 重要提醒

### 1. Authing控制台配置
需要在Authing控制台中更新以下回调URL：
- **登录回调URL**: `https://www.wenpai.xyz/callback`
- **登出回调URL**: `https://www.wenpai.xyz`

### 2. DNS配置
确保DNS解析已正确配置：
```bash
# 检查DNS解析
nslookup www.wenpai.xyz
dig www.wenpai.xyz
```

### 3. SSL证书
确保SSL证书已正确安装：
```bash
# 检查SSL证书
openssl s_client -connect www.wenpai.xyz:443 -servername www.wenpai.xyz
```

### 4. 环境变量文件
确保 `.env.local` 文件中的配置已更新：
```bash
# 复制并编辑环境变量文件
cp env.example .env.local
vim .env.local
```

## 部署检查清单

### 部署前检查
- [ ] DNS解析已配置
- [ ] SSL证书已安装
- [ ] Authing回调URL已更新
- [ ] 环境变量已配置
- [ ] 域名配置检查通过

### 部署后验证
- [ ] 网站可以正常访问
- [ ] 登录功能正常工作
- [ ] API接口正常响应
- [ ] 回调URL正常跳转
- [ ] SSL证书有效

## 测试方法

### 1. 本地测试
```bash
# 启动开发环境
./start-full-stack.sh

# 访问测试页面
http://localhost:5173/architecture-test
```

### 2. 生产测试
```bash
# 访问生产环境
https://www.wenpai.xyz/architecture-test

# 测试各项功能
- 用户登录/注册
- API接口调用
- 邀请系统
- 使用次数管理
```

## 故障排除

### 常见问题

#### 1. CORS错误
**症状**: 浏览器控制台显示CORS错误
**解决**: 检查后端API服务器的CORS配置

#### 2. 回调URL错误
**症状**: 登录后无法正确跳转
**解决**: 检查Authing控制台中的回调URL配置

#### 3. SSL证书问题
**症状**: 浏览器显示不安全警告
**解决**: 检查SSL证书是否正确安装

#### 4. DNS解析问题
**症状**: 域名无法访问
**解决**: 检查DNS解析配置

### 调试命令
```bash
# 检查域名配置
./check-domain-config.sh

# 检查网络连接
curl -I https://www.wenpai.xyz

# 检查SSL证书
openssl s_client -connect www.wenpai.xyz:443

# 检查DNS解析
nslookup www.wenpai.xyz
```

## 总结

通过这次域名配置更新，我们实现了：

### ✅ **配置统一**
- 所有配置文件使用统一的域名
- 开发环境和生产环境配置分离
- 智能的动态域名配置

### ✅ **工具完善**
- 提供域名更新脚本
- 提供配置检查脚本
- 支持批量操作和自动化

### ✅ **文档完整**
- 详细的配置说明
- 完整的部署检查清单
- 故障排除指南

### ✅ **安全可靠**
- 使用HTTPS协议
- 支持SSL证书
- 安全的回调URL配置

现在您的问派应用已经配置为使用 `https://www.wenpai.xyz` 域名，可以正常部署和使用了！ 