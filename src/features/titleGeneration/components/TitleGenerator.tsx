/**
 * 标题生成器主组件
 * 整合所有子组件，提供完整的标题生成功能
 */

import React, { memo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  RefreshCw, 
  Download, 
  Upload, 
  BarChart3,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { useTitleGeneration } from '../hooks/useTitleGeneration';
import TitleList from './TitleList';
import TitleSettings from './TitleSettings';
import TitleGenerationProgress from './TitleGenerationProgress';
import ConcurrencyControl from './ConcurrencyControl';
import type { TitleGeneratorProps } from '../types/titleGeneration.types';

export const TitleGenerator = memo<TitleGeneratorProps>(({
  content: initialContent = '',
  platform: initialPlatform = 'default',
  onTitleChange,
  stylePreference: initialStyles = ['informative'],
  outputCount: initialOutputCount = 5,
  ensureDiversity = true,
  className
}) => {
  // 本地状态
  const [content, setContent] = useState(initialContent);
  const [showStats, setShowStats] = useState(false);
  const [concurrencyConfig, setConcurrencyConfig] = useState({
    enableConcurrency: false,
    maxConcurrency: 3,
    enableBatching: false,
    batchSize: 5,
    enableStreaming: false,
    priority: 0
  });

  // 使用标题生成 Hook
  const {
    // 状态
    titles,
    loading,
    error,
    progress,
    currentStage,
    stats,
    
    // 配置
    platform,
    setPlatform,
    stylePreference,
    setStylePreference,
    outputCount,
    setOutputCount,
    
    // 操作
    generateTitles,
    clearTitles,
    clearError,
    refreshStats,
    
    // 标题操作
    selectTitle,
    copyTitle,
    selectedTitle,
    
    // 高级功能
    regenerateAll,
    exportTitles,
    importTitles
  } = useTitleGeneration(content, {
    initialPlatform,
    initialStyles,
    initialOutputCount,
    onSuccess: (generatedTitles) => {
      if (generatedTitles.length > 0 && onTitleChange) {
        onTitleChange(generatedTitles[0].title);
      }
    },
    onError: (error) => {
      console.error('标题生成失败:', error);
    }
  });

  // 处理生成
  const handleGenerate = async () => {
    if (!content.trim() || content.trim().length < 5) {
      return;
    }
    
    await generateTitles({
      content: content.trim(),
      platform,
      stylePreference,
      outputCount,
      ensureDiversity,
      // 并发选项
      enableConcurrency: concurrencyConfig.enableConcurrency,
      concurrency: concurrencyConfig.maxConcurrency,
      enableBatching: concurrencyConfig.enableBatching,
      enableStreaming: concurrencyConfig.enableStreaming,
      priority: concurrencyConfig.priority
    });
  };

  // 处理标题选择
  const handleTitleSelect = (title: any) => {
    selectTitle(title);
    if (onTitleChange) {
      onTitleChange(title.title);
    }
  };

  // 处理标题复制
  const handleTitleCopy = async (title: string): Promise<boolean> => {
    const success = await copyTitle(title);
    return success;
  };

  // 处理导出
  const handleExport = () => {
    const data = exportTitles();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `titles_${platform}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 处理导入
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as string;
      if (data) {
        const success = importTitles(data);
        if (!success) {
          alert('导入失败，请检查文件格式');
        }
      }
    };
    reader.readAsText(file);
  };

  const canGenerate = content.trim().length >= 5 && !loading;

  return (
    <div className={cn("space-y-6", className)}>
      {/* 内容输入区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            智能标题生成器
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">原文内容</Label>
            <Textarea
              id="content"
              placeholder="请输入需要生成标题的内容（至少5个字符）..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={loading}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {content.length >= 5 ? '✅' : '⚠️'} 
                {content.length} 字符 {content.length < 5 && '(至少需要5个字符)'}
              </span>
              <span>建议100-500字符获得最佳效果</span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="flex-1 min-w-[120px]"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  生成标题
                </>
              )}
            </Button>

            {titles.length > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={regenerateAll}
                  disabled={loading}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重新生成
                </Button>
                
                <Button
                  variant="outline"
                  onClick={clearTitles}
                  disabled={loading}
                >
                  清空结果
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={clearError}>
              关闭
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* 进度指示器 */}
      {(loading || currentStage === 'complete') && (
        <TitleGenerationProgress
          loading={loading}
          progress={progress}
          currentStage={currentStage}
        />
      )}

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 设置面板 */}
        <div className="lg:col-span-1 space-y-4">
          <TitleSettings
            platform={platform}
            onPlatformChange={setPlatform}
            stylePreference={stylePreference}
            onStyleChange={setStylePreference}
            outputCount={outputCount}
            onOutputCountChange={setOutputCount}
          />

          <ConcurrencyControl
            onConfigChange={setConcurrencyConfig}
          />
        </div>

        {/* 结果展示区域 */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="results" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="unified-tabs-list">
                <TabsTrigger value="results" className="unified-tab-trigger">
                  生成结果 {titles.length > 0 && `(${titles.length})`}
                </TabsTrigger>
                <TabsTrigger value="stats" className="unified-tab-trigger" onClick={() => refreshStats()}>
                  <BarChart3 className="w-4 h-4 mr-1" />
                  统计信息
                </TabsTrigger>
              </TabsList>

              {/* 导入导出按钮 */}
              {titles.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="w-4 h-4 mr-1" />
                    导出
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <label>
                      <Upload className="w-4 h-4 mr-1" />
                      导入
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                      />
                    </label>
                  </Button>
                </div>
              )}
            </div>

            <TabsContent value="results" className="mt-0">
              <TitleList
                titles={titles}
                onTitleSelect={handleTitleSelect}
                onTitleCopy={handleTitleCopy}
                showScores={true}
              />
            </TabsContent>

            <TabsContent value="stats" className="mt-0">
              {stats ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">总请求数:</span>
                          <span className="font-medium">{stats.totalRequests}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">成功率:</span>
                          <span className="font-medium text-foreground">
                            {stats.totalRequests > 0 
                              ? ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1)
                              : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">平均响应时间:</span>
                          <span className="font-medium">
                            {stats.averageResponseTime.toFixed(0)}ms
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">缓存命中率:</span>
                          <span className="font-medium text-primary">
                            {(stats.cacheHitRate * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">常用平台:</span>
                          <span className="font-medium">{stats.mostUsedPlatform}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">常用模型:</span>
                          <span className="font-medium">{stats.mostUsedModel}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                  <p>暂无统计数据</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* 选中标题显示 */}
      {selectedTitle && (
        <Card className="border-border bg-accent">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-foreground mb-1">已选择标题</h4>
                <p className="text-foreground mb-2">{selectedTitle.title}</p>
                <div className="flex gap-4 text-xs text-primary">
                  <span>评分: {(selectedTitle.overallScore * 100).toFixed(0)}%</span>
                  <span>风格: {selectedTitle.style}</span>
                  <span>长度: {selectedTitle.length}字符</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTitleCopy(selectedTitle.title)}
                className="border-border text-primary hover:bg-accent"
              >
                复制
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

TitleGenerator.displayName = 'TitleGenerator';

export default TitleGenerator;
