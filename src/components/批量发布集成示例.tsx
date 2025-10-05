/**
 * 批量发布功能集成示例
 * 展示如何在ContentAdapterPage中使用EnhancedBatchPublishPanel
 */

import React, { useState, useMemo } from 'react';
import { EnhancedBatchPublishPanel } from './EnhancedBatchPublishPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Globe,
  Smartphone,
  Monitor,
  Video
} from 'lucide-react';

// 平台URL映射
const platformPublishUrls: Record<string, string> = {
  xiaohongshu: 'https://creator.xiaohongshu.com/publish/publish',
  weibo: 'https://weibo.com/compose',
  zhihu: 'https://zhuanlan.zhihu.com/write',
  douyin: 'https://creator.douyin.com/creator-micro/content/upload',
  wechat: 'https://mp.weixin.qq.com/',
  bilibili: 'https://member.bilibili.com/platform/upload/text/edit',
  kuaishou: 'https://cp.kuaishou.com/article/publish',
  toutiao: 'https://mp.toutiao.com/profile_v4/graphic/publish',
};

// 平台配置
const platformConfigs = {
  xiaohongshu: {
    name: '小红书',
    icon: <Smartphone className="w-4 h-4" />,
    color: 'bg-red-500',
    maxLength: 1000
  },
  weibo: {
    name: '微博',
    icon: <Globe className="w-4 h-4" />,
    color: 'bg-orange-500',
    maxLength: 2000
  },
  zhihu: {
    name: '知乎',
    icon: <Monitor className="w-4 h-4" />,
    color: 'bg-blue-500',
    maxLength: 3000
  },
  douyin: {
    name: '抖音',
    icon: <Video className="w-4 h-4" />,
    color: 'bg-black',
    maxLength: 55
  },
  bilibili: {
    name: 'B站',
    icon: <Video className="w-4 h-4" />,
    color: 'bg-pink-500',
    maxLength: 2000
  }
};

/**
 * 在ContentAdapterPage中的集成示例
 */
export function ContentAdapterPageExample() {
  // 模拟生成的平台内容数据
  const [generatedContents, setGeneratedContents] = useState({
    xiaohongshu: {
      title: '超好用的AI工具分享！',
      content: '今天给大家分享一个我最近发现的宝藏AI工具...',
      hashtags: ['#AI工具', '#效率神器', '#好物推荐']
    },
    weibo: {
      content: '发现一个超牛的AI工具，真的太好用了！强烈推荐给需要的朋友们 #AI工具 #效率提升'
    },
    zhihu: {
      title: '如何用AI工具提升工作效率？',
      content: '在数字化时代，AI工具正在改变我们的工作方式。本文将介绍...'
    },
    douyin: {
      content: '这个AI工具真的绝了！#AI工具 #黑科技'
    },
    bilibili: {
      title: '【AI工具】这个工具真的太好用了！',
      content: '大家好，今天给大家分享一个我最近在用的AI工具...'
    }
  });

  // 选中的平台
  const [selectedPlatforms, setSelectedPlatforms] = useState([
    'xiaohongshu',
    'weibo',
    'zhihu',
    'douyin',
    'bilibili'
  ]);

  // 转换为EnhancedBatchPublishPanel所需的格式
  const platformsToPublish = useMemo(() => {
    return selectedPlatforms
      .filter(platformId => generatedContents[platformId as keyof typeof generatedContents])
      .map(platformId => {
        const content = generatedContents[platformId as keyof typeof generatedContents];
        const config = platformConfigs[platformId as keyof typeof platformConfigs];

        return {
          id: platformId,
          name: config.name,
          icon: config.icon,
          color: config.color,
          title: content.title || undefined,
          content: content.content,
          hashtags: content.hashtags || [],
          publishUrl: platformPublishUrls[platformId],
          maxLength: config.maxLength
        };
      });
  }, [selectedPlatforms, generatedContents]);

  // 发布完成回调
  const handlePublishComplete = (results: any[]) => {
    console.log('发布完成:', results);
    // 可以在这里处理发布结果，比如保存到历史记录
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="results">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="results">生成结果</TabsTrigger>
          <TabsTrigger value="publish">批量发布</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          <div className="text-muted-foreground">
            这里显示各平台的生成结果...
          </div>
        </TabsContent>

        <TabsContent value="publish" className="space-y-4">
          <EnhancedBatchPublishPanel
            platforms={platformsToPublish}
            onPublishComplete={handlePublishComplete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * 在ContentAdapterPage.tsx中的实际集成代码示例
 */
export const integrationExample = `
// 1. 导入组件
import { EnhancedBatchPublishPanel } from '@/components/EnhancedBatchPublishPanel';

// 2. 在组件中准备数据
const ContentAdapterPage = () => {
  // ... 其他代码

  // 准备平台发布数据
  const platformsToPublish = useMemo(() => {
    return selectedPlatforms
      .filter(platformId => generatedResults[platformId])
      .map(platformId => ({
        id: platformId,
        name: getPlatformName(platformId),
        icon: getPlatformIcon(platformId),
        color: getPlatformColor(platformId),
        title: generatedResults[platformId].title,
        content: generatedResults[platformId].content,
        hashtags: generatedResults[platformId].hashtags,
        publishUrl: platformUrls[platformId],
        maxLength: getPlatformMaxLength(platformId)
      }));
  }, [selectedPlatforms, generatedResults]);

  // 3. 在Results区域添加批量发布Tab
  return (
    <Tabs defaultValue="results">
      <TabsList>
        <TabsTrigger value="results">生成结果</TabsTrigger>
        <TabsTrigger value="batch-publish">批量发布</TabsTrigger>
      </TabsList>

      <TabsContent value="results">
        {/* 原有的结果显示 */}
        <ResultsDisplay results={generatedResults} />
      </TabsContent>

      <TabsContent value="batch-publish">
        {/* 新增的批量发布面板 */}
        <EnhancedBatchPublishPanel
          platforms={platformsToPublish}
          onPublishComplete={(results) => {
            // 处理发布结果
            console.log('发布完成:', results);
            saveToHistory(results);
          }}
        />
      </TabsContent>
    </Tabs>
  );
};
`;

export default ContentAdapterPageExample;
