/**
 * AdaptPage辅助函数模块
 * 从原AdaptPage.tsx中抽取纯函数，不改变任何业务逻辑
 */

import {
  getCharCountMax as getConfigCharCountMax,
  getCharCountMin as getConfigCharCountMin,
  getPlatformLimit,
  getRecommendedRange,
} from '@/config/platformLimits';

/**
 * 主流平台内容发布入口URL映射 - 从原AdaptPage.tsx完全复制
 */
export const platformUrls: Record<string, string> = {
  // 主流社交媒体平台
  weibo: 'https://weibo.com/compose',
  xiaohongshu: 'https://creator.xiaohongshu.com/publish/publish',
  zhihu: 'https://zhuanlan.zhihu.com/write',
  douyin: 'https://creator.douyin.com/creator-micro/content/upload',
  wechat: 'https://mp.weixin.qq.com/',

  // 视频平台
  bilibili: 'https://member.bilibili.com/platform/upload/text/edit',
  kuaishou: 'https://cp.kuaishou.com/article/publish',

  // 资讯平台
  toutiao: 'https://mp.toutiao.com/profile_v4/graphic/publish',
  baijiahao: 'https://baijiahao.baidu.com/builder/rc/edit',

  // 国际平台
  facebook: 'https://www.facebook.com/pages/create/',
  twitter: 'https://twitter.com/compose/tweet',
  linkedin: 'https://www.linkedin.com/feed/',

  // 技术社区
  v2ex: 'https://www.v2ex.com/new',
  github: 'https://github.com/new',
  juejin: 'https://juejin.cn/editor/drafts/new',
  csdn: 'https://mp.csdn.net/mp_blog/creation/editor',

  // 其他平台
  sspai: 'https://sspai.com/write',
  hellogithub: 'https://hellogithub.com/',
  ithome: 'https://my.ithome.com/#/write',
  ngabbs: 'https://bbs.nga.cn/thread.php?fid=-7',

  // 工具类
  weatheralarm: 'https://www.nmc.cn/',
  earthquake: 'https://www.ceic.ac.cn/',
  history: 'https://baike.baidu.com/item/%E5%8E%86%E5%8F%B2%E4%B8%8A%E7%9A%84%E4%BB%8A%E5%A4%A9/42704'
};

// Helper function to get platform name consistently - 从原文件完全复制
export function getPlatformName(platformId: string, platforms: any[]): string {
  const platform = platforms.find(p => p.id === platformId);
  return platform?.name || platformId || '未知平台';
}

// Helper function to get platform recommended character count - 从原文件完全复制
export function getPlatformRecommendedCharCount(platformId: string): number {
  const range = getRecommendedRange(platformId);
  return Math.floor((range.min + range.max) / 2);
}

// Helper function to get platform max character count - 从原文件完全复制
export function getPlatformMaxCharCount(platformId: string): number {
  const limit = getPlatformLimit(platformId);
  return limit?.maxCharacters || 2000;
}

// Helper function to get platform description - 从原文件完全复制
export function getPlatformDescription(platformId: string): string {
  const limit = getPlatformLimit(platformId);
  return limit?.description || '平台字符数限制';
}

// Helper function to calculate safety range for content generation - 从原文件完全复制
export function calculateSafetyRange(userSetLimit: number, platformId: string): { min: number; max: number } {
  const limits = getPlatformLimit(platformId);
  const effectiveLimit = Math.min(userSetLimit, limits?.maxCharacters || 2000);
  const safetyMin = Math.floor(effectiveLimit * 0.9);
  const safetyMax = Math.floor(effectiveLimit * 0.95);
  return { min: safetyMin, max: safetyMax };
}

// 新的字符数控制逻辑：生成目标范围内的内容，禁止截断 - 从原文件完全复制
export function calculateOptimalCharCount(platformId: string, userSetLimit: number): { min: number; max: number } {
  const recommendedRange = getRecommendedRange(platformId);
  const platformLimit = getPlatformLimit(platformId);

  if (recommendedRange && platformLimit) {
    const targetMin = recommendedRange.min;
    const targetMax = Math.min(recommendedRange.max, userSetLimit, platformLimit.maxCharacters);
    return { min: targetMin, max: targetMax };
  }

  const platformMax = Math.min(platformLimit?.maxCharacters || 2000, userSetLimit);
  const targetMin = platformLimit?.minCharacters || 50;
  const targetMax = Math.floor(platformMax * 0.95);

  return {
    min: Math.max(targetMin, 50),
    max: Math.max(targetMax, targetMin + 50)
  };
}

