/**
 * 自动化转发用户界面组件
 * 提供进度提示、状态反馈、错误处理等功能
 */

import React, { useState, useEffect } from 'react';
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
  method: 'auto' | 'browser' | 'manual';
  retryCount: number;
}

export const AutomationUI: React.FC<AutomationUIProps> = ({
  availablePlatforms,
  onStartAutomation,
  onCancelAutomation,
  onRetryPlatform,
  onBatchPublish,
  progress,
  isRunning
}) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [options] = useState<AutomationOptions>({
    enablePreview: true,
    enableConfirmation: true,
    method: 'auto',
    retryCount: 3
  });

  // 自动选择有内容的平台
  useEffect(() => {
    const platformsWithContent = availablePlatforms
      .filter(p => p.hasContent)
      .map(p => p.id);
    setSelectedPlatforms(platformsWithContent);
  }, [availablePlatforms]);

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleStartAutomation = async () => {
    if (selectedPlatforms.length === 0) {
      // 使用更友好的提示方式
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center;
        z-index: 10000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;

      modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 12px; max-width: 400px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
          <h3 style="margin: 0 0 15px 0; color: #333;">请选择转发平台</h3>
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.5;">
            请至少选择一个有内容的平台进行自动化转发
          </p>
          <button onclick="document.body.removeChild(this.closest('div').parentElement)"
                  style="background: #007bff; color: white; border: none; padding: 10px 20px;
                         border-radius: 6px; cursor: pointer;">我知道了</button>
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
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bot className="h-4 w-4 text-gray-500" />;
    }
  };

  const getProgressPercentage = () => {
    if (!progress || progress.total === 0) return 0;
    return Math.round((progress.completed / progress.total) * 100);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* 标题和控制按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bot className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">自动化转发</h2>
          {progress && (
            <div className="flex items-center space-x-2">
              {getStatusIcon(progress.status)}
              <span className="text-sm text-gray-600">
                {progress.status === 'running' && `正在处理: ${progress.current}`}
                {progress.status === 'error' && '转发失败'}
                {progress.status === 'cancelled' && '已取消'}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">

          {isRunning ? (
            <button
              onClick={onCancelAutomation}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Square className="h-4 w-4" />
              <span>取消</span>
            </button>
          ) : (
            <button
              onClick={onBatchPublish || handleStartAutomation}
              disabled={selectedPlatforms.length === 0}
              className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
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
        <h4 className="font-medium text-gray-900 mb-3">选择转发平台</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {availablePlatforms.map((platform) => (
            <div
              key={platform.id}
              className={`border rounded-lg p-3 cursor-pointer transition-all ${
                selectedPlatforms.includes(platform.id)
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${!platform.hasContent ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => platform.hasContent && handlePlatformToggle(platform.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(platform.id)}
                    disabled={!platform.hasContent}
                    onChange={() => {}} // 由父级div的onClick处理
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="font-medium text-gray-900">{platform.name}</span>
                </div>
                
                {platform.hasContent ? (
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                    {platform.contentLength}字符
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    无内容
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 进度条 */}
      {progress && progress.total > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">转发进度</span>
            <span className="text-sm text-gray-500">
              {progress.completed}/{progress.total} ({getProgressPercentage()}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>
      )}

      {/* 结果列表 */}
      {progress && progress.results.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">转发结果</h4>
            <div className="text-sm text-gray-600">
              {progress.results.filter(r => r.success).length}/{progress.results.length} 成功
            </div>
          </div>

          {/* 结果统计 */}
          {progress.status === 'completed' && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="text-green-600 font-medium">
                    ✅ {progress.results.filter(r => r.success).length} 个成功
                  </span>
                  {progress.results.filter(r => !r.success).length > 0 && (
                    <span className="text-red-600 font-medium">
                      ❌ {progress.results.filter(r => !r.success).length} 个失败
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    const successResults = progress.results.filter(r => r.success);
                    if (successResults.length > 0) {
                      const urls = successResults.map(r => r.url).filter(Boolean);
                      if (urls.length > 0) {
                        urls.forEach(url => window.open(url, '_blank'));
                      }
                    }
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  打开所有成功页面
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {progress.results.map((result, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  result.success
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {result.success ? (
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                      <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{result.platformName}</span>
                      {result.success ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✅ 成功
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ❌ 失败
                        </span>
                      )}
                    </div>

                    {result.success ? (
                      <div className="text-sm text-green-600 mt-1">
                        已打开发布页面，内容已复制到剪贴板，请粘贴发布
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-sm text-red-600">{result.error}</div>
                        <div className="text-sm text-orange-600">
                          📋 内容已复制到剪贴板，请在打开的页面中粘贴发布
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 mt-1">
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
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      title="重新打开发布页面"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  )}

                  {!result.success && (
                    <button
                      onClick={() => onRetryPlatform(result.platformId)}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
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
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="text-sm font-medium text-blue-800 mb-2">📝 发布提醒：</h5>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• 内容已自动复制到剪贴板，可直接粘贴</li>
                <li>• 请根据各平台要求添加图片、标签等</li>
                <li>• 发布前请检查内容格式和平台规范</li>
                <li>• 如有问题可点击"重试"或"重新打开"</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 帮助信息和状态提示 */}
      {!isRunning && selectedPlatforms.length === 0 && availablePlatforms.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Bot className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">等待内容生成</h3>
          <p className="text-sm text-gray-500 mb-4">请先在上方生成平台内容，然后即可使用自动化转发功能</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
            <h4 className="text-sm font-medium text-blue-800 mb-2">💡 使用提示：</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• 支持多平台同时转发</li>
              <li>• 自动复制内容到剪贴板</li>
              <li>• 提供详细的操作指引</li>
              <li>• 支持失败重试机制</li>
            </ul>
          </div>
        </div>
      )}

      {!isRunning && selectedPlatforms.length === 0 && availablePlatforms.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <Bot className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">请选择要转发的平台，然后点击"开始转发"</p>
        </div>
      )}

      {isRunning && (
        <div className="text-center py-6 text-blue-600">
          <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
          <p className="text-sm font-medium">自动化转发进行中...</p>
          <p className="text-xs text-gray-500 mt-1">请按照弹出的指引完成发布操作</p>
        </div>
      )}
    </div>
  );
};
