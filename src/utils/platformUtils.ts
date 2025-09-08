/**
 * 平台工具函数
 * 从AdaptPage.tsx中提取的平台相关工具函数
 */

import React from 'react';
import { Book, MessageCircle, Hash, Users, FileText, Video, Zap } from 'lucide-react';
import {
  getPlatformLimit,
  getRecommendedRange,
  getPlatformCharCountAdvice
} from '@/config/platformLimits';

/**
 * 主流平台内容发布入口URL映射
 * 用于一键转发跳转 - 已修复所有平台URL
 */
export const platformUrls: Record<string, string> = {
  // 主流社交媒体平台
  weibo: 'https://weibo.com/compose',                                    // 微博发布页
  xiaohongshu: 'https://creator.xiaohongshu.com/publish/publish',       // 小红书创作者中心
  zhihu: 'https://zhuanlan.zhihu.com/write',                           // 知乎专栏写作
  douyin: 'https://creator.douyin.com/creator-micro/content/upload',    // 抖音创作者中心
  wechat: 'https://mp.weixin.qq.com/',                                 // 微信公众号后台（已修复）

  // 视频平台
  bilibili: 'https://member.bilibili.com/platform/upload/text/edit',   // B站专栏发布
  kuaishou: 'https://cp.kuaishou.com/article/publish',                 // 快手创作者平台

  // 资讯平台
  toutiao: 'https://mp.toutiao.com/profile_v4/graphic/publish',         // 今日头条
  baijia: 'https://baijiahao.baidu.com/builder/rc/edit',              // 百家号

  // 国际平台
  facebook: 'https://www.facebook.com/pages/create/',                   // Facebook页面创建
  twitter: 'https://twitter.com/compose/tweet',                         // Twitter发推
  linkedin: 'https://www.linkedin.com/feed/',                          // LinkedIn动态

  // 技术社区
  v2ex: 'https://www.v2ex.com/new',                                     // V2EX发帖
  github: 'https://github.com/new',                                     // GitHub新建仓库
  juejin: 'https://juejin.cn/editor/drafts/new',                       // 掘金编辑器
  csdn: 'https://mp.csdn.net/mp_blog/creation/editor',                 // CSDN博客

  // 其他平台
  sspai: 'https://sspai.com/write',                                     // 少数派写作
  hellogithub: 'https://hellogithub.com/',                             // HelloGitHub
  ithome: 'https://my.ithome.com/#/write',                             // IT之家
  ngabbs: 'https://bbs.nga.cn/thread.php?fid=-7',                      // NGA论坛

  // 工具类（保留原有）
  weatheralarm: 'https://www.nmc.cn/',                                 // 天气预警
  earthquake: 'https://www.ceic.ac.cn/',                               // 地震信息
  history: 'https://baike.baidu.com/item/%E5%8E%86%E5%8F%B2%E4%B8%8A%E7%9A%84%E4%BB%8A%E5%A4%A9/42704', // 历史上的今天

  // 新增平台
  video: 'https://channels.weixin.qq.com/',                            // 微信视频号
  wangyi: 'https://mp.163.com/',                                       // 网易号
  instagram: 'https://www.instagram.com/',                             // Instagram
  douban: 'https://www.douban.com/'                                    // 豆瓣
};

/**
 * 获取平台名称
 */
export function getPlatformName(platformId: string, platforms: any[]): string {
  const platform = platforms.find(p => p.id === platformId);
  return platform?.name || platformId || '未知平台';
}

/**
 * 获取平台推荐字符数
 */
export function getPlatformRecommendedCharCount(platformId: string): number {
  const range = getRecommendedRange(platformId);
  return Math.floor((range.min + range.max) / 2); // 取推荐范围的中间值
}

/**
 * 获取平台最大字符数
 */
export function getPlatformMaxCharCount(platformId: string): number {
  const limit = getPlatformLimit(platformId);
  return limit?.maxCharacters || 2000;
}

/**
 * 获取平台描述
 */
export function getPlatformDescription(platformId: string): string {
  const limit = getPlatformLimit(platformId);
  return limit?.description || '平台字符数限制';
}

/**
 * 获取平台图标
 */
export function getPlatformIcon(platformId: string): JSX.Element {
  switch (platformId) {
    case 'xiaohongshu':
      return React.createElement(Book, { className: "h-4 w-4 text-accent" });
    case 'douyin':
      return React.createElement(Video, { className: "h-4 w-4 text-accent" });
    case 'weibo':
      return React.createElement(MessageCircle, { className: "h-4 w-4 text-accent" });
    case 'zhihu':
      return React.createElement(Zap, { className: "h-4 w-4 text-accent" });
    case 'wechat':
      return React.createElement(MessageCircle, { className: "h-4 w-4 text-accent" });
    case 'bilibili':
      return React.createElement(Video, { className: "h-4 w-4 text-accent" });
    default:
      return React.createElement(Hash, { className: "h-4 w-4 text-accent" });
  }
}

/**
 * 计算安全范围
 */
