# 环境配置说明

## 1. 环境变量配置

创建 `.env.local` 文件并添加以下配置：

```bash
# Authing 配置
VITE_AUTHING_APP_ID=你的AppID
VITE_AUTHING_HOST=https://你的-authing-域名.authing.cn
VITE_AUTHING_REDIRECT_URI_DEV=http://localhost:5173/callback
VITE_AUTHING_REDIRECT_URI_PROD=https://你的-netlify地址.netlify.app/callback

# API 配置
VITE_API_BASE_URL=http://localhost:3000/api

# 其他配置
VITE_APP_NAME=文派AI
VITE_APP_VERSION=1.0.0
```

## 2. 更新配置文件

编辑 `src/config/authing.ts` 文件，使用环境变量：

```typescript
// 开发环境配置
const devConfig: AuthingConfig = {
  appId: import.meta.env.VITE_AUTHING_APP_ID || '你的AppID',
  host: import.meta.env.VITE_AUTHING_HOST || 'https://你的-authing-域名.authing.cn',
  redirectUri: import.meta.env.VITE_AUTHING_REDIRECT_URI_DEV || 'http://localhost:5173/callback',
  mode: 'modal',
  defaultScene: 'login',
};

// 生产环境配置
const prodConfig: AuthingConfig = {
  appId: import.meta.env.VITE_AUTHING_APP_ID || '你的AppID',
  host: import.meta.env.VITE_AUTHING_HOST || 'https://你的-authing-域名.authing.cn',
  redirectUri: import.meta.env.VITE_AUTHING_REDIRECT_URI_PROD || 'https://你的-netlify地址.netlify.app/callback',
  mode: 'modal',
  defaultScene: 'login',
};
```

## 3. 部署配置

### Netlify 部署
在 Netlify 的环境变量中设置：
- `VITE_AUTHING_APP_ID`
- `VITE_AUTHING_HOST`
- `VITE_AUTHING_REDIRECT_URI_PROD`

### Vercel 部署
在 Vercel 的环境变量中设置相同的变量。

## 4. 安全注意事项

- 不要将 `.env.local` 文件提交到版本控制
- 生产环境使用 HTTPS
- 定期更新 Authing SDK 版本 