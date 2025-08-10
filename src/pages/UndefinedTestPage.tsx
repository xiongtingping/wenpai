/**
 * 🧪 undefined拼接问题测试页面
 * 专门用于重现和测试"undefinedundefined"问题
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { getUserDisplayName, getUserAvatar, getUserAvatarFallback } from '@/utils/userDisplayUtils';

interface TestUser {
  id?: string;
  username?: string;
  nickname?: string;
  email?: string;
  avatar?: string;
}

const UndefinedTestPage: React.FC = () => {
  const { user, isAuthenticated } = useUnifiedAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [detectedIssues, setDetectedIssues] = useState<string[]>([]);

  // 测试用户数据
  const testUsers: TestUser[] = [
    { id: 'user1', username: 'testuser', nickname: 'Test User', email: 'test@example.com' },
    { id: 'user2', username: undefined, nickname: undefined, email: 'test2@example.com' },
    { id: 'user3', username: undefined, nickname: undefined, email: undefined },
    { id: 'user4', username: '', nickname: '', email: '' },
    { id: 'user5' }, // 只有ID
  ];

  useEffect(() => {
    // 监听全局的undefined检测器
    const checkForUndefined = () => {
      if ((window as any).__runtimeUndefinedDetector) {
        const count = (window as any).__runtimeUndefinedDetector.getCount();
        if (count > 0) {
          setDetectedIssues(prev => [...prev, `检测到 ${count} 个undefined拼接问题`]);
        }
      }
    };

    const interval = setInterval(checkForUndefined, 1000);
    return () => clearInterval(interval);
  }, []);

  const runDangerousTests = () => {
    const results: string[] = [];
    const issues: string[] = [];

    console.log('🧪 开始危险的undefined拼接测试...');

    testUsers.forEach((testUser, index) => {
      console.log(`测试用户 ${index + 1}:`, testUser);

      // 测试1：直接逻辑或拼接（危险）
      try {
        const dangerousResult = testUser.nickname || testUser.username;
        results.push(`用户${index + 1} 逻辑或结果: "${dangerousResult}"`);
        if (dangerousResult === undefined) {
          issues.push(`用户${index + 1}: 逻辑或返回undefined`);
        }
      } catch (error) {
        results.push(`用户${index + 1} 逻辑或测试失败: ${error}`);
      }

      // 测试2：字符串化拼接（极度危险）
      try {
        const stringConcat = String(testUser.nickname) + String(testUser.username);
        results.push(`用户${index + 1} 字符串拼接: "${stringConcat}"`);
        if (stringConcat.includes('undefined')) {
          issues.push(`用户${index + 1}: 字符串拼接包含undefined - "${stringConcat}"`);
        }
      } catch (error) {
        results.push(`用户${index + 1} 字符串拼接测试失败: ${error}`);
      }

      // 测试3：模板字符串（极度危险）
      try {
        const templateResult = `${testUser.nickname}${testUser.username}`;
        results.push(`用户${index + 1} 模板字符串: "${templateResult}"`);
        if (templateResult.includes('undefined')) {
          issues.push(`用户${index + 1}: 模板字符串包含undefined - "${templateResult}"`);
        }
      } catch (error) {
        results.push(`用户${index + 1} 模板字符串测试失败: ${error}`);
      }

      // 测试4：安全函数对比
      try {
        const safeResult = getUserDisplayName(testUser, '访客');
        results.push(`用户${index + 1} 安全函数: "${safeResult}"`);
      } catch (error) {
        results.push(`用户${index + 1} 安全函数测试失败: ${error}`);
      }
    });

    setTestResults(results);
    setDetectedIssues(prev => [...prev, ...issues]);
  };

  const runRealUserTest = () => {
    if (!user) {
      setTestResults(prev => [...prev, '❌ 没有真实用户数据进行测试']);
      return;
    }

    const results: string[] = [];
    const issues: string[] = [];

    console.log('🧪 使用真实用户数据进行测试...', user);

    // 测试真实用户数据
    try {
      const dangerousResult = getUserDisplayName(user, '访客');
      results.push(`真实用户逻辑或结果: "${dangerousResult}"`);
      if (dangerousResult === undefined) {
        issues.push('真实用户: 逻辑或返回undefined');
      }
    } catch (error) {
      results.push(`真实用户逻辑或测试失败: ${error}`);
    }

    try {
      const stringConcat = getUserDisplayName(user, '访客') + getUserDisplayName(user, '用户');
      results.push(`真实用户字符串拼接: "${stringConcat}"`);
      if (stringConcat.includes('undefined')) {
        issues.push(`真实用户: 字符串拼接包含undefined - "${stringConcat}"`);
      }
    } catch (error) {
      results.push(`真实用户字符串拼接测试失败: ${error}`);
    }

    try {
      const templateResult = `${getUserDisplayName(user, '访客')}${getUserDisplayName(user, '用户')}`;
      results.push(`真实用户模板字符串: "${templateResult}"`);
      if (templateResult.includes('undefined')) {
        issues.push(`真实用户: 模板字符串包含undefined - "${templateResult}"`);
      }
    } catch (error) {
      results.push(`真实用户模板字符串测试失败: ${error}`);
    }

    try {
      const safeResult = getUserDisplayName(user, '访客');
      results.push(`真实用户安全函数: "${safeResult}"`);
    } catch (error) {
      results.push(`真实用户安全函数测试失败: ${error}`);
    }

    setTestResults(prev => [...prev, ...results]);
    setDetectedIssues(prev => [...prev, ...issues]);
  };

  const clearResults = () => {
    setTestResults([]);
    setDetectedIssues([]);
    if ((window as any).__runtimeUndefinedDetector) {
      (window as any).__runtimeUndefinedDetector.reset();
    }
  };

  const forceCheck = () => {
    if ((window as any).__runtimeUndefinedDetector) {
      const count = (window as any).__runtimeUndefinedDetector.forceCheck();
      setDetectedIssues(prev => [...prev, `强制检查发现 ${count} 个问题`]);
    } else {
      setDetectedIssues(prev => [...prev, '运行时检测器未加载']);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🧪 undefined拼接问题测试</h1>
        <p className="text-muted-foreground">专门用于重现和测试"undefinedundefined"问题</p>
      </div>

      {/* 当前用户状态 */}
      <Card>
        <CardHeader>
          <CardTitle>当前用户状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>认证状态: <Badge variant={isAuthenticated ? "default" : "secondary"}>{isAuthenticated ? "已登录" : "未登录"}</Badge></p>
            {user && (
              <div className="space-y-1 text-sm">
                <p>ID: {user.id || '未设置'}</p>
                <p>用户名: {user.username || '未设置'}</p>
                <p>昵称: {user.nickname || '未设置'}</p>
                <p>邮箱: {user.email || '未设置'}</p>
                <p>安全显示名: {getUserDisplayName(user, '访客')}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 测试控制 */}
      <Card>
        <CardHeader>
          <CardTitle>测试控制</CardTitle>
          <CardDescription>运行各种undefined拼接测试</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={runDangerousTests} variant="destructive">
              🚨 运行危险测试
            </Button>
            <Button onClick={runRealUserTest} disabled={!user}>
              👤 测试真实用户
            </Button>
            <Button onClick={forceCheck} variant="outline">
              🔍 强制检查
            </Button>
            <Button onClick={clearResults} variant="outline">
              🧹 清除结果
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 检测到的问题 */}
      {detectedIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">🚨 检测到的问题</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {detectedIssues.map((issue, index) => (
                <div key={index} className="text-sm text-destructive bg-accent p-2 rounded">
                  {issue}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 测试结果 */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>测试结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono bg-accent p-2 rounded">
                  {result}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 调试信息 */}
      <Card>
        <CardHeader>
          <CardTitle>调试信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-1">
            <p>运行时检测器: {typeof window !== 'undefined' && (window as any).__runtimeUndefinedDetector ? '✅ 已加载' : '❌ 未加载'}</p>
            <p>简化检测器: {typeof window !== 'undefined' && (window as any).__simpleUndefinedDetector ? '✅ 已加载' : '❌ 未加载'}</p>
            <p>页面URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
            <p>时间戳: {new Date().toISOString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UndefinedTestPage;
