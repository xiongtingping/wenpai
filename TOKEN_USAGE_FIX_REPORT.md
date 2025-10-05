# Token使用量统计修复报告

## 📋 问题总结

### 🚨 严重问题：大量AI调用未记录Token使用量

经过全面审查，发现系统中存在**两个AI调用入口**，只有一个记录Token使用量，导致约**50%的AI功能Token未被统计**。

---

## 🔍 完整问题清单

### 问题1：AI调用入口不统一 ⚠️⚠️⚠️ (严重)

**现状：**
- `callAI` (from @/api/unifiedAIService) - ❌ **不记录Token**
- `callAIWithTokenTracking` (from @/services/aiWithTokenTracking) - ✅ **记录Token**

**未记录Token的功能（约50%）：**
1. brandCorpusService.ts - 品牌语料库提取
2. webContentExtractor.ts - 网页内容提取
3. contentAdapter.ts - 内容适配（旧版）
4. PDFChatDialog.tsx - PDF对话
5. BrandContentGenerator.tsx - 品牌内容生成
6. BrandEmojiGenerator.tsx - 品牌表情生成
7. EmojiGenerator.tsx - 表情生成

**影响：用户看到的Token统计可能只有实际消耗的50%！**

### 问题2：开发环境使用模拟数据 ✅ (已修复)
- tokenUsageService.getUserTokenStats() 返回固定值
- 已注释掉模拟数据逻辑

### 问题3：UI缺少事件监听器 ✅ (已修复)
- TokenUsageSection 未监听 'tokenUsageUpdated' 事件
- 已添加事件监听器

---

## 🔧 推荐修复方案：统一使用 callAIWithTokenTracking

需要修改以下7个文件，将 callAI 替换为 callAIWithTokenTracking。

---

生成时间：2025-10-05
修复状态：部分完成（2/3）
