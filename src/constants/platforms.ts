import { SiWechat, SiXiaohongshu, SiZhihu, SiBilibili, SiSinaweibo, SiDouyin, SiToutiao } from "react-icons/si";

export const platformLinks = {
  wechat: 'https://mp.weixin.qq.com/',
  xiaohongshu: 'https://creator.xiaohongshu.com/',
  zhihu: 'https://zhuanlan.zhihu.com/write',
  bilibili: 'https://member.bilibili.com/platform/upload/text/essay',
  weibo: 'https://weibo.com/newpost',
  douyin: 'https://creator.douyin.com/creator-micro/content/upload',
  toutiao: 'https://mp.toutiao.com/profile_v4/graphic/publish',
};

export const platformIcons = {
  wechat: <SiWechat className="text-green-500" />,
  xiaohongshu: <SiXiaohongshu className="text-red-500" />,
  zhihu: <SiZhihu className="text-blue-500" />,
  bilibili: <SiBilibili className="text-pink-400" />,
  weibo: <SiSinaweibo className="text-orange-500" />,
  douyin: <SiDouyin className="text-black" />,
  toutiao: <SiToutiao className="text-red-600" />,
};

export const platformNameMap = {
  wechat: '微信公众号',
  xiaohongshu: '小红书',
  zhihu: '知乎',
  bilibili: 'B站',
  weibo: '微博',
  douyin: '抖音',
  toutiao: '头条号',
};

export function getPlatformContent(platform, { title, body, coverImage }) {
  switch (platform) {
    case 'weibo':
      return `${title}\n${body}\n${coverImage}`;
    case 'douyin':
      return `#${title}#\n${body}\n配图：${coverImage}`;
    case 'toutiao':
      return `标题：${title}\n\n${body}\n\n图片：${coverImage}`;
    // ...其他平台同理
    default:
      return `${title}\n\n${body}\n${coverImage}`;
  }
} 