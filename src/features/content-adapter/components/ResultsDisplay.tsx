/**
 * 结果展示组件
 * 负责生成结果的展示和操作
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlatformHashtags } from '@/components/PlatformHashtags';
// import TitleGenerator from '@/components/TitleGeneratorIntelligent';
import {
  Copy,
  RefreshCw,
  GitCompare,
  Type,
  Heart,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { PlatformResult, GenerationStep } from '../hooks';

interface ResultsDisplayProps {
  // 结果数据
  results: PlatformResult[];

  // 状态
  retryingPlatforms: Set<string>;
  generatingComparison: Set<string>;
  // 🔧 FIX: 标记为必需属性，确保调用方必须传递（即使是空对象）
  titleStates: Record<string, {
    title?: string;
    candidates?: string[];
    hasTitle: boolean;
    isGenerating: boolean;
  }>;

  // 对比内容
  comparisonContent: Record<string, string>;
  showComparison: Record<string, boolean>;
  extractedTagsMap: Record<string, string[]>;

  // 版本选择状态
  selectedVersions: Record<string, string>; // platformId -> versionId

  // 收藏状态
  favoriteStates?: Set<string>;
  persistentFavorites?: Set<string>;

  // 操作回调
  onContentUpdate: (platformId: string, content: string) => void;
  onRetry: (platformId: string) => void;
  onGenerateComparison: (platformId: string) => void;
  onGenerateTitle: (platformId: string, content: string) => void;
  onCopyContent: (content: string, platformId: string) => void;
  onSaveToFavorites: (platformId: string, content: string, versionId?: string) => void;
  onPublishToPlatform: (platformId: string, content: string) => void;
  onVersionSelect: (platformId: string, versionId: string) => void;

  // 工具函数
  getPlatformIcon: (platformId: string) => React.ReactNode;
  getPlatformName: (platformId: string) => string;
  getEffectiveCharCount: (platformId: string) => number;

}

/**
 * 生成步骤指示器
 */
