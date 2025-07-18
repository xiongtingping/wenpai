# 🚀 部署环境API配置指南

## 📋 概述

本文档详细说明如何在各种部署平台上正确配置API，确保所有API都从部署环境的设置中调取，而不是硬编码在代码中。

## 🎯 配置目标

- ✅ 所有API配置从环境变量读取
- ✅ 支持开发和生产环境自动切换
- ✅ 统一的配置验证和错误处理
- ✅ 安全的密钥管理
- ✅ 完整的配置测试工具

## 🔧 环境变量配置

### 必需的环境变量

```bash
# OpenAI API配置（必需）
VITE_OPENAI_API_KEY=sk-your-actual-openai-api-key

# Authing认证配置（必需）
VITE_AUTHING_APP_ID=6867fdc88034eb95ae86167d
VITE_AUTHING_HOST=https://qutkgzkfaezk-demo.authing.cn
VITE_AUTHING_REDIRECT_URI_PROD=https://www.wenpai.xyz/callback
```

### 可选的环境变量

```bash
# DeepSeek API配置（可选）
VITE_DEEPSEEK_API_KEY=sk-your-actual-deepseek-api-key

# Gemini API配置（可选）
VITE_GEMINI_API_KEY=your-actual-gemini-api-key

# Creem支付API配置（可选）
VITE_CREEM_API_KEY=creem_your-actual-creem-api-key

# 后端API配置（可选）
VITE_API_BASE_URL=https://www.wenpai.xyz/api

# 支付宝配置（可选）
VITE_ALIPAY_APP_ID=your-actual-alipay-app-id
VITE_ALIPAY_PUBLIC_KEY=your-actual-alipay-public-key
VITE_ALIPAY_PRIVATE_KEY=your-actual-alipay-private-key

# 微信支付配置（可选）
VITE_WECHAT_APP_ID=your-actual-wechat-app-id
VITE_WECHAT_MCH_ID=your-actual-wechat-mch-id
VITE_WECHAT_API_KEY=your-actual-wechat-api-key
```

## 🌐 部署平台配置

### 1. Netlify 部署配置

#### 步骤1: 登录Netlify控制台
1. 访问 https://app.netlify.com/
2. 使用GitHub账号登录

#### 步骤2: 创建新站点
1. 点击 "Add new site"
2. 选择 "Deploy manually"
3. 将 `dist` 文件夹拖拽到部署区域
4. 等待部署完成

#### 步骤3: 配置环境变量
1. 在Netlify控制台中，进入你的站点
2. 点击 "Site settings" → "Environment variables"
3. 添加以下环境变量：

```bash
# 必需配置
OPENAI_API_KEY=sk-your-actual-openai-api-key
AUTHING_APP_ID=6867fdc88034eb95ae86167d
AUTHING_HOST=https://qutkgzkfaezk-demo.authing.cn

# 可选配置
DEEPSEEK_API_KEY=sk-your-actual-deepseek-api-key
GEMINI_API_KEY=your-actual-gemini-api-key
CREEM_API_KEY=your-actual-creem-api-key
API_BASE_URL=https://www.wenpai.xyz/api
DEBUG_MODE=false
LOG_LEVEL=info
```

#### 步骤4: 配置重定向规则
在 `netlify.toml` 文件中添加：

```toml
[[redirects]]
  from = "/"
  to = "/.netlify/functions/config-injector"
  status = 200
  force = false

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 2. Vercel 部署配置

#### 步骤1: 安装Vercel CLI
```bash
npm install -g vercel
```

#### 步骤2: 登录Vercel
```bash
vercel login
```

#### 步骤3: 部署项目
```bash
vercel --prod
```

#### 步骤4: 配置环境变量
在Vercel控制台中设置环境变量：

```bash
# 必需配置
VITE_OPENAI_API_KEY=sk-your-actual-openai-api-key
VITE_AUTHING_APP_ID=6867fdc88034eb95ae86167d
VITE_AUTHING_HOST=https://qutkgzkfaezk-demo.authing.cn

# 可选配置
VITE_DEEPSEEK_API_KEY=sk-your-actual-deepseek-api-key
VITE_GEMINI_API_KEY=your-actual-gemini-api-key
VITE_CREEM_API_KEY=your-actual-creem-api-key
```

### 3. 其他平台配置

#### GitHub Pages
1. 在GitHub仓库设置中配置Secrets
2. 使用GitHub Actions构建和部署
3. 在Actions中设置环境变量

#### AWS S3 + CloudFront
1. 在AWS Systems Manager中存储参数
2. 使用Lambda@Edge注入配置
3. 配置CloudFront函数处理配置注入

## 🔒 安全最佳实践

### 1. 密钥管理
- ✅ 使用环境变量存储敏感信息
- ✅ 定期轮换API密钥
- ✅ 使用最小权限原则
- ✅ 监控API使用量

### 2. 配置验证
- ✅ 部署前验证配置完整性
- ✅ 运行时检查配置有效性
- ✅ 提供配置错误提示
- ✅ 记录配置加载日志

### 3. 错误处理
- ✅ 优雅处理配置缺失
- ✅ 提供用户友好的错误信息
- ✅ 实现降级策略
- ✅ 监控和告警

## 🧪 配置测试

### 1. 本地测试
```bash
# 检查配置
node check-ai-config.cjs

# 测试API连接
node test-ai-api.cjs

# 启动开发服务器
npm run dev
```

### 2. 生产测试
```bash
# 访问测试页面
https://your-domain.com/ai-config-test
https://your-domain.com/api-config-test

# 检查控制台日志
# 查看配置验证结果
```

### 3. 自动化测试
```bash
# 运行配置检查
npm run test:config

# 运行API连接测试
npm run test:api

# 运行端到端测试
npm run test:e2e
```

## 📊 监控和日志

### 1. 配置监控
- 监控配置加载状态
- 记录配置错误
- 统计配置使用情况
- 告警配置异常

### 2. API监控
- 监控API调用成功率
- 记录API响应时间
- 统计API使用量
- 告警API异常

### 3. 安全监控
- 监控异常访问
- 记录安全事件
- 统计风险行为
- 告警安全威胁

## 🔄 更新和维护

### 1. 配置更新
```bash
# 更新环境变量
# 重新部署应用
# 验证配置生效
# 监控应用状态
```

### 2. 密钥轮换
```bash
# 生成新密钥
# 更新环境变量
# 部署新配置
# 验证功能正常
# 删除旧密钥
```

### 3. 版本管理
```bash
# 记录配置变更
# 版本化配置
# 回滚机制
# 变更通知
```

## 📞 故障排除

### 1. 常见问题
- **配置未生效**: 检查环境变量名称和值
- **API调用失败**: 验证API密钥有效性
- **构建失败**: 检查配置语法错误
- **部署失败**: 验证平台配置

### 2. 调试步骤
1. 检查环境变量设置
2. 验证配置加载
3. 测试API连接
4. 查看错误日志
5. 联系技术支持

### 3. 应急处理
- 启用降级模式
- 使用备用配置
- 临时禁用功能
- 紧急回滚

---

**重要提醒**: 
1. 永远不要将API密钥提交到版本控制系统
2. 定期检查和更新配置
3. 监控API使用量和成本
4. 保持配置文档的更新 