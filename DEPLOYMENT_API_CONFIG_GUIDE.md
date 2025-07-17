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
VITE_OPENAI_API_KEY=sk-your-actual-openai-api-key
VITE_AUTHING_APP_ID=6867fdc88034eb95ae86167d
VITE_AUTHING_HOST=https://qutkgzkfaezk-demo.authing.cn
VITE_AUTHING_REDIRECT_URI_PROD=https://www.wenpai.xyz/callback

# 可选配置
VITE_DEEPSEEK_API_KEY=sk-your-actual-deepseek-api-key
VITE_GEMINI_API_KEY=your-actual-gemini-api-key
VITE_CREEM_API_KEY=creem_your-actual-creem-api-key
VITE_API_BASE_URL=https://www.wenpai.xyz/api
```

#### 步骤4: 重新部署
1. 点击 "Deploys" 标签
2. 点击 "Trigger deploy" → "Deploy site"
3. 等待部署完成

### 2. Vercel 部署配置

#### 步骤1: 登录Vercel控制台
1. 访问 https://vercel.com/
2. 使用GitHub账号登录

#### 步骤2: 导入项目
1. 点击 "New Project"
2. 选择你的GitHub仓库
3. 配置构建设置：
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. 点击 "Deploy"

#### 步骤3: 配置环境变量
1. 在项目设置中，点击 "Environment Variables"
2. 添加以下环境变量：

```bash
# 必需配置
VITE_OPENAI_API_KEY=sk-your-actual-openai-api-key
VITE_AUTHING_APP_ID=6867fdc88034eb95ae86167d
VITE_AUTHING_HOST=https://qutkgzkfaezk-demo.authing.cn
VITE_AUTHING_REDIRECT_URI_PROD=https://your-vercel-domain.vercel.app/callback

# 可选配置
VITE_DEEPSEEK_API_KEY=sk-your-actual-deepseek-api-key
VITE_GEMINI_API_KEY=your-actual-gemini-api-key
VITE_CREEM_API_KEY=creem_your-actual-creem-api-key
VITE_API_BASE_URL=https://your-vercel-domain.vercel.app/api
```

#### 步骤4: 重新部署
1. 在 "Deployments" 标签中
2. 点击 "Redeploy" 重新部署

### 3. GitHub Pages 部署配置

#### 步骤1: 创建GitHub Secrets
1. 在GitHub仓库中，点击 "Settings" → "Secrets and variables" → "Actions"
2. 添加以下Repository secrets：

```bash
# 必需配置
VITE_OPENAI_API_KEY=sk-your-actual-openai-api-key
VITE_AUTHING_APP_ID=6867fdc88034eb95ae86167d
VITE_AUTHING_HOST=https://qutkgzkfaezk-demo.authing.cn
VITE_AUTHING_REDIRECT_URI_PROD=https://your-username.github.io/your-repo/callback

# 可选配置
VITE_DEEPSEEK_API_KEY=sk-your-actual-deepseek-api-key
VITE_GEMINI_API_KEY=your-actual-gemini-api-key
VITE_CREEM_API_KEY=creem_your-actual-creem-api-key
```

#### 步骤2: 配置GitHub Actions
创建 `.github/workflows/deploy.yml` 文件：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      env:
        VITE_OPENAI_API_KEY: ${{ secrets.VITE_OPENAI_API_KEY }}
        VITE_AUTHING_APP_ID: ${{ secrets.VITE_AUTHING_APP_ID }}
        VITE_AUTHING_HOST: ${{ secrets.VITE_AUTHING_HOST }}
        VITE_AUTHING_REDIRECT_URI_PROD: ${{ secrets.VITE_AUTHING_REDIRECT_URI_PROD }}
        VITE_DEEPSEEK_API_KEY: ${{ secrets.VITE_DEEPSEEK_API_KEY }}
        VITE_GEMINI_API_KEY: ${{ secrets.VITE_GEMINI_API_KEY }}
        VITE_CREEM_API_KEY: ${{ secrets.VITE_CREEM_API_KEY }}
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### 4. 自建服务器部署配置

#### 步骤1: 创建环境变量文件
在服务器上创建 `.env.production` 文件：

```bash
# 必需配置
VITE_OPENAI_API_KEY=sk-your-actual-openai-api-key
VITE_AUTHING_APP_ID=6867fdc88034eb95ae86167d
VITE_AUTHING_HOST=https://qutkgzkfaezk-demo.authing.cn
VITE_AUTHING_REDIRECT_URI_PROD=https://your-domain.com/callback

