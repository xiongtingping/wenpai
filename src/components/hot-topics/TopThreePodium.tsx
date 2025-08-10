/**
 * 前三热度话题领奖台组件
 * 突出显示前三名热点话题，采用领奖台形式展示
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Medal, 
  TrendingUp, 
  Eye, 
  Share2, 
  Bookmark,
  Flame,
  Zap
} from 'lucide-react';
import { DailyHotItem } from '@/api/hotTopicsService';

interface TopThreePodiumProps {
  /** 前三名话题数据 */
  topThree: DailyHotItem[];
  /** 点击话题回调 */
  onTopicClick?: (topic: DailyHotItem) => void;
  /** 分享话题回调 */
  onShare?: (topic: DailyHotItem) => void;
  /** 收藏话题回调 */
  onBookmark?: (topic: DailyHotItem) => void;
}

/**
 * 前三热度话题领奖台组件
 * @param props 组件属性
 * @returns React 组件
 */
export default function TopThreePodium({
  topThree,
  onTopicClick,
  onShare,
  onBookmark
}: TopThreePodiumProps) {
  if (!topThree || topThree.length === 0) {
    return null;
  }

  const getPodiumStyle = (rank: number) => {
    const baseStyles = {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'flex-end',
      position: 'relative' as const,
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      borderRadius: '12px',
      overflow: 'hidden'
    };

    switch (rank) {
      case 1:
        return {
          ...baseStyles,
          height: '280px',
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3)',
          transform: 'scale(1.05)',
          zIndex: 3
        };
      case 2:
        return {
          ...baseStyles,
          height: '240px',
          background: 'linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%)',
          boxShadow: '0 6px 24px rgba(192, 192, 192, 0.3)',
          transform: 'scale(1.02)',
          zIndex: 2
        };
      case 3:
        return {
          ...baseStyles,
          height: '200px',
          background: 'linear-gradient(135deg, #CD7F32 0%, #B8860B 100%)',
          boxShadow: '0 4px 16px rgba(205, 127, 50, 0.3)',
          zIndex: 1
        };
      default:
        return baseStyles;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-8 h-8 text-muted-foreground" />;
      case 2:
        return <Medal className="w-6 h-6 text-foreground" />;
      case 3:
        return <Medal className="w-6 h-6 text-foreground" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-accent text-muted-foreground hover:bg-accent">🥇 第{rank}名</Badge>;
      case 2:
        return <Badge className="bg-muted text-foreground hover:bg-accent">🥈 第{rank}名</Badge>;
      case 3:
        return <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">🥉 第{rank}名</Badge>;
      default:
        return <Badge variant="secondary">#{rank}</Badge>;
    }
  };

  const formatHotValue = (hot: string) => {
    const num = parseInt(hot);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return hot;
  };

  return (
    <Card className="w-full bg-accent border-2 border-border">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-foreground" />
            热度排行榜
            <Flame className="w-6 h-6 text-destructive" />
          </h2>
          <p className="text-muted-foreground">今日最热门话题前三名</p>
        </div>

        <div className="flex items-end justify-center gap-4 h-[320px]">
          {topThree.map((topic, index) => {
            const rank = index + 1;
            const podiumStyle = getPodiumStyle(rank);
            
            return (
              <div
                key={`${topic.platform}-${topic.title}`}
                className="flex-1 max-w-[200px]"
                style={podiumStyle}
                onClick={() => onTopicClick?.(topic)}
              >
                {/* 排名标识 */}
                <div className="absolute top-2 left-2">
                  {getRankIcon(rank)}
                </div>

                {/* 话题内容 */}
                <div className="p-4 text-center w-full h-full flex flex-col justify-between">
                  <div className="flex-1">
                    {/* 平台标识 */}
                    <div className="mb-2">
                      <Badge variant="outline" className="text-xs">
                        {topic.platform}
                      </Badge>
                    </div>

                    {/* 话题标题 */}
                    <h3 className="font-semibold text-sm leading-tight mb-2 line-clamp-3">
                      {topic.title}
                    </h3>

                    {/* 热度值 */}
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Zap className="w-3 h-3 text-foreground" />
                      <span className="text-xs font-medium">
                        {formatHotValue(topic.hot)}
                      </span>
                    </div>
                  </div>

                  {/* 排名徽章 */}
                  <div className="mt-2">
                    {getRankBadge(rank)}
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex justify-center gap-1 mt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-card/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        onShare?.(topic);
                      }}
                    >
                      <Share2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-card/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookmark?.(topic);
                      }}
                    >
                      <Bookmark className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 底部说明 */}
        <div className="text-center mt-4 text-xs text-muted-foreground">
          <p>点击话题查看详情 • 数据实时更新</p>
        </div>
      </CardContent>
    </Card>
  );
} 