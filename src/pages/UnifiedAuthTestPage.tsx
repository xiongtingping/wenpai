/**
 * 统一认证测试页面
 * 展示Authing和自建后台功能的测试
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUnifiedAuthContext } from '@/contexts/UnifiedAuthContext';
import { 
  User, 
  Lock, 
  Mail, 
  Phone, 
  Gift, 
  Users, 
  Activity, 
  CreditCard,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

/**
 * 统一认证测试页面组件
 * @returns React组件
 */
export default function UnifiedAuthTestPage() {
  const {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    updateUserInfo,
    getUserRoles,
    assignRole,
    generateInviteLink,
    bindInviteRelation,
    processInviteReward,
    distributeMonthlyUsage,
    getUserBalance,
    updateUserBalance,
    getInviteRelations,
    getUserUsage,
    recordUserAction,
    refreshUser,
    clearError
  } = useUnifiedAuthContext();

  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [testLoading, setTestLoading] = useState<Record<string, boolean>>({});

  // 测试表单状态
  const [loginForm, setLoginForm] = useState({
    email: 'test@example.com',
    password: 'password123'
  });

  const [registerForm, setRegisterForm] = useState({
    email: 'newuser@example.com',
    nickname: '新用户',
    code: '123456'
  });

  const [inviteForm, setInviteForm] = useState({
    inviterId: 'test-inviter-id',
    inviteeId: 'test-invitee-id'
  });

  /**
   * 执行测试
   */
  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    setTestLoading(prev => ({ ...prev, [testName]: true }));
    setTestResults(prev => ({ ...prev, [testName]: null }));

    try {
      const result = await testFunction();
      setTestResults(prev => ({ ...prev, [testName]: { success: true, data: result } }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [testName]: { 
          success: false, 
          error: error instanceof Error ? error.message : '未知错误' 
        } 
      }));
    } finally {
      setTestLoading(prev => ({ ...prev, [testName]: false }));
    }
  };

  /**
   * 复制到剪贴板
   */
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('已复制到剪贴板');
    } catch (error) {
      alert('复制失败');
    }
  };

  /**
   * 渲染测试结果
   */
  const renderTestResult = (testName: string) => {
    const result = testResults[testName];
    const isLoading = testLoading[testName];

    if (isLoading) {
      return (
        <div className="flex items-center gap-2 text-blue-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>测试中...</span>
        </div>
      );
    }

    if (!result) {
      return <span className="text-gray-500">未测试</span>;
    }

    if (result.success) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span>成功</span>
          {result.data && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(JSON.stringify(result.data, null, 2))}
            >
              <Copy className="w-3 h-3 mr-1" />
              复制结果
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle className="w-4 h-4" />
        <span>{result.error}</span>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">统一认证系统测试</h1>
          <p className="text-gray-600">
            测试Authing和自建后台功能的统一接口
          </p>
        </div>

        {/* 当前状态 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              当前状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">认证状态:</span>
                <Badge variant={isAuthenticated ? "default" : "secondary"}>
                  {isAuthenticated ? "已登录" : "未登录"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">加载状态:</span>
                <Badge variant={loading ? "default" : "secondary"}>
                  {loading ? "加载中" : "就绪"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">用户ID:</span>
                <span className="font-mono text-sm">{user?.id || "无"}</span>
              </div>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">错误:</span>
                  <span>{error}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={clearError}
                >
                  清除错误
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="authing" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="authing">Authing功能</TabsTrigger>
            <TabsTrigger value="backend">自建后台功能</TabsTrigger>
          </TabsList>

          {/* Authing功能测试 */}
          <TabsContent value="authing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  用户认证测试
                </CardTitle>
                <CardDescription>
                  测试Authing的登录、注册、登出等功能
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 登录测试 */}
                <div className="space-y-4">
                  <h4 className="font-medium">登录测试</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="login-email">邮箱</Label>
                      <Input
                        id="login-email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="test@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="login-password">密码</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="password123"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() => runTest('login', () => login('password', loginForm))}
                      disabled={testLoading['login']}
                    >
                      {testLoading['login'] && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      测试登录
                    </Button>
                    {renderTestResult('login')}
                  </div>
                </div>

                <Separator />

                {/* 注册测试 */}
                <div className="space-y-4">
                  <h4 className="font-medium">注册测试</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="register-email">邮箱</Label>
                      <Input
                        id="register-email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="newuser@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-nickname">昵称</Label>
                      <Input
                        id="register-nickname"
                        value={registerForm.nickname}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, nickname: e.target.value }))}
                        placeholder="新用户"
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-code">验证码</Label>
                      <Input
                        id="register-code"
                        value={registerForm.code}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, code: e.target.value }))}
                        placeholder="123456"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() => runTest('register', () => register('email', registerForm))}
                      disabled={testLoading['register']}
                    >
                      {testLoading['register'] && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      测试注册
                    </Button>
                    {renderTestResult('register')}
                  </div>
                </div>

                <Separator />

                {/* 其他Authing功能测试 */}
                <div className="space-y-4">
                  <h4 className="font-medium">其他功能测试</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => runTest('getUserRoles', getUserRoles)}
                        disabled={testLoading['getUserRoles']}
                      >
                        {testLoading['getUserRoles'] && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        获取用户角色
                      </Button>
                      {renderTestResult('getUserRoles')}
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => runTest('assignRole', () => assignRole('pro'))}
                        disabled={testLoading['assignRole']}
                      >
                        {testLoading['assignRole'] && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        分配角色
                      </Button>
                      {renderTestResult('assignRole')}
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => runTest('refreshToken', refreshUser)}
                        disabled={testLoading['refreshToken']}
                      >
                        {testLoading['refreshToken'] && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        刷新Token
                      </Button>
                      {renderTestResult('refreshToken')}
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="destructive"
                        onClick={() => runTest('logout', logout)}
                        disabled={testLoading['logout']}
                      >
                        {testLoading['logout'] && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        登出
                      </Button>
                      {renderTestResult('logout')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 自建后台功能测试 */}
          <TabsContent value="backend" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  自建后台功能测试
                </CardTitle>
                <CardDescription>
                  测试邀请、余额、使用次数等自建后台功能
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 邀请功能测试 */}
                <div className="space-y-4">
                  <h4 className="font-medium">邀请功能测试</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => runTest('generateInviteLink', generateInviteLink)}
                        disabled={testLoading['generateInviteLink']}
                      >
                        {testLoading['generateInviteLink'] && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        生成邀请链接
                      </Button>
                      {renderTestResult('generateInviteLink')}
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => runTest('bindInviteRelation', () => bindInviteRelation(inviteForm.inviterId, inviteForm.inviteeId))}
                        disabled={testLoading['bindInviteRelation']}
                      >
                        {testLoading['bindInviteRelation'] && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        绑定邀请关系
                      </Button>
                      {renderTestResult('bindInviteRelation')}
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => runTest('processInviteReward', () => processInviteReward(inviteForm.inviterId, inviteForm.inviteeId))}
                        disabled={testLoading['processInviteReward']}
                      >
                        {testLoading['processInviteReward'] && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        处理邀请奖励
                      </Button>
                      {renderTestResult('processInviteReward')}
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => runTest('getInviteRelations', getInviteRelations)}
                        disabled={testLoading['getInviteRelations']}
                      >
                        {testLoading['getInviteRelations'] && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        获取邀请关系
                      </Button>
                      {renderTestResult('getInviteRelations')}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 余额和使用次数测试 */}
                <div className="space-y-4">
                  <h4 className="font-medium">余额和使用次数测试</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => runTest('getUserBalance', getUserBalance)}
                        disabled={testLoading['getUserBalance']}
                      >
                        {testLoading['getUserBalance'] && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        获取用户余额
                      </Button>
                      {renderTestResult('getUserBalance')}
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => runTest('updateUserBalance', () => updateUserBalance({ points: 100 }))}
                        disabled={testLoading['updateUserBalance']}
                      >
                        {testLoading['updateUserBalance'] && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        更新用户余额
                      </Button>
                      {renderTestResult('updateUserBalance')}
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => runTest('getUserUsage', getUserUsage)}
                        disabled={testLoading['getUserUsage']}
                      >
                        {testLoading['getUserUsage'] && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        获取使用情况
                      </Button>
                      {renderTestResult('getUserUsage')}
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => runTest('distributeMonthlyUsage', () => distributeMonthlyUsage('pro'))}
                        disabled={testLoading['distributeMonthlyUsage']}
                      >
                        {testLoading['distributeMonthlyUsage'] && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        发放月度次数
                      </Button>
                      {renderTestResult('distributeMonthlyUsage')}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 用户行为记录测试 */}
                <div className="space-y-4">
                  <h4 className="font-medium">用户行为记录测试</h4>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => runTest('recordUserAction', () => recordUserAction('test_action', { test: true }))}
                      disabled={testLoading['recordUserAction']}
                    >
                      {testLoading['recordUserAction'] && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      记录用户行为
                    </Button>
                    {renderTestResult('recordUserAction')}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 用户信息显示 */}
        {user && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                当前用户信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">用户ID</Label>
                  <p className="font-mono text-sm">{user.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">用户名</Label>
                  <p>{user.username}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">昵称</Label>
                  <p>{user.nickname}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">邮箱</Label>
                  <p>{user.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">手机号</Label>
                  <p>{user.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">用户等级</Label>
                  <Badge variant="outline">{user.plan}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 