/**
 * 生成控制面板组件
 * 负责内容生成的控制和状态显示
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Play, 
  Square, 
  RefreshCw,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import { useAdaptPage } from '../../AdaptPageProvider';
import { cn } from '@/lib/utils';

// ========================================================================================
// 组件Props
// ========================================================================================

interface GenerationPanelProps {
  className?: string;
  canGenerate: boolean;
  isGenerating: boolean;
  progress: number;
  onGenerate: () => void;
}

// ========================================================================================
// 主组件
// ========================================================================================

export function GenerationPanel({
  className,
  canGenerate,
  isGenerating,
  progress,
  onGenerate,
}: GenerationPanelProps) {
  const { state } = useAdaptPage();

  const {
    inputContent,
    selectedPlatforms,
    selectedAIModel,
    results,
  } = state;

  // 计算预估时间和成本
  const estimatedTime = selectedPlatforms.length * 3; // 每个平台约3秒
  const estimatedCost = selectedPlatforms.length * 0.01; // 每个平台约0.01美元

  // 检查各项准备状态
  const hasContent = inputContent.trim().length > 0;
  const hasPlatforms = selectedPlatforms.length > 0;
  const hasModel = selectedAIModel !== '';

  const getReadinessStatus = () => {
    if (!hasContent) return { status: 'error', message: '请输入内容' };
    if (!hasPlatforms) return { status: 'error', message: '请选择平台' };
    if (!hasModel) return { status: 'error', message: '请选择AI模型' };
    return { status: 'ready', message: '准备就绪' };
  };

  const readiness = getReadinessStatus();

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">内容生成</CardTitle>
            <Badge 
              variant={readiness.status === 'ready' ? 'default' : 'destructive'} 
              className="text-xs"
            >
              {readiness.message}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 生成状态 */}
        {isGenerating && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm font-medium">AI内容生成中...</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-muted-foreground">
              正在为 {selectedPlatforms.length} 个平台生成适配内容
            </div>
          </div>
        )}

        {/* 准备状态检查 */}
        {!isGenerating && (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {hasContent ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">
                  内容输入 ({inputContent.length} 字符)
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {hasPlatforms ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">
                  平台选择 ({selectedPlatforms.length} 个平台)
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {hasModel ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">
                  AI模型 ({selectedAIModel || '未选择'})
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 预估信息 */}
        {canGenerate && !isGenerating && (
          <div className="bg-accent/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Info className="h-4 w-4 text-primary" />
              <span>生成预估</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>约 {estimatedTime} 秒</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3" />
                <span>约 ${estimatedCost.toFixed(3)}</span>
              </div>
            </div>
          </div>
        )}

        {/* 生成按钮 */}
        <Button
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className="w-full flex items-center gap-2"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Square className="h-4 w-4" />
              生成中... ({progress.toFixed(0)}%)
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              开始生成内容
            </>
          )}
        </Button>

        {/* 历史结果提示 */}
        {results.length > 0 && !isGenerating && (
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-2">
              上次生成了 {results.length} 个平台的内容
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onGenerate}
              disabled={!canGenerate}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              重新生成
            </Button>
          </div>
        )}

        {/* 使用提示 */}
        {!canGenerate && !isGenerating && (
          <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <div className="font-medium mb-1">使用步骤：</div>
                <ol className="space-y-1 list-decimal list-inside">
                  <li>在左侧输入要适配的内容</li>
                  <li>选择目标平台（支持多选）</li>
                  <li>配置内容形式和风格（可选）</li>
                  <li>选择合适的AI模型</li>
                  <li>点击"开始生成内容"按钮</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default GenerationPanel;
