/**
 * 自动化转发用户界面组件
 * 提供进度提示、状态反馈、错误处理等功能
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Bot, RefreshCw, CheckCircle, XCircle, AlertCircle, 
  Play, Pause, Square, Eye, Copy, ExternalLink 
} from 'lucide-react';

export interface AutomationProgress {
  total: number;
  completed: number;
  current: string;
  status: 'preparing' | 'running' | 'completed' | 'error' | 'cancelled';
  results: AutomationResult[];
}

export interface AutomationResult {
  platformId: string;
  platformName: string;
  success: boolean;
  error?: string;
  url?: string;
  method: 'api' | 'automation' | 'manual';
  timestamp: number;
  retryCount: number;
}

export interface AutomationUIProps {
  availablePlatforms: Array<{
    id: string;
    name: string;
    hasContent: boolean;
    contentLength: number;
    hasTitle?: boolean;          // 是否已生成标题
    isTitleGenerating?: boolean; // 标题是否正在生成中
  }>;
  onStartAutomation: (selectedPlatforms: string[], options: AutomationOptions) => Promise<void>;
  onCancelAutomation: () => void;
  onRetryPlatform: (platformId: string) => Promise<void>;
  onBatchPublish?: () => void;
  progress?: AutomationProgress;
  isRunning: boolean;
}

export interface AutomationOptions {
  enablePreview: boolean;
  enableConfirmation: boolean;
  method: 'auto' | 'browser' | 'manual' | 'extension' | 'script' | 'rpa';
  retryCount: number;
}

export const AutomationUI: React.FC<any> = ({ availablePlatforms,
  onStartAutomation,
  onCancelAutomation,
  onRetryPlatform,
  onBatchPublish,
  progress,
  isRunning }) => { const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [options] = useState<AutomationOptions>({
    enablePreview: true,
    enableConfirmation: true,
    method: 'auto',
    retryCount: 3
   });

  // 自动选择有内容且有标题的平台
  useEffect(() => {
    const platformsReady = availablePlatforms
      .filter((p: any) => p.hasContent && p.hasTitle && !p.isTitleGenerating)
      .map((p: any) => p.id);
    setSelectedPlatforms(platformsReady);
  }, [availablePlatforms]);

  const handlePlatformToggle = (platformId: string) => {
    const platform = availablePlatforms.find((p: any) => p.id === platformId);
    // 只允许选择有内容且有标题且不在生成中的平台
    if (platform && platform.hasContent && platform.hasTitle && !platform.isTitleGenerating) {
      setSelectedPlatforms(prev => 
        prev.includes(platformId)
          ? prev.filter(id => id !== platformId)
          : [...prev, platformId]
      );
    }
  };

  const handleStartAutomation = async () => {
    if (selectedPlatforms.length === 0) {
      // 使用更友好的提示方式
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: hsl(var(--foreground) / 0.5); display: flex; justify-content: center; align-items: center;
        z-index: 10000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;

      modal.innerHTML = `
        <div class="automation-modal-content text-center max-w-sm">
          <div class="text-5xl mb-5">⚠️</div>
          <h3 class="m-0 mb-4 text-primary">请选择转发平台</h3>
          <p class="m-0 mb-5 text-secondary leading-relaxed">
            请至少选择一个有内容的平台进行自动化转发
          </p>
          <button onclick="document.body.removeChild(this.closest('div').parentElement)"
                  class="automation-modal-button automation-modal-button-primary">我知道了</button>
        </div>
      `;

      document.body.appendChild(modal);
      return;
    }

    await onStartAutomation(selectedPlatforms, options);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'preparing':
        return <RefreshCw className="h-4 w-4 animate-spin text-primary" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 animate-spin text-primary" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-foreground" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-foreground" />;
      default:
        return <Bot className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getProgressPercentage = () => {
    if (!progress || progress.total === 0) return 0;
    return Math.round((progress.completed / progress.total) * 100);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-6">
      {/* 标题和控制按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bot className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">自动化转发</h2>
          {progress && (
            <div className="flex items-center space-x-2">
              {getStatusIcon(progress.status)}
              <span className="text-sm text-muted-foreground">
                {progress.status === 'running' && `正在处理: ${progress.current}`}
                {progress.status === 'error' && t('components.errors.转发失败')}
                {progress.status === 'cancelled' && '已取消'}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">

          {isRunning ? (
            <button
              onClick={onCancelAutomation}
              className="flex items-center space-x-2 px-4 py-2 bg-destructive text-primary-foreground rounded-lg hover:bg-destructive transition-colors"
            >
              <Square className="h-4 w-4" />
              <span>取消</span>
            </button>
          ) : (
            <button
              onClick={onBatchPublish || handleStartAutomation}
              disabled={selectedPlatforms.length === 0}
              className="flex items-center space-x-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed transition-colors font-semibold"
            >
              <ExternalLink className="h-5 w-5" />
              <span>批量一键转发</span>
              <span className="ml-2 text-sm opacity-80">
                ({selectedPlatforms.length}个平台)
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 平台选择 */}
      <div>
        <h4 className="font-medium text-foreground mb-3">选择转发平台</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {availablePlatforms.map((platform: any) => {
            const isReady = platform.hasContent && platform.hasTitle && !platform.isTitleGenerating;
            const isGenerating = platform.isTitleGenerating;
            const hasNoTitle = platform.hasContent && !platform.hasTitle && !platform.isTitleGenerating;
            
            return (
              <div
                key={platform.id}
                className={`border rounded-lg p-3 transition-all ${
                  selectedPlatforms.includes(platform.id) && isReady
                    ? 'border-primary bg-accent'
                    : 'border-border hover:border-border'
                } ${!isReady ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => isReady && handlePlatformToggle(platform.id)}
              >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(platform.id)}
                    disabled={!isReady}
                    onChange={() => {}} // 由父级div的onClick处理
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="font-medium text-foreground">{platform.name}</span>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  {platform.hasContent ? (
                    <span className="text-xs text-foreground bg-accent px-2 py-1 rounded">
                      {platform.contentLength}字符
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded">
                      无内容
                    </span>
                  )}
                  
                  {isGenerating && (
                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded flex items-center gap-1">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      生成标题中
                    </span>
                  )}
                  
                  {hasNoTitle && (
                    <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded">
                      等待标题
                    </span>
                  )}
                  
                  {isReady && (
                    <span className="text-xs text-success bg-green-100 px-2 py-1 rounded">
                      ✓ 就绪
                    </span>
                  )}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* 进度条 */}
      {progress && progress.total > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">转发进度</span>
            <span className="text-sm text-muted-foreground">
              {progress.completed}/{progress.total} ({getProgressPercentage()}%)
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>
      )}

      {/* 结果列表 */}
      {progress && progress.results.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-foreground">转发结果</h4>
            <div className="text-sm text-muted-foreground">
              {progress.results.filter((r: any) => r.success).length}/{progress.results.length} 成功
            </div>
          </div>

          {/* 结果统计 */}
          {progress.status === 'completed' && (
            <div className="mb-4 p-3 bg-accent rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="text-foreground font-medium">
                    ✅ {progress.results.filter((r: any) => r.success).length} 个成功
                  </span>
                  {progress.results.filter((r: any) => !r.success).length > 0 && (
                    <span className="text-destructive font-medium">
                      ❌ {progress.results.filter((r: any) => !r.success).length} 个失败
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    const successResults = progress.results.filter((r: any) => r.success);
                    if (successResults.length > 0) {
                      const urls = successResults.map((r: any) => r.url).filter(Boolean);
                      if (urls.length > 0) {
                        urls.forEach((url: any) => window.open(url, '_blank'));
                      }
                    }
                  }}
                  className="text-xs text-primary hover:text-primary"
                >
                  打开所有成功页面
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {progress.results.map((result: any, index: number) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  result.success
                    ? 'border-border bg-accent'
                    : 'border-border bg-accent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {result.success ? (
                    <div className="flex items-center justify-center w-8 h-8 bg-accent rounded-full">
                      <CheckCircle className="h-5 w-5 text-foreground" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-8 h-8 bg-destructive/10 rounded-full">
                      <XCircle className="h-5 w-5 text-destructive" />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-foreground">{result.platformName}</span>
                      {result.success ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent text-foreground">
                          ✅ 成功
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                          ❌ 失败
                        </span>
                      )}
                    </div>

                    {result.success ? (
                      <div className="text-sm text-foreground mt-1">
                        已打开发布页面，内容已复制到剪贴板，请粘贴发布
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-sm text-destructive">{result.error}</div>
                        <div className="text-sm text-foreground">
                          📋 内容已复制到剪贴板，请在打开的页面中粘贴发布
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground mt-1">
                      {result.method === 'manual' ? '手动模式' :
                       result.method === 'api' ? 'API模式' :
                       result.method === 'automation' ? '自动模式' : '其他模式'} •
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {result.url && (
                    <button
                      onClick={() => window.open(result.url, '_blank')}
                      className="p-1 text-muted-foreground hover:text-muted-foreground rounded"
                      title={t('components.labels.标题')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  )}

                  {!result.success && (
                    <button
                      onClick={() => onRetryPlatform(result.platformId)}
                      className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary"
                    >
                      重试
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 操作建议 */}
          {progress.status === 'completed' && (
            <div className="mt-4 p-3 bg-accent border border-border rounded-lg">
              <h5 className="text-sm font-medium text-primary mb-2">📝 发布提醒：</h5>
              <ul className="text-xs text-primary space-y-1">
                <li>• 内容已自动复制到剪贴板，可直接粘贴</li>
                <li>• 请根据各平台要求添加图片、标签等</li>
                <li>• 发布前请检查内容格式和平台规范</li>
                <li>• 如有问题可点击{t('components.text.重试_zav')}或"重新打开"</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 帮助信息和状态提示 */}
      {!isRunning && selectedPlatforms.length === 0 && availablePlatforms.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium text-foreground mb-2">等待内容生成</h3>
          <p className="text-sm text-muted-foreground mb-4">请先在上方生成平台内容，然后即可使用自动化转发功能</p>
          <div className="bg-accent border border-border rounded-lg p-4 text-left max-w-md mx-auto">
            <h4 className="text-sm font-medium text-primary mb-2">💡 使用提示：</h4>
            <ul className="text-xs text-primary space-y-1">
              <li>• 支持多平台同时转发</li>
              <li>• 自动复制内容到剪贴板</li>
              <li>• 提供详细的操作指引</li>
              <li>• 支持失败重试机制</li>
            </ul>
          </div>
        </div>
      )}

      {!isRunning && selectedPlatforms.length === 0 && availablePlatforms.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Bot className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm">请选择要转发的平台，然后点击"开始转发"</p>
        </div>
      )}

      {isRunning && (
        <div className="text-center py-6 text-primary">
          <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
          <p className="text-sm font-medium">自动化转发进行中...</p>
          <p className="text-xs text-muted-foreground mt-1">请按照弹出的指引完成发布操作</p>
        </div>
      )}
    </div>
  );
};
