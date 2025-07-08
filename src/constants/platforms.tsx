import { SiWechat, SiXiaohongshu, SiZhihu, SiBilibili, SiSinaweibo } from "react-icons/si";
import { FaTiktok, FaNewspaper, FaYoutube } from "react-icons/fa";
import { Globe, Smartphone, Monitor, Video, Rss, Zap, Users, BookOpen } from "lucide-react";

export const platformLinks = {
  wechat: 'https://mp.weixin.qq.com/',
  xiaohongshu: 'https://creator.xiaohongshu.com/',
  zhihu: 'https://zhuanlan.zhihu.com/write',
  bilibili: 'https://member.bilibili.com/platform/upload/text/essay',
  weibo: 'https://weibo.com/newpost',
  douyin: 'https://creator.douyin.com/creator-micro/content/upload',
  toutiao: 'https://mp.toutiao.com/profile_v4/graphic/publish',
  kuaishou: 'https://cp.kuaishou.com/article/publish/video',
  baijia: 'https://baijiahao.baidu.com/builder/rc/edit',
  wangyi: 'https://mp.163.com/article/publish',
  qutoutiao: 'https://mp.qutoutiao.net/article/publish',
  pengpai: 'https://www.thepaper.cn/newsDetail_forward_1234567',
  sohu: 'https://mp.sohu.com/mpfe/v3/main/news/addarticle',
  iqiyi: 'https://mp.iqiyi.com/v2/works/article/create',
  youtube: 'https://studio.youtube.com/channel/UC/videos/upload',
  twitter: 'https://twitter.com/compose/tweet',
  linkedin: 'https://www.linkedin.com/pulse/new',
  facebook: 'https://www.facebook.com/pages/create'
};

export const platformIcons = {
  wechat: <SiWechat className="text-green-500" />,
  xiaohongshu: <SiXiaohongshu className="text-red-500" />,
  zhihu: <SiZhihu className="text-blue-500" />,
  bilibili: <SiBilibili className="text-pink-400" />,
  weibo: <SiSinaweibo className="text-orange-500" />,
  douyin: <FaTiktok className="text-black" />,
  toutiao: <FaNewspaper className="text-red-600" />,
  kuaishou: <Zap className="text-yellow-500" />,
  baijia: <Globe className="text-blue-600" />,
  wangyi: <Rss className="text-red-500" />,
  qutoutiao: <BookOpen className="text-purple-500" />,
  pengpai: <Monitor className="text-blue-700" />,
  sohu: <Globe className="text-orange-600" />,
  iqiyi: <Video className="text-green-600" />,
  youtube: <FaYoutube className="text-red-500" />,
  twitter: <Globe className="text-blue-400" />,
  linkedin: <Users className="text-blue-700" />,
  facebook: <Globe className="text-blue-600" />
};

export const platformNameMap = {
  wechat: '微信公众号',
  xiaohongshu: '小红书',
  zhihu: '知乎',
  bilibili: 'B站',
  weibo: '微博',
  douyin: '抖音',
  toutiao: '头条号',
  kuaishou: '快手',
  baijia: '百家号',
  wangyi: '网易号',
  qutoutiao: '趣头条',
  pengpai: '澎湃号',
  sohu: '搜狐号',
  iqiyi: '爱奇艺号',
  youtube: 'YouTube',
  twitter: 'Twitter(X)',
  linkedin: 'LinkedIn',
  facebook: 'Facebook'
};

export const platformCategories = {
  social: {
    name: '社交媒体',
    platforms: ['wechat', 'weibo', 'twitter', 'facebook', 'linkedin']
  },
  content: {
    name: '内容平台',
    platforms: ['xiaohongshu', 'zhihu', 'bilibili', 'toutiao', 'baijia', 'wangyi', 'qutoutiao', 'pengpai', 'sohu']
  },
  video: {
    name: '视频平台',
    platforms: ['douyin', 'kuaishou', 'bilibili', 'iqiyi', 'youtube']
  },
  news: {
    name: '资讯平台',
    platforms: ['toutiao', 'baijia', 'wangyi', 'qutoutiao', 'pengpai', 'sohu']
  }
};

