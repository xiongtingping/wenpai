#!/usr/bin/env node

/**
 * 话题分类组件国际化脚本
 * 处理 TopicCategories.tsx 中的中文文本国际化
 */

import fs from 'fs';
import path from 'path';

const TOPIC_CATEGORIES_PATH = 'src/components/hot-topics/TopicCategories.tsx';
const ZH_LOCALE_PATH = 'src/i18n/locales/zh-CN.json';
const EN_LOCALE_PATH = 'src/i18n/locales/en-US.json';

class TopicCategoriesI18n {
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
    console.log('🏷️ 开始话题分类组件国际化...\n');

    try {
      // 1. 加载现有翻译文件
      await this.loadExistingTranslations();
      
      // 2. 定义翻译映射
      this.defineTranslations();
      
      // 3. 处理话题分类文件
      await this.processTopicCategoriesFile();
      
      // 4. 更新翻译文件
      await this.updateTranslationFiles();
      
      console.log(`\n✅ 话题分类组件国际化完成！`);
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

    // 初始化 topicCategories 翻译对象
    if (!this.zhTranslations.topicCategories) {
      this.zhTranslations.topicCategories = {};
    }
    if (!this.enTranslations.topicCategories) {
      this.enTranslations.topicCategories = {};
    }

    // 组件描述
    this.addTranslation('topicCategories.description', '话题分类组件', 'Topic Categories Component');
    this.addTranslation('topicCategories.support', '支持按类别快速查看话题', 'Support Quick Topic Viewing by Category');

    // 用户兴趣权重系统
    this.addTranslation('topicCategories.userInterest.title', '用户兴趣权重系统', 'User Interest Weight System');
    this.addTranslation('topicCategories.userInterest.categoryWeight', '分类权重 (0-1)', 'Category Weight (0-1)');
    this.addTranslation('topicCategories.userInterest.management', '用户兴趣权重管理', 'User Interest Weight Management');
    this.addTranslation('topicCategories.userInterest.defaultWeight', '默认权重0.5', 'Default Weight 0.5');
    this.addTranslation('topicCategories.userInterest.adjustByBehavior', '根据用户行为调整权重', 'Adjust Weight Based on User Behavior');
    this.addTranslation('topicCategories.userInterest.updateWeight', '更新权重，限制在0-1范围内', 'Update Weight, Limited to 0-1 Range');

    // 错误消息
    this.addTranslation('topicCategories.errors.getWeightsFailed', '获取用户兴趣权重失败:', 'Failed to Get User Interest Weights:');
    this.addTranslation('topicCategories.errors.saveWeightsFailed', '保存用户兴趣权重失败:', 'Failed to Save User Interest Weights:');

    // 分类排序算法
    this.addTranslation('topicCategories.sorting.algorithm', '分类排序算法', 'Category Sorting Algorithm');
    this.addTranslation('topicCategories.sorting.comprehensiveScore', '综合评分算法', 'Comprehensive Scoring Algorithm');
    this.addTranslation('topicCategories.sorting.userInterestPriority', '第一优先级：用户兴趣权重 (40%)', 'First Priority: User Interest Weight (40%)');
    this.addTranslation('topicCategories.sorting.avgHeatPriority', '第二优先级：平均热度 (35%)', 'Second Priority: Average Heat (35%)');
    this.addTranslation('topicCategories.sorting.topicCountPriority', '第三优先级：话题数量 (25%)', 'Third Priority: Topic Count (25%)');

    // 平台显示名称
    this.addTranslation('topicCategories.platforms.weibo', '微博', 'Weibo');
    this.addTranslation('topicCategories.platforms.zhihu', '知乎', 'Zhihu');
    this.addTranslation('topicCategories.platforms.bilibili', 'B站', 'Bilibili');
    this.addTranslation('topicCategories.platforms.douyin', '抖音', 'Douyin');
    this.addTranslation('topicCategories.platforms.toutiao', '头条', 'Toutiao');
    this.addTranslation('topicCategories.platforms.baidu', '百度', 'Baidu');
    this.addTranslation('topicCategories.platforms.36kr', '36氪', '36Kr');
    this.addTranslation('topicCategories.platforms.ithome', 'IT之家', 'IT Home');

    // 格式化热度值
    this.addTranslation('topicCategories.heat.noData', '暂无数据', 'No Data');

    // 分类标签
    this.addTranslation('topicCategories.categories.all', '全部', 'All');
    this.addTranslation('topicCategories.categories.entertainment', '娱乐', 'Entertainment');
    this.addTranslation('topicCategories.categories.technology', '科技', 'Technology');
    this.addTranslation('topicCategories.categories.sports', '体育', 'Sports');
    this.addTranslation('topicCategories.categories.gaming', '游戏', 'Gaming');
    this.addTranslation('topicCategories.categories.automotive', '汽车', 'Automotive');
    this.addTranslation('topicCategories.categories.economy', '财经', 'Economy');
    this.addTranslation('topicCategories.categories.society', '社会', 'Society');
    this.addTranslation('topicCategories.categories.education', '教育', 'Education');
    this.addTranslation('topicCategories.categories.health', '健康', 'Health');
    this.addTranslation('topicCategories.categories.lifestyle', '生活', 'Lifestyle');
    this.addTranslation('topicCategories.categories.travel', '旅游', 'Travel');
    this.addTranslation('topicCategories.categories.food', '美食', 'Food');
    this.addTranslation('topicCategories.categories.science', '科学', 'Science');
    this.addTranslation('topicCategories.categories.culture', '文化', 'Culture');
    this.addTranslation('topicCategories.categories.international', '国际', 'International');
    this.addTranslation('topicCategories.categories.realestate', '房产', 'Real Estate');
    this.addTranslation('topicCategories.categories.weather', '天气', 'Weather');
    this.addTranslation('topicCategories.categories.environment', '环保', 'Environment');
    this.addTranslation('topicCategories.categories.agriculture', '农业', 'Agriculture');
    this.addTranslation('topicCategories.categories.pets', '宠物', 'Pets');

    // 功能描述
    this.addTranslation('topicCategories.functions.keywordClassification', '根据关键词判断话题分类 - 重新优化的分类逻辑', 'Determine Topic Category by Keywords - Re-optimized Classification Logic');
    this.addTranslation('topicCategories.functions.getTopicsByCategory', '获取分类下的话题', 'Get Topics by Category');
    this.addTranslation('topicCategories.functions.getCategoryStats', '获取分类统计', 'Get Category Statistics');

    // 分类优先级说明
    this.addTranslation('topicCategories.priority.science', '科学类关键词 - 优先级最高，避免被娱乐分类抢夺', 'Science Keywords - Highest Priority, Avoid Being Taken by Entertainment Category');
    this.addTranslation('topicCategories.priority.culture', '文化类关键词 - 优先级提高，避免被娱乐分类抢夺', 'Culture Keywords - Increased Priority, Avoid Being Taken by Entertainment Category');
    this.addTranslation('topicCategories.priority.realestate', '房产类关键词 - 优先级提高，扩大覆盖范围', 'Real Estate Keywords - Increased Priority, Expanded Coverage');
    this.addTranslation('topicCategories.priority.society', '社会类关键词 - 精准定义，避免成为兜底分类', 'Society Keywords - Precise Definition, Avoid Becoming Fallback Category');
    this.addTranslation('topicCategories.priority.entertainment', '娱乐类关键词 - 精准定义，避免过度扩张', 'Entertainment Keywords - Precise Definition, Avoid Over-expansion');

    // 操作按钮
    this.addTranslation('topicCategories.actions.pin', '置顶', 'Pin');
    this.addTranslation('topicCategories.actions.unpin', '取消置顶', 'Unpin');
    this.addTranslation('topicCategories.actions.hide', '屏蔽', 'Hide');
    this.addTranslation('topicCategories.actions.delete', '删除分类:', 'Delete Category:');

    // UI 文本
    this.addTranslation('topicCategories.ui.title', '分类热点信息流', 'Categorized Hot Topics Feed');
    this.addTranslation('topicCategories.ui.description', '按分类多列展示所有热点话题，一目了然查看全网热点', 'Display All Hot Topics in Multi-column Categories, View All Network Hot Topics at a Glance');
    this.addTranslation('topicCategories.ui.responsiveGrid', '响应式网格布局，确保分类清晰分离', 'Responsive Grid Layout, Ensure Clear Category Separation');
    this.addTranslation('topicCategories.ui.removeFilter', '移除过滤条件，让所有分类都显示', 'Remove Filter Conditions, Show All Categories');
    this.addTranslation('topicCategories.ui.pinnedFirst', '置顶分类排在前面', 'Pinned Categories First');
    this.addTranslation('topicCategories.ui.sortByTopicCount', '按话题数量排序：话题多的排在前面', 'Sort by Topic Count: More Topics First');
    this.addTranslation('topicCategories.ui.sortByUserInterest', '话题数量相同时，按用户兴趣排序', 'When Topic Count is Same, Sort by User Interest');
    this.addTranslation('topicCategories.ui.recordUserView', '记录用户查看行为', 'Record User Viewing Behavior');

    // 高度逻辑
    this.addTranslation('topicCategories.height.unified', '统一高度逻辑：根据内容数量分档', 'Unified Height Logic: Categorized by Content Amount');
    this.addTranslation('topicCategories.height.empty', '空状态统一高度', 'Empty State Unified Height');
    this.addTranslation('topicCategories.height.few', '少量内容统一高度', 'Few Content Unified Height');
    this.addTranslation('topicCategories.height.medium', '中等内容统一高度', 'Medium Content Unified Height');
    this.addTranslation('topicCategories.height.more', '较多内容统一高度', 'More Content Unified Height');
    this.addTranslation('topicCategories.height.many', '大量内容统一高度', 'Many Content Unified Height');

    // 空状态
    this.addTranslation('topicCategories.empty.placeholder', '空状态占位符', 'Empty State Placeholder');
    this.addTranslation('topicCategories.empty.noTopics', '暂无{{category}}相关话题', 'No {{category}} Related Topics');
    this.addTranslation('topicCategories.empty.waitingUpdate', '等待热点数据更新...', 'Waiting for Hot Data Update...');

    // 展开/收起
    this.addTranslation('topicCategories.expand.collapse', '收起', 'Collapse');
    this.addTranslation('topicCategories.expand.showMore', '展开更多 ({{count}}+)', 'Show More ({{count}}+)');
    this.addTranslation('topicCategories.expand.fixedBottom', '展开/收起按钮 - 固定在底部', 'Expand/Collapse Button - Fixed at Bottom');

    // 其他UI元素
    this.addTranslation('topicCategories.ui.categoryTitle', '分类标题和操作', 'Category Title and Actions');
    this.addTranslation('topicCategories.ui.topicList', '话题列表', 'Topic List');
    this.addTranslation('topicCategories.ui.rankAndTitle', '排名和标题', 'Rank and Title');
    this.addTranslation('topicCategories.ui.bottomInfo', '底部信息：来源 + 热度 + 操作按钮', 'Bottom Info: Source + Heat + Action Buttons');
    this.addTranslation('topicCategories.ui.backToTop', '返回顶部按钮', 'Back to Top Button');

    // 注释和说明
    this.addTranslation('topicCategories.comments.secondaryClassification', '未匹配的内容根据常见词汇进行二次分类', 'Unmatched Content Secondary Classification Based on Common Vocabulary');
    this.addTranslation('topicCategories.comments.prioritizeFewerContent', '优先分配到内容较少的分类，避免都流向娱乐', 'Prioritize Categories with Less Content, Avoid All Flowing to Entertainment');
    this.addTranslation('topicCategories.comments.finalDefaultCategory', '最终默认归类为社会（更合理的兜底分类）', 'Final Default Category as Society (More Reasonable Fallback Category)');
    this.addTranslation('topicCategories.comments.changeToSociety', '改为社会，避免都流向娱乐', 'Change to Society, Avoid All Flowing to Entertainment');

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
      // 文件头部注释
      {
        search: /\/\*\*\s*\n\s*\* 话题分类组件\s*\n\s*\* 支持按类别快速查看话题/g,
        replace: "/**\n * {t('topicCategories.description')}\n * {t('topicCategories.support')}"
      },

      // 用户兴趣权重系统注释
      {
        search: /\/\/ 用户兴趣权重系统/g,
        replace: "// {t('topicCategories.userInterest.title')}"
      },
      {
        search: /\/\/ 分类权重 \(0-1\)/g,
        replace: "// {t('topicCategories.userInterest.categoryWeight')}"
      },
      {
        search: /\/\/ 用户兴趣权重管理/g,
        replace: "// {t('topicCategories.userInterest.management')}"
      },

      // 错误消息
      {
        search: /'获取用户兴趣权重失败:'/g,
        replace: "t('topicCategories.errors.getWeightsFailed')"
      },
      {
        search: /'保存用户兴趣权重失败:'/g,
        replace: "t('topicCategories.errors.saveWeightsFailed')"
      },

      // 分类标签
      {
        search: /label: '全部'/g,
        replace: "label: t('topicCategories.categories.all')"
      },
      {
        search: /label: '娱乐'/g,
        replace: "label: t('topicCategories.categories.entertainment')"
      },
      {
        search: /label: '科技'/g,
        replace: "label: t('topicCategories.categories.technology')"
      },
      {
        search: /label: '体育'/g,
        replace: "label: t('topicCategories.categories.sports')"
      },
      {
        search: /label: '游戏'/g,
        replace: "label: t('topicCategories.categories.gaming')"
      },
      {
        search: /label: '汽车'/g,
        replace: "label: t('topicCategories.categories.automotive')"
      },
      {
        search: /label: '财经'/g,
        replace: "label: t('topicCategories.categories.economy')"
      },
      {
        search: /label: '社会'/g,
        replace: "label: t('topicCategories.categories.society')"
      },
      {
        search: /label: '教育'/g,
        replace: "label: t('topicCategories.categories.education')"
      },
      {
        search: /label: '健康'/g,
        replace: "label: t('topicCategories.categories.health')"
      },
      {
        search: /label: '生活'/g,
        replace: "label: t('topicCategories.categories.lifestyle')"
      },
      {
        search: /label: '旅游'/g,
        replace: "label: t('topicCategories.categories.travel')"
      },
      {
        search: /label: '美食'/g,
        replace: "label: t('topicCategories.categories.food')"
      },
      {
        search: /label: '科学'/g,
        replace: "label: t('topicCategories.categories.science')"
      },
      {
        search: /label: '文化'/g,
        replace: "label: t('topicCategories.categories.culture')"
      },
      {
        search: /label: '国际'/g,
        replace: "label: t('topicCategories.categories.international')"
      },
      {
        search: /label: '房产'/g,
        replace: "label: t('topicCategories.categories.realestate')"
      },
      {
        search: /label: '天气'/g,
        replace: "label: t('topicCategories.categories.weather')"
      },
      {
        search: /label: '环保'/g,
        replace: "label: t('topicCategories.categories.environment')"
      },
      {
        search: /label: '农业'/g,
        replace: "label: t('topicCategories.categories.agriculture')"
      },
      {
        search: /label: '宠物'/g,
        replace: "label: t('topicCategories.categories.pets')"
      },

      // 平台名称
      {
        search: /'weibo': '微博'/g,
        replace: "'weibo': t('topicCategories.platforms.weibo')"
      },
      {
        search: /'zhihu': '知乎'/g,
        replace: "'zhihu': t('topicCategories.platforms.zhihu')"
      },
      {
        search: /'bilibili': 'B站'/g,
        replace: "'bilibili': t('topicCategories.platforms.bilibili')"
      },
      {
        search: /'douyin': '抖音'/g,
        replace: "'douyin': t('topicCategories.platforms.douyin')"
      },
      {
        search: /'toutiao': '头条'/g,
        replace: "'toutiao': t('topicCategories.platforms.toutiao')"
      },
      {
        search: /'baidu': '百度'/g,
        replace: "'baidu': t('topicCategories.platforms.baidu')"
      },
      {
        search: /'36kr': '36氪'/g,
        replace: "'36kr': t('topicCategories.platforms.36kr')"
      },
      {
        search: /'ithome': 'IT之家'/g,
        replace: "'ithome': t('topicCategories.platforms.ithome')"
      },

      // 热度值
      {
        search: /'暂无数据'/g,
        replace: "t('topicCategories.heat.noData')"
      },

      // 操作按钮
      {
        search: /{isPinned \? '取消置顶' : '置顶'}/g,
        replace: "{isPinned ? t('topicCategories.actions.unpin') : t('topicCategories.actions.pin')}"
      },
      {
        search: />屏蔽</g,
        replace: ">{t('topicCategories.actions.hide')}<"
      },

      // UI 文本
      {
        search: />分类热点信息流</g,
        replace: ">{t('topicCategories.ui.title')}<"
      },
      {
        search: />按分类多列展示所有热点话题，一目了然查看全网热点</g,
        replace: ">{t('topicCategories.ui.description')}<"
      },

      // 空状态
      {
        search: />暂无\{category\.label\}相关话题</g,
        replace: ">{t('topicCategories.empty.noTopics', { category: category.label })}<"
      },
      {
        search: />等待热点数据更新\.\.\.</g,
        replace: ">{t('topicCategories.empty.waitingUpdate')}<"
      },

      // 展开/收起
      {
        search: />收起</g,
        replace: ">{t('topicCategories.expand.collapse')}<"
      },
      {
        search: />展开更多 \(\{Math\.min\(categoryTopics\.length, 10\) - 5\}\+\)</g,
        replace: ">{t('topicCategories.expand.showMore', { count: Math.min(categoryTopics.length, 10) - 5 })}<"
      }
    ];
  }

  /**
   * 处理话题分类文件
   */
  async processTopicCategoriesFile() {
    console.log('🔄 处理话题分类文件...');
    
    if (!fs.existsSync(TOPIC_CATEGORIES_PATH)) {
      throw new Error(`话题分类文件不存在: ${TOPIC_CATEGORIES_PATH}`);
    }

    let content = fs.readFileSync(TOPIC_CATEGORIES_PATH, 'utf8');
    
    // 应用替换规则
    for (const replacement of this.replacements) {
      const beforeCount = (content.match(replacement.search) || []).length;
      content = content.replace(replacement.search, replacement.replace);
      const afterCount = (content.match(replacement.search) || []).length;
      this.processedCount += beforeCount - afterCount;
    }

    // 保存修改后的文件
    fs.writeFileSync(TOPIC_CATEGORIES_PATH, content);
    console.log(`✅ 话题分类文件处理完成，共替换 ${this.processedCount} 处文本`);
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
  const processor = new TopicCategoriesI18n();
  processor.run().catch(console.error);
}

export default TopicCategoriesI18n;
