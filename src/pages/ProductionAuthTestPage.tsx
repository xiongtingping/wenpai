import React, { useState, useEffect } from 'react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * 生产环境 Authing 测试页面
 * 专门用于测试生产环境下的登录功能
 */
export default function ProductionAuthTestPage() {
  const { user, isAuthenticated, loading, error, login, logout } = useUnifiedAuth();
  const [envInfo, setEnvInfo] = useState<any>(null);
  const [authingConfig, setAuthingConfig] = useState<any>(null);

  // 检测环境信息
  useEffect(() => {
    const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost';
    const isDevelopment = import.meta.env.DEV;
    
    setEnvInfo({
      isProduction,
      isDevelopment,
      hostname: window.location.hostname,
      origin: window.location.origin,
      mode: import.meta.env.MODE,
      nodeEnv: import.meta.env.NODE_ENV
    });

    // 获取 Authing 配置
    import('@/config/authing').then(module => {
      const config = module.getAuthingConfig();
      setAuthingConfig(config);
    });
  }, []);

  const handleTestLogin = async () => {
    try {
      console.log('🧪 生产环境测试登录按钮被点击');
      await login();
    } catch (error) {
      console.error('🧪 生产环境测试登录失败:', error);
    }
  };

  const handleTestLogout = async () => {
    try {
      console.log('🧪 生产环境测试登出按钮被点击');
      await logout();
    } catch (error) {
      console.error('🧪 生产环境测试登出失败:', error);
    }
  };

  const getEnvironmentBadge = () => {
    if (envInfo?.isProduction) {
      return <Badge variant="destructive">生产环境</Badge>;
    } else if (envInfo?.isDevelopment) {
      return <Badge variant="default">开发环境</Badge>;
    } else {
      return <Badge variant="secondary">未知环境</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              生产环境 Authing 登录测试
              {getEnvironmentBadge()}
            </CardTitle>
            <CardDescription>
              专门用于测试生产环境下的 Authing Guard 登录功能
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* 环境信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">环境信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">是否生产环境:</span>{' '}
                    <span className={envInfo?.isProduction ? 'text-red-600' : 'text-green-600'}>
                      {envInfo?.isProduction ? '是' : '否'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">主机名:</span> {envInfo?.hostname}
                  </div>
                  <div>
                    <span className="font-medium">源地址:</span> {envInfo?.origin}
                  </div>
                  <div>
                    <span className="font-medium">构建模式:</span> {envInfo?.mode}
                  </div>
                  <div>
                    <span className="font-medium">NODE_ENV:</span> {envInfo?.nodeEnv}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Authing 配置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">App ID:</span>{' '}
                    <span className="font-mono text-xs">{authingConfig?.appId}</span>
                  </div>
                  <div>
                    <span className="font-medium">域名:</span> {authingConfig?.domain}
                  </div>
                  <div>
                    <span className="font-medium">主机:</span> {authingConfig?.host}
                  </div>
                  <div>
                    <span className="font-medium">回调地址:</span>{' '}
                    <span className="font-mono text-xs">{authingConfig?.redirectUri}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 认证状态 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">认证状态</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">登录状态:</span>{' '}
                    <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                      {isAuthenticated ? '已登录' : '未登录'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">加载状态:</span>{' '}
                    <span className={loading ? 'text-yellow-600' : 'text-gray-600'}>
                      {loading ? '加载中...' : '空闲'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">用户ID:</span>{' '}
                    <span className="font-mono text-xs">{user?.id || '无'}</span>
                  </div>
                  <div>
                    <span className="font-medium">用户名:</span> {user?.nickname || user?.username || '无'}
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <strong>错误:</strong> {error}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* 用户信息 */}
            {user && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">用户详细信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-4">
              {!isAuthenticated ? (
                <Button 
                  onClick={handleTestLogin}
                  disabled={loading}
                  className="flex-1"
                  size="lg"
                >
                  {loading ? '登录中...' : '🧪 测试生产环境登录'}
                </Button>
              ) : (
                <Button 
                  onClick={handleTestLogout}
                  variant="outline"
                  disabled={loading}
                  className="flex-1"
                  size="lg"
                >
                  {loading ? '登出中...' : '🧪 测试生产环境登出'}
                </Button>
              )}
            </div>

            {/* 生产环境特殊提示 */}
            {envInfo?.isProduction && (
              <Alert>
                <AlertDescription>
                  <strong>生产环境提示:</strong> 
                  当前正在生产环境中测试 Authing 登录功能。请确保：
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Authing 控制台中已正确配置回调地址: {authingConfig?.redirectUri}</li>
                    <li>生产环境的环境变量已正确设置</li>
                    <li>网络连接正常，可以访问 Authing 服务</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* 调试信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">调试信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>请打开浏览器控制台查看详细日志</div>
                <div>点击测试按钮应该弹出 Authing Guard 登录窗口</div>
                <div>如果弹窗没有出现，请检查控制台错误信息</div>
                <div className="text-muted-foreground">
                  生产环境下可能需要更长的加载时间，请耐心等待
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
