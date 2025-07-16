import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUnifiedAuthContext } from '@/contexts/UnifiedAuthContext';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useAuthing } from '@/hooks/useAuthing';
import { RefreshCw, User, Shield, AlertCircle } from 'lucide-react';

/**
 * 认证状态测试页面
 * 用于调试认证状态同步问题
 */
export default function AuthStatusTestPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  
  // 获取各种认证状态
  const unifiedAuth = useUnifiedAuthContext();
  const authing = useAuthing();

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">认证状态测试页面</h1>
        <Button onClick={refreshData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新状态
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* AuthContext 状态 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              AuthContext 状态
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={unifiedAuth.isAuthenticated ? "default" : "secondary"}>
                {unifiedAuth.isAuthenticated ? "已认证" : "未认证"}
              </Badge>
              {unifiedAuth.loading && <Badge variant="outline">加载中</Badge>}
            </div>
            
            {unifiedAuth.user ? (
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>用户ID:</strong> {unifiedAuth.user.id}
                </div>
                <div className="text-sm">
                  <strong>用户名:</strong> {unifiedAuth.user.username || 'N/A'}
                </div>
                <div className="text-sm">
                  <strong>邮箱:</strong> {unifiedAuth.user.email || 'N/A'}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                无用户信息
              </div>
            )}
          </CardContent>
        </Card>

        {/* UnifiedAuth 状态 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              UnifiedAuth 状态
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={unifiedAuth.isAuthenticated ? "default" : "secondary"}>
                {unifiedAuth.isAuthenticated ? "已认证" : "未认证"}
              </Badge>
              {unifiedAuth.loading && <Badge variant="outline">加载中</Badge>}
            </div>
            
            {unifiedAuth.user ? (
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>用户ID:</strong> {unifiedAuth.user.id}
                </div>
                <div className="text-sm">
                  <strong>用户名:</strong> {unifiedAuth.user.username || 'N/A'}
                </div>
                <div className="text-sm">
                  <strong>邮箱:</strong> {unifiedAuth.user.email || 'N/A'}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                无用户信息
              </div>
            )}
          </CardContent>
        </Card>

        {/* Authing 状态 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Authing 状态
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={authing.isLoggedIn ? "default" : "secondary"}>
                {authing.isLoggedIn ? "已登录" : "未登录"}
              </Badge>
              {authing.loading && <Badge variant="outline">加载中</Badge>}
            </div>
            
            {authing.user ? (
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>用户ID:</strong> {authing.user.id}
                </div>
                <div className="text-sm">
                  <strong>用户名:</strong> {authing.user.username || 'N/A'}
                </div>
                <div className="text-sm">
                  <strong>邮箱:</strong> {authing.user.email || 'N/A'}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                无用户信息
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 状态对比 */}
      <Card>
        <CardHeader>
          <CardTitle>状态对比分析</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="font-medium">状态类型</div>
              <div className="font-medium">AuthContext</div>
              <div className="font-medium">UnifiedAuth</div>
              <div className="font-medium">Authing</div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>认证状态</div>
              <div>{unifiedAuth.isAuthenticated ? "✅" : "❌"}</div>
              <div>{unifiedAuth.isAuthenticated ? "✅" : "❌"}</div>
              <div>{authing.isLoggedIn ? "✅" : "❌"}</div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>用户ID</div>
              <div>{unifiedAuth.user?.id || 'N/A'}</div>
              <div>{unifiedAuth.user?.id || 'N/A'}</div>
              <div>{authing.user?.id || 'N/A'}</div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>加载状态</div>
              <div>{unifiedAuth.loading ? "⏳" : "✅"}</div>
              <div>{unifiedAuth.loading ? "⏳" : "✅"}</div>
              <div>{authing.loading ? "⏳" : "✅"}</div>
            </div>
          </div>
          
          {/* 问题诊断 */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2">问题诊断</h3>
            <div className="space-y-1 text-sm text-yellow-700">
              {unifiedAuth.isAuthenticated !== authing.isLoggedIn && (
                <div>⚠️ UnifiedAuth 和 Authing 认证状态不一致</div>
              )}
              {unifiedAuth.user?.id !== authing.user?.id && (
                <div>⚠️ UnifiedAuth 和 Authing 用户ID不一致</div>
              )}
              {unifiedAuth.user?.id === 'temp-user-id' && (
                <div>⚠️ 正在使用临时用户ID，可能未正确登录</div>
              )}
              {!unifiedAuth.isAuthenticated && !authing.isLoggedIn && (
                <div>✅ 所有认证状态一致：用户未登录</div>
              )}
              {unifiedAuth.isAuthenticated && authing.isLoggedIn && 
               unifiedAuth.user?.id === authing.user?.id && (
                <div>✅ 所有认证状态一致：用户已正确登录</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <Card>
        <CardHeader>
          <CardTitle>测试操作</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={() => unifiedAuth.refreshUser()}
              variant="outline"
            >
              刷新 UnifiedAuth 用户信息
            </Button>
            <Button 
              onClick={() => authing.checkLoginStatus()}
              variant="outline"
            >
              检查 Authing 登录状态
            </Button>
            <Button 
              onClick={() => authing.getCurrentUser()}
              variant="outline"
            >
              获取 Authing 当前用户
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 