# Netlify API 调用环境设置指南

## 概述
本文档介绍如何正确配置 Netlify 部署环境的 API 调用设置，包括环境变量配置、依赖安装和部署注意事项。

## 1. 环境变量配置

### 1.1 本地开发环境 (.env.local)
在项目根目录创建 `.env.local` 文件：

```bash
# AI API 配置
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here
VITE_OPENAI_ENDPOINT=https://api.openai.com/v1/chat/completions
VITE_OPENAI_MODEL=gpt-4o
VITE_OPENAI_TIMEOUT=30000

# Creem 支付 API 配置
VITE_CREEM_API_KEY=your-creem-api-key-here
VITE_CREEM_ENDPOINT=https://api.creem.io

# 开发环境配置
VITE_DEV_MODE=true
VITE_API_TIMEOUT=30000
VITE_MAX_RETRIES=3

# 功能开关
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_IMAGE_GENERATION=true
VITE_ENABLE_CONTENT_ADAPTATION=true

# 调试配置
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=info

# 安全配置
VITE_ENCRYPTION_KEY=your-custom-encryption-key-32-chars-long
VITE_SECURITY_LEVEL=high
VITE_ENABLE_SECURITY_LOGGING=true

# Authing 身份认证配置
VITE_AUTHING_APP_ID=6867fdc88034eb95ae86167d
VITE_AUTHING_SECRET=your-authing-secret-key
VITE_AUTHING_HOST=https://qutkgzkfaezk-demo.authing.cn
VITE_AUTHING_REDIRECT_URI_DEV=http://localhost:5173/callback
VITE_AUTHING_REDIRECT_URI_PROD=https://www.wenpai.xyz/callback

# 后端API配置
VITE_API_BASE_URL=https://www.wenpai.xyz/api
BACKEND_PORT=3001
FRONTEND_URL=https://www.wenpai.xyz

# 支付宝配置
VITE_ALIPAY_APP_ID=your-alipay-app-id
VITE_ALIPAY_PUBLIC_KEY=your-alipay-public-key
VITE_ALIPAY_PRIVATE_KEY=your-alipay-private-key

# 微信支付配置
VITE_WECHAT_APP_ID=your-wechat-app-id
VITE_WECHAT_MCH_ID=your-wechat-mch-id
VITE_WECHAT_API_KEY=your-wechat-api-key

# 数据库配置
MONGODB_URI=mongodb://localhost:27017
DB_NAME=wenpai
```

### 1.2 Netlify 生产环境变量
在 Netlify 控制台中设置以下环境变量：

#### 必需变量
- `CREEM_API_KEY`: Creem 支付 API 密钥
- `OPENAI_API_KEY`: OpenAI API 密钥
- `AUTHING_APP_ID`: Authing 应用 ID
- `AUTHING_SECRET`: Authing 密钥
- `AUTHING_HOST`: Authing 域名

#### 可选变量
- `NODE_ENV`: 设置为 `production`
- `VITE_ENCRYPTION_KEY`: 加密密钥
- `VITE_SECURITY_LEVEL`: 安全级别

## 2. 依赖安装

### 2.1 主项目依赖
```bash
npm install creem qrcode
```

### 2.2 Netlify Functions 依赖
```bash
cd netlify/functions
npm install
cd ../..
```

## 3. Netlify 配置

### 3.1 netlify.toml 配置
确保 `netlify.toml` 文件包含正确的配置：

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

  [build.environment]
    NODE_VERSION = "20"

# API重定向到Netlify函数
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

# 重定向规则 - 处理React Router的客户端路由
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  node_bundler = "esbuild"
```

### 3.2 函数配置
确保 `netlify/functions/` 目录下的函数文件正确配置：

- `checkout.cjs`: Creem 支付函数
- `api.cjs`: 通用 API 函数
- `package.json`: 函数依赖配置

## 4. 部署步骤

### 4.1 本地测试
```bash
# 安装依赖
npm install
cd netlify/functions && npm install && cd ../..

# 启动开发服务器
npm run dev
```

### 4.2 生产部署
```bash
# 构建项目
npm run build

# 部署到 Netlify
npm run deploy:netlify
```

## 5. 常见问题解决

### 5.1 依赖解析错误
如果遇到 `Could not resolve "creem"` 或 `Could not resolve "qrcode"` 错误：

1. 确保在主项目根目录执行：
   ```bash
   npm install creem qrcode
   ```

2. 确保在 `netlify/functions` 目录执行：
   ```bash
   cd netlify/functions
   npm install
   ```

### 5.2 API 调用失败
如果遇到 `Failed to fetch` 错误：

1. 检查环境变量是否正确设置
2. 确保 API 密钥有效且有足够余额
3. 检查网络连接和防火墙设置

### 5.3 函数构建失败
如果 Netlify Functions 构建失败：

1. 检查 `netlify/functions/package.json` 中的依赖
2. 确保使用正确的 Node.js 版本
3. 检查函数代码语法错误

## 6. 安全注意事项

1. **环境变量安全**：
   - 不要在代码中硬编码 API 密钥
   - 使用 Netlify 的环境变量功能
   - 定期轮换 API 密钥

2. **CORS 配置**：
   - 确保正确配置跨域请求
   - 限制允许的域名

3. **错误处理**：
   - 不要在错误响应中暴露敏感信息
   - 实现适当的错误日志记录

## 7. 监控和调试

### 7.1 Netlify 函数日志
在 Netlify 控制台中查看函数执行日志：
- 访问 Netlify 控制台
- 进入 Functions 页面
- 查看函数执行日志

### 7.2 本地调试
使用 Netlify CLI 进行本地调试：
```bash
npm install -g netlify-cli
netlify dev
```

## 8. 性能优化

1. **函数优化**：
   - 使用适当的 Node.js 版本
   - 优化依赖包大小
   - 实现缓存机制

2. **API 调用优化**：
   - 实现请求重试机制
   - 使用连接池
   - 实现响应缓存

## 9. 更新和维护

1. **定期更新依赖**：
   ```bash
   npm update
   cd netlify/functions && npm update && cd ../..
   ```

2. **监控 API 使用情况**：
   - 定期检查 API 调用量
   - 监控错误率
   - 优化调用频率

3. **备份配置**：
   - 备份环境变量配置
   - 备份函数代码
   - 记录配置变更

---

**注意**：请确保将示例中的 API 密钥替换为您的真实密钥，并妥善保管这些敏感信息。 