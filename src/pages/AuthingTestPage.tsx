/**
 * Authing 测试页面
 * 用于测试 Authing 认证功能
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Authing 测试页面组件
 * @returns React 组件
 */
const AuthingTestPage: React.FC = () => {
  const { user, isAuthenticated, login, logout, checkAuth } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);

  /**
   * 添加测试结果
   */
  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  /**
   * 测试登录功能
   */
  const testLogin = async () => {
    try {
      addTestResult('开始测试登录功能...');
      await login();
      addTestResult('登录弹窗已打开');
    } catch (error) {
      addTestResult(`登录测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  /**
   * 测试登出功能
   */
  const testLogout = async () => {
    try {
      addTestResult('开始测试登出功能...');
      await logout();
      addTestResult('登出成功');
    } catch (error) {
      addTestResult(`登出测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  /**
   * 测试认证状态检查
   */
  const testCheckAuth = async () => {
    try {
      addTestResult('开始测试认证状态检查...');
      await checkAuth();
      addTestResult('认证状态检查完成');
    } catch (error) {
      addTestResult(`认证状态检查失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  /**
   * 清空测试结果
   */
  const clearTestResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Authing 功能测试</h1>
          <p className="text-gray-600">测试 Authing 认证相关的各项功能</p>
        </div>

        {/* 当前状态 */}
        <Card>
          <CardHeader>
            <CardTitle>当前认证状态</CardTitle>
            <CardDescription>显示当前的用户认证状态</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">认证状态:</span>
              {isAuthenticated ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  已认证
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  未认证
                </Badge>
              )}
            </div>
            
            {user && (
              <div className="space-y-2">
                <div className="font-medium">用户信息:</div>
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 功能测试 */}
        <Card>
          <CardHeader>
            <CardTitle>功能测试</CardTitle>
            <CardDescription>测试各项认证功能</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={testLogin} variant="outline">
                测试登录
              </Button>
              <Button onClick={testLogout} variant="outline">
                测试登出
              </Button>
              <Button onClick={testCheckAuth} variant="outline">
                测试状态检查
              </Button>
              <Button onClick={clearTestResults} variant="outline">
                清空结果
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 测试结果 */}
        <Card>
          <CardHeader>
            <CardTitle>测试结果</CardTitle>
            <CardDescription>显示测试执行的结果</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500 text-center">暂无测试结果</p>
              ) : (
                <div className="space-y-1">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm text-gray-700">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthingTestPage; 