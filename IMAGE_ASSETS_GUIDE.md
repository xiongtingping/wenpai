# 📸 文派AI - 图片资源制作指南

## 🎯 需要制作的图片清单

### 1. **OG Image (Open Graph分享图)** - 高优先级

**用途**: 当网站链接在社交媒体(Facebook、微信、QQ等)分享时显示的预览图

**规格要求**:
- 文件名: `og-image.jpg`
- 尺寸: **1200 x 630 像素**
- 格式: JPG或PNG
- 大小: <300KB
- 保存位置: `/Users/xiong/wenpai/public/og-image.jpg`

**设计建议**:
```
背景: 渐变紫色 (#667eea → #764ba2)
元素:
  - Logo(左上角)
  - 主标题: "文派AI"(大号,白色,粗体)
  - 副标题: "AI驱动的多平台内容发布工具"(中号,白色)
  - 关键信息: "一键发布到18+社交平台"(小号)
  - 视觉元素: 多个社交媒体图标环绕
  - CTA: "免费使用 wenpai.xyz"(右下角)
```

**在线设计工具**:
- Canva: https://www.canva.com (搜索"Open Graph Image"模板)
- Figma: 创建1200x630画布
- Adobe Express

---

### 2. **Twitter Card图片** - 高优先级

**用途**: Twitter/X分享时的预览图

**规格要求**:
- 文件名: `twitter-card.jpg`
- 尺寸: **1200 x 600 像素** (或 2:1 比例)
- 格式: JPG或PNG
- 大小: <5MB
- 保存位置: `/Users/xiong/wenpai/public/twitter-card.jpg`

**设计建议**:
```
与OG Image类似,但调整为2:1比例
可以使用相同设计稍作裁剪
```

---

### 3. **Logo文件** - 高优先级

**用途**:
- Schema.org Organization标记
- 网站header
- 社交媒体账号头像

**规格要求**:
- 文件名: `logo.png`
- 尺寸: **512 x 512 像素** (正方形)
- 格式: PNG(透明背景)
- 保存位置: `/Users/xiong/wenpai/public/logo.png`

**设计建议**:
```
如果已有SVG logo: /ikigai_4circles_multiply.svg
可以导出为PNG格式:
  - 512x512尺寸
  - 透明背景
  - 高清晰度
```

**导出方法**:
```bash
# 使用ImageMagick转换(如果已安装)
convert ikigai_4circles_multiply.svg -resize 512x512 logo.png

# 或使用在线工具
# https://cloudconvert.com/svg-to-png
```

---

### 4. **Apple Touch Icon** - 中优先级

**用途**: iOS设备添加到主屏幕时的图标

**规格要求**:
- 文件名: `apple-touch-icon.png`
- 尺寸: **180 x 180 像素**
- 格式: PNG
- 保存位置: `/Users/xiong/wenpai/public/apple-touch-icon.png`

**设计建议**:
```
使用Logo,缩放到180x180
如果Logo有透明背景,建议添加纯色或渐变背景
iOS会自动添加圆角效果,无需自行添加
```

---

### 5. **产品截图** - 中优先级

**用途**:
- Schema.org screenshot字段
- 产品展示页面
- 社交媒体宣传

**规格要求**:
- 文件名: `screenshot.jpg`
- 尺寸: **1920 x 1080 像素** (16:9)或更大
- 格式: JPG或PNG
- 保存位置: `/Users/xiong/wenpai/public/screenshot.jpg`

**截图内容建议**:
1. 打开 https://www.wenpai.xyz/adapt
2. 确保界面显示完整功能:
   - 左侧编辑器有示例内容
   - 右侧显示多个平台适配结果
   - 底部有"智能批量发布"按钮
3. 使用浏览器截图或专业截图工具:
   - Mac: Cmd+Shift+4, 然后按空格点击窗口
   - Windows: Win+Shift+S
   - Chrome扩展: GoFullPage(全屏截图)

**优化截图**:
```
- 隐藏个人信息
- 确保UI清晰可读
- 可以添加箭头或标注突出关键功能
- 适当压缩文件大小(<500KB)
```

---

### 6. **Favicon套件** - 低优先级(已有)

你已经有了:
- ✅ `ikigai_4circles_multiply.svg`
- ✅ `favicon.ico`

