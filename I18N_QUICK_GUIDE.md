# 国际化快速操作指南

## 快速开始

### 1. 修改单个文件的步骤

#### React组件 (.tsx/.jsx)

**步骤1: 添加import**
```typescript
import { useTranslation } from 'react-i18next';
```

**步骤2: 使用hook**
```typescript
const MyComponent: React.FC = () => {
  const { t } = useTranslation();

  // ...
};
```

**步骤3: 替换硬编码文本**
```typescript
// ❌ 之前
<div>页面加载失败</div>
<button>保存</button>
throw new Error('配置失败');

// ✅ 之后
<div>{t('common.errors.pageLoadFailed')}</div>
<button>{t('common.save')}</button>
throw new Error(t('api.errors.configFailed'));
```

**步骤4: 添加翻译到语言文件**

编辑 `src/i18n/locales/zh-CN.json`:
```json
{
  "common": {
    "errors": {
      "pageLoadFailed": "页面加载失败"
    }
  }
}
```

编辑 `src/i18n/locales/en-US.json`:
```json
{
  "common": {
    "errors": {
      "pageLoadFailed": "Page load failed"
    }
  }
}
```

#### TypeScript文件 (.ts)

对于非组件的TS文件,需要直接导入i18n实例:

```typescript
import i18n from '@/i18n';

// 使用
const message = i18n.t('api.errors.requestFailed');
console.log(message);
```

### 2. 翻译键命名规范

**层级结构:**
```
命名空间.子命名空间.具体键名
```

**示例:**
```
common.save                           // 通用 > 保存
common.errors.networkFailed           // 通用 > 错误 > 网络失败
pages.brandLibrary.title              // 页面 > 品牌库 > 标题
api.aiService.generateFailed          // API > AI服务 > 生成失败
components.auth.loginButton           // 组件 > 认证 > 登录按钮
```

**命名规则:**
- 使用驼峰命名 (camelCase)
- 英文命名,有意义
- 动词+名词 或 名词+状态
- 保持简洁清晰

**好的例子:**
```
configFailed          ✅  配置失败
userNotFound          ✅  用户未找到
saveSuccess           ✅  保存成功
networkConnectionLost ✅  网络连接丢失
```

**不好的例子:**
```
配置失败              ❌  使用中文
error1                ❌  没有意义
a                     ❌  太简短
thisIsAVeryLongKeyNameThatDescribesEverythingInDetail ❌  太长
```

### 3. 命名空间分配

根据文件路径选择命名空间:

| 文件位置 | 命名空间 | 示例 |
|---------|---------|------|
| `/src/pages/` | `pages.*` | `pages.home.welcome` |
| `/src/components/` | `components.*` | `components.header.logo` |
| `/src/api/` | `api.*` | `api.errors.timeout` |
| `/src/services/` | `services.*` | `services.auth.loginFailed` |
| `/src/utils/` | `utils.*` | `utils.format.invalidDate` |
| `/src/config/` | `config.*` | `config.theme.dark` |
| `/src/prompts/` | `prompts.*` | `prompts.title.generate` |
| 通用文本 | `common.*` | `common.save` |

### 4. 处理动态内容

**使用插值:**
```typescript
// 在组件中
<div>{t('user.greeting', { name: userName })}</div>

// 在语言文件中
{
  "user": {
    "greeting": "你好,{{name}}!"
  }
}
```

**使用复数:**
```typescript
// 在组件中
<div>{t('items.count', { count: itemCount })}</div>

// 在语言文件中
{
  "items": {
    "count_one": "{{count}} 个项目",
    "count_other": "{{count}} 个项目"
  }
}
```

### 5. 常用工具命令

**分析语言文件:**
```bash
cd /Users/xiong/wenpai
node scripts/analyze-chinese-keys.js
```

**重构语言文件:**
```bash
node scripts/refactor-language-files.js
```

**扫描硬编码(如果脚本存在):**
```bash
node scripts/i18n-scanner.js
```

**查看报告:**
```bash
cat i18n-scan-report.json | jq '.summary'
```

### 6. 快速查找待处理文件

**查找包含中文的TypeScript文件:**
```bash
grep -r "[\u4e00-\u9fa5]" src --include="*.ts" --include="*.tsx" -l
```

**统计某个文件的中文数量:**
```bash
grep -o "[\u4e00-\u9fa5]" src/App.tsx | wc -l
```

**查找未国际化的错误消息:**
```bash
grep -r "throw new Error(" src --include="*.ts" --include="*.tsx" | grep "[\u4e00-\u9fa5]"
```

