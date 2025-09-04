/**
 * 转发面板组件
 * 负责一键转发和批量转发功能
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Send, 
  Zap, 
  Settings,
  Play,
  Pause,
  Square,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Copy,
  RefreshCw
} from 'lucide-react';
import { useAdaptPage } from '../../AdaptPageProvider';
import { ForwardingOptions, GeneratedContent } from '../../types';
import { cn } from '@/lib/utils';

// ========================================================================================
// 组件Props
// ========================================================================================

interface ForwardingPanelProps {
  className?: string;
  results: GeneratedContent[];
}

// ========================================================================================
// 主组件
// ========================================================================================

export function ForwardingPanel({ className, results }: ForwardingPanelProps) {
  const { state, events } = useAdaptPage();
  const [selectedForwarding, setSelectedForwarding] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    forwardingOptions,
    forwardingProgress,
    isForwarding,
  } = state;

  const {
    onBatchForward,
    onForwardingCancel,
  } = events;

  // 可转发的结果
  const availableResults = results.filter(r => r.content || (r.versions && r.versions.length > 0));
  
  const handleSelectAll = () => {
    if (selectedForwarding.length === availableResults.length) {
      setSelectedForwarding([]);
    } else {
      setSelectedForwarding(availableResults.map(r => r.platformId));
    }
  };

  const handleToggleSelect = (platformId: string) => {
    setSelectedForwarding(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleStartForwarding = () => {
    if (selectedForwarding.length === 0) return;
    onBatchForward(selectedForwarding, forwardingOptions);
  };

  const handleSingleForward = (platformId: string) => {
    onBatchForward([platformId], { ...forwardingOptions, batchMode: false });
  };

  const handleCopyContent = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // 这里可以添加toast提示
    } catch (error) {
      console.error('Failed to copy content:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const progressPercentage = forwardingProgress.total > 0 
    ? (forwardingProgress.completed / forwardingProgress.total) * 100 
    : 0;

  if (availableResults.length === 0) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <Send className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">生成内容后即可使用转发功能</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">一键转发</CardTitle>
            <Badge variant="outline" className="text-xs">
              {availableResults.length} 个平台可转发
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              高级设置
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 转发进度 */}
        {isForwarding && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>转发进度</span>
              <span>{forwardingProgress.completed}/{forwardingProgress.total}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            {forwardingProgress.current && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>正在处理: {forwardingProgress.current}</span>
              </div>
            )}
          </div>
        )}

        {/* 批量操作控制 */}
        <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selectedForwarding.length === availableResults.length}
              onCheckedChange={handleSelectAll}
              disabled={isForwarding}
            />
            <div>
              <div className="text-sm font-medium">
                批量转发 ({selectedForwarding.length}/{availableResults.length})
              </div>
              <div className="text-xs text-muted-foreground">
                选择要转发的平台内容
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isForwarding ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={onForwardingCancel}
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                取消转发
              </Button>
            ) : (
              <Button
                onClick={handleStartForwarding}
                disabled={selectedForwarding.length === 0}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                开始转发 ({selectedForwarding.length})
              </Button>
            )}
          </div>
        </div>

        {/* 平台内容列表 */}
        <div className="space-y-3">
          {availableResults.map((result) => {
            const isSelected = selectedForwarding.includes(result.platformId);
            const forwardingResult = forwardingProgress.results.find(r => r.platformId === result.platformId);
            const content = result.content || (result.versions && result.versions[0]?.content) || '';

            return (
              <div
                key={result.platformId}
                className={cn(
                  'border rounded-lg p-3 transition-all',
                  isSelected ? 'border-primary bg-primary/5' : 'border-border'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleSelect(result.platformId)}
                      disabled={isForwarding}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm">{result.platformName}</span>
                        {forwardingResult && getStatusIcon(forwardingResult.success ? 'completed' : 'error')}
                        <Badge variant="outline" className="text-xs">
                          {content.length} 字符
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {content.substring(0, 100)}
                        {content.length > 100 && '...'}
                      </div>

                      {forwardingResult?.error && (
                        <div className="text-xs text-red-500 bg-red-50 p-2 rounded">
                          错误: {forwardingResult.error}
                        </div>
                      )}

                      {forwardingResult?.url && (
                        <div className="flex items-center gap-2 text-xs text-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>已发布</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(forwardingResult.url, '_blank')}
                            className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            查看
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyContent(content)}
                      className="h-8 w-8 p-0"
                      title="复制内容"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSingleForward(result.platformId)}
                      disabled={isForwarding}
                      className="flex items-center gap-1 text-xs"
                    >
                      <Send className="h-3 w-3" />
                      转发
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 转发模式说明 */}
        <div className="text-xs text-muted-foreground bg-accent/30 p-3 rounded-lg">
          <div className="font-medium mb-1">转发说明：</div>
          <ul className="space-y-1">
            <li>• 内容将自动复制到剪贴板</li>
            <li>• 系统会打开对应平台的发布页面</li>
            <li>• 请手动粘贴内容并完成发布</li>
            <li>• 支持API直发的平台可自动发布</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default ForwardingPanel;
