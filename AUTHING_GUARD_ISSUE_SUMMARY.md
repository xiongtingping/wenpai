# Authing Guard 加载问题总结

## 问题描述

在测试 Authing Guard 弹窗功能时，遇到了 `AuthingGuard 未加载` 的错误。经过分析，主要问题是：

1. **本地文件路径问题**：本地安装的 `@authing/guard` 包中的文件没有正确导出全局变量
2. **CDN 链接问题**：某些 CDN 链接可能不可用或路径不正确
3. **模块加载方式问题**：不同的加载方式（UMD、ESM、全局变量）需要不同的处理方式

## 问题分析

### 1. 本地文件分析

检查了本地安装的 `@authing/guard` 包：
- `node_modules/@authing/guard/dist/global/guard.min.js` - 压缩文件，变量名被压缩
- `node_modules/@authing/guard/dist/esm/guard.min.js` - ESM 模块，需要 import 语法

### 2. CDN 链接测试

测试了多个 CDN 链接：
- `https://cdn.authing.co/packages/web/latest/index.js` - Authing 官方 CDN
- `https://cdn.jsdelivr.net/npm/@authing/guard@latest/dist/global/guard.min.js` - jsDelivr CDN
- `https://unpkg.com/@authing/guard@latest/dist/global/guard.min.js` - unpkg CDN

### 3. 模块加载方式

- **UMD 版本**：应该导出全局变量 `AuthingGuard` 或 `Guard`
- **ESM 版本**：需要使用 `import` 语法
- **React 版本**：专门用于 React 应用

## 解决方案

### 1. 推荐的 CDN 链接

```html
<!-- 使用 unpkg CDN（推荐） -->
<script src="https://unpkg.com/@authing/guard@latest/dist/global/guard.min.js"></script>
<link rel="stylesheet" href="https://unpkg.com/@authing/guard@latest/dist/global/guard.min.css">

<!-- 备用方案：jsDelivr CDN -->
<script src="https://cdn.jsdelivr.net/npm/@authing/guard@latest/dist/global/guard.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@authing/guard@latest/dist/global/guard.min.css">
```

### 2. 正确的初始化代码

```javascript
// 检查加载状态
function checkLoadStatus() {
    if (typeof AuthingGuard !== 'undefined') {
        console.log('✅ AuthingGuard 已成功加载！');
        initializeGuard(AuthingGuard);
    } else if (typeof Guard !== 'undefined') {
        console.log('✅ Guard 已成功加载！');
        initializeGuard(Guard);
    } else {
        console.log('❌ AuthingGuard 未加载');
    }
}

// 初始化 Guard
function initializeGuard(GuardClass) {
    const guard = new GuardClass({
        appId: 'your-app-id',
        mode: 'modal',
        config: {
            mode: 'modal',
            defaultScenes: 'login',
            // 弹窗模式额外配置
            autoRegister: false,
            skipComplateFileds: false,
            skipComplateFiledsPlace: 'modal',
            closeable: true,
            clickCloseableMask: true,
            // 登录配置
            loginMethodList: ['password', 'phone-code', 'email-code'],
            // 注册配置
            registerMethodList: ['phone', 'email'],
            // 界面配置
            logo: 'https://cdn.authing.co/authing-console/logo.png',
            title: '文派',
            // 国际化
            lang: 'zh-CN',
        }
    });

    // 监听事件
    guard.on('login', (user) => {
        console.log('登录成功:', user);
    });

    guard.on('login-error', (error) => {
        console.log('登录失败:', error);
    });

    guard.on('close', () => {
        console.log('弹窗已关闭');
    });

    return guard;
}
```

### 3. 主应用修复

对于主应用中的 `useAuthing` Hook，建议：

1. **使用正确的导入方式**：
```typescript
import { Guard } from '@authing/guard-react';
```

2. **确保配置正确**：
```typescript
const config = {
    appId: 'your-app-id',
    mode: 'modal',
    config: {
        mode: 'modal',
        defaultScenes: 'login',
        // ... 其他配置
    }
};
```

3. **添加错误处理**：
```typescript
try {
    const guard = new Guard(config);
    // 初始化成功
} catch (error) {
    console.error('初始化 Guard 失败:', error);
}
```

## 测试页面

创建了多个测试页面来验证不同的加载方式：

1. **test-authing-cdn.html** - 使用 jsDelivr CDN
2. **test-authing-simple.html** - 使用 Authing 官方 CDN
3. **test-authing-local-esm.html** - 使用本地 ESM 模块
4. **test-authing-final.html** - 使用 unpkg CDN（推荐）

## 验证步骤

1. 打开测试页面
2. 检查加载状态是否显示成功
3. 点击"显示登录弹窗"按钮
4. 验证弹窗是否正常显示
5. 测试密码框焦点是否正常
6. 尝试登录操作
7. 验证登录成功后弹窗是否自动关闭

## 成功标准

- ✅ AuthingGuard 成功加载
- ✅ 登录弹窗正常显示
- ✅ 密码框焦点正常（不会自动跳转到账号输入框）
- ✅ 登录流程顺畅
- ✅ 登录成功后弹窗自动关闭
- ✅ 用户状态正确同步

## 问题排查

如果仍然遇到问题，请检查：

1. **网络连接**：确保可以访问 CDN 链接
2. **浏览器控制台**：查看是否有 JavaScript 错误
3. **CORS 设置**：确保没有跨域问题
4. **App ID 配置**：确保使用了正确的 Authing 应用 ID
5. **域名配置**：确保在 Authing 控制台中配置了正确的域名

## 总结

通过使用正确的 CDN 链接和配置，Authing Guard 弹窗功能应该能够正常工作。推荐使用 unpkg CDN 作为主要方案，jsDelivr CDN 作为备用方案。对于主应用，建议使用 `@authing/guard-react` 包而不是直接加载 CDN 文件。 