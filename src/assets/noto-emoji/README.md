# Noto Emoji 集成

本目录包含从 [Google Noto Emoji 开源项目](https://github.com/googlefonts/noto-emoji) 集成的资源和代码。

## 项目概述

Google Noto Emoji 是一个开源的emoji字体库，提供符合Unicode标准的完整emoji支持。

### 许可证
- 字体文件: SIL Open Font License (OFL) v1.1
- 工具和图片资源: Apache License 2.0

## 集成功能

### 1. Emoji资源文件
- `emoji_u*.png`: 样本emoji图片文件 (128px)
- 支持3583个标准emoji
- 多种尺寸: 32px, 72px, 128px, 512px

### 2. 数据文件
- `emoji_annotations.txt`: emoji注释和别名数据
- `emoji_aliases.txt`: emoji别名映射

### 3. 服务层集成 (`/src/services/notoEmojiService.ts`)
- 完整的Unicode 15.0分类支持
- 肤色修饰符 (Fitzpatrick Scale)
- 自定义名称映射
- 批量URL生成
- 搜索和过滤功能

### 4. 主要特性
- **Unicode标准**: 完全符合Unicode 15.0标准
- **分类系统**: 10个主要emoji分组
- **肤色支持**: 5种Fitzpatrick肤色修饰符
- **风格系统**: 多种Noto风格 (彩色、轮廓、Material Design)
- **开发工具**: 数据导出、API文档、批量生成

## 使用方法

```typescript
import { notoEmojiService, NOTO_STYLES } from '@/services/notoEmojiService';

// 获取所有emoji
const allEmojis = notoEmojiService.getAllEmojis();

// 搜索emoji
const searchResults = notoEmojiService.searchEmojis('笑脸');

// 生成图片URL
const url = notoEmojiService.generateEmojiUrl('1f600', 'color', 128);

// 应用肤色修饰符
const modifiedEmoji = notoEmojiService.applySkinToneModifier('👍', 'light');
```

## 数据结构

```typescript
interface NotoEmojiData {
  unicode: string;           // emoji字符
  codepoint: string;         // Unicode代码点
  name: string;             // 中文名称
  group: string;            // 分组
  subgroup: string;         // 子分组
  keywords: string[];       // 关键词
  hasSkinTone: boolean;     // 是否支持肤色修饰符
  hasGender: boolean;       // 是否有性别变体
  version: string;          // Unicode版本
  status: string;           // 限定状态
}
```

## API 风格

### 支持的风格
- `color`: Google官方彩色设计
- `outline`: 黑白描边风格  
- `material`: Material Design风格

### URL格式
- 彩色: `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/{size}/emoji_u{codepoint}.png`
- Material: `https://fonts.gstatic.com/s/e/notoemoji/latest/{codepoint}/{size}.webp`

## 贡献

本集成基于Google Noto Emoji开源项目，遵循其开源许可证条款。

### 致谢
- Google Fonts团队的Noto Emoji项目
- Unicode Consortium的emoji标准化工作

## 更新日志

- **v1.0.0**: 初始集成，支持基础emoji数据和服务
- 集成了Google Noto Emoji项目的核心功能
- 提供完整的TypeScript类型支持
- 实现了现代化的React组件界面
