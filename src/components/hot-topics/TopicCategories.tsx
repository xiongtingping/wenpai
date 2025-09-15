/**
 * {t('topicCategories.description')}
 * 
 *
 * ✅ FIXED: 话题分类组件完整性验证，修复于 2025-08-10
 * 
 * 📌 已封装：话题分类、智能标签、分类管理
 * ⚠️ 请勿改动：此组件已通过完整性验证，分类功能稳定运行
 *
 * ✅ UPDATED: 深色模式适配和设计令牌标准化，修复于 2025-08-10
 * 🎨 DESIGN: 修复深色模式下分类标签和图标颜色显示异常问题
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DailyHotItem } from '@/api/hotTopicsService';
import { ExternalLink, Bookmark, MoreVertical, ArrowUp, Eye, EyeOff, Pin, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// 
interface UserInterestWeights {
  [category: string]: number; // 
}

interface CategoryScore {
  id: string;
  name: string;
  score: number;
  topicCount: number;
  avgHeat: number;
  userWeight: number;
}

interface TopicCategoriesProps {
  topics: DailyHotItem[];
  onCategoryChange: (category: string) => void;
  onTopicClick: (topic: DailyHotItem) => void;
  onToggleBookmark: (topic: DailyHotItem) => void;
  isTopicBookmarked: (topic: DailyHotItem) => boolean;
  interestFilterComponent?: React.ReactNode;
}

// 
const getUserInterestWeights = (): UserInterestWeights => {
  try {
    const stored = localStorage.getItem('user-interest-weights');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error(t('topicCategories.errors.getWeightsFailed'), error);
    return {};
  }
};

const saveUserInterestWeights = (weights: UserInterestWeights): void => {
  try {
    localStorage.setItem('user-interest-weights', JSON.stringify(weights));
  } catch (error) {
    console.error(t('topicCategories.errors.saveWeightsFailed'), error);
  }
};

const updateCategoryInterest = (categoryId: string, action: 'view' | 'bookmark' | 'click'): void => {
  const weights = getUserInterestWeights();
  const currentWeight = weights[categoryId] || 0.5; // 默认权重0.5

  // 根据用户行为调整权重
  let increment = 0;
  switch (action) {
    case 'view':
      increment = 0.01;
      break;
    case 'click':
      increment = 0.02;
      break;
    case 'bookmark':
      increment = 0.05;
      break;
  }

  // 更新权重，限制在0-1范围内
  weights[categoryId] = Math.min(1, Math.max(0, currentWeight + increment));
  saveUserInterestWeights(weights);
};

/**
 * 话题分类组件
 */
// 分类排序算法
const calculateCategoryScore = (category: any, userWeights: UserInterestWeights): CategoryScore => {
  const topicCount = category.topics.length;
  const avgHeat = category.topics.reduce((sum: number, topic: DailyHotItem) => sum + (parseInt(topic.hot as string) || 0), 0) / topicCount;
  const userWeight = userWeights[category.id] || 0.5; // 默认权重0.5

  // 综合评分算法
  // 第一优先级：用户兴趣权重 (40%)
  // 第二优先级：平均热度 (35%)
  // 第三优先级：话题数量 (25%)
  const normalizedHeat = Math.min(avgHeat / 100000, 1); // 归一化热度值
  const normalizedCount = Math.min(topicCount / 20, 1); // 归一化数量值

  const score = (userWeight * 0.4) + (normalizedHeat * 0.35) + (normalizedCount * 0.25);

  return {
    id: category.id,
    name: category.name,
    score,
    topicCount,
    avgHeat,
    userWeight
  };
};