export const platformSpecs = {
  wechat: {
    maxLength: 5000,
    supportImages: true,
    supportVideo: true,
    supportLinks: true,
    supportHashtags: false,
    supportMentions: false,
    optimalLength: [800, 2000],
    features: ['富文本编辑', '图片插入', '视频插入', '超链接', '音频', '投票']
  },
  xiaohongshu: {
    maxLength: 1000,
    supportImages: true,
    supportVideo: true,
    supportLinks: false,
    supportHashtags: true,
    supportMentions: true,
    optimalLength: [50, 200],
    features: ['图片', '视频', '话题标签', '@用户', '定位', '商品标签']
  },
  zhihu: {
    maxLength: 3000,
    supportImages: true,
    supportVideo: true,
    supportLinks: true,
    supportHashtags: true,
    supportMentions: true,
    optimalLength: [500, 1500],
    features: ['专栏文章', '问答', '想法', '图片', '视频', '超链接', '数学公式']
  },
  bilibili: {
    maxLength: 500,
    supportImages: true,
    supportVideo: true,
    supportLinks: true,
    supportHashtags: true,
    supportMentions: true,
    optimalLength: [100, 300],
    features: ['视频', '专栏', '动态', '图片', '话题', '@用户', '表情包']
  },
  weibo: {
    maxLength: 2000,
    supportImages: true,
    supportVideo: true,
    supportLinks: true,
    supportHashtags: true,
    supportMentions: true,
    optimalLength: [50, 140],
    features: ['图片', '视频', '话题', '@用户', '定位', '投票', '表情']
  },
  douyin: {
    maxLength: 100,
    supportImages: false,
    supportVideo: true,
    supportLinks: false,
    supportHashtags: true,
    supportMentions: true,
    optimalLength: [20, 50],
    features: ['短视频', '话题', '@用户', '音乐', '特效', '贴纸']
  },
  toutiao: {
    maxLength: 4000,
    supportImages: true,
    supportVideo: true,
    supportLinks: true,
    supportHashtags: true,
    supportMentions: false,
    optimalLength: [800, 2000],
    features: ['图文', '视频', '微头条', '问答', '话题', '原创标识']
  },
  kuaishou: {
    maxLength: 200,
    supportImages: true,
    supportVideo: true,
    supportLinks: false,
    supportHashtags: true,
    supportMentions: true,
    optimalLength: [20, 50],
    features: ['短视频', '直播', '话题', '@用户', '音乐', '特效']
  },
  baijia: {
    maxLength: 4000,
    supportImages: true,
    supportVideo: true,
    supportLinks: true,
    supportHashtags: false,
    supportMentions: false,
    optimalLength: [1000, 2500],
    features: ['图文', '视频', '图集', '原创保护', 'SEO优化', '广告分成']
  },
  wangyi: {
    maxLength: 3000,
    supportImages: true,
    supportVideo: true,
    supportLinks: true,
    supportHashtags: false,
    supportMentions: false,
    optimalLength: [800, 1500],
    features: ['图文', '视频', '音频', '图集', '专题', '互动']
  },
  qutoutiao: {
    maxLength: 2000,
    supportImages: true,
    supportVideo: true,
    supportLinks: true,
    supportHashtags: true,
    supportMentions: false,
    optimalLength: [500, 1000],
    features: ['图文', '视频', '小视频', '话题', '原创标识']
  },
  pengpai: {
    maxLength: 5000,
    supportImages: true,
    supportVideo: true,
    supportLinks: true,
    supportHashtags: false,
    supportMentions: false,
    optimalLength: [1000, 3000],
    features: ['新闻', '评论', '图片', '视频', '专题', '深度报道']
  },
  sohu: {
    maxLength: 3000,
    supportImages: true,
    supportVideo: true,
    supportLinks: true,
    supportHashtags: false,
    supportMentions: false,
    optimalLength: [800, 1500],
    features: ['图文', '视频', '图集', '焦点图', '广告分成']
  },
  iqiyi: {
    maxLength: 1000,
    supportImages: true,
    supportVideo: true,
    supportLinks: false,
    supportHashtags: true,
    supportMentions: false,
    optimalLength: [200, 500],
    features: ['视频', '图文', '话题', '泡泡圈', '弹幕']
  },
  youtube: {
    maxLength: 5000,
    supportImages: true,
    supportVideo: true,
    supportLinks: true,
    supportHashtags: true,
    supportMentions: false,
    optimalLength: [100, 500],
    features: ['视频', '直播', '社区', '话题', '字幕', '章节']
  },
  twitter: {
    maxLength: 280,
    supportImages: true,
    supportVideo: true,
    supportLinks: true,
    supportHashtags: true,
    supportMentions: true,
    optimalLength: [50, 200],
    features: ['推文', '图片', '视频', '话题', '@用户', '投票', '直播']
  },
  linkedin: {
    maxLength: 3000,
    supportImages: true,
    supportVideo: true,
    supportLinks: true,
    supportHashtags: true,
    supportMentions: true,
    optimalLength: [200, 600],
    features: ['文章', '动态', '图片', '视频', '话题', '@用户', '投票']
  },
  facebook: {
    maxLength: 63206,
    supportImages: true,
    supportVideo: true,
    supportLinks: true,
    supportHashtags: true,
    supportMentions: true,
    optimalLength: [100, 400],
    features: ['帖子', '图片', '视频', '直播', '话题', '@用户', '投票', '活动']
  }
};

