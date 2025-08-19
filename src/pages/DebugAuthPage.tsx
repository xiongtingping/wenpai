/**
 * 调试认证配置页面
 * 用于检查生产环境的认证配置问题
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAuthConfig } from '@/auth/config';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { getRegisterUrlFast } from '@/utils/authingRegisterHelper';
import { genRandom } from '@/utils/crypto';

export const DebugAuthPage: React.FC = () => {
  const { register } = useUnifiedAuth();
  const [debugInfo, setDebugInfo] = React.useState<any>(null);

  React.useEffect(() => {
    // 获取当前配置信息
    const cfg = getAuthConfig();
    
    // 生成测试注册URL
    const state = JSON.stringify({ redirectTo: '/', timestamp: Date.now() });
    const challenge = 'test_challenge_123';
    const nonce = genRandom(16);
    
    const testRegisterUrl = getRegisterUrlFast({
      appId: cfg.appId,
      host: cfg.host,
      redirectUri: cfg.redirectUri,
      state,
      codeChallenge: challenge,
      nonce
    });

    setDebugInfo({
      config: cfg,
      environment: {
        NODE_ENV: import.meta.env.NODE_ENV,
        PROD: import.meta.env.PROD,
        DEV: import.meta.env.DEV,
        hostname: window.location.hostname,
        origin: window.location.origin
      },
      envVars: {
        VITE_AUTHING_APP_ID: import.meta.env.VITE_AUTHING_APP_ID,
        VITE_AUTHING_DOMAIN: import.meta.env.VITE_AUTHING_DOMAIN,
        VITE_AUTHING_HOST: import.meta.env.VITE_AUTHING_HOST,
        VITE_AUTHING_CLIENT_ID: import.meta.env.VITE_AUTHING_CLIENT_ID
      },
      testRegisterUrl,
      localStorage: {
        authing_user: localStorage.getItem('authing_user'),
        auth_token: localStorage.getItem('auth_token'),
        authing_access_token: localStorage.getItem('authing_access_token')
      }
    });
  }, []);

  const handleTestRegister = () => {
    console.log('🧪 测试注册流程...');
    console.log('🔧 当前配置:', debugInfo?.config);
    register();
  };

  const handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  if (!debugInfo) {
    return <div className="p-8">加载调试信息...</div>;
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">认证配置调试</h1>
        <p className="text-muted-foreground mt-2">检查生产环境的认证配置问题</p>
      </div>

      {/* 当前配置 */}
      <Card>
        <CardHeader>
          <CardTitle>当前认证配置</CardTitle>
          <CardDescription>从getAuthConfig()获取的配置信息</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">App ID:</span>
              <Badge variant={debugInfo.config.appId === '68823897631e1ef8ff3720b2' ? 'default' : 'destructive'}>
                {debugInfo.config.appId}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Host:</span>
              <span className="text-sm">{debugInfo.config.host}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Redirect URI:</span>
              <span className="text-sm">{debugInfo.config.redirectUri}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 环境变量 */}
      <Card>
        <CardHeader>
          <CardTitle>环境变量</CardTitle>
          <CardDescription>从import.meta.env获取的环境变量</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(debugInfo.envVars).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="font-medium">{key}:</span>
                <Badge variant={value ? 'default' : 'secondary'}>
                  {value || '未设置'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 环境信息 */}
      <Card>
        <CardHeader>
          <CardTitle>运行环境</CardTitle>
          <CardDescription>当前运行环境信息</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(debugInfo.environment).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="font-medium">{key}:</span>
                <span className="text-sm">{String(value)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 测试注册URL */}
      <Card>
        <CardHeader>
          <CardTitle>测试注册URL</CardTitle>
          <CardDescription>生成的注册URL预览</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-mono break-all">{debugInfo.testRegisterUrl}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleTestRegister}>
                测试注册流程
              </Button>
              <Button variant="outline" onClick={() => window.open(debugInfo.testRegisterUrl, '_blank')}>
                在新窗口打开
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 本地存储 */}
      <Card>
        <CardHeader>
          <CardTitle>本地存储</CardTitle>
          <CardDescription>当前的认证相关存储信息</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(debugInfo.localStorage).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="font-medium">{key}:</span>
                <Badge variant={value ? 'default' : 'secondary'}>
                  {value ? '已设置' : '未设置'}
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="destructive" onClick={handleClearCache}>
              清除所有缓存
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 问题检查 */}
      <Card>
        <CardHeader>
          <CardTitle>问题检查</CardTitle>
          <CardDescription>自动检查常见配置问题</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>App ID是否正确:</span>
              <Badge variant={debugInfo.config.appId === '68823897631e1ef8ff3720b2' ? 'default' : 'destructive'}>
                {debugInfo.config.appId === '68823897631e1ef8ff3720b2' ? '✅ 正确' : '❌ 错误'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>是否包含错误App ID:</span>
              <Badge variant={debugInfo.testRegisterUrl.includes('688237f8f58e454393add99e') ? 'destructive' : 'default'}>
                {debugInfo.testRegisterUrl.includes('688237f8f58e454393add99e') ? '❌ 包含错误ID' : '✅ 无错误ID'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>环境变量配置:</span>
              <Badge variant={debugInfo.envVars.VITE_AUTHING_APP_ID ? 'default' : 'secondary'}>
                {debugInfo.envVars.VITE_AUTHING_APP_ID ? '✅ 已配置' : '⚠️ 未配置'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
