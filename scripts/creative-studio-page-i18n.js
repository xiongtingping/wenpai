#!/usr/bin/env node

/**
 * 创意工作室页面国际化脚本
 * 处理 CreativeStudioPage.tsx 中的中文文本国际化
 */

import fs from 'fs';
import path from 'path';

const CREATIVE_STUDIO_PATH = 'src/pages/CreativeStudioPage.tsx';
const ZH_LOCALE_PATH = 'src/i18n/locales/zh-CN.json';
const EN_LOCALE_PATH = 'src/i18n/locales/en-US.json';

class CreativeStudioPageI18n {
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
    console.log('🎨 开始创意工作室页面国际化...\n');

    try {
      // 1. 加载现有翻译文件
      await this.loadExistingTranslations();
      
      // 2. 定义翻译映射
      this.defineTranslations();
      
      // 3. 处理创意工作室页面文件
      await this.processCreativeStudioFile();
      
      // 4. 更新翻译文件
      await this.updateTranslationFiles();
      
      console.log(`\n✅ 创意工作室页面国际化完成！`);
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

    // 初始化 creativeStudio 翻译对象
    if (!this.zhTranslations.creativeStudio) {
      this.zhTranslations.creativeStudio = {};
    }
    if (!this.enTranslations.creativeStudio) {
      this.enTranslations.creativeStudio = {};
    }

    // 页面标题和描述
    this.addTranslation('creativeStudio.title', '创意工作室', 'Creative Studio');
    this.addTranslation('creativeStudio.description', '包含九宫格创意魔方、营销日历、朋友圈模板和Emoji生成器', 'Includes Creative Cube, Marketing Calendar, Moments Templates and Emoji Generator');

    // 标签页
    this.addTranslation('creativeStudio.tabs.creativeCube', '创意魔方', 'Creative Cube');
    this.addTranslation('creativeStudio.tabs.marketingCalendar', '营销日历', 'Marketing Calendar');
    this.addTranslation('creativeStudio.tabs.momentsTemplates', '朋友圈模板', 'Moments Templates');
    this.addTranslation('creativeStudio.tabs.emojiGenerator', 'Emoji生成器', 'Emoji Generator');

    // 创意魔方部分
    this.addTranslation('creativeStudio.creativeCube.title', '九宫格创意魔方', 'Creative Cube');
    this.addTranslation('creativeStudio.creativeCube.description', '选择不同维度的元素，AI将为你生成可直接使用的创意内容', 'Select elements from different dimensions, and AI will generate ready-to-use creative content for you');

    // 营销日历部分
    this.addTranslation('creativeStudio.marketingCalendar.title', '营销日历', 'Marketing Calendar');
    this.addTranslation('creativeStudio.marketingCalendar.description', '查看重要节日和营销节点，规划你的内容创作', 'View important holidays and marketing milestones, plan your content creation');

    // 朋友圈模板部分
    this.addTranslation('creativeStudio.momentsTemplates.title', '朋友圈模板', 'Moments Templates');
    this.addTranslation('creativeStudio.momentsTemplates.description', '精选朋友圈文案模板，一键复制使用', 'Curated moments text templates, copy and use with one click');

    // Emoji生成器部分
    this.addTranslation('creativeStudio.emojiGenerator.title', 'Emoji生成器', 'Emoji Generator');
    this.addTranslation('creativeStudio.emojiGenerator.description', '智能推荐合适的Emoji，让你的内容更生动', 'Intelligently recommend suitable emojis to make your content more vivid');

    // 按钮文本
    this.addTranslation('creativeStudio.buttons.generate', '生成内容', 'Generate Content');
    this.addTranslation('creativeStudio.buttons.copy', '复制', 'Copy');
    this.addTranslation('creativeStudio.buttons.save', '保存', 'Save');
    this.addTranslation('creativeStudio.buttons.edit', '编辑', 'Edit');
    this.addTranslation('creativeStudio.buttons.delete', '删除', 'Delete');
    this.addTranslation('creativeStudio.buttons.refresh', '刷新', 'Refresh');
    this.addTranslation('creativeStudio.buttons.search', '搜索', 'Search');
    this.addTranslation('creativeStudio.buttons.filter', '筛选', 'Filter');
    this.addTranslation('creativeStudio.buttons.back', '返回', 'Back');

    // 状态消息
    this.addTranslation('creativeStudio.status.generating', '正在生成...', 'Generating...');
    this.addTranslation('creativeStudio.status.success', '生成成功', 'Generated successfully');
    this.addTranslation('creativeStudio.status.copied', '已复制到剪贴板', 'Copied to clipboard');
    this.addTranslation('creativeStudio.status.saved', '保存成功', 'Saved successfully');
    this.addTranslation('creativeStudio.status.deleted', '删除成功', 'Deleted successfully');

    // 错误消息
    this.addTranslation('creativeStudio.errors.generateFailed', '生成失败，请重试', 'Generation failed, please try again');
    this.addTranslation('creativeStudio.errors.copyFailed', '复制失败', 'Copy failed');
    this.addTranslation('creativeStudio.errors.saveFailed', '保存失败', 'Save failed');
    this.addTranslation('creativeStudio.errors.deleteFailed', '删除失败', 'Delete failed');
    this.addTranslation('creativeStudio.errors.loadFailed', '加载失败', 'Load failed');

    // 搜索和筛选
    this.addTranslation('creativeStudio.search.placeholder', '搜索模板...', 'Search templates...');
    this.addTranslation('creativeStudio.search.noResults', '没有找到相关内容', 'No related content found');
    this.addTranslation('creativeStudio.filter.all', '全部', 'All');
    this.addTranslation('creativeStudio.filter.category', '分类', 'Category');
    this.addTranslation('creativeStudio.filter.recent', '最近使用', 'Recently Used');
    this.addTranslation('creativeStudio.filter.favorites', '我的收藏', 'My Favorites');

    // 模板分类
    this.addTranslation('creativeStudio.categories.daily', '日常生活', 'Daily Life');
    this.addTranslation('creativeStudio.categories.business', '商务职场', 'Business');
    this.addTranslation('creativeStudio.categories.travel', '旅行出游', 'Travel');
    this.addTranslation('creativeStudio.categories.food', '美食分享', 'Food Sharing');
    this.addTranslation('creativeStudio.categories.fitness', '健身运动', 'Fitness');
    this.addTranslation('creativeStudio.categories.reading', '读书学习', 'Reading & Learning');
    this.addTranslation('creativeStudio.categories.emotion', '情感表达', 'Emotional Expression');

    // 工具提示
    this.addTranslation('creativeStudio.tooltips.generate', '点击生成新内容', 'Click to generate new content');
    this.addTranslation('creativeStudio.tooltips.copy', '复制到剪贴板', 'Copy to clipboard');
    this.addTranslation('creativeStudio.tooltips.save', '保存到收藏', 'Save to favorites');
    this.addTranslation('creativeStudio.tooltips.edit', '编辑内容', 'Edit content');
    this.addTranslation('creativeStudio.tooltips.delete', '删除内容', 'Delete content');

    // 空状态
    this.addTranslation('creativeStudio.empty.noTemplates', '暂无模板', 'No templates available');
    this.addTranslation('creativeStudio.empty.noResults', '没有找到匹配的结果', 'No matching results found');
    this.addTranslation('creativeStudio.empty.noFavorites', '暂无收藏内容', 'No favorites yet');

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
        search: /\/\*\*\s*\n\s*\* 创意工作室页面\s*\n\s*\* 包含九宫格创意魔方、营销日历、朋友圈模板和Emoji生成器\s*\n\s*\*\//g,
        replace: "/**\n * t('creativeStudio.title')\n * t('creativeStudio.description')\n */"
      },

