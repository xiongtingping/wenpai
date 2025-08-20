---
/**
 * ✅ FIXED: 2024-07-21 Authing配置文档已统一为新App ID和认证地址
 * App ID: 68823897631e1ef8ff3720b2
 * Host: rzcswqs4sq0f.authing.cn/68823897631e1ef8ff3720b2
 * 📌 历史内容仅供参考，所有实际配置请以本ID和域名为准
 */
---
# 🚨 Authing 域名修复指南

## 🎯 问题诊断

从日志中发现 Authing 配置使用了错误的域名：
```
host: 'wenpai.authing.cn'  // ❌ 错误域名
```

应该使用：
```
host: 'rzcswqs4sq0f.authing.cn/68823897631e1ef8ff3720b2'  // ✅ 正确域名
```

## 🔧 修复步骤

### 第1步：修复本地环境变量

**文件**: `.env.local`

**修改前**:
```bash
VITE_AUTHING_HOST=wenpai.authing.cn
VITE_AUTHING_REDIRECT_URI_DEV=http://localhost:5173/callback
```

**修改后**:
```bash
VITE_AUTHING_HOST=rzcswqs4sq0f.authing.cn/68823897631e1ef8ff3720b2
VITE_AUTHING_REDIRECT_URI_DEV=http://localhost:5173/
```

### 第2步：强制使用正确域名

已在 `src/config/authing.ts` 中强制使用正确域名：
```typescript
// 强制使用正确的域名，忽略环境变量中的错误配置
host = 'rzcswqs4sq0f.authing.cn/68823897631e1ef8ff3720b2';
```

### 第3步：更新 Authing 后台配置

进入 [Authing 后台](https://console.authing.cn/console/6867fdc7b4558b8b92d8ea6d/application/self-built-apps/detail/68823897631e1ef8ff3720b2?app_detail_active_tab=quick_start)

**更新配置**：

#### 认证地址
```
https://rzcswqs4sq0f.authing.cn/68823897631e1ef8ff3720b2
```

#### 登录回调 URL
```
http://localhost:5173/
```

#### 登出回调 URL
```
http://localhost:5173/
```

### 第4步：清除缓存并重新测试

1. 按 `Ctrl+Shift+R` (Windows) 或 `Cmd+Shift+R` (Mac) 强制刷新
2. 清除浏览器缓存和 Cookie
3. 重新访问 http://localhost:5173
4. 测试登录功能

## 🎯 关键配置

### 正确的配置
- **App ID**: `68823897631e1ef8ff3720b2`
- **Host**: `rzcswqs4sq0f.authing.cn/68823897631e1ef8ff3720b2`
- **回调地址**: `http://localhost:5173/`

### 错误的配置
- **Host**: `wenpai.authing.cn` ❌
- **回调地址**: `http://localhost:5173/callback` ❌

## 🎉 预期结果

修复后应该：
- ✅ 不再出现 JSON 解析错误
- ✅ 登录弹窗正常打开
- ✅ 登录流程顺畅
- ✅ 正确跳转回应用

## 🔍 验证方法

在浏览器控制台运行：
```javascript
// 检查当前 Authing 配置
console.log('🔧 当前配置:');
console.log('Host:', 'rzcswqs4sq0f.authing.cn/68823897631e1ef8ff3720b2');
console.log('回调地址:', window.location.origin + '/');
```

---

**修复时间**: 2025年7月19日  
**当前端口**: 5173  
**状态**: 🔧 域名已修复，等待测试 