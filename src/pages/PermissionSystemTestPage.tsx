/**
 * ✅ FIXED: 2025-01-05 创建权限系统测试页面
 * 📌 请勿再修改该逻辑，已封装稳定。如需改动请单独重构新模块。
 */

import React, { useState } from 'react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { usePermission } from '@/hooks/usePermission';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Shield, Lock, CheckCircle, XCircle } from 'lucide-react';

const PermissionSystemTestPage: React.FC = () => {
  const { user, isAuthenticated, login, logout } = useUnifiedAuth();
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const authPermission = usePermission('auth:required');
  const vipPermission = usePermission('vip:required');
  const adminPermission = usePermission('admin:required');
  const creativeStudioPermission = usePermission('feature:creative-studio');
  const brandLibraryPermission = usePermission('feature:brand-library');
  const contentExtractorPermission = usePermission('feature:content-extractor');
  const permissionTests = [
    { name: '基础认证权限', key: 'auth:required', permission: authPermission, description: '检查用户是否已登录', icon: <User className="h-4 w-4" /> },
    { name: 'VIP权限', key: 'vip:required', permission: vipPermission, description: '检查用户是否具有VIP权限', icon: <Shield className="h-4 w-4" /> },
    { name: '管理员权限', key: 'admin:required', permission: adminPermission, description: '检查用户是否具有管理员权限', icon: <Lock className="h-4 w-4" /> },
    { name: '创意魔方功能', key: 'feature:creative-studio', permission: creativeStudioPermission, description: '检查用户是否有创意魔方功能权限', icon: <CheckCircle className="h-4 w-4" /> },
    { name: '品牌库功能', key: 'feature:brand-library', permission: brandLibraryPermission, description: '检查用户是否有品牌库功能权限', icon: <CheckCircle className="h-4 w-4" /> },
    { name: '内容提取器功能', key: 'feature:content-extractor', permission: contentExtractorPermission, description: '检查用户是否有内容提取器功能权限', icon: <CheckCircle className="h-4 w-4" /> }
  ];
  const runPermissionTests = () => {
    const results: Record<string, any> = {};
    permissionTests.forEach(test => {
      results[test.key] = {
        pass: test.permission.pass,
        reason: test.permission.reason,
        details: test.permission.details,
        timestamp: new Date().toISOString()
      };
    });
    setTestResults(results);
    console.log('🔐 权限测试结果:', results);
  };
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6" /> 权限守卫系统测试页面
            </CardTitle>
            <CardDescription>测试和验证权限守卫系统的各项功能</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-lg">用户状态</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between"><span>认证状态:</span><Badge variant={isAuthenticated ? "default" : "secondary"}>{isAuthenticated ? "已登录" : "未登录"}</Badge></div>
                    {user && (<><div className="flex items-center justify-between"><span>用户ID:</span><span className="text-sm font-mono">{user.id}</span></div><div className="flex items-center justify-between"><span>昵称:</span><span>{user.nickname || '未设置'}</span></div><div className="flex items-center justify-between"><span>角色:</span><span className="text-sm">{user.roles?.join(', ') || '无'}</span></div><div className="flex items-center justify-between"><span>权限:</span><span className="text-sm">{user.permissions?.join(', ') || '无'}</span></div></>)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-lg">操作面板</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {!isAuthenticated ? (<Button onClick={() => login()} className="w-full">登录测试</Button>) : (<Button onClick={() => logout()} variant="outline" className="w-full">登出测试</Button>)}
                    <Button onClick={runPermissionTests} className="w-full">运行权限测试</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-4">权限检查结果</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {permissionTests.map((test) => (<Card key={test.key}><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2">{test.icon}{test.name}</CardTitle><CardDescription className="text-sm">{test.description}</CardDescription></CardHeader><CardContent><div className="space-y-2"><div className="flex items-center justify-between"><span>状态:</span><Badge variant={test.permission.pass ? "default" : "destructive"}>{test.permission.pass ? "通过" : "拒绝"}</Badge></div><div className="text-sm text-muted-foreground">{test.permission.reason}</div>{testResults[test.key] && (<div className="text-xs text-muted-foreground">测试时间: {new Date(testResults[test.key].timestamp).toLocaleTimeString()}</div>)}</div></CardContent></Card>))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PermissionSystemTestPage; 