const TopicCategories: React.FC<TopicCategoriesProps> = ({
  topics,
  onCategoryChange,
  onTopicClick,
  onToggleBookmark,
  isTopicBookmarked,
  interestFilterComponent
}) => {
  // 获取用户兴趣权重
  const userWeights = getUserInterestWeights();

  // 平台显示名称映射
  const getPlatformDisplayName = (platform: string): string => {
    const platformNames: Record<string, string> = {
      'weibo': t('topicCategories.platforms.weibo'),
      'zhihu': t('topicCategories.platforms.zhihu'),
      'bilibili': t('topicCategories.platforms.bilibili'),
      'douyin': t('topicCategories.platforms.douyin'),
      'toutiao': t('topicCategories.platforms.toutiao'),
      'baidu': t('topicCategories.platforms.baidu'),
      '36kr': t('topicCategories.platforms.36kr'),
      'ithome': t('topicCategories.platforms.ithome')
    };
    return platformNames[platform] || platform;
  };

  // 格式化热度值
  const formatHotValue = (hot: string | undefined): string => {
    if (!hot || hot === '' || hot === '0' || hot === 'undefined') {
      return t('topicCategories.heat.noData');
    }

    const num = parseInt(hot);
    if (isNaN(num)) {
      return hot || t('topicCategories.heat.noData');
    }

    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}m`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return `${num}`;
  };

  // 状态管理
  const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(new Set());
  const [pinnedCategories, setPinnedCategories] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // 处理分类操作
  const handleCategoryAction = (categoryId: string, action: string) => {
    switch (action) {
      case 'hide':
        setHiddenCategories(prev => new Set([...prev, categoryId]));
        break;
      case 'pin':
        setPinnedCategories(prev => new Set([...prev, categoryId]));
        break;
      case 'unpin':
        setPinnedCategories(prev => {
          const newSet = new Set(prev);
          newSet.delete(categoryId);
          return newSet;
        });
        break;
      case 'delete':
        // 这里可以添加删除逻辑
        console.log('删除分类:', categoryId);
        break;
    }
  };

  // 处理展开/收起
  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // 返回顶部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 话题分类定义（带主题色）
  const categories = [
    { id: 'all', label: t('topicCategories.categories.all'), icon: '🔥' },
    { id: 'entertainment', label: t('topicCategories.categories.entertainment'), icon: '🎬', theme: 'from-pink-500/20 to-rose-500/20 border-pink-200' },
    { id: 'technology', label: t('topicCategories.categories.technology'), icon: '💻', theme: 'from-blue-500/20 to-cyan-500/20 border-blue-200' },
    { id: 'sports', label: t('topicCategories.categories.sports'), icon: '⚽', theme: 'from-green-500/20 to-emerald-500/20 border-green-200' },
    { id: 'gaming', label: t('topicCategories.categories.gaming'), icon: '🎮', theme: 'from-purple-500/20 to-violet-500/20 border-purple-200' },
    { id: 'automotive', label: t('topicCategories.categories.automotive'), icon: '🚗', theme: 'from-muted to-muted/80 border-border' },
    { id: 'economy', label: t('topicCategories.categories.economy'), icon: '💰', theme: 'from-yellow-500/20 to-orange-500/20 border-yellow-200' },
    { id: 'society', label: t('topicCategories.categories.society'), icon: '👥', theme: 'from-indigo-500/20 to-blue-500/20 border-indigo-200' },
    { id: 'education', label: t('topicCategories.categories.education'), icon: '📚', theme: 'from-teal-500/20 to-cyan-500/20 border-teal-200' },
    { id: 'health', label: t('topicCategories.categories.health'), icon: '🏥', theme: 'from-red-500/20 to-pink-500/20 border-red-200' },
    { id: 'lifestyle', label: t('topicCategories.categories.lifestyle'), icon: '🏠', theme: 'from-amber-500/20 to-yellow-500/20 border-amber-200' },
    { id: 'travel', label: t('topicCategories.categories.travel'), icon: '✈️', theme: 'from-sky-500/20 to-blue-500/20 border-sky-200' },
    { id: 'food', label: t('topicCategories.categories.food'), icon: '🍜', theme: 'from-orange-500/20 to-red-500/20 border-orange-200' },
    { id: 'science', label: t('topicCategories.categories.science'), icon: '🔬', theme: 'from-emerald-500/20 to-teal-500/20 border-emerald-200' },
    { id: 'culture', label: t('topicCategories.categories.culture'), icon: '🎨', theme: 'from-violet-500/20 to-purple-500/20 border-violet-200' },
    { id: 'international', label: t('topicCategories.categories.international'), icon: '🌍', theme: 'from-cyan-500/20 to-blue-500/20 border-cyan-200' },
    { id: 'realestate', label: t('topicCategories.categories.realestate'), icon: '🏢', theme: 'from-muted to-muted/80 border-border' },
    { id: 'weather', label: t('topicCategories.categories.weather'), icon: '🌤️', theme: 'from-sky-400/20 to-blue-400/20 border-sky-200' },
    { id: 'environment', label: t('topicCategories.categories.environment'), icon: '🌱', theme: 'from-green-400/20 to-emerald-400/20 border-green-200' },
    { id: 'agriculture', label: t('topicCategories.categories.agriculture'), icon: '🌾', theme: 'from-yellow-400/20 to-amber-400/20 border-yellow-200' },
    { id: 'pets', label: t('topicCategories.categories.pets'), icon: '🐕', theme: 'from-pink-400/20 to-rose-400/20 border-pink-200' }
  ];

  /**
   * 根据关键词判断话题分类 - 重新优化的分类逻辑
   */
  const getTopicCategory = (topic: DailyHotItem): string => {
    const title = topic.title.toLowerCase();
    const desc = (topic.desc || '').toLowerCase();
    const content = title + ' ' + desc;

    // 1. 科学类关键词 - 优先级最高，避免被娱乐分类抢夺
    const scienceKeywords = ['科学', '研究', '实验', '发现', '学术', '论文', '科研', '院士', '诺贝尔', '太空', '宇宙', '物理', '化学', '生物', '天文', '地理', '数学', '科学家', '实验室', '理论', '假说', '观测', '探索', '突破', '科学院', '研究院', '研究所', '学者', '专家', '教授'];
    if (scienceKeywords.some(keyword => content.includes(keyword))) {
      return 'science';
    }

    // 2. 文化类关键词 - 优先级提高，避免被娱乐分类抢夺
    const cultureKeywords = ['文化', '艺术', '历史', '传统', '文物', '博物馆', '展览', '书法', '绘画', '雕塑', '文学', '诗歌', '小说', '戏曲', '民俗', '古代', '古典', '遗产', '非遗', '文创', '国学', '古籍', '考古', '文艺', '古建筑', '作家', '诗人', '画家', '艺术家', '文化产业', '文化活动', '文化节', '文化遗产', '传承', '文化交流'];
    if (cultureKeywords.some(keyword => content.includes(keyword))) {
      return 'culture';
    }

    // 3. 房产类关键词 - 优先级提高，扩大覆盖范围
    const realestateKeywords = ['房产', '房价', '楼市', '买房', '卖房', '租房', '二手房', '新房', '楼盘', '开发商', '物业', '房贷', '公积金', '限购', '调控', '住房', '房屋', '地产', '土地', '商品房', '保障房', '安居房', '学区房', '房租', '房东', '房客', '装修', '搬家', '小区', '户型', '建筑', '工地', '施工', '房地产', '置业', '购房', '售房'];
    if (realestateKeywords.some(keyword => content.includes(keyword))) {
      return 'realestate';
    }

    // 4. 社会类关键词 - 精准定义，避免成为兜底分类
    const societyKeywords = ['社会', '民生', '社区', '居民', '市民', '群众', '公益', '慈善', '志愿者', '救助', '帮扶', '社会保障', '民生工程', '社会服务', '社会治理', '基层', '街道', '社区服务', '民生问题', '社会现象', '社会热点', '突发事件', '紧急事件'];
    if (societyKeywords.some(keyword => content.includes(keyword))) {
      return 'society';
    }

    // 5. 娱乐类关键词 - 精准定义，避免过度扩张
    const entertainmentKeywords = ['明星', '演员', '歌手', '电影', '电视剧', '综艺', '娱乐', '艺人', '导演', '编剧', '音乐', '演唱会', '颁奖', '红毯', '偶像', '粉丝', '追星', '影视', '剧组', '票房', '首映', '预告', '海报', '网红', '博主'];
    if (entertainmentKeywords.some(keyword => content.includes(keyword))) {
      return 'entertainment';
    }

    // 6. 科技类关键词 - 科技、互联网、数码等
    const technologyKeywords = ['科技', '技术', '互联网', 'AI', '人工智能', '手机', '电脑', '软件', '编程', '算法', '芯片', '5G', '区块链', '云计算', '数据', '网络', '智能', '创新', '研发', '数字化', '信息化', 'APP', '平台', '系统', '华为', '苹果', '小米', '字节跳动', '腾讯科技', '数码', '电子产品'];
    if (technologyKeywords.some(keyword => content.includes(keyword))) {
      return 'technology';
    }

    // 7. 财经类关键词 - 经济、金融、商业等
    const economyKeywords = ['经济', '金融', '股票', '基金', '投资', '理财', '银行', '保险', '股市', '创业', '融资', 'IPO', '财报', '上市', '公司', '企业', '商业', '市场', '价格', '消费', '零售', '电商', '支付', '货币', '汇率', '通胀', '商务', '贸易', '产业', '制造业', '服务业'];
    if (economyKeywords.some(keyword => content.includes(keyword))) {
      return 'economy';
    }

    // 8. 游戏类关键词 - 游戏、电竞等
    const gamingKeywords = ['游戏', '电竞', '主播', '直播', '王者荣耀', '英雄联盟', '原神', '和平精英', '网游', '手游', '电子竞技', '战队', '比赛', '游戏主播', '游戏直播', '电竞选手', '游戏公司', '游戏产业', 'steam', '任天堂', '索尼', '微软'];
    if (gamingKeywords.some(keyword => content.includes(keyword))) {
      return 'gaming';
    }

    // 9. 体育类关键词 - 体育运动、赛事等
    const sportsKeywords = ['足球', '篮球', '体育', '比赛', '运动员', '教练', '球队', '联赛', '冠军', '奥运会', '世界杯', 'NBA', 'CBA', '网球', '羽毛球', '乒乓球', '游泳', '田径', '马拉松', '健身', '运动', '球员', '赛事', '体育场', '训练', '锻炼', '跑步', '瑜伽'];
    if (sportsKeywords.some(keyword => content.includes(keyword))) {
      return 'sports';
    }

    // 10. 教育类关键词 - 教育、学习、考试等
    const educationKeywords = ['教育', '学校', '学生', '老师', '考试', '学习', '培训', '课程', '大学', '高考', '研究生', '留学', '职业教育', '幼儿园', '小学', '中学', '高中', '招生', '录取', '毕业', '学费', '奖学金', '教师', '校园', '课堂', '作业', '补习', '知识', '技能', '专业', '学术'];
    if (educationKeywords.some(keyword => content.includes(keyword))) {
      return 'education';
    }

    // 11. 健康类关键词 - 医疗、健康、养生等
    const healthKeywords = ['健康', '医疗', '医院', '医生', '疾病', '治疗', '药物', '疫苗', '疫情', '保健', '养生', '健身', '营养', '病毒', '感染', '症状', '诊断', '手术', '康复', '护理', '急救', '体检', '预防', '免疫', '心理健康', '中医', '西医', '药品', '医药'];
    if (healthKeywords.some(keyword => content.includes(keyword))) {
      return 'health';
    }

    // 12. 汽车类关键词 - 汽车、交通等
    const automotiveKeywords = ['汽车', '车', '新能源', '电动车', '特斯拉', '比亚迪', '蔚来', '小鹏', '理想', '奔驰', '宝马', '奥迪', '自动驾驶', '车展', '汽车品牌', '车型', '购车', '驾驶', '交通', '停车', '加油', '充电', '车主', '驾照', '违章', '保险'];
    if (automotiveKeywords.some(keyword => content.includes(keyword))) {
      return 'automotive';
    }

    // 13. 国际类关键词 - 国际新闻、外交等
    const internationalKeywords = ['国际', '外国', '海外', '全球', '世界', '美国', '欧洲', '日本', '韩国', '俄罗斯', '印度', '外交', '合作', '贸易', '峰会', '联合国', '国外', '跨国', '国际组织', '条约', '协议', '制裁', '谈判', '出国', '签证', '移民', '留学生', '国际关系'];
    if (internationalKeywords.some(keyword => content.includes(keyword))) {
      return 'international';
    }

    // 14. 旅游类关键词 - 旅游、出行等
    const travelKeywords = ['旅游', '旅行', '景点', '酒店', '机票', '签证', '度假', '民宿', '攻略', '出境', '国内游', '自驾游', '跟团', '导游', '门票', '住宿', '交通', '路线', '风景', '名胜', '古迹', '公园', '海滩', '山区'];
    if (travelKeywords.some(keyword => content.includes(keyword))) {
      return 'travel';
    }

    // 15. 美食类关键词 - 美食、餐饮等
    const foodKeywords = ['美食', '餐厅', '菜谱', '烹饪', '小吃', '火锅', '烧烤', '甜品', '咖啡', '奶茶', '外卖', '厨师', '食材', '菜品', '料理', '食谱', '饮食', '口味', '特色菜', '地方菜', '零食', '饮料', '酒类', '茶叶'];
    if (foodKeywords.some(keyword => content.includes(keyword))) {
      return 'food';
    }

    // 16. 生活类关键词 - 生活方式、时尚等
    const lifestyleKeywords = ['生活', '购物', '时尚', '美容', '家居', '园艺', '摄影', '手工', '收藏', '穿搭', '化妆', '护肤', '服装', '配饰', '家具', '装饰', '生活方式', '品质生活', '居家', '日常'];
    if (lifestyleKeywords.some(keyword => content.includes(keyword))) {
      return 'lifestyle';
    }

    // 17. 天气类关键词 - 天气、自然灾害等
    const weatherKeywords = ['天气', '气温', '降雨', '台风', '暴雨', '雪', '雾霾', '高温', '低温', '气候', '预报', '极端天气', '自然灾害', '洪水', '干旱', '地震', '火灾', '风暴', '冰雹', '霜冻', '沙尘暴'];
    if (weatherKeywords.some(keyword => content.includes(keyword))) {
      return 'weather';
    }

    // 18. 环保类关键词 - 环保、生态等
    const environmentKeywords = ['环保', '环境', '污染', '减排', '碳中和', '新能源', '可持续', '生态', '绿色', '节能', '回收', '垃圾分类', '空气质量', '水质', '环境保护', '清洁能源', '低碳', '循环经济', '绿化', '植树'];
    if (environmentKeywords.some(keyword => content.includes(keyword))) {
      return 'environment';
    }

    // 19. 农业类关键词 - 农业、农村等
    const agricultureKeywords = ['农业', '农民', '农村', '种植', '养殖', '农产品', '粮食', '蔬菜', '水果', '畜牧', '渔业', '农机', '农药', '化肥', '丰收', '田地', '农场', '农业技术', '农业政策', '乡村振兴'];
    if (agricultureKeywords.some(keyword => content.includes(keyword))) {
      return 'agriculture';
    }

    // 20. 宠物类关键词 - 宠物、动物等
    const petsKeywords = ['宠物', '猫', '狗', '宠物医院', '宠物用品', '宠物食品', '养宠', '宠物店', '宠物美容', '宠物训练', '流浪猫', '流浪狗', '宠物救助', '动物', '萌宠', '宠物主人', '宠物护理', '动物保护'];
    if (petsKeywords.some(keyword => content.includes(keyword))) {
      return 'pets';
    }

    // 未匹配的内容根据常见词汇进行二次分类
    // 优先分配到内容较少的分类，避免都流向娱乐
    if (content.includes('建设') || content.includes('项目') || content.includes('工程') || content.includes('发展')) {
      return 'economy';
    }
    if (content.includes('政策') || content.includes('规定') || content.includes('管理') || content.includes('部门')) {
      return 'society';
    }
    if (content.includes('价格') || content.includes('成本') || content.includes('收入') || content.includes('销售')) {
      return 'economy';
    }
    if (content.includes('用户') || content.includes('功能') || content.includes('更新') || content.includes('版本')) {
      return 'technology';
    }
    if (content.includes('服务') || content.includes('体验') || content.includes('质量') || content.includes('品牌')) {
      return 'lifestyle';
    }
    if (content.includes('房') || content.includes('楼') || content.includes('地产')) {
      return 'realestate';
    }
    if (content.includes('文') || content.includes('书') || content.includes('艺')) {
      return 'culture';
    }
    if (content.includes('发布') || content.includes('宣布') || content.includes('官宣') || content.includes('消息')) {
      return 'society'; // 改为社会，避免都流向娱乐
    }

    // 最终默认归类为社会（更合理的兜底分类）
    return 'society';

    // 未匹配的内容根据常见词汇进行二次分类
    // 优先分配到内容较少的分类，避免都流向娱乐
    if (content.includes('建设') || content.includes('项目') || content.includes('工程') || content.includes('发展')) {
      return 'economy';
    }
    if (content.includes('政策') || content.includes('规定') || content.includes('管理') || content.includes('部门')) {
      return 'society';
    }
    if (content.includes('价格') || content.includes('成本') || content.includes('收入') || content.includes('销售')) {
      return 'economy';
    }
    if (content.includes('用户') || content.includes('功能') || content.includes('更新') || content.includes('版本')) {
      return 'technology';
    }
    if (content.includes('服务') || content.includes('体验') || content.includes('质量') || content.includes('品牌')) {
      return 'lifestyle';
    }
    if (content.includes('房') || content.includes('楼') || content.includes('地产')) {
      return 'realestate';
    }
    if (content.includes('文') || content.includes('书') || content.includes('艺')) {
      return 'culture';
    }
    if (content.includes('发布') || content.includes('宣布') || content.includes('官宣') || content.includes('消息')) {
      return 'society'; // 改为社会，避免都流向娱乐
    }

    // 最终默认归类为社会（更合理的兜底分类）
    return 'society';
  };

  /**
   * 获取分类下的话题
   */
  const getTopicsByCategory = (category: string): DailyHotItem[] => {
    if (category === 'all') {
      return topics;
    }
    return topics.filter(topic => getTopicCategory(topic) === category);
  };

  /**
   * 获取分类统计
   */
  const getCategoryCount = (category: string): number => {
    return getTopicsByCategory(category).length;
  };

  return (
    <div className="mb-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="space-y-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="text-lg">📊</span>
                分类热点信息流
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                按分类多列展示所有热点话题，一目了然查看全网热点
              </p>
            </div>
            {interestFilterComponent && (
              <div className="w-full">
                {interestFilterComponent}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-4">
          {/* 响应式网格布局，确保分类清晰分离 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {categories
              .filter(cat => cat.id !== 'all' && !hiddenCategories.has(cat.id))
              .map(category => ({
                ...category,
                topics: getTopicsByCategory(category.id)
              }))
              // 移除过滤条件，让所有分类都显示
              .sort((a, b) => {
                // 置顶分类排在前面
                const aIsPinned = pinnedCategories.has(a.id);
                const bIsPinned = pinnedCategories.has(b.id);
                if (aIsPinned && !bIsPinned) return -1;
                if (!aIsPinned && bIsPinned) return 1;

                // 按话题数量排序：话题多的排在前面
                const aCount = a.topics.length;
                const bCount = b.topics.length;
                if (aCount !== bCount) {
                  return bCount - aCount;
                }

                // 话题数量相同时，按用户兴趣排序
                const aScore = calculateCategoryScore(a, userWeights);
                const bScore = calculateCategoryScore(b, userWeights);
                return bScore.score - aScore.score;
              })
              .map((category) => {
                const categoryTopics = category.topics;
                const isPinned = pinnedCategories.has(category.id);
                const isExpanded = expandedCategories.has(category.id);
                const displayTopics = isExpanded ? categoryTopics.slice(0, 10) : categoryTopics.slice(0, 5);

                // 记录用户查看行为
                const handleCategoryView = () => {
                  updateCategoryInterest(category.id, 'view');
                };

                // 统一高度逻辑：根据内容数量分档
                const topicCount = categoryTopics.length;
                let contentHeight;

                if (topicCount === 0) {
                  contentHeight = 200; // 空状态统一高度
                } else if (topicCount <= 3) {
                  contentHeight = 300; // 少量内容统一高度
                } else if (topicCount <= 6) {
                  contentHeight = 400; // 中等内容统一高度
                } else if (topicCount <= 10) {
                  contentHeight = 500; // 较多内容统一高度
                } else {
                  contentHeight = 600; // 大量内容统一高度
                }

                return (
                  <Card
                    key={category.id}
                    className={`bg-gradient-to-br ${category.theme} shadow-md hover:shadow-lg transition-all duration-300 ${isPinned ? 'ring-2 ring-primary' : ''} border-2 flex flex-col`}
                    style={{ height: `${contentHeight}px` }}
                  >
                    <CardHeader className="pb-1 px-2 pt-2">
                      {/* 分类标题和操作 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <GripVertical className="w-3 h-3 text-muted-foreground cursor-move" />
                          <span className="text-base">{category.icon}</span>
                          <h3 className="text-sm font-semibold text-foreground">{category.label}</h3>
                          {isPinned && <Pin className="w-2 h-2 text-primary" />}
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                            {categoryTopics.length}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                <MoreVertical className="w-2 h-2" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleCategoryAction(category.id, isPinned ? 'unpin' : 'pin')}>
                                <Pin className="w-3 h-3 mr-2" />
                                {isPinned ? t('topicCategories.actions.unpin') : t('topicCategories.actions.pin')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCategoryAction(category.id, 'hide')}>
                                <EyeOff className="w-3 h-3 mr-2" />
                                屏蔽
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0 px-0 pb-0 flex-1 flex flex-col overflow-hidden">
                      {/* 话题列表 */}
                      <div className="space-y-1 flex-1 overflow-y-auto">
                        {categoryTopics.length === 0 ? (
                          // 空状态占位符
                          <div className="flex flex-col items-center justify-center h-full text-center p-4">
                            <div className="text-4xl mb-2 opacity-50">{category.icon}</div>
                            <p className="text-sm text-muted-foreground mb-1"></p>
                            <p className="text-xs text-muted-foreground opacity-70">$</p>
                          </div>
                        ) : (
                          displayTopics.map((topic, index) => {
                            const isBookmarked = isTopicBookmarked(topic);

                          return (
                            <div
                              key={`${topic.platform}-${index}`}
                              className="px-2 py-1.5 mx-1 rounded border border-border hover:shadow-sm transition-all bg-card/80 hover:bg-card/90 dark:bg-card/80 dark:hover:bg-card/90"
                            >
                              {/* 排名和标题 */}
                              <div className="flex items-start gap-1 mb-1">
                                <span className="text-xs font-bold text-primary flex-shrink-0 mt-0.5">#{index + 1}</span>
                                <h4 className="text-xs font-medium line-clamp-2 flex-1 cursor-pointer hover:text-primary leading-relaxed text-foreground"
                                    onClick={() => {
                                      updateCategoryInterest(category.id, 'click');
                                      onTopicClick(topic);
                                    }}>
                                  {topic.title}
                                </h4>
                              </div>

                              {/* 底部信息：来源 + 热度 + 操作按钮 */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                                    {getPlatformDisplayName(topic.platform || '')}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {formatHotValue(topic.hot)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0 hover:bg-primary/20"
                                    onClick={() => {
                                      updateCategoryInterest(category.id, 'click');
                                      onTopicClick(topic);
                                    }}
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-5 w-5 p-0 hover:bg-primary/20 ${isBookmarked ? 'text-primary' : ''}`}
                                    onClick={() => {
                                      updateCategoryInterest(category.id, 'bookmark');
                                      onToggleBookmark(topic);
                                    }}
                                  >
                                    <Bookmark className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            );
                          })
                        )}

                      </div>

                      {/* 展开/收起按钮 - 固定在底部 */}
                      {categoryTopics.length > 5 && (
                        <div className="text-center pt-2 border-t border-border/50 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-muted-foreground hover:text-primary"
                            onClick={() => toggleExpanded(category.id)}
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-3 h-3 mr-1" />
                                收起
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3 mr-1" />
                                展开更多 ({Math.min(categoryTopics.length, 10) - 5}+)
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>

          {/* 返回顶部按钮 */}
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              onClick={scrollToTop}
              className="rounded-full w-12 h-12 shadow-lg"
              size="sm"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TopicCategories;