export function getPlatformContent(platform: string, { title, body, coverImage }: { title: string; body: string; coverImage?: string }) {
  const spec = platformSpecs[platform as keyof typeof platformSpecs];
  
  if (!spec) {
    return `${title}\n\n${body}${coverImage ? `\n\n${coverImage}` : ''}`;
  }

  switch (platform) {
    case 'weibo':
      return `${title} ${spec.supportHashtags ? '#微博话题#' : ''}\n${body}${coverImage ? `\n${coverImage}` : ''}`;
    
    case 'douyin':
    case 'kuaishou':
      return `${spec.supportHashtags ? `#${title}#` : title}\n${body}${coverImage ? `\n配图：${coverImage}` : ''}`;
    
    case 'xiaohongshu':
      return `${title} ✨\n\n${body}${spec.supportHashtags ? '\n\n#小红书 #分享' : ''}${coverImage ? `\n\n📸 ${coverImage}` : ''}`;
    
    case 'zhihu':
      return `## ${title}\n\n${body}${coverImage ? `\n\n![图片](${coverImage})` : ''}`;
    
    case 'wechat':
      return `**${title}**\n\n${body}${coverImage ? `\n\n![](${coverImage})` : ''}`;
    
    case 'bilibili':
      return `${title}\n\n${body}${spec.supportHashtags ? '\n\n#B站 #分享' : ''}${coverImage ? `\n\n${coverImage}` : ''}`;
    
    case 'toutiao':
    case 'baijia':
    case 'wangyi':
    case 'qutoutiao':
    case 'pengpai':
    case 'sohu':
      return `标题：${title}\n\n${body}${coverImage ? `\n\n图片：${coverImage}` : ''}`;
    
    case 'twitter':
      return `${title}\n\n${body}${spec.supportHashtags ? '\n\n#Twitter #分享' : ''}${coverImage ? `\n\n${coverImage}` : ''}`;
    
    case 'linkedin':
      return `${title}\n\n${body}${spec.supportHashtags ? '\n\n#LinkedIn #Professional' : ''}${coverImage ? `\n\n${coverImage}` : ''}`;
    
    case 'facebook':
      return `${title}\n\n${body}${spec.supportHashtags ? '\n\n#Facebook #分享' : ''}${coverImage ? `\n\n${coverImage}` : ''}`;
    
    case 'youtube':
      return `${title}\n\n${body}${spec.supportHashtags ? '\n\n#YouTube #Video' : ''}`;
    
    default:
      return `${title}\n\n${body}${coverImage ? `\n\n${coverImage}` : ''}`;
  }
}

export function getPlatformOptimalLength(platform: string): [number, number] {
  const spec = platformSpecs[platform as keyof typeof platformSpecs];
  return spec?.optimalLength as [number, number] || [100, 500];
}

export function getPlatformMaxLength(platform: string): number {
  const spec = platformSpecs[platform as keyof typeof platformSpecs];
  return spec?.maxLength || 1000;
}

export function getPlatformFeatures(platform: string): string[] {
  const spec = platformSpecs[platform as keyof typeof platformSpecs];
  return spec?.features || [];
}

export function validatePlatformContent(platform: string, content: string): { valid: boolean; message?: string } {
  const spec = platformSpecs[platform as keyof typeof platformSpecs];
  
  if (!spec) {
    return { valid: true };
  }

  if (content.length > spec.maxLength) {
    return { 
      valid: false, 
      message: `内容长度超过 ${spec.maxLength} 字符限制` 
    };
  }

  const [minLength, maxLength] = spec.optimalLength;
  if (content.length < minLength) {
    return { 
      valid: true, 
      message: `建议内容长度至少 ${minLength} 字符以获得更好效果` 
    };
  }

  if (content.length > maxLength) {
    return { 
      valid: true, 
      message: `建议内容长度不超过 ${maxLength} 字符以获得更好效果` 
    };
  }

  return { valid: true };
}

// 导出平台数组用于UI组件
export const platforms = Object.keys(platformNameMap).map(id => ({
  id,
  name: platformNameMap[id as keyof typeof platformNameMap],
  icon: platformIcons[id as keyof typeof platformIcons],
  description: `发布到 ${platformNameMap[id as keyof typeof platformNameMap]}`,
  maxLength: platformSpecs[id as keyof typeof platformSpecs]?.maxLength || 1000,
  features: platformSpecs[id as keyof typeof platformSpecs]?.features || []
})); 