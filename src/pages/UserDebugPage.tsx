import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UserDebugPage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">用户数据调试页面</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>认证状态</CardTitle>
          </CardHeader>
          <CardContent>
            <p>已认证: {isAuthenticated ? '是' : '否'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>完整用户数据</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-xs bg-muted p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(user, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>关键字段提取</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>user?.subscription?.tier: <strong>{user?.subscription?.tier || '未定义'}</strong></p>
              <p>user?.tier: <strong>{user?.tier || '未定义'}</strong></p>
              <p>user?.vipLevel: <strong>{user?.vipLevel || '未定义'}</strong></p>
              <p>user?.isVip: <strong>{user?.isVip ? '是' : '否'}</strong></p>
              <p>user?.subscription: <strong>{JSON.stringify(user?.subscription) || '未定义'}</strong></p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>所有可能的premium相关字段搜索</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs">
              {user && Object.keys(user).map(key => {
                const value = (user as any)[key];
                const lowerKey = key.toLowerCase();
                if (lowerKey.includes('premium') || lowerKey.includes('vip') || lowerKey.includes('tier') || lowerKey.includes('subscription') || lowerKey.includes('plan')) {
                  return (
                    <p key={key}>
                      <strong>{key}</strong>: {JSON.stringify(value)}
                    </p>
                  );
                }
                return null;
              }).filter(Boolean)}
              
              <h4 className="font-bold mt-4">搜索包含'premium'或'高级'的值：</h4>
              {user && Object.entries(user).map(([key, value]) => {
                const strValue = JSON.stringify(value).toLowerCase();
                if (strValue.includes('premium') || strValue.includes('高级')) {
                  return (
                    <p key={key} className="text-green-600">
                      <strong>🎯 {key}</strong>: {JSON.stringify(value)}
                    </p>
                  );
                }
                return null;
              }).filter(Boolean)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}