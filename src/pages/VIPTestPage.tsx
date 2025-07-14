/**
 * VIP功能测试页面
 * 展示VIP权限检查的各种功能和用法
 */

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { VIPGuard, useVIPAccess, checkVIPAccess } from '@/components/auth/VIPGuard';
import { securityUtils } from '@/lib/security';
import { 
  Crown, 
  Shield, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  Zap,
  Star,
  Users,
  Settings,
  RefreshCw
} from 'lucide-react';

/**
 * VIP功能测试页面组件
 * @returns React 组件
 */
export default function VIPTestPage() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { isVip, isAdmin, roles, loading, error, refreshRoles } = useUserRoles({
    autoCheck: true,
    enableSecurityLog: true
  });

  const { hasVIPAccess } = useVIPAccess();
  const [testResults, setTestResults] = useState<any[]>([]);

  /**
   * 添加测试结果
   */
  const addTestResult = (test: string, result: boolean, details?: any) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      test,
      result,
      details,
      timestamp: new Date().toISOString()
    }]);
  };

  /**
   * 测试VIP权限检查
   */
  const testVIPAccess = () => {
    try {
      const result = checkVIPAccess(roles, 'vip');
      addTestResult('VIP权限检查', result, { roles, expectedRole: 'vip' });
      
      toast({
        title: result ? "权限检查通过" : "权限检查失败",
        description: result ? "您拥有VIP权限" : "您没有VIP权限",
        variant: result ? "default" : "destructive"
      });
    } catch (error) {
      addTestResult('VIP权限检查', false, { error: error instanceof Error ? error.message : '未知错误' });
    }
  };

  /**
   * 测试角色刷新
   */
  const testRoleRefresh = async () => {
    try {
      await refreshRoles();
      addTestResult('角色刷新', true, { roles: roles });
      
      toast({
        title: "角色刷新成功",
        description: "用户角色信息已更新",
      });
    } catch (error) {
      addTestResult('角色刷新', false, { error: error instanceof Error ? error.message : '未知错误' });
      
      toast({
        title: "角色刷新失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };

  /**
   * 测试安全日志
   */
  const testSecurityLog = () => {
    try {
      securityUtils.secureLog('VIP测试页面安全日志测试', {
        userId: user?.id,
        isVip,
        isAdmin,
        roles,
        timestamp: new Date().toISOString()
      });
      
      addTestResult('安全日志', true, { message: '安全日志记录成功' });
      
      toast({
        title: "安全日志测试",
        description: "安全日志记录成功",
      });
    } catch (error) {
      addTestResult('安全日志', false, { error: error instanceof Error ? error.message : '未知错误' });
    }
  };

  /**
   * 清除测试结果
   */
  const clearTestResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">VIP功能测试页面</h1>
          <p className="text-xl text-gray-600 mb-6">
            测试VIP权限检查、角色管理和安全日志功能
          </p>
        </div>

        {/* 用户状态信息 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              用户状态信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">登录状态：</span>
                  <Badge variant={isAuthenticated ? "default" : "secondary"}>
                    {isAuthenticated ? "已登录" : "未登录"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">用户ID：</span>
                  <span className="font-mono text-sm">{user?.id || "未登录"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">用户名：</span>
                  <span>{user?.nickname || user?.username || "未登录"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">邮箱：</span>
                  <span>{user?.email || "未设置"}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">VIP状态：</span>
                  <Badge variant={isVip ? "default" : "secondary"}>
                    {isVip ? "VIP用户" : "普通用户"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">管理员：</span>
                  <Badge variant={isAdmin ? "default" : "secondary"}>
                    {isAdmin ? "是" : "否"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">VIP权限：</span>
                  <Badge variant={hasVIPAccess ? "default" : "secondary"}>
                    {hasVIPAccess ? "有权限" : "无权限"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">用户角色：</span>
                  <div className="flex gap-1">
                    {roles.map((role, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 功能测试区域 */}
        <Tabs defaultValue="vip-guard" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vip-guard">VIP权限保护</TabsTrigger>
            <TabsTrigger value="role-test">角色测试</TabsTrigger>
            <TabsTrigger value="security-test">安全测试</TabsTrigger>
          </TabsList>

          {/* VIP权限保护测试 */}
          <TabsContent value="vip-guard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  VIP权限保护组件测试
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  测试VIP权限保护组件的各种功能，包括权限检查、重定向和升级提示。
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 完整VIP保护组件 */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">完整VIP保护</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      包含权限检查、升级提示和重定向功能
                    </p>
                    <VIPGuard
                      redirectTo="/payment"
                      showUpgradePrompt={true}
                      onAccessGranted={() => {
                        toast({
                          title: "权限验证通过",
                          description: "您拥有访问此功能的权限",
                        });
                      }}
                      onAccessDenied={() => {
                        toast({
                          title: "权限被拒绝",
                          description: "您没有访问此功能的权限",
                          variant: "destructive"
                        });
                      }}
                    >
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">VIP权限验证通过，此内容仅VIP用户可见</span>
                        </div>
                      </div>
                    </VIPGuard>
                  </div>

                  {/* 简化VIP保护组件 */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">简化VIP保护</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      仅进行权限检查，无升级提示
                    </p>
                    <VIPGuard
                      redirectTo="/payment"
                      showUpgradePrompt={false}
                    >
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <div className="flex items-center gap-2 text-blue-700">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">简化权限验证通过</span>
                        </div>
                      </div>
                    </VIPGuard>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 角色测试 */}
          <TabsContent value="role-test" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  角色管理测试
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  测试用户角色获取、刷新和权限检查功能。
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={testVIPAccess}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    测试VIP权限检查
                  </Button>
                  
                  <Button
                    onClick={testRoleRefresh}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    刷新角色信息
                  </Button>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <div className="flex items-center gap-2 text-red-700">
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm">错误: {error}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 安全测试 */}
          <TabsContent value="security-test" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  安全功能测试
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  测试安全日志记录和权限验证功能。
                </p>
                
                <Button
                  onClick={testSecurityLog}
                  className="flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  测试安全日志
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 测试结果 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                测试结果
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={clearTestResults}
              >
                清除结果
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <p className="text-gray-500 text-center py-8">暂无测试结果</p>
            ) : (
              <div className="space-y-3">
                {testResults.map((result) => (
                  <div
                    key={result.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      result.result ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {result.result ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <div>
                        <div className="font-medium">{result.test}</div>
                        {result.details && (
                          <div className="text-sm text-gray-600">
                            {typeof result.details === 'object' 
                              ? JSON.stringify(result.details, null, 2)
                              : result.details
                            }
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 使用说明 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              使用说明
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-purple-600">VIP权限保护组件</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    自动检查用户VIP权限
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    支持自定义重定向路径
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    可配置升级提示显示
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    支持权限检查回调
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-blue-600">角色管理功能</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    实时获取用户角色
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    支持角色刷新
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    权限状态管理
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    安全日志记录
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 