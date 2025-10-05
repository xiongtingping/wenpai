/**
 * 增强版批量发布面板
 * 集成平台内容卡片和智能发布流程
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Zap,
  Info,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PlatformContentCard } from './PlatformContentCard';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface PlatformContent {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  title?: string;
  content: string;
  hashtags?: string[];
  publishUrl: string;
  maxLength?: number;
}

interface EnhancedBatchPublishPanelProps {
  platforms: PlatformContent[];
  onPublishComplete?: (results: any[]) => void;
}

export const EnhancedBatchPublishPanel: React.FC<EnhancedBatchPublishPanelProps> = ({
  platforms,
  onPublishComplete
}) => {
  const { toast } = useToast();
  const [isPublishing, setIsPublishing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [publishResults, setPublishResults] = useState<any[]>([]);

  // 开始批量发布
  const handleStartBatchPublish = async () => {
    if (platforms.length === 0) {
      toast({
        title: "无可发布内容",
        description: "请先生成平台内容",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);
    setCurrentIndex(0);
    setProgress(0);
    const results: any[] = [];

    for (let i = 0; i < platforms.length; i++) {
      const platform = platforms[i];
      setCurrentIndex(i);

      try {
        // 组装完整内容
        let fullContent = platform.content;
        if (platform.title) {
          fullContent = `${platform.title}\n\n${platform.content}`;
        }
        if (platform.hashtags && platform.hashtags.length > 0) {
          fullContent += `\n\n${platform.hashtags.join(' ')}`;
        }

        // 复制内容
        await navigator.clipboard.writeText(fullContent);

        // 打开平台发布页
        const platformWindow = window.open(
          platform.publishUrl,
          `publish_${platform.id}_${Date.now()}`
        );

        if (platformWindow) {
          // 显示当前平台的提示
          toast({
            title: `📝 ${platform.name} (${i + 1}/${platforms.length})`,
            description: "内容已复制，请在新窗口粘贴并发布，完成后关闭窗口",
            duration: 8000,
          });

          // 等待用户完成
          await new Promise<void>((resolve) => {
            const checkInterval = setInterval(() => {
              if (platformWindow.closed) {
                clearInterval(checkInterval);
                results.push({
                  platform: platform.name,
                  success: true,
                  completedAt: new Date()
                });
                setProgress(((i + 1) / platforms.length) * 100);
                resolve();
              }
            }, 500);

            // 60秒超时
            setTimeout(() => {
              clearInterval(checkInterval);
              if (!platformWindow.closed) {
                toast({
                  title: "⏰ 超时提醒",
                  description: `${platform.name}发布超时，已自动跳过`,
                  variant: "destructive",
                });
                results.push({
                  platform: platform.name,
                  success: false,
                  error: 'timeout'
                });
              }
              resolve();
            }, 60000);
          });

          // 延迟1秒再处理下一个
          if (i < platforms.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } else {
          results.push({
            platform: platform.name,
            success: false,
            error: 'window_blocked'
          });
          toast({
            title: "打开窗口失败",
            description: `无法打开${platform.name}，可能被浏览器拦截`,
            variant: "destructive",
          });
        }
      } catch (error) {
        results.push({
          platform: platform.name,
          success: false,
          error: String(error)
        });
      }
    }

    setPublishResults(results);
    setIsPublishing(false);
    setProgress(100);

    const successCount = results.filter(r => r.success).length;
    toast({
      title: "✅ 批量发布完成",
      description: `成功: ${successCount}/${platforms.length} 个平台`,
    });

    onPublishComplete?.(results);
  };

  // 计算统计信息
  const totalChars = platforms.reduce((sum, p) => sum + p.content.length, 0);
  const overLimitCount = platforms.filter(p => p.maxLength && p.content.length > p.maxLength).length;

  return (
    <div className="space-y-6">
      {/* 操作面板 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                智能批量发布
              </CardTitle>
              <CardDescription className="mt-2">
                自动复制内容并依次打开各平台发布页面
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg">
              {platforms.length} 个平台
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 统计信息 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">{platforms.length}</div>
              <div className="text-xs text-muted-foreground">平台数量</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">{totalChars}</div>
              <div className="text-xs text-muted-foreground">总字符数</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className={`text-2xl font-bold ${overLimitCount > 0 ? 'text-destructive' : 'text-foreground'}`}>
                {overLimitCount}
              </div>
              <div className="text-xs text-muted-foreground">超限平台</div>
            </div>
          </div>

          {/* 发布按钮 */}
          <Button
            onClick={handleStartBatchPublish}
            disabled={isPublishing || platforms.length === 0}
            className="w-full"
            size="lg"
          >
            {isPublishing ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                发布中 ({currentIndex + 1}/{platforms.length})
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                开始批量发布
              </>
            )}
          </Button>

          {/* 进度条 */}
          {isPublishing && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <div className="text-sm text-center text-muted-foreground">
                正在处理: {platforms[currentIndex]?.name}
              </div>
            </div>
          )}

          {/* 使用说明 */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>使用说明</AlertTitle>
            <AlertDescription className="text-sm space-y-1">
              <div>1. 点击"开始批量发布"按钮</div>
              <div>2. 系统会自动复制内容并打开对应平台</div>
              <div>3. 在打开的页面粘贴内容并发布</div>
              <div>4. 发布完成后关闭窗口，系统会自动处理下一个平台</div>
            </AlertDescription>
          </Alert>

          {/* 超限提醒 */}
          {overLimitCount > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>字数超限提醒</AlertTitle>
              <AlertDescription>
                有 {overLimitCount} 个平台的内容超出字数限制，建议精简后再发布
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 平台内容列表 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">各平台内容预览</h3>
          <Badge variant="outline">
            {platforms.length} 个平台已准备
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {platforms.map((platform) => (
            <PlatformContentCard
              key={platform.id}
              platformId={platform.id}
              platformName={platform.name}
              platformIcon={platform.icon}
              platformColor={platform.color}
              title={platform.title}
              content={platform.content}
              hashtags={platform.hashtags}
              publishUrl={platform.publishUrl}
              maxLength={platform.maxLength}
            />
          ))}
        </div>
      </div>

      {/* 发布结果 */}
      {publishResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              发布结果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {publishResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted rounded"
                >
                  <span className="text-sm text-foreground">{result.platform}</span>
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? '✅ 成功' : '❌ 失败'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
