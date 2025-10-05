/**
 * 历史记录页面
 * 显示用户的内容生成历史
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from "@/hooks/useAuth";
import { Clock, Copy, Trash2 } from 'lucide-react';
import { getUserDisplayName } from '@/utils/userDisplayUtils';
import { globalDataManager } from '@/services/unifiedDataManager';
import { Header } from '@/components/landing/Header';
import { PageNavigation } from '@/components/layout/PageNavigation';

/**
 * 历史记录项接口
 */
interface HistoryItem {
  platformId: string;
  content: string;
  timestamp: string;
}

/**
 * 历史记录页面组件
 * @returns React 组件
 */
export default function HistoryPage() { const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast  } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();



  // ✅ FIXED: 加载历史记录 - 使用云端同步
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await globalDataManager.getData<HistoryItem[]>('user_history');
        setHistory(data || []);
      } catch (error) {
        console.error('❌ 加载历史记录失败:', error);
        setHistory([]);
        toast({
          title: '加载失败',
          description: '无法加载历史记录，请稍后重试',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadHistory();
  }, [user?.id, toast]); // 依赖用户ID变化

  /**
   * 复制内容到剪贴板
   */
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: t('pages.labels.已复制'),
      description: t('pages.messages.内容已复制到剪贴板'),
    });
  };

  /**
   * ✅ FIXED: 删除历史记录项 - 使用云端同步
   */
  const deleteHistoryItem = async (index: number) => {
    try {
      const newHistory = history.filter((_, i) => i !== index);
      setHistory(newHistory);
      await globalDataManager.setData('user_history', newHistory);

      toast({
        title: t('pages.labels.删除成功'),
        description: t('pages.messages.历史记录已删除'),
      });
    } catch (error) {
      console.error('❌ 删除历史记录失败:', error);
      toast({
        title: '删除失败',
        description: '无法删除历史记录，请稍后重试',
        variant: 'destructive'
      });
    }
  };

  /**
   * ✅ FIXED: 清空所有历史记录 - 使用云端同步
   */
  const clearAllHistory = async () => {
    try {
      setHistory([]);
      await globalDataManager.setData('user_history', []);

      toast({
        title: t('pages.labels.清空成功'),
        description: t('pages.messages.所有历史记录已清空'),
      });
    } catch (error) {
      console.error('❌ 清空历史记录失败:', error);
      toast({
        title: '清空失败',
        description: '无法清空历史记录，请稍后重试',
        variant: 'destructive'
      });
    }
  };

  /**
   * 获取平台显示名称
   */
  const getPlatformName = (platformId: string): string => {
    const platformNames: Record<string, string> = {
      'wechat': t('pages.messages.微信'),
      'weibo': t('pages.messages.微博'),
      'douyin': t('pages.messages.抖音'),
      'xiaohongshu': t('pages.messages.小红书'),
      'zhihu': t('pages.messages.知乎'),
      'bilibili': 'B站',
      'toutiao': t('pages.messages.头条'),
      'kuaishou': t('pages.messages.快手'),
    };
    return platformNames[platformId] || platformId;
  };

  /**
   * 格式化时间
   */
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">加载历史记录中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* 主导航栏 */}
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* 面包屑导航 */}
        <PageNavigation
          title={t('components.labels.标题')}
          description={t('components.labels.描述')}
        />
        
        <div className="mb-8 mt-4">
          <h1 className="text-3xl font-bold text-foreground mb-2">历史记录</h1>
          <p className="text-muted-foreground">
            查看您之前生成的内容适配记录
          </p>
        </div>

        {history.length === 0 ? (
          <Card variant="soft" className="rounded-xl">
            <CardContent className="text-center py-12">
              <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">暂无历史记录</h3>
              <p className="text-muted-foreground mb-4">
                您还没有生成过内容，快去试试内容适配功能吧！
              </p>
              <Button variant="default" onClick={() => window.location.href = '/adapt'}>
                开始生成内容
              </Button>
            </CardContent>
          </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                共 {history.length} 条记录
              </Badge>
            </div>
            <Button
              variant="soft"
              onClick={clearAllHistory}
              className="text-destructive hover:text-destructive/80"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              清空所有
            </Button>
          </div>

          <div className="grid gap-4">
            {history.map((item, index) => (
              <Card key={index} variant="soft" className="rounded-xl hover:shadow-e2 transition-smooth">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {getPlatformName(item.platformId)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatTime(item.timestamp)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(item.content)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteHistoryItem(index)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <p className="text-foreground whitespace-pre-wrap">
                      {item.content}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}