#!/usr/bin/env node

/**
 * 朋友圈文案生成器国际化脚本
 * 处理 MomentsTextGenerator.tsx 中的中文文本国际化
 */

import fs from 'fs';
import path from 'path';

const MOMENTS_GENERATOR_PATH = 'src/components/creative/MomentsTextGenerator.tsx';
const ZH_LOCALE_PATH = 'src/i18n/locales/zh-CN.json';
const EN_LOCALE_PATH = 'src/i18n/locales/en-US.json';

class MomentsTextGeneratorI18n {
  constructor() {
    this.replacements = [];
    this.zhTranslations = {};
    this.enTranslations = {};
    this.processedCount = 0;
  }

  /**
   * 运行国际化处理
   */
  async run() {
    console.log('📱 开始朋友圈文案生成器国际化...\n');

    try {
      // 1. 加载现有翻译文件
      await this.loadExistingTranslations();
      
      // 2. 定义翻译映射
      this.defineTranslations();
      
      // 3. 处理朋友圈文案生成器文件
      await this.processMomentsGeneratorFile();
      
      // 4. 更新翻译文件
      await this.updateTranslationFiles();
      
      console.log(`\n✅ 朋友圈文案生成器国际化完成！`);
      console.log(`📊 处理了 ${this.processedCount} 处文本替换`);
      
    } catch (error) {
      console.error('❌ 国际化处理失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 加载现有翻译文件
   */
  async loadExistingTranslations() {
    console.log('📁 加载现有翻译文件...');
    
    if (fs.existsSync(ZH_LOCALE_PATH)) {
      const zhContent = fs.readFileSync(ZH_LOCALE_PATH, 'utf8');
      this.zhTranslations = JSON.parse(zhContent);
    }
    
    if (fs.existsSync(EN_LOCALE_PATH)) {
      const enContent = fs.readFileSync(EN_LOCALE_PATH, 'utf8');
      this.enTranslations = JSON.parse(enContent);
    }
  }

  /**
   * 定义翻译映射
   */
  defineTranslations() {
    console.log('🔤 定义翻译映射...');

    // 初始化 momentsGenerator 翻译对象
    if (!this.zhTranslations.momentsGenerator) {
      this.zhTranslations.momentsGenerator = {};
    }
    if (!this.enTranslations.momentsGenerator) {
      this.enTranslations.momentsGenerator = {};
    }

    // 组件标题和描述
    this.addTranslation('momentsGenerator.title', '朋友圈文案生成器', 'Moments Text Generator');
    this.addTranslation('momentsGenerator.description', '智能搜索、分类筛选、收藏管理、AI生成、装饰系统、预览编辑', 'Intelligent search, category filtering, favorites management, AI generation, decoration system, preview editing');

    // 标签页
    this.addTranslation('momentsGenerator.tabs.templates', '文案模板', 'Text Templates');
    this.addTranslation('momentsGenerator.tabs.generate', 'AI生成', 'AI Generate');
    this.addTranslation('momentsGenerator.tabs.favorites', '我的收藏', 'My Favorites');
    this.addTranslation('momentsGenerator.tabs.history', '历史记录', 'History');

    // 搜索和筛选
    this.addTranslation('momentsGenerator.search.placeholder', '搜索文案模板...', 'Search text templates...');
    this.addTranslation('momentsGenerator.search.noResults', '没有找到相关文案', 'No related text found');
    this.addTranslation('momentsGenerator.filter.all', '全部', 'All');
    this.addTranslation('momentsGenerator.filter.category', '分类', 'Category');
    this.addTranslation('momentsGenerator.filter.mood', '心情', 'Mood');
    this.addTranslation('momentsGenerator.filter.scene', '场景', 'Scene');

    // 分类
    this.addTranslation('momentsGenerator.categories.daily', '日常生活', 'Daily Life');
    this.addTranslation('momentsGenerator.categories.work', '工作职场', 'Work & Career');
    this.addTranslation('momentsGenerator.categories.travel', '旅行出游', 'Travel');
    this.addTranslation('momentsGenerator.categories.food', '美食分享', 'Food Sharing');
    this.addTranslation('momentsGenerator.categories.fitness', '健身运动', 'Fitness & Sports');
    this.addTranslation('momentsGenerator.categories.reading', '读书学习', 'Reading & Learning');
    this.addTranslation('momentsGenerator.categories.emotion', '情感表达', 'Emotional Expression');
    this.addTranslation('momentsGenerator.categories.festival', '节日祝福', 'Festival Greetings');

    // 心情
    this.addTranslation('momentsGenerator.moods.happy', '开心', 'Happy');
    this.addTranslation('momentsGenerator.moods.excited', '兴奋', 'Excited');
    this.addTranslation('momentsGenerator.moods.peaceful', '平静', 'Peaceful');
    this.addTranslation('momentsGenerator.moods.thoughtful', '深思', 'Thoughtful');
    this.addTranslation('momentsGenerator.moods.grateful', '感恩', 'Grateful');
    this.addTranslation('momentsGenerator.moods.nostalgic', '怀念', 'Nostalgic');

    // 场景
    this.addTranslation('momentsGenerator.scenes.morning', '早晨', 'Morning');
    this.addTranslation('momentsGenerator.scenes.evening', '傍晚', 'Evening');
    this.addTranslation('momentsGenerator.scenes.weekend', '周末', 'Weekend');
    this.addTranslation('momentsGenerator.scenes.holiday', '假期', 'Holiday');
    this.addTranslation('momentsGenerator.scenes.office', '办公室', 'Office');
    this.addTranslation('momentsGenerator.scenes.home', '家里', 'Home');

    // 按钮文本
    this.addTranslation('momentsGenerator.buttons.copy', '复制', 'Copy');
    this.addTranslation('momentsGenerator.buttons.favorite', '收藏', 'Favorite');
    this.addTranslation('momentsGenerator.buttons.unfavorite', '取消收藏', 'Unfavorite');
    this.addTranslation('momentsGenerator.buttons.generate', '生成文案', 'Generate Text');
    this.addTranslation('momentsGenerator.buttons.regenerate', '重新生成', 'Regenerate');
    this.addTranslation('momentsGenerator.buttons.edit', '编辑', 'Edit');
    this.addTranslation('momentsGenerator.buttons.save', '保存', 'Save');
    this.addTranslation('momentsGenerator.buttons.cancel', '取消', 'Cancel');
    this.addTranslation('momentsGenerator.buttons.preview', '预览', 'Preview');
    this.addTranslation('momentsGenerator.buttons.share', '分享', 'Share');
    this.addTranslation('momentsGenerator.buttons.download', '下载', 'Download');
    this.addTranslation('momentsGenerator.buttons.clear', '清空', 'Clear');
    this.addTranslation('momentsGenerator.buttons.refresh', '刷新', 'Refresh');

    // 状态消息
    this.addTranslation('momentsGenerator.status.generating', '正在生成文案...', 'Generating text...');
    this.addTranslation('momentsGenerator.status.success', '生成成功', 'Generated successfully');
    this.addTranslation('momentsGenerator.status.copied', '已复制到剪贴板', 'Copied to clipboard');
    this.addTranslation('momentsGenerator.status.favorited', '已添加到收藏', 'Added to favorites');
    this.addTranslation('momentsGenerator.status.unfavorited', '已从收藏中移除', 'Removed from favorites');
    this.addTranslation('momentsGenerator.status.saved', '保存成功', 'Saved successfully');

    // 错误消息
    this.addTranslation('momentsGenerator.errors.generateFailed', '生成失败，请重试', 'Generation failed, please try again');
    this.addTranslation('momentsGenerator.errors.copyFailed', '复制失败', 'Copy failed');
    this.addTranslation('momentsGenerator.errors.saveFailed', '保存失败', 'Save failed');
    this.addTranslation('momentsGenerator.errors.loadFailed', '加载失败', 'Load failed');
    this.addTranslation('momentsGenerator.errors.networkError', '网络错误', 'Network error');

    // AI生成相关
    this.addTranslation('momentsGenerator.ai.inputPlaceholder', '描述你想要的文案内容...', 'Describe the content you want...');
    this.addTranslation('momentsGenerator.ai.styleLabel', '文案风格', 'Text Style');
    this.addTranslation('momentsGenerator.ai.lengthLabel', '文案长度', 'Text Length');
    this.addTranslation('momentsGenerator.ai.toneLabel', '语调', 'Tone');

    // 风格选项
    this.addTranslation('momentsGenerator.styles.casual', '轻松随意', 'Casual');
    this.addTranslation('momentsGenerator.styles.professional', '专业正式', 'Professional');
    this.addTranslation('momentsGenerator.styles.humorous', '幽默风趣', 'Humorous');
    this.addTranslation('momentsGenerator.styles.poetic', '诗意文艺', 'Poetic');
    this.addTranslation('momentsGenerator.styles.inspirational', '励志正能量', 'Inspirational');

    // 长度选项
    this.addTranslation('momentsGenerator.lengths.short', '简短', 'Short');
    this.addTranslation('momentsGenerator.lengths.medium', '中等', 'Medium');
    this.addTranslation('momentsGenerator.lengths.long', '详细', 'Long');

    // 语调选项
    this.addTranslation('momentsGenerator.tones.friendly', '友好', 'Friendly');
    this.addTranslation('momentsGenerator.tones.formal', '正式', 'Formal');
    this.addTranslation('momentsGenerator.tones.playful', '俏皮', 'Playful');
    this.addTranslation('momentsGenerator.tones.sincere', '真诚', 'Sincere');

    // 装饰系统
    this.addTranslation('momentsGenerator.decorations.title', '文案装饰', 'Text Decorations');
    this.addTranslation('momentsGenerator.decorations.emojis', '表情符号', 'Emojis');
    this.addTranslation('momentsGenerator.decorations.symbols', '特殊符号', 'Special Symbols');
    this.addTranslation('momentsGenerator.decorations.lines', '分割线', 'Divider Lines');

    // 预览编辑
    this.addTranslation('momentsGenerator.preview.title', '预览编辑', 'Preview & Edit');
    this.addTranslation('momentsGenerator.preview.wordCount', '字数统计', 'Word Count');
    this.addTranslation('momentsGenerator.preview.characters', '字符', 'Characters');

    // 收藏管理
    this.addTranslation('momentsGenerator.favorites.empty', '暂无收藏内容', 'No favorites yet');
    this.addTranslation('momentsGenerator.favorites.clearAll', '清空收藏', 'Clear All Favorites');
    this.addTranslation('momentsGenerator.favorites.confirmClear', '确定要清空所有收藏吗？', 'Are you sure to clear all favorites?');

    // 历史记录
    this.addTranslation('momentsGenerator.history.empty', '暂无历史记录', 'No history records');
    this.addTranslation('momentsGenerator.history.clearAll', '清空历史', 'Clear All History');
    this.addTranslation('momentsGenerator.history.confirmClear', '确定要清空所有历史记录吗？', 'Are you sure to clear all history?');

    // 定义替换规则
    this.defineReplacements();
  }

  /**
   * 添加翻译
   */
  addTranslation(key, zhText, enText) {
    const keys = key.split('.');
    let zhCurrent = this.zhTranslations;
    let enCurrent = this.enTranslations;

    // 创建嵌套对象结构
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!zhCurrent[k]) zhCurrent[k] = {};
      if (!enCurrent[k]) enCurrent[k] = {};
      zhCurrent = zhCurrent[k];
      enCurrent = enCurrent[k];
    }

    // 设置最终值
    const finalKey = keys[keys.length - 1];
    zhCurrent[finalKey] = zhText;
    enCurrent[finalKey] = enText;
  }

  /**
   * 定义替换规则
   */
  defineReplacements() {
    this.replacements = [
      // 注释替换
      {
        search: /\/\*\*\s*\n\s*\* 朋友圈文案生成器组件\s*\n\s*\* 优化后的UI设计：更好的视觉层次、响应式布局、增强的交互体验\s*\n\s*\* 功能：智能搜索、分类筛选、收藏管理、AI生成、装饰系统、预览编辑\s*\n\s*\*\//g,
        replace: "/**\n * t('momentsGenerator.title')\n * t('momentsGenerator.description')\n */"
      },

      // 标签页文本
      {
        search: /'文案模板'/g,
        replace: "t('momentsGenerator.tabs.templates')"
      },
      {
        search: /'AI生成'/g,
        replace: "t('momentsGenerator.tabs.generate')"
      },
      {
        search: /'我的收藏'/g,
        replace: "t('momentsGenerator.tabs.favorites')"
      },
      {
        search: /'历史记录'/g,
        replace: "t('momentsGenerator.tabs.history')"
      },

      // 搜索占位符
      {
        search: /placeholder="搜索文案模板\.\.\."/g,
        replace: "placeholder={t('momentsGenerator.search.placeholder')}"
      },

      // 按钮文本
      {
        search: />复制</g,
        replace: ">{t('momentsGenerator.buttons.copy')}<"
      },
      {
        search: />收藏</g,
        replace: ">{t('momentsGenerator.buttons.favorite')}<"
      },
      {
        search: />生成文案</g,
        replace: ">{t('momentsGenerator.buttons.generate')}<"
      },
      {
        search: />重新生成</g,
        replace: ">{t('momentsGenerator.buttons.regenerate')}<"
      },
      {
        search: />编辑</g,
        replace: ">{t('momentsGenerator.buttons.edit')}<"
      },
      {
        search: />保存</g,
        replace: ">{t('momentsGenerator.buttons.save')}<"
      },
      {
        search: />取消</g,
        replace: ">{t('momentsGenerator.buttons.cancel')}<"
      },
      {
        search: />预览</g,
        replace: ">{t('momentsGenerator.buttons.preview')}<"
      },

      // 分类文本
      {
        search: /'日常生活'/g,
        replace: "t('momentsGenerator.categories.daily')"
      },
      {
        search: /'工作职场'/g,
        replace: "t('momentsGenerator.categories.work')"
      },
      {
        search: /'旅行出游'/g,
        replace: "t('momentsGenerator.categories.travel')"
      },
      {
        search: /'美食分享'/g,
        replace: "t('momentsGenerator.categories.food')"
      },
      {
        search: /'健身运动'/g,
        replace: "t('momentsGenerator.categories.fitness')"
      },
      {
        search: /'读书学习'/g,
        replace: "t('momentsGenerator.categories.reading')"
      },

      // 状态消息
      {
        search: /'正在生成文案\.\.\.'/g,
        replace: "t('momentsGenerator.status.generating')"
      },
      {
        search: /'生成成功'/g,
        replace: "t('momentsGenerator.status.success')"
      },
      {
        search: /'已复制到剪贴板'/g,
        replace: "t('momentsGenerator.status.copied')"
      },
      {
        search: /'已添加到收藏'/g,
        replace: "t('momentsGenerator.status.favorited')"
      },

      // 错误消息
      {
        search: /'生成失败，请重试'/g,
        replace: "t('momentsGenerator.errors.generateFailed')"
      },
      {
        search: /'复制失败'/g,
        replace: "t('momentsGenerator.errors.copyFailed')"
      },
      {
        search: /'网络错误'/g,
        replace: "t('momentsGenerator.errors.networkError')"
      },

      // 空状态文本
      {
        search: /'暂无收藏内容'/g,
        replace: "t('momentsGenerator.favorites.empty')"
      },
      {
        search: /'暂无历史记录'/g,
        replace: "t('momentsGenerator.history.empty')"
      },
      {
        search: /'没有找到相关文案'/g,
        replace: "t('momentsGenerator.search.noResults')"
      }
    ];
  }

  /**
   * 处理朋友圈文案生成器文件
   */
  async processMomentsGeneratorFile() {
    console.log('🔄 处理朋友圈文案生成器文件...');
    
    if (!fs.existsSync(MOMENTS_GENERATOR_PATH)) {
      throw new Error(`朋友圈文案生成器文件不存在: ${MOMENTS_GENERATOR_PATH}`);
    }

    let content = fs.readFileSync(MOMENTS_GENERATOR_PATH, 'utf8');
    
    // 添加useTranslation导入
    if (!content.includes('useTranslation')) {
      content = content.replace(
        /import React, { useState, useEffect, useMemo } from 'react';/,
        `import React, { useState, useEffect, useMemo } from 'react';\nimport { useTranslation } from 'react-i18next';`
      );
      this.processedCount++;
    }

    // 在组件内添加t函数
    if (!content.includes('const { t } = useTranslation();')) {
      // 查找组件函数的开始位置
      const componentMatch = content.match(/export default function MomentsTextGenerator\(\) \{/);
      if (componentMatch) {
        const insertPos = componentMatch.index + componentMatch[0].length;
        content = content.slice(0, insertPos) + '\n  const { t } = useTranslation();' + content.slice(insertPos);
        this.processedCount++;
      }
    }

    // 应用替换规则
    for (const replacement of this.replacements) {
      const beforeCount = (content.match(replacement.search) || []).length;
      content = content.replace(replacement.search, replacement.replace);
      const afterCount = (content.match(replacement.search) || []).length;
      this.processedCount += beforeCount - afterCount;
    }

    // 保存修改后的文件
    fs.writeFileSync(MOMENTS_GENERATOR_PATH, content);
    console.log(`✅ 朋友圈文案生成器文件处理完成，共替换 ${this.processedCount} 处文本`);
  }

  /**
   * 更新翻译文件
   */
  async updateTranslationFiles() {
    console.log('💾 更新翻译文件...');
    
    // 保存中文翻译
    fs.writeFileSync(ZH_LOCALE_PATH, JSON.stringify(this.zhTranslations, null, 2));
    console.log('✅ 中文翻译文件已更新');
    
    // 保存英文翻译
    fs.writeFileSync(EN_LOCALE_PATH, JSON.stringify(this.enTranslations, null, 2));
    console.log('✅ 英文翻译文件已更新');
  }
}

// 运行国际化处理
if (import.meta.url === `file://${process.argv[1]}`) {
  const processor = new MomentsTextGeneratorI18n();
  processor.run().catch(console.error);
}

export default MomentsTextGeneratorI18n;
