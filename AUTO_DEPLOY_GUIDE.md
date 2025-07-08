# 🚀 文派自动部署指南

## ✅ 准备工作已完成
- ✅ 代码已推送到GitHub
- ✅ 项目构建成功 (npm run build)
- ✅ Netlify配置文件已优化 (netlify.toml)
- ✅ 构建脚本已配置 (package.json)

## 🔧 Netlify自动部署设置

### 步骤1: 连接GitHub仓库

1. **访问Netlify控制台**: https://app.netlify.com/
2. **点击"New site from Git"**
3. **选择"GitHub"**
4. **授权Netlify访问GitHub**
   - 如果首次使用，需要授权Netlify访问你的GitHub账户
   - 选择"Authorize Netlify"
5. **选择仓库**: 找到并选择 `wenpai` 仓库

### 步骤2: 配置构建设置

Netlify会自动检测到 `netlify.toml` 配置，但请确认以下设置：

```
Branch to deploy: main
Build command: npm run build  
Publish directory: dist
Functions directory: netlify/functions
```

**高级设置**:
- Node.js version: 18 (已在netlify.toml中配置)
- Build timeout: 15分钟

### 步骤3: 环境变量配置

在 **Site settings → Environment variables** 中添加：

```bash
# Authing配置
VITE_AUTHING_APP_ID=你的Authing应用ID
VITE_AUTHING_DOMAIN=你的Authing域名

# API密钥
VITE_OPENAI_API_KEY=你的OpenAI密钥
VITE_DEEPSEEK_API_KEY=你的DeepSeek密钥  
VITE_GEMINI_API_KEY=你的Gemini密钥

# 环境配置
NODE_ENV=production
NODE_VERSION=18
```

### 步骤4: 部署触发

点击 **"Deploy site"** 开始首次部署

## 🔄 自动部署工作流

设置完成后，每当你：
- Push代码到`main`分支
- 合并Pull Request到`main`分支

Netlify会自动：
1. 检测到代码变更
2. 拉取最新代码
3. 执行 `npm run build`
4. 部署到生产环境
5. 发送部署通知

## 🌐 域名配置

### 添加自定义域名

1. **Domain settings → Custom domains**
2. **点击"Add custom domain"**
3. **输入**: `www.wenpai.xyz`
4. **配置DNS记录**:

```bash
# Namecheap DNS配置
# 访问: https://ap.www.namecheap.com/domains/domaincontrolpanel/wenpai.xyz/advancedns

# A记录 (主域名)
Type: A Record
Host: @
Value: 75.2.60.5 (Netlify主IP)
TTL: Automatic

# CNAME记录 (www子域名)
Type: CNAME Record  
Host: www
Value: [你的站点名].netlify.app
TTL: Automatic
```

### 启用HTTPS

Netlify会自动为自定义域名配置Let's Encrypt SSL证书。

## 🧪 部署验证

### 自动检查项目
- ✅ 构建日志无错误
- ✅ 所有页面正常加载
- ✅ API功能正常
- ✅ 登录功能正常
- ✅ SSL证书已配置

### 测试环境变量
访问你的网站，打开开发者工具检查：
- Authing登录是否正常
- API调用是否成功
- 无控制台错误

## 🔧 Authing回调地址更新

部署成功后，更新Authing配置：

1. **访问**: https://console.authing.cn/
2. **应用 → 应用配置 → 登录回调URL**:
   ```
   https://www.wenpai.xyz/callback
   https://www.wenpai.xyz/auth/callback
   ```
3. **登出回调URL**:
   ```
   https://www.wenpai.xyz
   ```

## 📊 监控和维护

### Netlify仪表板功能
- **Deploy previews**: 查看部署预览
- **Build logs**: 检查构建日志
- **Analytics**: 查看网站分析
- **Functions**: 监控API函数

### 分支部署
- `main`分支 → 生产环境
- 其他分支 → 预览环境 (如果需要)

## 🚨 故障排除

### 构建失败
1. 检查构建日志
2. 验证环境变量
3. 确认依赖版本兼容性

### 域名问题
1. 验证DNS记录
2. 检查域名解析: `nslookup www.wenpai.xyz`
3. 等待DNS传播 (最多48小时)

### API问题
1. 检查环境变量是否正确
2. 验证API密钥有效性
3. 检查Netlify Functions日志

## 🎉 部署完成！

设置完成后，你的文派应用将拥有：
- ✅ 全自动CI/CD流水线
- ✅ 自定义域名和SSL
- ✅ 全球CDN加速
- ✅ 无服务器函数支持
- ✅ 实时部署预览
- ✅ 自动错误监控

每次代码更新都会自动部署到生产环境！🚀 