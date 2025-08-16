/**
 * 用户数据查看页面
 * @description 展示和管理用户数据记录，包括临时用户和正式用户的数据
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/authStore';
import UserDataService from '@/services/userDataService';
import PageTracker from '@/components/analytics/PageTracker';

/**
 * 用户数据记录接口
 */
interface UserDataRecord {
  userId: string;
  isTempUser: boolean;
  realUserId?: string;
  userInfo: any;
  userActions: {
    pageVisits: Array<{
      page: string;
      timestamp: string;
      duration?: number;
    }>;
    featureUsage: Array<{
      feature: string;
      timestamp: string;
      metadata?: Record<string, unknown>;
    }>;
    contentCreated: Array<{
      type: string;
      title: string;
      timestamp: string;
      contentId: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * 用户数据查看页面
 */
export default function UserDataPage() {
  const authState = useAuthStore();
  const [userData, setUserData] = useState<UserDataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = authState.user?.id || 'guest';

  useEffect(() => {
    loadUserData();
  }, [currentUserId]);

  /**
   * 加载用户数据
   */
  const loadUserData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userDataService = UserDataService.getInstance();
      
      if (!authState.isAuthenticated) {
        // 如果是正式用户，获取所有关联数据
        const data = await userDataService.getRealUserData(currentUserId);
        setUserData(data);
      } else {
        // 如果是临时用户，获取临时用户数据
        const data = await userDataService.getTempUserData(currentUserId);
        setUserData(data);
      }
    } catch (err) {
      console.error('加载用户数据失败:', err);
      setError('加载用户数据失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 格式化时间
   */
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  /**
   * 格式化持续时间
   */
  const formatDuration = (duration?: number) => {
    if (!duration) return '未知';
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}分${seconds}秒`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary particle-background">
        <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">加载用户数据中...</p>
          </div>
        </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-primary particle-background">
        <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={loadUserData} variant="outline">重试</Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary particle-background">
      <div className="container mx-auto px-4 py-8">
      {/* 页面访问记录 */}
      <PageTracker 
        title="用户数据管理"
        description="查看和管理用户数据记录"
        metadata={{
          layout: 'tool',
          hasNavigation: true,
          pageType: 'user_data'
        }}
      />

      <div className="space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">用户数据管理</h1>
          <p className="text-muted-foreground mt-2">
            当前用户ID: {currentUserId}
            {authState.isAuthenticated ? (
              <Badge className="ml-2">正式用户</Badge>
            ) : (
              <Badge variant="secondary" className="ml-2">临时用户</Badge>
            )}
          </p>
        </div>

        {/* 数据概览 */}
        <Card>
          <CardHeader>
            <CardTitle>数据概览</CardTitle>
            <CardDescription>用户行为数据统计</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-accent rounded-lg border border-border">
                <div className="text-2xl font-bold text-foreground">
                  {userData.reduce((total, record) => total + record.userActions.pageVisits.length, 0)}
                </div>
                <div className="text-sm text-muted-foreground">页面访问</div>
              </div>
              <div className="text-center p-4 bg-accent rounded-lg border border-border">
                <div className="text-2xl font-bold text-foreground">
                  {userData.reduce((total, record) => total + record.userActions.featureUsage.length, 0)}
                </div>
                <div className="text-sm text-muted-foreground">功能使用</div>
              </div>
              <div className="text-center p-4 bg-accent rounded-lg border border-border">
                <div className="text-2xl font-bold text-foreground">
                  {userData.reduce((total, record) => total + record.userActions.contentCreated.length, 0)}
                </div>
                <div className="text-sm text-muted-foreground">内容创建</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 详细数据 */}
        <Tabs defaultValue="pageVisits" className="space-y-4">
          <TabsList className="unified-tabs-list grid w-full grid-cols-3">
            <TabsTrigger value="pageVisits" className="unified-tab-trigger">
              <span>页面访问</span>
            </TabsTrigger>
            <TabsTrigger value="featureUsage" className="unified-tab-trigger">
              <span>功能使用</span>
            </TabsTrigger>
            <TabsTrigger value="contentCreated" className="unified-tab-trigger">
              <span>内容创建</span>
            </TabsTrigger>
          </TabsList>

          {/* 页面访问记录 */}
          <TabsContent value="pageVisits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>页面访问记录</CardTitle>
                <CardDescription>用户访问的页面和停留时间</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {userData.map((record) => 
                      record.userActions.pageVisits.map((visit, index) => (
                        <div key={`${record.userId}-${index}`} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{visit.page}</div>
                            <Badge variant="outline">
                              {record.isTempUser ? '临时用户' : '正式用户'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>访问时间: {formatTime(visit.timestamp)}</div>
                            {visit.duration && (
                              <div>停留时间: {formatDuration(visit.duration)}</div>
                            )}
                            {visit.page && <div>页面: {visit.page}</div>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 功能使用记录 */}
          <TabsContent value="featureUsage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>功能使用记录</CardTitle>
                <CardDescription>用户使用的功能和时间</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {userData.map((record) => 
                      record.userActions.featureUsage.map((usage, index) => (
                        <div key={`${record.userId}-${index}`} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{usage.feature}</div>
                            <Badge variant="outline">
                              {record.isTempUser ? '临时用户' : '正式用户'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>使用时间: {formatTime(usage.timestamp)}</div>
                            {usage.metadata && (
                              <div className="mt-2">
                                <div className="font-medium mb-1">元数据:</div>
                                <pre className="text-xs bg-muted p-2 rounded overflow-auto text-foreground">
                                  {JSON.stringify(usage.metadata, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 内容创建记录 */}
          <TabsContent value="contentCreated" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>内容创建记录</CardTitle>
                <CardDescription>用户创建的内容</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {userData.map((record) => 
                      record.userActions.contentCreated.map((content, index) => (
                        <div key={`${record.userId}-${index}`} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{content.title}</div>
                            <Badge variant="outline">
                              {record.isTempUser ? '临时用户' : '正式用户'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>类型: {content.type}</div>
                            <div>创建时间: {formatTime(content.timestamp)}</div>
                            <div>内容ID: {content.contentId}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <Button onClick={loadUserData} variant="outline">
            刷新数据
          </Button>
          <Button 
            onClick={() => {
              const userDataService = UserDataService.getInstance();
              userDataService.deleteUserData(currentUserId).then(() => {
                loadUserData();
              });
            }}
            variant="destructive"
          >
            清除数据
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
}