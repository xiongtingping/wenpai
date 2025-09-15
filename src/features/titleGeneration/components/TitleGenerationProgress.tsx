/**
 * 标题生成进度指示器组件
 * 显示生成过程的详细进度和状态
 */

import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  Brain, 
  Calculator, 
  Sparkles,
  Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TitleGenerationProgressProps {
  loading: boolean;
  progress: number;
  currentStage: 'idle' | 'validating' | 'calling_ai' | 'processing' | 'scoring' | 'complete';
  className?: string;
}

const createStageConfig = (t: (key: string) => string) => ({
  idle: {
    icon: Clock,
    label: t('components.labels.准备中'),
    description: '等待开始生成',
    color: 'text-muted-foreground'
  },
  validating: {
    icon: CheckCircle,
    label: t('components.labels.验证输入'),
    description: '检查内容格式和长度',
    color: 'text-primary'
  },
  calling_ai: {
    icon: Brain,
    label: 'AI生成',
    description: '调用AI模型生成标题',
    color: 'text-primary'
  },
  processing: {
    icon: Sparkles,
    label: t('components.labels.处理结果'),
    description: '解析和清理生成结果',
    color: 'text-foreground'
  },
  scoring: {
    icon: Calculator,
    label: t('components.labels.质量评分'),
    description: '计算标题质量评分',
    color: 'text-foreground'
  },
  complete: {
    icon: CheckCircle,
    label: t('components.labels.生成完成'),
    description: '标题生成成功完成',
    color: 'text-foreground'
  }
});

export const TitleGenerationProgress = memo<TitleGenerationProgressProps>(({
  loading,
  progress,
  currentStage,
  className
}) => {
  const { t } = useTranslation();
  const STAGE_CONFIG = createStageConfig(t);
  const stageConfig = STAGE_CONFIG[currentStage];
  const IconComponent = stageConfig.icon;

  if (!loading && currentStage === 'idle') {
    return null;
  }

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* 当前阶段信息 */}
          <div className="flex items-center gap-3">
            <div className={cn("flex-shrink-0", stageConfig.color)}>
              {loading && currentStage !== 'complete' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <IconComponent className="w-5 h-5" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm">{stageConfig.label}</h4>
                <Badge 
                  variant={currentStage === 'complete' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {progress}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stageConfig.description}
              </p>
            </div>
          </div>

          {/* 进度条 */}
          <div className="space-y-2">
            <Progress 
              value={progress} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          {/* 阶段指示器 */}
          <div className="flex items-center justify-between">
            {Object.entries(STAGE_CONFIG).map(([stage, config]) => {
              if (stage === 'idle') return null;
              
              const isActive = stage === currentStage;
              const isCompleted = getStageOrder(stage) < getStageOrder(currentStage);
              const StageIcon = config.icon;
              
              return (
                <div
                  key={stage}
                  className={cn(
                    "flex flex-col items-center gap-1 flex-1",
                    isActive && "scale-110"
                  )}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all",
                      isCompleted && "bg-accent text-foreground",
                      isActive && !isCompleted && "bg-accent text-primary",
                      !isActive && !isCompleted && "bg-accent text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : isActive ? (
                      loading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <StageIcon className="w-3 h-3" />
                      )
                    ) : (
                      <StageIcon className="w-3 h-3" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs text-center transition-all",
                      isActive && "font-medium",
                      isCompleted && "text-foreground",
                      isActive && !isCompleted && "text-primary",
                      !isActive && !isCompleted && "text-muted-foreground"
                    )}
                  >
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 估计时间 */}
          {loading && currentStage !== 'complete' && (
            <div className="text-center">
              <div className="text-xs text-muted-foreground">
                预计剩余时间: {getEstimatedTime(currentStage)}
              </div>
            </div>
          )}

          {/* 完成状态 */}
          {currentStage === 'complete' && (
            <div className="text-center py-2">
              <div className="text-foreground text-sm font-medium">
                🎉 标题生成完成！
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

/**
 * 获取阶段顺序
 */
function getStageOrder(stage: string): number {
  const order = {
    idle: 0,
    validating: 1,
    calling_ai: 2,
    processing: 3,
    scoring: 4,
    complete: 5
  };
  return order[stage as keyof typeof order] || 0;
}

/**
 * 获取预计剩余时间
 */
function getEstimatedTime(currentStage: string): string {
  const timeEstimates = {
    validating: '1-2秒',
    calling_ai: '5-10秒',
    processing: '2-3秒',
    scoring: '1-2秒'
  };
  return timeEstimates[currentStage as keyof typeof timeEstimates] || '计算中...';
}

TitleGenerationProgress.displayName = 'TitleGenerationProgress';

export default TitleGenerationProgress;
