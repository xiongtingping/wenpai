/**
 * 架构测试页面
 * 验证Authing身份认证和自建后端业务逻辑的分离
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import unifiedAuthService from '@/services/unifiedAuthService';
import { securityUtils } from '@/lib/security';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

export default function ArchitectureTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCurrentUser();
  }, []);

  /**
   * 加载当前用户信息
   */
  const loadCurrentUser = async () => {
    try {
      const user = await unifiedAuthService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  };

  /**
   * 添加测试结果
   */
  const addTestResult = (name: string, status: 'pending' | 'success' | 'error', message: string, data?: any) => {
    setTestResults(prev => [...prev, { name, status, message, data }]);
  };

  /**
   * 更新测试结果
   */
  const updateTestResult = (name: string, status: 'success' | 'error', message: string, data?: any) => {
    setTestResults(prev => 
      prev.map(result => 
        result.name === name ? { ...result, status, message, data } : result
      )
    );
  };

  /**
   * 测试Authing身份认证功能
   */
  const testAuthingFeatures = async () => {
    addTestResult('Authing身份认证', 'pending', '正在测试Authing身份认证功能...');

    try {
      // 测试获取当前用户
      const user = await unifiedAuthService.getCurrentUser();
      if (user) {
        updateTestResult('Authing身份认证', 'success', '用户身份认证成功', user);
      } else {
        updateTestResult('Authing身份认证', 'error', '用户未登录，请先登录');
      }
    } catch (error) {
      updateTestResult('Authing身份认证', 'error', `身份认证失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  /**
   * 测试后端业务逻辑功能
   */
  const testBackendFeatures = async () => {
    if (!currentUser) {
      addTestResult('后端业务逻辑', 'error', '请先登录后再测试后端功能');
      return;
    }

    addTestResult('后端业务逻辑', 'pending', '正在测试后端业务逻辑功能...');

    try {
      // 测试获取用户业务资料
      const profile = await unifiedAuthService.getUserProfile(currentUser.id);
      updateTestResult('后端业务逻辑', 'success', '后端业务逻辑测试成功', profile);
    } catch (error) {
      updateTestResult('后端业务逻辑', 'error', `后端业务逻辑测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  /**
   * 测试邀请系统
   */
  const testInviteSystem = async () => {
    if (!currentUser) {
      addTestResult('邀请系统', 'error', '请先登录后再测试邀请功能');
      return;
    }

    addTestResult('邀请系统', 'pending', '正在测试邀请系统功能...');

    try {
      // 测试生成邀请链接
      const inviteLink = await unifiedAuthService.generateInviteLink(currentUser.id);
      updateTestResult('邀请系统', 'success', '邀请系统测试成功', { inviteLink });
    } catch (error) {
      updateTestResult('邀请系统', 'error', `邀请系统测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  /**
   * 测试使用次数管理
   */
  const testUsageManagement = async () => {
    if (!currentUser) {
      addTestResult('使用次数管理', 'error', '请先登录后再测试使用次数功能');
      return;
    }

    addTestResult('使用次数管理', 'pending', '正在测试使用次数管理功能...');

    try {
      // 测试获取用户使用情况
      const usage = await unifiedAuthService.getUserUsage(currentUser.id);
      updateTestResult('使用次数管理', 'success', '使用次数管理测试成功', usage);
    } catch (error) {
      updateTestResult('使用次数管理', 'error', `使用次数管理测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  /**
   * 测试余额管理
   */
  const testBalanceManagement = async () => {
    if (!currentUser) {
      addTestResult('余额管理', 'error', '请先登录后再测试余额功能');
      return;
    }

    addTestResult('余额管理', 'pending', '正在测试余额管理功能...');

    try {
      // 测试获取用户余额
      const balance = await unifiedAuthService.getUserBalance(currentUser.id);
      updateTestResult('余额管理', 'success', '余额管理测试成功', balance);
    } catch (error) {
      updateTestResult('余额管理', 'error', `余额管理测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  /**
   * 测试用户行为记录
   */
  const testActionRecording = async () => {
    if (!currentUser) {
      addTestResult('用户行为记录', 'error', '请先登录后再测试行为记录功能');
      return;
    }

    addTestResult('用户行为记录', 'pending', '正在测试用户行为记录功能...');

    try {
      // 测试记录用户行为
      await unifiedAuthService.recordUserAction(currentUser.id, 'test_action', {
        page: 'ArchitectureTestPage',
        action: 'test',
        timestamp: new Date().toISOString(),
      });
      updateTestResult('用户行为记录', 'success', '用户行为记录测试成功');
    } catch (error) {
      updateTestResult('用户行为记录', 'error', `用户行为记录测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  /**
   * 运行所有测试
   */
  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // 记录测试开始
    securityUtils.secureLog('开始架构测试', { timestamp: new Date().toISOString() });

    // 依次运行测试
    await testAuthingFeatures();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testBackendFeatures();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testInviteSystem();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testUsageManagement();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testBalanceManagement();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testActionRecording();

    // 记录测试完成
    securityUtils.secureLog('架构测试完成', { 
      timestamp: new Date().toISOString(),
      results: testResults 
    });

    setIsRunning(false);

    // 显示测试结果
    const successCount = testResults.filter(r => r.status === 'success').length;
    const totalCount = testResults.length;
    
    toast({
      title: '测试完成',
      description: `成功: ${successCount}/${totalCount}`,
    });
  };

  /**
   * 清除测试结果
   */
  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            架构分离测试页面
          </h1>
          <p className="text-lg text-gray-600">
            验证Authing身份认证和自建后端业务逻辑的分离架构
          </p>
        </div>

        {/* 当前用户信息 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant={currentUser ? 'default' : 'secondary'}>
                {currentUser ? '已登录' : '未登录'}
              </Badge>
              当前用户状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentUser ? (
              <div className="space-y-2">
                <p><strong>用户ID:</strong> {currentUser.id}</p>
                <p><strong>用户名:</strong> {currentUser.username}</p>
                <p><strong>邮箱:</strong> {currentUser.email}</p>
                <p><strong>手机号:</strong> {currentUser.phone}</p>
              </div>
            ) : (
              <p className="text-gray-500">请先登录以测试完整功能</p>
            )}
          </CardContent>
        </Card>

        {/* 测试控制 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>测试控制</CardTitle>
            <CardDescription>
              运行各种测试来验证架构分离的正确性
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isRunning ? '测试中...' : '运行所有测试'}
              </Button>
              
              <Button 
                onClick={testAuthingFeatures} 
                disabled={isRunning}
                variant="outline"
              >
                测试Authing功能
              </Button>
              
              <Button 
                onClick={testBackendFeatures} 
                disabled={isRunning}
                variant="outline"
              >
                测试后端功能
              </Button>
              
              <Button 
                onClick={clearResults} 
                disabled={isRunning}
                variant="outline"
              >
                清除结果
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 测试结果 */}
        <Card>
          <CardHeader>
            <CardTitle>测试结果</CardTitle>
            <CardDescription>
              显示各项功能的测试结果和详细信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                暂无测试结果，请运行测试
              </p>
            ) : (
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{result.name}</h3>
                      <Badge 
                        variant={
                          result.status === 'success' ? 'default' : 
                          result.status === 'error' ? 'destructive' : 'secondary'
                        }
                      >
                        {result.status === 'success' ? '成功' : 
                         result.status === 'error' ? '失败' : '进行中'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                    {result.data && (
                      <div className="mt-2">
                        <Separator className="my-2" />
                        <details className="text-sm">
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                            查看详细数据
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 架构说明 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>架构说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-blue-600">Authing处理的功能</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                  <li>用户身份认证（登录/注册）</li>
                  <li>用户基本信息管理</li>
                  <li>Token生成和验证</li>
                  <li>会话管理</li>
                  <li>基础角色管理</li>
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold text-green-600">自建后端处理的功能</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                  <li>用户业务数据管理</li>
                  <li>邀请系统（链接生成、关系绑定、奖励发放）</li>
                  <li>使用次数管理（发放、消费、查询）</li>
                  <li>余额/积分管理</li>
                  <li>订阅/套餐管理</li>
                  <li>支付处理</li>
                  <li>用户行为记录</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 