# 可选配置
VITE_DEEPSEEK_API_KEY=sk-your-actual-deepseek-api-key
VITE_GEMINI_API_KEY=your-actual-gemini-api-key
VITE_CREEM_API_KEY=creem_your-actual-creem-api-key
VITE_API_BASE_URL=https://your-domain.com/api
```

#### 步骤2: 构建和部署
```bash
# 安装依赖
npm ci

# 构建项目
npm run build

# 部署到服务器
# 将 dist 目录内容复制到服务器的Web根目录
```

## 🔍 配置验证

### 1. 使用配置测试页面
访问 `/api-config-test` 页面进行配置验证：

```bash
# 开发环境
http://localhost:5173/api-config-test

# 生产环境
https://your-domain.com/api-config-test
```

### 2. 检查配置状态
配置测试页面会显示：
- ✅ 配置状态概览
- 📊 配置统计信息
- ❌ 配置错误列表
- ⚠️ 配置警告列表
- 💡 配置建议

### 3. 验证API连接
在配置测试页面中可以：
- 测试各个API的连接状态
- 验证API密钥格式
- 检查环境变量是否正确加载

## 🔑 API密钥获取

### OpenAI API密钥
1. 访问 https://platform.openai.com/api-keys
2. 登录或注册OpenAI账户
3. 点击 "Create new secret key"
4. 复制生成的密钥（以 `sk-` 开头）

### DeepSeek API密钥
1. 访问 https://platform.deepseek.com/
2. 注册账户并登录
3. 在API设置中获取密钥（以 `sk-` 开头）

### Gemini API密钥
1. 访问 https://makersuite.google.com/app/apikey
2. 使用Google账户登录
3. 创建新的API密钥

### Creem支付API密钥
1. 访问 https://creem.io/
2. 注册并登录Creem账户
3. 在控制台获取API密钥（以 `creem_` 开头）

## 🛠️ 故障排除

### 常见问题

#### 1. 环境变量未生效
```bash
# 检查环境变量是否正确设置
console.log(import.meta.env.VITE_OPENAI_API_KEY);

# 重新加载配置
import { reloadAPIConfig } from '@/config/apiConfig';
reloadAPIConfig();
```

#### 2. API密钥无效
```bash
# 验证API密钥格式
import { isValidAPIKey } from '@/config/apiConfig';
const isValid = isValidAPIKey(apiKey, 'openai');
```

#### 3. 部署后配置丢失
- 确保在部署平台的环境变量设置中正确配置
- 检查环境变量名称是否正确（必须以 `VITE_` 开头）
- 重新部署项目

#### 4. 跨域问题
- 确保Authing回调地址配置正确
- 检查CORS设置
- 验证域名配置

### 调试模式

启用调试模式查看详细配置信息：

```bash
# 在环境变量中设置
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

## 📊 配置监控

### 开发环境
- 控制台输出配置加载信息
- 实时配置验证
- 错误和警告提示

### 生产环境
- 配置状态页面
- 错误日志记录
- 性能监控

## 🔒 安全注意事项

### API密钥安全
1. **不要硬编码**：永远不要在代码中直接写入API密钥
2. **环境变量**：使用环境变量存储敏感信息
3. **访问控制**：限制API密钥的访问权限
4. **定期轮换**：定期更新API密钥
5. **监控使用**：监控API密钥的使用情况

### 部署安全
1. **HTTPS**：生产环境必须使用HTTPS
2. **域名验证**：确保域名配置正确
3. **回调地址**：正确配置Authing回调地址
4. **CORS设置**：配置适当的跨域策略

## 📝 配置检查清单

### 部署前检查
- [ ] 所有必需的API密钥已获取
- [ ] 环境变量已正确配置
- [ ] 域名和回调地址已设置
- [ ] HTTPS证书已安装
- [ ] 配置测试通过

### 部署后验证
- [ ] 网站可以正常访问
- [ ] 登录功能正常工作
- [ ] API接口正常响应
- [ ] 配置测试页面显示正确
- [ ] 错误日志正常记录

## 🆘 获取帮助

如果遇到配置问题：

1. **查看配置测试页面**：访问 `/api-config-test` 获取详细诊断
2. **检查控制台日志**：查看浏览器控制台的错误信息
3. **验证环境变量**：确认环境变量是否正确设置
4. **联系技术支持**：提供详细的错误信息和配置状态

---

**注意**：本文档中的API密钥示例仅用于说明格式，请使用您自己的真实API密钥。 