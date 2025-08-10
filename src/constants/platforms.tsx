import { SiWechat, SiXiaohongshu, SiBilibili, SiSinaweibo } from "react-icons/si";
import { FaTiktok, FaNewspaper, FaYoutube } from "react-icons/fa";
import { Globe, Smartphone, Monitor, Video, Rss, Zap, Users, BookOpen } from "lucide-react";

export const platformLinks = {
  wechat: 'https://mp.weixin.qq.com/',
  xiaohongshu: 'https://creator.xiaohongshu.com/',
  bilibili: 'https://member.bilibili.com/platform/upload/text/essay',
  weibo: 'https://weibo.com/newpost',
  douyin: 'https://creator.douyin.com/creator-micro/content/upload',
  toutiao: 'https://mp.toutiao.com/profile_v4/graphic/publish',
  kuaishou: 'https://cp.kuaishou.com/article/publish/video',
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
  wechat: <SiWechat className="text-foreground" />,
  xiaohongshu: <SiXiaohongshu className="text-destructive" />,
  bilibili: <SiBilibili className="text-primary" />,
  weibo: <SiSinaweibo className="text-foreground" />,
  douyin: <FaTiktok className="text-foreground" />,
  toutiao: <FaNewspaper className="text-destructive" />,
  kuaishou: <Zap className="text-foreground" />,
  wangyi: <Rss className="text-destructive" />,
  qutoutiao: <BookOpen className="text-primary" />,
  pengpai: <Monitor className="text-primary" />,
  sohu: <Globe className="text-foreground" />,
  iqiyi: <Video className="text-foreground" />,
  youtube: <FaYoutube className="text-destructive" />,
  twitter: <Globe className="text-primary" />,
  linkedin: <Users className="text-primary" />,
  facebook: <Globe className="text-primary" />
};

export const platformNameMap = {
  wechat: '微信公众号',
  xiaohongshu: '小红书',
  bilibili: 'B站',
  weibo: '微博',
  douyin: '抖音',
  toutiao: '头条号',
  kuaishou: '快手',
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
    platforms: ['xiaohongshu', 'bilibili', 'toutiao', 'wangyi', 'qutoutiao', 'pengpai', 'sohu']
  },
  video: {
    name: '视频平台',
    platforms: ['douyin', 'kuaishou', 'bilibili', 'iqiyi', 'youtube']
  },
  news: {
    name: '资讯平台',
    platforms: ['toutiao', 'wangyi', 'qutoutiao', 'pengpai', 'sohu']
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
    features: ['深度报道', '图文', '视频', '专题', '评论', '数据可视化']
  },
  sohu: {
    maxLength: 3000,
    supportImages: true,
    supportVideo: true,
    supportLinks: true,
    supportHashtags: false,
    supportMentions: false,
    optimalLength: [800, 1500],
    features: ['图文', '视频', '音频', '图集', '专题', '互动']
  },
  iqiyi: {
    maxLength: 1000,
    supportImages: true,
    supportVideo: true,
    supportLinks: true,
    supportHashtags: true,
    supportMentions: true,
    optimalLength: [200, 500],
    features: ['视频', '图文', '话题', '@用户', '音乐', '特效']
  },
  youtube: {
    maxLength: 5000,
    supportImages: true,
    supportVideo: true,
    supportLinks: true,
    supportHashtags: true,
    supportMentions: true,
    optimalLength: [1000, 3000],
    features: ['视频', '图文', '话题', '@用户', '音乐', '特效', '字幕']
  },
  twitter: {
    maxLength: 280,
    supportImages: true,
    supportVideo: true,
    supportLinks: true,
    supportHashtags: true,
    supportMentions: true,
    optimalLength: [50, 200],
    features: ['推文', '图片', '视频', '话题', '@用户', '投票', '空间']
  },
  linkedin: {
    maxLength: 3000,
    supportImages: true,
    supportVideo: true,
    supportLinks: true,
    supportHashtags: true,
    supportMentions: true,
    optimalLength: [500, 1500],
    features: ['文章', '图片', '视频', '话题', '@用户', '投票', '活动']
  },
  facebook: {
    maxLength: 63206,
    supportImages: true,
    supportVideo: true,
    supportLinks: true,
    supportHashtags: true,
    supportMentions: true,
    optimalLength: [100, 500],
    features: ['帖子', '图片', '视频', '话题', '@用户', '投票', '活动']
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
      return `${title}\n\n${body}${spec.supportHashtags ? '\n\nblueook #分享' : ''}${coverImage ? `\n\n${coverImage}` : ''}`;
    
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