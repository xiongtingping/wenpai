import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';

/**
 * 升级按钮显示逻辑测试页面
 * 用于验证不同用户版本下"立即解锁高级功能"按钮的显示/隐藏逻辑
 */
export default function UpgradeButtonTestPage() {
  const { user, setUser } = useUnifiedAuth();
  const [testResults, setTestResults] = useState<string[]>([]);

  // 模拟不同版本的用户数据
  const testUsers = [
    {
      name: '未登录用户',
      userData: null,
      expectedShow: true,
      description: '未登录用户应该显示升级按钮'
    },
    {
      name: '体验版用户',
      userData: {
        id: 'test-trial-user',
        username: 'trial-user',
        email: 'trial@example.com',
        nickname: '体验版用户',
        plan: 'trial',
        tier: 'trial'
      },
      expectedShow: true,
      description: '体验版用户应该显示升级按钮'
    },
    {
      name: '专业版用户',
      userData: {
        id: 'test-pro-user',
        username: 'pro-user',
        email: 'pro@example.com',
        nickname: '专业版用户',
        plan: 'pro',
        tier: 'pro',
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      expectedShow: true,
      description: '专业版用户应该显示升级按钮（可升级到高级版）'
    },
    {
      name: '高级版用户（有效期内）',
      userData: {
        id: 'test-premium-user',
        username: 'premium-user',
        email: 'premium@example.com',
        nickname: '高级版用户',
        plan: 'premium',
        tier: 'premium',
        subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      },
      expectedShow: false,
      description: '高级版用户（有效期内）不应该显示升级按钮'
    },
    {
      name: '高级版用户（已过期）',
      userData: {
        id: 'test-expired-premium-user',
        username: 'expired-premium-user',
        email: 'expired@example.com',
        nickname: '过期高级版用户',
        plan: 'premium',
        tier: 'premium',
        subscriptionEndDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      expectedShow: true,
      description: '高级版用户（已过期）应该显示升级按钮'
    }
  ];

  /**
   * 升级按钮显示逻辑（复制自Header组件）
   */
  const shouldShowUpgradeButton = (testUser: any) => {
    // 未登录用户显示
    if (!testUser || typeof testUser !== 'object') return true;

    const userObj = testUser as Record<string, unknown>;

    // 检查是否是高级版用户
    const isPremiumUser = userObj.tier === 'premium' ||
                         userObj.plan === 'premium' ||
                         userObj.subscriptionTier === 'premium' ||
                         userObj.userPlan === 'premium';

    // 如果是高级版用户，检查是否在有效期内
    if (isPremiumUser) {
      const subscriptionEndDate = userObj.subscriptionEndDate || userObj.endDate || userObj.expireDate;
      
      if (subscriptionEndDate && typeof subscriptionEndDate === 'string') {
        const endDate = new Date(subscriptionEndDate);
        const now = new Date();
        
        // 如果订阅还在有效期内，不显示升级按钮
        if (endDate > now) {
          return false;
        }
      }
    }

    // 其他情况都显示升级按钮
    return true;
  };

  const runTest = (testUser: any, expectedShow: boolean, description: string) => {
    const actualShow = shouldShowUpgradeButton(testUser.userData);
    const result = actualShow === expectedShow ? '✅ 通过' : '❌ 失败';
    const message = `${result} - ${testUser.name}: ${description} (期望: ${expectedShow ? '显示' : '隐藏'}, 实际: ${actualShow ? '显示' : '隐藏'})`;
    
    setTestResults(prev => [...prev, message]);
    return actualShow === expectedShow;
  };

  const runAllTests = () => {
    setTestResults([]);
    let passedTests = 0;
    
    testUsers.forEach(testUser => {
      if (runTest(testUser, testUser.expectedShow, testUser.description)) {
        passedTests++;
      }
    });

    const summary = `\n📊 测试总结: ${passedTests}/${testUsers.length} 个测试通过`;
    setTestResults(prev => [...prev, summary]);
  };

  const switchToUser = (userData: any, userName: string) => {
    if (userData) {
      setUser({
        ...userData,
        loginTime: new Date().toISOString(),
        roles: ['user'],
        permissions: ['auth:required'],
        isVip: userData.plan !== 'trial'
      });
    } else {
      setUser(null);
    }
    setTestResults([`已切换到: ${userName}`]);
  };

  return (
    <div className="min-h-screen bg-accent p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>升级按钮显示逻辑测试</CardTitle>
            <CardDescription>
              测试"立即解锁高级功能"按钮在不同用户版本下的显示/隐藏逻辑
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {testUsers.map((testUser, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => switchToUser(testUser.userData, testUser.name)}
                    className="text-sm"
                  >
                    切换到{testUser.name}
                  </Button>
                ))}
              </div>
              
              <Button onClick={runAllTests} className="w-full">
                运行所有测试
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>当前用户状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-accent p-4 rounded-lg">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
            <div className="mt-4 p-4 border rounded-lg">
              <p className="font-medium">升级按钮显示状态:</p>
              <p className={`text-lg font-bold ${shouldShowUpgradeButton(user) ? 'text-foreground' : 'text-destructive'}`}>
                {shouldShowUpgradeButton(user) ? '🟢 显示' : '🔴 隐藏'}
              </p>
            </div>
          </CardContent>
        </Card>

        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>测试结果</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-accent p-4 rounded-lg">
                {testResults.map((result, index) => (
                  <div key={index} className="font-mono text-sm mb-1">
                    {result}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