### 7. 优先级指南

**🔴 高优先级 (立即处理):**
- 用户可见的UI文本
- 错误消息和提示
- 按钮和标签
- 页面标题

**🟡 中优先级 (尽快处理):**
- 配置项描述
- 日志消息
- 开发者提示

**🟢 低优先级 (最后处理):**
- 调试信息
- 注释中的中文
- 临时代码

### 8. 检查清单

处理每个文件时的检查项:

- [ ] 已添加 `useTranslation` import
- [ ] 已添加 `const { t } = useTranslation()` hook
- [ ] 所有UI文本已替换为 `t()` 调用
- [ ] 所有错误消息已国际化
- [ ] 已添加对应的中文翻译
- [ ] 已添加对应的英文翻译(或待翻译标记)
- [ ] 动态内容使用插值
- [ ] 代码可以正常运行
- [ ] 测试语言切换功能

### 9. 常见问题

**Q: 如何处理模板字符串中的中文?**
```typescript
// ❌ 错误
const msg = `用户 ${name} 登录成功`;

// ✅ 正确
const msg = t('auth.loginSuccess', { name });

// 语言文件
{
  "auth": {
    "loginSuccess": "用户 {{name}} 登录成功"
  }
}
```

**Q: 如何处理条件文本?**
```typescript
// ❌ 错误
const status = isActive ? '激活' : '未激活';

// ✅ 正确
const status = isActive ? t('status.active') : t('status.inactive');
```

**Q: 如何处理数组中的文本?**
```typescript
// ❌ 错误
const options = ['选项1', '选项2', '选项3'];

// ✅ 正确
const options = [
  t('options.option1'),
  t('options.option2'),
  t('options.option3')
];

// 或者使用配置
const OPTIONS = ['option1', 'option2', 'option3'];
const options = OPTIONS.map(key => t(`options.${key}`));
```

**Q: 如何处理长文本?**
```typescript
// 对于很长的文本,可以在语言文件中使用数组或换行
{
  "help": {
    "longText": "这是第一段。\n\n这是第二段。\n\n这是第三段。"
  }
}

// 或者分段
{
  "help": {
    "paragraph1": "这是第一段。",
    "paragraph2": "这是第二段。",
    "paragraph3": "这是第三段。"
  }
}
```

### 10. 最佳实践

1. **一次提交一个模块** - 便于代码审查和回滚
2. **测试每次修改** - 确保功能正常
3. **保持键名一致** - 相同含义使用相同键
4. **复用通用文本** - 使用 `common.*` 命名空间
5. **写清晰的提交消息** - 如 `i18n: 国际化品牌库页面`
6. **更新文档** - 记录特殊处理方式

### 11. 实战示例

**示例1: 处理App.tsx**

修改前:
```typescript
<div>页面加载失败</div>
```

修改后:
```typescript
// 1. 添加 import (如果还没有)
import { useTranslation } from 'react-i18next';

// 2. 在组件中添加 hook
const { t } = useTranslation();

// 3. 替换文本
<div>{t('common.errors.pageLoadFailed')}</div>

// 4. 添加到语言文件
// zh-CN.json
{
  "common": {
    "errors": {
      "pageLoadFailed": "页面加载失败"
    }
  }
}

// en-US.json
{
  "common": {
    "errors": {
      "pageLoadFailed": "Page load failed"
    }
  }
}
```

**示例2: 处理API错误**

修改前:
```typescript
// src/api/aiService.ts
throw new Error('AI服务调用失败');
```

修改后:
```typescript
// 1. 添加 import
import i18n from '@/i18n';

// 2. 使用 i18n.t()
throw new Error(i18n.t('api.aiService.callFailed'));

// 3. 添加到语言文件
// zh-CN.json
{
  "api": {
    "aiService": {
      "callFailed": "AI服务调用失败"
    }
  }
}
```

---

## 附录: 完整命名空间结构

```
common
├── save, cancel, delete, edit, add, confirm
├── loading, error, success
├── errors
│   ├── networkFailed, timeout, unauthorized
│   ├── pageLoadFailed, dataLoadFailed
│   └── ...
├── buttons
├── labels
├── placeholders
└── messages

app
├── startup
├── routes
└── globalComponents

pages
├── home
├── brandLibrary
├── settings
├── profile
└── ...

components
├── auth
├── creative
├── hotTopics
└── ...

api
├── errors
├── aiService
├── auth
└── ...

services
prompts
emoji
utils
config
```

---

**创建日期**: 2025-10-01
**最后更新**: 2025-10-01
