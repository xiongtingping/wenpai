/**
 * 标题列表组件
 * 显示生成的标题列表，支持选择、复制、评分显示等功能
 */

import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Star, RotateCcw, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TitleListProps, GeneratedTitle } from '../types/titleGeneration.types';

export const TitleList = memo<TitleListProps>(({
  titles,
  onTitleSelect,
  onTitleCopy,
  showScores = true,
  className
}) => {
  if (titles.length === 0) {
    return (
      <div className={cn("text-center py-8 text-gray-500", className)}>
        <div className="text-4xl mb-2">📝</div>
        <p>暂无生成的标题</p>
        <p className="text-sm mt-1">请输入内容并点击生成按钮</p>
      </div>
    );
  }

  const handleCopy = async (title: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onTitleCopy) {
      const success = await onTitleCopy(title);
      // 可以添加成功提示
      console.log(success ? '复制成功' : '复制失败');
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 0.8) return 'default';
    if (score >= 0.6) return 'secondary';
    return 'destructive';
  };

  const formatScore = (score: number): string => {
    return (score * 100).toFixed(0);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {titles.map((title, index) => (
        <TitleCard
          key={title.id}
          title={title}
          index={index}
          showScores={showScores}
          onSelect={() => onTitleSelect?.(title)}
          onCopy={(titleText, event) => handleCopy(titleText, event)}
          getScoreColor={getScoreColor}
          getScoreBadgeVariant={getScoreBadgeVariant}
          formatScore={formatScore}
        />
      ))}
    </div>
  );
});

interface TitleCardProps {
  title: GeneratedTitle;
  index: number;
  showScores: boolean;
  onSelect: () => void;
  onCopy: (title: string, event: React.MouseEvent) => void;
  getScoreColor: (score: number) => string;
  getScoreBadgeVariant: (score: number) => "default" | "secondary" | "destructive" | "outline";
  formatScore: (score: number) => string;
}

const TitleCard = memo<TitleCardProps>(({
  title,
  index,
  showScores,
  onSelect,
  onCopy,
  getScoreColor,
  getScoreBadgeVariant,
  formatScore
}) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-blue-300"
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* 标题内容 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                #{index + 1}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {title.style}
              </Badge>
              <span className="text-xs text-gray-500">
                {title.length}字
              </span>
            </div>
            
            <h3 className="font-medium text-gray-900 leading-relaxed mb-2 break-words">
              {title.title}
            </h3>
            
            {title.generationReason && (
              <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                💡 {title.generationReason}
              </p>
            )}
            
            {/* 评分信息 */}
            {showScores && (
              <div className="flex flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span className={getScoreColor(title.overallScore)}>
                    综合: {formatScore(title.overallScore)}%
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">语义:</span>
                  <span className={getScoreColor(title.semanticFit)}>
                    {formatScore(title.semanticFit)}%
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">情感:</span>
                  <span className={getScoreColor(title.emotionalScore)}>
                    {formatScore(title.emotionalScore)}%
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">完整:</span>
                  <span className={getScoreColor(title.semanticCompleteness)}>
                    {formatScore(title.semanticCompleteness)}%
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* 操作按钮 */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            {showScores && (
              <Badge 
                variant={getScoreBadgeVariant(title.overallScore)}
                className="text-xs justify-center min-w-[50px]"
              >
                <Star className="w-3 h-3 mr-1" />
                {formatScore(title.overallScore)}
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => onCopy(title.title, e)}
              title="复制标题"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* 详细评分展开区域 */}
        {showScores && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">结构多样性:</span>
                <span className={getScoreColor(title.diversityScore)}>
                  {formatScore(title.diversityScore)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">字符利用率:</span>
                <span className={getScoreColor(title.utilizationScore)}>
                  {formatScore(title.utilizationScore)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

TitleList.displayName = 'TitleList';
TitleCard.displayName = 'TitleCard';

export default TitleList;
