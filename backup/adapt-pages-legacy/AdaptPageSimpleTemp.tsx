/**
 * 简化版内容适配页面 - 最小可行重构版本
 * 验证模块化架构的可行性
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  RefreshCw, 
  Check, 
  Copy,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/landing/Header';
import { PageNavigation } from '@/components/layout/PageNavigation';

// 导入拆分的模块
import { platformUrls, cleanGeneratedContent } from '@/components/adapt/PlatformConfigUtils';
import { getPlatformIcon, platformStyles, CheckboxCard } from '@/components/adapt/PlatformComponents';
import type { PlatformResult } from '@/components/adapt/PlatformComponents';

/**
 * 简化版AdaptPage - 保持核心功能
 */
export default function AdaptPageSimple() {
  const { toast } = useToast();
  
  // 基础状态
  const [originalContent, setOriginalContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [results, setResults] = useState<PlatformResult[]>([]);
  const [generating, setGenerating] = useState(false);

  // 可用平台（简化版）
  const platforms = [
    { id: 'xiaohongshu', name: '小红书', description: '种草分享，图文并茂' },
    { id: 'zhihu', name: '知乎', description: '专业问答，深度内容' },
    { id: 'douyin', name: '抖音', description: '短视频文案，轻松有趣' },
    { id: 'weibo', name: '微博', description: '热点话题，简洁表达' },
    { id: 'wechat', name: '微信', description: '公众号长文，深度分析' },
    { id: 'bilibili', name: 'B站', description: '创作分享，年轻活力' }
  ];

  // 平台选择处理
  const togglePlatform = useCallback((platformId: string) => {
    setSelectedPlatforms(prev => {
      const isSelected = prev.includes(platformId);
      if (isSelected) {
        return prev.filter(id => id !== platformId);
      } else {
        return [...prev, platformId];
      }
    });
  }, []);

  const selectAllPlatforms = useCallback(() => {
    const allPlatformIds = platforms.map(p => p.id);
    setSelectedPlatforms(allPlatformIds);
  }, [platforms]);

  const clearAllPlatforms = useCallback(() => {
    setSelectedPlatforms([]);
    setResults([]);
  }, []);

  // 内容生成处理（简化版）
  const handleGenerate = useCallback(async () => {
    if (!originalContent.trim() || selectedPlatforms.length === 0) {
      toast({
        title: "请检查输入",
        description: "请输入内容并选择至少一个平台",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    setResults([]);
    
    try {
      // 简化的内容生成逻辑
      const newResults: PlatformResult[] = selectedPlatforms.map(platformId => {
        const platformStyle = platformStyles[platformId];
        const adaptedContent = `【${platformStyle?.name || platformId}版本】\n\n${originalContent}\n\n#${platformStyle?.name || platformId} #AI适配`;
        
        return {
          platformId,
          content: adaptedContent,
          steps: [
            { status: 'completed', message: '内容适配完成' }
          ],
          source: 'ai',
          charCount: adaptedContent.length
        };
      });
      
      setResults(newResults);
      
      toast({
        title: "适配完成",
        description: `已成功适配 ${selectedPlatforms.length} 个平台`,
      });
      
    } catch (error) {
      console.error('生成失败:', error);
      toast({
        title: "生成失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  }, [originalContent, selectedPlatforms, toast]);

  // 复制内容
  const handleCopy = useCallback(async (content: string, platformName: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "复制成功",
        description: `已复制${platformName}内容`,
      });
    } catch (error) {
      console.error('复制失败:', error);
      toast({
        title: "复制失败",
        description: "请手动选择复制内容",
        variant: "destructive",
      });
    }
  }, [toast]);

  // 发布到平台
  const handlePublish = useCallback((platformId: string) => {
    const platformUrl = platformUrls[platformId];
    if (platformUrl) {
      window.open(platformUrl, '_blank');
      toast({
        title: "跳转发布",
        description: `已打开${platformStyles[platformId]?.name || platformId}发布页面`,
      });
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <PageNavigation
        title="AI内容适配器"
        description="一键适配多平台内容，智能优化发布效果"
        showAdaptButton={false}
        showUpgradeButton={true}
      />

      <div className="container mx-auto px-4 py-8 space-y-8">
        <Tabs defaultValue="adapt" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="adapt">内容适配</TabsTrigger>
            <TabsTrigger value="results">适配结果</TabsTrigger>
          </TabsList>

          {/* 内容适配标签页 */}
          <TabsContent value="adapt" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* 左侧：内容编辑器 */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      原始内容
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={originalContent}
                      onChange={(e) => setOriginalContent(e.target.value)}
                      placeholder="请输入要适配的原始内容..."
                      className="min-h-[300px] resize-y"
                      disabled={generating}
                    />
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{originalContent.length} 字符</span>
                      <Badge variant={originalContent.length > 5000 ? "destructive" : "secondary"}>
                        {originalContent.length > 5000 ? "内容过长" : "长度适中"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* 右侧：平台选择器 */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>选择发布平台</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          已选择 {selectedPlatforms.length} 个平台
                        </Badge>
                        <Button variant="outline" size="sm" onClick={selectAllPlatforms}>
                          全选
                        </Button>
                        <Button variant="outline" size="sm" onClick={clearAllPlatforms}>
                          清空
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {platforms.map((platform) => (
                        <CheckboxCard
                          key={platform.id}
                          icon={getPlatformIcon(platform.id)}
                          title={platform.name}
                          description={platform.description}
                          checked={selectedPlatforms.includes(platform.id)}
                          onChange={() => togglePlatform(platform.id)}
                        />
                      ))}
                    </div>
                    
                    {/* 生成按钮 */}
                    <div className="flex justify-center">
                      <Button
                        onClick={handleGenerate}
                        disabled={!originalContent.trim() || selectedPlatforms.length === 0 || generating}
                        className="min-w-[200px]"
                        size="lg"
                      >
                        {generating ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            生成中...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            开始适配 ({selectedPlatforms.length})
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 适配结果标签页 */}
          <TabsContent value="results" className="space-y-6">
            {results.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                <div className="space-y-2">
                  <div className="text-lg font-medium">准备就绪</div>
                  <div className="text-sm">选择平台并输入内容后，点击"开始适配"开始生成</div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 结果统计 */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">
                    适配结果 ({results.length} 个平台)
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const allContent = results.map(r => 
                        `【${platformStyles[r.platformId]?.name || r.platformId}】\n${r.content}`
                      ).join('\n\n---\n\n');
                      navigator.clipboard.writeText(allContent);
                      toast({ title: "复制成功", description: "已复制所有内容" });
                    }}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    复制全部
                  </Button>
                </div>

                {/* 结果卡片 */}
                <div className="space-y-4">
                  {results.map((result) => {
                    const platformStyle = platformStyles[result.platformId];
                    
                    return (
                      <Card key={result.platformId}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getPlatformIcon(result.platformId)}
                              <CardTitle className="text-base">
                                {platformStyle?.name || result.platformId}
                              </CardTitle>
                              <Badge variant="outline" className="text-xs">
                                {result.content.length} 字符
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-3">
                          {/* 内容显示 */}
                          <div className="p-3 bg-muted/30 rounded-lg max-h-[300px] overflow-y-auto">
                            <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                              {result.content}
                            </pre>
                          </div>
                          
                          {/* 操作按钮 */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopy(result.content, platformStyle?.name || result.platformId)}
                              className="flex-1"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              复制
                            </Button>
                            
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handlePublish(result.platformId)}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              发布
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}