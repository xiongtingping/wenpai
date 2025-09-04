/**
 * 平台选择器组件
 * 负责平台选择和设置管理
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Smartphone, 
  ChevronDown, 
  ChevronUp,
  Settings,
  CheckCircle2,
  Circle,
  Zap
} from 'lucide-react';
import { useAdaptPage } from '../../AdaptPageProvider';
import { PlatformSettingsPanel } from './PlatformSettingsPanel';
import { cn } from '@/lib/utils';

// ========================================================================================
// 平台数据
// ========================================================================================

const platforms = [
  {
    id: 'xiaohongshu',
    name: '小红书',
    icon: '🔴',
    color: 'bg-red-500',
    description: '生活方式分享平台',
    features: ['图文并茂', '生活化', '种草推荐'],
  },
  {
    id: 'weibo',
    name: '微博',
    icon: '🐦',
    color: 'bg-orange-500',
    description: '社交媒体平台',
    features: ['热点话题', '简洁明了', '互动性强'],
  },
  {
    id: 'zhihu',
    name: '知乎',
    icon: '🧠',
    color: 'bg-blue-500',
    description: '知识问答社区',
    features: ['专业深度', '逻辑清晰', '知识分享'],
  },
  {
    id: 'douyin',
    name: '抖音',
    icon: '🎵',
    color: 'bg-black',
    description: '短视频平台',
    features: ['短小精悍', '趣味性', '视觉冲击'],
  },
  {
    id: 'wechat',
    name: '微信公众号',
    icon: '💬',
    color: 'bg-green-500',
    description: '公众号文章',
    features: ['深度内容', '专业性', '长篇阅读'],
  },
  {
    id: 'bilibili',
    name: 'B站',
    icon: '📺',
    color: 'bg-pink-500',
    description: '视频弹幕网站',
    features: ['年轻化', '二次元', '创意内容'],
  },
];

// ========================================================================================
// 组件Props
// ========================================================================================

interface PlatformSelectorProps {
  className?: string;
}

// ========================================================================================
// 主组件
// ========================================================================================

export function PlatformSelector({ className }: PlatformSelectorProps) {
  const { state, events } = useAdaptPage();
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<string>>(new Set());

  const {
    selectedPlatforms,
    platformSettings,
    isGenerating,
  } = state;

  const {
    onPlatformToggle,
    onPlatformSettingsChange,
  } = events;

  const handlePlatformToggle = (platformId: string) => {
    const isSelected = selectedPlatforms.includes(platformId);
    onPlatformToggle(platformId, !isSelected);
  };

  const handleSelectAll = () => {
    const allSelected = selectedPlatforms.length === platforms.length;
    platforms.forEach(platform => {
      onPlatformToggle(platform.id, !allSelected);
    });
  };

  const handleToggleExpanded = (platformId: string) => {
    const newExpanded = new Set(expandedPlatforms);
    if (newExpanded.has(platformId)) {
      newExpanded.delete(platformId);
    } else {
      newExpanded.add(platformId);
    }
    setExpandedPlatforms(newExpanded);
  };

  const selectedCount = selectedPlatforms.length;
  const allSelected = selectedCount === platforms.length;
  const someSelected = selectedCount > 0 && selectedCount < platforms.length;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">平台选择</CardTitle>
            <Badge variant="outline" className="text-xs">
              {selectedCount}/{platforms.length} 已选择
            </Badge>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            {allSelected ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Circle className="h-4 w-4" />
            )}
            {allSelected ? '取消全选' : '全选'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {platforms.map((platform) => {
          const isSelected = selectedPlatforms.includes(platform.id);
          const isExpanded = expandedPlatforms.has(platform.id);
          const hasSettings = platformSettings[platform.id];

          return (
            <div
              key={platform.id}
              className={cn(
                'border rounded-lg transition-all duration-200',
                isSelected 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              )}
            >
              {/* 平台基本信息 */}
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handlePlatformToggle(platform.id)}
                      disabled={isGenerating}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{platform.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{platform.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {platform.description}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasSettings && (
                      <Badge variant="secondary" className="text-xs">
                        <Settings className="h-3 w-3 mr-1" />
                        已配置
                      </Badge>
                    )}
                    
                    {isSelected && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleExpanded(platform.id)}
                        className="h-8 w-8 p-0"
                        disabled={isGenerating}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* 平台特性标签 */}
                {isSelected && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {platform.features.map((feature, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs px-2 py-0.5"
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        {feature}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* 平台设置面板 */}
              {isSelected && isExpanded && (
                <div className="border-t border-border">
                  <PlatformSettingsPanel
                    platformId={platform.id}
                    platformName={platform.name}
                    settings={platformSettings[platform.id]}
                    onSettingsChange={(settings) => 
                      onPlatformSettingsChange(platform.id, settings)
                    }
                    disabled={isGenerating}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* 选择提示 */}
        {selectedCount === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Smartphone className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">请选择至少一个平台开始内容适配</p>
          </div>
        )}

        {/* 快速选择建议 */}
        {selectedCount === 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">推荐组合：</div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  ['xiaohongshu', 'weibo', 'zhihu'].forEach(id => 
                    onPlatformToggle(id, true)
                  );
                }}
                disabled={isGenerating}
                className="text-xs"
              >
                社交媒体组合
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  ['wechat', 'zhihu'].forEach(id => 
                    onPlatformToggle(id, true)
                  );
                }}
                disabled={isGenerating}
                className="text-xs"
              >
                深度内容组合
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  ['douyin', 'bilibili'].forEach(id => 
                    onPlatformToggle(id, true)
                  );
                }}
                disabled={isGenerating}
                className="text-xs"
              >
                视频平台组合
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PlatformSelector;