export function calculateSafetyRange(userSetLimit: number, platformId: string): { min: number; max: number } {
  const limits = getPlatformLimit(platformId);

  // 确保用户设置不超过平台最大限制
  const effectiveLimit = Math.min(userSetLimit, limits?.maxCharacters || 2000);

  return {
    min: Math.max(50, Math.floor(effectiveLimit * 0.8)), // 80%作为下限
    max: effectiveLimit
  };
}

/**
 * 计算最优字符数
 */
export function calculateOptimalCharCount(platformId: string, userSetLimit: number): { min: number; max: number } {
  // 使用平台建议的范围，而不是最大限制
  const recommendedRange = getRecommendedRange(platformId);
  const platformLimit = getPlatformLimit(platformId);

  if (recommendedRange && platformLimit) {
    // 使用平台推荐范围
    const effectiveMax = Math.min(userSetLimit, recommendedRange.max);
    return {
      min: Math.max(recommendedRange.min, Math.floor(effectiveMax * 0.8)),
      max: effectiveMax
    };
  }

  // 回退到安全范围计算
  return calculateSafetyRange(userSetLimit, platformId);
}

/**
 * 获取平台特色和差异化要求
 */
export function getPlatformCharacteristics(platform: string): {
  tone: string;
  features: string[];
  contentStyle: string;
  hashtagStyle: string;
  emojiUsage: string;
} {
  const characteristics = {
    xiaohongshu: {
      tone: '年轻活泼、生活化',
      features: ['种草分享', '生活方式', '美妆时尚', '旅行美食'],
      contentStyle: '图文并茂，重视视觉效果',
      hashtagStyle: '多用话题标签，增加曝光',
      emojiUsage: '适量使用，增加亲和力'
    },
    douyin: {
      tone: '轻松有趣、娱乐化',
      features: ['短视频', '音乐配合', '创意表达', '流行趋势'],
      contentStyle: '简洁有力，适合视频脚本',
      hashtagStyle: '紧跟热门话题和挑战',
      emojiUsage: '丰富使用，增强表现力'
    },
    weibo: {
      tone: '简洁明快、新闻化',
      features: ['热点讨论', '观点表达', '转发互动', '实时性'],
      contentStyle: '简明扼要，适合快速阅读',
      hashtagStyle: '话题标签，便于检索',
      emojiUsage: '适度使用，保持专业'
    },
    zhihu: {
      tone: '专业理性、知识化',
      features: ['深度分析', '专业见解', '逻辑清晰', '知识分享'],
      contentStyle: '结构化内容，重视逻辑',
      hashtagStyle: '专业标签，分类明确',
      emojiUsage: '谨慎使用，保持严肃'
    },
    wechat: {
      tone: '温和亲切、私密化',
      features: ['深度阅读', '情感共鸣', '价值传递', '社交分享'],
      contentStyle: '长文形式，注重可读性',
      hashtagStyle: '少用标签，重视内容',
      emojiUsage: '温和使用，增加温度'
    },
    bilibili: {
      tone: '年轻潮流、二次元化',
      features: ['视频内容', '弹幕文化', '创作分享', '兴趣社区'],
      contentStyle: '有趣生动，适合年轻人',
      hashtagStyle: '兴趣标签，圈层文化',
      emojiUsage: '创意使用，表达个性'
    }
  };

  return characteristics[platform as keyof typeof characteristics] || {
    tone: '通用风格',
    features: ['内容分享'],
    contentStyle: '标准格式',
    hashtagStyle: '常规标签',
    emojiUsage: '适量使用'
  };
}

/**
 * 获取平台超时配置
 */
export function getPlatformTimeoutConfig(platformId: string) {
  const isLongContentPlatform = ['wechat', 'zhihu'].includes(platformId);
  return {
    isLongContent: isLongContentPlatform,
    timeout: isLongContentPlatform ? 180000 : 90000, // 长内容平台3分钟，其他90秒
    maxRetries: isLongContentPlatform ? 2 : 3
  };
}

/**
 * 验证内容字符数
 */
export function validateContentCharCount(
  content: string,
  platformId: string,
  userSetLimit: number
): {
  isValid: boolean;
  actualCount: number;
  targetMin: number;
  targetMax: number;
  warning?: string;
} {
  const actualCount = content.length;
  const limits = getPlatformLimit(platformId);

  // 修复：使用实际字符数计算合理的目标范围
  const targetMin = Math.max(50, Math.floor(actualCount * 0.9)); // 实际字符数的90%作为下限
  const targetMax = Math.min(userSetLimit, limits?.maxCharacters || 2000);

  let warning: string | undefined;

  // 检查是否超出限制
  if (actualCount > userSetLimit) {
    warning = `⚠️ 内容超出用户设置的${userSetLimit}字符限制，当前${actualCount}字符`;
  } else if (limits && actualCount > limits.maxCharacters) {
    warning = `⚠️ 内容超出${platformId}平台最大限制${limits.maxCharacters}字符`;
  }

  // 判断是否在合理范围内（不超过用户设置和平台限制）
  const isValid = actualCount <= userSetLimit && 
                  (!limits || actualCount <= limits.maxCharacters) &&
                  actualCount >= 50; // 最小50字符

  return {
    isValid,
    actualCount,
    targetMin,
    targetMax,
    warning
  };
}