      // 标签页文本
      {
        search: /'创意魔方'/g,
        replace: "t('creativeStudio.tabs.creativeCube')"
      },
      {
        search: /'营销日历'/g,
        replace: "t('creativeStudio.tabs.marketingCalendar')"
      },
      {
        search: /'朋友圈模板'/g,
        replace: "t('creativeStudio.tabs.momentsTemplates')"
      },
      {
        search: /'Emoji生成器'/g,
        replace: "t('creativeStudio.tabs.emojiGenerator')"
      },

      // 按钮文本
      {
        search: />生成内容</g,
        replace: ">{t('creativeStudio.buttons.generate')}<"
      },
      {
        search: />复制</g,
        replace: ">{t('creativeStudio.buttons.copy')}<"
      },
      {
        search: />保存</g,
        replace: ">{t('creativeStudio.buttons.save')}<"
      },
      {
        search: />编辑</g,
        replace: ">{t('creativeStudio.buttons.edit')}<"
      },
      {
        search: />删除</g,
        replace: ">{t('creativeStudio.buttons.delete')}<"
      },
      {
        search: />刷新</g,
        replace: ">{t('creativeStudio.buttons.refresh')}<"
      },
      {
        search: />搜索</g,
        replace: ">{t('creativeStudio.buttons.search')}<"
      },
      {
        search: />筛选</g,
        replace: ">{t('creativeStudio.buttons.filter')}<"
      },
      {
        search: />返回</g,
        replace: ">{t('creativeStudio.buttons.back')}<"
      },