可选增强:
- favicon-16x16.png
- favicon-32x32.png
- favicon-96x96.png

---

## 🎨 快速制作方案

### 方案一: 使用Canva(推荐,最简单)

1. 访问 https://www.canva.com
2. 注册/登录账号
3. 搜索"Social Media"模板
4. 选择1200x630尺寸
5. 套用模板或自己设计:
   - 背景: 选择渐变,设置为紫色系
   - 添加文字: "文派AI"、"一键发布到18+平台"
   - 添加图标: 搜索"social media icons"
   - 下载JPG格式

**预估时间**: 10-15分钟

---

### 方案二: 使用Figma(专业)

1. 访问 https://www.figma.com
2. 创建新文件
3. 创建Frame(1200x630)
4. 添加渐变背景
5. 添加文字和图标
6. 导出为JPG

**预估时间**: 20-30分钟

---

### 方案三: 请设计师(高质量)

如果有设计师,提供以下Brief:

```
项目: 文派AI社交媒体分享图
数量: 2张(OG Image + Twitter Card)

设计要求:
1. 品牌色: 渐变紫色 #667eea → #764ba2
2. 主标题: 文派AI
3. 副标题: AI驱动的多平台内容发布工具
4. 核心卖点: 一键发布到18+社交平台,提升10倍效率
5. 风格: 现代、科技感、简洁
6. 可包含元素:
   - 多个社交媒体图标(小红书、微博、知乎、抖音等)
   - AI/科技相关视觉元素
   - 简洁的插图或图形

交付:
- OG Image: 1200x630px JPG
- Twitter Card: 1200x600px JPG
- Logo PNG: 512x512px 透明背景
- 源文件(可编辑)

参考网站:
www.wenpai.xyz
```

---

## 📋 实施步骤

### 立即执行(高优先级):

1. **制作OG Image和Twitter Card**
   ```bash
   # 制作完成后,保存到以下位置
   /Users/xiong/wenpai/public/og-image.jpg
   /Users/xiong/wenpai/public/twitter-card.jpg
   ```

2. **导出Logo PNG**
   ```bash
   # 如果有SVG,转换为PNG
   /Users/xiong/wenpai/public/logo.png
   ```

3. **验证图片**
   - 访问 https://www.opengraph.xyz/ 测试OG Image
   - 访问 https://cards-dev.twitter.com/validator 测试Twitter Card

---

### 本周完成(中优先级):

4. **制作Apple Touch Icon**
   ```bash
   /Users/xiong/wenpai/public/apple-touch-icon.png
   ```

5. **产品截图**
   ```bash
   /Users/xiong/wenpai/public/screenshot.jpg
   ```

---

## 🔍 验证清单

制作完成后,检查:

- [ ] OG Image尺寸正确(1200x630)
- [ ] Twitter Card尺寸正确(1200x600)
- [ ] Logo PNG透明背景
- [ ] 文件大小合理(<500KB)
- [ ] 图片清晰,文字可读
- [ ] 品牌色一致
- [ ] 文件名正确
- [ ] 保存位置正确

**测试**:
- [ ] 在Facebook分享链接,查看预览
- [ ] 在Twitter分享链接,查看预览
- [ ] 在微信分享链接,查看预览
- [ ] 使用调试工具验证(见上方链接)

---

## 💡 设计灵感参考

### 优秀案例:
- Notion: 简洁,品牌色突出
- Figma: 视觉元素丰富但不杂乱
- Linear: 渐变背景,科技感
- Vercel: 极简主义

### 配色参考:
```
主色调: #667eea (紫蓝)
辅助色: #764ba2 (紫色)
文字: #FFFFFF (白色)
背景: 线性渐变 135deg

可选配色:
- 强调色: #FFD700 (金色,用于CTA)
- 点缀色: #00D4AA (青绿,用于图标)
```

---

## 🚀 完成后的效果

制作这些图片后,你的网站将:
- ✅ 社交媒体分享时有精美的预览图
- ✅ 提升专业度和可信度
- ✅ 增加点击率(CTR)
- ✅ 完善Schema.org数据
- ✅ iOS设备用户体验更好

---

**预估总投入时间**: 1-2小时(自己制作)或 $50-150(请设计师)

**优先级**: 高 - 建议本周内完成

**问题咨询**: 如有疑问,可参考Canva教程或寻求设计帮助
