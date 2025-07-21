/**
 * 开发工具组件
 * 仅在开发环境下显示
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { usePermission } from '@/hooks/usePermission';
import { 
  Settings, 
  Database, 
  Network, 
  Shield, 
  User, 
  Key, 
  Eye, 
  EyeOff,
  RefreshCw,
  Terminal,
  Bug,
  Zap
} from 'lucide-react';

/**
 * 开发工具组件
 * 仅在开发环境下显示
 */
export const DevTools: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('auth');
  const { user, isAuthenticated } = useUnifiedAuth();
  const vipPermission = usePermission('vip:required');
  const authPermission = usePermission('auth:required');

  // 仅在开发环境下显示
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* 切换按钮 */}
      <Button
        onClick={() => setIsVisible(!isVisible)}
        size="sm"
        variant="outline"
        className="bg-background/80 backdrop-blur-sm border-2"
      >
        {isVisible ? <EyeOff className="h-4 w-4" /> : <Bug className="h-4 w-4" />}
        {isVisible ? '隐藏' : 'Dev'}
      </Button>

      {/* 开发工具面板 */}
      {isVisible && (
        <Card className="w-96 mt-2 bg-background/95 backdrop-blur-sm border-2 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              开发工具
            </CardTitle>
            <CardDescription className="text-xs">
              调试和测试工具
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="auth" className="text-xs">认证</TabsTrigger>
                <TabsTrigger value="permissions" className="text-xs">权限</TabsTrigger>
                <TabsTrigger value="system" className="text-xs">系统</TabsTrigger>
              </TabsList>

              {/* 认证信息 */}
              <TabsContent value="auth" className="p-4 space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">登录状态</span>
                    <Badge variant={isAuthenticated ? "default" : "destructive"}>
                      {isAuthenticated ? "已登录" : "未登录"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">认证状态</span>
                    <Badge variant={isAuthenticated ? "default" : "secondary"}>
                      {isAuthenticated ? "已认证" : "未认证"}
                    </Badge>
                  </div>

                  {user && (
                    <>
                      <Separator />
                      <div className="space-y-1">
                        <p className="text-xs font-medium">用户信息</p>
                        <div className="text-xs space-y-1">
                          <p>ID: {user.id}</p>
                          <p>邮箱: {user.email}</p>
                          <p>用户名: {user.username || '未设置'}</p>
                          <p>VIP: {user.isVip ? '是' : '否'}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              {/* 权限信息 */}
              <TabsContent value="permissions" className="p-4 space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">登录权限</span>
                    <Badge variant={authPermission.pass ? "default" : "destructive"}>
                      {authPermission.pass ? "通过" : "失败"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">VIP权限</span>
                    <Badge variant={vipPermission.pass ? "default" : "secondary"}>
                      {vipPermission.pass ? "通过" : "失败"}
                    </Badge>
                  </div>

                  {user && (
                    <>
                      <Separator />
                      <div className="space-y-1">
                        <p className="text-xs font-medium">用户权限</p>
                        <div className="text-xs">
                          <p>权限: {user.permissions?.join(', ') || '无'}</p>
                          <p>角色: {user.roles?.join(', ') || '无'}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              {/* 系统信息 */}
              <TabsContent value="system" className="p-4 space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">环境</span>
                    <Badge variant="outline">
                      {import.meta.env.MODE}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">版本</span>
                    <Badge variant="outline">
                      {import.meta.env.VITE_APP_VERSION || 'dev'}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        console.log('🔧 DevTools: 用户信息', user);
                        console.log('🔧 DevTools: 权限信息', { authPermission, vipPermission });
                      }}
                      className="w-full"
                    >
                      <Terminal className="h-3 w-3 mr-1" />
                      打印调试信息
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 