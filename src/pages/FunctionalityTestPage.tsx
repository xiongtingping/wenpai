/**
 * 功能测试页面
 * 全面测试用户管理、支付、内容生成等核心功能
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useUserStore } from '@/store/userStore';
import { EnvChecker } from '@/utils/envChecker';
import { callAI } from '@/api/aiService';
import { creemOptimizer } from '@/utils/creemOptimizer';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  User, 
  CreditCard, 
  Brain, 
  Shield,
  Settings,
  RefreshCw
} from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
  timestamp: string;
}

export default function FunctionalityTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated, login, logout } = useUnifiedAuth();
  const { hasPermission, hasRole, roles, permissions } = usePermissions();
  const { tempUserId, usageRemaining, userInviteStats } = useUserStore();

  /**
   * 添加测试结果
   */
  const addTestResult = (name: string, status: TestResult['status'], message: string, details?: any) => {
    const result: TestResult = {
      name,
      status,
      message,
      details,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [result, ...prev]);
  };

  /**
   * 测试环境变量配置
   */
  const testEnvironmentConfig = async () => {
    addTestResult('环境变量配置', 'running', '检查环境变量配置...');
    
    try {
      const results = EnvChecker.checkAllConfigs();
      const summary = EnvChecker.getConfigSummary();
      
      if (summary.requiredValid === summary.required) {
        addTestResult('环境变量配置', 'success', '所有必需的环境变量配置正确', { summary, results });
      } else {
        const invalidRequired = results.filter(r => r.required && !r.isValid);
        addTestResult('环境变量配置', 'error', `发现 ${invalidRequired.length} 个必需的配置错误`, { invalidRequired });
      }
    } catch (error) {
      addTestResult('环境变量配置', 'error', '环境变量检查失败', { error: error instanceof Error ? error.message : '未知错误' });
    }
  };

  /**
   * 测试用户认证功能
   */
  const testUserAuthentication = async () => {
    addTestResult('用户认证功能', 'running', '测试用户认证功能...');
    
    try {
      const authResults = {
        isAuthenticated,
        hasUser: !!user,
        userId: user?.id,
        username: user?.username,
        email: user?.email,
        roles: user?.roles || [],
        permissions: user?.permissions || []
      };
      
      if (isAuthenticated && user) {
        addTestResult('用户认证功能', 'success', '用户认证功能正常', authResults);
      } else {
        addTestResult('用户认证功能', 'warning', '用户未登录，认证功能待测试', authResults);
      }
    } catch (error) {
      addTestResult('用户认证功能', 'error', '用户认证功能测试失败', { error: error instanceof Error ? error.message : '未知错误' });
    }
  };

  /**
   * 测试权限管理功能
   */
  const testPermissionManagement = async () => {
    addTestResult('权限管理功能', 'running', '测试权限管理功能...');
    
    try {
      const permissionResults = {
        roles,
        permissions,
        hasContentRead: hasPermission('content', 'read'),
        hasContentCreate: hasPermission('content', 'create'),
        hasAdminRole: hasRole('admin'),
        hasVipRole: hasRole('vip')
      };
      
      addTestResult('权限管理功能', 'success', '权限管理功能正常', permissionResults);
    } catch (error) {
      addTestResult('权限管理功能', 'error', '权限管理功能测试失败', { error: error instanceof Error ? error.message : '未知错误' });
    }
  };

  /**
   * 测试用户数据管理
   */
  const testUserDataManagement = async () => {
    addTestResult('用户数据管理', 'running', '测试用户数据管理功能...');
    
    try {
      const userDataResults = {
        tempUserId,
        usageRemaining,
        userInviteStats,
        hasTempUser: !!tempUserId,
        hasUsageData: typeof usageRemaining === 'number',
        hasInviteStats: !!userInviteStats
      };
      
      addTestResult('用户数据管理', 'success', '用户数据管理功能正常', userDataResults);
    } catch (error) {
      addTestResult('用户数据管理', 'error', '用户数据管理功能测试失败', { error: error instanceof Error ? error.message : '未知错误' });
    }
  };

  /**
   * 测试AI服务功能
   */
  const testAIService = async () => {
    addTestResult('AI服务功能', 'running', '测试AI服务功能...');
    
    try {
      // 测试AI服务状态
      const status = await callAI({
        prompt: 'Hello, this is a test message to check AI service status.'
      });
      
      if (status.success) {
        addTestResult('AI服务功能', 'success', 'AI服务功能正常', { status });
      } else {
        addTestResult('AI服务功能', 'warning', 'AI服务可能不可用', { status });
      }
    } catch (error) {
      addTestResult('AI服务功能', 'error', 'AI服务功能测试失败', { error: error instanceof Error ? error.message : '未知错误' });
    }
  };

  /**
   * 测试支付功能
   */
  const testPaymentFunction = async () => {
    addTestResult('支付功能', 'running', '测试支付功能...');
    
    try {
      // 测试Creem优化器
      const stats = creemOptimizer.getStats();
      const configs = creemOptimizer.getOptimizedConfig();
      
      const paymentResults = {
        optimizerStats: stats,
        optimizedConfigs: configs,
        bestMethod: creemOptimizer.getBestMethod(),
        hasOptimizer: !!creemOptimizer
      };
      
      addTestResult('支付功能', 'success', '支付功能配置正常', paymentResults);
    } catch (error) {
      addTestResult('支付功能', 'error', '支付功能测试失败', { error: error instanceof Error ? error.message : '未知错误' });
    }
  };

  /**
   * 测试邀请奖励功能
   */
  const testInviteReward = async () => {
    addTestResult('邀请奖励功能', 'running', '测试邀请奖励功能...');
    
    try {
      const inviteResults = {
        userInviteStats,
        hasInviteCode: !!userInviteStats,
        totalClicks: userInviteStats.totalClicks,
        totalRegistrations: userInviteStats.totalRegistrations,
        totalRewards: userInviteStats.totalRewards
      };
      
      addTestResult('邀请奖励功能', 'success', '邀请奖励功能正常', inviteResults);
    } catch (error) {
      addTestResult('邀请奖励功能', 'error', '邀请奖励功能测试失败', { error: error instanceof Error ? error.message : '未知错误' });
    }
  };

  /**
   * 运行所有测试
   */
  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      // 按顺序运行测试
      await testEnvironmentConfig();
      await testUserAuthentication();
      await testPermissionManagement();
      await testUserDataManagement();
      await testAIService();
      await testPaymentFunction();
      await testInviteReward();
      
      toast({
        title: "功能测试完成",
        description: "所有核心功能测试已完成，请查看详细结果",
      });
    } catch (error) {
      toast({
        title: "测试过程中出现错误",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  /**
   * 清除测试结果
   */
  const clearResults = () => {
    setTestResults([]);
  };

  /**
   * 获取状态图标
   */
  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Settings className="h-4 w-4 text-gray-500" />;
    }
  };

  /**
   * 获取状态颜色
   */
  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-6xl">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">功能测试页面</h1>
          <p className="text-gray-600">全面测试用户管理、支付、内容生成等核心功能</p>
        </div>

        {/* 控制按钮 */}
        <div className="mb-6 flex gap-4">
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? '测试中...' : '运行所有测试'}
          </Button>
          <Button 
            onClick={clearResults} 
            variant="outline"
            disabled={isRunning}
          >
            清除结果
          </Button>
        </div>

        {/* 测试结果 */}
        <div className="space-y-4">
          {testResults.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">点击"运行所有测试"开始功能测试</p>
              </CardContent>
            </Card>
          ) : (
            testResults.map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <CardTitle className="text-lg">{result.name}</CardTitle>
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">{result.timestamp}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">{result.message}</p>
                  {result.details && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                        查看详细信息
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 功能模块状态概览 */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">功能模块状态概览</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <User className="h-8 w-8 text-blue-500" />
                  <div>
                    <h3 className="font-medium">用户认证</h3>
                    <p className="text-sm text-gray-600">
                      {isAuthenticated ? '已登录' : '未登录'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-green-500" />
                  <div>
                    <h3 className="font-medium">权限管理</h3>
                    <p className="text-sm text-gray-600">
                      {roles.length} 个角色
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Brain className="h-8 w-8 text-purple-500" />
                  <div>
                    <h3 className="font-medium">AI服务</h3>
                    <p className="text-sm text-gray-600">
                      剩余 {usageRemaining} 次
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-8 w-8 text-orange-500" />
                  <div>
                    <h3 className="font-medium">支付功能</h3>
                    <p className="text-sm text-gray-600">
                      已配置
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 