      // 状态消息
      {
        search: /'正在生成\.\.\.'/g,
        replace: "t('creativeStudio.status.generating')"
      },
      {
        search: /'生成成功'/g,
        replace: "t('creativeStudio.status.success')"
      },
      {
        search: /'已复制到剪贴板'/g,
        replace: "t('creativeStudio.status.copied')"
      },
      {
        search: /'保存成功'/g,
        replace: "t('creativeStudio.status.saved')"
      },

      // 错误消息
      {
        search: /'生成失败，请重试'/g,
        replace: "t('creativeStudio.errors.generateFailed')"
      },
      {
        search: /'复制失败'/g,
        replace: "t('creativeStudio.errors.copyFailed')"
      },
      {
        search: /'保存失败'/g,
        replace: "t('creativeStudio.errors.saveFailed')"
      },

      // 搜索占位符
      {
        search: /placeholder="搜索模板\.\.\."/g,
        replace: "placeholder={t('creativeStudio.search.placeholder')}"
      },

      // 空状态文本
      {
        search: /'暂无模板'/g,
        replace: "t('creativeStudio.empty.noTemplates')"
      },
      {
        search: /'没有找到匹配的结果'/g,
        replace: "t('creativeStudio.empty.noResults')"
      },
      {
        search: /'暂无收藏内容'/g,
        replace: "t('creativeStudio.empty.noFavorites')"
      }
    ];
  }

  /**
   * 处理创意工作室页面文件
   */
  async processCreativeStudioFile() {
    console.log('🔄 处理创意工作室页面文件...');
    
    if (!fs.existsSync(CREATIVE_STUDIO_PATH)) {
      throw new Error(`创意工作室页面文件不存在: ${CREATIVE_STUDIO_PATH}`);
    }

    let content = fs.readFileSync(CREATIVE_STUDIO_PATH, 'utf8');
    
    // 添加useTranslation导入
    if (!content.includes('useTranslation')) {
      content = content.replace(
        /import { useToast } from '@\/hooks\/use-toast';/,
        `import { useToast } from '@/hooks/use-toast';\nimport { useTranslation } from 'react-i18next';`
      );
      this.processedCount++;
    }

    // 在组件内添加t函数
    if (!content.includes('const { t } = useTranslation();')) {
      // 查找组件函数的开始位置
      const componentMatch = content.match(/export default function CreativeStudioPage\(\) \{/);
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
    fs.writeFileSync(CREATIVE_STUDIO_PATH, content);
    console.log(`✅ 创意工作室页面文件处理完成，共替换 ${this.processedCount} 处文本`);
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
  const processor = new CreativeStudioPageI18n();
  processor.run().catch(console.error);
}

export default CreativeStudioPageI18n;