// 清理AI生成内容中的多余文案 - 从原文件完全复制
export function cleanGeneratedContent(content: string): string {
  let cleanedContent = content;

  // 移除配图建议及相关文案
  cleanedContent = cleanedContent.replace(/（配图建议：[^）]*）/g, '');
  cleanedContent = cleanedContent.replace(/\(配图建议：[^)]*\)/g, '');
  cleanedContent = cleanedContent.replace(/【配图建议：[^】]*】/g, '');
  cleanedContent = cleanedContent.replace(/\[配图建议：[^\]]*\]/g, '');

  // 移除工具界面截图相关文案
  cleanedContent = cleanedContent.replace(/（工具界面截图[^）]*）/g, '');
  cleanedContent = cleanedContent.replace(/\(工具界面截图[^)]*\)/g, '');
  cleanedContent = cleanedContent.replace(/【工具界面截图[^】]*】/g, '');
  cleanedContent = cleanedContent.replace(/\[工具界面截图[^\]]*\]/g, '');

  // 移除多平台内容对比拼图相关文案
  cleanedContent = cleanedContent.replace(/（多平台内容对比拼图[^）]*）/g, '');
  cleanedContent = cleanedContent.replace(/\(多平台内容对比拼图[^)]*\)/g, '');
  cleanedContent = cleanedContent.replace(/【多平台内容对比拼图[^】]*】/g, '');
  cleanedContent = cleanedContent.replace(/\[多平台内容对比拼图[^\]]*\]/g, '');

  // 移除其他图片相关建议
  cleanedContent = cleanedContent.replace(/（图片：[^）]*）/g, '');
  cleanedContent = cleanedContent.replace(/\(图片：[^)]*\)/g, '');
  cleanedContent = cleanedContent.replace(/【图片：[^】]*】/g, '');
  cleanedContent = cleanedContent.replace(/\[图片：[^\]]*\]/g, '');

  // 移除字符数统计文案
  cleanedContent = cleanedContent.replace(/👉字符数：\d+[^。！？\n]*/g, '');
  cleanedContent = cleanedContent.replace(/字符数：\d+[^。！？\n]*/g, '');
  cleanedContent = cleanedContent.replace(/\d+字符[^。！？\n]*/g, '');
  cleanedContent = cleanedContent.replace(/（\d+字符）/g, '');
  cleanedContent = cleanedContent.replace(/\(\d+字符\)/g, '');

  // 移除其他元数据文案
  cleanedContent = cleanedContent.replace(/【注意：[^】]*】/g, '');
  cleanedContent = cleanedContent.replace(/\[注意：[^\]]*\]/g, '');
  cleanedContent = cleanedContent.replace(/（注意：[^）]*）/g, '');
  cleanedContent = cleanedContent.replace(/\(注意：[^)]*\)/g, '');

  // 移除建议类文案
  cleanedContent = cleanedContent.replace(/【建议：[^】]*】/g, '');
  cleanedContent = cleanedContent.replace(/\[建议：[^\]]*\]/g, '');
  cleanedContent = cleanedContent.replace(/（建议：[^）]*）/g, '');
  cleanedContent = cleanedContent.replace(/\(建议：[^)]*\)/g, '');

  // 移除提示类文案
  cleanedContent = cleanedContent.replace(/【提示：[^】]*】/g, '');
  cleanedContent = cleanedContent.replace(/\[提示：[^\]]*\]/g, '');
  cleanedContent = cleanedContent.replace(/（提示：[^）]*）/g, '');
  cleanedContent = cleanedContent.replace(/\(提示：[^)]*\)/g, '');

  // 移除表情符号提示
  cleanedContent = cleanedContent.replace(/（可添加表情[^）]*）/g, '');
  cleanedContent = cleanedContent.replace(/\(可添加表情[^)]*\)/g, '');

  // 移除多余的空行和空格
  cleanedContent = cleanedContent.replace(/\n{3,}/g, '\n\n');
  cleanedContent = cleanedContent.replace(/\s+$/gm, '');
  cleanedContent = cleanedContent.trim();

  return cleanedContent;
}