function StepIndicator({ steps  }: { steps: GenerationStep[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
      {steps.map((step, index) => (
        <div
          key={`step-${index}-${step.name}`}
          className={`text-xs p-2 rounded flex items-center gap-1 ${
            step.status === 'completed' ? 'bg-success/15 text-success' :
            step.status === 'loading' ? 'bg-primary/15 text-primary' :
            step.status === 'error' ? 'bg-destructive/15 text-destructive' :
            'bg-muted text-muted-foreground'
          }`}
        >
          {step.status === 'completed' && <CheckCircle className="h-3 w-3" />}
          {step.status === 'loading' && <Loader2 className="h-3 w-3 animate-spin" />}
          {step.status === 'error' && <XCircle className="h-3 w-3" />}
          {step.status === 'waiting' && <Clock className="h-3 w-3" />}
          <span className="truncate">{step.message}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * 单个平台结果卡片
 */
function PlatformResultCard({
  result,
  isRetrying,
  isGeneratingComparison,
  titleState,
  comparisonContent,
  showComparison,
  selectedVersions,
  onContentUpdate,
  onRetry,
  onGenerateComparison,
  onGenerateTitle,
  onCopyContent,
  onSaveToFavorites,
  onPublishToPlatform,
  onVersionSelect,
  getPlatformIcon,

  getPlatformName,
  getEffectiveCharCount,
  extractedTagsMap,
  favoriteStates,
  persistentFavorites
}: {
  result: PlatformResult;
  isRetrying: boolean;
  isGeneratingComparison: boolean;
  // 🔧 FIX: 添加 title/candidates 字段，与 Hook 返回的类型保持一致
  titleState?: { title?: string; candidates?: string[]; hasTitle: boolean; isGenerating: boolean };
  comparisonContent?: string;
  showComparison?: boolean;
  selectedVersions: Record<string, string>;
  onContentUpdate: (platformId: string, content: string) => void;
  onRetry: (platformId: string) => void;
  onGenerateComparison: (platformId: string) => void;
  onGenerateTitle: (platformId: string, content: string) => void;
  onCopyContent: (content: string, platformId: string) => void;
  onSaveToFavorites: (platformId: string, content: string, versionId?: string) => void;
  onPublishToPlatform: (platformId: string, content: string) => void;
  onVersionSelect: (platformId: string, versionId: string) => void;
  getPlatformIcon: (platformId: string) => React.ReactNode;
  getPlatformName: (platformId: string) => string;
  getEffectiveCharCount: (platformId: string) => number;
  extractedTagsMap: Record<string, string[]>;
  favoriteStates?: Set<string>;
  persistentFavorites?: Set<string>;
}) {
  const { toast } = useToast();
  const targetCharCount = getEffectiveCharCount(result.platformId);

  const { t } = useTranslation();

  // 自动触发智能标题生成（首次渲染且有内容时）
  React.useEffect(() => {
    const content = result.content || result.versions?.[0]?.content || '';
    if (!content || !content.trim()) return;
    if (!titleState?.hasTitle && !titleState?.isGenerating) {
      onGenerateTitle(result.platformId, content);
    }
    // 仅在平台卡片首次挂载时尝试一次，避免重复触发
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.platformId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.content);
      onCopyContent(result.content, result.platformId);
      toast({

        title: t('components.labels.已复制到剪贴板'),
        description: `${getPlatformName(result.platformId)}的内容已复制`,
      });
    } catch (error) {
      toast({
        title: t('components.labels.复制失败'),
        description: "请手动选择并复制内容",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-3 shadow-sm border border-border bg-card">
      <CardHeader className="pb-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getPlatformIcon(result.platformId)}
            <h3 className="text-base font-semibold">
              {getPlatformName(result.platformId)}
            </h3>
            <Badge variant={result.source === 'ai' ? 'default' : 'secondary'}>
              {result.source === 'ai' ? 'AI生成' : '手动编辑'}
            </Badge>
            {result.error && (
              <Badge variant="destructive">错误</Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => onRetry(result.platformId)}
              disabled={isRetrying}
              size="sm"
              variant="outline"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                  重试中...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  重试
                </>
              )}
            </Button>

            <Button
              onClick={() => onGenerateComparison(result.platformId)}
              disabled={isGeneratingComparison}
              size="sm"
              variant="outline"
            >
              {isGeneratingComparison ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  生成中...
                </>
              ) : (
                <>
                  <GitCompare className="h-3 w-3 mr-1" />
                  对比版本
                </>
              )}
            </Button>

            <Button
              onClick={() => onGenerateTitle(result.platformId, result.content)}
              disabled={titleState?.isGenerating}
              size="sm"
              variant="outline"
            >
              {titleState?.isGenerating ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  生成中...
                </>
              ) : (
                <>
                  <Type className="h-3 w-3 mr-1" />
                  生成标题
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* 生成步骤 */}
        {result.steps && <StepIndicator steps={result.steps} />}

        {/* 内容展示 */}
        {result.error ? (
          <div className="text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
            <p className="font-medium">生成失败</p>
            <p>{result.error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 主内容 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">生成内容</label>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${
                    result.content.length > targetCharCount ? 'text-destructive' :
                    result.content.length > targetCharCount * 0.9 ? 'text-warning' :
                    'text-success'
                  }`}>
                    {result.content.length} / {targetCharCount} 字符
                  </span>
                </div>
              </div>

              {/* 🔧 FIX: 版本左右布局 - 版本A在左,版本B在右 */}
              {result.versions && result.versions.length > 1 ? (
                <div className="grid grid-cols-2 gap-4">
                  {result.versions.map((version) => (
                    <div key={version.id} className="flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">{version.title}</label>
                        <span className="text-xs text-muted-foreground">
                          {version.charCount}字
                        </span>
                      </div>
                      <Textarea
                        value={version.content}
                        onChange={(e) => {
                          onVersionSelect(result.platformId, version.id);
                          onContentUpdate(result.platformId, e.target.value);
                        }}
                        className="content-textarea text-sm flex-1 min-h-[450px]"
                        placeholder={`${version.title}内容...`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <Textarea
                  value={result.content}
                  onChange={(e) => onContentUpdate(result.platformId, e.target.value)}
                  className="content-textarea text-sm min-h-[450px]"
                  placeholder="生成的内容将显示在这里..."
                />
              )}
            </div>

            {/* 对比内容 */}
            {showComparison && comparisonContent && (
              <div>
                <label className="text-sm font-medium mb-2 block">对比版本</label>
                <Textarea
                  value={comparisonContent}
                  readOnly
                  className="content-textarea text-sm bg-muted/50"
                />
              </div>
            )}

            {/* 标题生成器 */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Type className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">智能标题生成</span>
                <span className="text-muted-foreground text-xs">
                  (限25字)
                </span>
              </div>
              {titleState?.isGenerating ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>正在生成标题...</span>
                </div>
              ) : (titleState?.candidates && titleState.candidates.length > 0) ? (
                <div className="space-y-2">
                  {titleState.candidates.slice(0, 3).map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded border">
                      <p className="text-sm font-medium mr-2 truncate">{t}</p>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(t)}>复制</Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onGenerateTitle(result.platformId, result.content || result.versions?.[0]?.content || '')}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    重新生成
                  </Button>
                </div>
              ) : titleState?.title ? (
                <div className="space-y-2">
                  <div className="p-3 bg-muted/50 rounded border">
                    <p className="text-sm font-medium">{titleState.title}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onGenerateTitle(result.platformId, result.content || result.versions?.[0]?.content || '')}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    重新生成
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => onGenerateTitle(result.platformId, result.content || result.versions?.[0]?.content || '')}
                  disabled={!result.content && !result.versions?.[0]?.content}
                >
                  <Type className="h-4 w-4 mr-1" />
                  生成标题
                </Button>
              )}
            </div>

            {/* 标签生成器 */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-foreground">智能标签生成</span>
                <span className="text-muted-foreground text-xs">标签生成</span>
              </div>
              <PlatformHashtags
                key={`${result.platformId}-unified-${(result.content || (result.versions && result.versions[0]?.content) || '').length}`}
                platformId={result.platformId}
                content={result.content || (result.versions && result.versions[0]?.content) || ''}
                extractedTags={
                  // 🔧 FIX: 合并版本A和版本B的标签并去重
                  Array.from(new Set([
                    ...(extractedTagsMap[`${result.platformId}-version-a`] || []),
                    ...(extractedTagsMap[`${result.platformId}-version-b`] || [])
                  ].map(t => t.replace(/^#/, ''))))
                }
              />
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleCopy}
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
              >
                <Copy className="h-3 w-3" />
                复制
              </Button>

              {(() => {
                const favoriteKey = `${result.platformId}-main`;
                const isInPersistent = persistentFavorites?.has(favoriteKey) ?? false;
                const isInFavorites = favoriteStates?.has(favoriteKey) ?? false;
                const isFavorited = isInPersistent || isInFavorites;

                return (
                  <Button
                    onClick={() => onSaveToFavorites(result.platformId, result.content, 'main')}
                    size="sm"
                    variant="outline"
                    className={`flex items-center gap-1 ${isFavorited ? 'bg-muted/50 border-border text-foreground' : ''}`}
                  >
                    <Heart className={`h-3 w-3 ${isFavorited ? 'fill-current text-primary' : ''}`} />
                    {isFavorited ? '已收藏 ❤️' : '收藏'}
                  </Button>
                );
              })()}

              <Button
                onClick={() => onPublishToPlatform(result.platformId, result.content)}
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                发布
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 结果展示组件
 */
export function ResultsDisplay({
  results,
  retryingPlatforms,
  generatingComparison,
  titleStates, // 🔧 FIX: 移除默认值，要求调用方必须传递
  comparisonContent,
  showComparison,
  extractedTagsMap,
  selectedVersions,
  favoriteStates,
  persistentFavorites,
  onContentUpdate,
  onRetry,
  onGenerateComparison,
  onGenerateTitle,
  onCopyContent,
  onSaveToFavorites,
  onPublishToPlatform,
  onVersionSelect,
  getPlatformIcon,
  getPlatformName,
  getEffectiveCharCount
}: ResultsDisplayProps) {
  const { t } = useTranslation();

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg font-medium mb-2">暂无生成结果</p>
        <p className="text-sm">请输入内容并选择平台后开始生成</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">生成结果</h2>
        <Badge variant="outline">
          {results.length} 个平台
        </Badge>
      </div>

      {/* 标签页展示 */}
      <Tabs defaultValue={results[0]?.platformId} className="w-full">
        <TabsList className="unified-tabs-list grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {results.map((result) => (
            <TabsTrigger
              key={result.platformId}
              value={result.platformId}
              className="unified-tab-trigger flex items-center gap-1"
            >
              {getPlatformIcon(result.platformId)}
              <span className="hidden sm:inline">
                {getPlatformName(result.platformId)}
              </span>
              {result.error && (
                <XCircle className="h-3 w-3 text-destructive" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {results.map((result) => (
          <TabsContent key={result.platformId} value={result.platformId}>
            <PlatformResultCard
              result={result}
              isRetrying={retryingPlatforms.has(result.platformId)}
              isGeneratingComparison={generatingComparison.has(result.platformId)}
              titleState={titleStates[result.platformId]}
              comparisonContent={comparisonContent[result.platformId]}
              showComparison={showComparison[result.platformId]}
              selectedVersions={selectedVersions}
              onContentUpdate={onContentUpdate}
              onRetry={onRetry}
              onGenerateComparison={onGenerateComparison}
              onGenerateTitle={onGenerateTitle}
              onCopyContent={onCopyContent}
              onSaveToFavorites={onSaveToFavorites}
              onPublishToPlatform={onPublishToPlatform}
              onVersionSelect={onVersionSelect}
              getPlatformIcon={getPlatformIcon}
              getPlatformName={getPlatformName}
              getEffectiveCharCount={getEffectiveCharCount}
              extractedTagsMap={extractedTagsMap}
              favoriteStates={favoriteStates}
              persistentFavorites={persistentFavorites}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// 🔧 FIX: 移除可能导致引用错误的默认导出,统一使用命名导出
// export default ResultsDisplay;
