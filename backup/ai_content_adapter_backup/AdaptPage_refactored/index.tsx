/**
 * AI内容适配器 - 重构后的主页面
 * 模块化架构，清晰的组件分离
 */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Smartphone, 
  Settings, 
  Zap, 
  Send,
  Bot,
  History,
  Sparkles
} from 'lucide-react';

// 导入重构后的组件
import AdaptPageProvider, { useAdaptPage } from './AdaptPageProvider';
import ContentInput from './components/ContentInput';
import PlatformSelector from './components/PlatformSelector';
import ContentSettings from './components/ContentSettings';
import ModelSelector from './components/ModelSelector';
import GenerationPanel from './components/GenerationPanel';
import ResultsDisplay from './components/ResultsDisplay';
import ForwardingPanel from './components/ForwardingPanel';

// 导入hooks
import { useContentGeneration } from './hooks/useContentGeneration';
import { useForwardingEngine } from './hooks/useForwardingEngine';

import { cn } from '@/lib/utils';

// ========================================================================================
// 主页面内容组件
// ========================================================================================

function AdaptPageContent() {
  const { state, events } = useAdaptPage();
  
  // 使用自定义hooks
  const { generateContent, regenerateContent } = useContentGeneration();
  const { startForwarding, cancelForwarding } = useForwardingEngine();

  const {
    inputContent,
    selectedPlatforms,
    isGenerating,
    generationProgress,
    results,
    isForwarding,
    forwardingProgress,
    activeTab,
  } = state;

  // 检查是否可以生成
  const canGenerate = inputContent.trim().length > 0 && selectedPlatforms.length > 0;
  
  // 检查是否有结果可以转发
  const hasResults = results.some(r => r.content || (r.versions && r.versions.length > 0));

  const handleGenerate = async () => {
    if (!canGenerate) return;
    
    await generateContent({
      content: inputContent,
      platforms: selectedPlatforms,
      contentForm: state.selectedContentForm,
      contentScheme: state.selectedContentScheme,
      aiModel: state.selectedAIModel,
      customPrompt: state.customPrompt,
      brandLibraryEnabled: state.brandLibraryEnabled,
      platformSettings: state.platformSettings,
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* 页面标题 */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI内容适配器</h1>
            <p className="text-sm text-muted-foreground">
              智能适配多平台内容，一键转发到各大社交媒体
            </p>
          </div>
        </div>
        
        {/* 状态指示器 */}
        <div className="flex items-center gap-2">
          <Badge variant={canGenerate ? "default" : "secondary"} className="text-xs">
            {canGenerate ? "准备就绪" : "等待输入"}
          </Badge>
          {selectedPlatforms.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {selectedPlatforms.length} 个平台已选择
            </Badge>
          )}
          {hasResults && (
            <Badge variant="outline" className="text-xs">
              <Send className="h-3 w-3 mr-1" />
              {results.length} 个结果可转发
            </Badge>
          )}
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：输入和设置 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 内容输入 */}
          <ContentInput />
          
          {/* 平台选择 */}
          <PlatformSelector />
          
          {/* 高级设置标签页 */}
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="content" className="w-full">
                <div className="border-b border-border px-4 pt-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="content" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      内容设置
                    </TabsTrigger>
                    <TabsTrigger value="model" className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      AI模型
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      高级选项
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="content" className="p-4">
                  <ContentSettings />
                </TabsContent>
                
                <TabsContent value="model" className="p-4">
                  <ModelSelector />
                </TabsContent>
                
                <TabsContent value="advanced" className="p-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">高级选项开发中...</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：生成和结果 */}
        <div className="space-y-6">
          {/* 生成控制面板 */}
          <GenerationPanel
            canGenerate={canGenerate}
            isGenerating={isGenerating}
            progress={generationProgress}
            onGenerate={handleGenerate}
          />
          
          {/* 转发面板 */}
          {hasResults && (
            <ForwardingPanel results={results} />
          )}
        </div>
      </div>

      {/* 结果展示区域 */}
      {hasResults && (
        <div className="mt-8">
          <ResultsDisplay results={results} />
        </div>
      )}

      {/* 生成进度指示器 */}
      {isGenerating && (
        <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg shadow-lg p-4 min-w-[300px]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 bg-primary rounded animate-pulse"></div>
            <span className="text-sm font-medium">AI内容生成中...</span>
          </div>
          <Progress value={generationProgress} className="h-2" />
          <div className="text-xs text-muted-foreground mt-1">
            正在为 {selectedPlatforms.length} 个平台生成内容
          </div>
        </div>
      )}

      {/* 转发进度指示器 */}
      {isForwarding && (
        <div className="fixed bottom-4 left-4 bg-card border border-border rounded-lg shadow-lg p-4 min-w-[300px]">
          <div className="flex items-center gap-3 mb-2">
            <Send className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium">批量转发中...</span>
          </div>
          <Progress 
            value={(forwardingProgress.completed / forwardingProgress.total) * 100} 
            className="h-2" 
          />
          <div className="text-xs text-muted-foreground mt-1">
            {forwardingProgress.completed}/{forwardingProgress.total} 已完成
            {forwardingProgress.current && ` · 当前: ${forwardingProgress.current}`}
          </div>
        </div>
      )}
    </div>
  );
}

// ========================================================================================
// 主页面组件（带Provider包装）
// ========================================================================================

export function AdaptPage() {
  return (
    <AdaptPageProvider>
      <AdaptPageContent />
    </AdaptPageProvider>
  );
}

export default AdaptPage;
