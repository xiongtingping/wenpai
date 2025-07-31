/**
 * 自动化转发用户界面组件
 * 提供进度提示、状态反馈、错误处理等功能
 */

import React, { useState, useEffect } from 'react';
import { 
  Bot, RefreshCw, CheckCircle, XCircle, AlertCircle, 
  Play, Pause, Square, Settings, Eye, Copy, ExternalLink 
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
  progress,
  isRunning
}) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [options, setOptions] = useState<AutomationOptions>({
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
      alert('请至少选择一个平台进行转发');
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
          <h3 className="text-lg font-semibold text-gray-900">自动化转发</h3>
          {progress && (
            <div className="flex items-center space-x-2">
              {getStatusIcon(progress.status)}
              <span className="text-sm text-gray-600">
                {progress.status === 'running' && `正在处理: ${progress.current}`}
                {progress.status === 'completed' && '转发完成'}
                {progress.status === 'error' && '转发失败'}
                {progress.status === 'cancelled' && '已取消'}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            title="设置"
          >
            <Settings className="h-4 w-4" />
          </button>
          
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
              onClick={handleStartAutomation}
              disabled={selectedPlatforms.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Play className="h-4 w-4" />
              <span>开始转发</span>
            </button>
          )}
        </div>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-900">转发设置</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.enablePreview}
                  onChange={(e) => setOptions(prev => ({ ...prev, enablePreview: e.target.checked }))}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">启用内容预览</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.enableConfirmation}
                  onChange={(e) => setOptions(prev => ({ ...prev, enableConfirmation: e.target.checked }))}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">发布前确认</span>
              </label>
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 mb-1">转发方式</label>
              <select
                value={options.method}
                onChange={(e) => setOptions(prev => ({ ...prev, method: e.target.value as any }))}
                className="w-full rounded border-gray-300 text-sm focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="auto">自动选择</option>
                <option value="browser">浏览器原生</option>
                <option value="manual">手动模式</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 mb-1">重试次数</label>
              <select
                value={options.retryCount}
                onChange={(e) => setOptions(prev => ({ ...prev, retryCount: parseInt(e.target.value) }))}
                className="w-full rounded border-gray-300 text-sm focus:ring-purple-500 focus:border-purple-500"
              >
                <option value={1}>1次</option>
                <option value={2}>2次</option>
                <option value={3}>3次</option>
                <option value={5}>5次</option>
              </select>
            </div>
          </div>
        </div>
      )}

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
          <h4 className="font-medium text-gray-900 mb-3">转发结果</h4>
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
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  
                  <div>
                    <div className="font-medium text-gray-900">{result.platformName}</div>
                    {result.error && (
                      <div className="text-sm text-red-600">{result.error}</div>
                    )}
                    <div className="text-xs text-gray-500">
                      {result.method === 'manual' ? '手动模式' : '自动模式'} • 
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {result.url && (
                    <button
                      onClick={() => window.open(result.url, '_blank')}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      title="打开链接"
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
        </div>
      )}

      {/* 帮助信息 */}
      {!isRunning && selectedPlatforms.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Bot className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">请先生成内容，然后选择要转发的平台</p>
        </div>
      )}
    </div>
  );
};
