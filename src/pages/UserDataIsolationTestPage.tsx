/**
 * ✅ 用户数据隔离测试页面
 * 🎯 用途：测试和验证用户数据隔离功能的完整性
 * 📌 功能：
 * 1. 显示当前用户的数据统计
 * 2. 测试不同模块的数据隔离
 * 3. 验证数据持久化
 * 4. 提供数据清理工具
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserDataIsolationInit, userDataIsolationUtils } from '@/hooks/useUserDataIsolationInit';
import { useUserDataIsolation } from '@/utils/userDataIsolation';
import { paymentStatusService } from '@/services/paymentStatusService';
import { hashtagGenerator } from '@/utils/hashtagGenerator';
import PageNavigation from '@/components/layout/PageNavigation';

interface DataStats {
  totalKeys: number;
  userKeys: Record<string, number>;
  moduleStats: Record<string, number>;
}

export default function UserDataIsolationTestPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentUserId, isLoggedIn, isGuest, cleanupUserData, getUserDataStats } = useUserDataIsolationInit();
  
  const [dataStats, setDataStats] = useState<DataStats>({
    totalKeys: 0,
    userKeys: {},
    moduleStats: {}
  });
  
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  // 测试用的数据管理器
  const testLibraryManager = useUserDataIsolation({
    modulePrefix: 'test_library',
    fallbackToGuest: true,
    enableLogging: true
  });

  const testChatManager = useUserDataIsolation({
    modulePrefix: 'test_chat',
    fallbackToGuest: true,
    enableLogging: true
  });

  // 刷新数据统计
  const refreshStats = () => {
    try {
      const keys = Object.keys(localStorage);
      const userDataKeys = keys.filter(key => 
        key.includes('_') && 
        (key.startsWith('wenpai_') || 
         key.startsWith('library_') || 
         key.startsWith('adapt_') ||
         key.startsWith('share_') ||
         key.startsWith('user_tag_') ||
         key.startsWith('test_'))
      );

      const userKeys: Record<string, number> = {};
      const moduleStats: Record<string, number> = {};

      userDataKeys.forEach(key => {
        const parts = key.split('_');
        if (parts.length >= 2) {
          const userId = parts[parts.length - 1];
          const module = parts.slice(0, -1).join('_');
          
          userKeys[userId] = (userKeys[userId] || 0) + 1;
          moduleStats[module] = (moduleStats[module] || 0) + 1;
        }
      });

      setDataStats({
        totalKeys: userDataKeys.length,
        userKeys,
        moduleStats
      });
    } catch (error) {
      console.error('刷新数据统计失败:', error);
    }
  };

  // 组件挂载时刷新统计
  useEffect(() => {
    refreshStats();
  }, []);

  // 测试数据隔离功能
  const runIsolationTests = async () => {
    const results: Record<string, boolean> = {};

    try {
      // 测试1: 基本数据保存和加载
      const testData1 = { message: 'Hello from test 1', timestamp: Date.now() };
      const saveResult1 = testLibraryManager.saveData(testData1);
      const loadResult1 = testLibraryManager.loadData();
      results.basicSaveLoad = saveResult1.success && loadResult1.success && 
                              JSON.stringify(loadResult1.data) === JSON.stringify(testData1);

      // 测试2: 不同模块数据隔离
      const testData2 = { message: 'Hello from test 2', timestamp: Date.now() };
      const saveResult2 = testChatManager.saveData(testData2);
      const loadResult2 = testChatManager.loadData();
      results.moduleIsolation = saveResult2.success && loadResult2.success &&
                                JSON.stringify(loadResult2.data) === JSON.stringify(testData2) &&
                                JSON.stringify(loadResult1.data) !== JSON.stringify(loadResult2.data);

      // 测试3: 存储键格式验证
      const expectedKey1 = `test_library_${currentUserId || 'guest'}`;
      const expectedKey2 = `test_chat_${currentUserId || 'guest'}`;
      results.keyFormat = testLibraryManager.getStorageKey() === expectedKey1 &&
                          testChatManager.getStorageKey() === expectedKey2;

      // 测试4: 数据大小检查
      results.dataSize = testLibraryManager.getDataSize() > 0 && testChatManager.getDataSize() > 0;

      // 测试5: 数据存在性检查
      results.dataExists = testLibraryManager.hasData() && testChatManager.hasData();

      setTestResults(results);

      const passedTests = Object.values(results).filter(Boolean).length;
      const totalTests = Object.keys(results).length;

      toast({
        title: "数据隔离测试完成",
        description: `通过 ${passedTests}/${totalTests} 项测试`,
        variant: passedTests === totalTests ? "default" : "destructive"
      });

    } catch (error) {
      console.error('测试执行失败:', error);
      toast({
        title: "测试执行失败",
        description: String(error),
        variant: "destructive"
      });
    }

    refreshStats();
  };

  // 清理测试数据
  const cleanupTestData = () => {
    try {
      testLibraryManager.removeData();
      testChatManager.removeData();
      
      toast({
        title: "测试数据已清理",
        description: "所有测试数据已从localStorage中移除"
      });

      refreshStats();
    } catch (error) {
      console.error('清理测试数据失败:', error);
      toast({
        title: "清理失败",
        description: String(error),
        variant: "destructive"
      });
    }
  };

  // 验证数据隔离完整性
  const validateDataIsolation = () => {
    const isValid = userDataIsolationUtils.validateDataIsolation();
    const orphanKeys = userDataIsolationUtils.checkOrphanData();

    toast({
      title: isValid ? "验证通过" : "验证失败",
      description: isValid 
        ? "用户数据隔离完整性验证通过" 
        : `发现 ${orphanKeys.length} 个问题`,
      variant: isValid ? "default" : "destructive"
    });
  };

  // 清理孤儿数据
  const cleanupOrphanData = () => {
    const cleanedCount = userDataIsolationUtils.cleanupOrphanData();
    
    toast({
      title: "孤儿数据清理完成",
      description: `清理了 ${cleanedCount} 个孤儿数据项`
    });

    refreshStats();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageNavigation />
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">用户数据隔离测试</h1>
        <p className="text-muted-foreground">
          测试和验证用户数据隔离功能的完整性
        </p>
      </div>

      {/* 当前用户信息 */}
      <Card>
        <CardHeader>
          <CardTitle>当前用户信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">用户状态</p>
              <Badge variant={isLoggedIn ? "default" : "secondary"}>
                {isLoggedIn ? "已登录" : "访客模式"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">用户ID</p>
              <p className="font-mono">{currentUserId || 'guest'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 数据统计 */}
      <Card>
        <CardHeader>
          <CardTitle>数据统计</CardTitle>
          <CardDescription>
            当前localStorage中的用户数据分布
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">总数据项</p>
              <p className="text-2xl font-bold">{dataStats.totalKeys}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">用户数量</p>
              <p className="text-2xl font-bold">{Object.keys(dataStats.userKeys).length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">模块数量</p>
              <p className="text-2xl font-bold">{Object.keys(dataStats.moduleStats).length}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-semibold">按用户分布</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(dataStats.userKeys).map(([userId, count]) => (
                <Badge key={userId} variant="outline">
                  {userId}: {count}项
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">按模块分布</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(dataStats.moduleStats).map(([module, count]) => (
                <Badge key={module} variant="outline">
                  {module}: {count}项
                </Badge>
              ))}
            </div>
          </div>

          <Button onClick={refreshStats} variant="outline" size="sm">
            刷新统计
          </Button>
        </CardContent>
      </Card>

      {/* 测试功能 */}
      <Card>
        <CardHeader>
          <CardTitle>数据隔离测试</CardTitle>
          <CardDescription>
            运行自动化测试验证数据隔离功能
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runIsolationTests}>
              运行测试
            </Button>
            <Button onClick={cleanupTestData} variant="outline">
              清理测试数据
            </Button>
          </div>

          {Object.keys(testResults).length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">测试结果</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(testResults).map(([test, passed]) => (
                  <div key={test} className="flex items-center gap-2">
                    <Badge variant={passed ? "default" : "destructive"}>
                      {passed ? "✓" : "✗"}
                    </Badge>
                    <span className="text-sm">{test}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 维护工具 */}
      <Card>
        <CardHeader>
          <CardTitle>维护工具</CardTitle>
          <CardDescription>
            数据验证和清理工具
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={validateDataIsolation} variant="outline">
              验证数据隔离
            </Button>
            <Button onClick={cleanupOrphanData} variant="outline">
              清理孤儿数据
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
