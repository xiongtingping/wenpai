#!/usr/bin/env node

/**
 * 热门话题页面国际化脚本
 * 处理 HotTopicsPage.tsx 中的中文文本国际化
 */

import fs from 'fs';
import path from 'path';

const HOT_TOPICS_PATH = 'src/pages/HotTopicsPage.tsx';
const ZH_LOCALE_PATH = 'src/i18n/locales/zh-CN.json';
const EN_LOCALE_PATH = 'src/i18n/locales/en-US.json';

class HotTopicsPageI18n {
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
    console.log('🔥 开始热门话题页面国际化...\n');

    try {
      // 1. 加载现有翻译文件
      await this.loadExistingTranslations();
      
      // 2. 定义翻译映射
      this.defineTranslations();
      
      // 3. 处理热门话题页面文件
      await this.processHotTopicsFile();
      
      // 4. 更新翻译文件
      await this.updateTranslationFiles();
      
      console.log(`\n✅ 热门话题页面国际化完成！`);
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

    // 初始化 hotTopics 翻译对象
    if (!this.zhTranslations.hotTopics) {
      this.zhTranslations.hotTopics = {};
    }
    if (!this.enTranslations.hotTopics) {
      this.enTranslations.hotTopics = {};
    }

    // 页面标题和描述
    this.addTranslation('hotTopics.title', '热门话题', 'Hot Topics');
    this.addTranslation('hotTopics.description', '发现最新热门话题，把握内容创作趋势', 'Discover the latest hot topics and grasp content creation trends');

    // 标签页
    this.addTranslation('hotTopics.tabs.trending', '热门趋势', 'Trending');
    this.addTranslation('hotTopics.tabs.realtime', '实时热点', 'Real-time');
    this.addTranslation('hotTopics.tabs.categories', '分类话题', 'Categories');
    this.addTranslation('hotTopics.tabs.analytics', '数据分析', 'Analytics');
    this.addTranslation('hotTopics.tabs.favorites', '我的收藏', 'My Favorites');

    // 搜索和筛选
    this.addTranslation('hotTopics.search.placeholder', '搜索热门话题...', 'Search hot topics...');
    this.addTranslation('hotTopics.search.noResults', '没有找到相关话题', 'No related topics found');
    this.addTranslation('hotTopics.filter.all', '全部', 'All');
    this.addTranslation('hotTopics.filter.platform', '平台', 'Platform');
    this.addTranslation('hotTopics.filter.category', '分类', 'Category');
    this.addTranslation('hotTopics.filter.timeRange', '时间范围', 'Time Range');

    // 平台选择
    this.addTranslation('hotTopics.platforms.weibo', '微博', 'Weibo');
    this.addTranslation('hotTopics.platforms.xiaohongshu', '小红书', 'Xiaohongshu');
    this.addTranslation('hotTopics.platforms.douyin', '抖音', 'Douyin');
    this.addTranslation('hotTopics.platforms.zhihu', '知乎', 'Zhihu');
    this.addTranslation('hotTopics.platforms.bilibili', 'B站', 'Bilibili');
    this.addTranslation('hotTopics.platforms.wechat', '微信', 'WeChat');

    // 分类
    this.addTranslation('hotTopics.categories.entertainment', '娱乐', 'Entertainment');
    this.addTranslation('hotTopics.categories.technology', '科技', 'Technology');
    this.addTranslation('hotTopics.categories.sports', '体育', 'Sports');
    this.addTranslation('hotTopics.categories.finance', '财经', 'Finance');
    this.addTranslation('hotTopics.categories.lifestyle', '生活', 'Lifestyle');
    this.addTranslation('hotTopics.categories.education', '教育', 'Education');
    this.addTranslation('hotTopics.categories.health', '健康', 'Health');
    this.addTranslation('hotTopics.categories.travel', '旅游', 'Travel');

    // 时间范围
    this.addTranslation('hotTopics.timeRange.1hour', '1小时内', 'Last 1 hour');
    this.addTranslation('hotTopics.timeRange.6hours', '6小时内', 'Last 6 hours');
    this.addTranslation('hotTopics.timeRange.24hours', '24小时内', 'Last 24 hours');
    this.addTranslation('hotTopics.timeRange.3days', '3天内', 'Last 3 days');
    this.addTranslation('hotTopics.timeRange.7days', '7天内', 'Last 7 days');

    // 按钮文本
    this.addTranslation('hotTopics.buttons.refresh', '刷新', 'Refresh');
    this.addTranslation('hotTopics.buttons.search', '搜索', 'Search');
    this.addTranslation('hotTopics.buttons.filter', '筛选', 'Filter');
    this.addTranslation('hotTopics.buttons.export', '导出', 'Export');
    this.addTranslation('hotTopics.buttons.bookmark', '收藏', 'Bookmark');
    this.addTranslation('hotTopics.buttons.share', '分享', 'Share');
    this.addTranslation('hotTopics.buttons.view', '查看', 'View');
    this.addTranslation('hotTopics.buttons.analyze', '分析', 'Analyze');
    this.addTranslation('hotTopics.buttons.create', '创作', 'Create');

    // 状态消息
    this.addTranslation('hotTopics.status.loading', '正在加载...', 'Loading...');
    this.addTranslation('hotTopics.status.refreshing', '正在刷新...', 'Refreshing...');
    this.addTranslation('hotTopics.status.success', '操作成功', 'Operation successful');
    this.addTranslation('hotTopics.status.bookmarked', '已添加到收藏', 'Added to bookmarks');
    this.addTranslation('hotTopics.status.shared', '分享成功', 'Shared successfully');

    // 错误消息
    this.addTranslation('hotTopics.errors.loadFailed', '加载失败，请重试', 'Load failed, please try again');
    this.addTranslation('hotTopics.errors.refreshFailed', '刷新失败', 'Refresh failed');
    this.addTranslation('hotTopics.errors.bookmarkFailed', '收藏失败', 'Bookmark failed');
    this.addTranslation('hotTopics.errors.shareFailed', '分享失败', 'Share failed');
    this.addTranslation('hotTopics.errors.networkError', '网络错误', 'Network error');

    // 话题卡片
    this.addTranslation('hotTopics.card.hotIndex', '热度指数', 'Hot Index');
    this.addTranslation('hotTopics.card.discussionCount', '讨论数', 'Discussions');
    this.addTranslation('hotTopics.card.viewCount', '浏览量', 'Views');
    this.addTranslation('hotTopics.card.trendingUp', '上升趋势', 'Trending Up');
    this.addTranslation('hotTopics.card.trendingDown', '下降趋势', 'Trending Down');
    this.addTranslation('hotTopics.card.stable', '趋势平稳', 'Stable');
    this.addTranslation('hotTopics.card.new', '新话题', 'New Topic');
    this.addTranslation('hotTopics.card.hot', '热门', 'Hot');

    // 数据分析
    this.addTranslation('hotTopics.analytics.title', '话题数据分析', 'Topic Analytics');
    this.addTranslation('hotTopics.analytics.overview', '数据概览', 'Data Overview');
    this.addTranslation('hotTopics.analytics.trends', '趋势分析', 'Trend Analysis');
    this.addTranslation('hotTopics.analytics.platforms', '平台分布', 'Platform Distribution');
    this.addTranslation('hotTopics.analytics.categories', '分类统计', 'Category Statistics');

    // 收藏管理
    this.addTranslation('hotTopics.favorites.empty', '暂无收藏话题', 'No bookmarked topics');
    this.addTranslation('hotTopics.favorites.manage', '管理收藏', 'Manage Bookmarks');
    this.addTranslation('hotTopics.favorites.remove', '移除收藏', 'Remove Bookmark');
    this.addTranslation('hotTopics.favorites.confirmRemove', '确定要移除这个收藏吗？', 'Are you sure to remove this bookmark?');

    // 空状态
    this.addTranslation('hotTopics.empty.noTopics', '暂无话题数据', 'No topic data available');
    this.addTranslation('hotTopics.empty.noResults', '没有找到匹配的话题', 'No matching topics found');
    this.addTranslation('hotTopics.empty.tryRefresh', '尝试刷新页面', 'Try refreshing the page');

    // 设置
    this.addTranslation('hotTopics.settings.title', '话题设置', 'Topic Settings');
    this.addTranslation('hotTopics.settings.notifications', '通知设置', 'Notification Settings');
    this.addTranslation('hotTopics.settings.autoRefresh', '自动刷新', 'Auto Refresh');
    this.addTranslation('hotTopics.settings.refreshInterval', '刷新间隔', 'Refresh Interval');

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
      // 标签页文本
      {
        search: /'热门趋势'/g,
        replace: "t('hotTopics.tabs.trending')"
      },
      {
        search: /'实时热点'/g,
        replace: "t('hotTopics.tabs.realtime')"
      },
      {
        search: /'分类话题'/g,
        replace: "t('hotTopics.tabs.categories')"
      },
      {
        search: /'数据分析'/g,
        replace: "t('hotTopics.tabs.analytics')"
      },
      {
        search: /'我的收藏'/g,
        replace: "t('hotTopics.tabs.favorites')"
      },

      // 按钮文本
      {
        search: />刷新</g,
        replace: ">{t('hotTopics.buttons.refresh')}<"
      },
      {
        search: />搜索</g,
        replace: ">{t('hotTopics.buttons.search')}<"
      },
      {
        search: />筛选</g,
        replace: ">{t('hotTopics.buttons.filter')}<"
      },
      {
        search: />导出</g,
        replace: ">{t('hotTopics.buttons.export')}<"
      },
      {
        search: />收藏</g,
        replace: ">{t('hotTopics.buttons.bookmark')}<"
      },
      {
        search: />分享</g,
        replace: ">{t('hotTopics.buttons.share')}<"
      },
      {
        search: />查看</g,
        replace: ">{t('hotTopics.buttons.view')}<"
      },
      {
        search: />分析</g,
        replace: ">{t('hotTopics.buttons.analyze')}<"
      },
      {
        search: />创作</g,
        replace: ">{t('hotTopics.buttons.create')}<"
      },

      // 搜索占位符
      {
        search: /placeholder="搜索热门话题\.\.\."/g,
        replace: "placeholder={t('hotTopics.search.placeholder')}"
      },

      // 状态消息
      {
        search: /'正在加载\.\.\.'/g,
        replace: "t('hotTopics.status.loading')"
      },
      {
        search: /'正在刷新\.\.\.'/g,
        replace: "t('hotTopics.status.refreshing')"
      },
      {
        search: /'操作成功'/g,
        replace: "t('hotTopics.status.success')"
      },
      {
        search: /'已添加到收藏'/g,
        replace: "t('hotTopics.status.bookmarked')"
      },

      // 错误消息
      {
        search: /'加载失败，请重试'/g,
        replace: "t('hotTopics.errors.loadFailed')"
      },
      {
        search: /'刷新失败'/g,
        replace: "t('hotTopics.errors.refreshFailed')"
      },
      {
        search: /'网络错误'/g,
        replace: "t('hotTopics.errors.networkError')"
      },

      // 平台名称
      {
        search: /'微博'/g,
        replace: "t('hotTopics.platforms.weibo')"
      },
      {
        search: /'小红书'/g,
        replace: "t('hotTopics.platforms.xiaohongshu')"
      },
      {
        search: /'抖音'/g,
        replace: "t('hotTopics.platforms.douyin')"
      },
      {
        search: /'知乎'/g,
        replace: "t('hotTopics.platforms.zhihu')"
      },
      {
        search: /'B站'/g,
        replace: "t('hotTopics.platforms.bilibili')"
      },

      // 分类名称
      {
        search: /'娱乐'/g,
        replace: "t('hotTopics.categories.entertainment')"
      },
      {
        search: /'科技'/g,
        replace: "t('hotTopics.categories.technology')"
      },
      {
        search: /'体育'/g,
        replace: "t('hotTopics.categories.sports')"
      },
      {
        search: /'财经'/g,
        replace: "t('hotTopics.categories.finance')"
      },

      // 空状态文本
      {
        search: /'暂无话题数据'/g,
        replace: "t('hotTopics.empty.noTopics')"
      },
      {
        search: /'没有找到匹配的话题'/g,
        replace: "t('hotTopics.empty.noResults')"
      },
      {
        search: /'暂无收藏话题'/g,
        replace: "t('hotTopics.favorites.empty')"
      }
    ];
  }

  /**
   * 处理热门话题页面文件
   */
  async processHotTopicsFile() {
    console.log('🔄 处理热门话题页面文件...');
    
    if (!fs.existsSync(HOT_TOPICS_PATH)) {
      throw new Error(`热门话题页面文件不存在: ${HOT_TOPICS_PATH}`);
    }

    let content = fs.readFileSync(HOT_TOPICS_PATH, 'utf8');
    
    // 添加useTranslation导入
    if (!content.includes('useTranslation')) {
      content = content.replace(
        /import { logger } from '@\/utils\/logger';/,
        `import { logger } from '@/utils/logger';\nimport { useTranslation } from 'react-i18next';`
      );
      this.processedCount++;
    }

    // 在组件内添加t函数
    if (!content.includes('const { t } = useTranslation();')) {
      // 查找组件函数的开始位置
      const componentMatch = content.match(/export default function HotTopicsPage\(\) \{/);
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
    fs.writeFileSync(HOT_TOPICS_PATH, content);
    console.log(`✅ 热门话题页面文件处理完成，共替换 ${this.processedCount} 处文本`);
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
  const processor = new HotTopicsPageI18n();
  processor.run().catch(console.error);
}

export default HotTopicsPageI18n;
