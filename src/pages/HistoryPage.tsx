/**
 * 历史记录页面
 * 显示用户的内容生成历史
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Clock, Copy, Trash2 } from 'lucide-react';

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
export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, isAuthenticated } = useUnifiedAuth();

  // 加载历史记录
  useEffect(() => {
    if (isAuthenticated && user) {
      const username = user.username || user.email || 'anonymous';
      const historyKey = `history_${username}`;
      const storedHistory = localStorage.getItem(historyKey);
      
      if (storedHistory) {
        try {
          const parsedHistory = JSON.parse(storedHistory);
          setHistory(parsedHistory);
        } catch (error) {
          console.error('解析历史记录失败:', error);
          setHistory([]);
        }
      } else {
        setHistory([]);
      }
    } else {
      setHistory([]);
    }
    setLoading(false);
  }, [isAuthenticated, user]);

  /**
   * 复制内容到剪贴板
   */
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "已复制",
      description: "内容已复制到剪贴板",
    });
  };

  /**
   * 删除历史记录项
   */
  const deleteHistoryItem = (index: number) => {
    if (user) {
      const username = user.username || user.email || 'anonymous';
      const historyKey = `history_${username}`;
      
      const newHistory = history.filter((_, i) => i !== index);
      setHistory(newHistory);
      localStorage.setItem(historyKey, JSON.stringify(newHistory));
      
      toast({
        title: "删除成功",
        description: "历史记录已删除",
      });
    }
  };

  /**
   * 清空所有历史记录
   */
  const clearAllHistory = () => {
    if (user) {
      const username = user.username || user.email || 'anonymous';
      const historyKey = `history_${username}`;
      
      setHistory([]);
      localStorage.removeItem(historyKey);
      
      toast({
        title: "清空成功",
        description: "所有历史记录已清空",
      });
    }
  };

  /**
   * 获取平台显示名称
   */
  const getPlatformName = (platformId: string): string => {
    const platformNames: Record<string, string> = {
      'wechat': '微信',
      'weibo': '微博',
      'douyin': '抖音',
      'xiaohongshu': '小红书',
      'zhihu': '知乎',
      'bilibili': 'B站',
      'toutiao': '头条',
      'kuaishou': '快手',
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载历史记录中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">历史记录</h1>
        <p className="text-gray-600">
          查看您之前生成的内容适配记录
        </p>
      </div>

      {history.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无历史记录</h3>
            <p className="text-gray-600 mb-4">
              您还没有生成过内容，快去试试内容适配功能吧！
            </p>
            <Button onClick={() => window.location.href = '/adapt'}>
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
              variant="outline" 
              onClick={clearAllHistory}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              清空所有
            </Button>
          </div>

          <div className="grid gap-4">
            {history.map((item, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {getPlatformName(item.platformId)}
                      </Badge>
                      <span className="text-sm text-gray-500">
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
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800 whitespace-pre-wrap">
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
  );
} 