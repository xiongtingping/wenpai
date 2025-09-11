/**
 * Hook使用示例
 * 展示如何使用新的Hook替代原有的组件内逻辑
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  useContentAdapterEngine, 
  useAdapterSettings, 
  useGenerationQueue 
} from '../hooks';

/**
 * 简化的内容适配器组件示例
 * 展示Hook的使用方式
 */
export function ContentAdapterExample() {
  // 使用设置管理Hook
  const {
    globalSettings,
    platformSettings,
    selectedPlatforms,
    selectedFormId,
    selectedStyle,
    selectedModel,
    useBrandLibrary,
    brandProfile,
    updateSelectedPlatforms,
    updateSelectedForm,
    updateSelectedStyle,
    getEffectiveSettings,
    validateSettings
  } = useAdapterSettings({
    autoSave: true,
    storageKey: 'example-adapter-settings'
  });

  // 使用内容生成引擎Hook
  const {
    generating,
    results,
    retryingPlatforms,
    generateContent,
    retryPlatform,
    generateComparison,
    generateTitle,
    updatePlatformContent,
    clearResults
  } = useContentAdapterEngine({
    globalSettings,
    platformSettings,
    selectedModel,
    useBrandLibrary,
    brandProfile
  });

  // 使用生成队列Hook
  const {
    queue,
    running: queueRunning,
    automationProgress,
    addTask,
    startQueue,
    stopQueue,
    startAutomation,
    getQueueStats
  } = useGenerationQueue({
    maxConcurrency: 2,
    onTaskComplete: (task, result) => {
      console.log('任务完成:', task.platformId, result);
    },
    onQueueComplete: () => {
      console.log('队列处理完成');
    }
  });

  // 原始内容状态
  const [originalContent, setOriginalContent] = React.useState('');

  // 处理内容生成
  const handleGenerate = async () => {
    const validation = validateSettings();
    if (!validation.isValid) {
      alert(`设置验证失败: ${validation.errors.join(', ')}`);
      return;
    }

    if (!originalContent.trim()) {
      alert('请输入原始内容');
      return;
    }

    const request = {
      originalContent: originalContent.trim(),
      formId: selectedFormId,
      style: selectedStyle,
      platform: selectedPlatforms[0] || 'default'
    };

    await generateContent(request, selectedPlatforms);
  };

  // 处理批量自动化
  const handleAutomation = () => {
    if (selectedPlatforms.length === 0) {
      alert('请选择平台');
      return;
    }

    const request = {
      originalContent: originalContent.trim(),
      formId: selectedFormId,
      style: selectedStyle
    };

    startAutomation(selectedPlatforms, request);
  };

  // 处理平台重试
  const handleRetry = async (platformId: string) => {
    const request = {
      originalContent: originalContent.trim(),
      formId: selectedFormId,
      style: selectedStyle,
      platform: platformId
    };

    await retryPlatform(platformId, request);
  };

  // 获取队列统计
  const queueStats = getQueueStats();

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Hook使用示例 - 内容适配器</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 原始内容输入 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              原始内容
            </label>
            <textarea
              value={originalContent}
              onChange={(e) => setOriginalContent(e.target.value)}
              placeholder="请输入要适配的原始内容..."
              className="w-full h-32 p-3 border rounded-md"
            />
          </div>

          {/* 平台选择 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              目标平台 ({selectedPlatforms.length} 个已选择)
            </label>
            <div className="flex flex-wrap gap-2">
              {['douyin', 'xiaohongshu', 'weibo', 'zhihu', 'wechat'].map(platform => (
                <Badge
                  key={platform}
                  variant={selectedPlatforms.includes(platform) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    const newPlatforms = selectedPlatforms.includes(platform)
                      ? selectedPlatforms.filter(p => p !== platform)
                      : [...selectedPlatforms, platform];
                    updateSelectedPlatforms(newPlatforms);
                  }}
                >
                  {platform}
                </Badge>
              ))}
            </div>
          </div>

          {/* 内容形式选择 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              内容形式
            </label>
            <select
              value={selectedFormId || ''}
              onChange={(e) => updateSelectedForm(e.target.value || undefined)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">请选择内容形式</option>
              <option value="product-review">产品评测</option>
              <option value="comedy-reversal">段子/反转视频</option>
              <option value="deep-analysis">深度分析</option>
              <option value="tutorial-guide">教程指南</option>
            </select>
          </div>

          {/* 表达风格选择 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              表达风格
            </label>
            <select
              value={selectedStyle || ''}
              onChange={(e) => updateSelectedStyle(e.target.value as any)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">请选择表达风格</option>
              <option value="professional">专业严谨</option>
              <option value="funny">幽默风趣</option>
              <option value="real">真实朴素</option>
              <option value="hook">吸引眼球</option>
            </select>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <Button
              onClick={handleGenerate}
              disabled={generating || selectedPlatforms.length === 0}
              className="flex-1"
            >
              {generating ? '生成中...' : '开始生成'}
            </Button>
            
            <Button
              onClick={handleAutomation}
              disabled={queueRunning || selectedPlatforms.length === 0}
              variant="outline"
            >
              {queueRunning ? '自动化运行中...' : '批量自动化'}
            </Button>
            
            <Button
              onClick={clearResults}
              variant="outline"
              disabled={results.length === 0}
            >
              清空结果
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 队列状态 */}
      {queue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>生成队列状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{queueStats.total}</div>
                <div className="text-sm text-muted-foreground">总任务</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{queueStats.running}</div>
                <div className="text-sm text-muted-foreground">运行中</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{queueStats.completed}</div>
                <div className="text-sm text-muted-foreground">已完成</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">{queueStats.failed}</div>
                <div className="text-sm text-muted-foreground">失败</div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={startQueue}
                disabled={queueRunning}
                size="sm"
              >
                开始队列
              </Button>
              <Button
                onClick={stopQueue}
                disabled={!queueRunning}
                variant="outline"
                size="sm"
              >
                停止队列
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 生成结果 */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>生成结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result) => (
                <div key={result.platformId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{result.platformId}</Badge>
                      <Badge variant={result.source === 'ai' ? 'default' : 'secondary'}>
                        {result.source === 'ai' ? 'AI生成' : '手动编辑'}
                      </Badge>
                      {result.error && (
                        <Badge variant="destructive">错误</Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleRetry(result.platformId)}
                        disabled={retryingPlatforms.has(result.platformId)}
                        size="sm"
                        variant="outline"
                      >
                        {retryingPlatforms.has(result.platformId) ? '重试中...' : '重试'}
                      </Button>
                      
                      <Button
                        onClick={() => generateComparison(result.platformId, {
                          originalContent: originalContent.trim(),
                          formId: selectedFormId,
                          style: selectedStyle,
                          platform: result.platformId
                        })}
                        size="sm"
                        variant="outline"
                      >
                        生成对比
                      </Button>
                      
                      <Button
                        onClick={() => generateTitle(result.content, result.platformId)}
                        size="sm"
                        variant="outline"
                      >
                        生成标题
                      </Button>
                    </div>
                  </div>

                  {/* 生成步骤 */}
                  {result.steps && (
                    <div className="mb-3">
                      <div className="text-sm font-medium mb-2">生成步骤:</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {result.steps.map((step, index) => (
                          <div
                            key={index}
                            className={`text-xs p-2 rounded ${
                              step.status === 'completed' ? 'bg-green-100 text-green-800' :
                              step.status === 'loading' ? 'bg-blue-100 text-blue-800' :
                              step.status === 'error' ? 'bg-red-100 text-red-800' :
                              'bg-muted text-muted-foreground'
                            }`}
                          >
                            {step.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 内容显示 */}
                  {result.error ? (
                    <div className="text-destructive text-sm">
                      错误: {result.error}
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm font-medium mb-2">生成内容:</div>
                      <textarea
                        value={result.content}
                        onChange={(e) => updatePlatformContent(result.platformId, e.target.value)}
                        className="w-full h-32 p-3 border rounded-md text-sm"
                        placeholder="生成的内容将显示在这里..."
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        字符数: {result.content.length} / 
                        目标: {getEffectiveSettings(result.platformId).charCount}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ContentAdapterExample;
